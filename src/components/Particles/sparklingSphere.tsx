import { useEffect, useRef } from "react";
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

const SparklingSphere = ({
  backgroundColor = "transparent",
  particleColors,
  totalParticles,
  mobileTotalParticles,
}: {
  backgroundColor?: string;
  particleColors: number[];
  /** Particle count on desktop. Defaults to 2000 for the legacy hero. */
  totalParticles?: number;
  /** Particle count on small viewports (<= 768px). Defaults to half of `totalParticles`. */
  mobileTotalParticles?: number;
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (!mountRef.current) return;

    // Respect prefers-reduced-motion: skip the animated sphere entirely and
    // paint a static gradient background so the page still has visual depth.
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduceMotion) {
      // For transparent backgrounds we don't want to paint anything — the
      // caller controls the surrounding visuals. Otherwise fall back to a
      // soft radial gradient so the page still has depth.
      if (backgroundColor !== "transparent") {
        const mount = mountRef.current;
        mount.style.background = `radial-gradient(circle at center, ${backgroundColor} 0%, #000000 100%)`;
        mount.style.position = "absolute";
        mount.style.inset = "0";
        mount.style.width = "100%";
        mount.style.height = "100%";
        return () => {
          mount.style.background = "";
        };
      }
      return;
    }

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
    const mountEl = mountRef.current;
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
      antialias: true,
      alpha: true,
    });

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

    // Post-processing setup
    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    const bloomPass = new UnrealBloomPass(
      new Vector2(initialWidth, initialHeight),
      1.5,
      0.4,
      0.1
    );
    composer.addPass(bloomPass);
    composer.setSize(initialWidth, initialHeight);

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
    const baseGlowIntensity = 0.5;
    const dispersalForce = 0.08;
    const returnForce = 0.02;
    const dampingFactor = 0.95;
    const rotationSpeed = 0.0025;

    // Shared geometry — disposed in cleanup to avoid GPU leaks.
    const particleGeometry = new SphereGeometry(0.015, 6, 6);

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
      composer.setSize(w, h);
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
    const animate = () => {
      rafId = requestAnimationFrame(animate);
      updateParticles();
      controls.update();
      composer.render();
    };

    // Add event listeners
    window.addEventListener("resize", handleWindowResize);
    window.addEventListener("mousemove", handleMouseMove);

    // Capture the mount node now so cleanup doesn't dereference a ref that
    // React may have already nulled out.
    const mount = mountEl;
    const canvas = renderer.domElement;

    // Start animation
    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(rafId);
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
      composer.dispose();
      renderer.dispose();
      renderer.forceContextLoss();

      if (canvas.parentNode === mount) {
        mount.removeChild(canvas);
      }
    };
  }, [backgroundColor, particleColors, totalParticles, mobileTotalParticles]);

  return <div className="wrapper" ref={mountRef} />;
};

export default SparklingSphere;
