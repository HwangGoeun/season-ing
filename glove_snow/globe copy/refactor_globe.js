let rotate = 0;
let viewAll = 1;
let renderer, scene, camera, light, sphere, cat, mixer;
const radius = 6;       // Sphere radius
const orbitRadius = 10; // Orbit radius for light
let treeModelName = "./models/spring/low-_poly_cherry_blossom_tree_3d_models/scene.gltf";    // 나무 오브젝트 경로
let baseColorPath = "./textures/Poliigon_GrassPatchyGround_4585_BaseColor.jpg";                  // 기본 색상 텍스처
let normalMapPath = "./textures/Poliigon_GrassPatchyGround_4585_Normal.jpg";                     // 노멀 맵
let roughnessMapPath = "./textures/Poliigon_GrassPatchyGround_4585_Roughness.jpg";               // 거칠기 맵
let heightMapPath = "./textures/Poliigon_GrassPatchyGround_4585_Displacement.tiff";              // 높이 맵
let ambientOcclusionMapPath = "./textures/Poliigon_GrassPatchyGround_4585_AmbientOcclusion.jpg"; // 주변광 차단 맵

// Initialize the Three.js scene
function init() {
    const canvas = document.getElementById("gl-canvas");  // HTML에서 'gl-canvas'라는 ID를 가진 <canvas> 요소를 가져옴
    renderer = new THREE.WebGLRenderer({ canvas });       // WebGLRenderer를 생성하고 canvas 요소에 연결
    renderer.setSize(canvas.width, canvas.height);        // 렌더러 크기를 canvas 크기로 설정
    renderer.setClearColor(new THREE.Color(0x87ceeb));    // 배경 색을 처음에 하늘색으로 설정
    renderer.outputEncoding = THREE.sRGBEncoding;         // 감마 설정 (색상 표현을 개선하기 위해 감마 보정 사용)
    // Enable shadows in the renderer
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    scene = new THREE.Scene();    // 장면(Scene) 생성 (3D 오브젝트를 배치하는 공간)
    camera = setupCamera();       // 카메라(Camera) 설정 (3D 공간을 보는 시점 설정)
    light = setupLight();         // 광원 설정

    setupAxes();              // 장면에 X, Y, Z 축을 표시 (X : Red, Y : Green, Z : Blue)
    setupSphere();            // 구 설정
    setupTextureLoader();     // 텍스처 로더 설정

    setupEventListeners();    // 이벤트 리스너 설정
    setupClock();             // 시계 설정
    setupSlider();            // 슬라이더 설정
    setupSeasonButtons();     // 계절 버튼 설정

    spring();

    loadCatModel();   // 고양이 오브젝트 로드

    render();     // 렌더링 함수
}

// Camera setup
function setupCamera() {
    const fov = 75;
    const aspect = window.innerWidth / window.innerHeight;
    const near = 0.1;
    const far = 1000;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

    if (viewAll) {
        controls = new THREE.OrbitControls(camera);
        camera.position.z = 20;
    } else {
        camera.position.set(0, 6, 3);
    }

    return camera;
}

// Light setup
function setupLight() {
    const ambientLight = new THREE.AmbientLight(0x333333);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.1);
    directionalLight.position.set(-1, 0, 0);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -20;
    directionalLight.shadow.camera.right = 20;
    directionalLight.shadow.camera.top = 20;
    directionalLight.shadow.camera.bottom = -20;

    scene.add(directionalLight);
    return directionalLight;
}

// Axes setup
function setupAxes() {
    const axes = new THREE.AxesHelper(1000);
    scene.add(axes);
}

// Sphere setup
function setupSphere() {
    const segments = 256;
    const sphereGeometry = new THREE.SphereGeometry(radius, segments, segments);
    const sphereMaterial = new THREE.MeshStandardMaterial({
        roughness: 0.8,
        metalness: 0.0,
        displacementScale: 0.03,
    });

    sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.receiveShadow = true;
    scene.add(sphere);
}

// Resize canvas to window
function resizeCanvas() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
}

// Texture loader setup
function setupTextureLoader() {
    const loader = new THREE.TextureLoader();
    const baseColor = loader.load(baseColorPath);
    const normalMap = loader.load(normalMapPath);
    const roughnessMap = loader.load(roughnessMapPath);
    const heightMap = loader.load(heightMapPath);
    const ambientOcclusionMap = loader.load(ambientOcclusionMapPath);

    // 텍스처 반복 및 스케일 설정 (더 큰 구체에 텍스처를 여러 번 반복 적용)
    baseColor.wrapS = baseColor.wrapT = THREE.RepeatWrapping;   // 텍스처를 반복시키도록 설정 (가로, 세로 방향)
    baseColor.repeat.set(4, 4);                                 // 텍스처가 4x4로 반복되도록 설정
  
    normalMap.wrapS = normalMap.wrapT = THREE.RepeatWrapping;   // 노멀 맵의 반복 설정
    normalMap.repeat.set(4, 4); // 4x4 반복

    roughnessMap.wrapS = roughnessMap.wrapT = THREE.RepeatWrapping; // 거칠기 맵의 반복 설정
    roughnessMap.repeat.set(4, 4); // 4x4 반복

    heightMap.wrapS = heightMap.wrapT = THREE.RepeatWrapping; // 높이 맵의 반복 설정
    heightMap.repeat.set(4, 4); // 4x4 반복

    ambientOcclusionMap.wrapS = ambientOcclusionMap.wrapT = THREE.RepeatWrapping; // 주변광 차단 맵 반복 설정
    ambientOcclusionMap.repeat.set(4, 4); // 4x4 반복

    sphere.material.map = baseColor;
    sphere.material.normalMap = normalMap;
    sphere.material.roughnessMap = roughnessMap;
    sphere.material.displacementMap = heightMap;
    sphere.material.aoMap = ambientOcclusionMap;

    sphere.material.needsUpdate = true;
}

