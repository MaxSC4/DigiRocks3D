import * as THREE from './lib/three.module.js';
import { GLTFLoader } from './lib/GLTFLoader.js';
import { OrbitControls } from './lib/OrbitControls.js';

const params = new URLSearchParams(window.location.search);
const parcoursId = params.get('id');

const parcoursTitre = document.getElementById("parcours-titre");
const questionTitre = document.getElementById("question-titre");
const questionTexte = document.getElementById("question-texte");
const form = document.getElementById("reponses-form");
const feedback = document.getElementById("feedback");
const validerBtn = document.getElementById("valider-btn");
const nextBtn = document.getElementById("next-btn");
const navButtons = document.getElementById("nav-buttons");

let currentIndex = 0;
let exercices = [];
let score = 0;

let scene, camera, renderer, controls;

fetch("../data/exercices.json")
  .then(res => res.json())
  .then(data => {
    const parcours = data.parcours.find(p => p.id === parcoursId);
    exercices = parcours.exercices.map(id => data.exercices.find(e => e.id === id));

    if (!exercices || exercices.length === 0) {
      parcoursTitre.textContent = "Parcours introuvable";
      return;
    }

    parcoursTitre.textContent += ` : ${parcours.titre}`;
    chargerExercice();
  });

function chargerExercice() {
  feedback.textContent = "";
  form.innerHTML = "";
  navButtons.classList.add("hidden");
  const exo = exercices[currentIndex];
  questionTitre.textContent = `Question ${currentIndex + 1}`;
  questionTexte.textContent = exo.question;

  exo.reponses.forEach(r => {
    const label = document.createElement("label");
    label.innerHTML = `<input type='radio' name='choix' value="${r.texte}" /> ${r.texte}`;
    form.appendChild(label);
  });

  initViewer(exo.modele, exo.annotation.position);

  validerBtn.onclick = () => {
    const selected = document.querySelector("input[name='choix']:checked");
    if (!selected) {
      feedback.textContent = "Choisissez une réponse.";
      feedback.classList.add("fade-in");
      setTimeout(() => feedback.classList.remove("fade-in"), 500);
      feedback.style.color = "#C60B46";
      return;
    }
    const bonne = exo.reponses.find(r => r.juste)?.texte;
    if (selected.value === bonne) {
      feedback.textContent = "✅ Bonne réponse";
      feedback.classList.add("fade-in");
      setTimeout(() => feedback.classList.remove("fade-in"), 500);
      feedback.style.color = "green";
      score++;
    } else {
      feedback.textContent = `❌ Mauvaise réponse. La bonne était : ${bonne}`;
      feedback.classList.add("fade-in");
      setTimeout(() => feedback.classList.remove("fade-in"), 500);
      feedback.style.color = "#C60B46";
    }
    navButtons.classList.remove("hidden");
    validerBtn.disabled = true;
  };

  nextBtn.onclick = () => {
    currentIndex++;
    if (currentIndex < exercices.length) {
      validerBtn.disabled = false;
      chargerExercice();
    } else {
      enregistrerResultat();
    }
  };

  const questionZone = document.querySelector(".question-zone");
  questionZone.classList.remove("fade-in");
  void questionZone.offsetWidth; // force le reflow pour relancer l'animation
  questionZone.classList.add("fade-in");
}

function enregistrerResultat() {
  const user = JSON.parse(localStorage.getItem("user"));
  const resultats = JSON.parse(localStorage.getItem("resultats") || "{}");

  resultats[parcoursId] = {
    score: score,
    total: exercices.length,
    date: new Date().toLocaleDateString()
  };

  localStorage.setItem("resultats", JSON.stringify(resultats));

  document.querySelector(".parcours-layout").innerHTML = `
    <div class='score-final'>
        <h2>🎉 Parcours terminé !</h2>
        <p>Votre score : <strong>${score} / ${exercices.length}</strong></p>
        <button onclick="location.href='../auth/compte.html'">📂 Voir dans Mon Compte</button>
        <button onclick="location.reload()">🔁 Recommencer ce parcours</button>
    </div>
    `;
}

function initViewer(url, annotationPos) {
  const container = document.getElementById("three-container");
  container.innerHTML = "";
  scene = new THREE.Scene();
  scene.background = new THREE.Color("#f3f4f6");

  camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  const light = new THREE.HemisphereLight(0xffffff, 0x444444, 1.2);
  scene.add(light);

  const pointLight = new THREE.PointLight(0xffffff, 1);
  pointLight.position.set(2, 2, 2);
  scene.add(pointLight);

  const loader = new GLTFLoader();
  loader.load(url, (gltf) => {
    const model = gltf.scene;
    model.scale.set(1.5, 1.5, 1.5);
    scene.add(model);

    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3()).length();
    const center = box.getCenter(new THREE.Vector3());

    model.position.sub(center);
    camera.position.set(size, size, size);
    controls.target.set(0, 0, 0);
    controls.update();

    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.02, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0xC60B46 })
    );
    sphere.position.set(...annotationPos);
    scene.add(sphere);
  });

  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }
  animate();
}
