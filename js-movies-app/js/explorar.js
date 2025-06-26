// filepath: c:\Users\user\Desktop\Programacion\Js\movies-app\js-movies-app\js\Menu.js
import { API_KEY, BASE_URL } from './config.js';
import { createMovieCard, showMovieModal, createActorCard } from './components.js';
import { renderPaginacion, paginaActual, setSeccionActual, setTotalPaginas } from './pagination.js';

const moviesList = document.getElementById('movies');
const actorSearchForm = document.getElementById('actorSearchForm');
const actorSearchInput = document.getElementById('actorSearchInput');
const searchForm = document.getElementById('searchForm'); // El de películas
const exploreResultMsg = document.getElementById('exploreResultMsg');

// Guarda la última lista de películas y actores mostrados
let ultimaListaPeliculas = [];
let ultimaListaActores = [];

// Mostrar actores populares
export function mostrarActores() {
  setSeccionActual(mostrarActores);
  actorSearchForm.classList.remove('d-none');
  searchForm.classList.add('d-none');
  exploreResultMsg.textContent = 'Actores populares';
  moviesList.innerHTML = '<li class="col-12">Cargando actores...</li>';
  fetch(`${BASE_URL}/person/popular?api_key=${API_KEY}&page=${paginaActual}`)
    .then(response => response.json())
    .then(data => {
      moviesList.innerHTML = '';
      ultimaListaActores = data.results;
      data.results.slice(0, 12).forEach(actor => {
        const card = createActorCard(actor);
        moviesList.appendChild(card);
      });
      setTotalPaginas(Math.min(data.total_pages, 10));
      renderPaginacion();
    });
}

// Buscar actores por nombre
actorSearchForm.addEventListener('submit', function(e) {
  e.preventDefault();
  const query = actorSearchInput.value.trim();
  if (!query) return;
  moviesList.innerHTML = '<li class="col-12">Buscando actores...</li>';
  fetch(`${BASE_URL}/search/person?api_key=${API_KEY}&language=es-ES&query=${encodeURIComponent(query)}`)
    .then(res => res.json())
    .then(data => {
      if (!data.results.length) {
        moviesList.innerHTML = '<li class="col-12">No se encontraron actores.</li>';
        actorSearchInput.value = '';
        return;
      }
      moviesList.innerHTML = '';
      ultimaListaActores = data.results;
      data.results.slice(0, 8).forEach(actor => {
        const card = createActorCard(actor);
        moviesList.appendChild(card);
      });
      actorSearchInput.value = '';
    });
});

