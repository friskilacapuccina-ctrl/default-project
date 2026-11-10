"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useCursor } from "@react-three/drei";
import * as THREE from "three";
import type { ThreeEvent } from "@react-three/fiber";
import { useFrame } from "@react-three/fiber";

type MaterialPreset =
  | "membrane"
  | "organelle"
  | "cytoplasm"
  | "wall"
  | "nucleus"
  | "chromatin"
  | "granum"
  | "vesicle"
  | "crystal"
  | "tissue"
  | "default";

type PartProps = {
  /**
   * ID struktur biologis (harus sama dengan `BioStructure.id`).
   * Seluruh mesh satu jenis organel memakai ID yang sama sehingga
   * seleksi, highlight, dan panel detail terhubung ke satu entri data.
   */
  id: string;
  selected: string | null;
  onSelect: (id: string) => void;
  color: string;
  opacity?: number;
  wireframe?: boolean;
  side?: THREE.Side;
  materialPreset?: MaterialPreset;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number] | number;
  children: React.ReactNode;
};

function getMaterialProps(preset: MaterialPreset, baseColor: THREE.Color, opacity: number) {
  const c = baseColor.clone();
  const isTransparent = opacity < 1;

  switch (preset) {
    // Selaput/lapisan transparan tipis — memakai opasitas tradisional (bukan
    // transmission berlapis) agar isi sel tetap jelas terlihat dan hemat render.
    case "membrane":
      return {
        color: c,
        roughness: 0.12,
        metalness: 0,
        clearcoat: 1,
        clearcoatRoughness: 0.12,
        iridescence: 0.25,
        iridescenceIOR: 1.3,
        side: THREE.DoubleSide,
        depthWrite: false,
        opacity: 0.24,
      };

    case "organelle":
      return {
        color: c,
        roughness: 0.35,
        metalness: 0.02,
        clearcoat: 0.85,
        clearcoatRoughness: 0.15,
        sheen: 0.3,
        sheenColor: c.clone().multiplyScalar(1.5),
        side: THREE.FrontSide,
        depthWrite: true,
      };

    case "tissue":
      return {
        color: c,
        roughness: 0.55,
        metalness: 0.0,
        clearcoat: 0.4,
        clearcoatRoughness: 0.35,
        sheen: 0.15,
        side: THREE.FrontSide,
        depthWrite: true,
      };

    case "nucleus":
      return {
        color: c,
        roughness: 0.25,
        metalness: 0.02,
        clearcoat: 1,
        clearcoatRoughness: 0.12,
        iridescence: 0.12,
        side: THREE.DoubleSide,
        depthWrite: !isTransparent,
        // Cangkang luar nukleus transparan; inti padat tetap opak.
        opacity: isTransparent ? 0.45 : 1,
      };

    case "chromatin":
      return {
        color: c,
        roughness: 0.6,
        metalness: 0.0,
        clearcoat: 0.3,
        clearcoatRoughness: 0.4,
        side: THREE.FrontSide,
      };

    case "granum":
      return {
        color: c,
        roughness: 0.2,
        metalness: 0.03,
        clearcoat: 1,
        clearcoatRoughness: 0.08,
        side: THREE.DoubleSide,
        depthWrite: true,
      };

    case "vesicle":
      return {
        color: c,
        roughness: 0.1,
        metalness: 0.02,
        clearcoat: 1,
        clearcoatRoughness: 0.08,
        iridescence: 0.3,
        iridescenceIOR: 1.35,
        side: THREE.DoubleSide,
        depthWrite: false,
        opacity: 0.6,
      };

    case "crystal":
      return {
        color: c,
        roughness: 0.15,
        metalness: 0.05,
        clearcoat: 1,
        clearcoatRoughness: 0.05,
        side: THREE.DoubleSide,
        depthWrite: true,
      };

    // Sitoplasma: lapisan sangat tipis transparan sebagai volume dalam sel.
    case "cytoplasm":
      return {
        color: c,
        roughness: 0.5,
        metalness: 0.0,
        clearcoat: 0.2,
        clearcoatRoughness: 0.5,
        side: THREE.DoubleSide,
        depthWrite: false,
        opacity: 0.12,
      };

    case "wall":
      return {
        color: c,
        roughness: 0.75,
        metalness: 0.0,
        clearcoat: 0.2,
        clearcoatRoughness: 0.6,
        side: THREE.DoubleSide,
        depthWrite: true,
        opacity: isTransparent ? opacity : 0.55,
      };

    default:
      return {
        color: c,
        roughness: 0.5,
        metalness: 0.05,
        clearcoat: 0.5,
        clearcoatRoughness: 0.25,
        side: THREE.FrontSide,
        depthWrite: true,
      };
  }
}

