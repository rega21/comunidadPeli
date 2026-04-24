export function setupNavbar(onNavigate, onGenreSelect, API_KEY, BASE_URL) {
  // Navegación principal
  document.querySelectorAll('.navbar-nav .nav-link').forEach(link => {
    link.addEventListener('click', function (e) {
      // Solo previene el default si el enlace es #
      if (this.getAttribute('href') === '#') {
        e.preventDefault();
        document.querySelectorAll('.navbar-nav .nav-link').forEach(l => l.classList.remove('active'));
        this.classList.add('active');
        if (onNavigate) onNavigate(this.textContent.trim());
      }
      // Si el href NO es #, deja que navegue normalmente (por ejemplo, Login)
    });
  });

  // Cargar géneros en el dropdown

  fetch(`${BASE_URL}/genre/movie/list?api_key=${API_KEY}&language=es-ES`)
    .then(response => response.json())
    .then(data => {
      const genreDropdownMenu = document.getElementById('genreDropdownMenu');
      genreDropdownMenu.innerHTML = '';
      data.genres.forEach(genre => {
        const li = document.createElement('li');
        li.innerHTML = `<a class="dropdown-item" href="#" data-genre-id="${genre.id}">${genre.name}</a>`;
        genreDropdownMenu.appendChild(li);
      });
      const divider = document.createElement('li');
      divider.innerHTML = '<hr class="dropdown-divider">';
      genreDropdownMenu.appendChild(divider);
      const tendenciasLi = document.createElement('li');
      tendenciasLi.innerHTML = '<a class="dropdown-item" href="#" data-section="Tendencias">Tendencias</a>';
      genreDropdownMenu.appendChild(tendenciasLi);
      const rankingLi = document.createElement('li');
      rankingLi.innerHTML = '<a class="dropdown-item" href="#" data-section="Ranking">Ranking</a>';
      genreDropdownMenu.appendChild(rankingLi);
    });

  // Manejar clic en género
  document.getElementById('genreDropdownMenu').addEventListener('click', function (e) {
    const item = e.target.closest('.dropdown-item');
    if (item) {
      e.preventDefault();
      document.querySelectorAll('#genreDropdownMenu .dropdown-item').forEach(el => el.classList.remove('active-genre'));
      item.classList.add('active-genre');
      const genreId = item.getAttribute('data-genre-id');
      if (!genreId) return; // data-section items los maneja explorar.js
      if (onGenreSelect) onGenreSelect(genreId);

      // Cerrar offcanvas si está abierto
      const offcanvas = bootstrap.Offcanvas.getInstance(document.getElementById('navbarOffcanvas'));
      if (offcanvas) offcanvas.hide();
    }
  });

  const usuario = JSON.parse(localStorage.getItem('usuario'));
  const loginItems = document.querySelectorAll('#loginMenuItem, #loginMenuItemMobile');
  const estadoUsuario = document.getElementById('estadoUsuario');
  if (usuario) {
    if (estadoUsuario) {
      estadoUsuario.textContent = `Online: ${usuario.name || usuario.mail}`;
      estadoUsuario.classList.remove('d-none');
    }
    loginItems.forEach(item => {
      item.innerHTML = '<i class="bi bi-box-arrow-right"></i> Cerrar sesión';
      item.href = '#';
      item.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('usuario');
        window.location.reload();
      });
    });
  } else {
    if (estadoUsuario) {
      estadoUsuario.textContent = '';
      estadoUsuario.classList.add('d-none');
    }
    loginItems.forEach(item => {
      item.innerHTML = '<i class="bi bi-person-circle"></i> Login';
      item.href = 'js/registro/login.html';
    });
  }

}


