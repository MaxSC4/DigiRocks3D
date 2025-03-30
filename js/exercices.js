const container = document.getElementById("exercicesContainer");

fetch("../data/exercices.json")
  .then(res => res.json())
  .then(data => {
    const { parcours = [], exercices = [] } = data;

    // 🎯 Afficher les parcours
    if (parcours.length > 0) {
      const parcoursSection = document.createElement("section");
      parcoursSection.innerHTML = "<h2>🎯 Parcours disponibles</h2>";

      parcours.forEach(p => {
        const card = document.createElement("div");
        card.className = "exo-card";
        card.innerHTML = `
          <h3>${p.titre}</h3>
          <button onclick="location.href='parcours.html?id=${p.id}'">🚀 Commencer</button>
        `;
        parcoursSection.appendChild(card);
      });

      container.appendChild(parcoursSection);
    }

    // 📘 Afficher les exercices simples
    if (!Array.isArray(exercices) || exercices.length === 0) {
      container.innerHTML += "<p>Aucun exercice disponible pour le moment.</p>";
      return;
    }

    const exercicesSection = document.createElement("section");
    exercicesSection.innerHTML = "<h2>📘 Exercices individuels</h2>";

    exercices.forEach(exo => {
      const card = document.createElement("div");
      card.className = "exo-card";
      card.innerHTML = `
        <h3>${exo.titre}</h3>
        <p>${exo.question}</p>
        <button onclick="location.href='exercices/exo.html?id=${exo.id}'">▶️ Commencer</button>
      `;
      exercicesSection.appendChild(card);
    });

    container.appendChild(exercicesSection);
  })
  .catch(err => {
    console.error("Erreur de chargement des exercices :", err);
    container.innerHTML = "<p>Erreur de chargement des exercices.</p>";
  });
