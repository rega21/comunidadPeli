import { supabase } from '../supabase-client.js';

export async function loginUsuario(mail, password) {
  const msgDiv = document.getElementById('loginMsg');

  const { data, error } = await supabase.auth.signInWithPassword({ email: mail, password });

  if (error) {
    msgDiv.innerHTML = `<div class="alert alert-danger text-center" role="alert">Usuario o contraseña incorrectos.</div>`;
    return;
  }

  const user = data.user;
  const userData = {
    name: user.user_metadata?.full_name || user.email,
    mail: user.email,
    id: user.id
  };
  localStorage.setItem('usuario', JSON.stringify(userData));

  msgDiv.innerHTML = `<div class="alert alert-success text-center" role="alert">¡Login exitoso! Bienvenido, ${userData.name}.</div>`;
  setTimeout(() => { window.location.href = '../../index.html'; }, 1500);
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  if (!form) return;
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const mail = document.getElementById('loginMail').value.trim();
    const password = document.getElementById('loginPassword').value;
    loginUsuario(mail, password);
  });
});
