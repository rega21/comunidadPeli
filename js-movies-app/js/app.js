import { createMovieCard, createMovieModalContent, getYouTubeTrailerKeyEn } from './components.js';
import { setupNavbar } from './navbar.js';
import { setPaginaActual, renderPaginacion, paginaActual, setSeccionActual, setTotalPaginas } from './pagination.js';
import { setupAutocomplete } from './autocomplete.js';
import { renderImageCarousel } from './carousel.js';
import { API_KEY, BASE_URL, MOCKAPI_URL } from './config.js';
const moviesList = document.getElementById('movies');
const searchForm = document.getElementById('searchForm');
const searchInput = document.getElementById('searchInput');
const actorSearchInput = document.getElementById('actorSearchInput');

let generoActual = null;
let seccionActual = 'Inicio';
let sortByActual = 'popularity.desc';
let anioActual = '';

// Función para mostrar películas
function renderMovies(movies, { mostrarVotos = false, mostrarRating = true } = {}) {
  window.ultimaListaPeliculas = movies;
  moviesList.innerHTML = '';
  if (!movies || movies.length === 0) {
    moviesList.innerHTML = '<li class="col-12">No se encontraron películas.</li>';
    return;
  }
  movies.forEach(movie => {
    const card = createMovieCard(movie, mostrarVotos, mostrarRating);
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
  fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&language=es-ES&page=${paginaActual}`)
    .then(response => response.json())
    .then(data => {
      renderMovies(data.results);
      setTotalPaginas(Math.min(data.total_pages, 500));
      renderPaginacion();
    })
    .catch(() => {
      moviesList.innerHTML = '<li class="col-12">Error al cargar películas de inicio.</li>';
    });
}

// Inicializar con películas variadas
setSeccionActual(fetchInicioMovies);
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
    if (section !== 'Géneros') {
      document.querySelectorAll('#genreDropdownMenu .dropdown-item').forEach(el => el.classList.remove('active-genre'));
      document.getElementById('genreResultMsg').textContent = '';
      document.getElementById('seccionFiltros').innerHTML = '';
      sortByActual = 'popularity.desc';
      anioActual = '';
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
    sortByActual = 'popularity.desc';
    anioActual = '';
    const genreDropdownMenu = document.getElementById('genreDropdownMenu');
    const selected = genreDropdownMenu.querySelector(`[data-genre-id="${genreId}"]`);
    const genreName = selected ? selected.textContent.trim() : '';
    document.getElementById('genreResultMsg').textContent = genreName
      ? `Género: ${genreName}`
      : '';
    setPaginaActual(1);
    setSeccionActual(fetchMoviesByGenre);
    renderFiltrosGenero();
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
    const res = await fetch(`${MOCKAPI_URL}/favoritos?mail=${usuario.mail}&movieId=${movieId}`);
    const favoritos = await res.json();

    if (favoritos.length > 0 && favoritos[0].id) {
      // Quitar de favoritos (DELETE)
      await fetch(`${MOCKAPI_URL}/favoritos/${favoritos[0].id}`, { method: 'DELETE' });
      icon.className = 'bi bi-bookmark';
    } else {
      // Agregar a favoritos (POST)
      await fetch(`${MOCKAPI_URL}/favoritos`, {
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
  const res = await fetch(`${MOCKAPI_URL}/favoritos?mail=${usuario.mail}`);
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

function renderFiltrosGenero() {
  const filtros = document.getElementById('seccionFiltros');
  if (!filtros) return;
  const anioMax = new Date().getFullYear();
  let yearOptions = '<option value="">Todos los años</option>';
  for (let y = anioMax; y >= 1970; y--) {
    yearOptions += `<option value="${y}" ${anioActual == y ? 'selected' : ''}>${y}</option>`;
  }
  const sorts = [
    { value: 'popularity.desc', label: 'Popularidad' },
    { value: 'vote_average.desc', label: 'Mejor puntuación' },
    { value: 'vote_count.desc', label: 'Más votadas' },
    { value: 'release_date.desc', label: 'Más recientes' },
  ];
  filtros.innerHTML = `
    <div class="d-flex flex-wrap gap-2 align-items-center">
      <div class="btn-group" role="group">
        ${sorts.map(s => `
          <button class="btn btn-sm ${sortByActual === s.value ? 'btn-primary' : 'btn-outline-secondary'} genre-sort-btn" data-sort="${s.value}">
            ${s.label}
          </button>`).join('')}
      </div>
      <select id="anioFiltro" class="form-select form-select-sm w-auto bg-dark text-light border-secondary">
        ${yearOptions}
      </select>
    </div>
  `;
  filtros.querySelectorAll('.genre-sort-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      sortByActual = this.getAttribute('data-sort');
      setPaginaActual(1);
      renderFiltrosGenero();
      fetchMoviesByGenre();
    });
  });
  document.getElementById('anioFiltro').addEventListener('change', function () {
    anioActual = this.value;
    setPaginaActual(1);
    fetchMoviesByGenre();
  });
}

function fetchMoviesByGenre() {
  if (!generoActual) return;
  const hoy = new Date().toISOString().split('T')[0];
  let url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${generoActual}&language=es-ES&page=${paginaActual}&sort_by=${sortByActual}&release_date.lte=${hoy}`;
  if (anioActual) url += `&primary_release_year=${anioActual}`;
  if (sortByActual === 'vote_average.desc') url += `&vote_count.gte=200`;
  fetch(url)
    .then(response => response.json())
    .then(data => {
      renderMovies(data.results, { mostrarRating: sortByActual !== 'release_date.desc' });
      setTotalPaginas(Math.min(data.total_pages, 500));
      renderPaginacion();
      exploreResultMsg.textContent = '';
    })
    .catch(() => {
      moviesList.innerHTML = '<li class="col-12">Error al cargar películas por género.</li>';
    });
}






