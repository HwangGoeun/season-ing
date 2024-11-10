let rotate = 0;
let viewAll = 1;
let catWalk = 1;
let renderer, scene, camera, light, sphere, cat, mixer;
const radius = 6;       // Sphere radius
const orbitRadius = 10; // Orbit radius for light
// tree
let treeModelName = "./models/spring/low-_poly_cherry_blossom_tree_3d_models/scene.gltf";    // 나무 오브젝트 경로
// globe texture
let baseColorPath = "./textures/Poliigon_GrassPatchyGround_4585_BaseColor.jpg";                  // 기본 색상 텍스처
let normalMapPath = "./textures/Poliigon_GrassPatchyGround_4585_Normal.jpg";                     // 노멀 맵
let roughnessMapPath = "./textures/Poliigon_GrassPatchyGround_4585_Roughness.jpg";               // 거칠기 맵
let heightMapPath = "./textures/Poliigon_GrassPatchyGround_4585_Displacement.tiff";              // 높이 맵
let ambientOcclusionMapPath = "./textures/Poliigon_GrassPatchyGround_4585_AmbientOcclusion.jpg"; // 주변광 차단 맵
// meteors
let meteors = [];
let meteorShowerActive = false;
let meteorMode = 0;

// Initialize the Three.js scene
function init() {
    if (catWalk) {
        rotate = 1;
        viewAll = 0;
    }
    const canvas = document.getElementById("gl-canvas");  // HTML에서 'gl-canvas'라는 ID를 가진 <canvas> 요소를 가져옴
    renderer = new THREE.WebGLRenderer({ canvas });       // WebGLRenderer를 생성하고 canvas 요소에 연결
    renderer.setSize(window.innerWidth, window.innerHeight);        // 렌더러 크기를 canvas 크기로 설정
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

/* --------------------------------------------------------------------------- */
/* light */

// Light setup
function setupLight() {
    // 장면에 주변광(Ambient Light) 추가 (전체적으로 고르게 빛을 비춤)
    const ambientLight = new THREE.AmbientLight(0x333333);
    scene.add(ambientLight);

    // 방향광(Directional Light) 설정 (특정 방향으로 빛을 쏘는 조명)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.1);
    directionalLight.position.set(-1, 0, 0);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -20;
    directionalLight.shadow.camera.right = 20;
    directionalLight.shadow.camera.top = 20;
    directionalLight.shadow.camera.bottom = -20;

    scene.add(directionalLight);
    return directionalLight;
}

// 광원 위치 및 색 온도 업데이트 함수
function updateLightPosition() {
    const { kstHours, normalizedTime } = getCurrentTimeInfo();

    // 각도를 0시부터 24시 기준으로 180도로 매핑
    const angle = (kstHours / 24) * Math.PI - Math.PI;

    // 광원의 위치 설정 (XZ 평면에서만 회전)
    const x = orbitRadius * Math.cos(angle);
    const y = orbitRadius * Math.sin(angle);
    light.position.set(x, -y, 0);
    light.lookAt(sphere.position);

    // 색 온도 조정
    if (kstHours >= 6 && kstHours < 18) {
        light.color.setHSL(0.1, 1, 0.9); // 낮 시간: 주황색
    } else {
        light.color.setHSL(0.6, 1, 0.5); // 밤 시간: 파란색
    }
}

/* --------------------------------------------------------------------------- */

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

/* --------------------------------------------------------------------------- */
/* time */

// 시간 관련 정보 반환 함수
function getCurrentTimeInfo() {
  const now = new Date();
  const utcHours = now.getUTCHours();
  // const kstHours = (utcHours + 9) % 24;
  const kstHours = 0;
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();

  // 일중 초 단위 계산 (24시간 기준)
  const secondsInDay = hours * 3600 + minutes * 60 + seconds;
  const normalizedTime = secondsInDay / 86400;

  return {
      now,
      utcHours,
      kstHours,
      hours,
      minutes,
      seconds,
      normalizedTime
  };
}

// Clock setup
function setupClock() {
    setInterval(() => {
        updateClock();
        updateBackgroundColor();
    }, 1000);
}

// 시계 업데이트 함수
function updateClock() {
  const { hours, minutes, seconds } = getCurrentTimeInfo();
  const clockElement = document.getElementById("clock");
  clockElement.textContent = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  // 밤 9시에 유성우 활성화
  if (hours >= 21 && !meteorShowerActive) {
      meteorShowerActive = true;
      if (meteorMode) {
          createMeteorShower();
      } else {
          createStarField();
      }
  }
}

/* --------------------------------------------------------------------------- */

// 배경 색상 업데이트 함수
function updateBackgroundColor() {
  const { normalizedTime } = getCurrentTimeInfo();
  const skyColor = new THREE.Color(0x87ceeb);
  const eveningColor = new THREE.Color(0x1c1c72);
  const currentColor = skyColor.lerp(eveningColor, (Math.cos(2 * Math.PI * normalizedTime) + 1) / 2);
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

    // Disable controls while interacting with the slider
    slider.addEventListener("mousedown", () => (controls.enabled = false));
    slider.addEventListener("mouseup", () => (controls.enabled = true));
    slider.addEventListener("touchstart", () => (controls.enabled = false));
    slider.addEventListener("touchend", () => (controls.enabled = true));
  
    // Update light intensity based on slider value
    slider.addEventListener("input", function () {
      light.intensity = parseFloat(slider.value);
    });
}

// Event listeners setup
function setupEventListeners() {
    window.addEventListener("resize", resizeCanvas);

    window.addEventListener("keydown", (event) => {
        if (event.code === "Space") {
            console.log("Space is pushed");
            event.preventDefault(); // This prevents the default action if not passive
            handleJump();
        }
    }, { passive: false });
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
            
            // shadow
            cat.traverse((child) => {
                if (child.isMesh) {
                child.castShadow = true; // Trees cast shadows
                child.receiveShadow = true; // Trees receive shadows
                }
            });
        },
        undefined,
        function (error) {
            console.error(error);
        }
    );
}