// Clock setup
function setupClock() {
    setInterval(() => {
        updateClock();
        updateBackgroundColor();
    }, 1000);
}

// Update clock display
function updateClock() {
    const clockElement = document.getElementById("clock");
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    clockElement.textContent = `${hours}:${minutes}:${seconds}`;
}

// Update background color based on time
function updateBackgroundColor() {
    const timeValue = getTimeBasedColorValue();
    const skyColor = new THREE.Color(0x87ceeb);
    const eveningColor = new THREE.Color(0x1c1c72);
    const currentColor = skyColor.lerp(eveningColor, timeValue);
    renderer.setClearColor(currentColor);
}

// Get time-based color value for background
function getTimeBasedColorValue() {
    const now = new Date();
    const secondsInDay = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
    const normalizedTime = secondsInDay / 86400;
    return (Math.cos(2 * Math.PI * normalizedTime) + 1) / 2;
}

// Background slider setup
function setupSlider() {
    const slider = document.getElementById("light-intensity");
    slider.value = light.intensity;

    slider.addEventListener("input", function () {
        light.intensity = parseFloat(slider.value);
    });
}

// Event listeners setup
function setupEventListeners() {
    window.addEventListener("resize", resizeCanvas);

    document.addEventListener("keydown", (event) => {
        if (event.code === "Space") {
            handleJump();
        }
    });
}

// Cat model loading
function loadCatModel() {
    const gltfLoader = new THREE.GLTFLoader();
    gltfLoader.load(
        "../../move_cat/toon_cat_free/scene.gltf",
        function (gltf) {
            cat = gltf.scene.children[0];
            cat.scale.set(0.0009, 0.0009, 0.0009);
            cat.position.setFromSphericalCoords(radius + 0.03, Math.PI / 10, 0);
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

function createTree(scaleValue = 0.2) {
    const gltf_loader = new THREE.GLTFLoader();
    gltf_loader.load(
        treeModelName,
        function (gltf) {
            const model = gltf.scene;
            model.scale.set(scaleValue, scaleValue, scaleValue);

            // shadow
            model.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true; // Trees cast shadows
                    child.receiveShadow = true; // Trees receive shadows
                }
            });

            models = model.clone();
            for (var i = 0; i < 2 * Math.PI; i += Math.PI / 6) {
                const objCopy = models.clone();
                let phi = (Math.PI - Math.PI / 3) - 0.35;
                let theta = i;
                // 반지름, phi값, theta 값 (radius, phi, theta) -> phi는 y축 기준, theta는 z축 기준
                objCopy.position.setFromSphericalCoordsYZ(radius, phi, theta);
                objCopy.rotation.x += i;
                sphere.add(objCopy);
            }

            for (var i = 0; i < 2 * Math.PI; i += Math.PI / 6) {
                const objCopy = models.clone();
                let phi = Math.PI / 3 + 0.35;
                let theta = i;
                // 반지름, phi값, theta 값 (radius, phi, theta) -> phi는 y축 기준, theta는 z축 기준
                objCopy.position.setFromSphericalCoordsYZ(radius, phi, theta);
                objCopy.rotation.x += i;
                objCopy.rotation.y = 90;
                sphere.add(objCopy);
            }
        },
        undefined,
        function (error) {
            console.error(error);
        }
    );
}

// Render function for the scene
function render() {
    if (viewAll && controls) {
        controls.update();
    }

    if (rotate) {
        sphere.rotation.x -= 0.0001;
    }

    if (mixer) mixer.update(0.004);
    if (cat) keepCatOnSphere();

    renderer.render(scene, camera);
    requestAnimationFrame(render);
}

// Keep the cat on the sphere
function keepCatOnSphere() {
    const sphereCenter = sphere.position;
    const catDirection = cat.position.clone().sub(sphereCenter).normalize();
    const targetPosition = catDirection.multiplyScalar(radius + 0.03);
    cat.position.copy(targetPosition);
}

// Season buttons setup
function setupSeasonButtons() {
    document.getElementById("spring").onclick = spring;
    document.getElementById("summer").onclick = summer;
    document.getElementById("fall").onclick = fall;
    document.getElementById("winter").onclick = winter;
}

// Define seasonal setups
function spring() {
    console.log("spring button pushed");

    // 기존 나무들을 삭제
    while (sphere.children.length > 0) {
        sphere.remove(sphere.children[0]);
    }

    // 새로운 나무 모델 경로로 업데이트
    modelName = "./models/spring/low-_poly_cherry_blossom_tree_3d_models/scene.gltf";
    createTree(scaleValue = 0.05);
}
function summer() { /* Add summer season setup */ }
function fall() { /* Add fall season setup */ }
function winter() { /* Add winter season setup */ }

// Initialize the scene when the window loads
window.onload = init;