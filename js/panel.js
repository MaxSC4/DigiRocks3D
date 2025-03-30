import * as THREE from './lib/three.module.js';
import { GLTFLoader } from './lib/GLTFLoader.js';
import { OrbitControls } from './lib/OrbitControls.js';

document.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user || user.role !== "enseignant") {
    alert("Accès réservé aux enseignants.");
    window.location.href = "login.html";
  }

  const form = document.getElementById("rocheForm");
  const glbFileInput = document.getElementById("glbFile");
  const resultMessage = document.getElementById("resultMessage");

  const annForm = document.getElementById("annotationForm");
  const addAnnBtn = document.getElementById("addAnnotationBtn");
  const cancelAnnBtn = document.getElementById("cancelAnnotationBtn");
  const annType = document.getElementById("annType");

  const annotations = [];
  let uploadedGLBUrl = "";
  let scene, camera, renderer, controls, model;
  let currentClickPosition = null;
  let previewSphere = null;

  glbFileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file && file.name.endsWith(".glb")) {
      const url = URL.createObjectURL(file);
      uploadedGLBUrl = url;
      initViewer(url);
    }
  });

  annType.addEventListener("change", (e) => {
    const section = document.getElementById("imageUploadSection");
    section.classList.toggle("hidden", e.target.value !== "image");
  });

  cancelAnnBtn.addEventListener("click", () => {
    currentClickPosition = null;
    annForm.classList.add("hidden");
    if (previewSphere) {
      scene.remove(previewSphere);
      previewSphere = null;
    }
  });

  addAnnBtn.addEventListener("click", () => {
    const label = document.getElementById("annLabel").value.trim();
    const type = annType.value;
    let content = document.getElementById("annContent").value.trim();

    if (!label || !currentClickPosition) return;

    if (type === "image") {
      const fileInput = document.getElementById("annImageFile");
      if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        content = URL.createObjectURL(file);
      }
    }

    annotations.push({
      id: "ann-" + Date.now(),
      label,
      type,
      content,
      position: [currentClickPosition.x, currentClickPosition.y, currentClickPosition.z]
    });

    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.02, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0xc60b46 })
    );
    sphere.position.copy(currentClickPosition);
    scene.add(sphere);

    if (previewSphere) {
      scene.remove(previewSphere);
      previewSphere = null;
    }

    annForm.classList.add("hidden");
    currentClickPosition = null;
    document.getElementById("annLabel").value = "";
    document.getElementById("annContent").value = "";
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const roche = {
      id: document.getElementById("identifiant"),
      nom: document.getElementById("nom").value,
      type: document.getElementById("type").value,
      tp: document.getElementById("tp").value,
      cours: document.getElementById("cours").value,
      annee: document.getElementById("annee").value,
      modele: uploadedGLBUrl,
      auteur: {
        email: user.email,
        nom: `${user.prenom} ${user.nom}`
      },
      annotations,
      analyses: []
    };

    console.log("✅ Roche enregistrée :", roche);
    localStorage.setItem("nouvelleRoche", JSON.stringify(roche));
    resultMessage.textContent = "✅ Roche enregistrée (voir console)";
    resultMessage.style.color = "green";
  });

  function initViewer(url) {
    scene = new THREE.Scene();
    scene.background = new THREE.Color("#f3f4f6");
  
    camera = new THREE.PerspectiveCamera(45, 1.2, 0.1, 100);
    camera.position.set(0, 0.5, 2);
  
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(600, 600);
    const container = document.getElementById("three-container");
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
  
    const light = new THREE.HemisphereLight(0xffffff, 0x444444, 1.2);
    scene.add(light);
    const pointLight = new THREE.PointLight(0xffffff, 1.2);
    pointLight.position.set(2, 2, 2);
    scene.add(pointLight);
  
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
  
    const loader = new GLTFLoader();
    loader.load(url, (gltf) => {
      model = gltf.scene;
      model.scale.set(1.5, 1.5, 1.5);
      scene.add(model);
  
      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3()).length();
      const center = box.getCenter(new THREE.Vector3());
  
      model.position.sub(center);
  
      const distance = size * 1.2;
      camera.position.set(distance, distance, distance);
      camera.lookAt(0, 0, 0);
      camera.updateProjectionMatrix();
  
      controls.target.set(0, 0, 0);
      controls.update();
  
      renderer.setSize(container.clientWidth, container.clientHeight);
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
    });
  
    renderer.domElement.addEventListener("click", onClick, false);
    animate();
  }

  function onClick(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    const mouse = new THREE.Vector2(x, y);
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObject(model, true);
    if (intersects.length > 0) {
      const point = intersects[0].point;
      currentClickPosition = point;
      annForm.classList.remove("hidden");

      if (previewSphere) scene.remove(previewSphere);
      previewSphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.02, 16, 16),
        new THREE.MeshStandardMaterial({ color: 0x00bcd4 })
      );
      previewSphere.position.copy(point);
      scene.add(previewSphere);
    }
  }

  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }
});

