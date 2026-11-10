"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Part } from "../Part";
import type { SceneProps } from "../types";

type Pt = [number, number, number];

/**
 * Tabung anatomis dengan radius bervariasi di sepanjang kurva.
 * Memungkinkan bentuk organ yang meruncing (mis. lambung J, pilorus,
 * duodenum) alih-alih silinder beraturan.
 */
function sweep(points: Pt[], radiusAt: (t: number) => number, radial = 16, tubular = 80) {
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
      // Urutan segitiga harus mengarah ke luar agar normal dan pencahayaan
      // organ terbaca benar dari kamera luar.
      idx.push(a, a + 1, b, b, a + 1, b + 1);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setIndex(idx);
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.computeVertexNormals();
  // Saluran dibuat sebagai BufferGeometry manual; Three.js tidak otomatis
  // menghitung batas frustum sebelum geometri dirender.
  geo.computeBoundingBox();
  geo.computeBoundingSphere();
  return { curve, geo };
}

/** Profil kubah hati (lathe): bagian atas membulat, dasar relatif rata. */
function liverLobeGeometry() {
  const pts = [
    new THREE.Vector2(0.02, -0.28),
    new THREE.Vector2(0.45, -0.3),
    new THREE.Vector2(0.8, -0.18),
    new THREE.Vector2(0.98, 0.05),
    new THREE.Vector2(0.85, 0.32),
    new THREE.Vector2(0.5, 0.5),
    new THREE.Vector2(0.03, 0.56),
  ];
  const geometry = new THREE.LatheGeometry(pts, 30);
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  return geometry;
}

/** Profil kantung empedu berbentuk pir (leher di atas, badan menggantung). */
function pearGeometry() {
  const pts = [
    new THREE.Vector2(0.012, 0),
    new THREE.Vector2(0.09, -0.02),
    new THREE.Vector2(0.145, -0.12),
    new THREE.Vector2(0.15, -0.24),
    new THREE.Vector2(0.1, -0.34),
    new THREE.Vector2(0.05, -0.42),
    new THREE.Vector2(0.025, -0.52),
  ];
  const geometry = new THREE.LatheGeometry(pts, 22);
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  return geometry;
}

/**
 * Jejunum–ileum: lilitan saluran yang kompak — baris berkelok naik-turun
 * dengan putaran U di tiap ujung, diameter konsisten.
 */
function smallIntestinePoints(): Pt[] {
  const pts: Pt[] = [];
  const rows = 6;
  const per = 12;
  const cx = -1.0;
  const top = -0.42;
  const rowH = 0.32;
  const halfW = 1.0;
  for (let k = 0; k < rows; k++) {
    const y = top - k * rowH;
    const dir = k % 2 === 0 ? 1 : -1; // baris pertama dari kanan ke kiri
    for (let j = 0; j <= per; j++) {
      const u = j / per;
      const x = cx + dir * (1 - 2 * u) * halfW;
      const wob = Math.sin(u * Math.PI * 3 + k * 1.7) * 0.045;
      const z = 0.32 + Math.sin(u * Math.PI * 2 + k * 0.9) * 0.13;
      pts.push([x, y + wob, z]);
    }
    if (k < rows - 1) {
      const turnR = rowH / 2;
      const side = -dir; // putaran di sisi tempat baris berakhir
      const cxx = cx + side * halfW;
      const cy = y - rowH / 2;
      for (let a = 1; a < 6; a++) {
        const phi = (a / 6) * Math.PI;
        pts.push([cxx + side * turnR * Math.sin(phi), cy + turnR * Math.cos(phi), 0.32]);
      }
    }
  }
  return pts;
}

/**
 * Sistem pencernaan: rongga mulut → faring → esofagus → lambung (J) →
 * hati/kantung empedu/pankreas → usus halus (duodenum + lilitan) →
 * usus besar (kolon mengitari usus halus) → rektum → anus.
 * Animasi bolus menunjukkan jalur makanan (dapat dihentikan/diputar).
 */
