/* ═══════════════════════════════════════════════════
   3D WebGL SCENE
   Layers: starfield, torus knot, floating shapes, connections
   ═══════════════════════════════════════════════════ */
(function () {
  const canvas = document.getElementById('webgl');
  if (!canvas || !window.THREE) return;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x05060a, 0.035);

  const camera = new THREE.PerspectiveCamera(
    55, window.innerWidth / window.innerHeight, 0.1, 200
  );
  camera.position.set(0, 0, 12);

  const renderer = new THREE.WebGLRenderer({
    canvas, antialias: true, alpha: true, powerPreference: 'high-performance'
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x05060a, 0);

  /* ───── LIGHTS ───── */
  const ambient = new THREE.AmbientLight(0x4a5580, 0.8);
  scene.add(ambient);

  const lightA = new THREE.PointLight(0x3ddcff, 3, 40);
  lightA.position.set(-8, 6, 8);
  scene.add(lightA);

  const lightB = new THREE.PointLight(0x7c5cff, 3, 40);
  lightB.position.set(8, -4, 6);
  scene.add(lightB);

  const lightC = new THREE.PointLight(0xff5cb8, 2, 40);
  lightC.position.set(0, 8, -8);
  scene.add(lightC);

  /* ───── MAIN TORUS KNOT ───── */
  const knotGroup = new THREE.Group();
  scene.add(knotGroup);

  const knotGeo = new THREE.TorusKnotGeometry(2.4, 0.6, 200, 24, 2, 3);
  const knotMat = new THREE.MeshStandardMaterial({
    color: 0x0a0c14,
    emissive: 0x7c5cff,
    emissiveIntensity: 0.25,
    metalness: 0.85,
    roughness: 0.25,
    wireframe: false,
  });
  const knot = new THREE.Mesh(knotGeo, knotMat);
  knotGroup.add(knot);

  // Outer wireframe shell
  const wireGeo = new THREE.TorusKnotGeometry(2.45, 0.62, 100, 12, 2, 3);
  const wireMat = new THREE.MeshBasicMaterial({
    color: 0x3ddcff,
    wireframe: true,
    transparent: true,
    opacity: 0.15,
  });
  const wire = new THREE.Mesh(wireGeo, wireMat);
  knotGroup.add(wire);

  // Inner glow sphere
  const glowGeo = new THREE.SphereGeometry(1.2, 32, 32);
  const glowMat = new THREE.MeshBasicMaterial({
    color: 0xff5cb8,
    transparent: true,
    opacity: 0.06,
  });
  knotGroup.add(new THREE.Mesh(glowGeo, glowMat));

  /* ───── FLOATING SHAPES ───── */
  const shapes = [];
  const shapeGeometries = [
    new THREE.IcosahedronGeometry(0.55, 0),
    new THREE.OctahedronGeometry(0.6, 0),
    new THREE.TetrahedronGeometry(0.7, 0),
    new THREE.BoxGeometry(0.7, 0.7, 0.7),
    new THREE.TorusGeometry(0.5, 0.18, 8, 20),
  ];
  const shapeColors = [0x3ddcff, 0x7c5cff, 0xff5cb8, 0x5cff9d, 0xffb45f];

  for (let i = 0; i < 18; i++) {
    const geo = shapeGeometries[i % shapeGeometries.length];
    const mat = new THREE.MeshStandardMaterial({
      color: shapeColors[i % shapeColors.length],
      emissive: shapeColors[i % shapeColors.length],
      emissiveIntensity: 0.5,
      metalness: 0.7,
      roughness: 0.3,
      wireframe: i % 3 === 0,
    });
    const mesh = new THREE.Mesh(geo, mat);

    const r = 6 + Math.random() * 6;
    const a = Math.random() * Math.PI * 2;
    const y = (Math.random() - 0.5) * 10;
    mesh.position.set(Math.cos(a) * r, y, Math.sin(a) * r - 2);

    mesh.userData = {
      baseY: mesh.position.y,
      speed: 0.2 + Math.random() * 0.4,
      rotSpeed: 0.2 + Math.random() * 0.6,
      offset: Math.random() * Math.PI * 2,
    };

    mesh.scale.setScalar(0.6 + Math.random() * 0.9);
    scene.add(mesh);
    shapes.push(mesh);
  }

  /* ───── PARTICLE STARFIELD ───── */
  const PARTICLE_COUNT = 4000;
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const colors = new Float32Array(PARTICLE_COUNT * 3);
  const sizes = new Float32Array(PARTICLE_COUNT);

  const palette = [
    new THREE.Color(0x3ddcff),
    new THREE.Color(0x7c5cff),
    new THREE.Color(0xff5cb8),
    new THREE.Color(0xffffff),
    new THREE.Color(0x5cff9d),
  ];

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const i3 = i * 3;
    const radius = 8 + Math.random() * 30;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);

    positions[i3]     = radius * Math.sin(phi) * Math.cos(theta);
    positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta) * 0.5;
    positions[i3 + 2] = radius * Math.cos(phi);

    const c = palette[Math.floor(Math.random() * palette.length)];
    colors[i3]     = c.r;
    colors[i3 + 1] = c.g;
    colors[i3 + 2] = c.b;

    sizes[i] = Math.random() * 2 + 0.5;
  }

  const particleGeo = new THREE.BufferGeometry();
  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  particleGeo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  const particleMat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
    },
    vertexShader: `
      attribute float size;
      attribute vec3 color;
      varying vec3 vColor;
      varying float vAlpha;
      uniform float uTime;
      uniform float uPixelRatio;

      void main() {
        vColor = color;
        vec3 pos = position;

        // gentle drift
        pos.y += sin(uTime * 0.4 + position.x * 0.3) * 0.35;
        pos.x += cos(uTime * 0.3 + position.z * 0.3) * 0.35;

        vec4 mv = modelViewMatrix * vec4(pos, 1.0);
        gl_Position = projectionMatrix * mv;

        float dist = length(mv.xyz);
        vAlpha = smoothstep(60.0, 5.0, dist) * (0.6 + 0.4 * sin(uTime * 2.0 + position.x));

        gl_PointSize = size * uPixelRatio * (200.0 / -mv.z);
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      varying float vAlpha;

      void main() {
        vec2 uv = gl_PointCoord - 0.5;
        float d = length(uv);
        float alpha = smoothstep(0.5, 0.0, d) * vAlpha;
        if (alpha < 0.01) discard;
        gl_FragColor = vec4(vColor, alpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  /* ───── CONNECTING GRID (subtle floor) ───── */
  const floorGeo = new THREE.PlaneGeometry(80, 80, 40, 40);
  const floorMat = new THREE.MeshBasicMaterial({
    color: 0x7c5cff,
    wireframe: true,
    transparent: true,
    opacity: 0.04,
  });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -8;
  scene.add(floor);

  /* ───── INTERACTION STATE ───── */
  const state = {
    mx: 0, my: 0,
    tx: 0, ty: 0,
    scroll: 0,
    scrollTarget: 0,
  };

  function onMouseMove(e) {
    state.tx = (e.clientX / window.innerWidth) * 2 - 1;
    state.ty = -((e.clientY / window.innerHeight) * 2 - 1);
  }
  window.addEventListener('mousemove', onMouseMove, { passive: true });

  window.addEventListener('scroll', () => {
    state.scrollTarget = window.scrollY / window.innerHeight;
  }, { passive: true });

  /* ───── ANIMATE ───── */
  const clock = new THREE.Clock();
  let running = true;

  function animate() {
    if (!running) return;
    requestAnimationFrame(animate);

    const t = clock.getElapsedTime();

    // smooth mouse
    state.mx += (state.tx - state.mx) * 0.05;
    state.my += (state.ty - state.my) * 0.05;
    state.scroll += (state.scrollTarget - state.scroll) * 0.08;

    // camera parallax
    camera.position.x = state.mx * 1.6;
    camera.position.y = state.my * 1.0 - state.scroll * 0.8;
    camera.position.z = 12 - state.scroll * 1.5;
    camera.lookAt(0, 0, 0);

    // knot motion
    knotGroup.rotation.x = t * 0.15 + state.my * 0.3;
    knotGroup.rotation.y = t * 0.2 + state.mx * 0.4;
    knotGroup.rotation.z = t * 0.05;

    // knot follows scroll scale
    const knotScale = 1 - state.scroll * 0.08;
    knotGroup.scale.setScalar(Math.max(0.4, knotScale));

    // wireframe counter-rotation
    wire.rotation.x = -t * 0.1;
    wire.rotation.y = -t * 0.15;

    // particle shader time
    particleMat.uniforms.uTime.value = t;

    // starfield rotation
    particles.rotation.y = t * 0.02;
    particles.rotation.x = state.my * 0.1;

    // floating shapes
    shapes.forEach((s, i) => {
      s.rotation.x = t * s.userData.rotSpeed;
      s.rotation.y = t * s.userData.rotSpeed * 0.7;
      s.position.y = s.userData.baseY + Math.sin(t * s.userData.speed + s.userData.offset) * 0.8;
    });

    // floor drift
    floor.rotation.z = t * 0.02;

    // lights orbit
    lightA.position.x = Math.cos(t * 0.4) * 10;
    lightA.position.z = Math.sin(t * 0.4) * 10;
    lightB.position.x = Math.cos(t * 0.4 + Math.PI) * 10;
    lightB.position.z = Math.sin(t * 0.4 + Math.PI) * 10;

    renderer.render(scene, camera);
  }
  animate();

  /* ───── RESIZE ───── */
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    particleMat.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 2);
  });

  /* ───── PAUSE WHEN TAB HIDDEN ───── */
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      running = false;
    } else {
      running = true;
      clock.getDelta();
      animate();
    }
  });
})();