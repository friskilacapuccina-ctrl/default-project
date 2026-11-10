"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { ContactShadows, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import type { CameraConfig, Vec3 } from "./types";

export type MarkerDef = {
  id: string;
  number: number;
  name: string;
  color: string;
  anchor: Vec3;
};

export type MarkerPos = { id: string; x: number; y: number; visible: boolean };

export type BioCanvasHandle = {
  zoomIn: () => void;
  zoomOut: () => void;
  resetView: () => void;
};

type Props = {
  children: React.ReactNode;
  autoRotate?: boolean;
  camera?: CameraConfig;
  markers: MarkerDef[];
  selectedId: string | null;
  showMarkers: boolean;
  onSelect: (id: string) => void;
  onDeselect: () => void;
  /** Dipanggil saat handle kontrol kamera siap (dipakai next/dynamic tanpa ref). */
  onReady?: (handle: BioCanvasHandle) => void;
};

const DEFAULT_CAMERA: CameraConfig = {
  position: [6.5, 3.2, 8.5],
  target: [0, -0.3, 0],
  fov: 38,
};

/** Three.js expects every rendered BufferGeometry to have a usable bounding sphere. */
function ensureGeometryBounds(root: THREE.Object3D) {
  root.traverse((object) => {
    const mesh = object as THREE.Mesh;
    const geometry = mesh.geometry;
    if (!mesh.isMesh || !geometry?.isBufferGeometry) return;

    const current = geometry.boundingSphere;
    if (
      current?.center &&
      Number.isFinite(current.center.x) &&
      Number.isFinite(current.center.y) &&
      Number.isFinite(current.center.z) &&
      Number.isFinite(current.radius) &&
      current.radius >= 0
    ) {
      return;
    }

    try {
      geometry.computeBoundingSphere();
    } catch {
      // The fallback below keeps malformed/custom geometry from crashing the render loop.
    }

    const computed = geometry.boundingSphere;
    if (
      computed?.center &&
      Number.isFinite(computed.center.x) &&
      Number.isFinite(computed.center.y) &&
      Number.isFinite(computed.center.z) &&
      Number.isFinite(computed.radius) &&
      computed.radius >= 0
    ) {
      return;
    }

    geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1);
  });
}

/** Repairs custom geometry bounds before Drei's ContactShadows renders its first frame. */
function PrepareGeometry({ contentRef }: { contentRef: React.RefObject<THREE.Group> }) {
  const prepared = useRef(false);

  useFrame(() => {
    if (prepared.current || !contentRef.current) return;
    ensureGeometryBounds(contentRef.current);
    prepared.current = true;
  }, -1);

  return null;
}

function useDarkCanvas() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const update = () => setIsDark(root.classList.contains("dark"));
    update();

    const observer = new MutationObserver(update);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return isDark;
}

/** Terapkan tone mapping & exposure (pencahayaan sinematik, warna tetap natural). */
function CameraSetup() {
  const { gl } = useThree();

  useEffect(() => {
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.15;
  }, [gl]);

  return null;
}

type FittedFrame = { position: THREE.Vector3; target: THREE.Vector3 };

/**
 * Bingkai kamera otomatis: hitung bounding box model, lalu posisikan kamera
 * agar model selalu mengisi viewport dengan proporsi tepat (tanpa over/under-flow).
 * Arah pandang diambil dari `config.position` sebagai petunjuk sudut.
 */
