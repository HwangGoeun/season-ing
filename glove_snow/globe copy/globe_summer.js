window.onload = function init() {
  // 웹 페이지가 로드되면 init 함수 실행
  const canvas = document.getElementById("gl-canvas"); // HTML에서 'gl-canvas'라는 ID를 가진 <canvas> 요소를 가져옴
  const renderer = new THREE.WebGLRenderer({ canvas }); // WebGLRenderer를 생성하고 canvas 요소에 연결
  renderer.setSize(canvas.width, canvas.height); // 렌더러 크기를 canvas 크기로 설정
  // 배경 색을 처음에 하늘색으로 설정
  renderer.setClearColor(new THREE.Color(0x87ceeb)); // 하늘색

  // 감마 설정 (색상 표현을 개선하기 위해 감마 보정 사용)
  renderer.outputEncoding = THREE.sRGBEncoding;

  // 장면(Scene) 생성 (3D 오브젝트를 배치하는 공간)
  const scene = new THREE.Scene();

  // 화면 크기에 맞춰 캔버스 크기 조정
  function resizeCanvas() {
    renderer.setSize(window.innerWidth, window.innerHeight); // 창 크기에 맞게 캔버스 크기 설정
    camera.aspect = window.innerWidth / window.innerHeight; // 카메라의 종횡비 업데이트
    camera.updateProjectionMatrix(); // 카메라의 변화 반영
  }
  renderer.setSize(window.innerWidth, window.innerHeight); // 초기 창 크기에 맞추어 캔버스 설정

  /* --------------------------------------------------------------------------- */
  /* camera */

  const fov = 75;
  const aspect = 2;
  const near = 0.1;
  const far = 100;

  // 카메라(Camera) 설정 (3D 공간을 보는 시점 설정)
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.z = 4;
  camera.position.y = 9;
  camera.rotation.x -= 0.5;

  /* --------------------------------------------------------------------------- */
  /* Light */

  // 장면에 주변광(Ambient Light) 추가
  scene.add(new THREE.AmbientLight(0x333333));

  // 방향광(Directional Light) 설정
  const light = new THREE.DirectionalLight(0xffffff, 0.1);
  light.position.set(-1, 0, 0);
  scene.add(light);

  // 빛의 타겟 설정
  const lightTarget = new THREE.Object3D();
  lightTarget.position.set(0, 0, 0);
  scene.add(lightTarget);
  light.target = lightTarget;

  const orbitRadius = 10;
  let angle = 0;
  const rotationSpeed = (2 * Math.PI) / 86400;

  /* --------------------------------------------------------------------------- */
  /* texture */

  // 텍스처 로더 생성 (3D 모델에 텍스처를 입히기 위한 로더)
  const loader = new THREE.TextureLoader();

  // 텍스처 파일 로드 (구체 표면에 사용할 텍스처 이미지 로드)
  const baseColor = loader.load("./textures/Grass001_4K-PNG_Color.png"); // 기본 색상 텍스처
  const normalMap = loader.load("./textures/Grass001_4K-PNG_NormalDX.png"); // 노멀 맵
  const roughnessMap = loader.load("./textures/Grass001_4K-PNG_Roughness.png"); // 거칠기 맵
  const heightMap = loader.load("./textures/Grass001_4K-PNG_Displacement.png"); // 높이 맵
  const ambientOcclusionMap = loader.load(
    "./textures/Grass001_4K-PNG_AmbientOcclusion.png"
  ); // 주변광 차단 맵

  // 텍스처 반복 및 스케일 설정 (더 큰 구체에 텍스처를 여러 번 반복 적용)
  baseColor.wrapS = baseColor.wrapT = THREE.RepeatWrapping; // 텍스처를 반복시키도록 설정 (가로, 세로 방향)
  baseColor.repeat.set(1, 1);

  normalMap.wrapS = normalMap.wrapT = THREE.RepeatWrapping; // 노멀 맵의 반복 설정
  normalMap.repeat.set(1, 1);

  roughnessMap.wrapS = roughnessMap.wrapT = THREE.RepeatWrapping; // 거칠기 맵의 반복 설정
  roughnessMap.repeat.set(1, 1);

  heightMap.wrapS = heightMap.wrapT = THREE.RepeatWrapping; // 높이 맵의 반복 설정
  heightMap.repeat.set(1, 1);

  ambientOcclusionMap.wrapS = ambientOcclusionMap.wrapT = THREE.RepeatWrapping; // 주변광 차단 맵 반복 설정
  ambientOcclusionMap.repeat.set(1, 1);

  /* --------------------------------------------------------------------------- */
  /* globe */

  const radius = 6;
  const segments = 64;
  const rotation = 6;

  const sphere = createSphere(radius, segments);
  sphere.rotation.y = rotation;
  scene.add(sphere);

  function createSphere(radius, segments) {
    return new THREE.Mesh(
      new THREE.SphereGeometry(radius, segments, segments),
      new THREE.MeshStandardMaterial({
        map: baseColor,
        normalMap: normalMap,
        roughnessMap: roughnessMap,
        displacementMap: heightMap,
        aoMap: ambientOcclusionMap,
        roughness: 0.8,
        metalness: 0.0,
        displacementScale: 0.03,
      })
    );
  }

  /* --------------------------------------------------------------------------- */
  /* clock */

  function updateClock() {
    const clockElement = document.getElementById("clock");
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    clockElement.textContent = `${hours}:${minutes}:${seconds}`;
  }

  setInterval(() => {
    updateClock();
    updateBackgroundColor();
  }, 1000);

  function getTimeBasedColorValue() {
    const now = new Date();
    const secondsInDay =
      now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
    const normalizedTime = secondsInDay / 86400;
    const brightness = (Math.cos(2 * Math.PI * normalizedTime) + 1) / 2;
    return brightness;
  }

  /* --------------------------------------------------------------------------- */
  /* background */

  function updateBackgroundColor() {
    const timeValue = getTimeBasedColorValue();
    const skyColor = new THREE.Color(0x87ceeb);
    const eveningColor = new THREE.Color(0x1c1c72);
    const currentColor = skyColor.lerp(eveningColor, timeValue);
    renderer.setClearColor(currentColor);
  }

  /* --------------------------------------------------------------------------- */
  /* slider */

  const slider = document.getElementById("light-intensity");
  slider.value = light.intensity;

  slider.addEventListener("input", function () {
    light.intensity = parseFloat(slider.value);
  });

  /* --------------------------------------------------------------------------- */
  /* Cat Model */

  let cat, mixer;
  const catScale = 0.004;
  const gltf_loader = new THREE.GLTFLoader();
  gltf_loader.load(
    "../../move_cat/toon_cat_free/scene.gltf",
    function (gltf) {
      cat = gltf.scene.children[0];
      cat.scale.set(catScale, catScale, catScale);
      cat.position.set(0, radius, 1);

      mixer = new THREE.AnimationMixer(cat);
      if (gltf.animations.length > 0) {
        const action = mixer.clipAction(gltf.animations[0]);
        action.play();
      }

      scene.add(gltf.scene);
    },
    undefined,
    function (error) {
      console.error("Error loading cat model:", error);
    }
  );

  /* --------------------------------------------------------------------------- */
  /* New Object */
  // Set the angles for positioning object
  const theta = Math.PI / 4; // Angle from the Y-axis (45 degrees here)
  const phi = Math.PI / 3; // Rotation around the Y-axis (60 degrees here)

  // Calculate the position on the sphere's surface using spherical coordinates
  const x = radius * Math.sin(theta) * Math.cos(phi);
  const y = radius * Math.cos(theta);
  const z = radius * Math.sin(theta) * Math.sin(phi);

  /* --------------------------------------------------------------------------- */
  /* New Object (Umbrella) */

  let newObject;

  const newModelPath = "../../umbrella/scene.gltf";
  const normalMapTexturePath =
    "../../umbrella/textures/Material.001_normal.png";
  const baseColorTexturePath =
    "../../umbrella/textures/Material.001_baseColor.png";
  const newTextureLoader = new THREE.TextureLoader();
  const newNormalMap = newTextureLoader.load(normalMapTexturePath);
  const newBaseColor = newTextureLoader.load(baseColorTexturePath);

  const newLoader = new THREE.GLTFLoader();
  newLoader.load(
    newModelPath,
    function (gltf) {
      newObject = gltf.scene;

      newObject.traverse((child) => {
        if (child.isMesh) {
          child.material = new THREE.MeshStandardMaterial({
            map: newBaseColor,
            normalMap: newNormalMap,
            roughness: 0.5,
            metalness: 0.1,
          });
          child.material.map.wrapS = child.material.map.wrapT =
            THREE.RepeatWrapping;
          child.material.normalMap.wrapS = child.material.normalMap.wrapT =
            THREE.RepeatWrapping;
        }
      });

      // Position newObject on the surface of the sphere
      newObject.position.set(x, y, z);
      newObject.scale.set(1, 1, 1);

      // Add newObject as a child of sphere
      sphere.add(newObject);
    },
    undefined,
    function (error) {
      console.error("Error loading new model:", error);
    }
  );

  /* ---------------------------

  /* --------------------------------------------------------------------------- */
  /* rendering */

  function render() {
    sphere.rotation.x -= 0.01;
    angle += rotationSpeed;
    const x = orbitRadius * Math.cos(angle);
    const y = orbitRadius * Math.sin(angle);
    const z = orbitRadius * Math.sin(angle);
    light.position.set(x, y, z);

    updateBackgroundColor();

    if (mixer) mixer.update(0.005); // Update cat animation if mixer is available
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }

  window.addEventListener("resize", resizeCanvas);

  // Ensure the cat remains on the sphere's surface
  function keepCatOnSphere() {
    if (cat) {
      const sphereCenter = sphere.position;
      const catDirection = cat.position.clone().sub(sphereCenter).normalize();
      const targetPosition = catDirection.multiplyScalar(radius + 0.03);
      cat.position.copy(targetPosition);
    }
  }

  render();
};