/* --------------------------------------------------------------------------- */
/* jump action */
let isJumping = false;  // Variable to check if the cat is currently jumping
let jumpHeight = 0.5;   // Maximum height of the jump
let jumpSpeed = 0.02;   // Speed of the jump
let jumpDirection = 1;  // 1 for up, -1 for down

function handleJump() {
    if (isJumping) return;  // Prevent multiple jumps

    isJumping = true;
    let initialY = cat.position.y;  // Store initial Y position of the cat

    function jumpAnimation() {
        // Move the cat up and down
        cat.position.y += jumpSpeed * jumpDirection;

        // If the cat reaches the max height, start descending
        if (cat.position.y >= initialY + jumpHeight) {
            jumpDirection = -1;  // Change direction to downward
        }

        // If the cat is back to the initial position, end the jump
        if (cat.position.y <= initialY && jumpDirection === -1) {
            cat.position.y = initialY;  // Reset to exact initial position
            isJumping = false;  // End the jump by setting isJumping to false
            jumpDirection = 1;  // Reset direction for next jump
            return;
        }

        // Continue the jump animation
        requestAnimationFrame(jumpAnimation);
    }

    jumpAnimation();  // Start the jump animation
}

/* --------------------------------------------------------------------------- */

function createTree(scaleValue = 0.45) {
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

function createMeteorShower() {
    // Define the number of meteors you want
    const meteorCount = 20;

    // Create meteors
    for (let i = 0; i < meteorCount; i++) {
        const geometry = new THREE.SphereGeometry(0.1, 8, 8); // Small glowing particles
        const material = new THREE.MeshBasicMaterial({ color: 0xffff99, emissive: 0xffff99 }); // Glow effect

        const meteor = new THREE.Mesh(geometry, material);
        
        // Random position above the scene
        meteor.position.set(
            (Math.random() - 0.5) * 20, // Random x position
            Math.random() * 10 + 5,     // Random y position above the sphere
            (Math.random() - 0.5) * 20  // Random z position
        );

        // Add meteor to the scene and meteors array for tracking
        scene.add(meteor);
        meteors.push(meteor);
    }
}

function animateMeteorShower() {
    // Move each meteor downward
    meteors.forEach(meteor => {
        meteor.position.y -= 0.01; // Speed of falling

        // Reset position if it goes below a certain level
        if (meteor.position.y < 0) {
            meteor.position.y = Math.random() * 10 + 5; // Reset to high position
            meteor.position.x = (Math.random() - 0.5) * 20; // Reset random x position
            meteor.position.z = (Math.random() - 0.5) * 20; // Reset random z position
        }

        // // Optionally adjust opacity for fading effect
        // meteor.material.opacity = Math.random();
        // meteor.material.transparent = true;
    });
}

function createStarField() {
    // Define the number of stars
    const starCount = 100;

    // Create stars
    for (let i = 0; i < starCount; i++) {
        const geometry = new THREE.SphereGeometry(0.05, 8, 8); // Small glowing spheres for stars
        const material = new THREE.MeshBasicMaterial({ color: 0xffffcc, emissive: 0xffffcc }); // Soft glow

        const star = new THREE.Mesh(geometry, material);

        // Place stars at random positions around the sphere
        const distance = radius + Math.random() * 5 + 5; // Position stars further from the sphere
        const theta = Math.random() * 2 * Math.PI;       // Random angle in the horizontal plane
        const phi = Math.random() * Math.PI;             // Random angle in the vertical plane

        // Convert spherical coordinates to Cartesian coordinates for positioning
        star.position.x = distance * Math.sin(phi) * Math.cos(theta);
        star.position.y = distance * Math.cos(phi);
        star.position.z = distance * Math.sin(phi) * Math.sin(theta);

        // Add star to the scene and stars array for tracking
        scene.add(star);
        meteors.push(star);
    }
}

/* --------------------------------------------------------------------------- */
/* place object */

// 각도를 라디안으로 변환하는 함수
function degreeToRadian(degree) {
    return degree * (Math.PI / 180);
}

function placeObject(
    filePath,
    scaleX = 0,
    scaleY = 0,
    scaleZ = 0,
    posRadius = radius, // 구의 반경
    posPhi = 0, // 세로 각도
    posTheta = 0, // 가로 각도
    rotX = 0,
    rotY = Math.PI,
    rotZ = 0,
  ) {
    const gltf_loader = new THREE.GLTFLoader();
    gltf_loader.load(
      filePath,
      function (gltf) {
        obj = gltf.scene.children[0];
        obj.scale.set(scaleX, scaleY, scaleZ);
        obj.position.setFromSphericalCoords(posRadius, posPhi, posTheta);

        // shadow
        obj.traverse((child) => {
            if (child.isMesh) {
              child.castShadow = true; // objects cast shadows
              child.receiveShadow = true; // objects receive shadows
            }
        });

        sphere.add(obj);
        //obj.up.set(1, 0, 0); // 필요에 따라 다른 축을 설정합니다.
        obj.lookAt(sphere.position);

        obj.rotation.x += rotX;
        obj.rotation.y += rotY;
        obj.rotation.z += rotZ;
        render();
      },
      undefined,
      function (error) {
        console.error(error);
      }
    );
  }

/* --------------------------------------------------------------------------- */

// Render function for the scene
function render() {
    if (viewAll && controls) {
        controls.update();
    }

    if (rotate) {
        sphere.rotation.x -= 0.0001;
    }

    if (mixer) mixer.update(0.004);

    // Animate meteor shower if active
    if (meteorShowerActive) {
        if (meteorMode) {
            animateMeteorShower();
        } else {
            meteors.forEach(star => {
                star.material.opacity = 0.8 + Math.random() * 0.2; // Flicker between 0.8 and 1.0 opacity
                star.material.transparent = true;
            });
        }
    }

    // 일정한 간격으로 광원의 위치 업데이트
    setInterval(updateLightPosition, 1000); // 매 초마다 업데이트

    renderer.render(scene, camera);
    requestAnimationFrame(render);
}

/* --------------------------------------------------------------------------- */

// // Keep the cat on the sphere
// function keepCatOnSphere() {
//     const sphereCenter = sphere.position;
//     const catDirection = cat.position.clone().sub(sphereCenter).normalize();
//     const targetPosition = catDirection.multiplyScalar(radius + 0.03);
//     cat.position.copy(targetPosition);
// }

/* --------------------------------------------------------------------------- */

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

    // 기존 오브젝트 삭제
    while (sphere.children.length > 0) {
        sphere.remove(sphere.children[0]);
    }

    // 새로운 나무 모델 경로로 업데이트
    treeModelName = "./models/spring/low-_poly_cherry_blossom_tree_3d_models/scene.gltf";
    createTree(scaleValue = 0.1);

    baseColorPath = "./textures/Poliigon_GrassPatchyGround_4585_BaseColor.jpg";                  // 기본 색상 텍스처
    normalMapPath = "./textures/Poliigon_GrassPatchyGround_4585_Normal.jpg";                     // 노멀 맵
    roughnessMapPath = "./textures/Poliigon_GrassPatchyGround_4585_Roughness.jpg";               // 거칠기 맵
    heightMapPath = "./textures/Poliigon_GrassPatchyGround_4585_Displacement.tiff";              // 높이 맵
    ambientOcclusionMapPath = "./textures/Poliigon_GrassPatchyGround_4585_AmbientOcclusion.jpg"; // 주변광 차단 맵
    setupTextureLoader();

    placeObject(
        filePath = "./models/spring/chick_trio_gltf/scene.gltf", 
        scaleX = 0.5, scaleY = 0.5, scaleZ = 0.5,
        posRadius = radius - 0.1,
        posPhi = Math.PI / 4 - 0.3,
        posTheta = Math.PI / 4,
      );
    
      placeObject(
        filePath = "./models/spring/pink_big_tree/scene.gltf", 
        scaleX = 0.002, scaleY = 0.002, scaleZ = 0.002,
        posRadius = radius + 0.1,
        posPhi = Math.PI / 4 - 25,
        posTheta = Math.PI / 4 + 300,
      );
  
      placeObject(
        filePath = "./models/spring/low_poly_camper/scene.gltf", 
        scaleX = 0.2, scaleY = 0.2, scaleZ = 0.2,
        posRadius = radius - 0.07,
        posPhi = degreeToRadian(80),
        posTheta = - degreeToRadian(35),
        rotX = degreeToRadian(0),
        rotY = degreeToRadian(170),
        rotZ = -degreeToRadian(15),
      );

      placeObject(
        filePath = "./models/spring/japanese_cherry_blossom_-_single_flower/scene.gltf", 
        scaleX = 5, scaleY = 5, scaleZ = 5,
        posRadius = radius + 0.1,
        posPhi = Math.PI / 4 - 305,
        posTheta = Math.PI / 4 - 3,
        rotX = degreeToRadian(90),
      );
  
      placeObject(
        filePath = "./models/spring/hot_air_baloon/scene.gltf", 
        scaleX = 1, scaleY = 1, scaleZ = 1,
        posRadius = radius + 1,
        posPhi = Math.PI / 4 - 30,
        posTheta = Math.PI / 4 - 3,
      );

      placeObject(
        filePath = "./models/spring/pink_big_tree/scene.gltf", 
        scaleX = 0.002, scaleY = 0.002, scaleZ = 0.002,
        posRadius = radius + 0.1,
        posPhi = degreeToRadian(200),
        posTheta = degreeToRadian(90),
      );
  
      placeObject(
        filePath = "./models/spring/cute_chick/scene.gltf", 
        scaleX = 0.4, scaleY = 0.4, scaleZ = 0.4,
        posRadius = radius + 0.1,
        posPhi = degreeToRadian(95),
        posTheta = degreeToRadian(170),
        rotY = degreeToRadian(0),
        rotZ = degreeToRadian(180)
      );
      let sv = 0.01;
      placeObject(
        filePath = "./models/spring/flowered_antler_deer/scene.gltf", 
        scaleX = sv, scaleY = sv, scaleZ = sv,
        posRadius = radius + 0.1,
        posPhi = degreeToRadian(300),
        posTheta = degreeToRadian(30),
        rotX = degreeToRadian(0),
        rotY = degreeToRadian(178),
        rotZ = degreeToRadian(90),
      );
  
      
      placeObject(
        filePath = "./models/spring/pink_big_tree/scene.gltf", 
        scaleX = 0.002, scaleY = 0.002, scaleZ = 0.002,
        posRadius = radius + 0.1,
        posPhi = degreeToRadian(330),
        posTheta = degreeToRadian(70),
      );
      
      placeObject(
        filePath = "./models/spring/pink_big_tree/scene.gltf", 
        scaleX = 0.002, scaleY = 0.002, scaleZ = 0.002,
        posRadius = radius + 0.1,
        posPhi = degreeToRadian(385),
        posTheta = degreeToRadian(70),
      );
}