function AutoFrame({
  contentRef,
  controlsRef,
  config,
  fittedRef,
}: {
  contentRef: React.RefObject<THREE.Group>;
  controlsRef: React.MutableRefObject<any>;
  config: CameraConfig;
  fittedRef: React.MutableRefObject<FittedFrame | null>;
}) {
  const { camera, size } = useThree();

  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;

    // Pastikan matriks dunia sudah terhitung sebelum membaca posisi mesh.
    content.updateWorldMatrix(true, true);
    ensureGeometryBounds(content);

    const box = new THREE.Box3();
    content.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh || !mesh.geometry) return;
      const bs = mesh.geometry.boundingSphere;
      if (!bs) return;
      const worldCenter = bs.center.clone().applyMatrix4(mesh.matrixWorld);
      const scale = mesh.getWorldScale(new THREE.Vector3());
      const maxScale = Math.max(scale.x, scale.y, scale.z);
      const r = bs.radius * maxScale;
      box.expandByPoint(worldCenter.clone().addScalar(r));
      box.expandByPoint(worldCenter.clone().subScalar(r));
    });

    if (box.isEmpty()) return;

    // Bingkai berbasis proyeksi sumbu kotak ke bidang layar (bukan bola) —
    // jauh lebih rapat untuk model tinggi/nipis (mis. ekosistem) dan tetap
    // aman untuk model lebar/datar, karena seluruh sudut ikut diperiksa.
    const center = box.getCenter(new THREE.Vector3());
    const half = box.getSize(new THREE.Vector3()).multiplyScalar(0.5);

    const fovDeg = config.fov ?? 38;
    const fovRad = (fovDeg * Math.PI) / 180;
    const aspect = size.width / Math.max(size.height, 1);
    const hFov = 2 * Math.atan(Math.tan(fovRad / 2) * aspect);
    const padding = 1.14;

    // Arah pandang dari konfigurasi (dihitung terhadap target awal).
    const dir = new THREE.Vector3(...config.position).sub(
      new THREE.Vector3(...(config.target ?? [0, 0, 0]))
    );
    if (dir.lengthSq() < 1e-6) dir.set(0, 0.4, 1);
    dir.normalize();

    // Basis kamera: right & up — dipakai memproyeksikan setengah-sisi kotak.
    const forward = dir.clone();
    const worldUp = new THREE.Vector3(0, 1, 0);
    const right = new THREE.Vector3().crossVectors(forward, worldUp);
    if (right.lengthSq() < 1e-6) right.set(1, 0, 0);
    right.normalize();
    const up = new THREE.Vector3().crossVectors(right, forward).normalize();

    // Setengah-ekstensi terproyeksi (kombinasi sudut AABB di bidang layar).
    const halfRight = Math.abs(half.x * right.x) + Math.abs(half.y * right.y) + Math.abs(half.z * right.z);
    const halfUp = Math.abs(half.x * up.x) + Math.abs(half.y * up.y) + Math.abs(half.z * up.z);

    // Jarak minimum agar muat secara vertikal dan horizontal.
    const distVertical = halfUp / Math.tan(fovRad / 2);
    const distHorizontal = halfRight / Math.tan(hFov / 2);
    const distance = Math.max(distVertical, distHorizontal, 1) * padding;

    const position = center.clone().add(dir.multiplyScalar(distance));

    camera.position.copy(position);
    camera.lookAt(center);
    if ("fov" in camera) {
      (camera as THREE.PerspectiveCamera).fov = fovDeg;
      camera.updateProjectionMatrix();
    }

    const controls = controlsRef.current;
    if (controls) {
      controls.target.copy(center);
      const radius = Math.max(half.length(), 0.1);
      controls.minDistance = Math.max(1.2, radius * 0.5);
      controls.maxDistance = radius * 6;
      controls.update();
    }

    fittedRef.current = { position, target: center };
  }, [camera, config, contentRef, controlsRef, fittedRef, size.width, size.height]);

  return null;
}

/**
 * Memproyeksikan jangkar marker (koordinat dunia) ke koordinat layar,
 * lalu menyembunyikan marker yang saling bertabrakan (collision avoidance).
 * Marker terpilih selalu diprioritaskan agar tidak pernah hilang.
 */
