const express = require('express');
const router = express.Router();
const store = require('./store');

router.get('/items', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const search = req.query.search || '';
  const sort = req.query.sort || '';
  const order = req.query.order || 'asc';

  const { items, total } = store.getFiltered({ search, sort, order, page, limit });
  const totalPages = Math.ceil(total / limit);

  res.json({ items, total, page, limit, totalPages });
});

router.get('/items/:id', (req, res) => {
  const item = store.getById(req.params.id);
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json(item);
});

router.post('/items', (req, res) => {
  const newItem = store.create(req.body);
  res.status(201).json(newItem);
});

router.put('/items/:id', (req, res) => {
  const updated = store.update(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Not found' });
  res.json(updated);
});

router.delete('/items/:id', (req, res) => {
  const deleted = store.remove(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Not found' });
  res.json({ message: 'Deleted' });
});

module.exports = router;