// Carousel de imágenes (estrenos)
export function renderImageCarousel(container, movies, showMovieModal) {
  if (!container || !movies || !movies.length) return;

  const slides = movies.map((movie, idx) => `
    <div class="carousel-item${idx === 0 ? ' active' : ''}">
      <img src="https://image.tmdb.org/t/p/w780${movie.backdrop_path || movie.poster_path}" 
           class="d-block w-100 carousel-img"
           alt="${movie.title}"
           style="cursor:pointer"
           data-bs-toggle="modal"
           data-bs-target="#movieModal"
           data-movie-id="${movie.id}">

    </div>
  `).join('');

  container.innerHTML = `
    <h4 class="mb-3">Proximamente en salas</h4>
    <div id="inicioCarousel" class="carousel slide" data-bs-ride="carousel">
      <div class="carousel-inner">
        ${slides}
      </div>
      <button class="carousel-control-prev" type="button" data-bs-target="#inicioCarousel" data-bs-slide="prev">
        <span class="carousel-control-prev-icon"></span>
      </button>
      <button class="carousel-control-next" type="button" data-bs-target="#inicioCarousel" data-bs-slide="next">
        <span class="carousel-control-next-icon"></span>
      </button>
    </div>
  `;

  // Evento para cargar info en el modal al hacer click en la imagen
  setTimeout(() => {
    container.querySelectorAll('[data-movie-id]').forEach(img => {
      img.addEventListener('click', function () {
        const movieId = this.getAttribute('data-movie-id');
        const movie = movies.find(m => m.id == movieId);
        if (movie) {
          showMovieModal(movie);
        }
      });
    });
  }, 0);
}



