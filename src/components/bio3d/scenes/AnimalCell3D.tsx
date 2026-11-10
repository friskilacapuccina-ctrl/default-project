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
 * Sphere dengan noise multi-oktaf → membran sel yang lentur dan organik
 * (bukan bola kaku), sedikit pipih secara vertikal seperti sel hewan.
 */
function organicBlob(r: number, amp: number, freq: number, seed: number, yScale: number) {
  const g = new THREE.SphereGeometry(r, 80, 56);
  const pos = g.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const n1 =
      Math.sin(v.x * freq + seed) *
      Math.cos(v.y * freq * 0.85 + seed * 1.7) *
      Math.sin(v.z * freq * 1.15 + seed * 0.6);
    const n2 =
      Math.sin(v.x * freq * 2.3 + seed * 2.1) *
      Math.sin(v.z * freq * 2.1 + seed * 1.3) *
      0.3;
    const s = 1 + n1 * amp + n2 * amp;
    pos.setXYZ(i, v.x * s, v.y * s * yScale, v.z * s);
  }
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
 * Lembaran RE kasar: silinder terbuka berbusur terbatas — membentuk
 * setengah tabung pipih yang melengkung mengelilingi nukleus.
 * `phiCenter` = arah pusat busur pada bidang XZ (rad).
 */
function arcSheet(radius: number, height: number, arc: number, phiCenter: number) {
  const thetaStart = Math.PI / 2 - phiCenter - arc / 2;
  return new THREE.CylinderGeometry(radius, radius, height, 48, 1, true, thetaStart, arc);
}

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
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, 0.026, 6, false);
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

/* Pusat nukleus sel hewan — sedikit di atas pusat sel, dekat marker "nukleus". */
const NC: [number, number, number] = [-0.35, 1.0, 0.35];

/* Lembaran RE kasar yang melingkup nukleus, dengan celah menghadap kamera. */
type SheetDef = {
  r: number;
  h: number;
  arc: number;
  phi: number;
  pos: [number, number, number];
  rot: [number, number, number];
  seed: number;
};

const RE_SHEETS: SheetDef[] = [
  { r: 1.38, h: 1.15, arc: 2.0, phi: 2.55, pos: NC, rot: [0.12, 0, 0.1], seed: 101 },
  {
    r: 1.6,
    h: 1.0,
    arc: 1.55,
    phi: 2.95,
    pos: [NC[0] + 0.05, NC[1] + 0.12, NC[2]],
    rot: [-0.1, 0.1, -0.08],
    seed: 102,
  },
  {
    r: 1.82,
    h: 0.9,
    arc: 1.3,
    phi: 2.1,
    pos: [NC[0], NC[1] - 0.15, NC[2] + 0.05],
    rot: [0.18, 0, 0.06],
    seed: 103,
  },
  // Lembaran tinggi yang menjangkau marker RE kasar di atas-kiri nukleus
  {
    r: 1.55,
    h: 1.3,
    arc: 1.7,
    phi: 2.72,
    pos: [NC[0] - 0.15, NC[1] + 0.55, NC[2] + 0.15],
    rot: [0.32, 0.05, 0.1],
    seed: 104,
  },
  {
    r: 1.46,
    h: 0.95,
    arc: 1.35,
    phi: -0.65,
    pos: [NC[0] + 0.1, NC[1] - 0.28, NC[2] - 0.1],
    rot: [-0.15, 0, -0.12],
    seed: 105,
  },
];

/**
 * Sel hewan 3D ilustratif: tanpa dinding sel dan tanpa kloroplas.
 * Membran transparan berlapis sehingga seluruh organel di dalamnya
 * (inti berpori, RE berlipat, golgi bersisterna, mitokondria berkrista)
 * terlihat jelas dari kamera awal. Semua mesh memakai ID model-info.ts.
 */
