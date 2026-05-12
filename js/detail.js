// Recipe detail page: load full recipe by id from query string, render
// ingredients & step-by-step instructions, handle favorite toggle.
// Immediately Invoked Function Expression
(function () {
  const loader = document.getElementById("loader");
  const errorMsg = document.getElementById("errorMsg");
  const content = document.getElementById("recipeContent");
  const imageEl = document.getElementById("recipeImage");
  const titleEl = document.getElementById("recipeTitle");
  const categoryEl = document.getElementById("recipeCategory");
  const areaEl = document.getElementById("recipeArea");
  const youtubeWrap = document.getElementById("youtubeWrap");
  const youtubeLink = document.getElementById("recipeYoutube");
  const ingredientsList = document.getElementById("ingredientsList");
  const instructionsList = document.getElementById("instructionsList");
  const favBtn = document.getElementById("favBtn");

  function showError(msg) {
    loader.classList.add("d-none");
    errorMsg.textContent = msg;
    errorMsg.classList.remove("d-none");
  }

  function getIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
  }

  function updateFavBtn(meal) {
    const isFav = FavStore.has(meal.idMeal);
    favBtn.querySelector("i").className =
      `bi ${isFav ? "bi-heart-fill" : "bi-heart"}`;
    favBtn.querySelector("span").textContent = isFav
      ? "Saved to Favorites"
      : "Save to Favorites";
    favBtn.classList.toggle("btn-danger", isFav);
    favBtn.classList.toggle("btn-outline-danger", !isFav);
  }

  function renderRecipe(meal) {
    document.title = `${meal.strMeal} - Recipe Hub`;
    imageEl.src = meal.strMealThumb;
    imageEl.alt = meal.strMeal;
    titleEl.textContent = meal.strMeal;
    categoryEl.textContent = meal.strCategory || "—";
    areaEl.textContent = meal.strArea || "—";

    if (meal.strYoutube) {
      youtubeWrap.style.display = "";
      youtubeLink.href = meal.strYoutube;
    }

    const ingredients = RecipeAPI.parseIngredients(meal);
    ingredientsList.innerHTML = ingredients
      .map(
        ({ ingredient, measure }) => `
      <li class="list-group-item d-flex justify-content-between align-items-center">
        <span><i class="bi bi-check2-circle text-primary-custom"></i> ${ingredient}</span>
        <span class="text-muted">${measure}</span>
      </li>
    `,
      )
      .join("");

    const steps = RecipeAPI.parseInstructions(meal);
    instructionsList.innerHTML = steps.map((s) => `<li>${s}</li>`).join("");

    updateFavBtn(meal);
    favBtn.addEventListener("click", () => {
      FavStore.toggle(meal);
      updateFavBtn(meal);
    });

    loader.classList.add("d-none");
    content.classList.remove("d-none");
  }

  async function init() {
    const id = getIdFromUrl();
    if (!id) {
      showError("No recipe selected. Go back and pick a recipe.");
      return;
    }
    try {
      const meal = await RecipeAPI.getById(id);
      if (!meal) {
        showError("Recipe not found.");
        return;
      }
      renderRecipe(meal);
    } catch (err) {
      showError("Could not load recipe. Check your internet connection.");
    }
  }

  init();
})();
