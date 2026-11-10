"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { Part } from "../../Part";
import type { SceneProps } from "../../types";
import { useGeoms, wavyTube, tubeFromPoints } from "../tissueUtils";

/**
 * Jaringan Ikat Hewan — 6 jenis dipilih lewat prop `kind`:
 * longgar (areolar), padat (tendon), adiposa, tulang rawan,
 * tulang kompak (osteon), dan darah.
 * Tiap jenis adalah sub-komponen sendiri sehingga hooks tidak pernah
 * dipanggil secara kondisional (Rules of Hooks).
 */

export type ConnectiveKind =
  | "longgar"
  | "padat"
  | "adiposa"
  | "rawan"
  | "tulang"
  | "darah";

type Props = SceneProps & { kind: ConnectiveKind };
type P = { selected: string | null; onSelect: (id: string) => void };

export default function ConnectiveTissue3D({ selected, onSelect, kind }: Props) {
  const p = { selected, onSelect };
  switch (kind) {
    case "longgar":
      return <LonggarTissue {...p} />;
    case "padat":
      return <PadatTissue {...p} />;
    case "adiposa":
      return <AdiposaTissue {...p} />;
    case "rawan":
      return <RawanTissue {...p} />;
    case "tulang":
      return <TulangTissue {...p} />;
    case "darah":
      return <DarahTissue {...p} />;
  }
}

/* ==================== JARINGAN IKAT LONGGAR (AREOLAR) ==================== */
const LONGGAR_KOLAGEN_SEEDS = [
  { len: 3.4, amp: 0.22, freq: 1.6, seed: 21, y: 0.55, z: 0.4, ry: 0 },
  { len: 3.2, amp: 0.2, freq: 1.8, seed: 22, y: 0.15, z: 0.6, ry: 0.5 },
  { len: 3.5, amp: 0.24, freq: 1.5, seed: 23, y: -0.25, z: 0.35, ry: -0.4 },
  { len: 3.0, amp: 0.18, freq: 2.0, seed: 24, y: 0.85, z: 0.15, ry: 1.1 },
  { len: 3.3, amp: 0.21, freq: 1.7, seed: 25, y: -0.6, z: 0.55, ry: 2.0 },
  { len: 2.8, amp: 0.19, freq: 1.9, seed: 26, y: 0.35, z: 0.9, ry: 2.6 },
];

const LONGGAR_ELASTIN_SEEDS = [
  { len: 3.0, amp: 0.3, freq: 2.4, seed: 31, y: 0.7, z: 0.5, ry: 0.3 },
  { len: 2.7, amp: 0.28, freq: 2.6, seed: 32, y: 0.2, z: 0.25, ry: 1.2 },
  { len: 3.1, amp: 0.32, freq: 2.2, seed: 33, y: -0.4, z: 0.7, ry: 2.1 },
  { len: 2.5, amp: 0.26, freq: 2.8, seed: 34, y: 0.95, z: 0.8, ry: 0.8 },
  { len: 2.9, amp: 0.3, freq: 2.5, seed: 35, y: -0.75, z: 0.45, ry: 1.7 },
  { len: 2.6, amp: 0.27, freq: 2.7, seed: 36, y: 0.5, z: 1.0, ry: 2.9 },
];

const FIBROBLAST_POS: [number, number, number][] = [
  [-0.4, -0.75, 0.6],
  [0.9, 0.9, 0.35],
];