function MarkerProjector({
  markers,
  selectedId,
  showMarkers,
  onLayout,
}: {
  markers: MarkerDef[];
  selectedId: string | null;
  showMarkers: boolean;
  onLayout: (positions: MarkerPos[]) => void;
}) {
  const { camera, size } = useThree();
  const lastRef = useRef(0);
  const sigRef = useRef("");
  const vec = useRef(new THREE.Vector3()).current;

  useFrame(() => {
    if (!showMarkers) {
      if (sigRef.current !== "hidden") {
        sigRef.current = "hidden";
        onLayout([]);
      }
      return;
    }
    const now = performance.now();
    if (now - lastRef.current < 33) return; // throttle ±30 fps
    lastRef.current = now;

    const raw = markers.map((m) => {
      vec.set(m.anchor[0], m.anchor[1], m.anchor[2]).project(camera);
      return {
        id: m.id,
        number: m.number,
        x: (vec.x * 0.5 + 0.5) * size.width,
        y: (-vec.y * 0.5 + 0.5) * size.height,
        behind: vec.z > 1 || vec.z < -1,
      };
    });

    // Marker terpilih diprioritaskan, sisanya urut nomor
    const ordered = [...raw].sort((a, b) => {
      const pa = a.id === selectedId ? 0 : 1;
      const pb = b.id === selectedId ? 0 : 1;
      if (pa !== pb) return pa - pb;
      return a.number - b.number;
    });

    const accepted: typeof raw = [];
    const HALF = 18; // setengah lebar marker + jarak aman (px)
    for (const item of ordered) {
      if (item.behind) continue;
      const overlaps = accepted.some(
        (a) => Math.abs(a.x - item.x) < HALF * 2 && Math.abs(a.y - item.y) < HALF * 2
      );
      if (!overlaps) accepted.push(item);
    }

    const visible = new Set(accepted.map((a) => a.id));
    const out: MarkerPos[] = raw.map((r) => ({
      id: r.id,
      x: Math.round(r.x),
      y: Math.round(r.y),
      visible: visible.has(r.id) && !r.behind,
    }));

    const sig = JSON.stringify(out);
    if (sig !== sigRef.current) {
      sigRef.current = sig;
      onLayout(out);
    }
  });

  return null;
}

