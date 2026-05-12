// Home page controller: search, filter, render recipe grid.
(function () {
  const searchForm = document.getElementById("searchForm");
  const searchInput = document.getElementById("searchInput");
  const categoryFilter = document.getElementById("categoryFilter");
  const ingredientInput = document.getElementById("ingredientInput");
  const ingredientBtn = document.getElementById("ingredientBtn");
  const resetBtn = document.getElementById("resetBtn");
  const grid = document.getElementById("recipeGrid");
  const loader = document.getElementById("loader");
  const errorMsg = document.getElementById("errorMsg");
  const resultsTitle = document.getElementById("resultsTitle");

  function setLoading(on) {
    loader.classList.toggle("d-none", !on);
    if (on) {
      grid.innerHTML = "";
      errorMsg.classList.add("d-none");
    }
  }

  function showError(msg) {
    errorMsg.textContent = msg;
    errorMsg.classList.remove("d-none");
  }

  function recipeCardHTML(meal) {
    const isFav = FavStore.has(meal.idMeal);
    const area = meal.strArea ? `<span class="badge badge-area">${meal.strArea}</span>` : "";
    const category = meal.strCategory ? `<span class="badge bg-light text-dark border ms-1">${meal.strCategory}</span>` : "";
    return `
      <div class="col-sm-6 col-md-4 col-lg-3">
        <div class="recipe-card position-relative" data-id="${meal.idMeal}">
          <button class="fav-btn-card" data-fav-id="${meal.idMeal}" aria-label="Save favorite">
            <i class="bi ${isFav ? "bi-heart-fill" : "bi-heart"}"></i>
          </button>
          <div class="card-img-wrap">
            <img src="${meal.strMealThumb}" alt="${meal.strMeal}" loading="lazy" />
          </div>
          <div class="card-body">
            <h3 class="card-title">${meal.strMeal}</h3>
            <div>${area}${category}</div>
          </div>
        </div>
      </div>
    `;
  }

  function renderRecipes(meals, title) {
    resultsTitle.textContent = title;
    if (!meals || meals.length === 0) {
      grid.innerHTML = "";
      showError("No recipes found. Try a different search.");
      return;
    }
    grid.innerHTML = meals.map(recipeCardHTML).join("");
    attachCardHandlers(meals);
  }

  function attachCardHandlers(meals) {
    const lookup = new Map(meals.map(m => [m.idMeal, m]));
    grid.querySelectorAll(".recipe-card").forEach(card => {
      card.addEventListener("click", (e) => {
        if (e.target.closest(".fav-btn-card")) return;
        const id = card.dataset.id;
        window.location.href = `html/detail.html?id=${id}`;
      });
    });
    grid.querySelectorAll(".fav-btn-card").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = btn.dataset.favId;
        const meal = lookup.get(id);
        if (!meal) return;
        const nowSaved = FavStore.toggle(meal);
        btn.querySelector("i").className = `bi ${nowSaved ? "bi-heart-fill" : "bi-heart"}`;
      });
    });
  }

  async function loadCategories() {
    try {
      const cats = await RecipeAPI.getCategories();
      cats.forEach(c => {
        const opt = document.createElement("option");
        opt.value = c.strCategory;
        opt.textContent = c.strCategory;
        categoryFilter.appendChild(opt);
      });
    } catch (err) {
      console.warn("Could not load categories:", err);
    }
  }

  async function loadInitial() {
    setLoading(true);
    try {
      const meals = await RecipeAPI.getRandomSelection(8);
      renderRecipes(meals, "Popular Recipes");
    } catch (err) {
      showError("Could not load recipes. Check your internet connection.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch(e) {
    e.preventDefault();
    const q = searchInput.value.trim();
    if (!q) return loadInitial();
    setLoading(true);
    try {
      const meals = await RecipeAPI.searchByName(q);
      renderRecipes(meals, `Results for "${q}"`);
    } catch (err) {
      showError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCategoryChange() {
    const cat = categoryFilter.value;
    if (!cat) return loadInitial();
    setLoading(true);
    try {
      const meals = await RecipeAPI.filterByCategory(cat);
      renderRecipes(meals, `Category: ${cat}`);
    } catch (err) {
      showError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleIngredientFilter() {
    const ing = ingredientInput.value.trim();
    if (!ing) return;
    setLoading(true);
    try {
      const meals = await RecipeAPI.filterByIngredient(ing);
      renderRecipes(meals, `Recipes with "${ing}"`);
    } catch (err) {
      showError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    searchInput.value = "";
    categoryFilter.value = "";
    ingredientInput.value = "";
    loadInitial();
  }

  searchForm.addEventListener("submit", handleSearch);
  categoryFilter.addEventListener("change", handleCategoryChange);
  ingredientBtn.addEventListener("click", handleIngredientFilter);
  ingredientInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") { e.preventDefault(); handleIngredientFilter(); }
  });
  resetBtn.addEventListener("click", reset);

  loadCategories();
  loadInitial();
})();