/**
 * Satu mesh yang dapat dipilih.
 * Tidak lagi menampilkan label/nomor sendiri — marker bernomor dirender
 * sekali per struktur oleh NumberedMarkers sehingga tidak ada label ganda.
 */
export function Part({
  id,
  selected,
  onSelect,
  color,
  opacity = 1,
  wireframe = false,
  side = THREE.FrontSide,
  materialPreset = "default",
  children,
  ...meshProps
}: PartProps) {
  const [hover, setHover] = useState(false);
  const [pulse, setPulse] = useState(false);
  const meshRef = useRef<THREE.Mesh>(null!);
  const pulseStart = useRef<number | null>(null);

  const baseScale = useRef(new THREE.Vector3(1, 1, 1));

  useCursor(hover);
  const active = selected === id;

  // Simpan skala asli (sebagian Part punya scale != 1) agar animasi tidak merusaknya
  useEffect(() => {
    if (meshRef.current) baseScale.current.copy(meshRef.current.scale);
  }, [meshProps.scale]);

  // Lepas resource saat unmount. Geometri declarative sudah ditangani R3F,
  // tetapi geometri dari <primitive> (useMemo di scene) wajib dibersihkan
  // agar tidak bocor saat ganti varian/tab model.
  useEffect(() => {
    const mesh = meshRef.current;
    return () => {
      const geo = mesh?.geometry;
      if (geo && (geo as any).__r3f?.root === undefined) geo.dispose();
    };
  }, []);

  const baseColor = useMemo(() => new THREE.Color(color), [color]);
  const hoverColor = useMemo(() => new THREE.Color("#0E3A35"), []);
  const black = useMemo(() => new THREE.Color("#000000"), []);
  const matProps = useMemo(
    () => getMaterialProps(materialPreset as MaterialPreset, baseColor, opacity),
    [materialPreset, baseColor, opacity]
  );
  // Opasitas efektif: preset (mis. membran transparan) menang, lalu prop `opacity`.
  const effectiveOpacity = (matProps as { opacity?: number }).opacity ?? opacity;

  // Denyut halus sekali saat struktur dipilih (umpan balik, tidak berlebihan)
  useFrame((state) => {
    if (!meshRef.current) return;
    if (pulse) {
      if (pulseStart.current === null) pulseStart.current = state.clock.getElapsedTime();
      const elapsed = state.clock.getElapsedTime() - pulseStart.current;
      const progress = Math.min(elapsed / 0.5, 1);
      const s = 1 + 0.25 * Math.sin(progress * Math.PI);
      meshRef.current.scale.copy(baseScale.current).multiplyScalar(s);
      if (progress >= 1) {
        pulseStart.current = null;
        setPulse(false);
        meshRef.current.scale.copy(baseScale.current);
      }
    }
  });

  function handleClick(e: ThreeEvent<MouseEvent>) {
    e.stopPropagation();
    onSelect(id);
    if (!active) {
      pulseStart.current = null;
      setPulse(true);
    }
  }

  return (
    <mesh
      ref={meshRef}
      {...meshProps}
      onClick={handleClick}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHover(true);
      }}
      onPointerOut={() => setHover(false)}
    >
      {children}
      <meshPhysicalMaterial
        {...matProps}
        transparent={effectiveOpacity < 1}
        opacity={effectiveOpacity}
        wireframe={wireframe}
        emissive={active ? baseColor : hover ? hoverColor : black}
        emissiveIntensity={active ? 0.55 : hover ? 0.35 : 0}
      />
    </mesh>
  );
}