function mostrarDetalleActor(actorId) {
  Promise.all([
    fetch(`${BASE_URL}/person/${actorId}?api_key=${API_KEY}&language=es-ES`).then(res => res.json()),
    fetch(`${BASE_URL}/person/${actorId}/movie_credits?api_key=${API_KEY}&language=es-ES`).then(res => res.json())
  ]).then(([actor, credits]) => {
    const edad = actor.birthday ? ` (${calcularEdad(actor.birthday)} años)` : '';
    const peliculas = credits.cast && credits.cast.length
      ? `<h6 class="mt-3">Películas conocidas:</h6>
         <ul>${credits.cast.slice(0, 5).map(p => `<li>${p.title} (${p.character || 'Sin rol'})</li>`).join('')}</ul>`
      : '<p class="mt-3">No hay películas conocidas.</p>';

    // Cargar contenido en el modal
    const modalBody = document.querySelector('#actorModal .modal-body');
    modalBody.innerHTML = `
      <div class="row">
        <div class="col-md-4 text-center">
          <img src="${actor.profile_path ? `https://image.tmdb.org/t/p/w300${actor.profile_path}` : 'https://via.placeholder.com/300x450?text=No+Image'}" class="img-fluid rounded shadow mt-3 mb-3" alt="${actor.name}">
        </div>
        <div class="col-md-8">
          <p><strong>Nacimiento:</strong> ${actor.birthday ? actor.birthday : 'No disponible'}${edad}</p>
          <p><strong>Lugar:</strong> ${actor.place_of_birth || 'No disponible'}</p>
          <p><strong>Biografía:</strong> ${actor.biography || 'No disponible.'}</p>
          ${peliculas}
        </div>
      </div>
    `;

    // Cambia el título del modal
    document.getElementById('actorModalLabel').textContent = actor.name;

    // Abre el modal (Bootstrap 5)
    const modal = new bootstrap.Modal(document.getElementById('actorModal'));
    modal.show();
  });
}

function calcularEdad(fecha) {
  const hoy = new Date();
  const nacimiento = new Date(fecha);
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const m = hoy.getMonth() - nacimiento.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad--;
  }
  return edad;
}

// Otras secciones de Menu
export function mostrarPremios() {
  setSeccionActual(mostrarPremios);
  actorSearchForm.classList.add('d-none');
  searchForm.classList.remove('d-none');
  exploreResultMsg.textContent = 'Premios';
  moviesList.innerHTML = `
    <li class="col-12">
      <h3>Premios</h3>
      <p>Próximamente podrás ver información sobre premios y nominaciones.</p>
    </li>
  `;
}

export function mostrarNoticias() {
  setSeccionActual(mostrarNoticias);
  actorSearchForm.classList.add('d-none');
  searchForm.classList.remove('d-none');
  exploreResultMsg.textContent = 'Noticias';
  moviesList.innerHTML = `
    <li class="col-12">
      <h3>Noticias</h3>
      <p>Próximamente podrás leer noticias y novedades del mundo del cine.</p>
    </li>
  `;
}

// Tendencias
export function mostrarTendencias() {
  setSeccionActual(mostrarTendencias);
  actorSearchForm.classList.add('d-none');
  searchForm.classList.add('d-none'); // <-- Oculta el input de búsqueda
  exploreResultMsg.textContent = 'Tendencias de la semana';
  moviesList.innerHTML = '<li class="col-12">Cargando tendencias...</li>';
  fetch(`${BASE_URL}/trending/movie/week?api_key=${API_KEY}&page=${paginaActual}&language=es-ES`)
    .then(res => res.json())
    .then(data => {
      moviesList.innerHTML = '';
      setTotalPaginas(Math.min(data.total_pages, 10));
      ultimaListaPeliculas = data.results; // Guarda la lista actual
      data.results.slice(0, 12).forEach(movie => {
        const card = createMovieCard(movie);
        moviesList.appendChild(card);
      });
      renderPaginacion();
    })
    .catch(() => {
      moviesList.innerHTML = '<li class="col-12">Error al cargar películas en tendencia.</li>';
    });
}

// Más valoradas
export function mostrarMasValoradas() {
  setSeccionActual(mostrarMasValoradas);
  actorSearchForm.classList.add('d-none');
  searchForm.classList.remove('d-none');
  exploreResultMsg.textContent = 'Películas con mejor rating';
  moviesList.innerHTML = '<li class="col-12">Cargando películas mejor valoradas...</li>';
  fetch(`${BASE_URL}/movie/top_rated?api_key=${API_KEY}&language=es-ES&page=${paginaActual}`)
    .then(res => res.json())
    .then(data => {
      moviesList.innerHTML = '';
      setTotalPaginas(Math.min(data.total_pages, 10));
      ultimaListaPeliculas = data.results;
      data.results
        .sort((a, b) => b.vote_average - a.vote_average)
        .slice(0, 12)
        .forEach(movie => {
          const card = createMovieCard(movie, true); // <--- aquí el true
          moviesList.appendChild(card);
        });
      renderPaginacion();
    })
    .catch(() => {
      moviesList.innerHTML = '<li class="col-12">Error al cargar películas mejor valoradas.</li>';
    });
}

const menuDropdownMenu = document.getElementById('menuDropdownMenu');
if (menuDropdownMenu) {
  menuDropdownMenu.addEventListener('click', (e) => {
    const item = e.target.closest('.dropdown-item');
    if (!item) return;

    // Permite la navegación normal para cualquier login.html o signup.html
    const href = item.getAttribute('href');
    if (href && (href.includes('login.html') || href.includes('signup.html'))) {
      console.log('Navegando a:', href);
      return;
    }

    e.preventDefault();
    switch (item.textContent.trim()) {
      case 'Actores':
        mostrarActores();
        break;
      case 'Premios':
        mostrarPremios();
        break;
      case 'Noticias':
        mostrarNoticias();
        break;
      case 'Tendencias':
        mostrarTendencias();
        break;
      case 'Más valoradas':
        mostrarMasValoradas();
        break;
      // Otros casos...
    }
  });
}

// Listener global para abrir el modal al hacer click en la card (excepto en el botón watchlist)
moviesList.addEventListener('click', function(e) {
  if (e.target.closest('.watchlist-btn')) return; // No abrir modal si es el botón watchlist

  // Películas
  const card = e.target.closest('.movie-card');
  if (card) {
    const movieId = card.querySelector('.watchlist-btn').getAttribute('data-movie-id');
    const movie = ultimaListaPeliculas.find(m => m.id == movieId);
    if (movie) {
      showMovieModal(movie, API_KEY, BASE_URL);
      return;
    }
  }

  // Actores
  const actorCard = e.target.closest('.actor-card');
  if (actorCard) {
    const actorId = actorCard.getAttribute('data-actor-id');
    if (actorId) {
      mostrarDetalleActor(actorId);
    }
  }
});


