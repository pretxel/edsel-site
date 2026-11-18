import { useEffect, useRef } from "react";
import { mountSphere, type SphereOptions } from "./sphereScene";

/**
 * React island around the Three.js sphere (see `sphereScene.ts`, which
 * holds the scene itself and can also be mounted without React).
 */
const SparklingSphere = ({
  backgroundColor = "transparent",
  particleColors,
  totalParticles,
  mobileTotalParticles,
  maxPixelRatio,
  antialias,
}: SphereOptions) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    return mountSphere(mountRef.current, {
      backgroundColor,
      particleColors,
      totalParticles,
      mobileTotalParticles,
      maxPixelRatio,
      antialias,
    });
  }, [
    backgroundColor,
    particleColors,
    totalParticles,
    mobileTotalParticles,
    maxPixelRatio,
    antialias,
  ]);

  return <div className="wrapper" ref={mountRef} />;
};

export default SparklingSphere;
