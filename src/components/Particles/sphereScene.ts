/**
 * Framework-free Three.js scene for the hero's sparkling particle sphere.
 *
 * Kept separate from the React wrapper (`sparklingSphere.tsx`) so the
 * mobile hero can load it with a plain dynamic `import()` during idle time
 * without also paying for the React runtime — see `Hero.astro`.
 */
import {
  ACESFilmicToneMapping,
  AmbientLight,
  CanvasTexture,
  Color,
  Group,
  MathUtils,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  Plane,
  PointLight,
  Quaternion,
  Raycaster,
  Scene,
  SphereGeometry,
  Vector2,
  Vector3,
  WebGLRenderer,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

interface ICreateParticles {
  total: number;
  radius: number;
}

export interface SphereOptions {
  backgroundColor?: string;
  particleColors: number[];
  /** Particle count on desktop. Defaults to 2000 for the legacy hero. */
  totalParticles?: number;
  /** Particle count on small viewports (<= 768px). Defaults to half of `totalParticles`. */
  mobileTotalParticles?: number;
  /** Upper bound for the canvas device-pixel ratio. Defaults to 1. */
  maxPixelRatio?: number;
  /** MSAA on the WebGL context. Defaults to true. */
  antialias?: boolean;
  /**
   * Bloom post-processing (default true). It renders the scene through
   * several full-screen blur passes per frame — the single most expensive
   * part of the effect — so the mobile hero turns it off.
   */
  bloom?: boolean;
  /** Fade the canvas in once the first frame has rendered. */
  fadeIn?: boolean;
}

/** True when the user asked the browser to reduce data usage. */
export function prefersReducedData(): boolean {
  const connection = (navigator as Navigator & {
    connection?: { saveData?: boolean };
  }).connection;
  return connection?.saveData === true;
}

const createBackground = ({ color }: { color: string }) => {
  // When the caller asks for a transparent background, render nothing —
  // the canvas alpha will let whatever is behind the sphere (Tailwind
  // `bg-bg` etc.) show through. This keeps the homepage hero feeling
  // integrated instead of trapped inside a colored bubble.
  if (color === "transparent") {
    return null;
  }

  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    // Color by default
    return new Color(0x021027);
  }

  const size = 512; // Tamaño del canvas
  canvas.width = canvas.height = size;

  const gradient = context.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2
  );

  gradient.addColorStop(0, color);
  gradient.addColorStop(1, "#000000");
  context.fillStyle = gradient;
  context.fillRect(0, 0, size, size);

  const texture = new CanvasTexture(canvas);
  return texture;
};

/**
 * Mount the sphere inside `mountEl` and start animating. Returns a cleanup
 * function that stops the loop and frees every GPU resource.
 *
 * Mounts nothing when the user prefers reduced motion or reduced data.
 */