function LonggarTissue({ selected, onSelect }: P) {
  const p = { selected, onSelect };
  const geos = useGeoms(() => ({
    kolagen: LONGGAR_KOLAGEN_SEEDS.map((s) => wavyTube(s.len, 0.05, s.amp, s.freq, s.seed, s.y, s.z)),
    elastin: LONGGAR_ELASTIN_SEEDS.map((s) => wavyTube(s.len, 0.016, s.amp, s.freq, s.seed, s.y, s.z)),
  }));

  return (
    <group position={[0, 0.1, 0]}>
      {/* Matriks: gel bening yang mengisi ruang antar sel */}
      <Part id="matriks" color="#DCE8F0" materialPreset="cytoplasm" scale={[1, 0.85, 0.9]} {...p}>
        <sphereGeometry args={[1.9, 28, 22]} />
      </Part>

      {/* Serabut kolagen: tebal, bergelombang, acak arah */}
      {geos.kolagen.map((g, i) => (
        <Part
          key={`col-${i}`}
          id="serabut-kolagen"
          color="#E4DCC8"
          materialPreset="wall"
          rotation={[0, LONGGAR_KOLAGEN_SEEDS[i].ry, (i % 3) * 0.12 - 0.12]}
          {...p}
        >
          <primitive object={g} attach="geometry" />
        </Part>
      ))}

      {/* Serabut elastin: tipis, gelap, bergelombang */}
      {geos.elastin.map((g, i) => (
        <Part
          key={`ela-${i}`}
          id="serabut-elastin"
          color="#C9A05F"
          materialPreset="membrane"
          rotation={[0.1, LONGGAR_ELASTIN_SEEDS[i].ry, (i % 2) * 0.2 - 0.1]}
          {...p}
        >
          <primitive object={g} attach="geometry" />
        </Part>
      ))}

      {/* Fibroblas: sel bercabang penghasil serabut */}
      {FIBROBLAST_POS.map((fp, i) => (
        <group key={`fib-${i}`} position={fp}>
          <Part id="fibroblas" color="#7A9BB5" materialPreset="organelle" scale={[1.5, 0.8, 1]} {...p}>
            <sphereGeometry args={[0.14, 16, 12]} />
          </Part>
          {[0, 1, 2, 3].map((k) => {
            const a = (k / 4) * Math.PI * 2 + i;
            return (
              <Part
                key={`proc-${i}-${k}`}
                id="fibroblas"
                color="#7A9BB5"
                materialPreset="organelle"
                position={[Math.cos(a) * 0.22, Math.sin(a * 1.7) * 0.08, Math.sin(a) * 0.18]}
                rotation={[0, -a, Math.PI / 2 - Math.sin(a) * 0.4]}
                scale={[1, 1, 0.7]}
                {...p}
              >
                <coneGeometry args={[0.045, 0.3, 8]} />
              </Part>
            );
          })}
          <Part id="fibroblas" color="#5C7E97" materialPreset="nucleus" scale={[1.3, 0.9, 1]} {...p}>
            <sphereGeometry args={[0.07, 12, 10]} />
          </Part>
        </group>
      ))}
    </group>
  );
}

/* ==================== JARINGAN IKAT PADAT (TENDON) ==================== */
const PADAT_BUNDLES = Array.from({ length: 11 }, (_, i) => ({
  y: -0.55 + (i % 4) * 0.42,
  z: 0.15 + Math.floor(i / 4) * 0.45,
  seed: 50 + i,
  tilt: (i % 2 === 0 ? 1 : -1) * 0.02,
}));

function PadatTissue({ selected, onSelect }: P) {
  const p = { selected, onSelect };
  const geos = useGeoms(() => ({
    kolagen: PADAT_BUNDLES.map((b) => wavyTube(3.6, 0.065, 0.07, 1.1, b.seed, b.y, b.z)),
    perimysium: [
      tubeFromPoints(
        [
          [-1.8, -0.85, 0.6],
          [0, -0.95, 0.65],
          [1.8, -0.85, 0.6],
        ],
        0.05,
        24
      ),
      tubeFromPoints(
        [
          [-1.8, 1.05, 0.55],
          [0, 1.15, 0.6],
          [1.8, 1.05, 0.55],
        ],
        0.05,
        24
      ),
    ],
  }));

  return (
    <group position={[0, 0.1, 0]}>
      {/* Berkas serabut kolagen rapat sejajar */}
      {geos.kolagen.map((g, i) => (
        <Part
          key={`col-${i}`}
          id="kolagen-rapat"
          color="#D9C9A8"
          materialPreset="wall"
          rotation={[0, 0, PADAT_BUNDLES[i].tilt]}
          {...p}
        >
          <primitive object={g} attach="geometry" />
        </Part>
      ))}

      {/* Fibroblas pipih terjepit di antara berkas */}
      {(
        [
          [-0.6, 0.32, 0.55],
          [0.6, 0.75, 0.28],
          [1.3, 0.3, 0.72],
          [-1.4, 0.72, 0.35],
        ] as [number, number, number][]
      ).map((fp, i) => (
        <Part
          key={`fib-${i}`}
          id="fibroblas"
          color="#8A9BB5"
          materialPreset="nucleus"
          position={fp}
          rotation={[0, (i * 0.5) % Math.PI, 0]}
          scale={[2.2, 0.4, 0.9]}
          {...p}
        >
          <sphereGeometry args={[0.11, 14, 10]} />
        </Part>
      ))}

      {/* Perimisium: pembungkus berkas serabut */}
      {geos.perimysium.map((g, i) => (
        <Part key={`per-${i}`} id="perimisium" color="#B0A088" materialPreset="wall" {...p}>
          <primitive object={g} attach="geometry" />
        </Part>
      ))}
    </group>
  );
}

