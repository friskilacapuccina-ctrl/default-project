"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Part } from "../Part";
import type { SceneProps } from "../types";

type Pt = [number, number, number];

/** Tabung anatomis dengan radius bervariasi (pembuluh yang meruncing). */
function sweep(points: Pt[], radiusAt: (t: number) => number, radial = 14, tubular = 72) {
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

/** Profil bilik (ventrikel): kerucut berotot meruncing ke apeks jantung. */
function ventrikelGeometry() {
  const pts = [
    new THREE.Vector2(0.02, -1.0),
    new THREE.Vector2(0.4, -0.9),
    new THREE.Vector2(0.54, -0.45),
    new THREE.Vector2(0.55, -0.05),
    new THREE.Vector2(0.5, 0.25),
    new THREE.Vector2(0.38, 0.55),
  ];
  return new THREE.LatheGeometry(pts, 26);
}

/** Profil lobus paru: puncak (apex) di atas, pangkal lebar di bawah. */
function lobeGeometry(kind: "upper" | "lower") {
  const pts =
    kind === "upper"
      ? [
          new THREE.Vector2(0.03, 0.04),
          new THREE.Vector2(0.5, 0.08),
          new THREE.Vector2(0.68, 0.4),
          new THREE.Vector2(0.6, 0.78),
          new THREE.Vector2(0.35, 1.08),
          new THREE.Vector2(0.03, 1.3),
        ]
      : [
          new THREE.Vector2(0.03, -1.32),
          new THREE.Vector2(0.5, -1.28),
          new THREE.Vector2(0.78, -1.02),
          new THREE.Vector2(0.9, -0.6),
          new THREE.Vector2(0.88, -0.15),
          new THREE.Vector2(0.6, 0.02),
        ];
  return new THREE.LatheGeometry(pts, 26);
}

const UP = new THREE.Vector3(0, 1, 0);

/**
 * Sistem peredaran darah: jantung berruang empat (serambi + bilik),
 * dua jalur sirkulasi (sistemik & pulmonal), paru-paru, dan tempat
 * pertukaran (kapiler). Merah = kaya O₂, biru = miskin O₂ (konvensi visual).
 * Partikel + panah menunjukkan arah aliran; animasi dapat dijeda.
 */
export default function Circulatory3D({ selected, onSelect, flowPlaying = true }: SceneProps) {
  const p = { selected, onSelect };
  const jantung = useRef<THREE.Group>(null!);

  /* ---------- Ruang jantung ---------- */
  const geoBilik = useMemo(() => ventrikelGeometry(), []);
  const geoParuUpper = useMemo(() => lobeGeometry("upper"), []);
  const geoParuLower = useMemo(() => lobeGeometry("lower"), []);

  /* ===== Sistemik: arteri (merah) → kapiler → vena (biru) kembali ===== */
  const arteriPath = useMemo(
    () =>
      sweep(
        [
          [0.6, 2.0, -0.12],
          [1.5, 1.65, -0.25],
          [2.5, 0.95, -0.3],
          [3.0, 0.0, -0.26],
          [3.02, -1.0, -0.2],
          [2.6, -1.9, -0.24],
          [1.7, -2.55, -0.28],
          [1.0, -2.98, -0.3],
          [0.75, -3.08, -0.3],
        ],
        (t) => 0.13 - 0.055 * t,
        14,
        110
      ),
    []
  );
  const venaPath = useMemo(
    () =>
      sweep(
        [
          [-0.75, -3.08, -0.3],
          [-1.4, -2.95, -0.3],
          [-2.2, -2.5, -0.28],
          [-2.75, -1.75, -0.24],
          [-2.98, -0.6, -0.1],
          [-2.9, 0.35, -0.14],
          [-2.4, 1.15, -0.16],
          [-1.7, 1.55, -0.1],
          [-1.05, 1.5, 0.0],
          [-0.75, 1.35, 0.05],
        ],
        (t) => 0.085 + 0.05 * t,
        14,
        110
      ),
    []
  );

  /* Cabang arteriol & venul ke jaringan tubuh */
  const arteriCabang = useMemo(
    () =>
      [
        sweep(
          [
            [3.0, 0.0, -0.26],
            [3.4, 0.35, -0.5],
            [3.68, 0.62, -0.72],
          ],
          (t) => 0.07 - 0.03 * t,
          10,
          24
        ).geo,
        sweep(
          [
            [2.6, -1.9, -0.24],
            [3.05, -2.28, -0.5],
            [3.3, -2.6, -0.72],
          ],
          (t) => 0.07 - 0.03 * t,
          10,
          24
        ).geo,
      ],
    []
  );
  const venaCabang = useMemo(
    () =>
      [
        sweep(
          [
            [-2.98, -0.6, -0.1],
            [-3.4, -0.3, -0.35],
            [-3.66, -0.08, -0.58],
          ],
          (t) => 0.045 + 0.025 * t,
          10,
          24
        ).geo,
        sweep(
          [
            [-2.2, -2.5, -0.28],
            [-2.68, -2.85, -0.55],
            [-2.95, -3.0, -0.74],
          ],
          (t) => 0.045 + 0.025 * t,
          10,
          24
        ).geo,
      ],
    []
  );

  /* ===== Pulmonal: arteri pulmonalis (biru) → paru → vena pulmonalis (merah) ===== */
  const trunkPulmKiri = useMemo(
    () =>
      sweep(
        [
          [-0.3, 0.85, 0.3],
          [-0.55, 1.3, 0.3],
          [-0.85, 1.6, 0.28],
          [-1.35, 1.85, 0.3],
          [-1.9, 1.9, 0.25],
          [-2.3, 1.88, -0.3],
          [-2.45, 1.85, -0.75],
        ],
        (t) => 0.13 - 0.04 * t,
        14,
        72
      ),
    []
  );
  const trunkPulmKanan = useMemo(
    () =>
      sweep(
        [
          [-0.85, 1.6, 0.28],
          [-0.3, 1.8, -0.2],
          [0.6, 1.9, -0.6],
          [1.5, 1.9, -0.9],
          [2.1, 1.85, -1.0],
        ],
        (t) => 0.11 - 0.03 * t,
        14,
        64
      ),
    []
  );
  const venaPulmKiri = useMemo(
    () =>
      sweep(
        [
          [-2.1, 2.3, -1.2],
          [-1.4, 2.44, -1.08],
          [-0.7, 2.44, -1.0],
          [-0.1, 2.3, -0.75],
          [0.3, 1.9, -0.5],
          [0.58, 1.5, -0.2],
        ],
        (t) => 0.09 - 0.02 * t,
        12,
        64
      ),
    []
  );
  const venaPulmKanan = useMemo(
    () =>
      sweep(
        [
          [2.1, 2.3, -1.2],
          [1.5, 2.4, -1.05],
          [0.9, 2.35, -0.9],
          [0.6, 2.1, -0.7],
          [0.5, 1.7, -0.4],
          [0.6, 1.5, -0.22],
        ],
        (t) => 0.085 - 0.02 * t,
        12,
        64
      ),
    []
  );

  /* ===== Aorta: lengkung keluar dari bilik kiri + cabang atas + turun ===== */
  const aorta = useMemo(
    () =>
      sweep(
        [
          [0.52, 0.9, 0.05],
          [0.5, 1.5, 0.0],
          [0.35, 2.1, -0.05],
          [0.05, 2.6, -0.1],
          [-0.3, 2.88, -0.18],
          [-0.62, 2.78, -0.24],
          [-0.68, 2.2, -0.32],
          [-0.6, 1.4, -0.4],
          [-0.5, 0.5, -0.44],
          [-0.46, -0.4, -0.44],
          [-0.45, -1.2, -0.44],
        ],
        (t) => 0.175 - 0.06 * t,
        16,
        100
      ),
    []
  );
  const aortaCabang = useMemo(
    () =>
      [
        // Trunkus brachiocefalik
        sweep(
          [
            [-0.18, 2.82, -0.14],
            [-0.26, 3.1, -0.08],
            [-0.3, 3.38, -0.04],
          ],
          (t) => 0.075 - 0.02 * t,
          10,
          20
        ).geo,
        // Arteri karotis (melewati marker aorta)
        sweep(
          [
            [0.0, 2.7, -0.12],
            [0.05, 3.0, -0.04],
            [0.08, 3.36, 0.0],
          ],
          (t) => 0.07 - 0.02 * t,
          10,
          20
        ).geo,
        // Arteri subklavia
        sweep(
          [
            [-0.36, 2.85, -0.18],
            [-0.55, 3.08, -0.12],
            [-0.72, 3.28, -0.08],
          ],
          (t) => 0.07 - 0.02 * t,
          10,
          20
        ).geo,
      ],
    []
  );

  /* ===== Vena cava superior & inferior ===== */
  const venaCavaSup = useMemo(
    () =>
      sweep(
        [
          [-0.7, 1.4, 0.0],
          [-0.85, 1.9, -0.05],
          [-1.0, 2.4, -0.18],
          [-1.24, 2.74, -0.3],
        ],
        () => 0.13,
        14,
        40
      ),
    []
  );
  const venaCavaInf = useMemo(
    () =>
      sweep(
        [
          [-0.65, 0.0, 0.05],
          [-0.62, -0.55, -0.05],
          [-0.6, -1.15, -0.12],
        ],
        () => 0.13,
        14,
        24
      ),
    []
  );

  /* ===== Kapiler: jaringan pembuluh sangat halus di tempat pertukaran ===== */
  const geoKapiler = useMemo(() => {
    const geos: THREE.BufferGeometry[] = [];
    for (let r = 0; r < 4; r++) {
      const y = -2.85 - r * 0.14;
      const pts: THREE.Vector3[] = [];
      for (let j = 0; j <= 12; j++) {
        const u = j / 12;
        pts.push(
          new THREE.Vector3(
            -0.72 + u * 1.44,
            y + Math.sin(u * Math.PI * 3 + r) * 0.05,
            -0.3 + Math.cos(u * Math.PI * 2 + r) * 0.06
          )
        );
      }
      geos.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 28, 0.026, 6, false));
    }
    // Konektor antarbaris (menyerupai anyaman kapiler)
    for (let c = 0; c < 5; c++) {
      const x = -0.58 + c * 0.29;
      const pts = [
        new THREE.Vector3(x, -2.85, -0.3),
        new THREE.Vector3(x + 0.05, -3.06, -0.26),
        new THREE.Vector3(x, -3.27, -0.3),
      ];
      geos.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 12, 0.024, 6, false));
    }
    const merged = mergeGeos(geos);
    geos.forEach((g) => g.dispose());
    return merged;
  }, []);

  /* ---------- Lepas resource saat unmount (anti memory leak) ---------- */
  useEffect(() => () => geoBilik.dispose(), [geoBilik]);
  useEffect(() => () => geoParuUpper.dispose(), [geoParuUpper]);
  useEffect(() => () => geoParuLower.dispose(), [geoParuLower]);
  useEffect(() => () => arteriPath.geo.dispose(), [arteriPath]);
  useEffect(() => () => venaPath.geo.dispose(), [venaPath]);
  useEffect(
    () => () => {
      arteriCabang.forEach((g) => g.dispose());
      venaCabang.forEach((g) => g.dispose());
    },
    [arteriCabang, venaCabang]
  );
  useEffect(() => () => trunkPulmKiri.geo.dispose(), [trunkPulmKiri]);
  useEffect(() => () => trunkPulmKanan.geo.dispose(), [trunkPulmKanan]);
  useEffect(() => () => venaPulmKiri.geo.dispose(), [venaPulmKiri]);
  useEffect(() => () => venaPulmKanan.geo.dispose(), [venaPulmKanan]);
  useEffect(() => () => aorta.geo.dispose(), [aorta]);
  useEffect(() => () => aortaCabang.forEach((g) => g.dispose()), [aortaCabang]);
  useEffect(() => () => venaCavaSup.geo.dispose(), [venaCavaSup]);
  useEffect(() => () => venaCavaInf.geo.dispose(), [venaCavaInf]);
  useEffect(() => () => geoKapiler.dispose(), [geoKapiler]);

  // Partikel darah bergerak (mengikuti arah aliran)
  const sysRed = useRef<Array<THREE.Mesh | null>>([]);
  const sysBlue = useRef<Array<THREE.Mesh | null>>([]);
  const pulmBlue = useRef<Array<THREE.Mesh | null>>([]);
  const pulmRed = useRef<Array<THREE.Mesh | null>>([]);

  const clock = useRef(0);
  useFrame((_, delta) => {
    if (flowPlaying) {
      clock.current += delta;
      const beat =
        Math.pow(Math.max(0, Math.sin(clock.current * 7.4)), 6) +
        Math.pow(Math.max(0, Math.sin(clock.current * 7.4 - 0.9)), 8) * 0.6;
      if (jantung.current) jantung.current.scale.setScalar(1 + beat * 0.045);

      const f = (clock.current * 0.11) % 1;
      for (let i = 0; i < 5; i++) {
        const a = sysRed.current[i];
        if (a) arteriPath.curve.getPoint((f + i / 5) % 1, a.position);
        const b = sysBlue.current[i];
        if (b) venaPath.curve.getPoint((f + i / 5) % 1, b.position);
      }
      const g = (clock.current * 0.16) % 1;
      const c1 = pulmBlue.current[0];
      if (c1) trunkPulmKiri.curve.getPoint(g, c1.position);
      const c2 = pulmBlue.current[1];
      if (c2) trunkPulmKanan.curve.getPoint(g, c2.position);
      const d1 = pulmRed.current[0];
      if (d1) venaPulmKiri.curve.getPoint(g, d1.position);
      const d2 = pulmRed.current[1];
      if (d2) venaPulmKanan.curve.getPoint(g, d2.position);
    }
  });

  // Panah arah aliran (posisi + orientasi pada tangen lintasan)
  const arrows = useMemo(() => {
    const make = (curve: THREE.CatmullRomCurve3, ts: number[], color: string, size = 0.14) =>
      ts.map((t) => {
        const pos = curve.getPoint(t);
        const tan = curve.getTangent(t).normalize();
        const q = new THREE.Quaternion().setFromUnitVectors(UP, tan);
        return { key: `${color}-${t}`, pos: pos.toArray() as [number, number, number], q, color, size };
      });
    return [
      ...make(arteriPath.curve, [0.3, 0.62], "#E2574C"),
      ...make(venaPath.curve, [0.3, 0.62], "#4E86C4"),
      ...make(trunkPulmKiri.curve, [0.45], "#4E86C4"),
      ...make(venaPulmKiri.curve, [0.5], "#E2574C"),
    ];
  }, [arteriPath, venaPath, trunkPulmKiri, venaPulmKiri]);

  return (
    <group>
      {/* ================= JANTUNG: EMPAT RUANG ================= */}
      <group ref={jantung} position={[0, 0.35, 0]}>
        {/* --- Bilik (ventrikel): dinding tebal, meruncing ke apeks --- */}
        {/* Bilik kiri — pompa sistemik, dinding paling tebal */}
        <Part id="bilik-kiri" color="#C47B78" materialPreset="organelle" {...p} position={[0.47, 0, 0.1]} rotation={[0, 0, 0.16]} scale={[1.0, 1.05, 0.95]}>
          <primitive object={geoBilik} attach="geometry" />
        </Part>
        {/* Bilik kanan — memompa ke paru, sedikit lebih kecil */}
        <Part id="bilik-kanan" color="#7A9BB5" materialPreset="organelle" {...p} position={[-0.5, 0.02, 0.14]} rotation={[0, 0, -0.12]} scale={[0.86, 0.9, 0.95]}>
          <primitive object={geoBilik} attach="geometry" />
        </Part>

        {/* --- Serambi (atrium): ruang pengumpul di atas bilik --- */}
        <Part id="serambi-kanan" color="#5F87A3" materialPreset="organelle" {...p} position={[-0.58, 1.02, 0]} scale={[0.5, 0.42, 0.42]}>
          <sphereGeometry args={[1, 26, 22]} />
        </Part>
        {/* Aurora (appendiks) serambi kanan — tonjolan khas atrium */}
        <Part id="serambi-kanan" color="#4E7894" materialPreset="organelle" {...p} position={[-0.95, 0.95, 0.26]} scale={[0.2, 0.15, 0.15]}>
          <sphereGeometry args={[1, 16, 14]} />
        </Part>
        <Part id="serambi-kiri" color="#C9A0A0" materialPreset="organelle" {...p} position={[0.68, 1.05, -0.02]} scale={[0.5, 0.43, 0.44]}>
          <sphereGeometry args={[1, 26, 22]} />
        </Part>
        {/* Aurora serambi kiri */}
        <Part id="serambi-kiri" color="#B98E8E" materialPreset="organelle" {...p} position={[1.02, 0.98, 0.28]} scale={[0.19, 0.15, 0.15]}>
          <sphereGeometry args={[1, 16, 14]} />
        </Part>

        {/* --- Katup trikuspidalis (kanan) & bikuspidalis/mitral (kiri) --- */}
        <Part id="serambi-kanan" color="#E8E4DA" materialPreset="organelle" {...p} position={[-0.52, 0.5, 0.05]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 0.06, 18]} />
        </Part>
        <Part id="serambi-kiri" color="#E8E4DA" materialPreset="organelle" {...p} position={[0.5, 0.5, 0.05]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 0.06, 18]} />
        </Part>
      </group>

      {/* ================= PEMBULUH UTAMA ================= */}
      {/* Aorta — lengkung keluar dari bilik kiri + turun ke rongga perut */}
      <Part id="aorta" color="#B95C5C" materialPreset="organelle" {...p}>
        <primitive object={aorta.geo} attach="geometry" />
      </Part>
      {aortaCabang.map((g, i) => (
        <Part key={`ac${i}`} id="aorta" color="#A84E4E" materialPreset="organelle" {...p}>
          <primitive object={g} attach="geometry" />
        </Part>
      ))}

      {/* Arteri pulmonalis (biru — darah miskin O₂ menuju paru) */}
      <Part id="pulmonalis" color="#5F87A3" materialPreset="organelle" {...p}>
        <primitive object={trunkPulmKiri.geo} attach="geometry" />
      </Part>
      <Part id="pulmonalis" color="#5F87A3" materialPreset="organelle" {...p}>
        <primitive object={trunkPulmKanan.geo} attach="geometry" />
      </Part>

      {/* Vena cava superior & inferior (biru — kembali ke serambi kanan) */}
      <Part id="vena-cava" color="#4E6E88" materialPreset="organelle" {...p}>
        <primitive object={venaCavaSup.geo} attach="geometry" />
      </Part>
      <Part id="vena-cava" color="#4E6E88" materialPreset="organelle" {...p}>
        <primitive object={venaCavaInf.geo} attach="geometry" />
      </Part>

      {/* ======================= PARU-PARU ======================= */}
      <group position={[2.5, 1.75, -0.95]} rotation={[0, -0.28, 0]}>
        <Part id="paru" color="#C98A8A" materialPreset="organelle" opacity={0.72} {...p} scale={[1, 1, 0.85]}>
          <primitive object={geoParuLower} attach="geometry" />
        </Part>
        <Part id="paru" color="#C98A8A" materialPreset="organelle" opacity={0.72} {...p} scale={[1, 1, 0.85]}>
          <primitive object={geoParuUpper} attach="geometry" />
        </Part>
      </group>
      <group position={[-2.5, 1.75, -0.95]} rotation={[0, 0.28, 0]}>
        <Part id="paru" color="#C98A8A" materialPreset="organelle" opacity={0.72} {...p} scale={[1, 1, 0.85]}>
          <primitive object={geoParuLower} attach="geometry" />
        </Part>
        <Part id="paru" color="#C98A8A" materialPreset="organelle" opacity={0.72} {...p} scale={[1, 1, 0.85]}>
          <primitive object={geoParuUpper} attach="geometry" />
        </Part>
      </group>

      {/* Vena pulmonalis (merah — darah kaya O₂ kembali ke serambi kiri) */}
      <Part id="vena-pulmonalis" color="#B95C5C" materialPreset="organelle" {...p}>
        <primitive object={venaPulmKiri.geo} attach="geometry" />
      </Part>
      <Part id="vena-pulmonalis" color="#B95C5C" materialPreset="organelle" {...p}>
        <primitive object={venaPulmKanan.geo} attach="geometry" />
      </Part>

      {/* ================= SIRKULASI SISTEMIK ================= */}
      {/* Arteri: keluar dari jantung (kaya O₂) + cabang ke jaringan */}
      <Part id="arteri" color="#B95C5C" opacity={0.9} materialPreset="vesicle" {...p}>
        <primitive object={arteriPath.geo} attach="geometry" />
      </Part>
      {arteriCabang.map((g, i) => (
        <Part key={`acb${i}`} id="arteri" color="#B95C5C" materialPreset="organelle" {...p}>
          <primitive object={g} attach="geometry" />
        </Part>
      ))}
      {/* Vena: kembali ke jantung (miskin O₂) + cabang dari jaringan */}
      <Part id="vena" color="#5F87A3" opacity={0.9} materialPreset="vesicle" {...p}>
        <primitive object={venaPath.geo} attach="geometry" />
      </Part>
      {venaCabang.map((g, i) => (
        <Part key={`vcb${i}`} id="vena" color="#5F87A3" materialPreset="organelle" {...p}>
          <primitive object={g} attach="geometry" />
        </Part>
      ))}

      {/* Kapiler — anyaman pembuluh halus penghubung arteri & vena */}
      <Part id="kapiler" color="#D9A05F" materialPreset="organelle" {...p}>
        <primitive object={geoKapiler} attach="geometry" />
      </Part>

      {/* ================= PARTIKEL DARAH (arah aliran) ================= */}
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh key={`pr${i}`} ref={(m) => { sysRed.current[i] = m; }}>
          <sphereGeometry args={[0.1, 12, 12]} />
          <meshStandardMaterial color="#D95F5F" roughness={0.3} emissive="#7A1F1F" emissiveIntensity={0.5} />
        </mesh>
      ))}
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh key={`pb${i}`} ref={(m) => { sysBlue.current[i] = m; }}>
          <sphereGeometry args={[0.1, 12, 12]} />
          <meshStandardMaterial color="#6FA8D6" roughness={0.3} emissive="#1F3A5C" emissiveIntensity={0.5} />
        </mesh>
      ))}
      {[0, 1].map((i) => (
        <mesh key={`pp${i}`} ref={(m) => { pulmBlue.current[i] = m; }}>
          <sphereGeometry args={[0.09, 12, 12]} />
          <meshStandardMaterial color="#6FA8D6" roughness={0.3} emissive="#1F3A5C" emissiveIntensity={0.5} />
        </mesh>
      ))}
      {[0, 1].map((i) => (
        <mesh key={`pv${i}`} ref={(m) => { pulmRed.current[i] = m; }}>
          <sphereGeometry args={[0.09, 12, 12]} />
          <meshStandardMaterial color="#D95F5F" roughness={0.3} emissive="#7A1F1F" emissiveIntensity={0.5} />
        </mesh>
      ))}

      {/* ================= PANAH ARAH ALIRAN ================= */}
      {arrows.map((a) => (
        <mesh key={a.key} position={a.pos} quaternion={a.q}>
          <coneGeometry args={[a.size, a.size * 2.4, 10]} />
          <meshStandardMaterial color={a.color} roughness={0.4} emissive={a.color} emissiveIntensity={0.25} />
        </mesh>
      ))}
    </group>
  );
}
