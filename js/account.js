document.addEventListener("DOMContentLoaded", () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      alert("Vous devez être connecté.");
      window.location.href = "login.html";
      return;
    }

  
    // 🧾 Infos utilisateur
    document.getElementById("nom").textContent = user.nom;
    document.getElementById("prenom").textContent = user.prenom;
    document.getElementById("email").textContent = user.email;
    document.getElementById("role").textContent = user.role;
  
    if (user.annee) {
      document.getElementById("annee").textContent = user.annee;
      document.getElementById("annee-field").classList.remove("hidden");
    }
  
    // ⭐ Favoris (simulé depuis localStorage)
    const favoris = JSON.parse(localStorage.getItem("favoris") || "[]");
    const favList = document.getElementById("favoris-list");
    if (favoris.length === 0) favList.innerHTML = "<li>Aucun favori</li>";
    else favoris.forEach(fav => {
      const li = document.createElement("li");
      li.innerHTML = `<a href='../fiche.html?id=${fav.id}'>${fav.nom}</a>`;
      favList.appendChild(li);
    });
  
    // ⏱️ Récentes (simulé depuis localStorage)
    const recentes = JSON.parse(localStorage.getItem("recentes") || "[]");
    const recList = document.getElementById("recentes-list");
    if (recentes.length === 0) recList.innerHTML = "<li>Aucune consultation récente</li>";
    else recentes.slice(0, 5).forEach(item => {
      const li = document.createElement("li");
      li.innerHTML = `<a href='../fiche.html?id=${item.id}'>${item.nom}</a>`;
      recList.appendChild(li);
    });

    // Résultats de parcours
    const resultats = JSON.parse(localStorage.getItem("resultats") || "{}");
    const resultatsSection = document.createElement("section");
    resultatsSection.className = "card";
    
    resultatsSection.innerHTML = "<h2>📊 Résultats des parcours</h2>";
    
    const resultatsList = document.createElement("ul");
    
    if (Object.keys(resultats).length === 0) {
      resultatsList.innerHTML = "<li>Aucun résultat enregistré</li>";
    } else {
      Object.entries(resultats).forEach(([id, r]) => {
        const li = document.createElement("li");
        li.textContent = `${id} : ${r.score} / ${r.total} (${r.date})`;
        resultatsList.appendChild(li);
      });
    }
    
    resultatsSection.appendChild(resultatsList);
    document.querySelector(".dashboard").appendChild(resultatsSection);
    
  
    // 🎓 Si enseignant : activer panel
    if (user.role === "enseignant") {
      const enseignantSection = document.getElementById("enseignant-section");
      enseignantSection.classList.remove("hidden");
  
      // 🔍 Charger les roches de cet enseignant (depuis localStorage pour test)
      const roches = JSON.parse(localStorage.getItem("allRoches") || "[]");
      const list = document.getElementById("mes-roches");
  
      const mes = roches.filter(r => r.auteur?.email === user.email);
      if (mes.length === 0) list.innerHTML = "<li>Aucune roche enregistrée</li>";
      else mes.forEach(r => {
        const li = document.createElement("li");
        li.innerHTML = `<a href='../fiche.html?id=${r.id}'>${r.nom}</a> <button class='delete-btn' data-id='${r.id}'>🗑️</button>`;
        list.appendChild(li);
      });
  
      // Supprimer une roche (en local seulement)
      list.addEventListener("click", (e) => {
        if (e.target.classList.contains("delete-btn")) {
          const id = e.target.dataset.id;
          const updated = roches.filter(r => r.id !== id);
          localStorage.setItem("allRoches", JSON.stringify(updated));
          location.reload();
        }
      });
    }
  });
