rotate = 1;
viewAll = 1;

window.onload = function init() {
  // 웹 페이지가 로드되면 init 함수 실행
  const canvas = document.getElementById("gl-canvas"); // HTML에서 'gl-canvas'라는 ID를 가진 <canvas> 요소를 가져옴
  const renderer = new THREE.WebGLRenderer({ canvas }); // WebGLRenderer를 생성하고 canvas 요소에 연결
  renderer.setSize(canvas.width, canvas.height); // 렌더러 크기를 canvas 크기로 설정
  // 배경 색을 처음에 하늘색으로 설정
  renderer.setClearColor(new THREE.Color(0x87ceeb)); // 하늘색

  // 감마 설정 (색상 표현을 개선하기 위해 감마 보정 사용)
  renderer.outputEncoding = THREE.sRGBEncoding;

  // Enable shadows in the renderer
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // 장면(Scene) 생성 (3D 오브젝트를 배치하는 공간)
  const scene = new THREE.Scene();

  // 화면 크기에 맞춰 캔버스 크기 조정
  function resizeCanvas() {
    renderer.setSize(window.innerWidth, window.innerHeight); // 창 크기에 맞게 캔버스 크기 설정
    camera.aspect = window.innerWidth / window.innerHeight; // 카메라의 종횡비 업데이트
    camera.updateProjectionMatrix(); // 카메라의 변화 반영
  }
  renderer.setSize(window.innerWidth, window.innerHeight); // 초기 창 크기에 맞추어 캔버스 설정

  // 장면에 X, Y, Z 축을 표시 (X : Red, Y : Green, Z : Blue)
  const axes = new THREE.AxesHelper(1000);
  scene.add(axes);
  /* --------------------------------------------------------------------------- */
  /* camera */

  const fov = 75;
  const aspect = 2;
  const near = 0.1;
  const far = 1000;

  // 카메라(Camera) 설정 (3D 공간을 보는 시점 설정)
  const camera = new THREE.PerspectiveCamera(
    fov, // 시야각 (FOV) 45도 설정 (화각)
    aspect, // 화면의 가로 세로 비율 설정 (종횡비)
    near, // 카메라가 인식할 수 있는 가장 가까운 거리 (근접 클리핑 평면)
    far // 카메라가 인식할 수 있는 가장 먼 거리 (원거리 클리핑 평면)
  );

  // 카메라 제어 설정 (TrackballControls를 사용하여 카메라를 마우스로 제어할 수 있도록 설정)
  if (viewAll) {
    controls = new THREE.OrbitControls(camera);
    camera.position.z = 20;
  } else {
    camera.position.set(0, 6, 3);
  }

  /* --------------------------------------------------------------------------- */

  /* --------------------------------------------------------------------------- */
  /* Light */

  // 장면에 주변광(Ambient Light) 추가 (전체적으로 고르게 빛을 비춤)
  const lightAmb = new THREE.AmbientLight(0x333333);
  // lightAmb.castShadow = true;
  scene.add(lightAmb);

  //scene.add(new THREE.AmbientLight(0x333333)); // 약한 회색 빛으로 설정
  // 방향광(Directional Light) 설정 (특정 방향으로 빛을 쏘는 조명)
  const light_top = new THREE.DirectionalLight(0xffffff, 0.5); // 하얀색 빛에 강도는 0.1로 설정
  light_top.position.set(0, 12, 0); // 빛이 -X축 방향에서 비추도록 위치 설정
  // scene.add(light_top); // 장면에 빛 추가

  // 방향광(Directional Light) 설정 (특정 방향으로 빛을 쏘는 조명)
  const light_bright = new THREE.DirectionalLight(0xffffff, 0.3); // 하얀색 빛에 강도는 0.1로 설정
  light_bright.position.set(0, 12, 0); // 빛이 -X축 방향에서 비추도록 위치 설정
  scene.add(light_bright); // 장면에 빛 추가

  // 방향광(Directional Light) 설정 (특정 방향으로 빛을 쏘는 조명)
  const light = new THREE.DirectionalLight(0xffffff, 0.1); // 하얀색 빛에 강도는 0.1로 설정
  light.position.set(-1, 0, 0); // 빛이 -X축 방향에서 비추도록 위치 설정
  scene.add(light); // 장면에 빛 추가

  // 빛의 타겟을 설정 (빛이 구체를 향하게 설정)
  const lightTarget = new THREE.Object3D(); // 빈 객체를 생성 (빛의 목표를 설정하기 위해)
  lightTarget.position.set(0, 0, 0); // 타겟을 원점(0, 0, 0)에 배치 (구체 중심)
  scene.add(lightTarget); // 장면에 타겟 추가
  light.target = lightTarget; // 빛이 타겟을 향하게 설정
  light.castShadow = true;

  light.shadow.mapSize.width = 8192;
  light.shadow.mapSize.height = 8192;
  light.shadow.camera.near = 0.5;
  light.shadow.camera.far = 50;
  light.shadow.camera.left = -20;
  light.shadow.camera.right = 20;
  light.shadow.camera.top = 20;
  light.shadow.camera.bottom = -20;

  scene.add(light);

  // 태양의 회전 변수 (태양이 구체 주위를 공전하는 모션 설정)
  const orbitRadius = 10; // 태양의 궤도 반지름 설정

  /* texture */

  // 텍스처 로더 생성 (3D 모델에 텍스처를 입히기 위한 로더)
  const loader = new THREE.TextureLoader();

  // 텍스처 파일 로드 (구체 표면에 사용할 텍스처 이미지 로드)
  let baseColor = loader.load("./textures/Snow_004_COLOR.jpg"); // 기본 색상 텍스처
  let normalMap = loader.load("./textures/Snow_004_NORM.jpg"); // 노멀 맵 (표면의 작은 굴곡 표현)
  let roughnessMap = loader.load("./textures/Snow_004_ROUGH.jpg"); // 거칠기 맵 (표면의 거칠기 표현)
  let heightMap = loader.load("./textures/Snow_004_DISP.png"); // 높이 맵 (높낮이 변화를 표현)
  let ambientOcclusionMap = loader.load("./textures/Snow_004_OCC.jpg"); // 주변광 차단 맵 (빛이 덜 도달하는 부분 표현)

  // 텍스처 반복 및 스케일 설정 (더 큰 구체에 텍스처를 여러 번 반복 적용)
  baseColor.wrapS = baseColor.wrapT = THREE.RepeatWrapping; // 텍스처를 반복시키도록 설정 (가로, 세로 방향)
  baseColor.repeat.set(4, 4); // 텍스처가 4x4로 반복되도록 설정

  normalMap.wrapS = normalMap.wrapT = THREE.RepeatWrapping; // 노멀 맵의 반복 설정
  normalMap.repeat.set(4, 4); // 4x4 반복

  roughnessMap.wrapS = roughnessMap.wrapT = THREE.RepeatWrapping; // 거칠기 맵의 반복 설정
  roughnessMap.repeat.set(4, 4); // 4x4 반복

  heightMap.wrapS = heightMap.wrapT = THREE.RepeatWrapping; // 높이 맵의 반복 설정
  heightMap.repeat.set(4, 4); // 4x4 반복

  ambientOcclusionMap.wrapS = ambientOcclusionMap.wrapT = THREE.RepeatWrapping; // 주변광 차단 맵 반복 설정
  ambientOcclusionMap.repeat.set(4, 4); // 4x4 반복

  /* --------------------------------------------------------------------------- */

  /* --------------------------------------------------------------------------- */
  /* globe */

  // // 구체 설정 (크기 및 세그먼트)
  const radius = 6; // 구체의 반지름 설정 (구체의 크기)
  const segments = 256; // 구체를 렌더링할 때 사용할 세그먼트 수 (세부 표현도를 높임)
  const rotation = 6; // 구체의 초기 회전 각도 설정

  const sphere_spring = new THREE.Mesh(
    new THREE.SphereGeometry(radius, segments, segments),
    new THREE.MeshStandardMaterial({
      map: baseColor, // 기본 색상 텍스처
      normalMap: normalMap, // 노멀 맵 적용 (표면 굴곡 표현)
      roughnessMap: roughnessMap, // 거칠기 맵 적용
      displacementMap: heightMap, // 높이 맵 적용 (표면의 높낮이 표현)
      aoMap: ambientOcclusionMap, // 주변광 차단 맵 적용
      roughness: 0.8, // 표면의 거칠기 설정 (값이 클수록 거칠어짐)
      metalness: 0.0, // 금속성 제거 (0으로 설정하여 금속 느낌 없앰)
      displacementScale: 0.03, // 높이 맵의 변위를 조절 (표면의 높낮이 변화를 조정)
    })
  );
  // 새로운 텍스처 파일 로드
  baseColor = loader.load(
    "./textures/Poliigon_GrassPatchyGround_4585_BaseColor.jpg"
  ); // 기본 색상 텍스처
  normalMap = loader.load(
    "./textures/Poliigon_GrassPatchyGround_4585_Normal.jpg"
  ); // 노멀 맵
  roughnessMap = loader.load(
    "./textures/Poliigon_GrassPatchyGround_4585_Roughness.jpg"
  ); // 거칠기 맵
  heightMap = loader.load(
    "./textures/Poliigon_GrassPatchyGround_4585_Displacement.tiff"
  ); // 높이 맵
  ambientOcclusionMap = loader.load(
    "./textures/Poliigon_GrassPatchyGround_4585_AmbientOcclusion.jpg"
  ); // 주변광 차단 맵

  // 텍스처 반복 및 스케일 설정
  baseColor.wrapS = baseColor.wrapT = THREE.RepeatWrapping;
  baseColor.repeat.set(5, 5);

  normalMap.wrapS = normalMap.wrapT = THREE.RepeatWrapping;
  normalMap.repeat.set(5, 5);

  roughnessMap.wrapS = roughnessMap.wrapT = THREE.RepeatWrapping;
  roughnessMap.repeat.set(5, 5);

  heightMap.wrapS = heightMap.wrapT = THREE.RepeatWrapping;
  heightMap.repeat.set(5, 5);

  ambientOcclusionMap.wrapS = ambientOcclusionMap.wrapT = THREE.RepeatWrapping;
  ambientOcclusionMap.repeat.set(5, 5);

  // 구의 재질 텍스처 업데이트
  sphere_spring.material.map = baseColor;
  sphere_spring.material.normalMap = normalMap;
  sphere_spring.material.roughnessMap = roughnessMap;
  sphere_spring.material.displacementMap = heightMap;
  sphere_spring.material.aoMap = ambientOcclusionMap;

  sphere_spring.receiveShadow = true;
  scene.add(sphere_spring);

  const sphere_summer = new THREE.Mesh(
    new THREE.SphereGeometry(radius, segments, segments),
    new THREE.MeshStandardMaterial({
      map: baseColor, // 기본 색상 텍스처
      normalMap: normalMap, // 노멀 맵 적용 (표면 굴곡 표현)
      roughnessMap: roughnessMap, // 거칠기 맵 적용
      displacementMap: heightMap, // 높이 맵 적용 (표면의 높낮이 표현)
      aoMap: ambientOcclusionMap, // 주변광 차단 맵 적용
      roughness: 0.8, // 표면의 거칠기 설정 (값이 클수록 거칠어짐)
      metalness: 0.0, // 금속성 제거 (0으로 설정하여 금속 느낌 없앰)
      displacementScale: 0.03, // 높이 맵의 변위를 조절 (표면의 높낮이 변화를 조정)
    })
  );
  // sphere_summer.position.x = 24;
  // 새로운 텍스처 파일 로드
  baseColor = loader.load("./textures/Stylized_Sand_001_basecolor.jpg");
  normalMap = loader.load("./textures/Stylized_Sand_001_normal.jpg");
  roughnessMap = loader.load("./textures/Stylized_Sand_001_roughness.jpg");
  heightMap = loader.load("./textures/Stylized_Sand_001_height.png");
  ambientOcclusionMap = loader.load(
    "./textures/Stylized_Sand_001_ambientOcclusion.jpg"
  );

  // 텍스처 반복 및 스케일 설정
  baseColor.wrapS = baseColor.wrapT = THREE.RepeatWrapping;
  baseColor.repeat.set(6, 6);

  normalMap.wrapS = normalMap.wrapT = THREE.RepeatWrapping;
  normalMap.repeat.set(6, 6);

  roughnessMap.wrapS = roughnessMap.wrapT = THREE.RepeatWrapping;
  roughnessMap.repeat.set(6, 6);

  heightMap.wrapS = heightMap.wrapT = THREE.RepeatWrapping;
  heightMap.repeat.set(6, 6);

  ambientOcclusionMap.wrapS = ambientOcclusionMap.wrapT = THREE.RepeatWrapping;
  ambientOcclusionMap.repeat.set(6, 6);

  // 구의 재질 텍스처 업데이트
  sphere_summer.material.map = baseColor;
  sphere_summer.material.normalMap = normalMap;
  sphere_summer.material.roughnessMap = roughnessMap;
  sphere_summer.material.displacementMap = heightMap;
  sphere_summer.material.aoMap = ambientOcclusionMap;

  // 텍스처 업데이트 반영
  sphere_summer.material.needsUpdate = true;
  sphere_summer.receiveShadow = true;
  scene.add(sphere_summer);

  const sphere_autumn = new THREE.Mesh(
    new THREE.SphereGeometry(radius, segments, segments),
    new THREE.MeshStandardMaterial({
      map: baseColor, // 기본 색상 텍스처
      normalMap: normalMap, // 노멀 맵 적용 (표면 굴곡 표현)
      roughnessMap: roughnessMap, // 거칠기 맵 적용
      displacementMap: heightMap, // 높이 맵 적용 (표면의 높낮이 표현)
      aoMap: ambientOcclusionMap, // 주변광 차단 맵 적용
      roughness: 0.8, // 표면의 거칠기 설정 (값이 클수록 거칠어짐)
      metalness: 0.0, // 금속성 제거 (0으로 설정하여 금속 느낌 없앰)
      displacementScale: 0.03, // 높이 맵의 변위를 조절 (표면의 높낮이 변화를 조정)
    })
  );
  // sphere_autumn.position.x = 48;

  // 텍스처 파일 로드 (구체 표면에 사용할 텍스처 이미지 로드)
  baseColor = loader.load(
    "./textures/Fresh_and_Dried_Tagetes_tbxnkko_1K_BaseColor.jpg"
  ); // 기본 색상 텍스처
  normalMap = loader.load(
    "./textures/Fresh_and_Dried_Tagetes_tbxnkko_1K_Normal.jpg"
  ); // 노멀 맵 (표면의 작은 굴곡 표현)
  roughnessMap = loader.load(
    "./textures/Fresh_and_Dried_Tagetes_tbxnkko_1K_Roughness.jpg"
  ); // 거칠기 맵 (표면의 거칠기 표현)
  heightMap = loader.load(
    "./textures/Fresh_and_Dried_Tagetes_tbxnkko_1K_Bump.jpg"
  ); // 높이 맵 (높낮이 변화를 표현)
  ambientOcclusionMap = loader.load(
    "./textures/Fresh_and_Dried_Tagetes_tbxnkko_1K_AO.jpg"
  ); // 주변광 차단 맵 (빛이 덜 도달하는 부분 표현)

  // 텍스처 반복 및 스케일 설정
  baseColor.wrapS = baseColor.wrapT = THREE.RepeatWrapping;
  baseColor.repeat.set(5, 5);

  normalMap.wrapS = normalMap.wrapT = THREE.RepeatWrapping;
  normalMap.repeat.set(5, 5);

  roughnessMap.wrapS = roughnessMap.wrapT = THREE.RepeatWrapping;
  roughnessMap.repeat.set(5, 5);

  heightMap.wrapS = heightMap.wrapT = THREE.RepeatWrapping;
  heightMap.repeat.set(5, 5);

  ambientOcclusionMap.wrapS = ambientOcclusionMap.wrapT = THREE.RepeatWrapping;
  ambientOcclusionMap.repeat.set(5, 5);

  // 구의 재질 텍스처 업데이트
  sphere_autumn.material.map = baseColor;
  sphere_autumn.material.normalMap = normalMap;
  sphere_autumn.material.roughnessMap = roughnessMap;
  sphere_autumn.material.displacementMap = heightMap;
  sphere_autumn.material.aoMap = ambientOcclusionMap;

  // 텍스처 업데이트 반영
  sphere_autumn.material.needsUpdate = true;
  sphere_autumn.receiveShadow = true;
  scene.add(sphere_autumn);

  const sphere_winter = new THREE.Mesh(
    new THREE.SphereGeometry(radius, segments, segments),
    new THREE.MeshStandardMaterial({
      map: baseColor, // 기본 색상 텍스처
      normalMap: normalMap, // 노멀 맵 적용 (표면 굴곡 표현)
      roughnessMap: roughnessMap, // 거칠기 맵 적용
      displacementMap: heightMap, // 높이 맵 적용 (표면의 높낮이 표현)
      aoMap: ambientOcclusionMap, // 주변광 차단 맵 적용
      roughness: 0.8, // 표면의 거칠기 설정 (값이 클수록 거칠어짐)
      metalness: 0.0, // 금속성 제거 (0으로 설정하여 금속 느낌 없앰)
      displacementScale: 0.03, // 높이 맵의 변위를 조절 (표면의 높낮이 변화를 조정)
    })
  );
  // sphere_winter.position.x = 70;
  // 텍스처 파일 로드 (구체 표면에 사용할 텍스처 이미지 로드)
  baseColor = loader.load("./textures/Snow_004_COLOR.jpg"); // 기본 색상 텍스처
  normalMap = loader.load("./textures/Snow_004_NORM.jpg"); // 노멀 맵 (표면의 작은 굴곡 표현)
  roughnessMap = loader.load("./textures/Snow_004_ROUGH.jpg"); // 거칠기 맵 (표면의 거칠기 표현)
  heightMap = loader.load("./textures/Snow_004_DISP.png"); // 높이 맵 (높낮이 변화를 표현)
  ambientOcclusionMap = loader.load("./textures/Snow_004_OCC.jpg"); // 주변광 차단 맵 (빛이 덜 도달하는 부분 표현)

  // 텍스처 반복 및 스케일 설정
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

  // 구의 재질 텍스처 업데이트
  sphere_winter.material.map = baseColor;
  sphere_winter.material.normalMap = normalMap;
  sphere_winter.material.roughnessMap = roughnessMap;
  sphere_winter.material.displacementMap = heightMap;
  sphere_winter.material.aoMap = ambientOcclusionMap;

  // 텍스처 업데이트 반영
  sphere_winter.material.needsUpdate = true;
  sphere_winter.receiveShadow = true;
  scene.add(sphere_winter);

  function placeObject(
    filePath,
    sphere = null,
    scaleX = 0,
    scaleY = 0,
    scaleZ = 0,
    posRadius = radius, // 구의 반경
    posPhi = 0, // 세로 각도
    posTheta = 0, // 가로 각도
    rotX = 0,
    rotY = Math.PI,
    rotZ = 0
  ) {
    const gltf_loader = new THREE.GLTFLoader();
    gltf_loader.load(
      filePath,
      function (gltf) {
        obj = gltf.scene.children[0];
        obj.scale.set(scaleX, scaleY, scaleZ);
        obj.position.setFromSphericalCoords(posRadius, posPhi, posTheta);

        // shadow
        obj.traverse((node) => {
          if (node.isMesh) {
            node.castShadow = true; // objects cast shadows
            node.receiveShadow = true; // objects receive shadows
          }
        });

        sphere.add(obj);
        //obj.up.set(1, 0, 0); // 필요에 따라 다른 축을 설정합니다.
        obj.lookAt(sphere.position);

        obj.rotation.x += rotX;
        obj.rotation.y += rotY;
        obj.rotation.z += rotZ;
        // render();
      },
      undefined,
      function (error) {
        console.error(error);
      }
    );
  }

  let modelName = "./models/autumn_objects/prune_tree_1.gltf";
  console.log("model name:", modelName);

  function createTree(sphere) {
    let models;
    gltf_loader.load(
      modelName,
      function (gltf) {
        const model = gltf.scene;
        model.scale.set(0.2, 0.2, 0.2);

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
          let phi = Math.PI - Math.PI / 3 - 0.35;
          let theta = i;
          // 반지름, phi값, theta 값 (radius, phi, theta) -> phi는 y축 기준, theta는 z축 기준
          objCopy.position.setFromSphericalCoordsYZ(radius + 0.5, phi, theta);
          objCopy.rotation.x += i;
          sphere.add(objCopy);
        }

        for (var i = 0; i < 2 * Math.PI; i += Math.PI / 6) {
          const objCopy = models.clone();
          let phi = Math.PI / 3 + 0.35;
          let theta = i;
          // 반지름, phi값, theta 값 (radius, phi, theta) -> phi는 y축 기준, theta는 z축 기준
          objCopy.position.setFromSphericalCoordsYZ(radius + 0.5, phi, theta);
          objCopy.rotation.x += i;
          sphere.add(objCopy);
        }
      },
      undefined,
      function (error) {
        console.error(error);
      }
    );
  }

  /* --------------------------------------------------------------------------- */

  // 각도를 라디안으로 변환하는 함수
  function degreeToRadian(degree) {
    return degree * (Math.PI / 180);
  }

  /* --------------------------------------------------------------------------- */
  /* clock and time*/
  // 시간 관련 정보 반환 함수
  function getCurrentTimeInfo() {
    const now = new Date();
    const utcHours = now.getUTCHours();
    const kstHours = (utcHours + 9) % 24;
    // const kstHours = 15;
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
      normalizedTime,
    };
  }

  // 1초마다 시계와 배경색을 업데이트
  function setupClock() {
    setInterval(() => {
      updateClock();
      updateBackgroundColor(); // 시간에 맞추어 배경색 업데이트
    }, 1000);
  }

  // 시계 업데이트 함수
  function updateClock() {
    const { kstHours, hours, minutes, seconds } = getCurrentTimeInfo();
    const clockElement = document.getElementById("clock");
    clockElement.textContent = `${String(hours).padStart(2, "0")}:${String(
      minutes
    ).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    // 밤 9시에 유성우 활성화
    if (kstHours >= 19 && !meteorShowerActive) {
      meteorShowerActive = true;
      if (meteorMode) {
        createMeteorShower();
      } else {
        createStarField();
      }
    }
  }

  /* --------------------------------------------------------------------------- */

  /* Light temperature  */
  // 광원 위치 및 색 온도 업데이트 함수
  function updateLightPosition() {
    const { kstHours, normalizedTime } = getCurrentTimeInfo();
    // console.log(kstHours, normalizedTime);

    // 각도를 0시부터 24시 기준으로 180도로 매핑
    const angle = (kstHours / 24) * Math.PI - Math.PI;

    // 광원의 위치 설정 (XZ 평면에서만 회전)
    const x = orbitRadius * Math.cos(angle);
    const y = orbitRadius * Math.sin(angle);
    light.position.set(x, -y, 0);
    light.lookAt(sphere_spring);

    // 색 온도 조정
    if (kstHours >= 7 && kstHours < 18) {
      light_top.color.setRGB(0.996, 0.816, 0.8); // 낮 시간: 주황색
      light.color.setRGB(0.996, 0.816, 0.8); // 낮 시간: 주황색
    } else if (kstHours >= 6 && kstHours < 7) {
      light_top.color.setRGB(1.0, 0.498, 0.0);
      light.color.setRGB(1.0, 0.498, 0.0); // 낮 시간: 주황색
    } else if (kstHours >= 18 && kstHours < 19) {
      light_top.color.setRGB(1.0, 0.498, 0.0);
      light.color.setRGB(1.0, 0.498, 0.0);
    } else {
      light_top.color.setRGB(0.027, 0.224, 0.322); // 밤 시간: 파란색
      light.color.setRGB(0.027, 0.224, 0.322); // 밤 시간: 파란색
    }
  }

  /* --------------------------------------------------------------------------- */

  function getTimeBasedColorValue() {
    const now = new Date();
    const secondsInDay =
      now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

    // 0 ~ 1 사이의 비율 계산
    const normalizedTime = secondsInDay / 86400;

    // 코사인 함수를 사용하여 0시에 어둡고 12시에 밝게 조정
    // 코사인 곡선으로 -1 ~ 1 사이 값을 0 ~ 1로 매핑
    const brightness = (Math.cos(2 * Math.PI * normalizedTime) + 1) / 2;

    // brightness 값을 0.2에서 1로 조정
    const adjustedBrightness = 0.2 + brightness * (1 - 0.2);

    return brightness; // 0.2 (어두운 밤) ~ 1 (밝은 낮) 사이의 값
  }

  /* --------------------------------------------------------------------------- */
  function degreeToRadian(degree) {
    return degree * (Math.PI / 180);
  }

  /* --------------------------------------------------------------------------- */
  /* background */

  // 배경 색상 업데이트 함수 (시간에 따라 배경색이 변화)
  function updateBackgroundColor() {
    const { normalizedTime } = getCurrentTimeInfo();
    const skyColor = new THREE.Color(0x87ceeb); // 밝은 하늘색
    const eveningColor = new THREE.Color(0x1c1c72); // 어두운 저녁색
    const currentColor = skyColor.lerp(
      eveningColor,
      (Math.cos(2 * Math.PI * normalizedTime) + 1) / 2
    );
    renderer.setClearColor(currentColor); // 배경 색상 업데이트
  }

  /* --------------------------------------------------------------------------- */
  /* Meteor */
  let meteors = [];
  let meteorShowerActive = false;
  let meteorMode = 0;
  function createMeteorShower() {
    // Define the number of meteors you want
    const meteorCount = 20;

    // Create meteors
    for (let i = 0; i < meteorCount; i++) {
      const geometry = new THREE.SphereGeometry(0.1, 8, 8); // Small glowing particles
      const material = new THREE.MeshBasicMaterial({
        color: 0xffff99,
        emissive: 0xffff99,
      }); // Glow effect

      const meteor = new THREE.Mesh(geometry, material);

      // Random position above the scene
      meteor.position.set(
        (Math.random() - 0.5) * 20, // Random x position
        Math.random() * 10 + 5, // Random y position above the sphere
        (Math.random() - 0.5) * 20 // Random z position
      );

      // Add meteor to the scene and meteors array for tracking
      scene.add(meteor);
      meteors.push(meteor);
    }
  }

  function animateMeteorShower() {
    // Move each meteor downward
    meteors.forEach((meteor) => {
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
      const material = new THREE.MeshBasicMaterial({
        color: 0xffffcc,
        emissive: 0xffffcc,
      }); // Soft glow

      const star = new THREE.Mesh(geometry, material);

      // Place stars at random positions around the sphere
      const distance = radius + Math.random() * 5 + 5; // Position stars further from the sphere
      const theta = Math.random() * 2 * Math.PI; // Random angle in the horizontal plane
      const phi = Math.random() * Math.PI; // Random angle in the vertical plane

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
  /* slider */

  // 슬라이드 바로 광원 밝기 조절
  const slider = document.getElementById("light-intensity");
  slider.value = light.intensity; // 슬라이더 초기 값을 광원의 초기 강도와 동기화

  slider.addEventListener("input", function () {
    light.intensity = parseFloat(slider.value); // 슬라이드 바 값을 광원의 밝기로 설정
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

  /* --------------------------------------------------------------------------- */

  /* --------------------------------------------------------------------------- */

  document.getElementById("spring").onclick = function () {
    spring_camera();
  };
  document.getElementById("summer").onclick = function () {
    summer_camera();
  };
  document.getElementById("fall").onclick = function () {
    fall_camera();
  };
  document.getElementById("winter").onclick = function () {
    winter_camera();
  };

  function spring_camera() {
    sphere_spring.scale.set(1, 1, 1);
    sphere_summer.scale.set(0.1, 0.1, 0.1);
    sphere_autumn.scale.set(0.1, 0.1, 0.1);
    sphere_winter.scale.set(0.1, 0.1, 0.1);
  }
  function summer_camera() {
    sphere_spring.scale.set(0.1, 0.1, 0.1);
    sphere_summer.scale.set(1, 1, 1);
    sphere_autumn.scale.set(0.1, 0.1, 0.1);
    sphere_winter.scale.set(0.1, 0.1, 0.1);
  }
  function fall_camera() {
    sphere_spring.scale.set(0.1, 0.1, 0.1);
    sphere_summer.scale.set(0.1, 0.1, 0.1);
    sphere_autumn.scale.set(1, 1, 1);
    sphere_winter.scale.set(0.1, 0.1, 0.1);
  }
  function winter_camera() {
    sphere_spring.scale.set(0.1, 0.1, 0.1);
    sphere_summer.scale.set(0.1, 0.1, 0.1);
    sphere_autumn.scale.set(0.1, 0.1, 0.1);
    sphere_winter.scale.set(1, 1, 1);
  }

  /* --------------------------------------------------------------------------- */

  /* --------------------------------------------------------------------------- */
  // 고양이 GLTFLoader로 올린 이후에 구체 위에 올리기
  let cat, mixer;
  const catScale = 0.0009;
  const gltf_loader = new THREE.GLTFLoader();
  gltf_loader.load(
    // "../../move_cat/cute_penguin/scene.gltf",
    "../../move_cat/toon_cat_free/scene.gltf",
    function (gltf) {
      cat = gltf.scene.children[0];
      cat.scale.set(catScale, catScale, catScale);

      // shadow
      cat.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true; // Trees cast shadows
          child.receiveShadow = true; // Trees receive shadows
        }
      });
      cat.position.setFromSphericalCoords(radius + 0.03, Math.PI / 10, 0);

      mixer = new THREE.AnimationMixer(cat);
      if (gltf.animations.length > 0) {
        const action = mixer.clipAction(gltf.animations[0]);
        action.play();
      }

      scene.add(gltf.scene);
      // render();
    },
    undefined,
    function (error) {
      console.error(error);
    }
  );

  // 회전 및 점프 토글 함수
  function toggleRotationAndJump() {
    // 회전 상태를 토글
    rotate = !rotate;

    // 점프 상태를 초기화하여 고양이가 멈추게 함
    isJumping = false;
    jumpDirection = 1; // 초기화 (위로 올라가는 방향으로 설정)

    // 구와 고양이의 현재 위치 유지
    if (!rotate && mixer) {
      mixer.stopAllAction(); // 모든 애니메이션 중지
    } else if (rotate && mixer) {
      // 고양이 애니메이션을 재할당하고 재생
      const action = mixer.clipAction(mixer._actions[0]._clip);
      action.play();
    }
  }
  window.addEventListener(
    "keydown",
    (event) => {
      if (event.code === "ArrowUp") {
        console.log("ArrowUp is pushed");
        event.preventDefault(); // This prevents the default action if not passive
        handleJump();
      }
    },
    { passive: false }
  );

  window.addEventListener(
    "keydown",
    (event) => {
      if (event.code === "Space") {
        console.log("Space is pushed");
        event.preventDefault(); // This prevents the default action if not passive
        toggleRotationAndJump();
      }
    },
    { passive: false }
  );

  let isJumping = false; // Variable to check if the cat is currently jumping
  let jumpHeight = 0.5; // Maximum height of the jump
  let jumpSpeed = 0.02; // Speed of the jump
  let jumpDirection = 1; // 1 for up, -1 for down

  function handleJump() {
    if (isJumping) return; // Prevent multiple jumps

    isJumping = true;
    let initialY = cat.position.y; // Store initial Y position of the cat

    function jumpAnimation() {
      // Move the cat up and down
      cat.position.y += jumpSpeed * jumpDirection;

      // If the cat reaches the max height, start descending
      if (cat.position.y >= initialY + jumpHeight) {
        jumpDirection = -1; // Change direction to downward
      }

      // If the cat is back to the initial position, end the jump
      if (cat.position.y <= initialY && jumpDirection === -1) {
        cat.position.y = initialY; // Reset to exact initial position
        isJumping = false; // End the jump by setting isJumping to false
        jumpDirection = 1; // Reset direction for next jump
        return;
      }

      // Continue the jump animation
      requestAnimationFrame(jumpAnimation);
    }

    jumpAnimation(); // Start the jump animation
  }

  /* --------------------------------------------------------------------------- */

  function spring() {
    console.log("spring button pushed");

    // 새로운 나무 모델 경로로 업데이트
    modelName =
      "./models/spring/low-_poly_cherry_blossom_tree_3d_models/scene.gltf";

    gltf_loader.load(
      modelName,
      function (gltf) {
        const model = gltf.scene;
        model.scale.set(0.05, 0.05, 0.05);

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
          let phi = Math.PI - Math.PI / 3 - 0.35;
          let theta = i;
          // 반지름, phi값, theta 값 (radius, phi, theta) -> phi는 y축 기준, theta는 z축 기준
          objCopy.position.setFromSphericalCoordsYZ(radius, phi, theta);
          objCopy.rotation.x += i;
          sphere_spring.add(objCopy);
        }

        for (var i = 0; i < 2 * Math.PI; i += Math.PI / 6) {
          const objCopy = models.clone();
          let phi = Math.PI / 3 + 0.35;
          let theta = i;
          // 반지름, phi값, theta 값 (radius, phi, theta) -> phi는 y축 기준, theta는 z축 기준
          objCopy.position.setFromSphericalCoordsYZ(radius, phi, theta);
          objCopy.rotation.x += i;
          objCopy.rotation.y = 90;
          sphere_spring.add(objCopy);
        }
      },
      undefined,
      function (error) {
        console.error(error);
      }
    );

    placeObject(
      (filePath = "./models/spring/chick_trio_gltf/scene.gltf"),
      (sphere = sphere_spring),
      (scaleX = 0.5),
      (scaleY = 0.5),
      (scaleZ = 0.5),
      (posRadius = radius - 0.1),
      (posPhi = Math.PI / 4 - 0.3),
      (posTheta = Math.PI / 4)
    );

    placeObject(
      (filePath = "./models/spring/pink_big_tree/scene.gltf"),
      (sphere = sphere_spring),
      (scaleX = 0.002),
      (scaleY = 0.002),
      (scaleZ = 0.002),
      (posRadius = radius + 0.1),
      (posPhi = Math.PI / 4 - 25),
      (posTheta = Math.PI / 4 + 300)
    );

    placeObject(
      (filePath = "./models/spring/low_poly_camper/scene.gltf"),
      (sphere = sphere_spring),
      (scaleX = 0.2),
      (scaleY = 0.2),
      (scaleZ = 0.2),
      (posRadius = radius - 0.07),
      (posPhi = degreeToRadian(80)),
      (posTheta = -degreeToRadian(35)),
      (rotX = degreeToRadian(0)),
      (rotY = degreeToRadian(170)),
      (rotZ = -degreeToRadian(15))
    );

    placeObject(
      (filePath =
        "./models/spring/japanese_cherry_blossom_-_single_flower/scene.gltf"),
      (sphere = sphere_spring),
      (scaleX = 5),
      (scaleY = 5),
      (scaleZ = 5),
      (posRadius = radius + 0.1),
      (posPhi = Math.PI / 4 - 305),
      (posTheta = Math.PI / 4 - 3),
      (rotX = degreeToRadian(90))
    );

    placeObject(
      (filePath = "./models/spring/hot_air_baloon/scene.gltf"),
      (sphere = sphere_spring),
      (scaleX = 1),
      (scaleY = 1),
      (scaleZ = 1),
      (posRadius = radius + 1),
      (posPhi = Math.PI / 4 - 30),
      (posTheta = Math.PI / 4 - 3)
    );

    placeObject(
      (filePath = "./models/spring/pink_big_tree/scene.gltf"),
      (sphere = sphere_spring),
      (scaleX = 0.002),
      (scaleY = 0.002),
      (scaleZ = 0.002),
      (posRadius = radius + 0.1),
      (posPhi = degreeToRadian(190)),
      (posTheta = degreeToRadian(90))
    );

    placeObject(
      (filePath = "./models/spring/cute_chick/scene.gltf"),
      (sphere = sphere_spring),
      (scaleX = 0.4),
      (scaleY = 0.4),
      (scaleZ = 0.4),
      (posRadius = radius + 0.1),
      (posPhi = degreeToRadian(95)),
      (posTheta = degreeToRadian(170)),
      (rotY = degreeToRadian(0)),
      (rotZ = degreeToRadian(180))
    );

    placeObject(
      (filePath = "./models/spring/pink_big_tree/scene.gltf"),
      (sphere = sphere_spring),
      (scaleX = 0.002),
      (scaleY = 0.002),
      (scaleZ = 0.002),
      (posRadius = radius + 0.1),
      (posPhi = degreeToRadian(385)),
      (posTheta = degreeToRadian(70))
    );
  }

  /* ----- */

  function summer() {
    console.log("button push");

    // 새로운 나무 모델 경로로 업데이트
    modelName = "./models/summer/tree/scene.gltf";

    function createTree() {
      let models;
      gltf_loader.load(
        modelName,
        function (gltf) {
          const model = gltf.scene;
          model.scale.set(0.7, 0.7, 0.7);

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
            let phi = Math.PI - Math.PI / 2.5 - 0.1;
            let theta = i;
            // 반지름, phi값, theta 값 (radius, phi, theta) -> phi는 y축 기준, theta는 z축 기준
            objCopy.position.setFromSphericalCoordsYZ(radius - 0.2, phi, theta);
            objCopy.rotation.x += i;
            sphere_summer.add(objCopy);
          }

          for (var i = 0; i < 2 * Math.PI; i += Math.PI / 6) {
            const objCopy = models.clone();
            let phi = Math.PI / 2.5 + 0.1;
            let theta = i;
            // 반지름, phi값, theta 값 (radius, phi, theta) -> phi는 y축 기준, theta는 z축 기준
            objCopy.position.setFromSphericalCoordsYZ(radius - 0.2, phi, theta);
            objCopy.rotation.x += i;
            sphere_summer.add(objCopy);
          }
        },
        undefined,
        function (error) {
          console.error(error);
        }
      );
    }

    // 새 모델을 사용해 나무를 다시 생성
    createTree();
    //createFence();

    placeObject(
      "./models/summer/umbrella/scene.gltf",
      sphere_summer,
      0.8,
      0.8,
      0.8,
      radius,
      0.3,
      0.41
    );

    placeObject(
      "./models/summer/beachball/scene.gltf",
      sphere_summer,
      0.6,
      0.6,
      0.6,
      radius + 0.1,
      0.34,
      0.4
    );

    placeObject(
      "./models/summer/icecream/scene.gltf",
      sphere_summer,
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
      sphere_summer,
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
      sphere_summer,
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
      sphere_summer,
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
      sphere_summer,
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
      sphere_summer,
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
      sphere_summer,
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
      sphere_summer,
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
      sphere_summer,
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
      sphere_summer,
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
      sphere_summer,
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
      sphere_summer,
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
      sphere_summer,
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
      sphere_summer,
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
      "./models/summer/cactus/scene.gltf",
      sphere_summer,
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
      sphere_summer,
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
      sphere_summer,
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
      sphere_summer,
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
      "./models/summer/beach_chair_blue_stripes/scene.gltf",
      sphere_summer,
      0.4,
      0.4,
      0.4,
      radius,
      4,
      -0.2,
      0,
      Math.PI,
      -4
    );

    placeObject(
      "./models/summer/beach_chair_blue_stripes/scene.gltf",
      sphere_summer,
      0.4,
      0.4,
      0.4,
      radius,
      4.1,
      -0.2,
      0,
      Math.PI,
      -4
    );

    placeObject(
      "./models/summer/cactus/scene.gltf",
      sphere_summer,
      0.15,
      0.15,
      0.15,
      radius - 0.3,
      4.4,
      0.2,
      0,
      Math.PI,
      3
    );

    placeObject(
      "./models/summer/rainbowtube/scene.gltf",
      sphere_summer,
      0.15,
      0.15,
      0.15,
      radius,
      4.4,
      -0.25,
      0,
      Math.PI,
      2
    );
  }

  /* ----- */

  // fall
  function fall() {
    console.log("fall button pushed");

    // 새로운 나무 모델 경로로 업데이트
    modelName = "./models/autumn_objects/pretty_big_tree_3.gltf";

    function createFallTree() {
      // 모여있는 나무들
      gltf_loader.load(
        "./models/autumn_objects/pretty_big_tree_3.gltf",
        function (gltf) {
          // 수풀 옆 왼쪽 나무 1
          const model = gltf.scene;
          model.scale.set(0.12, 0.12, 0.12);
          model.position.setFromSphericalCoords(
            radius,
            Math.PI / 16,
            Math.PI / 2
          );

          // shadow
          model.traverse((node) => {
            if (node.isMesh) {
              node.castShadow = true; // objects cast shadows
              node.receiveShadow = true; // objects receive shadows
            }
          });

          model.rotation.x += Math.PI / 6;
          model.rotation.y -= Math.PI / 2;
          model.position.z += 3;
          model.position.x += 0.5;
          sphere_autumn.add(model);

          // 수풀 옆 왼쪽 나무 2
          const nex_objCopy_0 = model.clone();
          nex_objCopy_0.position.setFromSphericalCoords(
            radius + 0.2,
            Math.PI / 16,
            Math.PI / 2
          );
          nex_objCopy_0.position.z += 5;
          nex_objCopy_0.position.y -= 2;
          nex_objCopy_0.position.x += 0.5;
          sphere_autumn.add(nex_objCopy_0);

          // 오른쪽 나무 1
          const objCopy_0 = model.clone();
          objCopy_0.position.setFromSphericalCoords(
            radius,
            Math.PI * 2 - Math.PI / 16,
            Math.PI / 2
          );
          objCopy_0.position.z += 4.5;
          objCopy_0.position.y -= 1.0;
          objCopy_0.position.x -= 0.5;
          sphere_autumn.add(objCopy_0);

          const nex_objCopy_1 = objCopy_0.clone();
          nex_objCopy_1.position.z += 1.5;
          nex_objCopy_1.position.y -= 2.5;
          nex_objCopy_1.rotation.x += Math.PI / 8;
          nex_objCopy_1.position.x -= 0.4;
          sphere_autumn.add(nex_objCopy_1);
        },
        undefined,
        function (error) {
          console.error(error);
        }
      );
    }

    function createFlowerBush() {
      // 벤치 옆 수풀
      gltf_loader.load(
        "./models/autumn_objects/bush_4.gltf",
        function (gltf) {
          // 오른쪽 나무 바로 옆 부쉬 1
          const model = gltf.scene;
          model.scale.set(0.12, 0.12, 0.12);
          model.position.setFromSphericalCoords(
            radius,
            Math.PI / 2.2,
            Math.PI / 16
          );
          // shadow
          model.traverse((node) => {
            if (node.isMesh) {
              node.castShadow = true; // objects cast shadows
              node.receiveShadow = true; // objects receive shadows
            }
          });

          model.rotation.x += Math.PI / 2;
          model.rotation.y -= Math.PI / 2;
          model.position.z += 0.2;
          sphere_autumn.add(model);

          // 왼쪽 나무 바로 옆 부쉬 1
          const nex_objCopy_0 = model.clone();
          nex_objCopy_0.position.setFromSphericalCoords(
            radius,
            Math.PI / 2.2,
            Math.PI * 2 - Math.PI / 16
          );
          nex_objCopy_0.position.z += 0.2;
          sphere_autumn.add(nex_objCopy_0);

          // 오른쪽 나무 바로 옆 부쉬 2
          const nex_objCopy_1 = model.clone();
          nex_objCopy_1.position.setFromSphericalCoords(
            radius,
            Math.PI / 1.58,
            Math.PI / 16
          );
          nex_objCopy_1.rotation.x += Math.PI / 18;
          nex_objCopy_1.position.z += 0.2;
          sphere_autumn.add(nex_objCopy_1);

          // 왼쪽 나무 벤치 옆 부쉬 2
          const nex_objCopy_2 = nex_objCopy_0.clone();
          nex_objCopy_2.position.setFromSphericalCoords(
            radius,
            Math.PI / 1.58,
            Math.PI * 2 - Math.PI / 16
          );
          nex_objCopy_2.rotation.x += Math.PI / 18;
          nex_objCopy_2.position.z += 0.2;
          sphere_autumn.add(nex_objCopy_2);
        },
        undefined,
        function (error) {
          console.error(error);
        }
      );
    }

    function createBench() {
      // 벤치
      gltf_loader.load(
        "./models/autumn_objects/chair_2.gltf",
        function (gltf) {
          // 오른쪽 나무 바로 옆 벤치 1
          const model = gltf.scene;
          model.scale.set(0.2, 0.2, 0.2);
          model.position.setFromSphericalCoords(
            radius,
            Math.PI / 2, //xz각도 오른쪽
            Math.PI / 16 //y각도
          );

          // shadow
          model.traverse((node) => {
            if (node.isMesh) {
              node.castShadow = true; // objects cast shadows
              node.receiveShadow = true; // objects receive shadows
            }
          });

          model.rotation.x += Math.PI / 2;
          model.rotation.y -= Math.PI / 2;
          model.position.z += 0.2;
          sphere_autumn.add(model);

          // 벤치1 옆 벤치
          const nex_objCopy_0 = model.clone();
          nex_objCopy_0.position.setFromSphericalCoords(
            radius,
            Math.PI / 1.7,
            Math.PI / 16
          );
          nex_objCopy_0.position.z += 0.2;
          nex_objCopy_0.rotation.x += Math.PI / 18;
          sphere_autumn.add(nex_objCopy_0);

          // 왼쪽 벤치 1
          const nex_objCopy_1 = model.clone();
          nex_objCopy_1.position.setFromSphericalCoords(
            radius,
            Math.PI / 2,
            Math.PI * 2 - Math.PI / 16
          );
          nex_objCopy_1.rotation.y -= Math.PI;
          nex_objCopy_1.position.z += 0.2;
          sphere_autumn.add(nex_objCopy_1);

          // 왼쪽 벤치 1 옆 벤치
          const nex_objCopy_2 = model.clone();
          nex_objCopy_2.position.setFromSphericalCoords(
            radius,
            Math.PI / 1.7,
            Math.PI * 2 - Math.PI / 16
          );
          nex_objCopy_2.position.z += 0.2;
          nex_objCopy_2.rotation.y -= Math.PI;
          nex_objCopy_2.rotation.x += Math.PI / 18;
          sphere_autumn.add(nex_objCopy_2);
        },
        undefined,
        function (error) {
          console.error(error);
        }
      );
    }

    function createFence() {
      gltf_loader.load(
        "./models/autumn_objects/fence_center.gltf",
        function (gltf) {
          const model = gltf.scene;
          model.scale.set(0.05, 0.05, 0.05);
          model.rotation.y += Math.PI / 2;
          for (var i = 0; i < 2 * Math.PI; i += Math.PI / 60) {
            const objCopy = model.clone();
            let phi = Math.PI / 2.1;
            let theta = i;
            // 반지름, phi값, theta 값 (radius, phi, theta) -> phi는 y축 기준, theta는 z축 기준
            objCopy.position.setFromSphericalCoordsYZ(radius + 0.1, phi, theta);
            objCopy.rotation.x += i;
            sphere_autumn.add(objCopy);
          }

          for (var i = 0; i < 2 * Math.PI; i += Math.PI / 60) {
            const objCopy = model.clone();
            let phi = Math.PI - Math.PI / 2.1;
            let theta = i;
            // 반지름, phi값, theta 값 (radius, phi, theta) -> phi는 y축 기준, theta는 z축 기준
            objCopy.position.setFromSphericalCoordsYZ(radius + 0.1, phi, theta);
            objCopy.rotation.x += i;
            sphere_autumn.add(objCopy);
          }
        },
        undefined,
        function (error) {
          console.error(error);
        }
      );
    }
    // 새 모델을 사용해 나무를 다시 생성
    createFence();
    createFallTree();
    createBench();
    createFlowerBush();

    // 보라 집
    gltf_loader.load(
      "./models/village__town_assets/village_purple_house.gltf",
      function (gltf) {
        // 오른쪽 보라색 집 1
        const model = gltf.scene;
        model.scale.set(1, 1, 1);
        model.position.setFromSphericalCoords(
          radius + 0.7,
          Math.PI / 8,
          Math.PI / 2
        );

        // shadow
        model.traverse((node) => {
          if (node.isMesh) {
            node.castShadow = true; // objects cast shadows
            node.receiveShadow = true; // objects receive shadows
          }
        });

        model.rotation.z -= Math.PI / 8;
        sphere_autumn.add(model);

        // 왼쪽 보라색 집 1
        const nex_objCopy_0 = model.clone();
        nex_objCopy_0.position.setFromSphericalCoords(
          radius + 0.8,
          Math.PI / 4,
          Math.PI + Math.PI / 8
        );
        nex_objCopy_0.rotation.z += Math.PI / 4.5;
        nex_objCopy_0.rotation.x -= Math.PI / 5;

        sphere_autumn.add(nex_objCopy_0);
      },
      undefined,
      function (error) {
        console.error(error);
      }
    );

    // 빨간 집
    gltf_loader.load(
      "./models/village__town_assets/village_red_house.gltf",
      function (gltf) {
        // 고양이 기준 바로 왼쪽 수풀 3개
        const model = gltf.scene;
        model.scale.set(1, 1, 1);
        model.position.setFromSphericalCoords(
          radius + 0.7,
          Math.PI / 8,
          Math.PI * 2 - Math.PI / 2.5
        );

        // shadow
        model.traverse((node) => {
          if (node.isMesh) {
            node.castShadow = true; // objects cast shadows
            node.receiveShadow = true; // objects receive shadows
          }
        });

        model.rotation.z += Math.PI / 8;
        sphere_autumn.add(model);

        // 오른쪽 보라색 집 1
        const nex_objCopy_0 = model.clone();
        nex_objCopy_0.position.setFromSphericalCoords(
          radius + 0.8,
          Math.PI / 3,
          Math.PI / 2 + Math.PI / 3
        );
        nex_objCopy_0.rotation.z -= Math.PI / 4;
        nex_objCopy_0.rotation.x -= Math.PI / 3;

        sphere_autumn.add(nex_objCopy_0);
      },
      undefined,
      function (error) {
        console.error(error);
      }
    );

    // 볕집 1개
    gltf_loader.load(
      "./models/village__town_assets/village_rec_straw.gltf",
      function (gltf) {
        // 밀짚 오른쪽 중앙 1
        const model = gltf.scene;
        model.scale.set(1, 1, 1);
        model.position.setFromSphericalCoordsYZ(
          radius + 0.1,
          Math.PI / 2.4,
          (Math.PI / 2) * 3
        );

        // shadow
        model.traverse((node) => {
          if (node.isMesh) {
            node.castShadow = true; // objects cast shadows
            node.receiveShadow = true; // objects receive shadows
          }
        });

        model.rotation.x += Math.PI / 2;
        model.rotation.z += Math.PI / 12;
        sphere_autumn.add(model);

        // 왼쪽 1
        const nex_objCopy_0 = model.clone();
        nex_objCopy_0.position.setFromSphericalCoordsYZ(
          radius + 0.1,
          Math.PI - Math.PI / 2.4,
          (Math.PI / 2) * 3
        );
        nex_objCopy_0.rotation.z -= Math.PI / 6;
        sphere_autumn.add(nex_objCopy_0);
      },
      undefined,
      function (error) {
        console.error(error);
      }
    );

    // 볕집 다중
    gltf_loader.load(
      "./models/village__town_assets/village_muliple_straw.gltf",
      function (gltf) {
        // 밀짚
        const model = gltf.scene;
        model.scale.set(1, 1, 1);
        model.position.setFromSphericalCoordsYZ(
          radius + 0.3,
          Math.PI / 2.4,
          Math.PI + Math.PI / 6
        );

        // shadow
        model.traverse((node) => {
          if (node.isMesh) {
            node.castShadow = true; // objects cast shadows
            node.receiveShadow = true; // objects receive shadows
          }
        });

        model.rotation.x -= Math.PI - Math.PI / 6;
        sphere_autumn.add(model);
      },
      undefined,
      function (error) {
        console.error(error);
      }
    );

    // 윈드밀
    gltf_loader.load(
      "./models/village__town_assets/village_windmill.gltf",
      function (gltf) {
        // 오른쪽 풍차
        const model = gltf.scene;
        model.scale.set(0.3, 0.3, 0.3);
        model.position.setFromSphericalCoords(
          radius + 1.0,
          Math.PI - Math.PI / 8,
          Math.PI / 3
        );

        // shadow
        model.traverse((node) => {
          if (node.isMesh) {
            node.castShadow = true; // objects cast shadows
            node.receiveShadow = true; // objects receive shadows
          }
        });

        // model.lookAt(sphere_autumn.position);
        model.rotation.x += Math.PI;
        model.rotation.z -= Math.PI / 8;
        sphere_autumn.add(model);

        // 왼쪽 풍차
        const nex_objCopy_0 = model.clone();
        nex_objCopy_0.position.setFromSphericalCoordsYZ(
          radius + 1.0,
          Math.PI / 1.8,
          Math.PI
        );
        nex_objCopy_0.rotation.z += Math.PI / 6;
        sphere_autumn.add(nex_objCopy_0);
      },
      undefined,
      function (error) {
        console.error(error);
      }
    );
  }

  /* ----- */

  // winter
  function winter() {
    console.log("button push");

    // 새로운 나무 모델 경로로 업데이트
    modelName = "./models/winterObject/snowTree/scene.gltf";

    function createTree() {
      let models;
      gltf_loader.load(
        modelName,
        function (gltf) {
          const model = gltf.scene;
          model.scale.set(0.45, 0.45, 0.45);

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
            let phi = Math.PI - Math.PI / 3 - 0.1;
            let theta = i;
            // 반지름, phi값, theta 값 (radius, phi, theta) -> phi는 y축 기준, theta는 z축 기준
            objCopy.position.setFromSphericalCoordsYZ(radius + 0.5, phi, theta);
            objCopy.rotation.x += i;
            sphere_winter.add(objCopy);
          }

          for (var i = 0; i < 2 * Math.PI; i += Math.PI / 6) {
            const objCopy = models.clone();
            let phi = Math.PI / 3 + 0.1;
            let theta = i;
            // 반지름, phi값, theta 값 (radius, phi, theta) -> phi는 y축 기준, theta는 z축 기준
            objCopy.position.setFromSphericalCoordsYZ(radius + 0.5, phi, theta);
            objCopy.rotation.x += i;
            sphere_winter.add(objCopy);
          }
        },
        undefined,
        function (error) {
          console.error(error);
        }
      );
    }
    //집 로드
    placeObject(
      "./models/winterObject/winter_house/scene.gltf",
      sphere_winter,
      (scaleX = 0.1),
      (scaleY = 0.1),
      (scaleZ = 0.1),
      (posRadius = radius), // 구의 반경
      (posPhi = 20), // 세로 각도
      (posTheta = -12.8), // 가로 각도
      (rotX = 0),
      (rotY = Math.PI),
      (rotZ = 0)
    );
    placeObject(
      "./models/winterObject/winter_house/scene.gltf",
      sphere_winter,
      (scaleX = 0.07),
      (scaleY = 0.07),
      (scaleZ = 0.07),
      (posRadius = radius), // 구의 반경
      (posPhi = 20), // 세로 각도
      (posTheta = -12.7), // 가로 각도
      (rotX = 0),
      (rotY = Math.PI),
      (rotZ = 0)
    );
    placeObject(
      "./models/winterObject/winter_house2/scene.gltf",
      sphere_winter,
      (scaleX = 0.1),
      (scaleY = 0.1),
      (scaleZ = 0.1),
      (posRadius = radius), // 구의 반경
      (posPhi = 20.2), // 세로 각도
      (posTheta = -12.4), // 가로 각도
      (rotX = 0),
      (rotY = Math.PI),
      (rotZ = 0)
    );
    placeObject(
      "./models/winterObject/winter_house2/scene.gltf",
      sphere_winter,
      (scaleX = 0.07),
      (scaleY = 0.07),
      (scaleZ = 0.07),
      (posRadius = radius), // 구의 반경
      (posPhi = 20.2), // 세로 각도
      (posTheta = -12.3), // 가로 각도
      (rotX = 0),
      (rotY = Math.PI),
      (rotZ = 0)
    );
    placeObject(
      "./models/winterObject/winter_house/scene.gltf",
      sphere_winter,
      (scaleX = 0.1),
      (scaleY = 0.1),
      (scaleZ = 0.1),
      (posRadius = radius), // 구의 반경
      (posPhi = 20.3), // 세로 각도
      (posTheta = -12.8), // 가로 각도
      (rotX = 0),
      (rotY = Math.PI),
      (rotZ = 0)
    );
    placeObject(
      "./models/winterObject/winter_house/scene.gltf",
      sphere_winter,
      (scaleX = 0.07),
      (scaleY = 0.07),
      (scaleZ = 0.07),
      (posRadius = radius), // 구의 반경
      (posPhi = 20.3), // 세로 각도
      (posTheta = -12.7), // 가로 각도
      (rotX = 0),
      (rotY = Math.PI),
      (rotZ = 0)
    );
    placeObject(
      "./models/winterObject/winter_house2/scene.gltf",
      sphere_winter,
      (scaleX = 0.1),
      (scaleY = 0.1),
      (scaleZ = 0.1),
      (posRadius = radius), // 구의 반경
      (posPhi = 20.6), // 세로 각도
      (posTheta = -12.3), // 가로 각도
      (rotX = 0),
      (rotY = Math.PI),
      (rotZ = 0)
    );
    placeObject(
      "./models/winterObject/winter_house2/scene.gltf",
      sphere_winter,
      (scaleX = 0.07),
      (scaleY = 0.07),
      (scaleZ = 0.07),
      (posRadius = radius), // 구의 반경
      (posPhi = 20.6), // 세로 각도
      (posTheta = -12.4), // 가로 각도
      (rotX = 0),
      (rotY = Math.PI),
      (rotZ = 0)
    );
    //눈사람 로드
    placeObject(
      "./models/winterObject/snow_man/scene.gltf",
      sphere_winter,
      (scaleX = 0.1),
      (scaleY = 0.1),
      (scaleZ = 0.1),
      (posRadius = radius + 0.13), // 구의 반경
      (posPhi = 20.15), // 세로 각도
      (posTheta = -12.8), // 가로 각도
      (rotX = 0),
      (rotY = Math.PI),
      (rotZ = -0.5)
    );
    placeObject(
      "./models/winterObject/snow_man/scene.gltf",
      sphere_winter,
      (scaleX = 0.1),
      (scaleY = 0.1),
      (scaleZ = 0.1),
      (posRadius = radius + 0.13), // 구의 반경
      (posPhi = 20.78), // 세로 각도
      (posTheta = -12.35), // 가로 각도
      (rotX = 0),
      (rotY = Math.PI),
      (rotZ = 3.5)
    );

    //산타 로드
    placeObject(
      "./models/winterObject/santa_s_sleigh_wip/scene.gltf",
      sphere_winter,
      (scaleX = 0.3),
      (scaleY = 0.3),
      (scaleZ = 0.3),
      (posRadius = radius + 0.5), // 구의 반경
      (posPhi = 8.35), // 세로 각도
      (posTheta = -12.2), // 가로 각도
      (rotX = 0),
      (rotY = Math.PI),
      (rotZ = degreeToRadian(300))
    );
    //스노우볼 로드
    placeObject(
      "./models/winterObject/christmas_ball/scene.gltf",
      sphere_winter,
      (scaleX = 0.05),
      (scaleY = 0.05),
      (scaleZ = 0.05),
      (posRadius = radius + 0.25), // 구의 반경
      (posPhi = 23.35), // 세로 각도
      (posTheta = -12.3), // 가로 각도
      (rotX = 0),
      (rotY = Math.PI),
      (rotZ = degreeToRadian(300))
    );
    //머그컵 로드
    placeObject(
      "./models/winterObject/christmas_hot_chocolate_with_marshmallow_snowman/scene.gltf",
      sphere_winter,
      (scaleX = 5),
      (scaleY = 5),
      (scaleZ = 5),
      (posRadius = radius - 0.05), // 구의 반경
      (posPhi = 27.35), // 세로 각도
      (posTheta = -12.8), // 가로 각도
      (rotX = 0),
      (rotY = Math.PI),
      (rotZ = 0)
    );

    //크리스마스 트리 로드
    placeObject(
      "./models/winterObject/christmas_tree_polycraft/scene.gltf",
      sphere_winter,
      (scaleX = 0.002),
      (scaleY = 0.002),
      (scaleZ = 0.002),
      (posRadius = radius), // 구의 반경
      (posPhi = 15.35), // 세로 각도
      (posTheta = -12), // 가로 각도
      (rotX = 0),
      (rotY = Math.PI),
      (rotZ = degreeToRadian(270))
    );
    // 캔디캐인 로드
    placeObject(
      "./models/winterObject/the_giftspenser/scene.gltf",
      sphere_winter,
      (scaleX = 0.0005),
      (scaleY = 0.0005),
      (scaleZ = 0.0005),
      (posRadius = radius), // 구의 반경
      (posPhi = 5.35), // 세로 각도
      (posTheta = -13), // 가로 각도
      (rotX = 0),
      (rotY = Math.PI),
      (rotZ = degreeToRadian(220))
    );

    // 이글루 로드
    placeObject(
      "./models/winterObject/eggloo/scene.gltf",
      sphere_winter,
      (scaleX = 0.015),
      (scaleY = 0.015),
      (scaleZ = 0.015),
      (posRadius = radius), // 구의 반경
      (posPhi = 10.5), // 세로 각도
      (posTheta = -0.18), // 가로 각도
      (rotX = 0),
      (rotY = Math.PI),
      (rotZ = 30)
    );

    //나무를 다시 생성
    createTree();
    gltf_loader.load(
      "./models/winterObject/wood_fence_with_snow/scene.gltf",
      function (gltf) {
        const model = gltf.scene;
        model.scale.set(0.3, 0.3, 0.3);
        for (var i = 0; i < 2 * Math.PI; i += Math.PI / 60) {
          const objCopy = model.clone();
          let phi = Math.PI / 2.1;
          let theta = i;
          // 반지름, phi값, theta 값 (radius, phi, theta) -> phi는 y축 기준, theta는 z축 기준
          objCopy.position.setFromSphericalCoordsYZ(radius + 0.02, phi, theta);
          objCopy.rotation.x += i;
          sphere_winter.add(objCopy);
        }

        for (var i = 0; i < 2 * Math.PI; i += Math.PI / 60) {
          const objCopy = model.clone();
          let phi = Math.PI - Math.PI / 2.1;
          let theta = i;
          // 반지름, phi값, theta 값 (radius, phi, theta) -> phi는 y축 기준, theta는 z축 기준
          objCopy.position.setFromSphericalCoordsYZ(radius + 0.02, phi, theta);
          objCopy.rotation.x += i;
          sphere_winter.add(objCopy);
        }
      },
      undefined,
      function (error) {
        console.error(error);
      }
    );
  }

  /* ------------------------------------------------------- */
  sphere_spring.scale.set(1, 1, 1);
  sphere_summer.scale.set(0.1, 0.1, 0.1);
  sphere_autumn.scale.set(0.1, 0.1, 0.1);
  sphere_winter.scale.set(0.1, 0.1, 0.1);
  spring();
  summer();
  fall();
  winter();
  /* --------------------------------------------------------------------------- */
  /* rendering*/

  // 렌더 함수 (매 프레임마다 호출하여 장면을 렌더링)
  function render() {
    if (viewAll) {
      controls.update(); // 카메라 제어 업데이트
    }

    // // Rotate sphere along the X-axis
    if (rotate) {
      sphere_spring.rotation.x -= 0.001; // Adjust rotation speed as needed
      sphere_summer.rotation.x -= 0.001; // Adjust rotation speed as needed
      sphere_autumn.rotation.x -= 0.001; // Adjust rotation speed as needed
      sphere_winter.rotation.x -= 0.001; // Adjust rotation speed as needed
    }

    if (mixer && rotate) mixer.update(0.004); // Adjust timing for animation

    const current_brightness = getTimeBasedColorValue();

    light.intensity = current_brightness;
    light_top.intensity = current_brightness;
    setupClock();
    updateLightPosition();

    // Animate meteor shower if active
    if (meteorShowerActive) {
      if (meteorMode) {
        animateMeteorShower();
      } else {
        meteors.forEach((star) => {
          star.material.opacity = 0.8 + Math.random() * 0.2; // Flicker between 0.8 and 1.0 opacity
          star.material.transparent = true;
        });
      }
    }

    // setInterval(updateLightPosition, 1000);

    // 그 외 렌더링 관련 코드
    renderer.render(scene, camera); // 현재 프레임을 렌더링
    requestAnimationFrame(render); // 다음 프레임에서 렌더 함수를 재귀 호출
  }

  // 창 크기가 변경될 때마다 resizeCanvas 함수 호출
  window.addEventListener("resize", resizeCanvas);

  // 초기 렌더링 함수 호출 (첫 프레임을 렌더링하기 위해 호출)
  render();
  /* --------------------------------------------------------------------------- */
};
