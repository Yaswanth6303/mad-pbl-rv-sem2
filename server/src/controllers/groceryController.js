const { pool, query } = require('../config/db');

const listItems = async (req, res) => {
    const result = await query(
        'SELECT id, item_name, amount, unit, is_completed, recipe_id, added_at FROM grocery_lists WHERE user_id = $1 ORDER BY added_at DESC',
        [req.user.id]
    );
    res.json(result.rows);
};

const addItems = async (req, res) => {
    const items = req.body.items;
    if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'items must be a non-empty array' });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        for (const item of items) {
            await client.query(
                'INSERT INTO grocery_lists (user_id, item_name, amount, unit, recipe_id) VALUES ($1, $2, $3, $4, $5)',
                [req.user.id, item.name, item.amount, item.unit, item.recipeId || null]
            );
        }
        await client.query('COMMIT');
        res.status(201).json({ message: 'Items added to grocery list' });
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: 'Failed to add items' });
    } finally {
        client.release();
    }
};

const addItem = async (req, res) => {
    const { name, amount, unit } = req.body;
    await query(
        'INSERT INTO grocery_lists (user_id, item_name, amount, unit) VALUES ($1, $2, $3, $4)',
        [req.user.id, name, amount, unit]
    );
    res.status(201).json({ message: 'Item added' });
};

const updateItem = async (req, res) => {
    const { is_completed } = req.body;
    await query(
        'UPDATE grocery_lists SET is_completed = $1 WHERE user_id = $2 AND id = $3',
        [Boolean(is_completed), req.user.id, req.params.id]
    );
    res.json({ message: 'Item updated' });
};

const removeItem = async (req, res) => {
    await query('DELETE FROM grocery_lists WHERE user_id = $1 AND id = $2', [
        req.user.id,
        req.params.id,
    ]);
    res.json({ message: 'Item removed' });
};

const clearList = async (req, res) => {
    await query('DELETE FROM grocery_lists WHERE user_id = $1', [req.user.id]);
    res.json({ message: 'Grocery list cleared' });
};

module.exports = { listItems, addItems, addItem, updateItem, removeItem, clearList };
