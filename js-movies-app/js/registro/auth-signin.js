export function loginUsuario(mail, password) {
  fetch(`https://685abb749f6ef9611157981f.mockapi.io/registroMovie?mail=${encodeURIComponent(mail)}`)
    .then(res => res.json())
    .then(users => {
      const user = users.find(u => u.password === password);
      const msgDiv = document.getElementById('loginMsg');
      if (user) {
        msgDiv.innerHTML = `
          <div class="alert alert-success text-center" role="alert">
            🎬 ¡Login exitoso! Bienvenido, ${user.name || user.mail}.
          </div>
        `;
        localStorage.setItem('usuario', JSON.stringify(user));
        setTimeout(() => {
          window.location.href = '../../index.html';
        }, 1500);
      } else {
        msgDiv.innerHTML = `
          <div class="alert alert-danger text-center" role="alert">
            Usuario o contraseña incorrectos.
          </div>
        `;
      }
    })
    .catch(() => {
      const msgDiv = document.getElementById('loginMsg');
      msgDiv.innerHTML = `
        <div class="alert alert-danger text-center" role="alert">
          Error al iniciar sesión. Intenta nuevamente.
        </div>
      `;
    });
}

// Inicialización del formulario de login
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    const mail = document.getElementById('loginMail').value.trim();
    const password = document.getElementById('loginPassword').value;
    loginUsuario(mail, password);
  });
});