function summer() {
    console.log("summer button pushed");

    // 기존 오브젝트 삭제
    while (sphere.children.length > 0) {
        sphere.remove(sphere.children[0]);
    }

    // 새로운 나무 모델 경로로 업데이트
    treeModelName = "./models/summer/tree/scene.gltf";
    createTree(scaleValue = 0.7);

    baseColorPath = "./textures/Stylized_Sand_001_basecolor.jpg";                  // 기본 색상 텍스처
    normalMapPath = "./textures/Stylized_Sand_001_normal.jpg";                     // 노멀 맵
    roughnessMapPath = "./textures/Stylized_Sand_001_roughness.jpg";               // 거칠기 맵
    heightMapPath = "./textures/Stylized_Sand_001_height.png";                     // 높이 맵
    ambientOcclusionMapPath = "./textures/Stylized_Sand_001_ambientOcclusion.jpg"; // 주변광 차단 맵
    setupTextureLoader();
    placeObject(
        "./models/summer/umbrella/scene.gltf",
        0.8,
        0.8,
        0.8,
        radius,
        0.3,
        0.41
      );
  
      placeObject(
        "./models/summer/beachball/scene.gltf",
        0.6,
        0.6,
        0.6,
        radius + 0.1,
        0.34,
        0.4
      );
  
      placeObject(
        "./models/summer/icecream/scene.gltf",
        0.002,
        0.002,
        0.002,
        radius + 0.01,
        -0.4,
        0.5,
        0,
        Math.PI,
        3.5
      );
  
      placeObject(
        "./models/summer/beach_chair_blue_stripes/scene.gltf",
        0.4,
        0.4,
        0.4,
        radius,
        0.9,
        0.2,
        0,
        Math.PI,
        -1.2
      );
  
      placeObject(
        "./models/summer/beach_chair_blue_stripes/scene.gltf",
        0.4,
        0.4,
        0.4,
        radius,
        0.8,
        0.2,
        0,
        Math.PI,
        -1
      );
  
      placeObject(
        "./models/summer/surfboard/scene.gltf",
        0.3,
        0.3,
        0.3,
        radius - 0.05,
        1.2,
        0.2,
        0,
        Math.PI,
        -0.4
      );
      placeObject(
        "./models/summer/sandcastle/scene.gltf",
        0.004,
        0.004,
        0.004,
        radius - 0.3,
        0.8,
        -0.4,
        0,
        Math.PI,
        -0.5
      );
  
      placeObject(
        "./models/summer/tubeseries/scene.gltf",
        0.8,
        0.8,
        0.8,
        radius + 0.01,
        1.25,
        -0.25,
        0,
        Math.PI,
        1.5
      );
  
      placeObject(
        "./models/summer/unicorntube/scene.gltf",
        0.3,
        0.3,
        0.3,
        radius + 0.01,
        1.4,
        0.2,
        0,
        Math.PI,
        -3
      );
  
      placeObject(
        "./models/summer/umbrella/scene.gltf",
        0.8,
        0.8,
        0.8,
        radius,
        2.3,
        -0.25,
        0,
        Math.PI,
        0
      );
  
      placeObject(
        "./models/summer/beachball/scene.gltf",
        0.5,
        0.5,
        0.5,
        radius + 0.1,
        2.33,
        -0.2,
        0,
        Math.PI,
        0
      );
  
      placeObject(
        "./models/summer/beachset/scene.gltf",
        0.5,
        0.5,
        0.5,
        radius + 0.01,
        1.8,
        -0.2,
        0,
        Math.PI,
        0.3
      );
  
      placeObject(
        "./models/summer/table/scene.gltf",
        0.04,
        0.04,
        0.04,
        radius + 0.01,
        1.75,
        0.15,
        0,
        Math.PI,
        -3
      );
  
      placeObject(
        "./models/summer/drink/malibu/scene.gltf",
        0.05,
        0.05,
        0.05,
        radius + 0.29,
        1.77,
        0.15,
        0,
        Math.PI,
        -3
      );
  
      placeObject(
        "./models/summer/table/scene.gltf",
        0.04,
        0.04,
        0.04,
        radius + 0.01,
        1.9,
        0.15,
        0,
        Math.PI,
        -5
      );
  
      placeObject(
        "./models/summer/drink/summerdrink/scene.gltf",
        0.015,
        0.015,
        0.015,
        radius + 0.3,
        1.92,
        0.15,
        0,
        Math.PI,
        -3
      );
  
      placeObject(
        "./models/summer/sandcastle/scene.gltf",
        0.004,
        0.004,
        0.004,
        radius - 0.3,
        2.3,
        0.4,
        0,
        Math.PI,
        -0.7
      );
  
      placeObject(
        "./models/summer/cactus/scene.gltf",
        0.15,
        0.15,
        0.15,
        radius - 0.3,
        2.8,
        0.6,
        0,
        Math.PI,
        -0.7
      );
  
      placeObject(
        "./models/summer/palmtree/scene.gltf",
        0.1,
        0.1,
        0.1,
        radius,
        2.8,
        -0.4,
        0,
        Math.PI,
        -0.7
      );
  
      placeObject(
        "./models/summer/palmtree/scene.gltf",
        0.07,
        0.07,
        0.07,
        radius,
        2.95,
        -0.8,
        0,
        Math.PI,
        -0.7
      );
  
      placeObject(
        "./models/summer/parasol/scene.gltf",
        0.2,
        0.2,
        0.2,
        radius - 0.2,
        3.4,
        0.7,
        0,
        Math.PI,
        1
      );
  
      placeObject(
        "./models/summer/surfboard/scene.gltf",
        0.3,
        0.3,
        0.3,
        radius - 0.05,
        3.5,
        -0.7,
        0,
        Math.PI,
        -0.9
      );
  
      placeObject(
        "./models/summer/beach_chair_blue_stripes/scene.gltf",
        0.4,
        0.4,
        0.4,
        radius,
        4,
        -0.2,
        0,
        Math.PI,
        -5
      );
  
      placeObject(
        "./models/summer/beach_chair_blue_stripes/scene.gltf",
        0.4,
        0.4,
        0.4,
        radius,
        0.8,
        0.2,
        0,
        Math.PI,
        -1
      );
}

