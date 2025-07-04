//EXPLORAR SOLO RESPONDE AL MENU, se cambio el nombre de la etiqueta y no lo modifique !!!!


// filepath: c:\Users\user\Desktop\Programacion\Js\movies-app\js-movies-app\js\Menu.js
import { API_KEY, BASE_URL } from './config.js';
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
      setTotalPaginas(Math.min(data.total_pages, 10));
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
      
      setTotalPaginas(Math.min(data.total_pages, 10));
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
export function mostrarMasValoradas() {
  setPaginaActual(1); // Resetear a página 1
  setSeccionActual(mostrarMasValoradas);
  actorSearchForm.classList.add('d-none');
  searchForm.classList.remove('d-none');
  exploreResultMsg.textContent = 'Top rating';
  moviesList.innerHTML = '<li class="col-12">Cargando películas mejor valoradas...</li>';
  fetch(`${BASE_URL}/movie/top_rated?api_key=${API_KEY}&language=es-ES&page=${paginaActual}`)
    .then(res => res.json())
    .then(data => {
      moviesList.innerHTML = '';
      
      // Verificar si hay resultados
      if (!data.results || data.results.length === 0) {
        moviesList.innerHTML = '<li class="col-12">No hay más películas valoradas disponibles.</li>';
        setTotalPaginas(1);
        renderPaginacion();
        return;
      }
      
      setTotalPaginas(Math.min(data.total_pages, 10));
      ultimaListaPeliculas = data.results;
      data.results
        .sort((a, b) => b.vote_average - a.vote_average) // Ordena de mayor a menor
        .slice(0, 12)
        .forEach(movie => {
          const card = createMovieCard(movie, true);
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
      setTotalPaginas(Math.min(data.total_pages, 10));
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

    // Limpia SIEMPRE el mensaje antes de cambiar de sección
    exploreResultMsg.textContent = '';

    // Si el item tiene data-genre-id, es un género
    const genreId = item.getAttribute('data-genre-id');
    if (genreId) {
      setPaginaActual(1); // Resetear a página 1
      mostrarPeliculasPorGenero(genreId);
      return;
    }

    switch (item.textContent.trim()) {
      case 'Actores':
        setPaginaActual(1); // Resetear a página 1
        mostrarActores();
        break;
      case 'Directores':
        setPaginaActual(1); // Resetear a página 1
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
      case 'Más valoradas':
        mostrarMasValoradas();
        break;
      // Otros casos...
    }
  });
}