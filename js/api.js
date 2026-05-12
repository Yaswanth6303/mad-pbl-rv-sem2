// TheMealDB API wrapper - free public API, no auth needed.
const API_BASE = "https://www.themealdb.com/api/json/v1/1";

const RecipeAPI = {
  async searchByName(name) {
    const res = await fetch(`${API_BASE}/search.php?s=${encodeURIComponent(name)}`);
    if (!res.ok) throw new Error("Network error while searching");
    const data = await res.json();
    return data.meals || [];
  },

  async filterByCategory(category) {
    const res = await fetch(`${API_BASE}/filter.php?c=${encodeURIComponent(category)}`);
    if (!res.ok) throw new Error("Network error while filtering by category");
    const data = await res.json();
    return data.meals || [];
  },

  async filterByIngredient(ingredient) {
    const res = await fetch(`${API_BASE}/filter.php?i=${encodeURIComponent(ingredient)}`);
    if (!res.ok) throw new Error("Network error while filtering by ingredient");
    const data = await res.json();
    return data.meals || [];
  },

  async getById(id) {
    const res = await fetch(`${API_BASE}/lookup.php?i=${encodeURIComponent(id)}`);
    if (!res.ok) throw new Error("Network error while loading recipe");
    const data = await res.json();
    return (data.meals && data.meals[0]) || null;
  },

  async getCategories() {
    const res = await fetch(`${API_BASE}/categories.php`);
    if (!res.ok) throw new Error("Network error while loading categories");
    const data = await res.json();
    return data.categories || [];
  },

  async getRandomSelection(count = 8) {
    const calls = Array.from({ length: count }, () =>
      fetch(`${API_BASE}/random.php`).then(r => r.json())
    );
    const results = await Promise.all(calls);
    const meals = results.map(r => r.meals && r.meals[0]).filter(Boolean);
    // de-dup by idMeal
    const seen = new Set();
    return meals.filter(m => {
      if (seen.has(m.idMeal)) return false;
      seen.add(m.idMeal);
      return true;
    });
  },

  // Extracts ingredient/measure pairs from a meal object (TheMealDB stores them
  // as strIngredient1..20 and strMeasure1..20).
  parseIngredients(meal) {
    const items = [];
    for (let i = 1; i <= 20; i++) {
      const ing = (meal[`strIngredient${i}`] || "").trim();
      const measure = (meal[`strMeasure${i}`] || "").trim();
      if (ing) items.push({ ingredient: ing, measure });
    }
    return items;
  },

  parseInstructions(meal) {
    const raw = (meal.strInstructions || "").trim();
    if (!raw) return [];
    // Split by newlines first; fall back to sentence split for one-paragraph entries.
    let steps = raw.split(/\r?\n+/).map(s => s.trim()).filter(Boolean);
    if (steps.length <= 1) {
      steps = raw.split(/(?<=[.!?])\s+(?=[A-Z])/).map(s => s.trim()).filter(Boolean);
    }
    return steps;
  }
};
