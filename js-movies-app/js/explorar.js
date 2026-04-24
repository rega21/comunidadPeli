//EXPLORAR SOLO RESPONDE AL MENU, se cambio el nombre de la etiqueta y no lo modifique !!!!


// filepath: c:\Users\user\Desktop\Programacion\Js\movies-app\js-movies-app\js\Menu.js
import { API_KEY, BASE_URL, OMDB_KEY } from './config.js';
import { 
  createMovieCard, 
  showMovieModal, 
  createActorCard, 
  createDirectorCard 
} from './components.js';
import { renderPaginacion, paginaActual, setSeccionActual, setTotalPaginas, setPaginaActual } from './pagination.js';

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
  exploreResultMsg.textContent = '';
  moviesList.innerHTML = '<li class="col-12">Cargando actores...</li>';
  
  fetch(`${BASE_URL}/person/popular?api_key=${API_KEY}&page=${paginaActual}`)
    .then(response => response.json())
    .then(data => {
      moviesList.innerHTML = '';
      ultimaListaActores = data.results;
      
      // Verificar si hay resultados
      if (!data.results || data.results.length === 0) {
        moviesList.innerHTML = '<li class="col-12">No hay más actores disponibles.</li>';
        setTotalPaginas(paginaActual); // Mantener página actual como máximo
        renderPaginacion();
        return;
      }
      
      data.results.slice(0, 12).forEach(actor => {
        const card = createActorCard(actor);
        moviesList.appendChild(card);
      });
      
      // Ajustar total de páginas basado en contenido real
      setTotalPaginas(Math.min(data.total_pages, 500));
      renderPaginacion();
    })
    .catch(() => {
      moviesList.innerHTML = '<li class="col-12">Error al cargar actores.</li>';
      setTotalPaginas(1);
      renderPaginacion();
    });
}