function fall() {
    console.log("fall button pushed");

    // 기존 오브젝트 삭제
    while (sphere.children.length > 0) {
        sphere.remove(sphere.children[0]);
    }

    // 새로운 나무 모델 경로로 업데이트
    treeModelName = "./models/small_tree/pretty_big_tree_3.gltf";
    createTree(scaleValue = 0.1);

    baseColorPath = "./textures/Fresh_and_Dried_Tagetes_tbxnkko_1K_BaseColor.jpg";                  // 기본 색상 텍스처
    normalMapPath = "./textures/Fresh_and_Dried_Tagetes_tbxnkko_1K_Normal.jpg";                     // 노멀 맵
    roughnessMapPath = "./textures/Fresh_and_Dried_Tagetes_tbxnkko_1K_Roughness.jpg";               // 거칠기 맵
    heightMapPath = "./textures/Stylized_Sand_001_height.png";                     // 높이 맵
    ambientOcclusionMapPath = "./textures/Stylized_Sand_001_ambientOcclusion.jpg"; // 주변광 차단 맵
    setupTextureLoader();
}

function winter() {
    console.log("winter button pushed");

    // 기존 오브젝트 삭제
    while (sphere.children.length > 0) {
        sphere.remove(sphere.children[0]);
    }

    // 새로운 나무 모델 경로로 업데이트
    treeModelName = "./models/winterObject/snowTree/scene.gltf";
    createTree(scaleValue = 0.3);

    baseColorPath = "./textures/Snow_004_COLOR.jpg";                  // 기본 색상 텍스처
    normalMapPath = "./textures/Snow_004_NORM.jpg";                     // 노멀 맵
    roughnessMapPath = "./textures/Snow_004_ROUGH.jpg";               // 거칠기 맵
    heightMapPath = "../textures/Snow_004_DISP.png";                     // 높이 맵
    ambientOcclusionMapPath = "./textures/Snow_004_OCC.jpg"; // 주변광 차단 맵
    setupTextureLoader();

    // //집 로드
    // placeObject(
    //     "./models/winterObject/winter_house/scene.gltf",
    //     scaleX = 0.1, scaleY = 0.1, scaleZ = 0.1,
    //     posRadius = radius,   // 구의 반경
    //     posPhi = 20,         // 세로 각도
    //     posTheta = -12.8,     // 가로 각도
    //     rotX =0 , rotY =Math.PI, rotZ = 0,
    //     );
    //     placeObject(
    //       "./models/winterObject/winter_house/scene.gltf",
    //       scaleX = 0.07, scaleY = 0.07, scaleZ = 0.07,
    //       posRadius = radius,   // 구의 반경
    //       posPhi = 20,         // 세로 각도
    //       posTheta = -12.7,     // 가로 각도
    //       rotX =0 , rotY =Math.PI, rotZ = 0,
    //       );
    //       placeObject(
    //         "./models/winterObject/winter_house2/scene.gltf",
    //         scaleX = 0.1, scaleY = 0.1, scaleZ = 0.1,
    //         posRadius = radius,   // 구의 반경
    //         posPhi = 20.2,         // 세로 각도
    //         posTheta = -12.4,     // 가로 각도
    //         rotX =0 , rotY =Math.PI, rotZ = 0,
    //         );
    //         placeObject(
    //           "./models/winterObject/winter_house2/scene.gltf",
    //           scaleX = 0.07, scaleY = 0.07, scaleZ = 0.07,
    //           posRadius = radius,   // 구의 반경
    //           posPhi = 20.2,         // 세로 각도
    //           posTheta = -12.3,     // 가로 각도
    //           rotX =0 , rotY =Math.PI, rotZ = 0,
    //           );
    //           placeObject(
    //             "./models/winterObject/winter_house/scene.gltf",
    //             scaleX = 0.1, scaleY = 0.1, scaleZ = 0.1,
    //             posRadius = radius,   // 구의 반경
    //             posPhi = 20.3,         // 세로 각도
    //             posTheta = -12.8,     // 가로 각도
    //             rotX =0 , rotY =Math.PI, rotZ = 0,
    //             );
    //             placeObject(
    //               "./models/winterObject/winter_house/scene.gltf",
    //               scaleX = 0.07, scaleY = 0.07, scaleZ = 0.07,
    //               posRadius = radius,   // 구의 반경
    //               posPhi = 20.3,         // 세로 각도
    //               posTheta = -12.7,     // 가로 각도
    //               rotX =0 , rotY =Math.PI, rotZ = 0,
    //               );      
    //               placeObject(
    //                 "./models/winterObject/winter_house2/scene.gltf",
    //                 scaleX = 0.1, scaleY = 0.1, scaleZ = 0.1,
    //                 posRadius = radius,   // 구의 반경
    //                 posPhi = 20.6,         // 세로 각도
    //                 posTheta = -12.3,     // 가로 각도
    //                 rotX =0 , rotY =Math.PI, rotZ = 0,
    //                 );
    //                 placeObject(
    //                   "./models/winterObject/winter_house2/scene.gltf",
    //                   scaleX = 0.07, scaleY = 0.07, scaleZ = 0.07,
    //                   posRadius = radius,   // 구의 반경
    //                   posPhi = 20.6,         // 세로 각도
    //                   posTheta = -12.4,     // 가로 각도
    //                   rotX =0 , rotY =Math.PI, rotZ = 0,
    //                   ); 
        //눈사람 로드     
        placeObject(
           "./models/winterObject/snow_man/scene.gltf",
          scaleX = 0.1, scaleY = 0.1, scaleZ = 0.1,
          posRadius = radius+0.13,   // 구의 반경
          posPhi = 20.15,         // 세로 각도
          posTheta = -12.8,     // 가로 각도
          rotX =0 , rotY =Math.PI, rotZ = -0.5,
          );  
        placeObject(
         "./models/winterObject/snow_man/scene.gltf",
           scaleX = 0.1, scaleY = 0.1, scaleZ = 0.1,
           posRadius = radius+0.13,   // 구의 반경
           posPhi = 20.78,         // 세로 각도
           posTheta = -12.35,     // 가로 각도
           rotX =0 , rotY =Math.PI, rotZ = 3.5,
           );           
            
  //산타 로드
  placeObject(
    "./models/winterObject/santa_s_sleigh_wip/scene.gltf",
      scaleX = 0.3, scaleY = 0.3, scaleZ = 0.3,
      posRadius = radius+0.5,   // 구의 반경
      posPhi = 8.35,         // 세로 각도
      posTheta = -12.2,     // 가로 각도
      rotX =0 , rotY =Math.PI, rotZ = degreeToRadian(300),
      ); 
   //스노우볼 로드
  placeObject(
    "./models/winterObject/christmas_ball/scene.gltf",
      scaleX = 0.05, scaleY = 0.05, scaleZ = 0.05,
      posRadius = radius+0.25,   // 구의 반경
      posPhi = 23.35,         // 세로 각도
      posTheta = -12.3,     // 가로 각도
      rotX =0 , rotY =Math.PI, rotZ = degreeToRadian(300),
      ); 
  //머그컵 로드
  placeObject(
    "./models/winterObject/christmas_hot_chocolate_with_marshmallow_snowman/scene.gltf",
      scaleX = 5, scaleY = 5, scaleZ = 5,
      posRadius = radius-0.05,   // 구의 반경
      posPhi = 27.35,         // 세로 각도
      posTheta = -12.8,     // 가로 각도
      rotX =0 , rotY =Math.PI, rotZ = 0,
      ); 
  
  //크리스마스 트리 로드
  placeObject(
    "./models/winterObject/christmas_tree_polycraft/scene.gltf",
      scaleX = 0.002, scaleY = 0.002, scaleZ = 0.002,
      posRadius = radius,   // 구의 반경
      posPhi = 15.35,         // 세로 각도
      posTheta = -12,     // 가로 각도
      rotX =0 , rotY =Math.PI, rotZ = degreeToRadian(270),
      ); 
  // 캔디캐인 로드
  placeObject(
    "./models/winterObject/the_giftspenser/scene.gltf",
      scaleX = 0.0005, scaleY = 0.0005, scaleZ = 0.0005,
      posRadius = radius,   // 구의 반경
      posPhi = 5.35,         // 세로 각도
      posTheta = -13,     // 가로 각도
      rotX =0 , rotY =Math.PI, rotZ = degreeToRadian(220),
      );
  
  // 이글루 로드
  placeObject(
    "./models/winterObject/eggloo/scene.gltf",
      scaleX = 0.015, scaleY = 0.015, scaleZ = 0.015,
      posRadius = radius,   // 구의 반경
      posPhi = 10.5,         // 세로 각도
      posTheta = -0.18,     // 가로 각도
      rotX =0 , rotY =Math.PI, rotZ = 30,
      );
  
}

// Initialize the scene when the window loads
window.onload = init;