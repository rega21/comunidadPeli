/**
 * Genera el HTML de una tarjeta de película.
 * @param {Object} movie - Objeto película de la API.
 * @param {boolean} mostrarVotos - Indica si se deben mostrar los votos.
 * @returns {HTMLElement} - Elemento <li> con la tarjeta.
 */
export function createMovieCard(movie, mostrarVotos = false) {
  const li = document.createElement('li');
  li.className = 'col-6 col-sm-4 col-md-3 col-lg-2 mb-3'; // <-- Aquí va la clase

  li.innerHTML = `
    <div class="card h-100 position-relative movie-card" style="cursor:pointer;">
      <img src="${movie.poster_path
        ? `https://image.tmdb.org/t/p/w300${movie.poster_path}`
        : 'https://via.placeholder.com/300x450?text=No+Image'}" class="card-img-top" alt="${movie.title}">
      <button class="btn btn-dark btn-sm rounded-circle position-absolute top-0 start-0 m-2 watchlist-btn"
        data-movie-id="${movie.id}"
        title="Agregar a Watchlist"
        style="width:36px;height:36px;display:flex;align-items:center;justify-content:center;border:none;">
        <i class="bi bi-plus-lg fs-5 text-white"></i>
      </button>
      <div class="card-body">
        
        <p class="card-text mb-2">
          ${
            mostrarVotos
              ? `<span class="text-primary"><i class="bi bi-people-fill"></i> ${movie.vote_count} votos</span>`
              : `<span class="text-warning">&#9733;</span> <span>${movie.vote_average}</span>`
          }
           <h5 class="card-title mb-1">${movie.title}</h5>
        </p>
      </div>
    </div>
  `;

  // Verificar si la película está en la lista de favoritos del usuario
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  if (usuario) {
    const favoritos = JSON.parse(localStorage.getItem(`favoritos_${usuario.mail}`)) || [];
    if (favoritos.includes(String(movie.id))) {
      li.querySelector('.watchlist-btn i').className = 'bi bi-bookmark-fill text-warning';
    }
  }

  return li;
}

/**
 * Genera el contenido HTML para el modal de detalle de la película.
 * @param {Object} movie - Objeto película de la API.
 * @returns {string} - Cadena con el contenido HTML.
 */
export function createMovieModalContent(movie) {
  return `
    <div class="row g-0">
      <div class="col-md-4">
        <img src="${movie.poster_path ? `https://image.tmdb.org/t/p/w300${movie.poster_path}` : 'https://via.placeholder.com/300x450?text=No+Image'}" 
          style="width:150px;max-width:100%;" alt="${movie.title}" class="img-fluid rounded shadow">
      </div>
      <div class="col-md-8">
        <p><strong>Año:</strong> ${movie.release_date ? movie.release_date.slice(0, 4) : 'N/A'}</p>
        <p><strong>Rating:</strong> <span class="text-warning">&#9733;</span> ${movie.vote_average}</p>
        <p><strong>Resumen:</strong> ${movie.overview || 'Sin descripción disponible.'}</p>
        <div id="info-extra"></div>
        <hr class="my-4">
        <div id="trailer-container"></div>
      </div>
    </div>
  `;
}

/**
 * Muestra el modal con la información detallada de la película.
 * @param {Object} movie - Objeto película de la API.
 * @param {string} API_KEY - Clave de API para acceder a TMDB.
 * @param {string} BASE_URL - URL base de la API de TMDB.
 */
export function showMovieModal(movie, API_KEY, BASE_URL) {
  const modalTitle = document.getElementById('movieModalLabel');
  const modalBody = document.querySelector('#movieModal .modal-body');
  modalTitle.textContent = movie.title;
  modalBody.innerHTML = createMovieModalContent(movie);

  // Buscar actores y directores
  fetch(`${BASE_URL}/movie/${movie.id}/credits?api_key=${API_KEY}`)
    .then(response => response.json())
    .then(data => {
      const cast = data.cast.slice(0, 5).map(actor => actor.name).join(', ');
      const directors = data.crew.filter(person => person.job === 'Director').map(d => d.name).join(', ');
      const infoExtra = `
        <p><strong>Director:</strong> ${directors || 'No disponible'}</p>
        <p><strong>Actores principales:</strong> ${cast || 'No disponible'}</p>
      `;
      const trailerContainer = document.getElementById('trailer-container');
      trailerContainer.insertAdjacentHTML('beforebegin', infoExtra);
    });

  // Buscar trailer en TMDB
  fetch(`${BASE_URL}/movie/${movie.id}/videos?api_key=${API_KEY}`)
    .then(response => response.json())
    .then(data => {
      const trailer = data.results.find(
        v => v.type === 'Trailer' && v.site === 'YouTube'
      ) || data.results.find(
        v => v.site === 'YouTube'
      );
      if (trailer) {
        document.getElementById('trailer-container').innerHTML = `
          <a href="https://www.youtube.com/watch?v=${trailer.key}" target="_blank" rel="noopener" class="btn btn-danger mt-3">
            Ver tráiler en YouTube
          </a>
        `;
      } else {
        document.getElementById('trailer-container').innerHTML = `<p class="text-muted">No hay tráiler disponible.</p>`;
      }
    });

  // Mostrar el modal (Bootstrap 5)
  const modal = new bootstrap.Modal(document.getElementById('movieModal'));
  modal.show();
}

/**
 * Genera el HTML de una tarjeta de actor.
 * @param {Object} actor - Objeto actor de la API.
 * @returns {HTMLElement} - Elemento <li> con la tarjeta.
 */
export function createActorCard(actor, onClick) {
  const li = document.createElement('li');
  li.className = 'col-6 col-sm-4 col-md-3 col-lg-2 mb-3'; // Igual que las películas

  li.innerHTML = `
    <div class="card h-100 position-relative actor-card" data-actor-id="${actor.id}" style="cursor:pointer;">
      <img src="${actor.profile_path
        ? `https://image.tmdb.org/t/p/w300${actor.profile_path}`
        : 'https://via.placeholder.com/300x450?text=No+Image'}" class="card-img-top" alt="${actor.name}">
      <div class="card-body">
        <h5 class="card-title mb-1">${actor.name}</h5>
      </div>
    </div>
  `;

  // Evento para mostrar el modal al hacer click en la card
  li.querySelector('.card').addEventListener('click', () => {
    if (typeof onClick === 'function') {
      onClick(actor);
    }
  });

  return li;
}

/**
 * Genera el HTML de una tarjeta de director.
 * @param {Object} director - Objeto director de la API.
 * @param {Function} onClick - Función callback al hacer click.
 * @returns {HTMLElement} - Elemento <li> con la tarjeta.
 */
export function createDirectorCard(director, onClick) {
  const li = document.createElement('li');
  li.className = 'col-6 col-sm-4 col-md-3 col-lg-2 mb-3';

  li.innerHTML = `
    <div class="card h-100 position-relative director-card" data-director-id="${director.id}" style="cursor:pointer;">
      <img src="${director.profile_path
        ? `https://image.tmdb.org/t/p/w300${director.profile_path}`
        : 'https://via.placeholder.com/300x450?text=No+Image'}" class="card-img-top" alt="${director.name}">
      <div class="card-body">
        <h5 class="card-title mb-1">${director.name}</h5>
      </div>
    </div>
  `;

  // Evento para mostrar el modal al hacer click en la card
  li.querySelector('.card').addEventListener('click', () => {
    if (typeof onClick === 'function') {
      onClick(director);
    }
  });

  return li;
}

/**
 * Busca el trailer de YouTube en inglés para una película.
 * @param {number} movieId
 * @param {string} API_KEY
 * @param {string} BASE_URL
 * @returns {Promise<string|null>} - Devuelve el key del trailer o null si no hay.
 */
export async function getYouTubeTrailerKeyEn(movieId, API_KEY, BASE_URL) {
  try {
    const res = await fetch(`${BASE_URL}/movie/${movieId}/videos?api_key=${API_KEY}&language=en-US`);
    const data = await res.json();
    // Busca trailer en inglés
    let trailer = data.results.find(
      v => v.type === 'Trailer' && v.site === 'YouTube' && v.iso_639_1 === 'en'
    );
    // Si no hay en inglés, busca cualquier trailer de YouTube
    if (!trailer) {
      trailer = data.results.find(
        v => v.type === 'Trailer' && v.site === 'YouTube'
      );
    }
    return trailer ? trailer.key : null;
  } catch {
    return null;
  }
}