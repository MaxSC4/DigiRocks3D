import * as THREE from './lib/three.module.js';
import { OrbitControls } from './lib/OrbitControls.js';
import { GLTFLoader } from './lib/GLTFLoader.js';

let scene, camera, renderer, controls;

const params = new URLSearchParams(window.location.search);
const rocheId = params.get('id');
const annotationObjects = [];


fetch('data/roches.json')
  .then(res => res.json())
  .then(roches => {
    const data = roches.find(r => r.id === rocheId);
    if (!data) {
      alert("Roche introuvable !");
      return;
    }

    displayMetadata(data);
    initThree(data.modele, data);
  });

function displayMetadata(data) {
  document.getElementById('nomRoche').textContent = data.nom;
  document.getElementById('typeRoche').textContent = capitalize(data.type);
  document.getElementById('coursRoche').textContent = data.cours;
  document.getElementById('localisationRoche').textContent = data.localisation || "–";
  document.getElementById('tpRoche').textContent = data.tp || "–";
  document.getElementById('analyseRoche').textContent = data.analyses || "–";
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function initThree(modelUrl, userData) {
    // Scène
    scene = new THREE.Scene();
    scene.background = new THREE.Color("#f0f0f0");
  
    // Caméra
    camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camera.position.set(0, 0.5, 2);
  
    // Rendu
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById("three-container").appendChild(renderer.domElement);
  
    // Lumière
    const light = new THREE.HemisphereLight(0xffffff, 0x444444, 1.2);
    scene.add(light);
  
    const pointLight = new THREE.PointLight(0xffffff, 1.2);
    pointLight.position.set(2, 2, 2);
    scene.add(pointLight);
  
    // Contrôles
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
  
    // Modèle
    const loader = new GLTFLoader();
    loader.load(
      modelUrl,
      (gltf) => {
        const model = gltf.scene;
        model.scale.set(1.5, 1.5, 1.5);
        scene.add(model);
  
        // Annotations
        if (userData.annotations) {
          userData.annotations.forEach((annotation) => {
            const sphere = new THREE.Mesh(
              new THREE.SphereGeometry(0.02, 16, 16),
              new THREE.MeshStandardMaterial({ color: 0xc60b46 })
            );
            sphere.position.set(...annotation.position);
            sphere.userData = annotation;
            scene.add(sphere);
            annotationObjects.push(sphere);
          });
        }
      },
      undefined,
      (error) => {
        console.error("Erreur de chargement du modèle :", error);
      }
    );
  
    // Resize
    window.addEventListener("resize", () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  
    // Clicks
    renderer.domElement.addEventListener("click", onClick, false);
  
    // Lancer la boucle
    animate();
}

function onClick(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  
    const mouse = new THREE.Vector2(x, y);
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
  
    const intersects = raycaster.intersectObjects(annotationObjects);
    if (intersects.length > 0) {
      const annotation = intersects[0].object.userData;
      showAnnotationPopup(annotation);
    } else {
      hideAnnotationPopup();
    }
}

function showAnnotationPopup(annotation) {
    const popup = document.getElementById("annotation-popup");
    const label = document.getElementById("annotation-label");
    const content = document.getElementById("annotation-content");
  
    label.textContent = annotation.label;
  
    if (annotation.type === "image") {
      content.innerHTML = `<img src="${annotation.content}" alt="${annotation.label}" />`;
    } else {
      content.textContent = annotation.content;
    }
  
    popup.classList.remove("hidden");
}



function hideAnnotationPopup() {
    const popup = document.getElementById("annotation-popup");
    popup.classList.add("hidden");
}

const popup = document.getElementById("annotation-popup");
const header = document.getElementById("popup-header");

let offsetX, offsetY, isDragging = false;

header.addEventListener("mousedown", (e) => {
  isDragging = true;
  offsetX = e.clientX - popup.offsetLeft;
  offsetY = e.clientY - popup.offsetTop;
});

document.addEventListener("mouseup", () => isDragging = false);

document.addEventListener("mousemove", (e) => {
  if (isDragging) {
    popup.style.left = `${e.clientX - offsetX}px`;
    popup.style.top = `${e.clientY - offsetY}px`;
  }
});

function resetCamera() {
    if (!scene) return;
  
    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3()).length();
    const center = box.getCenter(new THREE.Vector3());
  
    controls.reset(); // remet les rotations
    camera.position.set(0, 0, size * 1.8);
    camera.lookAt(center);
    controls.target.copy(center);
    controls.update();
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

document.getElementById("toggleBtn").addEventListener("click", () => {
  const sidebar = document.getElementById("sidebar");
  sidebar.classList.toggle("closed");
});

const fullscreenBtn = document.getElementById('fullscreenBtn');
if (fullscreenBtn) {
  fullscreenBtn.addEventListener('click', () => {
    const el = document.documentElement;
    if (!document.fullscreenElement) {
      el.requestFullscreen().catch(err => {
        alert(`Erreur plein écran : ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  });
}

const resetBtn = document.getElementById('resetBtn');
if (resetBtn) {
  resetBtn.addEventListener('click', () => {
    resetCamera();
  });
}




