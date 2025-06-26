
export function setupAutocomplete(input, endpoint, getLabel, getImage) {
  let autocompleteList = document.createElement('ul');
  autocompleteList.className = 'list-group position-absolute w-100';
  autocompleteList.style.zIndex = 1000;
  input.parentNode.appendChild(autocompleteList);

  input.addEventListener('input', function() {
    const query = input.value.trim();
    autocompleteList.innerHTML = '';
    if (query.length < 2) return;

    fetch(endpoint(query))
      .then(res => res.json())
      .then(data => {
        if (!data.results.length) return;
        const mostrados = new Set();
        const sugerencias = data.results.filter(item =>
          getLabel(item) &&
          getImage(item) &&
          !mostrados.has(getLabel(item)) &&
          mostrados.add(getLabel(item))
        );
        sugerencias.slice(0, 5).forEach(item => {
          const li = document.createElement('li');
          li.className = 'list-group-item list-group-item-action d-flex align-items-center';
          li.innerHTML = `
            <img src="${getImage(item)}" alt="${getLabel(item)}" class="rounded me-2" style="width:32px;height:48px;object-fit:cover;">
            <span>${getLabel(item)}</span>
          `;
          li.addEventListener('mousedown', () => {
            input.value = getLabel(item);
            autocompleteList.innerHTML = '';
          });
          autocompleteList.appendChild(li);
        });
      });
  });

  input.addEventListener('blur', () => {
    setTimeout(() => autocompleteList.innerHTML = '', 100);
  });
}