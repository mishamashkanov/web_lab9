const API_URL = '/api/items';

let currentPage = 1;
let currentSearch = '';
let currentSort = '';
let currentOrder = 'asc';
const limit = 5;

document.addEventListener('DOMContentLoaded', () => {
  fetchItems();
  document.getElementById('searchInput').addEventListener('input', debounce(onSearch, 300));
  document.getElementById('clearSearch').addEventListener('click', () => {
    document.getElementById('searchInput').value = '';
    onSearch();
  });
});

function fetchItems() {
  const params = new URLSearchParams();
  params.append('page', currentPage);
  params.append('limit', limit);
  if (currentSearch) params.append('search', currentSearch);
  if (currentSort) {
    params.append('sort', currentSort);
    params.append('order', currentOrder);
  }

  fetch(`${API_URL}?${params.toString()}`)
    .then(res => res.json())
    .then(data => {
      renderTable(data.items);
      renderPagination(data.totalPages, data.page);
    });
}

function renderTable(items) {
  const tbody = document.getElementById('tableBody');
  tbody.innerHTML = items.map(item =>
    `<tr>
      <td>${item.id}</td>
      <td>${item.name}</td>
      <td>${item.description}</td>
      <td>
        <button onclick="editItem(${item.id})">Редактировать</button>
        <button onclick="deleteItem(${item.id})">Удалить</button>
      </td>
    </tr>`
  ).join('');
}

function renderPagination(totalPages, page) {
  const container = document.getElementById('pagination');
  container.innerHTML = '';

  if (totalPages <= 1) return;

  const prevBtn = document.createElement('button');
  prevBtn.textContent = '« Назад';
  prevBtn.disabled = page === 1;
  prevBtn.addEventListener('click', () => {
    if (page > 1) {
      currentPage--;
      fetchItems();
    }
  });
  container.appendChild(prevBtn);

  const maxButtons = 5;
  let startPage = Math.max(1, page - Math.floor(maxButtons / 2));
  let endPage = Math.min(totalPages, startPage + maxButtons - 1);
  if (endPage - startPage + 1 < maxButtons) {
    startPage = Math.max(1, endPage - maxButtons + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    const pageBtn = document.createElement('button');
    pageBtn.textContent = i;
    if (i === page) pageBtn.style.fontWeight = 'bold';
    pageBtn.addEventListener('click', () => {
      currentPage = i;
      fetchItems();
    });
    container.appendChild(pageBtn);
  }

  const nextBtn = document.createElement('button');
  nextBtn.textContent = 'Вперед »';
  nextBtn.disabled = page === totalPages;
  nextBtn.addEventListener('click', () => {
    if (page < totalPages) {
      currentPage++;
      fetchItems();
    }
  });
  container.appendChild(nextBtn);
}

function onSearch() {
  currentSearch = document.getElementById('searchInput').value.trim();
  currentPage = 1;
  fetchItems();
}

function toggleSort() {
  if (currentSort === '') {
    currentSort = 'name';
    currentOrder = 'asc';
  } else if (currentSort === 'name' && currentOrder === 'asc') {
    currentOrder = 'desc';
  } else {
    currentSort = '';
    currentOrder = 'asc';
  }
  fetchItems();
}

function saveItem() {
  const id = document.getElementById('editId').value;
  const name = document.getElementById('name').value;
  const description = document.getElementById('description').value;

  if (!name || !description) {
    alert('Заполните все поля');
    return;
  }

  const url = id ? `${API_URL}/${id}` : API_URL;
  const method = id ? 'PUT' : 'POST';

  fetch(url, {
    method: method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, description })
  })
  .then(() => {
    clearForm();
    fetchItems();
  });
}

function editItem(id) {
  fetch(`${API_URL}/${id}`)
    .then(res => res.json())
    .then(item => {
      document.getElementById('editId').value = item.id;
      document.getElementById('name').value = item.name;
      document.getElementById('description').value = item.description;
    });
}

function deleteItem(id) {
  if (confirm('Удалить?')) {
    fetch(`${API_URL}/${id}`, { method: 'DELETE' })
      .then(() => fetchItems());
  }
}

function clearForm() {
  document.getElementById('editId').value = '';
  document.getElementById('name').value = '';
  document.getElementById('description').value = '';
}

function debounce(func, delay) {
  let timer;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => func.apply(this, args), delay);
  };
}