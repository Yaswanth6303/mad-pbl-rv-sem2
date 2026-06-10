const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { SPOONACULAR_KEY } = require('../config/env');

const FALLBACK_PATH = path.join(__dirname, '..', '..', '..', 'client', 'data', 'fallback_recipes.json');

const searchRecipes = async (req, res) => {
    try {
        const { query, cuisine, diet, type, intolerance, excludeIngredients } = req.query;
        const response = await axios.get('https://api.spoonacular.com/recipes/complexSearch', {
            params: {
                apiKey: SPOONACULAR_KEY,
                query,
                cuisine,
                diet,
                type,
                intolerances: intolerance,
                excludeIngredients,
                addRecipeNutrition: true,
                number: 20,
            },
        });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch recipes' });
    }
};

const randomRecipes = async (req, res) => {
    try {
        const response = await axios.get('https://api.spoonacular.com/recipes/random', {
            params: { apiKey: SPOONACULAR_KEY, number: 10 },
        });
        res.json(response.data);
    } catch (error) {
        try {
            if (fs.existsSync(FALLBACK_PATH)) {
                const fallbackData = JSON.parse(fs.readFileSync(FALLBACK_PATH, 'utf8'));
                return res.json({ recipes: fallbackData });
            }
            res.status(500).json({ error: 'Failed to fetch recipes and no fallback found' });
        } catch (e) {
            res.status(500).json({ error: 'Failed to fetch recipes' });
        }
    }
};

const recipeById = async (req, res) => {
    try {
        const response = await axios.get(
            `https://api.spoonacular.com/recipes/${req.params.id}/information`,
            { params: { apiKey: SPOONACULAR_KEY, includeNutrition: true } }
        );
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch recipe details' });
    }
};

module.exports = { searchRecipes, randomRecipes, recipeById };
