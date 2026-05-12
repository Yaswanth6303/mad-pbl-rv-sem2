// LocalStorage wrapper for saving favorite recipes.
const FAV_KEY = "recipe-hub:favorites";

const FavStore = {
  getAll() {
    try {
      return JSON.parse(localStorage.getItem(FAV_KEY)) || [];
    } catch {
      return [];
    }
  },

  has(id) {
    return this.getAll().some((r) => r.idMeal === String(id));
  },

  add(meal) {
    const favs = this.getAll();
    if (favs.some((r) => r.idMeal === meal.idMeal)) return;
    favs.push({
      idMeal: meal.idMeal,
      strMeal: meal.strMeal,
      strMealThumb: meal.strMealThumb,
      strCategory: meal.strCategory || "",
      strArea: meal.strArea || "",
    });
    localStorage.setItem(FAV_KEY, JSON.stringify(favs));
  },

  remove(id) {
    const favs = this.getAll().filter((r) => r.idMeal !== String(id));
    localStorage.setItem(FAV_KEY, JSON.stringify(favs));
  },

  toggle(meal) {
    if (this.has(meal.idMeal)) {
      this.remove(meal.idMeal);
      return false;
    }
    this.add(meal);
    return true;
  },
};
