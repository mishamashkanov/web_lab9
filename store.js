const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'db.json');

function readDb() {
  const data = fs.readFileSync(dbPath, 'utf8');
  return JSON.parse(data);
}

function writeDb(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

function getAll() {
  const db = readDb();
  return db.items;
}

function getById(id) {
  const db = readDb();
  return db.items.find(item => item.id === parseInt(id));
}

function create(item) {
  const db = readDb();
  const newId = db.items.length > 0 ? Math.max(...db.items.map(i => i.id)) + 1 : 1;
  const newItem = { id: newId, ...item };
  db.items.push(newItem);
  writeDb(db);
  return newItem;
}

function update(id, item) {
  const db = readDb();
  const index = db.items.findIndex(i => i.id === parseInt(id));
  if (index === -1) return null;
  db.items[index] = { id: parseInt(id), ...item };
  writeDb(db);
  return db.items[index];
}

function remove(id) {
  const db = readDb();
  const index = db.items.findIndex(i => i.id === parseInt(id));
  if (index === -1) return null;
  const deleted = db.items.splice(index, 1)[0];
  writeDb(db);
  return deleted;
}

function getFiltered({ search, sort, order, page, limit }) {
  const db = readDb();
  let items = db.items;

  if (search) {
    const s = search.toLowerCase();
    items = items.filter(item => item.name.toLowerCase().includes(s));
  }

  if (sort === 'name') {
    items.sort((a, b) => {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();
      if (order === 'desc') return nameB.localeCompare(nameA);
      return nameA.localeCompare(nameB);
    });
  }

  const total = items.length;
  const startIndex = (page - 1) * limit;
  const paginatedItems = items.slice(startIndex, startIndex + limit);

  return { items: paginatedItems, total };
}

module.exports = { getAll, getById, create, update, remove, getFiltered };