/* ==================== JARINGAN IKAT ADIPOSA (LEMAK) ==================== */
const ADIPOSA_CELLS: { pos: [number, number, number]; r: number }[] = [
  { pos: [-1.25, 0.35, 0.6], r: 0.5 },
  { pos: [0.05, 0.5, 0.45], r: 0.46 },
  { pos: [1.25, 0.3, 0.6], r: 0.48 },
  { pos: [-0.6, -0.6, 0.55], r: 0.44 },
  { pos: [0.75, -0.65, 0.5], r: 0.47 },
];

function AdiposaTissue({ selected, onSelect }: P) {
  const p = { selected, onSelect };
  return (
    <group position={[0, 0.1, 0]}>
      {ADIPOSA_CELLS.map((c, i) => {
        // Inti terdesak ke tepi sel oleh tetesan lemak besar.
        const na = (i / ADIPOSA_CELLS.length) * Math.PI * 2 + 0.6;
        const nuc: [number, number, number] = [
          Math.cos(na) * c.r * 0.82,
          Math.sin(na) * c.r * 0.82,
          c.r * 0.25,
        ];
        return (
          <group key={`ad-${i}`} position={c.pos}>
            {/* Dinding/sitoplasma sel yang tipis */}
            <Part id="adiposit" color="#F0E0B0" materialPreset="tissue" opacity={0.5} {...p}>
              <sphereGeometry args={[c.r, 26, 20]} />
            </Part>
            {/* Tetesan lemak besar yang mendominasi sel */}
            <Part
              id="droplet-lemak"
              color="#FFF2D0"
              materialPreset="vesicle"
              scale={[1, 0.95, 1]}
              {...p}
            >
              <sphereGeometry args={[c.r * 0.78, 22, 18]} />
            </Part>
            {/* Inti pipih yang terdesak ke tepi (sel bermata satu) */}
            <Part
              id="inti-terdesak"
              color="#8A7050"
              materialPreset="nucleus"
              position={nuc}
              scale={[1.2, 0.55, 1]}
              {...p}
            >
              <sphereGeometry args={[0.085, 14, 10]} />
            </Part>
          </group>
        );
      })}
    </group>
  );
}

/* ==================== JARINGAN TULANG RAWAN (HIALIN) ==================== */
const RAWAN_CELLS: { pos: [number, number, number]; n: number }[] = [
  { pos: [-1.15, 0.5, 0.5], n: 2 },
  { pos: [0.15, 0.7, 0.6], n: 2 },
  { pos: [1.2, -0.3, 0.55], n: 3 },
  { pos: [-0.5, -0.55, 0.5], n: 2 },
];

function RawanTissue({ selected, onSelect }: P) {
  const p = { selected, onSelect };
  return (
    <group position={[0, 0.1, 0]}>
      {/* Matriks kaca (hialin) yang kaku & bening */}
      <Part id="matriks" color="#B8D4E0" materialPreset="cytoplasm" opacity={0.4} {...p}>
        <boxGeometry args={[3.6, 2.4, 1.4]} />
      </Part>

      {RAWAN_CELLS.map((c, i) => (
        <group key={`ch-${i}`} position={c.pos}>
          {/* Lakuna: rongga tempat kondrosit berada */}
          <Part id="lakuna" color="#4A6B8A" materialPreset="membrane" scale={[1.3, 1, 1]} {...p}>
            <sphereGeometry args={[0.24, 18, 14]} />
          </Part>
          {/* Kondrosit berkelompok di dalam lakuna */}
          {Array.from({ length: c.n }, (_, k) => (
            <Part
              key={`cy-${i}-${k}`}
              id="kondrosit"
              color="#7A9BB5"
              materialPreset="organelle"
              position={[(k - (c.n - 1) / 2) * 0.2, Math.sin(k * 2.1 + i) * 0.05, 0.02]}
              scale={[1.1, 0.9, 1]}
              {...p}
            >
              <sphereGeometry args={[0.11, 16, 12]} />
            </Part>
          ))}
          {Array.from({ length: c.n }, (_, k) => (
            <Part
              key={`cn-${i}-${k}`}
              id="kondrosit"
              color="#5C7E97"
              materialPreset="nucleus"
              position={[(k - (c.n - 1) / 2) * 0.2, Math.sin(k * 2.1 + i) * 0.05, 0.06]}
              {...p}
            >
              <sphereGeometry args={[0.045, 10, 8]} />
            </Part>
          ))}
        </group>
      ))}

      {/* Perikondrium: lapisan jaringan ikat di permukaan bawah */}
      <Part id="perikondrium" color="#C9A088" materialPreset="wall" position={[0, -1.25, 0]} {...p}>
        <boxGeometry args={[3.7, 0.16, 1.45]} />
      </Part>
    </group>
  );
}

