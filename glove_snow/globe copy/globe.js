window.onload = function init() {
  // 웹 페이지가 로드되면 init 함수 실행
  const canvas = document.getElementById("gl-canvas"); // HTML에서 'gl-canvas'라는 ID를 가진 <canvas> 요소를 가져옴
  const renderer = new THREE.WebGLRenderer({ canvas }); // WebGLRenderer를 생성하고 canvas 요소에 연결
  renderer.setSize(canvas.width, canvas.height); // 렌더러 크기를 canvas 크기로 설정

  // 배경 색을 처음에 하늘색으로 설정
  renderer.setClearColor(new THREE.Color(0x87CEEB)); // 하늘색

  // 감마 설정 (색상 표현을 개선하기 위해 감마 보정 사용)
  renderer.outputEncoding = THREE.sRGBEncoding;

  // 구체 설정 (크기 및 세그먼트)
  const radius = 0.5; // 구체의 반지름 설정 (구체의 크기)
  const segments = 64; // 구체를 렌더링할 때 사용할 세그먼트 수 (세부 표현도를 높임)
  const rotation = 6; // 구체의 초기 회전 각도 설정

  // 장면(Scene) 생성 (3D 오브젝트를 배치하는 공간)
  const scene = new THREE.Scene();

  // 카메라(Camera) 설정 (3D 공간을 보는 시점 설정)
  const camera = new THREE.PerspectiveCamera(
    45, // 시야각 (FOV) 45도 설정 (화각)
    canvas.width / canvas.height, // 화면의 가로 세로 비율 설정 (종횡비)
    0.01, // 카메라가 인식할 수 있는 가장 가까운 거리 (근접 클리핑 평면)
    1000 // 카메라가 인식할 수 있는 가장 먼 거리 (원거리 클리핑 평면)
  );
  camera.position.z = 2; // 카메라를 Z축 방향으로 뒤로 이동 (2 단위)

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
  const orbitRadius = 3;  // 태양의 궤도 반지름 설정
  let angle = 0;  // 태양의 초기 회전 각도 (라디안 단위)
  const rotationSpeed = (2 * Math.PI) / 86400;  // 24시간을 기준으로 설정된 회전 속도

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

  // 구체 생성 및 추가 (기본 구체 메쉬에 텍스처 적용)
  const sphere = createSphere(radius, segments); // 구체를 생성 (반지름과 세그먼트 수 지정)
  sphere.rotation.y = rotation; // 구체를 초기 회전 상태로 설정
  scene.add(sphere); // 구체를 장면에 추가

  // 카메라 제어 설정 (TrackballControls를 사용하여 카메라를 마우스로 제어할 수 있도록 설정)
  const controls = new THREE.TrackballControls(camera, canvas);

  // 렌더 함수 (매 프레임마다 호출하여 장면을 렌더링)
  function render() {
    controls.update(); // 카메라 제어 업데이트

    // 태양의 궤도 설정 (XY 평면에서 원형 궤도로 회전)
    angle += rotationSpeed; // 각도를 계속 증가시켜 회전시키기
    const x = orbitRadius * Math.cos(angle);  // 태양의 X좌표 (코사인 함수 사용)
    const y = orbitRadius * Math.sin(angle);  // 태양의 Y좌표 (사인 함수 사용)
    const z = orbitRadius * Math.sin(angle);  // 태양의 Z좌표 (사인 함수 사용)
    light.position.set(x, y, z);  // 태양(빛)의 새로운 위치 설정

    // 빛의 강도 조절 (주석 처리된 코드로 낮/밤 주기 구현 가능)
    const intensity = 1;  // 빛의 강도를 1로 고정
    light.intensity = intensity; // 빛의 강도 적용

    requestAnimationFrame(render); // 다음 프레임에서 렌더 함수를 재귀 호출
    renderer.render(scene, camera); // 현재 프레임을 렌더링
  }

  // 시계 업데이트 함수
  function updateClock() {
    const clockElement = document.getElementById('clock');
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0'); // 두 자리로 표시
    const minutes = String(now.getMinutes()).padStart(2, '0'); // 두 자리로 표시
    const seconds = String(now.getSeconds()).padStart(2, '0'); // 두 자리로 표시
    clockElement.textContent = `${hours}:${minutes}:${seconds}`; // 시계에 시간 표시
  }

  // 1초마다 시계를 업데이트
  setInterval(updateClock, 1000);

  // 페이지 로드 시 바로 시계 표시
  updateClock();

  // 구체 생성 함수 (MeshStandardMaterial로 텍스처를 적용한 구체 생성)
  function createSphere(radius, segments) {
    return new THREE.Mesh(
      new THREE.SphereGeometry(radius, segments, segments), // 구체 기하학 생성
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
  }

  // 배경 색상 변경을 위한 슬라이더 제어
  const colorSlider = document.getElementById("colorSlider");
  colorSlider.addEventListener("input", (event) => {
    const value = event.target.value / 100;
    const skyColor = new THREE.Color(0x87CEEB); // 하늘색 (밝은 색)
    const eveningColor = new THREE.Color(0x1C1C72); // 저녁 하늘색 (어두운 색)
    const currentColor = skyColor.lerp(eveningColor, value); // 색상 보간

    renderer.setClearColor(currentColor); // 배경 색상 변경
  });

  // 초기 렌더링 함수 호출 (첫 프레임을 렌더링하기 위해 호출)
  render();
};
