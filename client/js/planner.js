/**
 * RecipeVerse Meal Planner Module
 */

const Planner = {
    meals: [],

    init: async () => {
        const container = document.getElementById('main-content');
        if (!container) return;

        App.showLoader();
        try {
            const res = await fetch('/api/user/planner', {
                headers: { 'Authorization': `Bearer ${Utils.getToken()}` }
            });
            Planner.meals = await res.json();
            Planner.renderUI();
        } catch (err) {
            console.error('Planner load error:', err);
            Utils.showToast('Failed to load your planner', 'error');
        } finally {
            App.hideLoader();
        }
    },

    renderUI: () => {
        const container = document.getElementById('main-content');
        if (!container) return;

        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const types = ['Breakfast', 'Lunch', 'Dinner'];

        container.innerHTML = `
            <div class="planner-container fade-in container" style="padding-top:60px;">
                <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:40px;">
                    <div>
                        <h1 style="font-size:2.5rem; margin-bottom:10px;">Meal Planner</h1>
                        <p style="color:var(--text-muted);">Organize your week and eat healthy!</p>
                    </div>
                    <button onclick="Grocery.generateFromPlanner()" class="btn btn-primary">🛒 Generate Grocery List</button>
                </div>

                <div class="planner-grid">
                    ${days.map(day => `
                        <div class="recipe-card day-card" style="padding:15px; border-radius:var(--radius-md);">
                            <h3 style="text-align:center; padding-bottom:10px; margin-bottom:10px; border-bottom:1px solid #eee;">${day}</h3>
                            <div class="meals-for-day">
                                ${types.map(type => {
                                    const meal = Planner.meals.find(m => m.planned_date === day && m.meal_type === type);
                                    return `
                                        <div class="meal-slot" 
                                             style="${meal ? 'background:white; border-style:solid; border-color:var(--primary); color:var(--text-main);' : ''}"
                                             onclick="${meal ? `App.navigate('/recipe/${meal.recipe_id}')` : `Utils.showToast('Go to a recipe to add it here!', 'info')`}">
                                            <div style="font-size:0.7rem; font-weight:800; color:var(--primary); text-transform:uppercase;">${type}</div>
                                            ${meal ? `
                                                <div style="font-weight:700; margin-top:4px; display:flex; justify-content:space-between; align-items:flex-start;">
                                                    <span style="flex:1;">${meal.title}</span>
                                                    <button onclick="event.stopPropagation(); Planner.removeMeal(${meal.id})" style="background:none; border:none; color:var(--secondary); cursor:pointer; font-size:1rem; padding:0 0 0 5px;">&times;</button>
                                                </div>
                                            ` : '➕ Add Meal'}
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>

                <div id="grocery-list-container">
                    <!-- Grocery list will be injected here if it exists -->
                </div>
            </div>
        `;
        // Load grocery list after rendering container
        Grocery.render();
    },

    showAddModal: (recipeId) => {
        if (!Auth.isAuthenticated()) return App.redirectToLogin();
        
        const modal = document.createElement('div');
        modal.className = 'modal-overlay fade-in';
        modal.id = 'planner-modal';
        
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const types = ['Breakfast', 'Lunch', 'Dinner'];
        
        modal.innerHTML = `
            <div class="modal-content" style="max-width:400px;">
                <button class="modal-close" onclick="document.getElementById('planner-modal').remove()">&times;</button>
                <h2 style="margin-bottom:10px;">Plan this Meal</h2>
                <p style="color:var(--text-muted); margin-bottom:25px;">When would you like to cook this?</p>
                
                <div style="margin-bottom:20px;">
                    <label style="display:block; margin-bottom:8px; font-weight:700;">Select Day</label>
                    <select id="plan-day" class="search-input" style="border:1px solid #ddd; padding:12px 20px;">
                        ${days.map(d => `<option value="${d}">${d}</option>`).join('')}
                    </select>
                </div>
                
                <div style="margin-bottom:30px;">
                    <label style="display:block; margin-bottom:8px; font-weight:700;">Meal Type</label>
                    <select id="plan-type" class="search-input" style="border:1px solid #ddd; padding:12px 20px;">
                        ${types.map(t => `<option value="${t}">${t}</option>`).join('')}
                    </select>
                </div>
                
                <button onclick="Planner.addMeal(${recipeId})" class="btn btn-primary w-full" style="width:100%;">Save to Planner</button>
            </div>
        `;
        document.body.appendChild(modal);
    },

    addMeal: async (recipeId) => {
        const day = document.getElementById('plan-day').value;
        const type = document.getElementById('plan-type').value;
        const recipe = Detail.currentRecipe;

        try {
            const res = await fetch('/api/user/planner', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${Utils.getToken()}`
                },
                body: JSON.stringify({
                    recipeId: recipe.id,
                    title: recipe.title,
                    image: recipe.image,
                    date: day,
                    mealType: type
                })
            });

            if (!res.ok) throw new Error('Failed to plan meal');
            
            Utils.showToast('Meal added to your planner!', 'success');
            document.getElementById('planner-modal').remove();
            
            // Notification reminder if local exists
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('Recipe Planned!', {
                    body: `You scheduled ${recipe.title} for ${day}.`,
                    icon: recipe.image
                });
            }
        } catch (err) {
            Utils.showToast(err.message, 'error');
        }
    },

    removeMeal: async (id) => {
        if (!confirm('Remove this meal from your planner?')) return;
        
        try {
            const res = await fetch(`/api/user/planner/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${Utils.getToken()}` }
            });

            if (!res.ok) throw new Error('Failed to remove meal');
            
            Utils.showToast('Meal removed', 'info');
            Planner.meals = Planner.meals.filter(m => m.id !== id);
            Planner.renderUI();
        } catch (err) {
            Utils.showToast(err.message, 'error');
        }
    }
};

window.Planner = Planner;