// Mostrar directores populares
export function mostrarDirectores() {
  pagination.style.display = 'block'; // mostrar la paginación


  setSeccionActual(mostrarDirectores);
  actorSearchForm.classList.add('d-none');
  searchForm.classList.add('d-none');
  exploreResultMsg.textContent = 'Directores populares';
  moviesList.innerHTML = '<li class="col-12">Cargando directores...</li>';
  
  const currentPage = paginaActual;
  const moviePage = Math.ceil(currentPage / 2);
  
  fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&page=${moviePage}`)
    .then(response => response.json())
    .then(data => {
      // Si no hay más películas, no habrá más directores
      if (!data.results || data.results.length === 0) {
        moviesList.innerHTML = '<li class="col-12">No hay más directores disponibles.</li>';
        setTotalPaginas(Math.max(currentPage - 1, 1)); // Página anterior como máximo
        renderPaginacion();
        return;
      }
      
      const moviePromises = data.results.slice(0, 15).map(movie => 
        fetch(`${BASE_URL}/movie/${movie.id}/credits?api_key=${API_KEY}`)
          .then(res => res.json())
          .then(credits => credits.crew.filter(person => person.job === 'Director'))
          .catch(() => [])
      );
      
      return Promise.all(moviePromises);
    })
    .then(directorsArrays => {
      if (!directorsArrays) return; // Si no hay datos, salir
      
      const allDirectors = directorsArrays.flat();
      const uniqueDirectors = allDirectors.filter((director, index, self) => 
        index === self.findIndex(d => d.id === director.id)
      );
      
      moviesList.innerHTML = '';
      
      if (uniqueDirectors.length === 0) {
        moviesList.innerHTML = '<li class="col-12">No hay más directores disponibles.</li>';
        setTotalPaginas(Math.max(currentPage - 1, 1)); // Página anterior como máximo
        renderPaginacion();
        return;
      }
      
      ultimaListaActores = uniqueDirectors;
      
      // Paginación manual
      const itemsPerPage = 12;
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const directorsToShow = uniqueDirectors.slice(startIndex, endIndex);
      
      // Si no hay directores para mostrar en esta página
      if (directorsToShow.length === 0) {
        moviesList.innerHTML = '<li class="col-12">No hay más directores disponibles.</li>';
        setTotalPaginas(Math.max(currentPage - 1, 1)); // Página anterior como máximo
        renderPaginacion();
        return;
      }
      
      directorsToShow.forEach(director => {
        const card = createDirectorCard(director);
        moviesList.appendChild(card);
      });
      
      // Calcular páginas reales basadas en contenido disponible
      const totalPages = Math.ceil(uniqueDirectors.length / itemsPerPage);
      setTotalPaginas(Math.min(totalPages, currentPage + 2)); // Máximo 2 páginas adelante
      renderPaginacion();
    })
    .catch(error => {
      console.error('Error al cargar directores:', error);
      moviesList.innerHTML = '<li class="col-12">Error al cargar directores.</li>';
      setTotalPaginas(1);
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

// Nueva función para mostrar detalles del director
function mostrarDetalleDirector(directorId) {
  Promise.all([
    fetch(`${BASE_URL}/person/${directorId}?api_key=${API_KEY}&language=es-ES`).then(res => res.json()),
    fetch(`${BASE_URL}/person/${directorId}/movie_credits?api_key=${API_KEY}&language=es-ES`).then(res => res.json())
  ]).then(([director, credits]) => {
    const edad = director.birthday ? ` (${calcularEdad(director.birthday)} años)` : '';
    const peliculas = credits.crew && credits.crew.length
      ? `<h6 class="mt-3">Películas dirigidas:</h6>
         <ul>${credits.crew.filter(p => p.job === 'Director').slice(0, 5).map(p => `<li>${p.title} (${p.release_date ? new Date(p.release_date).getFullYear() : 'Sin fecha'})</li>`).join('')}</ul>`
      : '<p class="mt-3">No hay películas dirigidas disponibles.</p>';

    // Cargar contenido en el modal
    const modalBody = document.querySelector('#directorModal .modal-body');
    modalBody.innerHTML = `
      <div class="row">
        <div class="col-md-4 text-center">
          <img src="${director.profile_path ? `https://image.tmdb.org/t/p/w300${director.profile_path}` : 'https://via.placeholder.com/300x450?text=No+Image'}" class="img-fluid rounded shadow mt-3 mb-3" alt="${director.name}">
        </div>
        <div class="col-md-8">
          <p><strong>Nacimiento:</strong> ${director.birthday ? director.birthday : 'No disponible'}${edad}</p>
          <p><strong>Lugar:</strong> ${director.place_of_birth || 'No disponible'}</p>
          <p><strong>Biografía:</strong> ${director.biography || 'No disponible.'}</p>
          ${peliculas}
        </div>
      </div>
    `;

    // Cambia el título del modal
    document.getElementById('directorModalLabel').textContent = director.name;

    // Abre el modal (Bootstrap 5)
    const modal = new bootstrap.Modal(document.getElementById('directorModal'));
    modal.show();
  });
}

// Otras secciones de Menu
export function mostrarPremios() {
  pagination.style.display = 'none'; // Oculta la paginación

  setSeccionActual(mostrarPremios);
  actorSearchForm.classList.add('d-none');
  searchForm.classList.remove('d-none');
  exploreResultMsg.textContent = 'Premios y Oscars';

  // 24 películas de referencia
  const titulos = [
    'Forrest Gump', 'The Godfather', 'Titanic', 'Gladiator', 'La La Land', 'Schindler\'s List',
    'The Shawshank Redemption', 'Pulp Fiction', 'The Lord of the Rings: The Return of the King', 'Braveheart',
    'A Beautiful Mind', 'Chicago', 'Slumdog Millionaire', 'No Country for Old Men', 'The Artist',
    'Million Dollar Baby', 'The Departed', 'Crash', 'The King\'s Speech', 'Argo', 'Birdman',
    'Spotlight', 'Moonlight', 'Green Book', 'Parasite'
  ];

  // Selecciona 12 aleatorias
  const seleccionadas = titulos
    .sort(() => Math.random() - 0.5)
    .slice(0, 12);

  moviesList.innerHTML = '<li class="col-12">Cargando premios...</li>';

  Promise.all(
    seleccionadas.map(async titulo => {
      const res = await fetch(`https://www.omdbapi.com/?apikey=${OMDB_KEY}&t=${encodeURIComponent(titulo)}`);
      const data = await res.json();
      return {
        titulo: data.Title || titulo,
        year: data.Year || '',
        awards: data.Awards || 'Sin información de premios',
        poster: data.Poster && data.Poster !== 'N/A' ? data.Poster : 'https://via.placeholder.com/100x150?text=No+Img',
        imdbID: data.imdbID || ''
      };
    })
  ).then(premios => {
    moviesList.innerHTML = premios.map(p =>
      `<li class="col-12 col-md-6 col-lg-2 mb-4">
        <div class="card h-100 premio-card" data-imdb-id="${p.imdbID}">
          <img src="${p.poster}" class="card-img-top" alt="${p.titulo}">
          <div class="card-body">
            <h6 class="card-title">${p.titulo} (${p.year})</h6>
          </div>
        </div>
      </li>`
    ).join('');
  });

  searchInput.placeholder = 'Buscar película para ver premios...';
  searchForm.onsubmit = async function(e) {
    e.preventDefault();
    const titulo = searchInput.value.trim();
    if (!titulo) return;
    moviesList.innerHTML = '<li class="col-12">Buscando premios...</li>';
    const res = await fetch(`https://www.omdbapi.com/?apikey=${OMDB_KEY}&t=${encodeURIComponent(titulo)}`);
    const data = await res.json();
    moviesList.innerHTML = `

      <li class="col-12 col-md-6 col-lg-2 mb-4">
        <div class="card h-100 premio-card" data-imdb-id="${data.imdbID || ''}">
          <img src="${data.Poster && data.Poster !== 'N/A' ? data.Poster : 'https://via.placeholder.com/100x150?text=No+Img'}" class="card-img-top" alt="${data.Title}">
          <div class="card-body">
            <h6 class="card-title">${data.Title || titulo} (${data.Year || ''})</h6>
          </div>
       <li class="col-12 mb-3 text-center">
        <button id="volverPremios" class="btn btn-secondary btn-sm">Ver todas las películas premiadas</button>
      </li>
       </div>
        
      </li>
    `;

    // Listener para volver a mostrar todas las cards de premios
    document.getElementById('volverPremios').onclick = function() {
      mostrarPremios();
    };
  };
}

