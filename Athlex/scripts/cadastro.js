const cadastroForm = document.querySelector('#cadastro-form');
const feedback = document.querySelector('#cadastro-feedback');

if (cadastroForm) {
  cadastroForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    feedback.textContent = 'Criando conta...';
    feedback.className = 'cadastro-feedback';

    const formData = new FormData(cadastroForm);
    const senha = String(formData.get('senha') || '');
    const confirmacao = String(formData.get('confirmacao') || '');

    if (senha !== confirmacao) {
      feedback.textContent = 'As senhas não coincidem.';
      feedback.className = 'cadastro-feedback error';
      return;
    }

    const profile = Object.fromEntries(
      [...formData.entries()].filter(([key]) => !['nome', 'email', 'senha', 'confirmacao'].includes(key))
    );

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: formData.get('nome'),
          email: formData.get('email'),
          senha,
          role: cadastroForm.dataset.role,
          profile
        })
      });
      const result = await response.json();

      if (!response.ok) throw new Error(result.message || 'Não foi possível criar a conta.');
      window.location.href = '/login.html?cadastro=sucesso';
    } catch (error) {
      feedback.textContent = error.message;
      feedback.className = 'cadastro-feedback error';
    }
  });
}
