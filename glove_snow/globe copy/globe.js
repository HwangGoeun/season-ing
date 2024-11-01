let mixer; // Global animation mixer

// Initialization function
function init() {
  // 웹 페이지가 로드되면 init 함수 실행
  const canvas = document.getElementById("gl-canvas");
  const renderer = new THREE.WebGLRenderer({ canvas });
  renderer.setSize(canvas.width, canvas.height);
  // 배경 색을 처음에 하늘색으로 설정
  renderer.setClearColor(new THREE.Color(0x87ceeb));
  // 감마 설정 (색상 표현을 개선하기 위해 감마 보정 사용)
  renderer.outputEncoding = THREE.sRGBEncoding;
// 장면(Scene) 생성 (3D 오브젝트를 배치하는 공간)
  const scene = new THREE.Scene();
  const camera = createCamera();
  const light = createLights(scene);

  const baseColor = loadTextures();
  const sphere = createSphere(scene, baseColor);

  setupClock();
  setupSlider(light);
  loadModels(scene, sphere);

  setInterval(() => {
    updateClock();
    updateBackgroundColor(renderer); // Pass renderer to update background color
  }, 1000);

  function animate() {
    updateAnimation(sphere, light);
    if (mixer) mixer.update(0.01);
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  window.addEventListener("resize", () => resizeCanvas(renderer, camera));
  animate();
}

// Camera creation
function createCamera() {
  const fov = 75;
  const aspect = 2;
  const near = 0.1;
  const far = 100;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.z = 3;
  camera.position.y = 6.8;
  camera.rotation.x -= 0.5;
  return camera;
}

// Lighting creation
function createLights(scene) {
  const ambientLight = new THREE.AmbientLight(0x333333);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.1);
  directionalLight.position.set(-1, 0, 0);
  scene.add(directionalLight);

  const lightTarget = new THREE.Object3D();
  lightTarget.position.set(0, 0, 0);
  scene.add(lightTarget);
  directionalLight.target = lightTarget;

  return directionalLight;
}

// Texture loading
function loadTextures() {
  const loader = new THREE.TextureLoader();
  const baseColor = loader.load("./textures/Snow_004_COLOR.jpg");
  const normalMap = loader.load("./textures/Snow_004_NORM.jpg");
  const roughnessMap = loader.load("./textures/Snow_004_ROUGH.jpg");
  const heightMap = loader.load("./textures/Snow_004_DISP.png");
  const ambientOcclusionMap = loader.load("./textures/Snow_004_OCC.jpg");

  baseColor.wrapS = baseColor.wrapT = THREE.RepeatWrapping;
  baseColor.repeat.set(4, 4);

  normalMap.wrapS = normalMap.wrapT = THREE.RepeatWrapping;
  normalMap.repeat.set(4, 4);

  roughnessMap.wrapS = roughnessMap.wrapT = THREE.RepeatWrapping;
  roughnessMap.repeat.set(4, 4);

  heightMap.wrapS = heightMap.wrapT = THREE.RepeatWrapping;
  heightMap.repeat.set(4, 4);

  ambientOcclusionMap.wrapS = ambientOcclusionMap.wrapT = THREE.RepeatWrapping;
  ambientOcclusionMap.repeat.set(4, 4);

  return { baseColor, normalMap, roughnessMap, heightMap, ambientOcclusionMap };
}

// Sphere creation with textures
function createSphere(scene, textures) {
  const radius = 6;
  const segments = 64;
  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(radius, segments, segments),
    new THREE.MeshStandardMaterial({
      map: textures.baseColor,
      normalMap: textures.normalMap,
      roughnessMap: textures.roughnessMap,
      displacementMap: textures.heightMap,
      aoMap: textures.ambientOcclusionMap,
      roughness: 0.8,
      metalness: 0.0,
      displacementScale: 0.03,
    })
  );

  scene.add(sphere);
  return sphere;
}

// Clock and slider setup
function setupClock() {
  setInterval(updateClock, 1000);
}

function updateClock() {
  const clockElement = document.getElementById("clock");
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  clockElement.textContent = `${hours}:${minutes}:${seconds}`;
}

function setupSlider(light) {
  const slider = document.getElementById("light-intensity");
  slider.value = light.intensity;
  slider.addEventListener("input", function () {
    light.intensity = parseFloat(slider.value);
  });
}

// Time-based color function
function getTimeBasedColorValue() {
  const now = new Date();
  const secondsInDay = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
  const normalizedTime = secondsInDay / 86400;
  const brightness = (Math.cos(2 * Math.PI * normalizedTime) + 1) / 2;
  return brightness;
}

// Background color update function
function updateBackgroundColor(renderer) {
  const timeValue = getTimeBasedColorValue();
  const skyColor = new THREE.Color(0x87ceeb);
  const eveningColor = new THREE.Color(0x1c1c72);
  const currentColor = skyColor.lerp(eveningColor, timeValue);
  renderer.setClearColor(currentColor);
}

// Model loading
function loadModels(scene, sphere) {
  const gltfLoader = new THREE.GLTFLoader();

  gltfLoader.load(
    "../../move_cat/toon_cat_free/scene.gltf",
    function (gltf) {
      const cat = gltf.scene.children[0];
      cat.scale.set(0.002, 0.002, 0.002);
      cat.position.set(0, sphere.geometry.parameters.radius, 1);
      scene.add(gltf.scene);

      mixer = new THREE.AnimationMixer(cat);
      if (gltf.animations.length > 0) {
        const action = mixer.clipAction(gltf.animations[0]);
        action.play();
      }
    },
    undefined,
    function (error) {
      console.error(error);
    }
  );
}

// Animation update
function updateAnimation(sphere, light) {
  sphere.rotation.x -= 0.002;

  const angle = 0;
  light.position.x = 10 * Math.cos(angle);
  light.position.z = 10 * Math.sin(angle);
}

// Resize canvas
function resizeCanvas(renderer, camera) {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
}

function changeSeason() {}
  function seasonButton() {
    document.getElementById("spring").onclick = function () {
      spring();
    };
    document.getElementById("summer").onclick = function () {
      summer();
    };
    document.getElementById("fall").onclick = function () {
      fall();
    };
    document.getElementById("winter").onclick = function () {
      winter();
    };
  }


window.onload = init;