export default function Digestive3D({ selected, onSelect, flowPlaying = true }: SceneProps) {
  const p = { selected, onSelect };

  /* ---------- Saluran atas: faring & esofagus ---------- */
  const faring = useMemo(
    () =>
      sweep(
        [
          [0.02, 3.78, -0.06],
          [0.3, 3.6, 0],
          [0.55, 3.35, 0],
          [0.68, 3.1, 0],
          [0.7, 3.0, 0],
        ],
        (t) => 0.24 - 0.09 * t,
        16,
        48
      ),
    []
  );

  const esofagus = useMemo(
    () =>
      sweep(
        [
          [0.7, 3.0, 0],
          [0.72, 2.62, 0],
          [0.75, 2.3, 0],
          [0.85, 2.02, 0],
          [0.98, 1.85, 0],
        ],
        () => 0.13,
        16,
        48
      ),
    []
  );

  /* ---------- Lambung: kantong J (fundus membulat → badan → pilorus) ---------- */
  const lambung = useMemo(
    () =>
      sweep(
        [
          [0.98, 1.85, 0],
          [1.03, 2.08, 0.02],
          [1.28, 1.98, 0.02],
          [1.52, 1.6, 0],
          [1.55, 1.15, 0],
          [1.38, 0.7, 0],
          [1.1, 0.5, 0],
          [0.95, 0.42, -0.05],
        ],
        (t) => {
          const rise = Math.sin(Math.min(t / 0.55, 1) * Math.PI * 0.5);
          const fall = 1 - 0.64 * Math.max(0, (t - 0.55) / 0.45);
          return (0.15 + 0.33 * rise) * fall;
        },
        22,
        90
      ),
    []
  );

  /* ---------- Hati: lobus kanan besar + lobus kiri kecil ---------- */
  const geoHatiKanan = useMemo(() => liverLobeGeometry(), []);
  const geoHatiKiri = useMemo(() => liverLobeGeometry(), []);

  /* ---------- Kantung empedu (pir) + saluran empedu ---------- */
  const geoEmpedu = useMemo(() => pearGeometry(), []);
  const saluranEmpedu = useMemo(
    () =>
      sweep(
        [
          [-0.93, 1.1, 0.5],
          [-0.78, 0.72, 0.35],
          [-0.5, 0.32, 0.0],
          [-0.15, 0.05, -0.35],
          [0.32, -0.02, -0.55],
        ],
        () => 0.038,
        8,
        40
      ),
    []
  );

  /* ---------- Pankreas: kepala di dekat duodenum, badan, ekor meruncing ---------- */
  const pankreas = useMemo(
    () =>
      sweep(
        [
          [0.9, 0.02, -0.7],
          [0.6, 0.18, -0.92],
          [0.25, 0.32, -1.08],
          [-0.15, 0.42, -1.15],
          [-0.42, 0.46, -1.18],
        ],
        (t) => 0.02 + 0.17 * (1 - 0.72 * t),
        16,
        60
      ),
    []
  );

  /* ---------- Usus halus: duodenum (C-loop) + jejunum/ileum berlilit ---------- */
  const halus = useMemo(() => {
    const pts: Pt[] = [
      [0.95, 0.42, -0.05],
      [1.06, 0.18, -0.3],
      [0.98, -0.05, -0.58],
      [0.68, -0.14, -0.74],
      [0.4, -0.05, -0.6],
      [0.3, 0.12, -0.35],
      [0.3, 0.0, -0.1],
      [0.15, -0.2, 0.15],
    ];
    pts.push(...smallIntestinePoints());
    // ujung ileum menuju sekum (usus besar)
    pts.push([0.55, -2.02, 0.3], [1.0, -2.05, 0.3]);
    return sweep(pts, (t) => 0.17 - 0.04 * Math.min(1, t * 12), 14, 260);
  }, []);

  /* ---------- Usus besar: sekum → kolon asc/transv/desc/sigmoid ---------- */
  const besar = useMemo(
    () =>
      sweep(
        [
          [1.12, -2.08, 0.3],
          [1.5, -2.02, 0.2],
          [1.75, -1.6, 0.1],
          [1.85, -0.9, 0.05],
          [1.88, -0.2, 0],
          [1.82, 0.45, 0],
          [1.6, 0.8, 0],
          [1.0, 0.9, 0.05],
          [0.2, 0.95, 0.1],
          [-0.7, 0.92, 0.1],
          [-1.45, 0.85, 0.05],
          [-1.8, 0.6, 0],
          [-1.92, 0.0, 0],
          [-1.9, -0.7, 0.05],
          [-1.78, -1.3, 0.15],
          [-1.58, -1.72, 0.2],
          [-1.12, -1.95, 0.25],
          [-1.42, -2.28, 0.3],
        ],
        (t) => 0.2 + 0.02 * Math.sin(t * Math.PI * 10),
        16,
        170
      ),
    []
  );

  const apendiks = useMemo(
    () =>
      sweep(
        [
          [1.3, -2.12, 0.35],
          [1.2, -2.35, 0.42],
          [1.05, -2.52, 0.46],
        ],
        () => 0.055,
        8,
        16
      ),
    []
  );

  /* ---------- Rektum & kanal anus ---------- */
  const rektum = useMemo(
    () =>
      sweep(
        [
          [-1.42, -2.28, 0.3],
          [-1.5, -2.5, 0.32],
          [-1.46, -2.64, 0.34],
        ],
        () => 0.16,
        14,
        24
      ),
    []
  );

  const anusGeo = useMemo(
    () =>
      sweep(
        [
          [-1.46, -2.64, 0.34],
          [-1.0, -2.78, 0.38],
          [-0.55, -2.87, 0.41],
        ],
        (t) => 0.12 - 0.03 * t,
        12,
        24
      ),
    []
  );

  /* ---------- Lepas resource saat unmount (anti memory leak) ---------- */
  useEffect(() => () => faring.geo.dispose(), [faring]);
  useEffect(() => () => esofagus.geo.dispose(), [esofagus]);
  useEffect(() => () => lambung.geo.dispose(), [lambung]);
  useEffect(() => () => geoHatiKanan.dispose(), [geoHatiKanan]);
  useEffect(() => () => geoHatiKiri.dispose(), [geoHatiKiri]);
  useEffect(() => () => geoEmpedu.dispose(), [geoEmpedu]);
  useEffect(() => () => saluranEmpedu.geo.dispose(), [saluranEmpedu]);
  useEffect(() => () => pankreas.geo.dispose(), [pankreas]);
  useEffect(() => () => halus.geo.dispose(), [halus]);
  useEffect(() => () => besar.geo.dispose(), [besar]);
  useEffect(() => () => apendiks.geo.dispose(), [apendiks]);
  useEffect(() => () => rektum.geo.dispose(), [rektum]);
  useEffect(() => () => anusGeo.geo.dispose(), [anusGeo]);

  /* ---------- Jalur lengkap makanan (animasi flowPlaying) ---------- */
  const digestPath = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const collect = (c: THREE.CatmullRomCurve3, n: number) => {
      for (let i = 0; i <= n; i++) pts.push(c.getPointAt(i / n));
    };
    collect(
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 3.72, 0.1),
        new THREE.Vector3(0.18, 3.62, 0),
        new THREE.Vector3(0.45, 3.42, 0),
        new THREE.Vector3(0.68, 3.1, 0),
      ]),
      12
    );
    collect(faring.curve, 14);
    collect(esofagus.curve, 14);
    collect(lambung.curve, 24);
    collect(halus.curve, 130);
    collect(besar.curve, 70);
    collect(rektum.curve, 8);
    collect(anusGeo.curve, 8);
    return new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.2);
  }, [faring, esofagus, lambung, halus, besar, rektum, anusGeo]);

  // Bolus makanan bergerak di sepanjang saluran cerna
  const bolus = useRef<THREE.Mesh>(null!);
  const progress = useRef(0);
  useFrame((_, delta) => {
    if (flowPlaying) progress.current = (progress.current + delta * 0.055) % 1;
    if (bolus.current) {
      digestPath.getPoint(progress.current, bolus.current.position);
    }
  });

  return (
    <group>
      {/* ===== 1. RONGGA MULUT — rongga, bibir, gigi, lidah ===== */}
      <group position={[0, 3.72, 0]}>
        {/* Rongga mulut (dinding dalam) */}
        <Part id="mulut" color="#A97070" materialPreset="organelle" side={THREE.DoubleSide} {...p} scale={[1, 0.78, 0.6]}>
          <sphereGeometry args={[0.4, 24, 18]} />
        </Part>
        {/* Bibir — mulut menghadap kamera (+z) */}
        <Part id="mulut" color="#C98A8A" materialPreset="organelle" {...p} scale={[1, 0.72, 1]}>
          <torusGeometry args={[0.38, 0.11, 12, 26]} />
        </Part>
        {/* Gigi seri atas & bawah */}
        {[-0.21, -0.07, 0.07, 0.21].map((x) => (
          <Part key={`gu${x}`} id="mulut" color="#F2EFE6" materialPreset="organelle" {...p} position={[x, 0.15, 0.26]}>
            <boxGeometry args={[0.11, 0.13, 0.07]} />
          </Part>
        ))}
        {[-0.21, -0.07, 0.07, 0.21].map((x) => (
          <Part key={`gb${x}`} id="mulut" color="#EAE6DA" materialPreset="organelle" {...p} position={[x, -0.15, 0.26]}>
            <boxGeometry args={[0.11, 0.11, 0.07]} />
          </Part>
        ))}
        {/* Lidah */}
        <Part id="mulut" color="#B96F75" materialPreset="organelle" {...p} position={[0, -0.16, 0.05]} scale={[1, 0.32, 1.1]}>
          <sphereGeometry args={[0.24, 16, 12]} />
        </Part>
      </group>

      {/* ===== 2. FARING — corong dari mulut ke esofagus ===== */}
      <Part id="faring" color="#D8A7A0" materialPreset="organelle" {...p}>
        <primitive object={faring.geo} attach="geometry" />
      </Part>

      {/* ===== 3. ESOFAGUS ===== */}
      <Part id="esofagus" color="#D8A7A0" materialPreset="organelle" {...p}>
        <primitive object={esofagus.geo} attach="geometry" />
      </Part>

      {/* ===== 4. LAMBUNG — kantong J berotot (semi transparan agar jalur makanan terlihat) ===== */}
      <Part id="lambung" color="#D9A05F" materialPreset="organelle" opacity={0.82} {...p}>
        <primitive object={lambung.geo} attach="geometry" />
      </Part>
      {/* Lipatan dinding lambung — tekstur otot polos */}
      {[
        [1.3, 1.55, 0.3],
        [1.42, 1.2, 0.33],
        [1.3, 0.85, 0.28],
      ].map((pos, i) => (
        <Part key={`rk${i}`} id="lambung" color="#C08A48" materialPreset="organelle" opacity={0.75} {...p} position={pos as Pt}>
          <torusGeometry args={[0.19, 0.032, 8, 20, Math.PI]} />
        </Part>
      ))}

      {/* ===== 5. HATI — lobus kanan besar + lobus kiri kecil ===== */}
      <Part
        id="hati"
        color="#8A5A44"
        materialPreset="organelle"
        {...p}
        position={[-1.72, 1.92, -0.32]}
        rotation={[0, 0, -0.08]}
        scale={[0.98, 0.66, 0.78]}
      >
        <primitive object={geoHatiKanan} attach="geometry" />
      </Part>
      <Part
        id="hati"
        color="#7A4E3B"
        materialPreset="organelle"
        {...p}
        position={[-0.68, 1.95, -0.3]}
        rotation={[0, 0, 0.1]}
        scale={[0.55, 0.44, 0.52]}
      >
        <primitive object={geoHatiKiri} attach="geometry" />
      </Part>

      {/* ===== 6. KANTUNG EMPEDU (pir) + saluran empedu ke duodenum ===== */}
      <Part id="empedu" color="#5C7A3A" materialPreset="organelle" {...p} position={[-0.95, 1.05, 0.58]} rotation={[0.22, 0, -0.28]}>
        <primitive object={geoEmpedu} attach="geometry" />
      </Part>
      <Part id="empedu" color="#4E6B32" materialPreset="organelle" {...p}>
        <primitive object={saluranEmpedu.geo} attach="geometry" />
      </Part>

      {/* ===== 7. PANKREAS — kepala di dekat duodenum, badan, ekor meruncing ===== */}
      <Part id="pankreas" color="#C9A227" materialPreset="organelle" {...p}>
        <primitive object={pankreas.geo} attach="geometry" />
      </Part>
      {/* Lobulus pankreas (tekstur gelambir) */}
      {[
        [0.82, 0.05, -0.62, 0.11],
        [0.58, 0.2, -0.85, 0.1],
        [0.3, 0.32, -1.0, 0.09],
        [0.02, 0.4, -1.12, 0.07],
      ].map(([x, y, z, r], i) => (
        <Part key={`pn${i}`} id="pankreas" color="#B08F1F" materialPreset="organelle" {...p} position={[x, y, z]}>
          <sphereGeometry args={[r, 12, 12]} />
        </Part>
      ))}

      {/* ===== 8. USUS HALUS — duodenum C-loop + jejunum/ileum berlilit ===== */}
      <Part id="halus" color="#E0C98F" materialPreset="organelle" {...p}>
        <primitive object={halus.geo} attach="geometry" />
      </Part>

      {/* ===== 9. USUS BESAR — kolon mengitari usus halus + apendiks ===== */}
      <Part id="besar" color="#B99B5F" materialPreset="organelle" {...p}>
        <primitive object={besar.geo} attach="geometry" />
      </Part>
      <Part id="besar" color="#A8894F" materialPreset="organelle" {...p}>
        <primitive object={apendiks.geo} attach="geometry" />
      </Part>

      {/* ===== 10. REKTUM ===== */}
      <Part id="rektum" color="#A8894F" materialPreset="organelle" {...p}>
        <primitive object={rektum.geo} attach="geometry" />
      </Part>

      {/* ===== 11. ANUS — kanal anal + sfingter ===== */}
      <Part id="anus" color="#8A5A44" materialPreset="organelle" {...p}>
        <primitive object={anusGeo.geo} attach="geometry" />
      </Part>
      <Part id="anus" color="#6E4638" materialPreset="organelle" {...p} position={[-0.5, -2.87, 0.41]} rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[0.11, 0.045, 10, 20]} />
      </Part>

      {/* ===== Bolus makanan (animasi jalur makanan) ===== */}
      <mesh ref={bolus}>
        <sphereGeometry args={[0.15, 14, 14]} />
        <meshStandardMaterial color="#8A5A44" roughness={0.45} emissive="#5C2F1F" emissiveIntensity={0.55} />
      </mesh>
    </group>
  );
}
