window.onload = function init() {
  const canvas = document.getElementById("gl-canvas");
  const renderer = new THREE.WebGLRenderer({ canvas });
  renderer.setSize(window.innerWidth, window.innerHeight); // Use the full window size
  renderer.outputEncoding = THREE.sRGBEncoding;

  // Scene and Camera setup
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 150, 400); // 카메라 위치 조정

  // Controls for the camera
  const controls = new THREE.OrbitControls(camera, renderer.domElement);

  // Lighting
  const ambientLight = new THREE.AmbientLight(0x404040, 0.1); // Ambient light intensity decreased
  scene.add(ambientLight);

  light.position.set(0, 300, 500); // Adjusted position remains the same
  scene.add(light);

  // Texture Loader
  const loader = new THREE.TextureLoader();
  const baseColor = loader.load("../textures/Snow_004_COLOR.jpg");
  const normalMap = loader.load("../textures/Snow_004_NORM.jpg");
  const roughnessMap = loader.load("../textures/Snow_004_ROUGH.jpg");
  const heightMap = loader.load("../textures/Snow_004_DISP.png");
  const ambientOcclusionMap = loader.load("../textures/Snow_004_OCC.jpg");

  // Create a sphere with textures
  const sphere = createSphere(100, 64);
  scene.add(sphere); // Add sphere to scene

  function createSphere(radius, segments) {
      return new THREE.Mesh(
          new THREE.SphereGeometry(radius, segments, segments),
          new THREE.MeshStandardMaterial({
              map: baseColor,
              normalMap: normalMap,
              roughnessMap: roughnessMap,
              displacementMap: heightMap,
              aoMap: ambientOcclusionMap,
              roughness: 1.0, // Increased roughness for less shininess
              metalness: 0.0, // Keep metalness low to avoid excessive shine
              displacementScale: 0.01, // Reduced displacement scale
          })
      );
  }

  // GLTFLoader for loading 3D model
  const gltfLoader = new THREE.GLTFLoader();
  let mixer;

  gltfLoader.load('../toon_cat_free/scene.gltf', function (gltf) {
      const model = gltf.scene;
      model.scale.set(0.05, 0.05, 0.05); // Adjust the size of the cat model

      // Position the cat on the surface of the sphere
      const sphereRadius = 100; // Radius of the sphere
      model.position.set(0, sphereRadius, 0); // Adjust the height based on the sphere radius

      scene.add(model);

      if (gltf.animations && gltf.animations.length > 0) {
          mixer = new THREE.AnimationMixer(model);
          gltf.animations.forEach((clip) => {
              mixer.clipAction(clip).play();
          });
      }
  }, undefined, function (error) {
      console.error('An error occurred while loading the model:', error);
  });

  // Rendering and animation loop
  function animate() {
      requestAnimationFrame(animate);

      // Update animations if mixer exists
      if (mixer) mixer.update(0.01);

      controls.update();
      renderer.render(scene, camera);
  }

  animate(); // Start the animation loop
};