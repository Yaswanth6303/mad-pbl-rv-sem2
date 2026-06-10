/**
 * RecipeVerse Utilities Module
 */

const Utils = {
    // Debounce function to limit API calls
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Format numbers with commas (e.g. calories)
    formatNum: (num) => new Intl.NumberFormat().format(num),

    // Save to LocalStorage
    saveToken: (token) => localStorage.setItem('rv_token', token),
    getToken: () => localStorage.getItem('rv_token'),
    removeToken: () => localStorage.removeItem('rv_token'),

    // Toast Notifications
    showToast: (message, type = 'info') => {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type} fade-in`;
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    },

    // Regex Timer Detector
    // /(\d+)\s*(min|mins|minutes|hour|hours)/g
    detectTimers: (text) => {
        const regex = /(\d+)\s*(min|mins|minutes|hour|hours)/gi;
        return text.replace(regex, (match, val, unit) => {
            let minutes = parseInt(val);
            if (unit.toLowerCase().startsWith('hour')) minutes *= 60;
            return `<button class="timer-btn" data-minutes="${minutes}">${match} ⏱️</button>`;
        });
    },

    // Smart Ranking Algorithm
    // score = (usedIngredients * 3) - (missingIngredients * 5) + (likes * 0.5) + (healthScore * 2)
    rankRecipes: (recipes) => {
        return recipes.map(r => {
            const used = r.usedIngredientCount || 0;
            const missing = r.missedIngredientCount || 0;
            const likes = r.aggregateLikes || 0;
            const health = r.healthScore || 0;
            r.rv_score = (used * 3) - (missing * 5) + (likes * 0.5) + (health * 2);
            return r;
        }).sort((a, b) => b.rv_score - a.rv_score);
    }
};

window.Utils = Utils;
