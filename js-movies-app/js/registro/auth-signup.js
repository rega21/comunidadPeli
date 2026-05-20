import { supabase } from '../supabase-client.js';

export async function registrarUsuario(name, mail, password) {
  const msgDiv = document.getElementById('signupMsg');

  const { error } = await supabase.auth.signUp({
    email: mail,
    password,
    options: { data: { full_name: name } }
  });

  if (error) {
    msgDiv.innerHTML = `<div class="alert alert-danger" role="alert">${error.message}</div>`;
    return;
  }

  msgDiv.innerHTML = `
    <div class="alert alert-success" role="alert">
      ¡Registro exitoso! Redirigiendo al <a href="login.html" class="alert-link">login</a>...
    </div>
  `;
  setTimeout(() => { window.location.href = 'login.html'; }, 1000);
}