// REEMPLAZAR COMPLETAMENTE la función mostrarNoticias()

export function mostrarNoticias() {
  setSeccionActual(mostrarNoticias);
  actorSearchForm.classList.add('d-none');
  searchForm.classList.add('d-none');
  exploreResultMsg.textContent = 'Noticias Cinematográficas';
  moviesList.innerHTML = '<li class="col-12">Cargando las últimas noticias...</li>';
  
  setTimeout(() => {
    moviesList.innerHTML = `
      <li class="col-12 mb-4">
        <!-- Noticia Principal: Thanos Meme -->
        <div class="card border-warning">
          <div class="card-header bg-warning text-dark">
            <h4 class="mb-0">🎬 EXCLUSIVA: La verdadera cara de disney </h4>
            <small class="text-muted">Publicado hace 2 horas</small>
          </div>
          <div class="card-body">
            <div class="row">
              <div class="col-md-8">
                <p class="lead">Se filtra video exclusivo de detrás de cámaras de Avengers que muestra a Thanos en acción...</p>
                <div class="video-container">
                  <video 
                    controls 
                    width="100%" 
                    style="max-height: 400px; border-radius: 8px;"
                    poster="https://via.placeholder.com/800x450/6f42c1/white?text=🎭+THANOS+EXCLUSIVO"
                  >
                    <source src="./video/ThanosMeme.mp4" type="video/mp4">
                    Tu navegador no soporta la reproducción de video.
                  </video>
                </div>
                <p class="mt-3">
                  <strong>🎯 Resumen:</strong> Video exclusivo que muestra momentos nunca antes vistos del rodaje de Avengers. 
                  Los fans están enloqueciendo en redes sociales con este material filtrado.
                </p>
                <div class="d-flex gap-2">
                  <span class="badge bg-primary">#Thanos</span>
                  <span class="badge bg-success">#Marvel</span>
                  <span class="badge bg-info">#Exclusiva</span>
                  <span class="badge bg-warning text-dark">#Filtrado</span>
                </div>
              </div>
              <div class="col-md-4">
                <div class="bg-dark text-white">
                  <div class="card-body">
                    <h6>📊 Reacciones</h6>
                    <p class="mb-2">👍 <strong>2.5M</strong> Me gusta</p>
                    <p class="mb-2">💬 <strong>847K</strong> Comentarios</p>
                    <p class="mb-2">🔄 <strong>1.2M</strong> Compartidos</p>
                    <hr>
                    <h6>🔥 Trending</h6>
                    <p class="mb-1">#1 en Marvel</p>
                    <p class="mb-1">#3 en Cine</p>
                    <p class="mb-0">#7 en General</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </li>
      
      <!-- Otras noticias -->
      <li class="col-md-6 mb-4">
        <div class="card h-100 border-info">
          <div class="card-header bg-info text-white">
            <h5 class="mb-0">🎭 Nuevos Estrenos</h5>
          </div>
          <div class="card-body">
            <p>Las películas más esperadas del próximo mes llegan a los cines...</p>
            <small class="text-muted">Hace 4 horas</small>
          </div>
        </div>
      </li>
      
      <li class="col-md-6 mb-4">
        <div class="card h-100 border-success">
          <div class="card-header bg-success text-white">
            <h5 class="mb-0">🏆 Temporada de Premios</h5>
          </div>
          <div class="card-body">
            <p>Se anuncian las nominaciones para los próximos premios cinematográficos...</p>
            <small class="text-muted">Hace 6 horas</small>
          </div>
        </div>
      </li>
    `;
    
    setTotalPaginas(1);
    renderPaginacion();
  }, 300);
}

