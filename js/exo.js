import * as THREE from './lib/three.module.js';
import { GLTFLoader } from './lib/GLTFLoader.js';
import { OrbitControls } from './lib/OrbitControls.js';

const urlParams = new URLSearchParams(window.location.search);
const exerciceId = urlParams.get("id");

const titre = document.getElementById("exo-titre");
const question = document.getElementById("exo-question");
const form = document.getElementById("reponses-form");
const feedback = document.getElementById("feedback");
const validerBtn = document.getElementById("valider-btn");

let bonneReponse = "";

fetch("data/exercices.json")
  .then(res => res.json())
  .then(data => {
    const exo = data.find(e => e.id === exerciceId);
    if (!exo) {
      titre.textContent = "Exercice introuvable";
      return;
    }

    titre.textContent = exo.titre;
    question.textContent = exo.question;
    bonneReponse = exo.reponses.find(r => r.juste)?.texte;

    exo.reponses.forEach((r, i) => {
      const label = document.createElement("label");
      label.innerHTML = `<input type='radio' name='choix' value="${r.texte}" /> ${r.texte}`;
      form.appendChild(label);
    });

    initViewer(exo.modele, exo.annotation.position);

    validerBtn.addEventListener("click", () => {
      const selected = document.querySelector("input[name='choix']:checked");
      if (!selected) {
        feedback.textContent = "Veuillez choisir une réponse.";
        feedback.style.color = "#C60B46";
        return;
      }
      if (selected.value === bonneReponse) {
        feedback.textContent = "✅ Bonne réponse !";
        feedback.style.color = "green";
      } else {
        feedback.textContent = `❌ Faux. La bonne réponse était : ${bonneReponse}`;
        feedback.style.color = "#C60B46";
      }
    });
  });

function initViewer(modelURL, annotationPos) {
  const container = document.getElementById("three-container");
  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#f3f4f6");

  const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  const light = new THREE.HemisphereLight(0xffffff, 0x444444, 1.2);
  scene.add(light);

  const pointLight = new THREE.PointLight(0xffffff, 1);
  pointLight.position.set(2, 2, 2);
  scene.add(pointLight);

  const loader = new GLTFLoader();
  loader.load(modelURL, (gltf) => {
    const model = gltf.scene;
    model.scale.set(1.5, 1.5, 1.5);
    scene.add(model);

    // Centrage
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3()).length();
    const center = box.getCenter(new THREE.Vector3());
    model.position.sub(center);
    camera.position.set(size, size, size);
    controls.target.set(0, 0, 0);

    // Annotation visible
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
