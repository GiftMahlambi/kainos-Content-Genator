import { Canvas, useFrame } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";

/** Procedural realistic moon: heavy cratered albedo + matching bump map */
function useMoonMaps() {
  return useMemo(() => {
    const size = 1024;

    // ---- ALBEDO ----
    const aCanvas = document.createElement("canvas");
    aCanvas.width = aCanvas.height = size;
    const a = aCanvas.getContext("2d")!;

    // base regolith gray
    a.fillStyle = "#b9b6ad";
    a.fillRect(0, 0, size, size);

    // large dark "maria" patches
    const maria = 14;
    for (let i = 0; i < maria; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const r = 60 + Math.random() * 180;
      const g = a.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, "rgba(70,68,75,0.55)");
      g.addColorStop(1, "rgba(70,68,75,0)");
      a.fillStyle = g;
      a.beginPath();
      a.arc(x, y, r, 0, Math.PI * 2);
      a.fill();
    }

    // noise grain
    const img = a.getImageData(0, 0, size, size);
    for (let i = 0; i < img.data.length; i += 4) {
      const n = (Math.random() - 0.5) * 18;
      img.data[i] = Math.max(0, Math.min(255, img.data[i] + n));
      img.data[i + 1] = Math.max(0, Math.min(255, img.data[i + 1] + n));
      img.data[i + 2] = Math.max(0, Math.min(255, img.data[i + 2] + n));
    }
    a.putImageData(img, 0, 0);

    // ---- BUMP (same craters, drawn as height) ----
    const bCanvas = document.createElement("canvas");
    bCanvas.width = bCanvas.height = size;
    const b = bCanvas.getContext("2d")!;
    b.fillStyle = "#808080";
    b.fillRect(0, 0, size, size);

    // craters: rim bright, floor dark
    const craterCount = 320;
    for (let i = 0; i < craterCount; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const r = 3 + Math.pow(Math.random(), 2.2) * 70;

      // floor on albedo
      const ag = a.createRadialGradient(x, y, 0, x, y, r);
      ag.addColorStop(0, "rgba(40,38,42,0.55)");
      ag.addColorStop(0.7, "rgba(180,178,170,0.05)");
      ag.addColorStop(1, "rgba(220,218,210,0)");
      a.fillStyle = ag;
      a.beginPath();
      a.arc(x, y, r, 0, Math.PI * 2);
      a.fill();

      // bump: dark floor, bright rim
      const bg = b.createRadialGradient(x, y, 0, x, y, r);
      bg.addColorStop(0, "rgba(30,30,30,1)");
      bg.addColorStop(0.75, "rgba(128,128,128,1)");
      bg.addColorStop(0.85, "rgba(245,245,245,1)");
      bg.addColorStop(1, "rgba(128,128,128,0)");
      b.fillStyle = bg;
      b.beginPath();
      b.arc(x, y, r * 1.05, 0, Math.PI * 2);
      b.fill();
    }

    // a couple bright ray craters (Tycho-like)
    for (let i = 0; i < 3; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      a.save();
      a.translate(x, y);
      for (let j = 0; j < 14; j++) {
        a.rotate((Math.PI * 2) / 14);
        const rg = a.createLinearGradient(0, 0, 0, -200);
        rg.addColorStop(0, "rgba(235,232,225,0.35)");
        rg.addColorStop(1, "rgba(235,232,225,0)");
        a.fillStyle = rg;
        a.fillRect(-3, -200, 6, 200);
      }
      a.restore();
    }

    const albedo = new THREE.CanvasTexture(aCanvas);
    albedo.colorSpace = THREE.SRGBColorSpace;
    albedo.anisotropy = 8;
    const bump = new THREE.CanvasTexture(bCanvas);
    bump.anisotropy = 8;
    return { albedo, bump };
  }, []);
}

function Moon() {
  const ref = useRef<THREE.Mesh>(null);
  const { albedo, bump } = useMoonMaps();

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.03;
  });

  return (
    <group position={[2.4, 0.3, 0]}>
      {/* very subtle outer halo */}
      <mesh>
        <sphereGeometry args={[2.6, 32, 32]} />
        <meshBasicMaterial color="#cdd6f4" transparent opacity={0.04} />
      </mesh>
      <mesh ref={ref} castShadow>
        <sphereGeometry args={[1.8, 128, 128]} />
        <meshStandardMaterial
          map={albedo}
          bumpMap={bump}
          bumpScale={0.06}
          roughness={1}
          metalness={0}
        />
      </mesh>
    </group>
  );
}

const MoonScene = () => {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 6], fov: 50 }} dpr={[1, 2]}>
        {/* very dim ambient — keeps shadow side dark like real moon */}
        <ambientLight intensity={0.04} />
        {/* hard sun light */}
        <directionalLight position={[-6, 2, 4]} intensity={2.2} color="#fff7e6" />
        {/* faint earthshine on dark side */}
        <directionalLight position={[6, -1, 2]} intensity={0.08} color="#6ea8ff" />
        <Stars radius={120} depth={60} count={6000} factor={4} saturation={0} fade speed={0.4} />
        <Moon />
      </Canvas>
      {/* deep-space gradient overlays */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_hsl(250_70%_18%_/_0.35),_transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_hsl(220_70%_20%_/_0.25),_transparent_55%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,_transparent_0%,_hsl(232_60%_3%_/_0.55)_100%)]" />
    </div>
  );
};

export default MoonScene;
