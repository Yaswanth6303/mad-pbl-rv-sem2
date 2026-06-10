const { query } = require('../config/db');

const getPreferences = async (req, res) => {
    const result = await query(
        'SELECT preferences, avoided_ingredients FROM users WHERE id = $1',
        [req.user.id]
    );
    const row = result.rows[0] || {};
    res.json({
        preferences: row.preferences || {},
        avoidedIngredients: row.avoided_ingredients || [],
    });
};

const updatePreferences = async (req, res) => {
    const { preferences, avoidedIngredients } = req.body;
    await query(
        'UPDATE users SET preferences = $1, avoided_ingredients = $2 WHERE id = $3',
        [preferences || {}, avoidedIngredients || [], req.user.id]
    );
    res.json({ message: 'Preferences updated' });
};

module.exports = { getPreferences, updatePreferences };