/* ==================== JARINGAN TULANG KOMPAK (OSTEON) ==================== */
const OSTEOONS: { pos: [number, number, number]; r: number }[] = [
  { pos: [-1.25, 0.45, 0.5], r: 0.55 },
  { pos: [0.25, 0.1, 0.55], r: 0.62 },
  { pos: [1.45, 0.6, 0.45], r: 0.45 },
];

const OSTEOON_ANGLES = [0.32, 2.4, 4.5];

function TulangTissue({ selected, onSelect }: P) {
  const p = { selected, onSelect };
  return (
    <group position={[0, 0.1, 0]}>
      {OSTEOONS.map((o, i) => (
        <group key={`os-${i}`} position={o.pos}>
          {/* Lamela konsentris: silinder berlapis mengelilingi kanal */}
          {[1, 0.75, 0.5].map((f, li) => (
            <Part
              key={`lam-${i}-${li}`}
              id="osteon"
              color={li === 0 ? "#E8D8B8" : "#DCCBA6"}
              materialPreset="wall"
              opacity={li === 2 ? 0.55 : 0.85}
              rotation={[Math.PI / 2, 0, 0]}
              {...p}
            >
              <cylinderGeometry args={[o.r * f, o.r * f, 1.15, 26, 1, true]} />
            </Part>
          ))}
          {/* Cincin lamela tipis */}
          {[0.42, 0.72].map((f) => (
            <Part
              key={`ring-${i}-${f}`}
              id="lamela"
              color="#D4BC8A"
              materialPreset="wall"
              rotation={[Math.PI / 2, 0, 0]}
              {...p}
            >
              <torusGeometry args={[o.r * f, 0.02, 8, 26]} />
            </Part>
          ))}
          {/* Kanal sentral berisi pembuluh darah */}
          <Part
            id="kanal-sentral"
            color="#8A6F5C"
            materialPreset="wall"
            rotation={[Math.PI / 2, 0, 0]}
            {...p}
          >
            <cylinderGeometry args={[o.r * 0.22, o.r * 0.22, 1.2, 18, 1, true]} />
          </Part>
          <Part
            id="kanal-sentral"
            color="#B04A4A"
            materialPreset="membrane"
            position={[0, 0, 0.1]}
            rotation={[Math.PI / 2, 0, 0]}
            {...p}
          >
            <cylinderGeometry args={[o.r * 0.1, o.r * 0.1, 1.24, 12]} />
          </Part>

          {/* Osteosit di dalam lakuna + kanalikulus radiasi */}
          {OSTEOON_ANGLES.map((a, ki) => {
            const rr = o.r * 0.62;
            const lp: [number, number, number] = [Math.cos(a) * rr, Math.sin(a) * rr, 0.25];
            return (
              <group key={`ost-${i}-${ki}`}>
                <Part id="osteosit" color="#5F7A8A" materialPreset="nucleus" position={lp} {...p}>
                  <sphereGeometry args={[0.055, 12, 10]} />
                </Part>
                {[0, 1, 2, 3].map((k) => {
                  const ka = (k / 4) * Math.PI * 2 + a;
                  return (
                    <Part
                      key={`kan-${i}-${ki}-${k}`}
                      id="osteosit"
                      color="#5F7A8A"
                      materialPreset="membrane"
                      position={[lp[0] + Math.cos(ka) * 0.1, lp[1] + Math.sin(ka) * 0.1, lp[2]]}
                      rotation={[Math.PI / 2, 0, ka + Math.PI / 2]}
                      {...p}
                    >
                      <cylinderGeometry args={[0.008, 0.008, 0.22, 6]} />
                    </Part>
                  );
                })}
              </group>
            );
          })}
        </group>
      ))}
    </group>
  );
}

