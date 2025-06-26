export function renderImageCarousel(container, movies) {
  let carouselInner = movies.map((movie, idx) => `
    <div class="carousel-item${idx === 0 ? ' active' : ''}">
      <img src="https://image.tmdb.org/t/p/w780${movie.backdrop_path || '/path/to/horizontal-placeholder.jpg'}"
           class="d-block w-100 carousel-img"
           alt="${movie.title}"
           data-movie-id="${movie.id}">
    </div>
  `).join('');

  container.innerHTML = `
    <div id="inicioCarousel" class="carousel slide" data-bs-ride="carousel">
      <div class="carousel-inner">
        ${carouselInner}
      </div>
      <button class="carousel-control-prev" type="button" data-bs-target="#inicioCarousel" data-bs-slide="prev">
        <span class="carousel-control-prev-icon"></span>
      </button>
      <button class="carousel-control-next" type="button" data-bs-target="#inicioCarousel" data-bs-slide="next">
        <span class="carousel-control-next-icon"></span>
      </button>
    </div>
  `;
}

export async function renderVideosCarousel(container, movies, apiKey) {
  const videoSlides = [];
  for (const movie of movies) {
    const res = await fetch(`https://api.themoviedb.org/3/movie/${movie.id}/videos?api_key=${apiKey}`);
    const videoData = await res.json();
    const video = videoData.results.find(v =>
      (v.type === 'Trailer' || v.type === 'Teaser' || v.type === 'Clip') && v.site === 'YouTube'
    );
    if (video) {
      videoSlides.push(`
        <div class="carousel-item${videoSlides.length === 0 ? ' active' : ''}">
          <div class="ratio ratio-16x9">
            <iframe src="https://www.youtube.com/embed/${video.key}" allowfullscreen title="${movie.title}"></iframe>
          </div>
          <div class="carousel-caption d-none d-md-block bg-dark bg-opacity-50 rounded">
          </div>
           <h5>${movie.title}</h5>
        </div>
      `);
    }
  }

  if (videoSlides.length) {
    container.innerHTML = `
      <h4 class="mb-3">Videos de Tendencias</h4>
      <div id="videosCarousel" class="carousel slide" data-bs-ride="carousel">
        <div class="carousel-inner">
          ${videoSlides.join('')}
        </div>
        <button class="carousel-control-prev" type="button" data-bs-target="#videosCarousel" data-bs-slide="prev">
          <span class="carousel-control-prev-icon"></span>
        </button>
        <button class="carousel-control-next" type="button" data-bs-target="#videosCarousel" data-bs-slide="next">
          <span class="carousel-control-next-icon"></span>
        </button>
      </div>
    `;

    // --- Lógica para pausar videos al cambiar de slide ---
    setTimeout(() => {
      const videosCarousel = document.getElementById('videosCarousel');
      if (videosCarousel) {
        videosCarousel.addEventListener('slid.bs.carousel', function () {
          const activeItem = videosCarousel.querySelector('.carousel-item.active');
          videosCarousel.querySelectorAll('.carousel-item').forEach(item => {
            const iframe = item.querySelector('iframe');
            if (iframe && item !== activeItem) {
              const src = iframe.src;
              iframe.src = src;
            }
          });
        });
      }
    }, 0);
    // -----------------------------------------------------
  }
}