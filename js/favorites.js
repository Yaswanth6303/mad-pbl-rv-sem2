// Favorites page: render saved recipes from localStorage.
(function () {
  const grid = document.getElementById("favoritesGrid");
  const emptyState = document.getElementById("emptyState");

  function cardHTML(meal) {
    const area = meal.strArea
      ? `<span class="badge badge-area">${meal.strArea}</span>`
      : "";
    const category = meal.strCategory
      ? `<span class="badge bg-light text-dark border ms-1">${meal.strCategory}</span>`
      : "";
    return `
      <div class="col-sm-6 col-md-4 col-lg-3">
        <div class="recipe-card position-relative" data-id="${meal.idMeal}">
          <button class="fav-btn-card" data-remove-id="${meal.idMeal}" aria-label="Remove favorite">
            <i class="bi bi-heart-fill"></i>
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

  function render() {
    const favs = FavStore.getAll();
    if (favs.length === 0) {
      grid.innerHTML = "";
      emptyState.classList.remove("d-none");
      return;
    }
    emptyState.classList.add("d-none");
    grid.innerHTML = favs.map(cardHTML).join("");

    grid.querySelectorAll(".recipe-card").forEach((card) => {
      card.addEventListener("click", (e) => {
        if (e.target.closest(".fav-btn-card")) return;
        window.location.href = `detail.html?id=${card.dataset.id}`;
      });
    });
    grid.querySelectorAll(".fav-btn-card").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        FavStore.remove(btn.dataset.removeId);
        render();
      });
    });
  }

  render();
})();
