const express = require('express');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');

const rootDir = path.resolve(__dirname, '..');
const app = express();
const port = Number(process.env.PORT) || 3000;
const jwtSecret = process.env.JWT_SECRET || 'athlex-dev-secret-change-me';
const dataPath = path.join(rootDir, 'data', 'users.json');

const rolePermissions = {
  atleta: ['perfil:editar', 'bem-estar:responder', 'dados-fisicos:editar', 'treinos:visualizar'],
  tecnico: ['atletas:acompanhar', 'treinos:planejar', 'relatorios:avaliar'],
  gestor: ['organizacao:gerenciar', 'equipes:gerenciar', 'usuarios:gerenciar', 'permissoes:gerenciar']
};

const roleRedirects = {
  atleta: '/paginas/boas-vindas/boas-vindas-atleta.html',
  tecnico: '/paginas/boas-vindas/boas-vindas-treinador.html',
  gestor: '/paginas/boas-vindas/boas-vindas-dirigente.html'
};

app.use(express.json());
app.use(cookieParser());
app.use(express.static(rootDir));

async function readUsers() {
  try {
    return JSON.parse(await fs.readFile(dataPath, 'utf8'));
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    await fs.mkdir(path.dirname(dataPath), { recursive: true });
    await fs.writeFile(dataPath, '[]');
    return [];
  }
}

async function writeUsers(users) {
  await fs.writeFile(dataPath, JSON.stringify(users, null, 2));
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function accessFor(user) {
  return user.roles.map((role) => ({
    role,
    permissions: [...new Set([...(rolePermissions[role] || []), ...(user.permissions || [])])],
    links: user.links.filter((link) => link.role === role || link.role === 'all')
  }));
}

function publicUser(user) {
  return {
    id: user.id,
    nome: user.nome,
    email: user.email,
    roles: user.roles,
    links: user.links,
    permissions: user.permissions || []
  };
}

function createToken(user) {
  return jwt.sign({ sub: user.id }, jwtSecret, { expiresIn: '8h' });
}

async function getCurrentUser(req) {
  try {
    const token = req.cookies?.athlex_token;
    if (!token) return null;
    const payload = jwt.verify(token, jwtSecret);
    const users = await readUsers();
    return users.find((user) => user.id === payload.sub) || null;
  } catch {
    return null;
  }
}

app.post('/api/auth/register', async (req, res) => {
  const { nome, email, senha, role, profile = {}, links = [] } = req.body || {};
  const normalizedEmail = normalizeEmail(email);

  if (!nome || !normalizedEmail || !senha || !role) {
    return res.status(400).json({ message: 'Nome, email, senha e perfil são obrigatórios.' });
  }
  if (!Object.hasOwn(rolePermissions, role)) {
    return res.status(400).json({ message: 'Perfil inválido.' });
  }
  if (String(senha).length < 8) {
    return res.status(400).json({ message: 'A senha deve ter pelo menos 8 caracteres.' });
  }

  const users = await readUsers();
  if (users.some((user) => user.email === normalizedEmail)) {
    return res.status(409).json({ message: 'Já existe uma conta com este email.' });
  }

  const user = {
    id: crypto.randomUUID(),
    nome: String(nome).trim(),
    email: normalizedEmail,
    passwordHash: await bcrypt.hash(String(senha), 12),
    roles: [role],
    profile: profile && typeof profile === 'object' ? profile : {},
    links: Array.isArray(links) ? links : [],
    permissions: []
  };

  users.push(user);
  await writeUsers(users);

  res.status(201).json({ user: publicUser(user), access: accessFor(user) });
});

app.post('/api/auth/login', async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  const senha = String(req.body?.senha || '');
  const users = await readUsers();
  const user = users.find((candidate) => candidate.email === email);

  if (!user || !(await bcrypt.compare(senha, user.passwordHash))) {
    return res.status(401).json({ message: 'Email ou senha inválidos.' });
  }

  res.cookie('athlex_token', createToken(user), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 8 * 60 * 60 * 1000
  });

  res.json({
    user: publicUser(user),
    access: accessFor(user),
    redirect: roleRedirects[user.roles[0]] || '/'
  });
});

app.get('/api/auth/me', async (req, res) => {
  const user = await getCurrentUser(req);

  if (!user) {
    return res.status(401).json({ message: 'Não autenticado.' });
  }

  return res.json({ user: publicUser(user), access: accessFor(user) });
});

function protectRole(role, filePath, roleLabel) {
  return async (req, res) => {
    const user = await getCurrentUser(req);

    if (!user) {
      return res.redirect('/login.html');
    }

    if (!user.roles.includes(role)) {
      return res.status(403).send(`Acesso restrito: apenas ${roleLabel} podem acessar esta página.`);
    }

    return res.sendFile(filePath);
  };
}

app.get('/paginas/boas-vindas/boas-vindas-atleta.html', protectRole('atleta', path.join(rootDir, 'paginas', 'boas-vindas', 'boas-vindas-atleta.html'), 'atletas'));
app.get('/paginas/boas-vindas/boas-vindas-treinador.html', protectRole('tecnico', path.join(rootDir, 'paginas', 'boas-vindas', 'boas-vindas-treinador.html'), 'técnicos'));
app.get('/paginas/boas-vindas/boas-vindas-dirigente.html', protectRole('gestor', path.join(rootDir, 'paginas', 'boas-vindas', 'boas-vindas-dirigente.html'), 'gestores'));

app.get('/paginas/atleta/atleta.html', protectRole('atleta', path.join(rootDir, 'paginas', 'atleta', 'atleta.html'), 'atletas'));
app.get('/paginas/gestor/gestor.html', protectRole('gestor', path.join(rootDir, 'paginas', 'gestor', 'gestor.html'), 'gestores'));
app.get('/paginas/tecnico/tecnico.html', protectRole('tecnico', path.join(rootDir, 'paginas', 'tecnico', 'tecnico.html'), 'técnicos'));

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('athlex_token');
  res.status(204).end();
});

app.listen(port, () => {
  console.log(`Athlex rodando em http://localhost:${port}`);
});
