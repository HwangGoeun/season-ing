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
  camera.position.set(0, 10, 20); // 카메라를 약간 위로 올려서 바닥을 내려다보게 설정
  // camera.position.z = 20; // 카메라를 Z축 방향으로 뒤로 이동 (2 단위)
  // camera.position.y = 8; // 카메라를 Z축 방향으로 뒤로 이동 (2 단위)
  // camera.rotation.x -= 0.5;

  // 카메라 제어 설정 (TrackballControls를 사용하여 카메라를 마우스로 제어할 수 있도록 설정)
  // const controls = new THREE.TrackballControls(camera, canvas);
  controls = new THREE.OrbitControls(camera);

  /* --------------------------------------------------------------------------- */

  /* --------------------------------------------------------------------------- */
  /* Light */

  // 장면에 주변광(Ambient Light) 추가 (전체적으로 고르게 빛을 비춤)
  scene.add(new THREE.AmbientLight(0x333333)); // 약한 회색 빛으로 설정

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

  light.shadow.mapSize.width = 2048;
  light.shadow.mapSize.height = 2048;
  light.shadow.camera.near = 0.5;
  light.shadow.camera.far = 50;
  light.shadow.camera.left = -20;
  light.shadow.camera.right = 20;
  light.shadow.camera.top = 20;
  light.shadow.camera.bottom = -20;
  
  scene.add(light);

  // 태양의 회전 변수 (태양이 구체 주위를 공전하는 모션 설정)
  const orbitRadius = 10; // 태양의 궤도 반지름 설정
  let angle = 0; // 태양의 초기 회전 각도 (라디안 단위)
  const rotationSpeed = (2 * Math.PI) / 86400; // 24시간을 기준으로 설정된 회전 속도

  /* --------------------------------------------------------------------------- */

  /* --------------------------------------------------------------------------- */
  /* texture */

  // 텍스처 로더 생성 (3D 모델에 텍스처를 입히기 위한 로더)
  const loader = new THREE.TextureLoader();

  // 텍스처 파일 로드 (구체 표면에 사용할 텍스처 이미지 로드)
  const baseColor = loader.load("./textures/Snow_004_COLOR.jpg"); // 기본 색상 텍스처
  const normalMap = loader.load("./textures/Snow_004_NORM.jpg"); // 노멀 맵 (표면의 작은 굴곡 표현)
  const roughnessMap = loader.load("./textures/Snow_004_ROUGH.jpg"); // 거칠기 맵 (표면의 거칠기 표현)
  const heightMap = loader.load("./textures/Snow_004_DISP.png"); // 높이 맵 (높낮이 변화를 표현)
  const ambientOcclusionMap = loader.load("./textures/Snow_004_OCC.jpg"); // 주변광 차단 맵 (빛이 덜 도달하는 부분 표현)

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
  const radius = 12; // 구체의 반지름 설정 (구체의 크기)
  const segments = 24; // 구체를 렌더링할 때 사용할 세그먼트 수 (세부 표현도를 높임)
  const rotation = 6; // 구체의 초기 회전 각도 설정

  // // 구체 생성 및 추가 (기본 구체 메쉬에 텍스처 적용)
  // const sphere = createSphere(radius, segments); // 구체를 생성 (반지름과 세그먼트 수 지정)
  // sphere.rotation.y = rotation; // 구체를 초기 회전 상태로 설정
  // scene.add(sphere); // 구체를 장면에 추가

  // // 구체 생성 함수 (MeshStandardMaterial로 텍스처를 적용한 구체 생성)
  // function createSphere(radius, segments) {
  //   return new THREE.Mesh(
  //     new THREE.SphereGeometry(radius, segments, segments), // 구체 기하학 생성
  //     new THREE.MeshStandardMaterial({
  //       map: baseColor, // 기본 색상 텍스처
  //       normalMap: normalMap, // 노멀 맵 적용 (표면 굴곡 표현)
  //       roughnessMap: roughnessMap, // 거칠기 맵 적용
  //       displacementMap: heightMap, // 높이 맵 적용 (표면의 높낮이 표현)
  //       aoMap: ambientOcclusionMap, // 주변광 차단 맵 적용
  //       roughness: 0.8, // 표면의 거칠기 설정 (값이 클수록 거칠어짐)
  //       metalness: 0.0, // 금속성 제거 (0으로 설정하여 금속 느낌 없앰)
  //       displacementScale: 0.03, // 높이 맵의 변위를 조절 (표면의 높낮이 변화를 조정)
  //     })
  //   );
  // }
  // Create sphere and add to scene.
  // var geometry = new THREE.SphereGeometry(radius, segments, segments);
  // var material = new THREE.MeshStandardMaterial({
  //   map: baseColor, // 기본 색상 텍스처
  //   normalMap: normalMap, // 노멀 맵 적용 (표면 굴곡 표현)
  //   roughnessMap: roughnessMap, // 거칠기 맵 적용
  //   displacementMap: heightMap, // 높이 맵 적용 (표면의 높낮이 표현)
  //   aoMap: ambientOcclusionMap, // 주변광 차단 맵 적용
  //   roughness: 0.8, // 표면의 거칠기 설정 (값이 클수록 거칠어짐)
  //   metalness: 0.0, // 금속성 제거 (0으로 설정하여 금속 느낌 없앰)
  //   displacementScale: 0.03, // 높이 맵의 변위를 조절 (표면의 높낮이 변화를 조정)
  // });
  // const sphere = new THREE.Mesh(geometry, material);
  // scene.add(sphere);

  // var planeGeometry = new THREE.PlaneGeometry(0.5, 0.5);
  // var planeMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });

  // var lookDirection = new THREE.Vector3();
  // var target = new THREE.Vector3();

  // const position = geometry.attributes.position;
  // for (i = 0; i < position.count; i++) {
  //   if (Math.random() * 10 > 2.9956) {
  //     var planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);

  //     // planeMesh.position.set( geometry.vertices[i].x, geometry.vertices[i].y, geometry.vertices[i].z );
  //     // // Set the position of the planeMesh based on position attribute values
  //     const x = position.getX(i);
  //     const y = position.getY(i);
  //     const z = position.getZ(i);

  //     planeMesh.position.set(x, y, z);

  //     lookDirection.subVectors(planeMesh.position, sphere.position).normalize();
  //     target.copy(planeMesh.position).add(lookDirection);
  //     planeMesh.lookAt(target);

  //     scene.add(planeMesh);
  //   }
  // }

  // 빨간 점 찍는 부분 필요 읽을 필요 X
  var Tree = function () {
    //modèle 3d
    this.mesh = new THREE.Object3D();
    this.mesh.name = "tree";

    // tronc
    var geomTronc = new THREE.BoxGeometry(0.02, 0.02, 0.02);
    var matTronc = new THREE.MeshBasicMaterial({
      color: "white",
      wireframe: true,
    });
    var tronc = new THREE.Mesh(geomTronc, matTronc);
    tronc.position.set(0, 0, 0);
    tronc.rotation.x = -Math.PI * 0.5;
    tronc.castShadow = true;
    tronc.receiveShadow = true;
    this.mesh.add(tronc);

    // arbre
    var geomArbre = new THREE.BoxGeometry(0.1, 0.01, 0.1);
    var matArbre = new THREE.MeshBasicMaterial({
      color: "brown",
      wireframe: true,
    });
    var arbre = new THREE.Mesh(geomArbre, matArbre);
    arbre.position.set(0, 0.03, 0);
    tronc.add(arbre);
  };

  const sphere = new THREE.Mesh(
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
  sphere.receiveShadow = true;
  scene.add(sphere);

  let modelName = "./models/small_tree/prune_tree_1.gltf";
  console.log("model name:", modelName);

  function createTree() {
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
          let phi = Math.PI - Math.PI / 3;
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

  //at the center of the sphere to illustrate what the object looks like
  // var singletree;
  // singleTree = new Tree();
  // scene.add(singleTree.mesh);

  // createTree();

  /* --------------------------------------------------------------------------- */

  /* --------------------------------------------------------------------------- */
  /* clock */

  // 시계 업데이트 함수
  function updateClock() {
    const clockElement = document.getElementById("clock");
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0"); // 두 자리로 표시
    const minutes = String(now.getMinutes()).padStart(2, "0"); // 두 자리로 표시
    const seconds = String(now.getSeconds()).padStart(2, "0"); // 두 자리로 표시
    clockElement.textContent = `${hours}:${minutes}:${seconds}`; // 시계에 시간 표시
  }

  // 1초마다 시계와 배경색을 업데이트
  setInterval(() => {
    updateClock();
    updateBackgroundColor(); // 시간에 맞추어 배경색 업데이트
  }, 1000);

  // // 현재 시간을 초 단위로 변환하고, 24시간 기준으로 비율 계산
  // function getTimeBasedColorValue() {
  //   const now = new Date();
  //   const secondsInDay =
  //     now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
  //   return secondsInDay / 86400; // 86400초(24시간) 기준으로 비율 계산 (0 ~ 1)
  // }
  function getTimeBasedColorValue() {
    const now = new Date();
    const secondsInDay =
      now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

    // 0 ~ 1 사이의 비율 계산
    const normalizedTime = secondsInDay / 86400;

    // 코사인 함수를 사용하여 0시에 어둡고 12시에 밝게 조정
    // 코사인 곡선으로 -1 ~ 1 사이 값을 0 ~ 1로 매핑
    const brightness = (Math.cos(2 * Math.PI * normalizedTime) + 1) / 2;

    return brightness; // 0 (어두운 밤) ~ 1 (밝은 낮) 사이의 값
  }

  /* --------------------------------------------------------------------------- */

  /* --------------------------------------------------------------------------- */
  /* background */

  // 배경 색상 업데이트 함수 (시간에 따라 배경색이 변화)
  function updateBackgroundColor() {
    const timeValue = getTimeBasedColorValue(); // 현재 시간 비율
    const skyColor = new THREE.Color(0x87ceeb); // 밝은 하늘색
    const eveningColor = new THREE.Color(0x1c1c72); // 어두운 저녁색
    const currentColor = skyColor.lerp(eveningColor, timeValue); // 시간에 따른 색상 보간
    renderer.setClearColor(currentColor); // 배경 색상 업데이트
  }

  /* --------------------------------------------------------------------------- */

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

  /* --------------------------------------------------------------------------- */

  /* --------------------------------------------------------------------------- */
  // 고양이 GLTFLoader로 올린 이후에 구체 위에 올리기
  let cat, mixer;
  const catScale = 0.004;
  const gltf_loader = new THREE.GLTFLoader();
  gltf_loader.load(
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

      // cat.position.set(0, radius, 1);
      cat.position.setFromSphericalCoords(radius + 0.03, Math.PI / 4, 0);
      cat.rotation.x += Math.PI / 4;
      // cat.rotation.y += Math.PI / 6;

      mixer = new THREE.AnimationMixer(cat);
      if (gltf.animations.length > 0) {
        const action = mixer.clipAction(gltf.animations[0]);
        action.play();
      }

      scene.add(gltf.scene);
      render();
    },
    undefined,
    function (error) {
      console.error(error);
    }
  );

  /* --------------------------------------------------------------------------- */

  function spring() {
    console.log("spring button pushed");

    // 새로운 나무 모델 경로로 업데이트
    modelName = "./models/small_tree/bush_1.gltf";

    // 기존 나무들을 삭제
    while (sphere.children.length > 0) {
      sphere.remove(sphere.children[0]);
    }

    // 새 모델을 사용해 나무를 다시 생성
    createTree();

    // 새로운 텍스처 파일 로드
    const baseColor = loader.load("./textures/Poliigon_GrassPatchyGround_4585_BaseColor.jpg"); // 기본 색상 텍스처
    const normalMap = loader.load("./textures/Poliigon_GrassPatchyGround_4585_Normal.jpg"); // 노멀 맵
    const roughnessMap = loader.load("./textures/Poliigon_GrassPatchyGround_4585_Roughness.jpg"); // 거칠기 맵
    const heightMap = loader.load("./textures/Poliigon_GrassPatchyGround_4585_Displacement.tiff"); // 높이 맵
    const ambientOcclusionMap = loader.load("./textures/Poliigon_GrassPatchyGround_4585_AmbientOcclusion.jpg"); // 주변광 차단 맵

    // 텍스처 반복 및 스케일 설정
    baseColor.wrapS = baseColor.wrapT = THREE.RepeatWrapping;
    baseColor.repeat.set(1, 1);

    normalMap.wrapS = normalMap.wrapT = THREE.RepeatWrapping;
    normalMap.repeat.set(1, 1);

    roughnessMap.wrapS = roughnessMap.wrapT = THREE.RepeatWrapping;
    roughnessMap.repeat.set(1, 1);

    heightMap.wrapS = heightMap.wrapT = THREE.RepeatWrapping;
    heightMap.repeat.set(1, 1);

    ambientOcclusionMap.wrapS = ambientOcclusionMap.wrapT = THREE.RepeatWrapping;
    ambientOcclusionMap.repeat.set(1, 1);

    // 구의 재질 텍스처 업데이트
    sphere.material.map = baseColor;
    sphere.material.normalMap = normalMap;
    sphere.material.roughnessMap = roughnessMap;
    sphere.material.displacementMap = heightMap;
    sphere.material.aoMap = ambientOcclusionMap;

    // 텍스처 업데이트 반영
    sphere.material.needsUpdate = true;
  }

  /* ----- */

  function summer() {
    console.log("button push");

    // 새로운 나무 모델 경로로 업데이트
    modelName = "./models/small_tree/small_tree_1.gltf";

    // 기존 나무들을 삭제
    while (sphere.children.length > 0) {
      sphere.remove(sphere.children[0]);
    }

    // 새 모델을 사용해 나무를 다시 생성
    createTree();

    // 새로운 텍스처 파일 로드
    const baseColor = loader.load("./textures/Grass001_4K-PNG_Color.png");
    const normalMap = loader.load("./textures/Grass001_4K-PNG_NormalDX.png");
    const roughnessMap = loader.load("./textures/Grass001_4K-PNG_Roughness.png");
    const heightMap = loader.load("./textures/Grass001_4K-PNG_Displacement.png");
    const ambientOcclusionMap = loader.load("./textures/Grass001_4K-PNG_AmbientOcclusion.png");

    // 텍스처 반복 및 스케일 설정
    baseColor.wrapS = baseColor.wrapT = THREE.RepeatWrapping;
    baseColor.repeat.set(1, 1);

    normalMap.wrapS = normalMap.wrapT = THREE.RepeatWrapping;
    normalMap.repeat.set(1, 1);

    roughnessMap.wrapS = roughnessMap.wrapT = THREE.RepeatWrapping;
    roughnessMap.repeat.set(1, 1);

    heightMap.wrapS = heightMap.wrapT = THREE.RepeatWrapping;
    heightMap.repeat.set(1, 1);

    ambientOcclusionMap.wrapS = ambientOcclusionMap.wrapT = THREE.RepeatWrapping;
    ambientOcclusionMap.repeat.set(1, 1);

    // 구의 재질 텍스처 업데이트
    sphere.material.map = baseColor;
    sphere.material.normalMap = normalMap;
    sphere.material.roughnessMap = roughnessMap;
    sphere.material.displacementMap = heightMap;
    sphere.material.aoMap = ambientOcclusionMap;

    // 텍스처 업데이트 반영
    sphere.material.needsUpdate = true;
  }

  /* ----- */

  // fall
  function fall() {
    console.log("fall button pushed");

    // 새로운 나무 모델 경로로 업데이트
    modelName = "./models/small_tree/pretty_big_tree_3.gltf";

    // 기존 나무들을 삭제
    while (sphere.children.length > 0) {
      sphere.remove(sphere.children[0]);
    }

    // 새 모델을 사용해 나무를 다시 생성
    createTree();

    // 텍스처 파일 로드 (구체 표면에 사용할 텍스처 이미지 로드)
    const baseColor = loader.load("./textures/GroundWoodChips001_COL_4K.jpg"); // 기본 색상 텍스처
    const normalMap = loader.load("./textures/GroundWoodChips001_NRM_4K.jpg"); // 노멀 맵 (표면의 작은 굴곡 표현)
    const roughnessMap = loader.load("./textures/GroundWoodChips001_GLOSS_4K.jpg"); // 거칠기 맵 (표면의 거칠기 표현)
    const heightMap = loader.load("./textures/GroundWoodChips001_DISP_4K.jpg"); // 높이 맵 (높낮이 변화를 표현)
    const ambientOcclusionMap = loader.load("./textures/GroundWoodChips001_AO_4K.jpg"); // 주변광 차단 맵 (빛이 덜 도달하는 부분 표현)

    // 텍스처 반복 및 스케일 설정
    baseColor.wrapS = baseColor.wrapT = THREE.RepeatWrapping;
    baseColor.repeat.set(1, 1);

    normalMap.wrapS = normalMap.wrapT = THREE.RepeatWrapping;
    normalMap.repeat.set(1, 1);

    roughnessMap.wrapS = roughnessMap.wrapT = THREE.RepeatWrapping;
    roughnessMap.repeat.set(1, 1);

    heightMap.wrapS = heightMap.wrapT = THREE.RepeatWrapping;
    heightMap.repeat.set(1, 1);

    ambientOcclusionMap.wrapS = ambientOcclusionMap.wrapT = THREE.RepeatWrapping;
    ambientOcclusionMap.repeat.set(1, 1);

    // 구의 재질 텍스처 업데이트
    sphere.material.map = baseColor;
    sphere.material.normalMap = normalMap;
    sphere.material.roughnessMap = roughnessMap;
    sphere.material.displacementMap = heightMap;
    sphere.material.aoMap = ambientOcclusionMap;

    // 텍스처 업데이트 반영
    sphere.material.needsUpdate = true;
  }

  /* ----- */

  // winter
  function winter() {
    console.log("button push");

    // 새로운 나무 모델 경로로 업데이트
    modelName = "./models/small_tree/prune_tree_1.gltf";

    // 기존 나무들을 삭제
    while (sphere.children.length > 0) {
      sphere.remove(sphere.children[0]);
    }

    // 새 모델을 사용해 나무를 다시 생성
    createTree();

    // 텍스처 파일 로드 (구체 표면에 사용할 텍스처 이미지 로드)
    const baseColor = loader.load("./textures/Snow_004_COLOR.jpg"); // 기본 색상 텍스처
    const normalMap = loader.load("./textures/Snow_004_NORM.jpg"); // 노멀 맵 (표면의 작은 굴곡 표현)
    const roughnessMap = loader.load("./textures/Snow_004_ROUGH.jpg"); // 거칠기 맵 (표면의 거칠기 표현)
    const heightMap = loader.load("./textures/Snow_004_DISP.png"); // 높이 맵 (높낮이 변화를 표현)
    const ambientOcclusionMap = loader.load("./textures/Snow_004_OCC.jpg"); // 주변광 차단 맵 (빛이 덜 도달하는 부분 표현)

    // 텍스처 반복 및 스케일 설정
    baseColor.wrapS = baseColor.wrapT = THREE.RepeatWrapping;
    baseColor.repeat.set(4, 4);

    normalMap.wrapS = normalMap.wrapT = THREE.RepeatWrapping;
    normalMap.repeat.set(1, 1);

    roughnessMap.wrapS = roughnessMap.wrapT = THREE.RepeatWrapping;
    roughnessMap.repeat.set(1, 1);

    heightMap.wrapS = heightMap.wrapT = THREE.RepeatWrapping;
    heightMap.repeat.set(1, 1);

    ambientOcclusionMap.wrapS = ambientOcclusionMap.wrapT = THREE.RepeatWrapping;
    ambientOcclusionMap.repeat.set(1, 1);

    // 구의 재질 텍스처 업데이트
    sphere.material.map = baseColor;
    sphere.material.normalMap = normalMap;
    sphere.material.roughnessMap = roughnessMap;
    sphere.material.displacementMap = heightMap;
    sphere.material.aoMap = ambientOcclusionMap;

    // 텍스처 업데이트 반영
    sphere.material.needsUpdate = true;
  }







  /* --------------------------------------------------------------------------- */
  /* rendering*/

  // 렌더 함수 (매 프레임마다 호출하여 장면을 렌더링)
  function render() {
    // controls.update(); // 카메라 제어 업데이트

    // Rotate sphere along the X-axis
    sphere.rotation.x -= 0.002; // Adjust rotation speed as needed

    // 태양의 궤도 설정 (XY 평면에서 원형 궤도로 회전)
    angle += rotationSpeed; // 각도를 계속 증가시켜 회전시키기
    const x = orbitRadius * Math.cos(angle); // 태양의 X좌표 (코사인 함수 사용)
    const y = orbitRadius * Math.sin(angle); // 태양의 Y좌표 (사인 함수 사용)
    const z = orbitRadius * Math.sin(angle); // 태양의 Z좌표 (사인 함수 사용)
    light.position.set(x, y, z); // 태양(빛)의 새로운 위치 설정

    updateBackgroundColor();

    if (mixer) mixer.update(0.004); // Adjust timing for animation
    // Check for collision and keep cat on sphere
    if (cat) {
      keepCatOnSphere();
    }
    renderer.render(scene, camera); // 현재 프레임을 렌더링
    requestAnimationFrame(render); // 다음 프레임에서 렌더 함수를 재귀 호출
  }

  // 창 크기가 변경될 때마다 resizeCanvas 함수 호출
  window.addEventListener("resize", resizeCanvas);

  // 고양이 collision detection 수행
  function keepCatOnSphere() {
    const sphereCenter = sphere.position; // Sphere center
    const catDirection = cat.position.clone().sub(sphereCenter).normalize(); // Direction vector from sphere to cat

    // Adjust position so the cat stays on the surface of the sphere
    const targetPosition = catDirection.multiplyScalar(radius + 0.03); // Offset to keep the cat slightly above the surface
    cat.position.copy(targetPosition);
  }

  // 초기 렌더링 함수 호출 (첫 프레임을 렌더링하기 위해 호출)
  render();
  createTree();
  /* --------------------------------------------------------------------------- */
};
