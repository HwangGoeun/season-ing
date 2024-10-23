window.onload = function init() {
  const canvas = document.getElementById("gl-canvas");
  const renderer = new THREE.WebGLRenderer({ canvas });
  renderer.setSize(canvas.width, canvas.height);

  // 배경 색을 처음에 하늘색으로 설정
  renderer.setClearColor(new THREE.Color(0x87CEEB)); // 하늘색

  // 감마 설정
  renderer.outputEncoding = THREE.sRGBEncoding;

  // 구체 설정 (크기 및 세그먼트)
  const radius = 0.5; // 큰 구체의 반지름
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

  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(5, 5, 5); // 빛의 방향 고정
  scene.add(light);

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

  // 렌더 함수
  function render() {
    controls.update();

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

  // 배경 색상 변경을 위한 슬라이더 제어
  const colorSlider = document.getElementById("colorSlider");
  colorSlider.addEventListener("input", (event) => {
    const value = event.target.value / 100;
    const skyColor = new THREE.Color(0x87CEEB); // 하늘색 (밝은 색)
    const eveningColor = new THREE.Color(0x1C1C72); // 저녁 하늘색 (어두운 색)
    const currentColor = skyColor.lerp(eveningColor, value); // 색상 보간

    renderer.setClearColor(currentColor); // 배경 색상 변경
  });

  // 초기 렌더 호출
  render();
};
