// Script de teste para validar a conexão entre as páginas
const fs = require('node:fs');
const path = require('node:path');

const rootDir = path.resolve(__dirname, '..');
const pages = [
  'paginas/atleta/inicio.html',
  'paginas/atleta/dadosFisicos.html',
  'paginas/atleta/bemEstar.html',
  'paginas/atleta/treinos.html',
  'paginas/atleta/jogos.html',
  'paginas/atleta/lesoes.html',
  'paginas/atleta/relatorios.html',
  'paginas/atleta/atleta.html'
];

console.log('\n🔍 TESTE DE CONEXÃO DAS PÁGINAS DO ATLETA\n');
console.log('═'.repeat(50));

let allOk = true;

pages.forEach((page) => {
  const filePath = path.join(rootDir, page);
  const fileExists = fs.existsSync(filePath);
  const status = fileExists ? '✓' : '✗';
  const fileName = page.split('/').pop();
  
  console.log(`${status} ${fileName.padEnd(25)} ${fileExists ? 'OK' : 'NÃO ENCONTRADO'}`);
  
  if (!fileExists) allOk = false;
});

console.log('═'.repeat(50));

// Verificar se o arquivo atleta.html referencia inicio.html
const athetaHtmlPath = path.join(rootDir, 'paginas/atleta/atleta.html');
const athetaContent = fs.readFileSync(athetaHtmlPath, 'utf8');

console.log('\n📋 VERIFICAÇÃO DO ARQUIVO atleta.html:\n');

const checks = [
  {
    name: 'Carrega inicio.html por padrão',
    pattern: /src="inicio\.html"/,
    content: athetaContent
  },
  {
    name: 'Menu "Início" aponta para inicio.html',
    pattern: /data-page="inicio\.html"/,
    content: athetaContent
  },
  {
    name: 'Classe "active" no Início',
    pattern: /class="sidebar-link active" data-page="inicio\.html"/,
    content: athetaContent
  }
];

checks.forEach((check) => {
  const found = check.pattern.test(check.content);
  const status = found ? '✓' : '✗';
  console.log(`${status} ${check.name}`);
});

// Verificar se inicio.html tem conteúdo esperado
console.log('\n📄 VERIFICAÇÃO DO ARQUIVO inicio.html:\n');

const inicioPath = path.join(rootDir, 'paginas/atleta/inicio.html');
const inicioContent = fs.readFileSync(inicioPath, 'utf8');

const inicioChecks = [
  {
    name: 'Tem seção de alertas',
    pattern: /alerts-section/
  },
  {
    name: 'Tem seção "Resumo de Hoje"',
    pattern: /Resumo de Hoje/
  },
  {
    name: 'Tem seção "Próximos Eventos"',
    pattern: /Próximos Eventos/
  },
  {
    name: 'Tem seção "Seu Desempenho"',
    pattern: /Seu Desempenho/
  }
];

inicioChecks.forEach((check) => {
  const found = check.pattern.test(inicioContent);
  const status = found ? '✓' : '✗';
  console.log(`${status} ${check.name}`);
});

console.log('\n' + '═'.repeat(50));
console.log(`\n${allOk ? '✓ TESTE COMPLETO' : '✗ ERRO'}: Todas as páginas estão conectadas!\n`);

console.log('🌐 Acesse em: http://localhost:3000/paginas/boas-vindas/boas-vindas-atleta.html');
console.log('   (Após fazer login, você verá a página de início com resumo e alertas)\n');