export default function AnimalCell3D({ selected, onSelect }: SceneProps) {
  const p = { selected, onSelect };

  /* ---------- pembungkus sel: membran berlapis + sitoplasma ---------- */
  const membranGeo = useGeometry(useMemo(() => organicBlob(3.06, 0.045, 1.05, 3, 0.93), []));
  const membranDalamGeo = useGeometry(useMemo(() => organicBlob(2.97, 0.045, 1.05, 3, 0.93), []));
  const sitoplasmaGeo = useGeometry(useMemo(() => organicBlob(2.88, 0.04, 1.05, 3, 0.93), []));

  /* ---------- krista mitokondria (dua pita berlekuk berkesinambungan) ---------- */
  const kristaGeoA = useGeometry(useMemo(() => cristaeGeometry(0.6, 0.13, 5, 0.045, 0), []));
  const kristaGeoB = useGeometry(
    useMemo(() => cristaeGeometry(0.6, 0.13, 5, 0.045, Math.PI / 2), [])
  );

  /* ---------- nukleus ---------- */
  const kromatinBintik = useMemo(() => {
    const rnd = mulberry(11);
    return Array.from({ length: 16 }, () => {
      const a = rnd() * Math.PI * 2;
      const b = Math.acos(2 * rnd() - 1);
      const r = 1.0 + rnd() * 0.15;
      return {
        pos: [
          NC[0] + r * Math.sin(b) * Math.cos(a),
          NC[1] + r * Math.cos(b),
          NC[2] + r * Math.sin(b) * Math.sin(a),
        ] as [number, number, number],
        s: 0.7 + rnd() * 0.7,
      };
    });
  }, []);

  const kromatinBenang = useGeometryList(
    useMemo(() => [chromatinFilament(1.3, 0.34, 21), chromatinFilament(1.1, 0.3, 37)], [])
  );

  // Pori nukleus: cincin kecil yang menghadap keluar pada permukaan envelope
  const pori = useMemo(() => {
    const rnd = mulberry(5);
    const q = new THREE.Quaternion();
    const zAxis = new THREE.Vector3(0, 0, 1);
    const dir = new THREE.Vector3();
    const out: { pos: [number, number, number]; rot: [number, number, number] }[] = [];
    for (let i = 0; i < 12; i++) {
      const a = rnd() * Math.PI * 2;
      const b = Math.acos(2 * rnd() - 1);
      dir.set(Math.sin(b) * Math.cos(a), Math.cos(b), Math.sin(b) * Math.sin(a));
      q.setFromUnitVectors(zAxis, dir);
      const e = new THREE.Euler().setFromQuaternion(q);
      out.push({
        pos: [NC[0] + dir.x * 1.24, NC[1] + dir.y * 1.24, NC[2] + dir.z * 1.24],
        rot: [e.x, e.y, e.z],
      });
    }
    return out;
  }, []);

  /* ---------- RE kasar: lembaran + butiran ribosom di permukaannya ---------- */
  const reSheetGeos = useGeometryList(
    useMemo(() => RE_SHEETS.map((s) => arcSheet(s.r, s.h, s.arc, s.phi)), [])
  );
  const reDots = useMemo(
    () => RE_SHEETS.flatMap((s, si) => sheetDotPositions(s, si * 17 + 3).map((pos) => ({ pos, si }))),
    []
  );

  /* ---------- RE halus: jaringan tabung bercabang ---------- */
  const reHalusGeos = useGeometryList(
    useMemo(
      () =>
        [
          [
            [1.5, 0.9, -0.5],
            [2.0, 0.7, -0.65],
            [2.4, 0.4, -0.6],
          ],
          [
            [1.7, 0.15, -0.3],
            [2.1, 0.32, -0.5],
            [2.44, 0.02, -0.55],
          ],
          [
            [2.0, 0.62, -0.62],
            [2.2, 0.9, -0.75],
            [2.32, 1.14, -0.7],
          ],
          [
            [2.05, -0.2, -0.4],
            [2.3, -0.5, -0.45],
            [2.38, -0.8, -0.3],
          ],
        ].map((pts) => {
          return new THREE.TubeGeometry(
            new THREE.CatmullRomCurve3(pts.map((q) => new THREE.Vector3(...q))),
            32,
            0.075,
            10,
            false
          );
        }),
      []
    )
  );

  /* ---------- filamen sitoskeleton yang menjulur dari sentrosom ---------- */
  const filamenGeos = useGeometryList(
    useMemo(
      () =>
        [
          [
            [1.1, 1.7, -0.3],
            [1.5, 1.85, -0.45],
            [1.8, 1.9, -0.6],
          ],
          [
            [1.1, 1.7, -0.3],
            [0.3, 2.0, 0.2],
            [-0.5, 2.3, 0.7],
          ],
          [
            [1.1, 1.7, -0.3],
            [1.6, 0.6, 0.4],
            [2.2, -0.6, 0.8],
          ],
        ].map((pts) => {
          return new THREE.TubeGeometry(
            new THREE.CatmullRomCurve3(pts.map((q) => new THREE.Vector3(...q))),
            32,
            0.013,
            6,
            false
          );
        }),
      []
    )
  );

  /* ---------- sebaran butiran (deterministik) ---------- */
  const granulSitoplasma = useMemo(() => {
    const rnd = mulberry(42);
    const cluster: [number, number, number][] = Array.from({ length: 9 }, () => {
      const a = rnd() * Math.PI * 2;
      const b = Math.acos(2 * rnd() - 1);
      const r = 0.25 + rnd() * 0.75;
      return [1.9 + r * Math.sin(b) * Math.cos(a), 1.7 + r * Math.cos(b) * 0.6, 1.1 + r * Math.sin(b) * Math.sin(a)];
    });
    const tersebar: [number, number, number][] = Array.from({ length: 9 }, () => {
      const a = rnd() * Math.PI * 2;
      const b = Math.acos(2 * rnd() - 1);
      const r = 1.6 + rnd() * 1.0;
      return [r * Math.sin(b) * Math.cos(a), r * Math.cos(b) * 0.9, r * Math.sin(b) * Math.sin(a)];
    });
    return [...cluster, ...tersebar];
  }, []);

  const ribosom = useMemo(() => {
    const rnd = mulberry(77);
    const cluster: [number, number, number][] = Array.from({ length: 10 }, () => {
      const a = rnd() * Math.PI * 2;
      const b = Math.acos(2 * rnd() - 1);
      const r = 0.2 + rnd() * 0.6;
      return [2.2 + r * Math.sin(b) * Math.cos(a), -1.4 + r * Math.cos(b) * 0.7, 0.6 + r * Math.sin(b) * Math.sin(a)];
    });
    const tersebar: [number, number, number][] = Array.from({ length: 9 }, () => {
      const a = rnd() * Math.PI * 2;
      const b = Math.acos(2 * rnd() - 1);
      const r = 1.2 + rnd() * 1.4;
      return [r * Math.sin(b) * Math.cos(a), r * Math.cos(b) * 0.85, r * Math.sin(b) * Math.sin(a)];
    });
    return [...cluster, ...tersebar];
  }, []);

  const mitoList: { pos: [number, number, number]; rot: [number, number, number] }[] = [
    { pos: [-1.9, 0.55, 1.0], rot: [0.35, 0.4, 1.15] },
    { pos: [1.35, -1.35, 0.9], rot: [-0.5, 0.2, 0.55] },
    { pos: [-0.5, -1.75, -1.1], rot: [0.2, -0.4, 1.45] },
    { pos: [1.05, 0.25, -1.6], rot: [0.9, 0.1, 0.3] },
  ];

  const vesikulaList: { pos: [number, number, number]; r: number }[] = [
    { pos: [-2.3, 1.0, -0.6], r: 0.15 },
    { pos: [1.9, 1.5, -0.7], r: 0.14 },
    { pos: [0.6, -2.0, 1.2], r: 0.13 },
    { pos: [-0.9, 2.2, -0.9], r: 0.12 },
    { pos: [2.3, -0.2, 1.1], r: 0.12 },
  ];

  const lisosomList: [number, number, number][] = [
    [2.0, 0.95, 0.7],
    [-2.2, -0.9, -0.3],
    [0.4, -2.1, 0.6],
  ];

  return (
    <group>
      {/* ===== 1. MEMBRAN SEL — dua lapis transparan (bilayer) yang lentur ===== */}
      <Part id="membran" color="#6FA3D8" materialPreset="membrane" {...p}>
        <primitive object={membranGeo} attach="geometry" />
      </Part>
      <Part id="membran" color="#6FA3D8" materialPreset="membrane" {...p}>
        <primitive object={membranDalamGeo} attach="geometry" />
      </Part>

      {/* ===== 2. SITOPLASMA — volume dalam sangat tipis transparan ===== */}
      <Part id="sitoplasma" color="#C3DCF7" materialPreset="cytoplasm" {...p}>
        <primitive object={sitoplasmaGeo} attach="geometry" />
      </Part>
      {granulSitoplasma.map((pos, i) => (
        <Part key={`cs${i}`} id="sitoplasma" color="#C3DCF7" materialPreset="vesicle" {...p} position={pos}>
          <sphereGeometry args={[0.035, 8, 8]} />
        </Part>
      ))}
      {/* Sitoskeleton: benang tipis yang menjulur dari sentrosom ke membran */}
      {filamenGeos.map((geo, i) => (
        <Part key={`fl${i}`} id="sitoplasma" color="#C3DCF7" materialPreset="organelle" {...p}>
          <primitive object={geo} attach="geometry" />
        </Part>
      ))}

      {/* ===== 3. NUKLEUS — envelope berpori + nukleoplasma + kromatin ===== */}
      <Part id="nukleus" color="#9B7EBD" materialPreset="nucleus" opacity={0.5} {...p} position={NC}>
        <sphereGeometry args={[1.22, 44, 32]} />
      </Part>
      <Part id="nukleus" color="#9B7EBD" materialPreset="nucleus" opacity={0.7} {...p} position={NC}>
        <sphereGeometry args={[0.98, 36, 28]} />
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
          <torusGeometry args={[0.075, 0.022, 8, 16]} />
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
          <icosahedronGeometry args={[0.06, 1]} />
        </Part>
      ))}
      {kromatinBenang.map((geo, i) => (
        <Part key={`kb${i}`} id="nukleus" color="#9B7EBD" materialPreset="chromatin" {...p} position={NC}>
          <primitive object={geo} attach="geometry" />
        </Part>
      ))}

      {/* ===== 4. NUKLEOLUS — inti padat di dalam nukleus ===== */}
      <Part id="nukleolus" color="#5B3E9E" materialPreset="organelle" {...p} position={[0.12, 1.08, 0.5]}>
        <sphereGeometry args={[0.3, 28, 24]} />
      </Part>

      {/* ===== 5. RE KASAR — lembaran melengkung bertumpuk + ribosom di permukaan ===== */}
      {RE_SHEETS.map((s, i) => (
        <group key={`rs${i}`} position={s.pos} rotation={s.rot}>
          <Part
            id="rekasar"
            color="#3D6DB5"
            materialPreset="vesicle"
            {...p}
          >
            <primitive object={reSheetGeos[i]} attach="geometry" />
          </Part>
          {reDots
            .filter((d) => d.si === i)
            .map((d, j) => (
              <Part key={`rd${i}-${j}`} id="rekasar" color="#3D6DB5" materialPreset="organelle" {...p} position={d.pos}>
                <sphereGeometry args={[0.05, 8, 8]} />
              </Part>
            ))}
        </group>
      ))}

      {/* ===== 6. RE HALUS — jaringan tabung bercabang tanpa ribosom ===== */}
      {reHalusGeos.map((geo, i) => (
        <Part key={`rh${i}`} id="rehalus" color="#7FB3D5" materialPreset="organelle" {...p}>
          <primitive object={geo} attach="geometry" />
        </Part>
      ))}
      {[
        [2.4, 0.4, -0.6],
        [2.38, -0.8, -0.3],
        [2.32, 1.14, -0.7],
      ].map((pos, i) => (
        <Part
          key={`rv${i}`}
          id="rehalus"
          color="#7FB3D5"
          materialPreset="vesicle"
          {...p}
          position={pos as [number, number, number]}
        >
          <sphereGeometry args={[0.12, 14, 12]} />
        </Part>
      ))}

      {/* ===== 7. BADAN GOLGI — tumpukan kantung pipih melengkung + vesikel lepas ===== */}
      <group position={[-1.35, -1.1, 0.6]} rotation={[0.12, 0.35, 0.14]}>
        {[0.62, 0.55, 0.48, 0.41, 0.34, 0.27].map((r, i) => (
          <Part
            key={`g${i}`}
            id="golgi"
            color="#E59BB0"
            materialPreset="organelle"
            {...p}
            position={[0, i * 0.15, 0]}
            rotation={[Math.PI / 2, 0, 0.18 + i * 0.1]}
            scale={[1, 1, 0.55]}
          >
            <torusGeometry args={[r, 0.085, 12, 32, Math.PI * 1.3]} />
          </Part>
        ))}
        {[
          [0.72, 0.9, 0.1, 0.11],
          [-0.68, 0.75, -0.15, 0.1],
          [0.5, -0.15, 0.35, 0.12],
          [-0.42, -0.25, 0.28, 0.1],
          [0.15, 1.0, -0.25, 0.09],
        ].map(([x, y, z, r], i) => (
          <Part key={`gv${i}`} id="golgi" color="#E59BB0" materialPreset="vesicle" {...p} position={[x, y, z]}>
            <sphereGeometry args={[r, 14, 12]} />
          </Part>
        ))}
      </group>

      {/* ===== 8. MITOKONDRIA — kapsul transparan dengan krista berlipat ===== */}
      {mitoList.map((m, i) => (
        <group key={`mi${i}`} position={m.pos} rotation={m.rot}>
          <Part id="mitokondria" color="#E8912D" materialPreset="vesicle" {...p}>
            <capsuleGeometry args={[0.32, 0.62, 8, 24]} />
          </Part>
          <Part id="mitokondria" color="#E8912D" materialPreset="crystal" {...p} position={[0, 0, 0.07]}>
            <primitive object={kristaGeoA} attach="geometry" />
          </Part>
          <Part id="mitokondria" color="#E8912D" materialPreset="crystal" {...p} position={[0, 0, -0.07]}>
            <primitive object={kristaGeoB} attach="geometry" />
          </Part>
        </group>
      ))}

      {/* ===== 9. LISOSOM — kantung kecil berlapis ===== */}
      {lisosomList.map((pos, i) => (
        <group key={`ls${i}`} position={pos}>
          <Part id="lisosom" color="#E8B45F" materialPreset="vesicle" {...p}>
            <sphereGeometry args={[0.2, 20, 16]} />
          </Part>
          <Part id="lisosom" color="#E8B45F" materialPreset="organelle" {...p}>
            <sphereGeometry args={[0.12, 14, 12]} />
          </Part>
        </group>
      ))}

      {/* ===== 10. RIBOSOM bebas di sitoplasma ===== */}
      {ribosom.map((pos, i) => (
        <Part key={`rb${i}`} id="ribosom" color="#7A86B8" materialPreset="organelle" {...p} position={pos}>
          <sphereGeometry args={[0.055, 8, 8]} />
        </Part>
      ))}

      {/* ===== 11. VESIKULA — kantung pengangkut kecil ===== */}
      {vesikulaList.map((v, i) => (
        <Part key={`vs${i}`} id="vesikula" color="#B48AC9" materialPreset="vesicle" {...p} position={v.pos}>
          <sphereGeometry args={[v.r, 16, 12]} />
        </Part>
      ))}

      {/* ===== 12. SENTRIOL — sepasang silinder mikrotubulus bersudut + sentrosom ===== */}
      <group position={[1.1, 1.7, -0.3]} rotation={[0.35, 0.25, 0.1]}>
        <Part id="sentriol" color="#8FA3C7" materialPreset="organelle" {...p} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.095, 0.095, 0.44, 9, 1]} />
        </Part>
        <Part
          id="sentriol"
          color="#8FA3C7"
          materialPreset="organelle"
          {...p}
          position={[0.15, 0.16, 0.05]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <cylinderGeometry args={[0.095, 0.095, 0.44, 9, 1]} />
        </Part>
        {/* Cincin mikrotubulus yang menegaskan struktur silindris */}
        {[-0.15, 0.15].map((x, i) => (
          <Part
            key={`sr${i}`}
            id="sentriol"
            color="#8FA3C7"
            materialPreset="organelle"
            {...p}
            position={[x, 0, 0]}
            rotation={[0, Math.PI / 2, 0]}
          >
            <torusGeometry args={[0.098, 0.016, 8, 18]} />
          </Part>
        ))}
        {/* Pericentriolar material di sekelilingnya */}
        <Part id="sentriol" color="#8FA3C7" materialPreset="vesicle" {...p} position={[0.08, 0.08, 0.02]}>
          <sphereGeometry args={[0.34, 20, 16]} />
        </Part>
      </group>
    </group>
  );
}
