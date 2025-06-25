export function registrarUsuario(name, mail, password) {
  fetch('https://685abb749f6ef9611157981f.mockapi.io/registroMovie', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, mail, password })
  })
    .then(res => res.json())
    .then(user => {
      document.getElementById('signupMsg').innerHTML = `
        <div class="alert alert-success" role="alert">
          ¡Registro exitoso! Redirigiendo al <a href="login.html" class="alert-link">login</a>...
        </div>
      `;
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 1000); // 1 segundo de espera
    })
    .catch(() => {
      document.getElementById('signupMsg').innerHTML = `
        <div class="alert alert-danger" role="alert">
          Error al registrar usuario. Intenta nuevamente.
        </div>
      `;
    });
}