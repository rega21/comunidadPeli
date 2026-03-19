# Movies App

Aplicación web para explorar películas, actores y directores, construida con JavaScript vanilla y Bootstrap 5.

## Features

- Explorar películas populares, tendencias, mejor puntuadas y estrenos
- Filtrar por género
- Búsqueda con autocompletado (películas y actores)
- Perfiles de actores y directores con filmografía
- Modal con detalle de película: sinopsis, reparto, director y trailer de YouTube
- Sección de premios Oscar (vía OMDb)
- Watchlist personal para usuarios registrados
- Carrusel de próximos estrenos
- Paginación
- Sistema de login y registro

## Tecnologías

- HTML5 / CSS3 / JavaScript ES6 (módulos)
- Bootstrap 5.3
- TMDb API — datos de películas, actores y directores
- OMDb API — información de premios
- MockAPI — backend para usuarios y watchlist

## Configuración

1. Clona el repositorio:
   ```bash
   git clone <repository-url>
   cd movies-app
   ```

2. Copia el archivo de configuración y completá con tus propias API keys:
   ```bash
   cp js-movies-app/js/config.example.js js-movies-app/js/config.js
   ```

3. Editá `config.js` con tus keys:
   - **TMDb API key**: [themoviedb.org/settings/api](https://www.themoviedb.org/settings/api)
   - **OMDb API key**: [omdbapi.com/apikey.aspx](https://www.omdbapi.com/apikey.aspx)
   - **MockAPI URL**: [mockapi.io](https://mockapi.io)

4. Abrí `js-movies-app/index.html` en el navegador (requiere servidor local por los módulos ES6).

   Con VS Code podés usar la extensión **Live Server**.

## Estructura

```
js-movies-app/
├── index.html
├── css/
│   ├── style.css
│   └── registro.css
└── js/
    ├── config.example.js   # Plantilla de configuración (commitear)
    ├── config.js           # API keys reales (NO commitear, en .gitignore)
    ├── app.js              # Lógica principal
    ├── explorar.js         # Sección explorar (actores, directores, tendencias)
    ├── components.js       # Componentes reutilizables (modales, cards)
    ├── navbar.js           # Navegación y géneros
    ├── carousel.js         # Carrusel de estrenos
    ├── autocomplete.js     # Búsqueda con autocompletado
    ├── pagination.js       # Paginación
    └── registro/
        ├── login.html
        ├── signup.html
        ├── auth-signin.js
        └── auth-signup.js
```
