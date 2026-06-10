/**
 * RecipeVerse Recommendation Module
 */

const Recommendations = {
    getSuggestions: async () => {
        // Simple logic: If we have favorites, suggest similar cuisines
        if (Favorites.items.length > 0) {
            const lastFav = Favorites.items[Favorites.items.length - 1];
            // Fetch similar recipes based on the last favorited one
            Search.performSearch(lastFav.title.split(' ')[0]);
        } else {
            // Default suggestions
            Search.performSearch('healthy');
        }
    },

    suggestByDiet: (diet) => {
        Utils.showToast(`Finding the best ${diet} recipes for you...`, 'info');
        Search.performSearch(diet);
    }
};

window.Recommendations = Recommendations;
