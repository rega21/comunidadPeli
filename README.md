# Cine Comunidad

App web para explorar películas, construida con JavaScript vanilla y Bootstrap 5.

**Demo:** [peliar.vercel.app](https://peliar.vercel.app)

---

## Tecnologías

- HTML5 / CSS3 / JavaScript ES6 (módulos)
- Bootstrap 5.3 + Bootstrap Icons
- [TMDB API](https://www.themoviedb.org/) — películas, géneros, actores, directores
- [OMDB API](https://www.omdbapi.com/) — premios Oscar
- [Supabase](https://supabase.com/) — autenticación y watchlist
- Vercel — hosting

---

## Funcionalidades

- Películas populares, tendencias, ranking y estrenos con paginación
- Filtros por género, ordenamiento y año
- Búsqueda con autocompletado (películas y actores)
- Perfiles de actores y directores con filmografía
- Modal de detalle: sinopsis, reparto, director y trailer
- Premios Oscar vía OMDB
- Watchlist personal (requiere cuenta)
- Login con email/contraseña o Google

---

## Configuración local

1. Clonar el repo:
   ```bash
   git clone https://github.com/rega21/comunidadPeli.git
   cd comunidadPeli
   ```

2. Copiar y completar el archivo de configuración:
   ```bash
   cp js-movies-app/js/config.example.js js-movies-app/js/config.js
   ```

3. Abrir `js-movies-app/index.html` con un servidor local (ej: Live Server en VS Code).

---

This product uses the TMDB API but is not endorsed or certified by TMDB.
