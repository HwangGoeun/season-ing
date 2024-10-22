window.onload = function init() {
  const canvas = document.getElementById("gl-canvas");
  const renderer = new THREE.WebGLRenderer({ canvas });
  renderer.setSize(canvas.width, canvas.height);

  // 감마 설정
  renderer.outputEncoding = THREE.sRGBEncoding;

  // 구체 설정 (크기 및 세그먼트)
  const radius = 0.5; // 구체의 반지름
  const segments = 64;
  const rotation = 6;

  // 장면(Scene) 및 카메라(Camera) 설정
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    45,
    canvas.width / canvas.height,
    0.01,
    1000
  );
  camera.position.z = 2; // 카메라 위치 조정

  // Ambient Light 추가
  scene.add(new THREE.AmbientLight(0x333333));

  // Directional Light 추가
  const light = new THREE.DirectionalLight(0xffffff, 1); // 기본 밝기는 1
  light.position.set(5, 5, 5); // 빛의 초기 방향
  scene.add(light);

  // 빛의 타겟 설정 (구체의 중심으로 설정)
  const lightTarget = new THREE.Object3D();
  scene.add(lightTarget);
  light.target = lightTarget;

  // 텍스처 로더 생성
  const loader = new THREE.TextureLoader();

  // 텍스처 파일 로드
  const baseColor = loader.load("textures/Snow_004_COLOR.jpg");
  const normalMap = loader.load("textures/Snow_004_NORM.jpg");
  const roughnessMap = loader.load("textures/Snow_004_ROUGH.jpg");
  const heightMap = loader.load("textures/Snow_004_DISP.png");
  const ambientOcclusionMap = loader.load("textures/Snow_004_OCC.jpg");

  // 텍스처 스케일 조정
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

  // 구체 생성
  const sphere = createSphere(radius, segments);
  sphere.rotation.y = rotation;
  scene.add(sphere);

  // 카메라 제어
  const controls = new THREE.TrackballControls(camera, canvas);

  // 슬라이드 바로 광원 밝기 조절
  const slider = document.getElementById("light-intensity");
  slider.addEventListener("input", function () {
    light.intensity = parseFloat(slider.value); // 슬라이드 바 값을 광원의 밝기로 설정
  });

  // 렌더 함수
  function render() {
    controls.update();

    // 카메라 방향에 따라 빛의 위치와 방향을 카메라 위치에 맞춤
    light.position.copy(camera.position);
    lightTarget.position.set(0, 0, 0); // 빛의 타겟을 구체의 중심으로 고정

    requestAnimationFrame(render);
    renderer.render(scene, camera);
  }

  // 구체 생성 함수 (MeshStandardMaterial 적용)
  function createSphere(radius, segments) {
    return new THREE.Mesh(
      new THREE.SphereGeometry(radius, segments, segments),
      new THREE.MeshStandardMaterial({
        map: baseColor, // 기본 색상 텍스처
        normalMap: normalMap, // 노멀 맵
        roughnessMap: roughnessMap, // 거칠기 맵
        displacementMap: heightMap, // 높이 맵
        aoMap: ambientOcclusionMap, // 주변광 차단 맵
        roughness: 0.8, // 거칠기 조정
        metalness: 0.0, // 메탈 느낌 제거
        displacementScale: 0.03, // 높이 맵 변위 조정
      })
    );
  }

  // 초기 렌더 호출
  render();
};