export function BioCanvas({
  children,
  autoRotate = true,
  camera: camConfig,
  markers,
  selectedId,
  showMarkers,
  onSelect,
  onDeselect,
  onReady,
}: Props) {
  const config = camConfig ?? DEFAULT_CAMERA;
  const controlsRef = useRef<any>(null);
  const contentRef = useRef<THREE.Group>(null);
  const fittedRef = useRef<FittedFrame | null>(null);
  const [positions, setPositions] = useState<MarkerPos[]>([]);

  const onLayout = useCallback((next: MarkerPos[]) => setPositions(next), []);

  const handle = useMemo<BioCanvasHandle>(
    () => ({
      zoomIn: () => {
        const c = controlsRef.current;
        if (!c) return;
        const cam = c.object;
        const dir = cam.position.clone().sub(c.target);
        const dist = dir.length();
        const f = fittedRef.current;
        const minD = f ? Math.max(1.2, f.position.distanceTo(f.target) * 0.4) : 2;
        const next = Math.max(minD, dist * 0.8);
        cam.position.copy(c.target.clone().add(dir.setLength(next)));
        c.update();
      },
      zoomOut: () => {
        const c = controlsRef.current;
        if (!c) return;
        const cam = c.object;
        const dir = cam.position.clone().sub(c.target);
        const dist = dir.length();
        const f = fittedRef.current;
        const maxD = f ? f.position.distanceTo(f.target) * 2.5 : 40;
        const next = Math.min(maxD, dist * 1.25);
        cam.position.copy(c.target.clone().add(dir.setLength(next)));
        c.update();
      },
      resetView: () => {
        const c = controlsRef.current;
        if (!c) return;
        const f = fittedRef.current;
        if (f) {
          c.object.position.copy(f.position);
          c.target.copy(f.target);
        } else {
          c.object.position.set(...config.position);
          c.target.set(...(config.target ?? [0, 0, 0]));
        }
        c.object.lookAt(c.target);
        c.update();
      },
    }),
    [config]
  );

  useEffect(() => {
    onReady?.(handle);
  }, [handle, onReady]);

  const byId = new Map(positions.map((p) => [p.id, p]));
  const selectedPos = selectedId ? byId.get(selectedId) : undefined;
  const selectedDef = selectedId ? markers.find((m) => m.id === selectedId) : undefined;
  // Geser label nama agar tidak keluar tepi kanan kanvas
  const flip = selectedPos ? selectedPos.x > 190 : false;
  const isDark = useDarkCanvas();
  const canvasBackground = isDark ? "#304247" : "#e2e9e5";

  return (
    <div
      className={`relative h-[440px] sm:h-[500px] lg:h-[560px] w-full rounded-2xl overflow-hidden border ${
        isDark ? "border-[#4a6060]" : "border-[#bfd0c8]"
      }`}
      style={{ backgroundColor: canvasBackground }}
    >
      <Canvas
        camera={{ position: config.position, fov: config.fov ?? 38 }}
        dpr={[1, 1.8]}
        onPointerMissed={onDeselect}
      >
        <color attach="background" args={[canvasBackground]} />

        <CameraSetup />

        {/* Pencahayaan: key, fill, rim, ambient — kontras baik tanpa neon */}
        <ambientLight intensity={0.5} color="#F0F7F5" />
        <hemisphereLight groundColor="#8AB8B0" intensity={0.6} />
        <directionalLight
          position={[5, 10, 6]}
          intensity={2.6}
          color="#FFFEF8"
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={30}
          shadow-camera-near={1}
          shadow-normalBias={0.02}
          shadow-bias={-0.0005}
        />
        <directionalLight position={[-7, 4, -5]} intensity={1.1} color="#FFF5EB" />
        <directionalLight position={[0, -3, -10]} intensity={0.8} color="#E8F4FD" />
        <directionalLight position={[8, 2, -4]} intensity={0.5} color="#D0E8FF" />

        <group ref={contentRef}>{children}</group>

        <PrepareGeometry contentRef={contentRef} />

        <AutoFrame
          contentRef={contentRef}
          controlsRef={controlsRef}
          config={config}
          fittedRef={fittedRef}
        />

        <ContactShadows
          position={[0, -3.8, 0]}
          opacity={0.18}
          scale={18}
          blur={3.5}
          far={8}
          color="#042E27"
          frames={1}
        />

        <OrbitControls
          ref={controlsRef}
          makeDefault
          autoRotate={autoRotate}
          autoRotateSpeed={0.5}
          enableDamping
          dampingFactor={0.05}
          maxPolarAngle={Math.PI / 1.7}
          minPolarAngle={0.15}
          enablePan
          zoomSpeed={1.2}
        />

        <MarkerProjector
          markers={markers}
          selectedId={selectedId}
          showMarkers={showMarkers}
          onLayout={onLayout}
        />
      </Canvas>

      {/* Lapisan marker bernomor — di atas kanvas, mengikuti proyeksi 3D */}
      <div className="absolute inset-0 pointer-events-none">
        {positions.map((p) => {
          const def = markers.find((m) => m.id === p.id);
          if (!def) return null;
          const isSelected = p.id === selectedId;
          const hidden = !p.visible && !isSelected; // marker bertabrakan disembunyikan total
          return (
            <button
              key={p.id}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(p.id);
              }}
              aria-label={`Nomor ${def.number}: ${def.name}`}
              className={`pointer-events-auto absolute flex items-center justify-center rounded-full font-bold transition-all duration-200 ${
                isSelected ? "ring-2 ring-white/80 scale-110" : "hover:scale-110"
              }`}
              style={{
                left: p.x,
                top: p.y,
                transform: "translate(-50%, -50%)",
                width: 26,
                height: 26,
                fontSize: 12,
                opacity: hidden ? 0 : 1,
                pointerEvents: hidden ? "none" : "auto",
                background: isSelected ? def.color : "rgba(2,33,30,0.9)",
                color: isSelected ? "#0b2320" : "#EAF5F2",
                border: `2px solid ${isSelected ? "#ffffff" : def.color}`,
                boxShadow: "0 2px 8px rgba(2,33,30,0.45)",
                zIndex: isSelected ? 30 : 20,
              }}
            >
              {def.number}
            </button>
          );
        })}

        {/* Label nama hanya untuk struktur terpilih — tidak pernah menumpuk */}
        {showMarkers && selectedPos && selectedDef && selectedPos.visible && (
          <div
            className="absolute whitespace-nowrap rounded-lg px-2.5 py-1 text-[11px] font-semibold shadow-lg"
            style={{
              left: selectedPos.x,
              top: selectedPos.y - 24,
              transform: `translate(${flip ? "-100%" : "0"}, -100%)`,
              background: "rgba(2,33,30,0.94)",
              color: "#EAF5F2",
              border: `1px solid ${selectedDef.color}`,
              zIndex: 40,
            }}
          >
            <span style={{ color: selectedDef.color }}>{selectedDef.number}</span>
            {" · "}
            {selectedDef.name}
          </div>
        )}
      </div>

      {/* Vignette halus */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-transparent to-black/5 rounded-2xl" />
    </div>
  );
};
