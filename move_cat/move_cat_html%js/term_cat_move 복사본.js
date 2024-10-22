window.onload = function init() {
    const canvas = document.getElementById("gl-canvas");
    const renderer = new THREE.WebGLRenderer({ canvas });
    renderer.setSize(canvas.width, canvas.height);
  
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
  
    const camera = new THREE.PerspectiveCamera(75, canvas.width / canvas.height, 0.1, 1000);
    camera.position.set(0, 150, 300); // Set a reasonable camera distance to view the model
  
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
  
    const ambientLight = new THREE.AmbientLight(0x404040, 10);
    scene.add(ambientLight);
  
    const light = new THREE.PointLight(0xc4c4c4, 5);
    light.position.set(0, 3000, 5000);
    scene.add(light);
  
    const loader = new THREE.GLTFLoader();
    
    // Variable for the animation mixer
    let mixer;
    
    loader.load('../toon_cat_free/scene.gltf', function (gltf) {
      const model = gltf.scene;
      model.scale.set(0.5, 0.5, 0.5);
      scene.add(model);
  
      // If there are animations, set up the mixer
      if (gltf.animations && gltf.animations.length > 0) {
        mixer = new THREE.AnimationMixer(model);
        gltf.animations.forEach((clip) => {
          mixer.clipAction(clip).play();  // Play all available animations
        });
      }
  
      animate();
    }, undefined, function (error) {
      console.error('An error occurred while loading the model:', error);
    });
  
    // Animation and rendering loop
    function animate() {
      requestAnimationFrame(animate);
  
      // If mixer is defined, update the animations
      if (mixer) mixer.update(0.01);  // Adjust the speed of the animation
  
      renderer.render(scene, camera);
    }
  }
  