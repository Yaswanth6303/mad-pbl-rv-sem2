const { query } = require('../config/db');

const listHistory = async (req, res) => {
    const result = await query(
        'SELECT id, query, searched_at FROM search_history WHERE user_id = $1 ORDER BY searched_at DESC LIMIT 10',
        [req.user.id]
    );
    res.json(result.rows);
};

const addHistory = async (req, res) => {
    const { query: searchQuery } = req.body;
    if (!searchQuery) return res.status(400).json({ error: 'query is required' });
    await query('INSERT INTO search_history (user_id, query) VALUES ($1, $2)', [
        req.user.id,
        searchQuery,
    ]);
    res.status(201).json({ message: 'History saved' });
};

module.exports = { listHistory, addHistory };
