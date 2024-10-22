window.onload = function init() {
  const canvas = document.getElementById("gl-canvas");
  const renderer = new THREE.WebGLRenderer({ canvas });
  renderer.setSize(canvas.width, canvas.height);

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

  const light = new THREE.DirectionalLight(0xffffff, 0.1);
  light.position.set(-1, 0, 0); // 빛의 방향 고정
  scene.add(light);

  // Light target (focuses on the sphere)
  const lightTarget = new THREE.Object3D();
  lightTarget.position.set(0, 0, 0); // focus at origin
  scene.add(lightTarget);
  light.target = lightTarget;

  // Sun's rotation variables
  const orbitRadius = 3;  // Radius of sun's orbit around the sphere
  let angle = 0;  // Angle of rotation (in radians)
  const rotationSpeed = 0.01;  // Speed of the sun's orbit

  // 텍스처 로더 생성
  const loader = new THREE.TextureLoader();

  // 텍스처 파일 로드
  const baseColor = loader.load("./textures/Snow_004_COLOR.jpg");
  const normalMap = loader.load("./textures/Snow_004_NORM.jpg");
  const roughnessMap = loader.load("./textures/Snow_004_ROUGH.jpg");
  const heightMap = loader.load("./textures/Snow_004_DISP.png");
  const ambientOcclusionMap = loader.load("./textures/Snow_004_OCC.jpg");

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

     // Sun's orbit (circular path on the XY-plane)
     angle += rotationSpeed;
     const x = orbitRadius * Math.cos(angle);  // X-coordinate of the sun
     const y = orbitRadius * Math.sin(angle);  // Y-coordinate of the sun
     const z = orbitRadius * Math.sin(angle);
     light.position.set(x, y, z);  // Update sun's position
 
     // Light intensity variation (Day/Night cycle)
    //  const intensity = Math.max(0.1, (y+1.5) / orbitRadius);  // Intensity increases as sun moves toward Y-axis
     const intensity = 1;  // Intensity increases as sun moves toward Y-axis
     light.intensity = intensity;

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