export function mountSphere(
  mountEl: HTMLElement,
  {
    backgroundColor = "transparent",
    particleColors,
    totalParticles,
    mobileTotalParticles,
    maxPixelRatio = 1,
    antialias = true,
    bloom = true,
    fadeIn = false,
  }: SphereOptions,
): () => void {
  // Respect prefers-reduced-motion: skip the animated sphere entirely and
  // paint a static gradient background so the page still has visual depth.
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  if (reduceMotion) {
    // For transparent backgrounds we don't want to paint anything — the
    // caller controls the surrounding visuals. Otherwise fall back to a
    // soft radial gradient so the page still has depth.
    if (backgroundColor !== "transparent") {
      mountEl.style.background = `radial-gradient(circle at center, ${backgroundColor} 0%, #000000 100%)`;
      mountEl.style.position = "absolute";
      mountEl.style.inset = "0";
      mountEl.style.width = "100%";
      mountEl.style.height = "100%";
      return () => {
        mountEl.style.background = "";
      };
    }
    return () => {};
  }

  // Data saver: a decorative WebGL scene is exactly what the user opted out of.
  if (prefersReducedData()) return () => {};

  // Decide particle count based on viewport, replacing react-device-detect.
  const isSmallViewport = window.matchMedia("(max-width: 768px)").matches;
  const desktopCount = totalParticles ?? 2000;
  const mobileCount =
    mobileTotalParticles ?? Math.max(200, Math.round(desktopCount / 2));
  const resolvedParticleCount = isSmallViewport ? mobileCount : desktopCount;

  // Scene setup
  const scene = new Scene();

  const texture = createBackground({ color: backgroundColor });

  // `null` (transparent mode) means: don't paint a scene background; the
  // renderer's alpha channel will composite with whatever sits behind the
  // canvas in the DOM.
  if (texture) {
    scene.background = texture;
  }

  // The host element decides the canvas size, not the window. Capture the
  // mount's bounding rect so the renderer fits inside the hero column
  // instead of overflowing the whole viewport.
  const initialRect = mountEl.getBoundingClientRect();
  const initialWidth = Math.max(1, initialRect.width || window.innerWidth);
  const initialHeight = Math.max(1, initialRect.height || window.innerHeight);

  const camera = new PerspectiveCamera(
    75,
    initialWidth / initialHeight,
    0.1,
    1000
  );

  const renderer = new WebGLRenderer({
    antialias,
    alpha: true,
  });

  // Cap the pixel ratio: a 3x phone would otherwise shade 9x the pixels of
  // a 1x canvas for a decorative background.
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxPixelRatio));
  renderer.setSize(initialWidth, initialHeight);
  // Transparent canvas when caller opted-in, opaque black otherwise.
  if (backgroundColor === "transparent") {
    renderer.setClearColor(0x000000, 0);
  } else {
    renderer.setClearColor(0x000000, 1);
  }
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.5;
  mountEl.appendChild(renderer.domElement);
  // The sphere is purely decorative; never steal pointer events from CTAs.
  renderer.domElement.style.pointerEvents = "none";
  if (fadeIn) {
    // Mounted late (after idle) on mobile: ease in instead of popping.
    renderer.domElement.style.opacity = "0";
    renderer.domElement.style.transition = "opacity 800ms ease-out";
  }

  // Camera position and controls
  camera.position.z = 5;
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  // Decorative sphere: don't compete with the rest of the page for the
  // user's input (scroll, drag) just to spin a background.
  controls.enabled = false;
  controls.enableZoom = false;
  controls.enablePan = false;

  // Post-processing setup (skipped entirely when bloom is off: the scene
  // is then drawn straight to the canvas in a single pass).
  let composer: EffectComposer | null = null;
  if (bloom) {
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(
      new UnrealBloomPass(
        new Vector2(initialWidth, initialHeight),
        1.5,
        0.4,
        0.1,
      ),
    );
    composer.setSize(initialWidth, initialHeight);
  }

  // Lighting
  const ambientLight = new AmbientLight(0x111111);
  scene.add(ambientLight);

  const pointLight = new PointLight(0x88ccff, 1);
  pointLight.position.set(5, 5, 5);
  scene.add(pointLight);

  // Group for all particles
  const group = new Group();
  scene.add(group);

  // Mouse tracking with raycaster
  const raycaster = new Raycaster();
  const mousePos = new Vector2();

  // Interactive parameters
  const interactionRadius = 1.5;
  const maxGlowIntensity = 5;
  // Without the bloom pass nothing spreads the particles' light, so they
  // are drawn brighter and slightly larger to keep the sphere readable.
  const baseGlowIntensity = bloom ? 0.5 : 1.6;
  const dispersalForce = 0.08;
  const returnForce = 0.02;
  const dampingFactor = 0.95;
  const rotationSpeed = 0.0025;

  // Shared geometry — disposed in cleanup to avoid GPU leaks.
  const particleGeometry = new SphereGeometry(bloom ? 0.015 : 0.022, 6, 6);

  // Create particles
  const createParticles = (params: ICreateParticles) => {
    const particles = [];
    const count = params.total;
    const radius = params.radius;

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);

      const position = new Vector3(x, y, z);

      const baseColor =
        particleColors[Math.floor(Math.random() * particleColors.length)];
      const material = new MeshStandardMaterial({
        color: baseColor,
        emissive: baseColor,
        emissiveMap: null,
        metalness: 0.5,
        roughness: 0.2,
        toneMapped: false,
      });

      const mesh = new Mesh(particleGeometry, material);
      mesh.position.copy(position);

      group.add(mesh);

      particles.push({
        mesh,
        material,
        position: position.clone(),
        originalPosition: position.clone(),
        velocity: new Vector3(),
        quaternion: new Quaternion(),
        baseColor: new Color(baseColor),
        currentIntensity: baseGlowIntensity,
      });
    }

    return particles;
  };

  const particles = createParticles({
    total: resolvedParticleCount,
    radius: 2,
  });

  // Update particles function
  const updateParticles = () => {
    raycaster.setFromCamera(mousePos, camera);
    const intersectPlane = new Plane(new Vector3(0, 0, 1), 0);
    const mousePosition3D = new Vector3();
    raycaster.ray.intersectPlane(intersectPlane, mousePosition3D);

    particles.forEach((particle) => {
      const distanceToMouse = mousePosition3D.distanceTo(particle.position);
      const isInRange = distanceToMouse < interactionRadius;

      const force = isInRange
        ? dispersalForce * (1 - distanceToMouse / interactionRadius)
        : 0;

      if (isInRange) {
        const repulsionDir = particle.position
          .clone()
          .sub(mousePosition3D)
          .normalize();

        particle.velocity.add(
          repulsionDir.multiplyScalar(force * (1 + Math.random() * 0.2))
        );

        const intensity = MathUtils.lerp(
          maxGlowIntensity,
          baseGlowIntensity,
          distanceToMouse / interactionRadius
        );

        const glowColor = particle.baseColor
          .clone()
          .multiplyScalar(intensity);
        particle.mesh.material.emissive = glowColor;
      } else {
        particle.mesh.material.emissive = particle.baseColor
          .clone()
          .multiplyScalar(baseGlowIntensity);
      }

      const distanceToOrigin = particle.position.distanceTo(
        particle.originalPosition
      );
      const returnForceVector = particle.originalPosition
        .clone()
        .sub(particle.position)
        .normalize()
        .multiplyScalar(returnForce * distanceToOrigin);

      particle.velocity.add(returnForceVector);
      particle.velocity.multiplyScalar(dampingFactor);

      particle.position.add(particle.velocity);
      particle.mesh.position.copy(particle.position);

      if (particle.velocity.length() > 0.001) {
        particle.quaternion.setFromUnitVectors(
          new Vector3(0, 1, 0),
          particle.velocity.clone().normalize()
        );
        particle.mesh.quaternion.slerp(particle.quaternion, 0.1);
      }
    });

    group.rotation.y += rotationSpeed;
  };

  // Window resize handler. Use the mount's own size so the canvas keeps
  // tracking the hero column even when it's not the full viewport.
  const handleWindowResize = () => {
    const rect = mountEl.getBoundingClientRect();
    const w = Math.max(1, rect.width);
    const h = Math.max(1, rect.height);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    composer?.setSize(w, h);
  };

  // Mouse move handler — track relative to the canvas, not the window, so
  // the cursor-following glow stays consistent when the sphere is inset.
  const handleMouseMove = (event: MouseEvent) => {
    const rect = renderer.domElement.getBoundingClientRect();
    mousePos.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mousePos.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  };

  // Animation loop — track the rAF id so we can cancel it on unmount.
  let rafId = 0;
  let firstFrame = true;
  const animate = () => {
    rafId = requestAnimationFrame(animate);
    updateParticles();
    controls.update();
    if (composer) composer.render();
    else renderer.render(scene, camera);
    if (firstFrame) {
      firstFrame = false;
      if (fadeIn) renderer.domElement.style.opacity = "1";
    }
  };

  // Only burn GPU while the sphere can be seen: stop the loop when the
  // host scrolls out of view or the tab is hidden, resume when it's back.
  let inView = true;
  const syncLoop = () => {
    const shouldRun = inView && document.visibilityState === "visible";
    if (shouldRun && !rafId) {
      animate();
    } else if (!shouldRun && rafId) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    }
  };
  const visibilityObserver =
    typeof IntersectionObserver === "undefined"
      ? null
      : new IntersectionObserver(([entry]) => {
          inView = entry.isIntersecting;
          syncLoop();
        });
  visibilityObserver?.observe(mountEl);
  document.addEventListener("visibilitychange", syncLoop);

  // Add event listeners
  window.addEventListener("resize", handleWindowResize);
  window.addEventListener("mousemove", handleMouseMove);

  const mount = mountEl;
  const canvas = renderer.domElement;

  // Start animation
  syncLoop();

  // Cleanup
  return () => {
    cancelAnimationFrame(rafId);
    rafId = 0;
    visibilityObserver?.disconnect();
    document.removeEventListener("visibilitychange", syncLoop);
    window.removeEventListener("resize", handleWindowResize);
    window.removeEventListener("mousemove", handleMouseMove);

    controls.dispose();

    // Dispose every particle material; geometry is shared so dispose once.
    particles.forEach((p) => p.material.dispose());
    particleGeometry.dispose();

    // Drop background texture if one was created.
    if (scene.background && (scene.background as CanvasTexture).dispose) {
      (scene.background as CanvasTexture).dispose();
    }

    // Clear scene graph and free composer + renderer GPU resources.
    scene.clear();
    composer?.dispose();
    renderer.dispose();
    renderer.forceContextLoss();

    if (canvas.parentNode === mount) {
      mount.removeChild(canvas);
    }
  };
}
