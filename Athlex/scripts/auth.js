const loginForm = document.querySelector('#login-form');
const feedback = document.querySelector('#login-feedback');

if (loginForm) {
  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    feedback.textContent = 'Entrando...';
    feedback.className = 'login-feedback';

    const formData = new FormData(loginForm);
    const credentials = {
      email: formData.get('email'),
      senha: formData.get('senha')
    };

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(credentials)
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Não foi possível entrar.');
      }

      if (result.access.length > 1) {
        feedback.textContent = `Acesso liberado para: ${result.access.map((item) => item.role).join(', ')}.`;
        feedback.className = 'login-feedback success';
      }

      window.location.href = result.redirect;
    } catch (error) {
      feedback.textContent = error.message;
      feedback.className = 'login-feedback error';
    }
  });
}
