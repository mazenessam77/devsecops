const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/items — List all items
router.get('/', async (req, res, next) => {
    try {
        const [rows] = await pool.query('SELECT * FROM items ORDER BY created_at DESC');
        res.json({ success: true, data: rows });
    } catch (err) {
        next(err);
    }
});

// GET /api/items/:id — Get single item
router.get('/:id', async (req, res, next) => {
    try {
        const [rows] = await pool.query('SELECT * FROM items WHERE id = ?', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Item not found' });
        }
        res.json({ success: true, data: rows[0] });
    } catch (err) {
        next(err);
    }
});

// POST /api/items — Create item
router.post('/', async (req, res, next) => {
    try {
        const { name, description, price } = req.body;

        if (!name || price === undefined) {
            return res.status(400).json({ success: false, message: 'Name and price are required' });
        }

        const [result] = await pool.query(
            'INSERT INTO items (name, description, price) VALUES (?, ?, ?)',
            [name, description || '', parseFloat(price)]
        );

        const [newItem] = await pool.query('SELECT * FROM items WHERE id = ?', [result.insertId]);
        res.status(201).json({ success: true, data: newItem[0] });
    } catch (err) {
        next(err);
    }
});

// PUT /api/items/:id — Update item
router.put('/:id', async (req, res, next) => {
    try {
        const { name, description, price } = req.body;

        if (!name || price === undefined) {
            return res.status(400).json({ success: false, message: 'Name and price are required' });
        }

        const [result] = await pool.query(
            'UPDATE items SET name = ?, description = ?, price = ? WHERE id = ?',
            [name, description || '', parseFloat(price), req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Item not found' });
        }

        const [updated] = await pool.query('SELECT * FROM items WHERE id = ?', [req.params.id]);
        res.json({ success: true, data: updated[0] });
    } catch (err) {
        next(err);
    }
});

// DELETE /api/items/:id — Delete item
router.delete('/:id', async (req, res, next) => {
    try {
        const [result] = await pool.query('DELETE FROM items WHERE id = ?', [req.params.id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Item not found' });
        }

        res.json({ success: true, message: 'Item deleted successfully' });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
