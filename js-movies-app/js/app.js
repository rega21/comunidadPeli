import { createMovieCard, createMovieModalContent, getYouTubeTrailerKeyEn } from './components.js';
import { setupNavbar } from './navbar.js';
import { setPaginaActual, renderPaginacion, paginaActual, setSeccionActual, setTotalPaginas } from './pagination.js';
import { setupAutocomplete } from './autocomplete.js';
import { renderImageCarousel } from './carousel.js';

const API_KEY = '12be8542502608cdcb8f5b86efa3ee46'; // Reemplaza con tu API key real
const BASE_URL = 'https://api.themoviedb.org/3';
const moviesList = document.getElementById('movies');
const searchForm = document.getElementById('searchForm');
const searchInput = document.getElementById('searchInput');
const actorSearchInput = document.getElementById('actorSearchInput');

let generoActual = null;
let seccionActual = 'Inicio'; // Al cargar la página

// Función para mostrar películas
function renderMovies(movies) {
  window.ultimaListaPeliculas = movies;
  moviesList.innerHTML = '';
  if (!movies || movies.length === 0) {
    moviesList.innerHTML = '<li class="col-12">No se encontraron películas.</li>';
    return;
  }
  movies.forEach(movie => {
    const card = createMovieCard(movie);
    moviesList.appendChild(card);
  });

  // Agregar listeners a los botones DETALLE
  document.querySelectorAll('.detalle-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      const movieId = this.getAttribute('data-movie-id');
      const movie = movies.find(m => m.id == movieId);
      if (movie) {
        showMovieModal(movie);
      }
    });
  });
}

// Función para buscar películas
function searchMovies(query) {
  fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}`)
    .then(response => response.json())
    .then(data => renderMovies(data.results))
    .catch(() => {
      moviesList.innerHTML = '<li class="col-12">Error al buscar películas.</li>';
    });
}

// Mostrar películas populares al cargar
function fetchPopularMovies() {
  fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}`)
    .then(response => response.json())
    .then(data => renderMovies(data.results))
    .catch(() => {
      moviesList.innerHTML = '<li class="col-12">Error al cargar películas populares.</li>';
    });
}

// Función para cargar películas de inicio con paginación real
function fetchInicioMovies() {
  const randomYear = Math.floor(Math.random() * (2024 - 1980 + 1)) + 1980; // Entre 1980 y 2024
  fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&sort_by=popularity.desc&primary_release_year=${randomYear}&page=${paginaActual}`)
    .then(response => response.json())
    .then (data => {
      renderMovies(data.results);
      setTotalPaginas(Math.min(data.total_pages, 10)); // Limita a 10 páginas si quieres
      renderPaginacion();
    })
    .catch(() => {
      moviesList.innerHTML = '<li class="col-12">Error al cargar películas de inicio.</li>';
    });
}

// Inicializar con películas variadas
fetchInicioMovies();

// --- SETUP AUTOCOMPLETE ---
setupAutocomplete(
  searchInput,
  (query) => `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}`,
  (item) => item.title,
  (item) => item.poster_path ? `https://image.tmdb.org/t/p/w92${item.poster_path}` : 'https://via.placeholder.com/32x48?text=No+Img'
);

setupAutocomplete(
  actorSearchInput,
  (query) => `${BASE_URL}/search/person?api_key=${API_KEY}&query=${encodeURIComponent(query)}`,
  (item) => item.name,
  (item) => item.profile_path ? `https://image.tmdb.org/t/p/w92${item.profile_path}` : 'https://via.placeholder.com/32x48?text=No+Img'
);

