export let paginaActual = 1;
export let totalPaginas = 1;
export let seccionActual = null;

export function setSeccionActual(fn) {
  seccionActual = fn;
}
export function setTotalPaginas(n) {
  totalPaginas = n;
}
export function setPaginaActual(n) {
  paginaActual = n;
}

export function renderPaginacion() {
  const pagination = document.getElementById('pagination');
  if (!pagination) return;
  pagination.classList.remove('d-none');
  pagination.innerHTML = `
    <nav>
      <ul class="pagination justify-content-center">
        <li class="page-item${paginaActual === 1 ? ' disabled' : ''}">
          <button class="page-link" id="prevPage">Anterior</button>
        </li>
        <li class="page-item disabled">
          <span class="page-link">${paginaActual} / ${totalPaginas}</span>
        </li>
        <li class="page-item${paginaActual === totalPaginas ? ' disabled' : ''}">
          <button class="page-link" id="nextPage">Siguiente</button>
        </li>
      </ul>
    </nav>
  `;
  document.getElementById('prevPage')?.addEventListener('click', () => cambiarPagina(-1));
  document.getElementById('nextPage')?.addEventListener('click', () => cambiarPagina(1));
}

export function cambiarPagina(delta) {
  if ((paginaActual + delta) < 1 || (paginaActual + delta) > totalPaginas) return;
  paginaActual += delta;
  if (seccionActual) seccionActual();
}