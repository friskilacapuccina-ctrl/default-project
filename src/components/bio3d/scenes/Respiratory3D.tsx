"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Part } from "../Part";
import type { SceneProps } from "../types";

type Pt = [number, number, number];

/** Tabung dengan radius bervariasi di sepanjang kurva (saluran yang meruncing). */
function sweep(points: Pt[], radiusAt: (t: number) => number, radial = 12, tubular = 48) {
  const curve = new THREE.CatmullRomCurve3(points.map((q) => new THREE.Vector3(...q)));
  const frames = curve.computeFrenetFrames(tubular, false);
  const pos: number[] = [];
  const idx: number[] = [];
  const P = new THREE.Vector3();
  for (let i = 0; i <= tubular; i++) {
    const t = i / tubular;
    curve.getPointAt(t, P);
    const N = frames.normals[i];
    const B = frames.binormals[i];
    const r = radiusAt(t);
    for (let j = 0; j <= radial; j++) {
      const a = (j / radial) * Math.PI * 2;
      const s = Math.sin(a);
      const c = Math.cos(a);
      pos.push(
        P.x + r * (c * N.x + s * B.x),
        P.y + r * (c * N.y + s * B.y),
        P.z + r * (c * N.z + s * B.z)
      );
    }
  }
  for (let i = 0; i < tubular; i++) {
    for (let j = 0; j < radial; j++) {
      const a = i * (radial + 1) + j;
      const b = a + radial + 1;
      idx.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setIndex(idx);
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.computeVertexNormals();
  return { curve, geo };
}

/** Gabungkan banyak geometri menjadi satu (mengurangi jumlah draw call). */
function mergeGeos(geos: THREE.BufferGeometry[]): THREE.BufferGeometry {
  let vertexCount = 0;
  let indexCount = 0;
  for (const g of geos) {
    vertexCount += g.getAttribute("position").count;
    const idx = g.getIndex();
    indexCount += idx ? idx.count : g.getAttribute("position").count;
  }
  const positions = new Float32Array(vertexCount * 3);
  const normals = new Float32Array(vertexCount * 3);
  const indices = new Uint32Array(indexCount);
  let vOff = 0;
  let iOff = 0;
  for (const g of geos) {
    const gp = g.getAttribute("position");
    const gn = g.getAttribute("normal");
    positions.set(gp.array as Float32Array, vOff * 3);
    if (gn) normals.set(gn.array as Float32Array, vOff * 3);
    const idx = g.getIndex();
    if (idx) {
      for (let i = 0; i < idx.count; i++) indices[iOff + i] = idx.getX(i) + vOff;
      iOff += idx.count;
    } else {
      for (let i = 0; i < gp.count; i++) indices[iOff + i] = i + vOff;
      iOff += gp.count;
    }
    vOff += gp.count;
  }
  const merged = new THREE.BufferGeometry();
  merged.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  merged.setAttribute("normal", new THREE.BufferAttribute(normals, 3));
  merged.setIndex(new THREE.BufferAttribute(indices, 1));
  return merged;
}

/** Pseudo-acak deterministik agar percabangan stabil di setiap render. */
function makeRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/** Profil lobus paru: lobus atas meruncing ke puncak (apex). */
function upperLobeGeometry() {
  const pts = [
    new THREE.Vector2(0.03, 0.04),
    new THREE.Vector2(0.5, 0.08),
    new THREE.Vector2(0.68, 0.4),
    new THREE.Vector2(0.6, 0.78),
    new THREE.Vector2(0.35, 1.08),
    new THREE.Vector2(0.03, 1.3),
  ];
  return new THREE.LatheGeometry(pts, 26);
}

/** Profil lobus bawah: lebar di tengah, dasar cekung mengikuti diafragma. */
function lowerLobeGeometry() {
  const pts = [
    new THREE.Vector2(0.03, -1.32),
    new THREE.Vector2(0.5, -1.28),
    new THREE.Vector2(0.78, -1.02),
    new THREE.Vector2(0.9, -0.6),
    new THREE.Vector2(0.88, -0.15),
    new THREE.Vector2(0.6, 0.02),
  ];
  return new THREE.LatheGeometry(pts, 26);
}

/** Diafragma: otot berbentuk kubah berdinding (cukup tebal). */
function diaphragmGeometry() {
  const pts = [
    new THREE.Vector2(0.03, 0.92),
    new THREE.Vector2(0.8, 0.84),
    new THREE.Vector2(1.5, 0.6),
    new THREE.Vector2(2.1, 0.28),
    new THREE.Vector2(2.5, -0.1),
    new THREE.Vector2(2.5, -0.3),
    new THREE.Vector2(2.4, -0.42),
    new THREE.Vector2(2.0, -0.08),
    new THREE.Vector2(1.4, 0.28),
    new THREE.Vector2(0.7, 0.56),
    new THREE.Vector2(0.03, 0.62),
  ];
  return new THREE.LatheGeometry(pts, 44);
}

/**
 * Pohon bronkiolus rekursif: setiap cabang makin kecil dan makin pendek,
 * diarahkan kembali ke dalam volume paru agar tidak keluar organ.
 */
function bronchialTree(
  origin: THREE.Vector3,
  initialDir: THREE.Vector3,
  bound: THREE.Vector3,
  rng: () => number
) {
  const geos: THREE.BufferGeometry[] = [];
  const tips: THREE.Vector3[] = [];
  const axis = new THREE.Vector3();

  const grow = (start: THREE.Vector3, dir: THREE.Vector3, radius: number, depth: number) => {
    const len = Math.max(0.15, radius * 6.0);
    const mid = start
      .clone()
      .addScaledVector(dir, len * 0.5)
      .add(new THREE.Vector3(rng() - 0.5, rng() - 0.5, rng() - 0.5).multiplyScalar(0.05));
    const end = start.clone().addScaledVector(dir, len);
    geos.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([start, mid, end]), 8, radius, 7, false));
    if (depth <= 0) {
      tips.push(end);
      return;
    }
    const bend = 0.42 + rng() * 0.3;
    axis.set(rng() - 0.5, rng() - 0.5, rng() - 0.5);
    if (axis.lengthSq() < 1e-6) axis.set(0, 0, 1);
    axis.normalize();
    const outward = bound.clone().sub(end);
    const dist = outward.length();
    outward.normalize();
    const steer = dist > 1.05 ? 0.65 : 0.3;
    for (const sign of [1, -1]) {
      const child = dir
        .clone()
        .applyQuaternion(new THREE.Quaternion().setFromAxisAngle(axis, bend * sign))
        .lerp(outward, steer)
        .normalize();
      grow(end, child, radius * 0.74, depth - 1);
    }
  };

  grow(origin, initialDir.clone().normalize(), 0.068, 3);
  return { geos, tips };
}

