# Cine Comunidad

App de películas construida con JavaScript puro y Bootstrap 5, consumiendo las APIs de TMDB y OMDB.

---

## Tecnologías

- HTML5 / CSS3
- JavaScript ES6+ (módulos)
- Bootstrap 5.3
- Bootstrap Icons
- API: [TMDB](https://www.themoviedb.org/) — películas, géneros, actores, directores, tendencias
- API: [OMDB](https://www.omdbapi.com/) — premios
- API: [MockAPI](https://mockapi.io/) — favoritos por usuario

---

## Estructura

```
js-movies-app/
├── index.html          # Entrada principal
├── css/
│   ├── style.css       # Estilos globales
│   └── registro.css    # Estilos login/signup
├── js/
│   ├── app.js          # Lógica principal (inicio, búsqueda, favoritos)
│   ├── explorar.js     # Secciones del menú (actores, directores, premios, ranking...)
│   ├── navbar.js       # Setup del navbar y estado de sesión
│   ├── pagination.js   # Paginación reutilizable
│   ├── components.js   # Cards de película, actor, director y modals
│   ├── carousel.js     # Carousel de estrenos
│   ├── autocomplete.js # Autocomplete en buscador
│   └── config.js       # API keys (no trackeado)
└── js/registro/
    ├── login.html
    ├── signup.html
    ├── auth-signin.js
    └── auth-signup.js
```

---

## Funcionalidades

### Inicio
- Películas populares del momento con paginación real (hasta 500 páginas)
- Carousel de estrenos en cartelera
- Buscador con autocomplete

### Géneros
- Listado dinámico desde TMDB
- Filtros por ordenamiento: Popularidad, Mejor puntuación, Más votadas, Más recientes
- Filtro por año (1970 – actualidad)
- Género activo con indicador ✓ y etiqueta sticky visible al scrollear
- Al final del dropdown: acceso rápido a Tendencias y Ranking

### Favoritos
- Requiere sesión iniciada
- Guardado en MockAPI por usuario

### Menú
| Sección | Descripción |
|---|---|
| Actores | Actores populares con buscador |
| Directores | Directores populares (extraídos de créditos de películas) |
| Noticias | Noticias cinematográficas |
| Tendencias | Películas trending de la semana (en dropdown Géneros) |
| Ranking | Top por puntuación o por votos (en dropdown Géneros) |

### Ranking
Dos modos de ordenamiento:
- **⭐ Mejor puntuación** — endpoint `top_rated` de TMDB
- **👥 Más votadas** — `discover` ordenado por `vote_count.desc`

### Autenticación
- Registro e inicio de sesión via MockAPI
- Estado de sesión persistido en `localStorage`
- Menú muestra "Cerrar sesión" cuando hay usuario activo

---

## Configuración

Copiar `config.example.js` como `config.js` y completar las keys:

```js
export const API_KEY = 'TU_TMDB_KEY';
export const BASE_URL = 'https://api.themoviedb.org/3';
export const OMDB_KEY = 'TU_OMDB_KEY';
export const MOCKAPI_URL = 'TU_MOCKAPI_URL';
```

---

## Changelog

### 2026-04-24 (v2)
- Filtros por ordenamiento y año dentro de cada género
- Género seleccionado muestra ✓ en el dropdown y etiqueta sticky al scrollear
- "Más recientes" oculta el rating (películas nuevas sin votos)
- Mobile: offcanvas con ítems planos sin dropdown "Menú" anidado
- Tendencias y Ranking movidos al dropdown de Géneros
- Directores reescritos: se extraen de créditos de películas populares
- Fix: género activo se borraba al abrir el dropdown de géneros

### 2026-04-24
- Menú hamburguesa convertido a offcanvas lateral (panel pequeño desde la derecha)
- Dropdowns con tema oscuro consistente con la app
- Login renombrado a "Ingresar sin cuenta" en la pantalla de login
- Sección "Más valoradas" renombrada a **Ranking** con filtros de puntuación y votos
- Paginación expandida de 10 a 500 páginas en todas las secciones
- Fix: paginación no funcionaba al inicio por falta de `setSeccionActual`
- Fix: paginación se reseteaba a página 1 en Ranking al paginar
- Fix: filtro de género perdía contexto al paginar
