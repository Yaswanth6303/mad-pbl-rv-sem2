/**
 * RecipeVerse Grocery List Module
 */

const Grocery = {
    items: [],

    init: async () => {
        if (!Auth.isAuthenticated()) return;
        try {
            const res = await fetch('/api/user/grocery', {
                headers: { 'Authorization': `Bearer ${Utils.getToken()}` }
            });
            Grocery.items = await res.json();
            // If we are on a planner or dashboard page where grocery container exists, render it
            const container = document.getElementById('grocery-list-container');
            if (container) Grocery.render();
        } catch (err) {
            console.error('Grocery load error:', err);
        }
    },

    generateFromPlanner: async () => {
        App.showLoader();
        try {
            // 1. Get all planned recipes
            if (Planner.meals.length === 0) {
                Utils.showToast('No meals in planner yet!', 'warning');
                return;
            }

            // 2. Fetch full details for each unique recipe if not in cache
            const ingredients = [];
            for (const meal of Planner.meals) {
                let data = await IndexedDB.getCachedRecipe(meal.recipe_id);
                if (!data) {
                    const res = await fetch(`/api/recipes/${meal.recipe_id}/information`);
                    data = await res.json();
                    await IndexedDB.cacheRecipe(data);
                }
                
                if (data.extendedIngredients) {
                    data.extendedIngredients.forEach(ing => {
                        ingredients.push({
                            name: ing.name.toLowerCase(),
                            amount: ing.amount,
                            unit: ing.unit,
                            recipeId: meal.recipe_id
                        });
                    });
                }
            }

            // 3. Aggregate duplicates
            const aggregated = ingredients.reduce((acc, current) => {
                const existing = acc.find(item => item.name === current.name && item.unit === current.unit);
                if (existing) {
                    existing.amount += current.amount;
                } else {
                    acc.push(current);
                }
                return acc;
            }, []);

            // 4. Save to Backend
            await fetch('/api/user/grocery', {
                method: 'DELETE', // Clear old list first
                headers: { 'Authorization': `Bearer ${Utils.getToken()}` }
            });

            await fetch('/api/user/grocery', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${Utils.getToken()}`
                },
                body: JSON.stringify({ items: aggregated })
            });

            Utils.showToast('Grocery list generated from planner!', 'success');
            await Grocery.init();
        } catch (err) {
            console.error('Generation error:', err);
            Utils.showToast('Failed to generate grocery list', 'error');
        } finally {
            App.hideLoader();
        }
    },

    render: () => {
        const container = document.getElementById('grocery-list-container');
        if (!container) return;

        container.innerHTML = `
            <div style="background:white; padding:30px; border-radius:var(--radius-lg); box-shadow:var(--shadow); margin-top:40px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:25px;">
                    <h2 style="font-size:1.8rem;">Grocery List</h2>
                    <div style="display:flex; gap:10px;">
                        <button onclick="Grocery.printList()" class="btn btn-outline btn-sm">Print</button>
                        <button onclick="Grocery.clearList()" class="btn btn-secondary btn-sm" style="color:var(--secondary);">Clear All</button>
                    </div>
                </div>
                
                <div id="addItemRow" style="display:flex; gap:10px; margin-bottom:20px;">
                    <input type="text" id="manual-item-name" class="search-input" placeholder="Add manual item..." style="flex:1; padding:10px 20px; border:1px solid #ddd;">
                    <button onclick="Grocery.addManualItem()" class="btn btn-primary">Add</button>
                </div>

                <ul style="list-style:none;">
                    ${Grocery.items.map(item => `
                        <li style="display:flex; align-items:center; gap:15px; padding:15px 0; border-bottom:1px solid #f5f5f5;">
                            <input type="checkbox" ${item.is_completed ? 'checked' : ''} 
                                   onchange="Grocery.toggleItem(${item.id}, this.checked)"
                                   style="width:20px; height:20px; cursor:pointer; accent-color:var(--primary);">
                            <span style="flex:1; font-weight:600; ${item.is_completed ? 'text-decoration:line-through; color:var(--text-muted);' : ''}">
                                ${Math.round(item.amount * 10) / 10} ${item.unit} ${item.item_name}
                            </span>
                            <button onclick="Grocery.removeItem(${item.id})" style="background:none; border:none; color:var(--text-muted); cursor:pointer;">&times;</button>
                        </li>
                    `).join('') || '<p style="text-align:center; color:var(--text-muted); padding:20px;">Your grocery list is empty.</p>'}
                </ul>
            </div>
        `;
    },

    toggleItem: async (id, completed) => {
        try {
            await fetch(`/api/user/grocery/${id}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${Utils.getToken()}`
                },
                body: JSON.stringify({ is_completed: completed })
            });
            const item = Grocery.items.find(i => i.id === id);
            if (item) item.is_completed = completed ? 1 : 0;
            Grocery.render();
        } catch (err) {
            console.error(err);
        }
    },

    removeItem: async (id) => {
        try {
            await fetch(`/api/user/grocery/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${Utils.getToken()}` }
            });
            Grocery.items = Grocery.items.filter(i => i.id !== id);
            Grocery.render();
        } catch (err) {
            console.error(err);
        }
    },

    addManualItem: async () => {
        const input = document.getElementById('manual-item-name');
        const name = input.value.trim();
        if (!name) return;

        try {
            const res = await fetch('/api/user/grocery/item', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${Utils.getToken()}`
                },
                body: JSON.stringify({ name, amount: 1, unit: 'pcs' })
            });
            if (!res.ok) throw new Error('Failed to add item');
            input.value = '';
            await Grocery.init();
        } catch (err) {
            Utils.showToast(err.message, 'error');
        }
    },

    clearList: async () => {
        if (!confirm('Clear your entire grocery list?')) return;
        try {
            await fetch('/api/user/grocery', {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${Utils.getToken()}` }
            });
            Grocery.items = [];
            Grocery.render();
        } catch (err) {
            console.error(err);
        }
    },

    printList: () => {
        const printContent = `
            <h2>RecipeVerse Grocery List</h2>
            <hr>
            <ul>
                ${Grocery.items.map(i => `<li>[ ${i.is_completed ? 'x' : ' '} ] ${i.amount} ${i.unit} ${i.item_name}</li>`).join('')}
            </ul>
        `;
        const win = window.open('', '_blank');
        win.document.write(`<html><head><title>Grocery List</title></head><body>${printContent}</body></html>`);
        win.document.close();
        win.print();
    }
};

window.Grocery = Grocery;
window.addEventListener('load', () => Grocery.init());
