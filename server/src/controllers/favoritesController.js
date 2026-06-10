const { query } = require('../config/db');

const listFavorites = async (req, res) => {
    const result = await query(
        'SELECT id, recipe_id, title, image, saved_at FROM favorites WHERE user_id = $1 ORDER BY saved_at DESC',
        [req.user.id]
    );
    res.json(result.rows);
};

const addFavorite = async (req, res) => {
    const { recipeId, title, image } = req.body;
    try {
        await query(
            'INSERT INTO favorites (user_id, recipe_id, title, image) VALUES ($1, $2, $3, $4)',
            [req.user.id, recipeId, title, image]
        );
        res.status(201).json({ message: 'Added to favorites' });
    } catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({ error: 'Already in favorites' });
        }
        res.status(400).json({ error: 'Invalid favorite data' });
    }
};

const removeFavorite = async (req, res) => {
    await query('DELETE FROM favorites WHERE user_id = $1 AND recipe_id = $2', [
        req.user.id,
        req.params.recipeId,
    ]);
    res.json({ message: 'Removed from favorites' });
};

module.exports = { listFavorites, addFavorite, removeFavorite };
