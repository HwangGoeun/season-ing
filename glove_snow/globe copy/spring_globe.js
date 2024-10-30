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
  const fov =  75;
  const aspect = 2;
  const near = 0.1;
  const far = 100;

  // 카메라(Camera) 설정 (3D 공간을 보는 시점 설정)
  const camera = new THREE.PerspectiveCamera(
    fov, // 시야각 (FOV) 45도 설정 (화각)
    aspect, // 화면의 가로 세로 비율 설정 (종횡비)
    near, // 카메라가 인식할 수 있는 가장 가까운 거리 (근접 클리핑 평면)
    far // 카메라가 인식할 수 있는 가장 먼 거리 (원거리 클리핑 평면)
  );
  camera.position.z = 4; // 카메라를 Z축 방향으로 뒤로 이동 (2 단위)
  camera.position.y = 9; // 카메라를 Z축 방향으로 뒤로 이동 (2 단위)
  camera.rotation.x -= 0.5;

  // 카메라 제어 설정 (TrackballControls를 사용하여 카메라를 마우스로 제어할 수 있도록 설정)
  const controls = new THREE.TrackballControls(camera, canvas);

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

  // 태양의 회전 변수 (태양이 구체 주위를 공전하는 모션 설정)
  const orbitRadius = 3; // 태양의 궤도 반지름 설정
  let angle = 0; // 태양의 초기 회전 각도 (라디안 단위)
  const rotationSpeed = (2 * Math.PI) / 86400; // 24시간을 기준으로 설정된 회전 속도

  /* --------------------------------------------------------------------------- */

  /* --------------------------------------------------------------------------- */
  /* texture */

  // 텍스처 로더 생성 (3D 모델에 텍스처를 입히기 위한 로더)
  const loader = new THREE.TextureLoader();

  const baseColor = loader.load("./spring_ground/textures/descargar_(1).png"); // 기본 색상 텍스처
  const bumpMap = loader.load("./spring_ground/textures/brillo.png"); // 범프 맵
  const colorOverlay = loader.load("./spring_ground/textures/high_resolution_photography_of_many__many_.jpeg"); // 색감 표현용

  const repeat = 15
  // 텍스처 반복 설정
  baseColor.wrapS = baseColor.wrapT = THREE.RepeatWrapping;
  baseColor.repeat.set(repeat, repeat);

  bumpMap.wrapS = bumpMap.wrapT = THREE.RepeatWrapping;
  bumpMap.repeat.set(repeat, repeat);

  colorOverlay.wrapS = colorOverlay.wrapT = THREE.RepeatWrapping;
  colorOverlay.repeat.set(repeat, repeat);

  /* --------------------------------------------------------------------------- */

  /* --------------------------------------------------------------------------- */
  /* globe */

  // 구체 설정 (크기 및 세그먼트)
  const radius = 6; // 구체의 반지름 설정 (구체의 크기)
  const segments = 64; // 구체를 렌더링할 때 사용할 세그먼트 수 (세부 표현도를 높임)
  const rotation = 6; // 구체의 초기 회전 각도 설정

  // 구체 생성 및 추가 (기본 구체 메쉬에 텍스처 적용)
  const sphere = createSphere(radius, segments); // 구체를 생성 (반지름과 세그먼트 수 지정)
  sphere.rotation.y = rotation; // 구체를 초기 회전 상태로 설정
  scene.add(sphere); // 구체를 장면에 추가

  // 구체 생성 함수 (MeshStandardMaterial로 텍스처를 적용한 구체 생성)
  function createSphere(radius, segments) {
    return new THREE.Mesh(
      new THREE.SphereGeometry(radius, segments, segments), // 구체 기하학 생성
      new THREE.MeshStandardMaterial({
        map: baseColor,               // 기본 텍스처
        bumpMap: bumpMap,             // 범프 맵
        bumpScale: 0.1,               // 범프 맵 깊이
        emissiveMap: colorOverlay,    // 색감 표현 텍스처
        emissive: new THREE.Color(0xFFFFFF), // 더 밝은 회색으로 설정
        emissiveIntensity: 0.2,       // 강도를 0.2로 낮춰서 조절
        metalness: 0.5,
        roughness: 0.5,
      })
    );
  }

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

  // 현재 시간을 초 단위로 변환하고, 24시간 기준으로 비율 계산
  function getTimeBasedColorValue() {
    const now = new Date();
    const secondsInDay =
      now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
    return secondsInDay / 86400; // 86400초(24시간) 기준으로 비율 계산 (0 ~ 1)
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

  /* --------------------------------------------------------------------------- */

  /* --------------------------------------------------------------------------- */
  /* Objects */
  const gltf_loader = new THREE.GLTFLoader();

  // 고양이 GLTFLoader로 올린 이후에 구체 위에 올리기
  let cat,mixer;
  const catScale = 0.004;
  gltf_loader.load(
    "../../move_cat/toon_cat_free/scene.gltf",
    function (gltf) {
      cat = gltf.scene.children[0];
      cat.scale.set(catScale, catScale, catScale
      );
      cat.position.set(0, radius, 1);
      
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

  // 꽃
  gltf_loader.load(
    "./spring_textures/scene.gltf",
    function (gltf) {
      flower = gltf.scene.children[0];
      flower.scale.set(0.0008, 0.0008, 0.0008);
      flower.position.set(0, radius, 0);
      scene.add(gltf.scene);
      render();
    },
    undefined,
    function (error) {
      console.error(error);
    }
  );

  /* --------------------------------------------------------------------------- */

  /* --------------------------------------------------------------------------- */
  /* rendering*/

  // 렌더 함수 (매 프레임마다 호출하여 장면을 렌더링)
  function render() {
    controls.update(); // 카메라 제어 업데이트

    // 태양의 궤도 설정 (XY 평면에서 원형 궤도로 회전)
    angle += rotationSpeed; // 각도를 계속 증가시켜 회전시키기
    const x = orbitRadius * Math.cos(angle); // 태양의 X좌표 (코사인 함수 사용)
    const y = orbitRadius * Math.sin(angle); // 태양의 Y좌표 (사인 함수 사용)
    const z = orbitRadius * Math.sin(angle); // 태양의 Z좌표 (사인 함수 사용)
    light.position.set(x, y, z); // 태양(빛)의 새로운 위치 설정

    updateBackgroundColor();

    requestAnimationFrame(render); // 다음 프레임에서 렌더 함수를 재귀 호출
    renderer.render(scene, camera); // 현재 프레임을 렌더링
  }

  // 창 크기가 변경될 때마다 resizeCanvas 함수 호출
  window.addEventListener("resize", resizeCanvas);

  // 초기 렌더링 함수 호출 (첫 프레임을 렌더링하기 위해 호출)
  render();

  /* --------------------------------------------------------------------------- */
};