// --- SETUP NAVBAR Y CONTROL DE CAROUSEL ---
setupNavbar(
  (section) => {
    // Quitar selección de género al cambiar de sección
    document.querySelectorAll('#genreDropdownMenu .dropdown-item').forEach(el => el.classList.remove('active-genre'));
    if (section !== 'Género') {
      document.getElementById('genreResultMsg').textContent = '';
    }
    const inicioCarouselContainer = document.getElementById('inicioCarouselContainer');
    switch (section) {
      case 'Inicio':
        if (searchForm) searchForm.style.display = '';
        setSeccionActual(fetchInicioMovies);
        fetchInicioMovies();
        seccionActual = 'Inicio';
        if (inicioCarouselContainer) {
          inicioCarouselContainer.style.display = '';
        }
        break;
      case 'Buscar':
        searchInput.focus();
        seccionActual = 'Buscar';
        // Ocultar el carousel
        if (inicioCarouselContainer) {
          inicioCarouselContainer.style.display = 'none';
        }
        break;
      case 'Favoritos':
        mostrarFavoritos();
        seccionActual = 'Favoritos';
        // Ocultar el carousel
        if (inicioCarouselContainer) {
          inicioCarouselContainer.style.display = 'none';
        }
        break;
      case '¿Qué ver este finde?':
        fetchTrendingMovies();
        seccionActual = '¿Qué ver este finde?';
        // Ocultar el carousel
        if (inicioCarouselContainer) {
          inicioCarouselContainer.style.display = 'none';
        }
        break;
      case 'Clásicos':
        fetchClassics();
        seccionActual = 'Clásicos';
        // Ocultar el carousel
        if (inicioCarouselContainer) {
          inicioCarouselContainer.style.display = 'none';
        }
        break;
      // ...otros cases...
    }
  },
  (genreId) => {
    generoActual = genreId;
    // Buscar el nombre del género seleccionado
    const genreDropdownMenu = document.getElementById('genreDropdownMenu');
    const selected = genreDropdownMenu.querySelector(`[data-genre-id="${genreId}"]`);
    const genreName = selected ? selected.textContent.trim() : '';
    // Mostrar mensaje dinámico
    document.getElementById('genreResultMsg').textContent = genreName
      ? `Resultados para el género: ${genreName}`
      : '';
    // Reiniciar a la primera página
    setPaginaActual(1);
    // Ocultar el carousel al seleccionar un género
    const inicioCarouselContainer = document.getElementById('inicioCarouselContainer');
    if (inicioCarouselContainer) {
      inicioCarouselContainer.style.display = 'none';
    }
    fetchMoviesByGenre();
  },
  API_KEY,
  BASE_URL
);

// --- MODAL Y EVENTOS ---
async function showMovieModal(movie) {
  const modalTitle = document.getElementById('movieModalLabel');
  const modalBody = document.querySelector('#movieModal .modal-body');
  modalTitle.textContent = movie.title;
  modalBody.innerHTML = createMovieModalContent(movie);

  // Buscar actores y directores
  fetch(`${BASE_URL}/movie/${movie.id}/credits?api_key=${API_KEY}`)
    .then(response => response.json())
    .then(data => {
      const cast = Array.isArray(data.cast) ? data.cast.slice(0, 5).map(actor => actor.name).join(', ') : 'No disponible';
      const directors = Array.isArray(data.crew) ? data.crew.filter(person => person.job === 'Director').map(d => d.name).join(', ') : 'No disponible';
      const infoExtra = `
        <p><strong>Director:</strong> ${directors}</p>
        <p><strong>Actores principales:</strong> ${cast}</p>
      `;
      const trailerContainer = document.getElementById('trailer-container');
      if (trailerContainer) {
        trailerContainer.insertAdjacentHTML('beforebegin', infoExtra);
      }
    });

  // Buscar trailer en inglés (o el primero disponible)
  const trailerKey = await getYouTubeTrailerKeyEn(movie.id, API_KEY, BASE_URL);
  if (trailerKey) {
    document.getElementById('trailer-container').innerHTML = `
      <a href="https://www.youtube.com/watch?v=${trailerKey}" target="_blank" rel="noopener" class="btn btn-danger mt-3">
        Ver tráiler en YouTube
      </a>
    `;
  } else {
    document.getElementById('trailer-container').innerHTML = `<p class="text-muted">No hay tráiler disponible.</p>`;
  }

  // Mostrar el modal (Bootstrap 5)
  const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('movieModal'));
  modal.show();
}

// Activa tooltips de Bootstrap
document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(el => {
  new bootstrap.Tooltip(el);
});

moviesList.addEventListener('click', function(e) {
  if (e.target.closest('.watchlist-btn')) return;

  const card = e.target.closest('.movie-card');
  if (card) {
    const movieId = card.querySelector('.watchlist-btn').getAttribute('data-movie-id');
    const movie = window.ultimaListaPeliculas.find(m => m.id == movieId);
    if (movie) {
      showMovieModal(movie, API_KEY, BASE_URL);
    }
  }
});