/* ==================== DARAH (JARINGAN IKAT KHUSUS) ==================== */
const RBC_POSITIONS: [number, number, number, number][] = [
  [-1.35, 0.5, 0.6, 0.2],
  [-0.85, 0.15, 0.75, -0.5],
  [-0.35, 0.62, 0.5, 0.9],
  [0.15, 0.25, 0.8, 0.1],
  [0.75, 0.55, 0.55, -0.8],
  [-0.95, -0.35, 0.65, 1.4],
  [-0.3, -0.15, 0.45, 0.4],
  [0.45, -0.3, 0.7, -1.2],
  [1.1, 0.05, 0.5, 0.7],
  [1.35, 0.7, 0.65, -0.3],
];

const WBC_POSITIONS: [number, number, number][] = [
  [0.6, 0.55, 0.7],
  [-0.55, 0.9, 0.35],
];

const PLATELET_POSITIONS: [number, number, number, number][] = [
  [1.5, -0.5, 0.6, 0.3],
  [1.2, -0.15, 0.75, 1.1],
  [1.65, 0.15, 0.45, 2.0],
  [0.9, -0.7, 0.55, 0.8],
  [1.4, -0.85, 0.7, 1.6],
  [0.35, -0.85, 0.4, 2.5],
];

function DarahTissue({ selected, onSelect }: P) {
  const p = { selected, onSelect };
  const geos = useGeoms(() => ({
    // Eritrosit: LatheGeometry profil cekung ganda (biconcave disc).
    eritrosit: (() => {
      const pts: THREE.Vector2[] = [];
      const N = 14;
      for (let i = 0; i <= N; i++) {
        const t = i / N;
        const x = t * 0.24;
        // Profil: tebal di tepi, cekung di tengah.
        const y =
          0.055 * (1 - Math.cos(t * Math.PI)) * 0.5 +
          0.028 * (1 - t * t) -
          0.03 * Math.exp(-((t - 0.9) ** 2) / 0.02);
        pts.push(new THREE.Vector2(Math.max(x, 0.001), y));
      }
      // Lengkapi sisi bawah agar simetris (cekung dua sisi).
      for (let i = N; i >= 0; i--) {
        const v = pts[i];
        pts.push(new THREE.Vector2(v.x, -v.y));
      }
      return new THREE.LatheGeometry(pts, 26);
    })(),
  }));

  return (
    <group position={[0, 0.1, 0]}>
      {/* Plasma: volume cairan tempat sel-sel tersebar */}
      <Part id="plasma" color="#F0E8D8" materialPreset="cytoplasm" scale={[1, 0.85, 0.9]} {...p}>
        <sphereGeometry args={[1.95, 28, 22]} />
      </Part>

      {/* Eritrosit: cakram cekung ganda tanpa inti */}
      {RBC_POSITIONS.map(([x, y, z, rot], i) => (
        <Part
          key={`rbc-${i}`}
          id="eritrosit"
          color="#C94A4A"
          materialPreset="tissue"
          position={[x, y, z]}
          rotation={[Math.PI / 2 + rot * 0.3, rot, rot * 0.5]}
          {...p}
        >
          <primitive object={geos.eritrosit} attach="geometry" />
        </Part>
      ))}

      {/* Leukosit: lebih besar, inti bergellobar */}
      {WBC_POSITIONS.map((lp, i) => (
        <group key={`wbc-${i}`} position={lp}>
          <Part id="leukosit" color="#8A9BC4" materialPreset="organelle" opacity={0.75} {...p}>
            <sphereGeometry args={[0.26, 22, 18]} />
          </Part>
          {(
            [
              [0, 0.03, 0.02],
              [0.08, -0.04, 0.03],
              [-0.07, -0.02, -0.04],
            ] as [number, number, number][]
          ).map((np, k) => (
            <Part
              key={`wbcn-${i}-${k}`}
              id="leukosit"
              color="#5F6FA8"
              materialPreset="nucleus"
              position={np}
              {...p}
            >
              <sphereGeometry args={[0.09, 14, 10]} />
            </Part>
          ))}
        </group>
      ))}

      {/* Trombosit: serpihan kecil tak beraturan */}
      {PLATELET_POSITIONS.map(([x, y, z, r], i) => (
        <Part
          key={`plt-${i}`}
          id="trombosit"
          color="#D98A9A"
          materialPreset="tissue"
          position={[x, y, z]}
          rotation={[r, r * 1.3, r * 0.7]}
          scale={[1.2, 0.55, 0.9]}
          {...p}
        >
          <icosahedronGeometry args={[0.055, 0]} />
        </Part>
      ))}
    </group>
  );
}
