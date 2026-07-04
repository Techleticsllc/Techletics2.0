/* ============================================================
   TECHLETICS — script.js
   Isolated 3D hero scene ONLY. This is the one part of the page
   that depends on WebGL + ES module imports. It is wrapped so
   that if anything here fails (network, browser support, GPU),
   the failure is caught and logged — it can never blank out or
   break the rest of the page (nav, sections, reveals, counters,
   carousel, CTA), which all live in interactions.js and run
   independently of this file.
   ============================================================ */
try {
  const THREE = await import("three");
  const { EffectComposer } = await import("three/addons/postprocessing/EffectComposer.js");
  const { RenderPass } = await import("three/addons/postprocessing/RenderPass.js");
  const { UnrealBloomPass } = await import("three/addons/postprocessing/UnrealBloomPass.js");

  initHeroScene(THREE, EffectComposer, RenderPass, UnrealBloomPass);
} catch (err) {
  console.warn("Techletics: 3D hero scene unavailable, showing CSS fallback.", err);
}

function buildBasketballTextures(THREE) {
    const size = 2048;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = 1024;
    const ctx = canvas.getContext("2d");
    const w = canvas.width, h = canvas.height;

    // 1. Premium Midnight Blue Base Color
    ctx.fillStyle = "#0d1b2a"; 
    ctx.fillRect(0, 0, w, h);

    // 2. Heavy Leather Pebbling / Grain
    const pebbleRadius = 1.2;
    const spacing = 4.5;
    
    for (let x = 0; x < w; x += spacing) {
        for (let y = 0; y < h; y += spacing) {
            // Shift every other row slightly for a natural, staggered leather look
            const shiftX = (Math.floor(y / spacing) % 2) * (spacing / 2);
            const px = x + shiftX + (Math.random() - 0.5) * 0.8;
            const py = y + (Math.random() - 0.5) * 0.8;
            
            // Dark pocket underneath the pebble
            ctx.fillStyle = "rgba(5, 10, 20, 0.4)";
            ctx.beginPath();
            ctx.arc(px, py + 0.5, pebbleRadius, 0, Math.PI * 2);
            ctx.fill();

            // Clear blue highlight on top of the pebble
            ctx.fillStyle = "rgba(30, 144, 255, 0.12)"; 
            ctx.beginPath();
            ctx.arc(px, py, pebbleRadius, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // 3. Crisp Black Rubber Seams
    ctx.strokeStyle = "#1a1a1a"; 
    ctx.lineWidth = 12; 
    ctx.lineCap = "round";

    function drawVerticalSeam(offsetX, amplitude) {
        ctx.beginPath();
        for (let y = 0; y <= h; y += 4) {
            const t = y / h;
            const x = offsetX + Math.sin(t * Math.PI) * amplitude;
            if (y === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
    }

    drawVerticalSeam(w * 0.25, w * 0.06);
    drawVerticalSeam(w * 0.75, -w * 0.06);
    drawVerticalSeam(w * 0.0, w * 0.05);
    drawVerticalSeam(w * 1.0, -w * 0.05);

    ctx.beginPath();
    ctx.moveTo(0, h / 2);
    ctx.lineTo(w, h / 2);
    ctx.stroke();

    function archSeam(cy, dir) {
        ctx.beginPath();
        for (let x = 0; x <= w; x += 4) {
            const t = x / w;
            const y = cy + Math.sin(t * Math.PI * 2) * (h * 0.05) * dir;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
    }

    archSeam(h * 0.25, 1);
    archSeam(h * 0.75, -1);

    // 4. Branding Text
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const cx = w / 2, cy = h / 2;

    ctx.font = "700 84px 'Space Grotesk', sans-serif";
    ctx.fillStyle = "#111111"; 
    ctx.fillText("TECHLETICS", cx, cy - 46);

    ctx.font = "500 34px 'Inter', sans-serif";
    ctx.fillStyle = "#222222";
    ctx.fillText("Your Game, Upgraded", cx, cy + 20);
    ctx.restore();

    // 5. Build Material Maps
    const colorTex = new THREE.CanvasTexture(canvas);
    colorTex.colorSpace = THREE.SRGBColorSpace;
    colorTex.wrapS = THREE.RepeatWrapping;
    colorTex.anisotropy = 8;

    const bumpCanvas = document.createElement("canvas");
    bumpCanvas.width = w;
    bumpCanvas.height = h;
    const bctx = bumpCanvas.getContext("2d");
    bctx.fillStyle = "#808080";
    bctx.fillRect(0, 0, w, h);
    bctx.drawImage(canvas, 0, 0);
    bctx.globalCompositeOperation = "multiply";
    bctx.fillStyle = "rgba(128,128,128,0.5)";
    bctx.fillRect(0, 0, w, h);

    const bumpTex = new THREE.CanvasTexture(bumpCanvas);
    bumpTex.wrapS = THREE.RepeatWrapping;

    return { colorTex, bumpTex };
}

function initHeroScene(THREE, EffectComposer, RenderPass, UnrealBloomPass) {
  const canvas = document.getElementById("hero-canvas");
  if (!canvas) return;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x050505, 0.045);

  const camera = new THREE.PerspectiveCamera(42, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
  camera.position.set(0, 0, 7.2);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;

  const ambient = new THREE.AmbientLight(0x1e2a3a, 0.9);
  scene.add(ambient);

  const keyLight = new THREE.SpotLight(0x8fc6ff, 220, 30, Math.PI / 5, 0.4, 1);
  keyLight.position.set(-5, 5, 6);

  const rimLight = new THREE.PointLight(0xff6a00, 60, 20, 2);
  rimLight.position.set(4, -2, -3);
  scene.add(rimLight);

  const bounceLight = new THREE.PointLight(0xffffff, 12, 15);
  bounceLight.position.set(0, -4, 3);
  scene.add(bounceLight);

   const topLight = new THREE.DirectionalLight(0xffffff, 2.5);
topLight.position.set(0, 8, 2);
scene.add(topLight);

  const { colorTex, bumpTex } = buildBasketballTextures(THREE);
  const ballGeo = new THREE.SphereGeometry(2, 128, 128);
 const ballMat = new THREE.MeshPhysicalMaterial({
    map: colorTex,
    bumpMap: bumpTex,
    bumpScale: 0.05,            // 1. INCREASE THIS from 0.035 to 0.05 (Makes the pebbling deeper)
    roughness: 0.85,
    metalness: 0.05,
    clearcoat: 0.0,
    clearcoatRoughness: 0.6,
    envMapIntensity: 1.1,
});
  const ball = new THREE.Mesh(ballGeo, ballMat);
  scene.add(ball);

  const shadowGeo = new THREE.CircleGeometry(2.4, 64);
  const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.35 });
  const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
  shadowMesh.rotation.x = -Math.PI / 2;
  shadowMesh.position.y = -2.6;
  scene.add(shadowMesh);

  const rings = [];
  [2.8, 3.4, 4.1].forEach((r, i) => {
    const ringGeo = new THREE.TorusGeometry(r, 0.008, 16, 128);
    const ringMat = new THREE.MeshBasicMaterial({
      color: i % 2 === 0 ? 0x1e90ff : 0xff6a00,
      transparent: true,
      opacity: 0.35,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2 + i * 0.4;
    ring.rotation.y = i * 0.7;
    scene.add(ring);
    rings.push(ring);
  });

  const particleCount = 500;
  const particleGeo = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const blue = new THREE.Color(0x1e90ff);
  const orange = new THREE.Color(0xff6a00);
  for (let i = 0; i < particleCount; i++) {
    const radius = 5 + Math.random() * 9;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos((Math.random() * 2) - 1);
    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta) * 0.6;
    positions[i * 3 + 2] = radius * Math.cos(phi) * 0.5 - 2;
    const c = Math.random() > 0.5 ? blue : orange;
    colors[i * 3] = c.r; colors[i * 3 + 1] = c.g; colors[i * 3 + 2] = c.b;
  }
  particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  particleGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  const particleMat = new THREE.PointsMaterial({
    size: 0.045, vertexColors: true, transparent: true, opacity: 0.75,
    blending: THREE.AdditiveBlending, depthWrite: false,
  });
  const particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  const beamGroup = new THREE.Group();
  for (let i = 0; i < 5; i++) {
    const beamGeo = new THREE.PlaneGeometry(0.06, 10);
    const beamMat = new THREE.MeshBasicMaterial({
      color: i % 2 === 0 ? 0x1e90ff : 0xff6a00,
      transparent: true, opacity: 0.06, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
    });
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beam.position.set((Math.random() - 0.5) * 12, 0, -4 - Math.random() * 4);
    beam.rotation.z = Math.random() * Math.PI;
    beamGroup.add(beam);
  }
  scene.add(beamGroup);

  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloomPass = new UnrealBloomPass(new THREE.Vector2(canvas.clientWidth, canvas.clientHeight), 0.85, 0.6, 0.15);
  composer.addPass(bloomPass);

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
    composer.setSize(w, h);
  }
  window.addEventListener("resize", resize);

  let targetRotY = 0, targetRotX = 0;
  window.addEventListener("mousemove", (e) => {
    targetRotY = ((e.clientX / window.innerWidth) - 0.5) * 0.6;
    targetRotX = ((e.clientY / window.innerHeight) - 0.5) * 0.3;
  });

  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    ball.rotation.y += 0.0032;
    ball.rotation.x += (targetRotX * 0.4 - ball.rotation.x) * 0.03;

    camera.position.x += (targetRotY * 1.4 - camera.position.x) * 0.04;
    camera.lookAt(0, 0, 0);

    rings.forEach((r, i) => { r.rotation.z += 0.0015 * (i % 2 === 0 ? 1 : -1); });

    particles.rotation.y = t * 0.02;

    rimLight.position.x = 4 + Math.cos(t * 0.25) * 1.5;

    composer.render();
  }

  resize();
  animate();

  // once the ball is actually rendering, fade out the CSS fallback orb
  const fallbackOrb = document.querySelector(".hero-fallback-orb");
  if (fallbackOrb) fallbackOrb.style.opacity = "0";
}