// Evento global para manejar clicks en el botón de favoritos (watchlist) SOLO en películas
document.addEventListener('click', async function(e) {
  const watchBtn = e.target.closest('.watchlist-btn');
  if (watchBtn) {
    e.stopPropagation();
    // Solo aplica a películas (cards con .movie-card)
    const card = watchBtn.closest('.movie-card');
    if (!card) return;

    const usuario = JSON.parse(localStorage.getItem('usuario'));
    if (!usuario) {
      alert('Debes iniciar sesión para agregar a tu Watchlist.');
      return;
    }
    const movieId = watchBtn.getAttribute('data-movie-id');
    const icon = watchBtn.querySelector('i');

    // Consultar si ya existe el favorito en MockAPI
    const res = await fetch(`https://685abb749f6ef9611157981f.mockapi.io/favoritos?mail=${usuario.mail}&movieId=${movieId}`);
    const favoritos = await res.json();

    if (favoritos.length > 0 && favoritos[0].id) {
      // Quitar de favoritos (DELETE)
      await fetch(`https://685abb749f6ef9611157981f.mockapi.io/favoritos/${favoritos[0].id}`, { method: 'DELETE' });
      icon.className = 'bi bi-bookmark';
    } else {
      // Agregar a favoritos (POST)
      await fetch('https://685abb749f6ef9611157981f.mockapi.io/favoritos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mail: usuario.mail, movieId })
      });
      icon.className = 'bi bi-bookmark-fill text-warning';
    }
    return;
  }

  // Modal detalle SOLO para películas
  const card = e.target.closest('.movie-card');
  if (card) {
    const movieId = card.querySelector('.watchlist-btn').getAttribute('data-movie-id');
    const movie = window.ultimaListaPeliculas.find(m => m.id == movieId);
    if (movie) {
      showMovieModal(movie, API_KEY, BASE_URL);
    }
  }
});

async function mostrarFavoritos() {
  // Oculta la paginación en la sección Favoritos
  const pagination = document.getElementById('pagination');
  if (pagination) pagination.classList.add('d-none');

  // Oculta el buscador de búsqueda completo
  if (searchForm) searchForm.style.display = 'none';

  const usuario = JSON.parse(localStorage.getItem('usuario'));
  if (!usuario) {
    moviesList.innerHTML = '<li class="col-12">Debes iniciar sesión para ver tus favoritos.</li>';
    return;
  }
  moviesList.innerHTML = '<li class="col-12">Cargando favoritos...</li>';
  const res = await fetch(`https://685abb749f6ef9611157981f.mockapi.io/favoritos?mail=${usuario.mail}`);
  let favoritos = await res.json();
  if (!Array.isArray(favoritos)) favoritos = [];
  if (!favoritos.length) {
    moviesList.innerHTML = '<li class="col-12">No tienes películas en tu Watchlist.</li>';
    return;
  }
  const movies = await Promise.all(
    favoritos.map(fav =>
      fetch(`${BASE_URL}/movie/${fav.movieId}?api_key=${API_KEY}`)
        .then(r => r.ok ? r.json() : null)
        .catch(() => null)
    )
  );
  const validMovies = movies.filter(Boolean);
  window.ultimaListaPeliculas = validMovies;
  moviesList.innerHTML = '';
  validMovies.forEach(movie => {
    const card = createMovieCard(movie);
    moviesList.appendChild(card);
  });
}

// Carousel de imágenes (estrenos) y trailers/teasers SOLO una vez al cargar la página
document.addEventListener('DOMContentLoaded', () => {
  const inicioCarouselContainer = document.getElementById('inicioCarouselContainer');
  if (inicioCarouselContainer) {
    inicioCarouselContainer.style.display = 'none';
  }

  // Carousel de estrenos (solo carga las imágenes, no lo muestra)
  if (inicioCarouselContainer) {
    fetch(`${BASE_URL}/movie/now_playing?api_key=${API_KEY}&language=es-ES&page=1`)
      .then(res => res.json())
      .then(data => {
        const topMovies = data.results.slice(0, 6);
        renderImageCarousel(inicioCarouselContainer, topMovies, showMovieModal);
        // Mostrar el carousel si la sección es Inicio al cargar la página
        if (seccionActual === 'Inicio') {
          inicioCarouselContainer.style.display = '';
        }
      });
  }
});

function fetchMoviesByGenre() {
  if (!generoActual) return;
  fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${generoActual}&language=es-ES&page=${paginaActual}`)
    .then(response => response.json())
    .then(data => {
      renderMovies(data.results);
      setTotalPaginas(Math.min(data.total_pages, 10));
      renderPaginacion();
      exploreResultMsg.textContent = '' // Borra el mensaje siempre al mostrar un género
    })
    .catch(() => {
      moviesList.innerHTML = '<li class="col-12">Error al cargar películas por género.</li>';
    });
}






