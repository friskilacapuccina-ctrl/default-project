"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { Part } from "../Part";
import type { SceneProps } from "../types";

/* ============================ UTIL GEOMETRI ============================ */

function mulberry(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/**
 * Kotak bersudut membulat: dasar bentuk sel tumbuhan yang kaku namun
 * tidak kaku seperti kotak mainan (sudut membulat halus).
 */
function roundedBox(w: number, h: number, d: number, r: number, seg = 6) {
  const g = new THREE.BoxGeometry(w, h, d, seg, seg, seg);
  const pos = g.attributes.position;
  const hx = w / 2 - r;
  const hy = h / 2 - r;
  const hz = d / 2 - r;
  const v = new THREE.Vector3();
  const c = new THREE.Vector3();
  const dir = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    c.set(
      THREE.MathUtils.clamp(v.x, -hx, hx),
      THREE.MathUtils.clamp(v.y, -hy, hy),
      THREE.MathUtils.clamp(v.z, -hz, hz)
    );
    dir.copy(v).sub(c);
    const len = dir.length();
    if (len > 1e-6) dir.multiplyScalar(r / len);
    pos.setXYZ(i, c.x + dir.x, c.y + dir.y, c.z + dir.z);
  }
  pos.needsUpdate = true;
  g.computeVertexNormals();
  return g;
}

/** Pita krista: lipatan membran dalam mitokondria berupa tabung berlekuk. */
function cristaeGeometry(len: number, amp: number, folds: number, radius: number, phase: number) {
  const steps = folds * 6;
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    pts.push(
      new THREE.Vector3(
        Math.sin(t * folds * Math.PI + phase) * amp,
        (t - 0.5) * len,
        Math.cos(t * folds * Math.PI * 0.8 + phase) * amp * 0.45
      )
    );
  }
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), steps * 4, radius, 8, false);
}

/**
 * Lembaran RE: silinder terbuka berbusur terbatas — setengah tabung pipih
 * yang melengkung mengelilingi nukleus.
 */
function arcSheet(radius: number, height: number, arc: number, phiCenter: number) {
  const thetaStart = Math.PI / 2 - phiCenter - arc / 2;
  return new THREE.CylinderGeometry(radius, radius, height, 44, 1, true, thetaStart, arc);
}

type SheetDef = { r: number; h: number; arc: number; phi: number };

/** Butiran ribosom yang menempel pada permukaan luar sebuah lembaran RE. */
function sheetDotPositions(s: SheetDef, seed: number): [number, number, number][] {
  const rnd = mulberry(seed);
  const thetaStart = Math.PI / 2 - s.phi - s.arc / 2;
  const out: [number, number, number][] = [];
  const rr = s.r + 0.055;
  for (let i = 0; i < 6; i++) {
    const t = (i + 0.2 + rnd() * 0.6) / 6;
    const theta = thetaStart + s.arc * t;
    const y = (rnd() - 0.5) * Math.max(s.h - 0.2, 0.12);
    out.push([rr * Math.sin(theta), y, rr * Math.cos(theta)]);
  }
  return out;
}

/** Benang kromatin halus di dalam nukleus. */
function chromatinFilament(len: number, amp: number, seed: number) {
  const rnd = mulberry(seed);
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= 10; i++) {
    const t = (i / 10 - 0.5) * len;
    pts.push(
      new THREE.Vector3(
        Math.sin(t * 5 + rnd() * 0.5) * amp,
        Math.cos(t * 4.2) * amp * 0.85,
        Math.sin(t * 3.4 + 1.2) * amp
      )
    );
  }
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, 0.024, 6, false);
}

/** Bersihkan geometri buatan sendiri saat unmount (anti memory leak). */
function useGeometry<T extends THREE.BufferGeometry>(geo: T): T {
  useEffect(() => () => geo.dispose(), [geo]);
  return geo;
}

function useGeometryList(geos: THREE.BufferGeometry[]): THREE.BufferGeometry[] {
  useEffect(
    () => () => {
      for (const g of geos) g.dispose();
    },
    [geos]
  );
  return geos;
}

/* ============================ PENEMPATAN ============================ */