/** Gugusan alveolus berbentuk buah anggur di ujung bronkiolus. */
function grapeCluster(center: THREE.Vector3, rng: () => number, count: number, base: number) {
  const parts: THREE.BufferGeometry[] = [];
  for (let i = 0; i < count; i++) {
    const r = base * (0.75 + rng() * 0.55);
    const g = new THREE.SphereGeometry(r, 10, 8);
    g.translate(
      center.x + (rng() - 0.5) * base * 3.4,
      center.y + (rng() - 0.5) * base * 3.4,
      center.z + (rng() - 0.5) * base * 3.4
    );
    parts.push(g);
  }
  const merged = mergeGeos(parts);
  parts.forEach((g) => g.dispose());
  return merged;
}

/**
 * Trakea bercincin → percabangan bronkus/bronkiolus → paru-paru bercelah
 * (kanan 3 lobus, kiri 2 lobus) → gugusan alveolus → diafragma kubah.
 * Animasi irama napas dapat dihentikan/diputar dari kontrol model.
 */
export default function Respiratory3D({ selected, onSelect, flowPlaying = true }: SceneProps) {
  const p = { selected, onSelect };
  const paruKiri = useRef<THREE.Group>(null!);
  const paruKanan = useRef<THREE.Group>(null!);
  const diafragma = useRef<THREE.Group>(null!);

  /* ---------- Trakea + cincin tulang rawan ---------- */
  const trakea = useMemo(
    () =>
      sweep(
        [
          [0.7, 3.15, 0],
          [0.7, 2.6, 0],
          [0.7, 2.05, 0],
          [0.7, 1.62, 0],
        ],
        () => 0.15,
        16,
        40
      ).geo,
    []
  );

  /* ---------- Bronkus utama (kanan lebih tegak, kiri lebih panjang) ---------- */
  const bronkusKanan = useMemo(
    () =>
      sweep(
        [
          [0.7, 1.62, 0],
          [0.85, 1.3, 0],
          [0.9, 1.05, 0],
          [1.0, 0.85, 0],
        ],
        (t) => 0.13 - 0.03 * t,
        14,
        36
      ).geo,
    []
  );

  const bronkusKiri = useMemo(
    () =>
      sweep(
        [
          [0.7, 1.62, 0],
          [0.4, 1.25, 0],
          [-0.2, 0.95, 0],
          [-0.85, 0.72, 0],
        ],
        (t) => 0.12 - 0.03 * t,
        14,
        44
      ).geo,
    []
  );

  /* ---------- Pohon bronkiolus rekursif di dalam tiap paru ---------- */
  const treeKanan = useMemo(() => {
    const rng = makeRng(1234);
    const t = bronchialTree(
      new THREE.Vector3(1.0, 0.85, 0),
      new THREE.Vector3(0.35, -0.9, 0.05),
      new THREE.Vector3(1.5, -0.5, 0),
      rng
    );
    const merged = mergeGeos(t.geos);
    t.geos.forEach((g) => g.dispose());
    const clusters = t.tips.map((tip) => grapeCluster(tip, rng, 4, 0.06));
    return { merged, clusters };
  }, []);

  const treeKiri = useMemo(() => {
    const rng = makeRng(5678);
    const t = bronchialTree(
      new THREE.Vector3(-0.85, 0.72, 0),
      new THREE.Vector3(-0.3, -0.9, 0.05),
      new THREE.Vector3(-1.55, -0.5, 0),
      rng
    );
    const merged = mergeGeos(t.geos);
    t.geos.forEach((g) => g.dispose());
    const clusters = t.tips.map((tip) => grapeCluster(tip, rng, 4, 0.06));
    return { merged, clusters };
  }, []);

  /** Gugusan alveolus besar yang menandai titik alveolus pada marker. */
  const clusterUtama = useMemo(() => {
    const rng = makeRng(9101);
    return grapeCluster(new THREE.Vector3(1.6, -0.6, 0.3), rng, 7, 0.095);
  }, []);

  /* ---------- Lobus paru (kanan 3, kiri 2) ---------- */
  const geoUpperLobe = useMemo(() => upperLobeGeometry(), []);
  const geoLowerLobe = useMemo(() => lowerLobeGeometry(), []);
  const geoDiafragma = useMemo(() => diaphragmGeometry(), []);

  /* ---------- Lepas resource saat unmount (anti memory leak) ---------- */
  useEffect(() => () => trakea.dispose(), [trakea]);
  useEffect(() => () => bronkusKanan.dispose(), [bronkusKanan]);
  useEffect(() => () => bronkusKiri.dispose(), [bronkusKiri]);
  useEffect(() => () => {
    treeKanan.merged.dispose();
    treeKanan.clusters.forEach((g) => g.dispose());
  }, [treeKanan]);
  useEffect(() => () => {
    treeKiri.merged.dispose();
    treeKiri.clusters.forEach((g) => g.dispose());
  }, [treeKiri]);
  useEffect(() => () => clusterUtama.dispose(), [clusterUtama]);
  useEffect(() => () => geoUpperLobe.dispose(), [geoUpperLobe]);
  useEffect(() => () => geoLowerLobe.dispose(), [geoLowerLobe]);
  useEffect(() => () => geoDiafragma.dispose(), [geoDiafragma]);

  // Waktu napas hanya berjalan bila animasi diputar (play/pause)
  const t = useRef(0);
  useFrame((_, delta) => {
    if (flowPlaying) t.current += delta;
    const s = 1 + Math.sin(t.current * 1.6) * 0.05;
    if (paruKiri.current) paruKiri.current.scale.set(s, s, s * 0.98);
    if (paruKanan.current) paruKanan.current.scale.set(s, s, s * 0.98);
    // Saat paru mengembang, diafragma mendatar (skala y mengecil)
    if (diafragma.current) diafragma.current.scale.set(1, 1 + Math.sin(t.current * 1.6 + Math.PI) * 0.12, 1);
  });

  return (
    <group>
      {/* ===== 1. TRAKEA — tabung bercincin tulang rawan ===== */}
      <Part id="trakea" color="#7A9BB5" materialPreset="organelle" {...p}>
        <primitive object={trakea} attach="geometry" />
      </Part>
      {/* Cincin kartilago berbentuk C (16 cincin rapat) */}
      {Array.from({ length: 16 }, (_, i) => 3.05 - i * 0.09).map((y) => (
        <Part key={`c${y}`} id="trakea" color="#5B7C99" materialPreset="organelle" {...p} position={[0.7, y, 0]} rotation={[Math.PI / 2, 0, 0.5]}>
          <torusGeometry args={[0.163, 0.036, 8, 20, Math.PI * 1.55]} />
        </Part>
      ))}

      {/* ===== 2. BRONKUS & BRONKIOLUS — percabangan makin kecil ===== */}
      <Part id="bronkus" color="#5F87A3" materialPreset="organelle" {...p}>
        <primitive object={bronkusKanan} attach="geometry" />
      </Part>
      <Part id="bronkus" color="#5F87A3" materialPreset="organelle" {...p}>
        <primitive object={bronkusKiri} attach="geometry" />
      </Part>
      <Part id="bronkus" color="#527A94" materialPreset="organelle" {...p}>
        <primitive object={treeKanan.merged} attach="geometry" />
      </Part>
      <Part id="bronkus" color="#527A94" materialPreset="organelle" {...p}>
        <primitive object={treeKiri.merged} attach="geometry" />
      </Part>

      {/* ===== 3. PARU-PARU — kanan 3 lobus, kiri 2 lobus ===== */}
      <group ref={paruKanan} position={[1.5, -0.35, -0.05]}>
        <Part id="paru" color="#C98A8A" materialPreset="organelle" opacity={0.62} {...p} scale={[1, 1, 0.85]}>
          <primitive object={geoLowerLobe} attach="geometry" />
        </Part>
        <Part id="paru" color="#C98A8A" materialPreset="organelle" opacity={0.62} {...p} scale={[1, 1, 0.85]}>
          <primitive object={geoUpperLobe} attach="geometry" />
        </Part>
        {/* Lobus tengah (khas paru kanan) */}
        <Part id="paru" color="#BE7E7E" materialPreset="organelle" opacity={0.7} {...p} position={[-0.32, -0.28, 0.46]} scale={[0.42, 0.3, 0.3]}>
          <sphereGeometry args={[1, 16, 14]} />
        </Part>
      </group>
      <group ref={paruKiri} position={[-1.55, -0.35, -0.05]}>
        <Part id="paru" color="#C98A8A" materialPreset="organelle" opacity={0.62} {...p} scale={[1, 1, 0.8]}>
          <primitive object={geoLowerLobe} attach="geometry" />
        </Part>
        <Part id="paru" color="#C98A8A" materialPreset="organelle" opacity={0.62} {...p} scale={[1, 1, 0.8]}>
          <primitive object={geoUpperLobe} attach="geometry" />
        </Part>
      </group>

      {/* ===== 4. ALVEOLUS — gugusan buah anggur di ujung bronkiolus ===== */}
      {treeKanan.clusters.map((g, i) => (
        <Part key={`ak${i}`} id="alveolus" color="#E8B4AE" materialPreset="vesicle" {...p}>
          <primitive object={g} attach="geometry" />
        </Part>
      ))}
      {treeKiri.clusters.map((g, i) => (
        <Part key={`al${i}`} id="alveolus" color="#E8B4AE" materialPreset="vesicle" {...p}>
          <primitive object={g} attach="geometry" />
        </Part>
      ))}
      <Part id="alveolus" color="#E8B4AE" materialPreset="vesicle" {...p}>
        <primitive object={clusterUtama} attach="geometry" />
      </Part>

      {/* ===== 5. DIAFRAGMA — otot kubah di bawah paru ===== */}
      <group ref={diafragma} position={[0, -3.0, 0.45]}>
        <Part id="diafragma" color="#8A6F5C" materialPreset="tissue" side={THREE.DoubleSide} {...p}>
          <primitive object={geoDiafragma} attach="geometry" />
        </Part>
      </group>
    </group>
  );
}
