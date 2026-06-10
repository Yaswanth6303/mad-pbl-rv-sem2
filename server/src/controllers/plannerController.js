const { query } = require('../config/db');

const listMeals = async (req, res) => {
    const result = await query(
        'SELECT id, recipe_id, title, image, planned_date, meal_type FROM meal_planner WHERE user_id = $1 ORDER BY planned_date',
        [req.user.id]
    );
    res.json(result.rows);
};

const addMeal = async (req, res) => {
    const { recipeId, title, image, date, mealType } = req.body;
    await query(
        `INSERT INTO meal_planner (user_id, recipe_id, title, image, planned_date, meal_type)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [req.user.id, recipeId, title, image, date, mealType]
    );
    res.status(201).json({ message: 'Meal planned' });
};

const removeMeal = async (req, res) => {
    await query('DELETE FROM meal_planner WHERE user_id = $1 AND id = $2', [
        req.user.id,
        req.params.id,
    ]);
    res.json({ message: 'Meal removed' });
};

module.exports = { listMeals, addMeal, removeMeal };