/**
 * Pusat nukleus sel tumbuhan: terdesak ke sisi kanan oleh vakuola sentral
 * (ciri khas sel tumbuhan dewasa), dekat marker "nukleus".
 */
const NC: [number, number, number] = [1.15, 0.62, 0.3];

/* Vakuola sentral: elipsoid dominan yang mengisi sebagian besar isi sel. */
const VAC_C: [number, number, number] = [-0.45, -0.15, 0.1];
const VAC_H: [number, number, number] = [1.72, 1.35, 1.05];

/** Titik berada di luar vakuola (dengan margin) — untuk menaruh organel di sitoplasma tepi. */
function outsideVacuola(p: [number, number, number], margin = 1.15): boolean {
  const dx = (p[0] - VAC_C[0]) / VAC_H[0];
  const dy = (p[1] - VAC_C[1]) / VAC_H[1];
  const dz = (p[2] - VAC_C[2]) / VAC_H[2];
  return dx * dx + dy * dy + dz * dz > margin * margin;
}

/* Lembaran RE kasar yang mengelilingi nukleus (dua dekat inti + satu di atas vakuola). */
const RE_SHEETS: { sheet: SheetDef; pos: [number, number, number]; rot: [number, number, number]; seed: number }[] = [
  { sheet: { r: 1.18, h: 0.9, arc: 1.7, phi: 2.9 }, pos: NC, rot: [0.12, 0, 0.1], seed: 201 },
  { sheet: { r: 1.36, h: 0.8, arc: 1.3, phi: 2.3 }, pos: [NC[0] + 0.05, NC[1] + 0.12, NC[2] - 0.05], rot: [-0.1, 0.1, -0.08], seed: 202 },
  // Lembaran di kiri-atas yang menjangkau marker RE kasar
  { sheet: { r: 0.62, h: 0.55, arc: 1.9, phi: 2.5 }, pos: [-1.2, 1.45, 0.85], rot: [0.2, 0.1, 0.15], seed: 203 },
  { sheet: { r: 0.82, h: 0.5, arc: 1.6, phi: 2.8 }, pos: [-1.0, 1.62, 0.75], rot: [-0.15, 0, -0.1], seed: 204 },
];

/**
 * Sel tumbuhan 3D ilustratif: dinding sel tebal bersudut membulat,
 * vakuola sentral dominan yang mendesak nukleus ke tepi, serta kloroplas
 * berisi grana (tumpukan tilakoid) yang terlihat jelas.
 * Semua mesh memakai ID struktur dari model-info.ts.
 */
