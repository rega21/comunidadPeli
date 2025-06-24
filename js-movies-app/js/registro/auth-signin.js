export function loginUsuario(mail, password) {
  fetch(`https://685abb749f6ef9611157981f.mockapi.io/registroMovie?mail=${encodeURIComponent(mail)}`)
    .then(res => res.json())
    .then(users => {
      const user = users.find(u => u.password === password);
      const msgDiv = document.getElementById('loginMsg');
      if (user) {
        msgDiv.innerHTML = `
          <div class="alert alert-success" role="alert">
            ¡Login exitoso! Bienvenido, ${user.name || user.mail}.
          </div>
        `;
        localStorage.setItem('usuario', JSON.stringify(user));
        setTimeout(() => {
          window.location.href = '../../index.html'; // Ajusta la ruta si es necesario
        }, 1500); // Espera 1.5 segundos para que el usuario vea el mensaje
      } else {
        msgDiv.innerHTML = `
          <div class="alert alert-danger" role="alert">
            Usuario o contraseña incorrectos.
          </div>
        `;
      }
    })
    .catch(() => {
      const msgDiv = document.getElementById('loginMsg');
      msgDiv.innerHTML = `
        <div class="alert alert-danger" role="alert">
          Error al iniciar sesión. Intenta nuevamente.
        </div>
      `;
    });
}

