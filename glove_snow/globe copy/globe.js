let mixer; // 애니메이션 믹서를 전역으로 설정

// 초기화 함수
function init() {
  const canvas = document.getElementById("gl-canvas");
  const renderer = new THREE.WebGLRenderer({ canvas });
  renderer.setSize(canvas.width, canvas.height);
  renderer.setClearColor(new THREE.Color(0x87ceeb));
  renderer.outputEncoding = THREE.sRGBEncoding;

  const scene = new THREE.Scene();

  const camera = createCamera();
  //const controls = new THREE.TrackballControls(camera, canvas);
  const light = createLights(scene);

  const baseColor = loadTextures();
  const sphere = createSphere(scene, baseColor);

  setupClock();
  setupSlider(light);
  loadModels(scene, sphere);

  function animate() {
    updateAnimation(sphere, light);
    //controls.update();
    if (mixer) mixer.update(0.01); // 애니메이션 업데이트
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  window.addEventListener("resize", () => resizeCanvas(renderer, camera));
  animate();
}

// 카메라 생성
function createCamera() {
  const fov = 75;
  const aspect = 2;
  const near = 0.1;
  const far = 100;

  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.z = 2;
  camera.position.y = 6.5;
  camera.rotation.x -= 0.5;
  return camera;
}

// 조명 생성
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

// 텍스처 로드
function loadTextures() {
  const loader = new THREE.TextureLoader();
  const baseColor = loader.load("./textures/Snow_004_COLOR.jpg");
  baseColor.wrapS = baseColor.wrapT = THREE.RepeatWrapping;
  baseColor.repeat.set(4, 4);
  return baseColor;
}

// 구체 생성
function createSphere(scene, baseColor) {
  const radius = 6;
  const segments = 64;

  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(radius, segments, segments),
    new THREE.MeshStandardMaterial({
      map: baseColor,
      roughness: 0.8,
      metalness: 0.0,
    })
  );

  scene.add(sphere);
  return sphere;
}

// 시계 및 슬라이더 설정
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

// 모델 로드
function loadModels(scene, sphere) {
  const gltfLoader = new THREE.GLTFLoader();

  // 고양이 모델 로드
  gltfLoader.load(
    "../../move_cat/toon_cat_free/scene.gltf",
    function (gltf) {
      const cat = gltf.scene.children[0];
      cat.scale.set(0.001, 0.001, 0.001);
      cat.position.set(0, sphere.geometry.parameters.radius, 1);
      scene.add(gltf.scene);

      // 애니메이션 믹서 설정
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

  // 집 모델 로드
  gltfLoader.load(
    "../../move_cat/birdhouse_low_poly_gltf/scene.gltf",
    function (gltf) {
      const dog = gltf.scene.children[0];
      dog.scale.set(0.2, 0.2, 0.2);
      dog.position.set(2, sphere.geometry.parameters.radius, -1);
      scene.add(gltf.scene);
    },
    undefined,
    function (error) {
      console.error(error);
    }
  );
}

// 애니메이션 업데이트
function updateAnimation(sphere, light) {
  sphere.rotation.x -= 0.002;

  const angle = 0; // 태양의 각도를 업데이트하는 로직 필요
  light.position.x = 10 * Math.cos(angle);
  light.position.z = 10 * Math.sin(angle);
}

// 캔버스 크기 조정
function resizeCanvas(renderer, camera) {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
}

// 페이지 로드 시 초기화 실행
window.onload = init;