export default function PlantCell3D({ selected, onSelect }: SceneProps) {
  const p = { selected, onSelect };

  /* ---------- 1. DINDING SEL — shell tebal dua lapis ---------- */
  const wallGeo = useGeometry(useMemo(() => roundedBox(5.6, 4.4, 3.6, 0.45, 8), []));
  const wallInnerGeo = useGeometry(useMemo(() => roundedBox(5.14, 3.94, 3.14, 0.34, 8), []));

  /* ---------- 2. MEMBRAN PLASMA — tepat di dalam dinding ---------- */
  const membraneGeo = useGeometry(useMemo(() => roundedBox(4.98, 3.78, 2.98, 0.3, 8), []));

  /* ---------- 3. SITOPLASMA — lapisan tipis antara vakuola & membran ---------- */
  const cytoGeo = useGeometry(useMemo(() => roundedBox(4.86, 3.66, 2.86, 0.28, 6), []));

  /* ---------- 4. VAKUOLA SENTRAL + tonoplas ---------- */
  const vacGeo = useGeometry(useMemo(() => new THREE.SphereGeometry(1, 56, 40), []));
  const tonoplastGeo = useGeometry(useMemo(() => new THREE.SphereGeometry(1, 56, 40), []));

  /* ---------- 5. NUKLEUS ---------- */
  const kromatinBintik = useMemo(() => {
    const rnd = mulberry(31);
    return Array.from({ length: 13 }, () => {
      const a = rnd() * Math.PI * 2;
      const b = Math.acos(2 * rnd() - 1);
      const r = 0.82 + rnd() * 0.14;
      return {
        pos: [
          NC[0] + r * Math.sin(b) * Math.cos(a),
          NC[1] + r * Math.cos(b),
          NC[2] + r * Math.sin(b) * Math.sin(a),
        ] as [number, number, number],
        s: 0.7 + rnd() * 0.6,
      };
    });
  }, []);

  const kromatinBenang = useGeometryList(
    useMemo(() => [chromatinFilament(1.05, 0.26, 55), chromatinFilament(0.9, 0.24, 71)], [])
  );

  const pori = useMemo(() => {
    const rnd = mulberry(13);
    const q = new THREE.Quaternion();
    const zAxis = new THREE.Vector3(0, 0, 1);
    const dir = new THREE.Vector3();
    const out: { pos: [number, number, number]; rot: [number, number, number] }[] = [];
    for (let i = 0; i < 10; i++) {
      const a = rnd() * Math.PI * 2;
      const b = Math.acos(2 * rnd() - 1);
      dir.set(Math.sin(b) * Math.cos(a), Math.cos(b), Math.sin(b) * Math.sin(a));
      q.setFromUnitVectors(zAxis, dir);
      const e = new THREE.Euler().setFromQuaternion(q);
      out.push({
        pos: [NC[0] + dir.x * 1.0, NC[1] + dir.y * 1.0, NC[2] + dir.z * 1.0],
        rot: [e.x, e.y, e.z],
      });
    }
    return out;
  }, []);

  /* ---------- 7. RE KASAR: lembaran + butiran ribosom ---------- */
  const reSheetGeos = useGeometryList(
    useMemo(() => RE_SHEETS.map((d) => arcSheet(d.sheet.r, d.sheet.h, d.sheet.arc, d.sheet.phi)), [])
  );
  const reDots = useMemo(
    () => RE_SHEETS.flatMap((d, di) => sheetDotPositions(d.sheet, di * 23 + 9).map((pos) => ({ pos, di }))),
    []
  );

  /* ---------- 8. RE HALUS: jaringan tabung bercabang ---------- */
  const reHalusGeos = useGeometryList(
    useMemo(
      () =>
        [
          [
            [1.6, 0.75, -0.95],
            [1.95, 0.55, -1.05],
            [2.25, 0.35, -1.0],
          ],
          [
            [1.7, 0.05, -0.85],
            [2.0, 0.2, -0.95],
            [2.25, -0.1, -0.9],
          ],
          [
            [2.0, 0.5, -1.0],
            [2.2, 0.8, -1.1],
            [2.3, 1.05, -1.05],
          ],
        ].map((pts) => {
          return new THREE.TubeGeometry(
            new THREE.CatmullRomCurve3(pts.map((q) => new THREE.Vector3(...q))),
            28,
            0.06,
            10,
            false
          );
        }),
      []
    )
  );

  /* ---------- sebaran butiran sitoplasma (deterministik, di luar vakuola) ---------- */
  const cytoDots = useMemo(() => {
    const rnd = mulberry(91);
    const out: [number, number, number][] = [];
    let guard = 0;
    while (out.length < 18 && guard < 500) {
      guard++;
      const q: [number, number, number] = [
        -2.3 + rnd() * 4.6,
        -1.75 + rnd() * 3.5,
        -1.35 + rnd() * 2.7,
      ];
      if (outsideVacuola(q, 1.08)) out.push(q);
    }
    return out;
  }, []);

  const ribosom = useMemo(() => {
    const rnd = mulberry(57);
    const cluster: [number, number, number][] = Array.from({ length: 9 }, () => {
      const a = rnd() * Math.PI * 2;
      const b = Math.acos(2 * rnd() - 1);
      const r = 0.2 + rnd() * 0.55;
      return [2.1 + r * Math.sin(b) * Math.cos(a), 1.5 + r * Math.cos(b) * 0.6, 1.0 + r * Math.sin(b) * Math.sin(a)];
    });
    const tersebar: [number, number, number][] = [];
    let guard = 0;
    while (tersebar.length < 9 && guard < 500) {
      guard++;
      const q: [number, number, number] = [
        -2.2 + rnd() * 4.4,
        -1.7 + rnd() * 3.4,
        -1.3 + rnd() * 2.6,
      ];
      if (outsideVacuola(q, 1.06)) tersebar.push(q);
    }
    return [...cluster, ...tersebar];
  }, []);

  /* ---------- 10. KLOROPLAS: oval hijau + grana bertumpuk ---------- */
  const chloroplasts: { pos: [number, number, number]; rot: [number, number, number]; scale: number }[] = [
    { pos: [-0.6, -1.35, 1.05], rot: [0.3, 0.5, 0.85], scale: 1.0 },
    { pos: [1.75, -1.15, -0.85], rot: [-0.25, 0.3, 1.1], scale: 0.92 },
    { pos: [-1.95, 1.35, 0.55], rot: [0.2, -0.4, 0.5], scale: 0.88 },
    { pos: [1.9, 1.35, -0.75], rot: [-0.3, 0.6, -0.4], scale: 0.85 },
    { pos: [0.4, -1.65, -0.75], rot: [0.35, -0.2, 1.3], scale: 0.9 },
  ];
  /** Posisi tumpukan grana (x, z) di dalam satu kloroplas. */
  const granaStacks: [number, number][] = [
    [-0.24, 0.06],
    [0.0, -0.04],
    [0.23, 0.05],
  ];
  /** Posisi disk dalam satu tumpukan (4 disk pipih bertumpuk). */
  const granaDiscY = [-0.055, -0.019, 0.019, 0.055];

  /* ---------- 11. MITOKONDRIA ---------- */
  const mitoList: { pos: [number, number, number]; rot: [number, number, number] }[] = [
    { pos: [1.55, -1.5, 0.65], rot: [0.25, 0.3, 1.2] },
    { pos: [-1.85, -1.5, -0.6], rot: [-0.4, 0.2, 0.85] },
    { pos: [0.85, -1.7, 0.95], rot: [0.3, -0.3, 1.5] },
    { pos: [2.05, 0.75, -0.75], rot: [0.9, 0.1, 0.4] },
  ];
  const mitoCristaA = useGeometry(useMemo(() => cristaeGeometry(0.44, 0.1, 5, 0.035, 0), []));
  const mitoCristaB = useGeometry(
    useMemo(() => cristaeGeometry(0.44, 0.1, 5, 0.035, Math.PI / 2), [])
  );

  /* ---------- 13. VESIKULA ---------- */
  const vesikulaList: { pos: [number, number, number]; r: number }[] = [
    { pos: [-2.2, 0.95, -0.6], r: 0.14 },
    { pos: [2.2, 1.2, -0.9], r: 0.13 },
    { pos: [-2.3, -1.15, 0.85], r: 0.12 },
    { pos: [1.9, -0.9, -1.2], r: 0.11 },
    { pos: [0.2, 1.7, 1.15], r: 0.11 },
  ];

  return (
    <group>
      {/* ===== 1. DINDING SEL — shell tebal kaku bersudut membulat ===== */}
      <Part id="dinding" color="#79B473" materialPreset="wall" opacity={0.22} {...p}>
        <primitive object={wallGeo} attach="geometry" />
      </Part>
      {/* Lapisan dalam dinding — memberi kesan ketebalan dinding yang nyata */}
      <Part id="dinding" color="#79B473" materialPreset="wall" opacity={0.3} {...p}>
        <primitive object={wallInnerGeo} attach="geometry" />
      </Part>

      {/* ===== 2. MEMBRAN PLASMA — lapisan tipis tepat di dalam dinding ===== */}
      <Part id="membran" color="#B8C94A" materialPreset="membrane" {...p}>
        <primitive object={membraneGeo} attach="geometry" />
      </Part>

      {/* ===== 3. SITOPLASMA — lapisan tipis yang terdesak ke tepi ===== */}
      <Part id="sitoplasma" color="#C9E7A8" materialPreset="cytoplasm" {...p}>
        <primitive object={cytoGeo} attach="geometry" />
      </Part>
      {cytoDots.map((pos, i) => (
        <Part key={`cy${i}`} id="sitoplasma" color="#C9E7A8" materialPreset="vesicle" {...p} position={pos}>
          <sphereGeometry args={[0.038, 8, 8]} />
        </Part>
      ))}

      {/* ===== 4. VAKUOLA SENTRAL — komponen terbesar yang mendominasi ===== */}
      <Part
        id="vakuola"
        color="#AEDFF2"
        materialPreset="vesicle"
        {...p}
        position={VAC_C}
        scale={[VAC_H[0], VAC_H[1], VAC_H[2]]}
      >
        <primitive object={vacGeo} attach="geometry" />
      </Part>
      {/* Tonoplas: membran tipis pembatas vakuola */}
      <Part
        id="vakuola"
        color="#AEDFF2"
        materialPreset="membrane"
        {...p}
        position={VAC_C}
        scale={[VAC_H[0] * 1.03, VAC_H[1] * 1.03, VAC_H[2] * 1.03]}
      >
        <primitive object={tonoplastGeo} attach="geometry" />
      </Part>
      {/* Butiran cairan sel di dalam vakuola */}
      {[
        [-0.9, 0.3, 0.4],
        [-0.1, -0.5, -0.2],
        [-1.1, -0.6, 0.5],
      ].map((pos, i) => (
        <Part key={`sap${i}`} id="vakuola" color="#AEDFF2" materialPreset="crystal" {...p} position={pos as [number, number, number]}>
          <icosahedronGeometry args={[0.06, 0]} />
        </Part>
      ))}

      {/* ===== 5. NUKLEUS — terdesak ke sisi oleh vakuola ===== */}
      <Part id="nukleus" color="#9B7EBD" materialPreset="nucleus" opacity={0.5} {...p} position={NC}>
        <sphereGeometry args={[1.0, 40, 30]} />
      </Part>
      <Part id="nukleus" color="#9B7EBD" materialPreset="nucleus" opacity={0.7} {...p} position={NC}>
        <sphereGeometry args={[0.8, 32, 26]} />
      </Part>
      {pori.map((q, i) => (
        <Part
          key={`po${i}`}
          id="nukleus"
          color="#9B7EBD"
          materialPreset="organelle"
          {...p}
          position={q.pos}
          rotation={q.rot}
        >
          <torusGeometry args={[0.065, 0.02, 8, 16]} />
        </Part>
      ))}
      {kromatinBintik.map((k, i) => (
        <Part
          key={`kr${i}`}
          id="nukleus"
          color="#9B7EBD"
          materialPreset="chromatin"
          {...p}
          position={k.pos}
          scale={k.s}
        >
          <icosahedronGeometry args={[0.055, 1]} />
        </Part>
      ))}
      {kromatinBenang.map((geo, i) => (
        <Part key={`kb${i}`} id="nukleus" color="#9B7EBD" materialPreset="chromatin" {...p} position={NC}>
          <primitive object={geo} attach="geometry" />
        </Part>
      ))}

      {/* ===== 6. NUKLEOLUS ===== */}
      <Part id="nukleolus" color="#5B3E9E" materialPreset="organelle" {...p} position={[0.68, 0.67, 0.38]}>
        <sphereGeometry args={[0.26, 26, 22]} />
      </Part>

      {/* ===== 7. RE KASAR — lembaran beribosom ===== */}
      {RE_SHEETS.map((d, i) => (
        <group key={`rs${i}`} position={d.pos} rotation={d.rot}>
          <Part id="rekasar" color="#3D6DB5" materialPreset="vesicle" {...p}>
            <primitive object={reSheetGeos[i]} attach="geometry" />
          </Part>
          {reDots
            .filter((x) => x.di === i)
            .map((x, j) => (
              <Part key={`rd${i}-${j}`} id="rekasar" color="#3D6DB5" materialPreset="organelle" {...p} position={x.pos}>
                <sphereGeometry args={[0.045, 8, 8]} />
              </Part>
            ))}
        </group>
      ))}

      {/* ===== 8. RE HALUS — tabung halus tanpa ribosom ===== */}
      {reHalusGeos.map((geo, i) => (
        <Part key={`rh${i}`} id="rehalus" color="#7FB3D5" materialPreset="organelle" {...p}>
          <primitive object={geo} attach="geometry" />
        </Part>
      ))}
      {[
        [2.25, 0.35, -1.0],
        [2.3, 1.05, -1.05],
      ].map((pos, i) => (
        <Part key={`rv${i}`} id="rehalus" color="#7FB3D5" materialPreset="vesicle" {...p} position={pos as [number, number, number]}>
          <sphereGeometry args={[0.1, 12, 12]} />
        </Part>
      ))}

      {/* ===== 9. BADAN GOLGI (diktiosom) — sisterna melengkung + vesikel ===== */}
      <group position={[-1.55, -1.0, 0.85]} rotation={[0.12, -0.3, 0.14]}>
        {[0.58, 0.52, 0.45, 0.38, 0.31].map((r, i) => (
          <Part
            key={`g${i}`}
            id="golgi"
            color="#E59BB0"
            materialPreset="organelle"
            {...p}
            position={[0, i * 0.14, 0]}
            rotation={[Math.PI / 2, 0, 0.18 + i * 0.1]}
            scale={[1, 1, 0.55]}
          >
            <torusGeometry args={[r, 0.08, 12, 30, Math.PI * 1.3]} />
          </Part>
        ))}
        {[
          [0.66, 0.85, 0.1, 0.1],
          [-0.62, 0.7, -0.12, 0.095],
          [0.42, -0.15, 0.3, 0.11],
          [-0.36, -0.22, 0.24, 0.09],
        ].map(([x, y, z, r], i) => (
          <Part key={`gv${i}`} id="golgi" color="#E59BB0" materialPreset="vesicle" {...p} position={[x, y, z]}>
            <sphereGeometry args={[r, 14, 12]} />
          </Part>
        ))}
      </group>

      {/* ===== 10. KLOROPLAS — oval hijau dengan grana (tumpukan tilakoid) ===== */}
      {chloroplasts.map((k, i) => (
        <group key={`cl${i}`} position={k.pos} rotation={k.rot} scale={k.scale}>
          {/* Envelope kloroplas transparan agar grana di dalamnya terlihat */}
          <Part id="kloroplas" color="#4E9E4E" materialPreset="vesicle" {...p} scale={[0.55, 0.3, 0.42]}>
            <sphereGeometry args={[1, 34, 24]} />
          </Part>
          {granaStacks.map(([gx, gz], si) => (
            <group key={`gr${si}`} position={[gx, 0, gz]}>
              {granaDiscY.map((dy, di) => (
                <Part key={`d${di}`} id="kloroplas" color="#4E9E4E" materialPreset="granum" {...p} position={[0, dy, 0]}>
                  <cylinderGeometry args={[0.14, 0.14, 0.026, 20]} />
                </Part>
              ))}
            </group>
          ))}
          {/* Lamela tilakoid yang menghubungkan antar grana */}
          {[-0.12, 0.115].map((lx, li) => (
            <Part
              key={`lm${li}`}
              id="kloroplas"
              color="#4E9E4E"
              materialPreset="granum"
              {...p}
              position={[lx, 0, 0.01]}
            >
              <boxGeometry args={[0.22, 0.012, 0.1]} />
            </Part>
          ))}
        </group>
      ))}

      {/* ===== 11. MITOKONDRIA — kapsul dengan lipatan krista ===== */}
      {mitoList.map((m, i) => (
        <group key={`mi${i}`} position={m.pos} rotation={m.rot}>
          <Part id="mitokondria" color="#E8912D" materialPreset="vesicle" {...p}>
            <capsuleGeometry args={[0.24, 0.44, 8, 20]} />
          </Part>
          <Part id="mitokondria" color="#E8912D" materialPreset="crystal" {...p} position={[0, 0, 0.05]}>
            <primitive object={mitoCristaA} attach="geometry" />
          </Part>
          <Part id="mitokondria" color="#E8912D" materialPreset="crystal" {...p} position={[0, 0, -0.05]}>
            <primitive object={mitoCristaB} attach="geometry" />
          </Part>
        </group>
      ))}

      {/* ===== 12. RIBOSOM bebas ===== */}
      {ribosom.map((pos, i) => (
        <Part key={`rb${i}`} id="ribosom" color="#7A86B8" materialPreset="organelle" {...p} position={pos}>
          <sphereGeometry args={[0.05, 8, 8]} />
        </Part>
      ))}

      {/* ===== 13. VESIKULA ===== */}
      {vesikulaList.map((v, i) => (
        <Part key={`vs${i}`} id="vesikula" color="#B48AC9" materialPreset="vesicle" {...p} position={v.pos}>
          <sphereGeometry args={[v.r, 14, 12]} />
        </Part>
      ))}
    </group>
  );
}
