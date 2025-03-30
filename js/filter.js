const cardsContainer = document.querySelector(".cards");
const searchInput = document.getElementById("searchInput");

let roches = [];
let activeFilters = {
  types: new Set(),
  tps: new Set(),
  cours: new Set()
};

// 1. Charger les données JSON
fetch("data/roches.json")
  .then(res => res.json())
  .then(data => {
    roches = data;
    renderCards(roches);
    initFilters(roches);
    enableSearchFilter();
  });

// 2. Générer les cartes
function renderCards(data) {
    cardsContainer.innerHTML = "";
  
    data.forEach(roche => {
      const card = document.createElement("div");
      card.className = "card";
      card.dataset.type = roche.type;
      card.dataset.tp = roche.tp || "";
      card.dataset.cours = roche.cours || "";
  
      card.innerHTML = `
        <model-viewer 
          src="${roche.modele}" 
          alt="${roche.nom}" 
          auto-rotate 
          disable-zoom 
          camera-controls="false"
          style="width: 100%; height: 180px; background: #f0f0f0; border-radius: 0.75rem; margin-bottom: 1rem;">
        </model-viewer>
        <h3>${roche.nom}</h3>
        <p>${capitalize(roche.type)} – ${roche.cours}</p>
        <a href="fiche.html?id=${roche.id}" class="card-button">Voir</a>
      `;
  
      cardsContainer.appendChild(card);
  
      // animation progressive
      setTimeout(() => {
        card.classList.add("visible");
      }, 10);
    });
  
    updateResultCount(data.length);
}

function updateResultCount(count) {
    const resultCount = document.getElementById("resultCount");
    if (resultCount) {
      resultCount.textContent = `${count} ${count > 1 ? "résultats trouvés" : "résultat trouvé"}`;
    }
}
  
  

// 3. Capitaliser les textes
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// 4. Initialiser les filtres
function initFilters(data) {
  const typeButtons = document.querySelectorAll(".filter-tag[data-group='type']");
  const tpButtons = document.querySelectorAll(".filter-tag[data-group='tp']");
  const coursButtons = document.querySelectorAll(".filter-tag[data-group='cours']");

  const allButtons = [...typeButtons, ...tpButtons, ...coursButtons];

  allButtons.forEach(button => {
    button.addEventListener("click", () => {
      const group = button.dataset.group;
      const value = button.dataset.value;

      // toggle
      if (button.classList.contains("active")) {
        button.classList.remove("active");
        activeFilters[group + "s"].delete(value);
      } else {
        button.classList.add("active");
        activeFilters[group + "s"].add(value);
      }

      filterCards();
    });
  });
}

// 5. Gérer la recherche texte
function enableSearchFilter() {
  searchInput.addEventListener("input", () => {
    filterCards();
  });
}

// 6. Appliquer les filtres combinés
function filterCards() {
    const search = searchInput.value.toLowerCase();
    const allCards = document.querySelectorAll(".card");
  
    let visibleCount = 0;
  
    allCards.forEach(card => {
      const title = card.querySelector("h3").textContent.toLowerCase();
      const type = card.dataset.type;
      const tp = card.dataset.tp;
      const cours = card.dataset.cours;
  
      const matchSearch = title.includes(search);
      const matchType = activeFilters.types.size === 0 || activeFilters.types.has(type);
      const matchTP = activeFilters.tps.size === 0 || activeFilters.tps.has(tp);
      const matchCours = activeFilters.cours.size === 0 || activeFilters.cours.has(cours);
  
      const visible = matchSearch && matchType && matchTP && matchCours;
  
      card.style.display = visible ? "block" : "none";
      if (visible) {
        card.classList.add("visible");
        visibleCount++;
      } else {
        card.classList.remove("visible");
      }
    });
  
    updateResultCount(visibleCount);
}

document.getElementById("resetFilters").addEventListener("click", () => {
    // Vider les filtres
    activeFilters = {
      types: new Set(),
      tps: new Set(),
      cours: new Set()
    };
  
    // Enlever la classe active
    document.querySelectorAll(".filter-tag").forEach(btn => {
      btn.classList.remove("active");
    });
  
    // Vider la recherche
    searchInput.value = "";
  
    // Refiltrer
    filterCards();
});
  