// Tendencias
export function mostrarTendencias() {

  setPaginaActual(1); // Resetear a página 1
  setSeccionActual(mostrarTendencias);
  actorSearchForm.classList.add('d-none');
  searchForm.classList.add('d-none'); // <-- Oculta el input de búsqueda
  exploreResultMsg.textContent = 'Tendencias de la semana';
  moviesList.innerHTML = '<li class="col-12">Cargando tendencias...</li>';
  fetch(`${BASE_URL}/trending/movie/week?api_key=${API_KEY}&page=${paginaActual}&language=es-ES`)
    .then(res => res.json())
    .then(data => {
      moviesList.innerHTML = '';
      
      // Verificar si hay resultados
      if (!data.results || data.results.length === 0) {
        moviesList.innerHTML = '<li class="col-12">No hay tendencias disponibles.</li>';
        setTotalPaginas(1);
        renderPaginacion();
        return;
      }
      
      setTotalPaginas(Math.min(data.total_pages, 500));
      ultimaListaPeliculas = data.results;
      data.results.slice(0, 12).forEach(movie => {
        const card = createMovieCard(movie);
        moviesList.appendChild(card);
      });
      renderPaginacion();
    })
    .catch(() => {
      moviesList.innerHTML = '<li class="col-12">Error al cargar películas en tendencia.</li>';
      setTotalPaginas(1);
      renderPaginacion();
    });
}

// Más valoradas
export function mostrarMasValoradas(sortBy = 'rating') {
  pagination.style.display = 'block';

  setSeccionActual(() => mostrarMasValoradas(sortBy));
  actorSearchForm.classList.add('d-none');
  searchForm.classList.remove('d-none');
  exploreResultMsg.textContent = 'Ranking';

  const filtrosContainer = document.getElementById('seccionFiltros');
  if (filtrosContainer) {
    filtrosContainer.innerHTML = `
      <div class="btn-group btn-group-sm">
        <button class="btn ${sortBy === 'rating' ? 'btn-primary' : 'btn-outline-secondary'}" id="filtroRating">
          ⭐ Mejor puntuación
        </button>
        <button class="btn ${sortBy === 'votes' ? 'btn-primary' : 'btn-outline-secondary'}" id="filtroVotos">
          👥 Más votadas
        </button>
      </div>
    `;
    filtrosContainer.querySelector('#filtroRating').addEventListener('click', () => { setPaginaActual(1); mostrarMasValoradas('rating'); });
    filtrosContainer.querySelector('#filtroVotos').addEventListener('click', () => { setPaginaActual(1); mostrarMasValoradas('votes'); });
  }

  moviesList.innerHTML = '<li class="col-12">Cargando películas mejor valoradas...</li>';

  const url = sortBy === 'votes'
    ? `${BASE_URL}/discover/movie?api_key=${API_KEY}&language=es-ES&sort_by=vote_count.desc&page=${paginaActual}`
    : `${BASE_URL}/movie/top_rated?api_key=${API_KEY}&language=es-ES&page=${paginaActual}`;

  fetch(url)
    .then(res => res.json())
    .then(data => {
      moviesList.innerHTML = '';
      if (!data.results || data.results.length === 0) {
        moviesList.innerHTML = '<li class="col-12">No hay más películas valoradas disponibles.</li>';
        setTotalPaginas(1);
        renderPaginacion();
        return;
      }
      setTotalPaginas(Math.min(data.total_pages, 500));
      ultimaListaPeliculas = data.results;
      data.results.slice(0, 12).forEach(movie => {
        const card = createMovieCard(movie, sortBy === 'votes');
        moviesList.appendChild(card);
      });
      renderPaginacion();
    })
    .catch(() => {
      moviesList.innerHTML = '<li class="col-12">Error al cargar películas mejor valoradas.</li>';
      setTotalPaginas(1);
      renderPaginacion();
    });
}

// Función para mostrar películas por género
function mostrarPeliculasPorGenero(genreId) {
  exploreResultMsg.textContent = ''; // Limpia el mensaje al cambiar de género
  const genreResultMsg = document.getElementById('genreResultMsg');
  if (genreResultMsg) genreResultMsg.textContent = '';

  setSeccionActual(() => mostrarPeliculasPorGenero(genreId));
  actorSearchForm.classList.add('d-none');
  searchForm.classList.remove('d-none');
  moviesList.innerHTML = '<li class="col-12">Cargando películas...</li>';
  fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genreId}&language=es-ES&page=${paginaActual}`)
    .then(res => res.json())
    .then(data => {
      moviesList.innerHTML = '';
      
      // Verificar si hay resultados
      if (!data.results || data.results.length === 0) {
        moviesList.innerHTML = '<li class="col-12">No hay más películas de este género disponibles.</li>';
        setTotalPaginas(Math.max(paginaActual - 1, 1));
        renderPaginacion();
        return;
      }
      
      ultimaListaPeliculas = data.results;
      setTotalPaginas(Math.min(data.total_pages, 500));
      data.results.slice(0, 12).forEach(movie => {
        const card = createMovieCard(movie);
        moviesList.appendChild(card);
      });
      renderPaginacion();
    })
    .catch(() => {
      moviesList.innerHTML = '<li class="col-12">Error al cargar películas por género.</li>';
      setTotalPaginas(1);
      renderPaginacion();
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
      return;
    }
  }

  // Directores
  const directorCard = e.target.closest('.director-card');
  if (directorCard) {
    const directorId = directorCard.getAttribute('data-director-id');
    if (directorId) {
      mostrarDetalleDirector(directorId);
    }
  }
});

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

    // Oculta el carousel al navegar por el menú (excepto Inicio)
    const inicioCarouselContainer = document.getElementById('inicioCarouselContainer');
    if (inicioCarouselContainer) {
      inicioCarouselContainer.style.display = 'none';
    }

    // Limpia SIEMPRE el mensaje y filtros antes de cambiar de sección
    exploreResultMsg.textContent = '';
    const filtrosContainer = document.getElementById('seccionFiltros');
    if (filtrosContainer) filtrosContainer.innerHTML = '';

    // Si el item tiene data-genre-id, es un género
    const genreId = item.getAttribute('data-genre-id');
    if (genreId) {
      setPaginaActual(1); // Resetear a página 1
      mostrarPeliculasPorGenero(genreId);
      return;
    }

    switch (item.textContent.trim()) {
      case 'Inicio':
        moviesList.innerHTML = '';
        exploreResultMsg.textContent = 'Bienvenido a Movies App';
        const inicioCarouselContainer = document.getElementById('inicioCarouselContainer');
        if (inicioCarouselContainer) {
          inicioCarouselContainer.style.display = '';
        }
        break;
      case 'Actores':
        setPaginaActual(1);
        mostrarActores();
        break;
      case 'Directores':
        setPaginaActual(1);
        mostrarDirectores();
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
      case 'Ranking':
        setPaginaActual(1);
        mostrarMasValoradas();
        break;
      // Otros casos...
    }
  });
}

// Nuevo listener para los botones de ver detalles de premios
moviesList.addEventListener('click', async function(e) {
  const card = e.target.closest('.premio-card');
  if (card) {
    const imdbID = card.getAttribute('data-imdb-id');
    if (!imdbID) return;
    const res = await fetch(`https://www.omdbapi.com/?apikey=${OMDB_KEY}&i=${imdbID}`);
    const data = await res.json();
    const modalBody = document.querySelector('#premioModal .modal-body');
    modalBody.innerHTML = `
      <div class="row">
        <div class="col-md-4 text-center">
          <img src="${data.Poster && data.Poster !== 'N/A' ? data.Poster : 'https://via.placeholder.com/300x450?text=No+Img'}" class="img-fluid rounded shadow mt-3 mb-3" alt="${data.Title}">
        </div>
        <div class="col-md-8">
          <h4>${data.Title || ''} (${data.Year || ''})</h4>
          <p><strong>Premios:</strong> ${data.Awards || 'Sin información de premios'}</p>
          <p><strong>Director:</strong> ${data.Director || 'No disponible'}</p>
          <p><strong>Actores:</strong> ${data.Actors || 'No disponible'}</p>
          <p><strong>Sinopsis:</strong> ${data.Plot || 'No disponible.'}</p>
          <a href="https://www.imdb.com/title/${imdbID}/" target="_blank" class="btn btn-outline-warning btn-sm mt-2">Ver en IMDb</a>
        </div>
      </div>
    `;
    const modal = new bootstrap.Modal(document.getElementById('premioModal'));
    modal.show();
  }
});