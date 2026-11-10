"use client";

import * as THREE from "three";
import { Part } from "../../Part";
import type { SceneProps } from "../../types";
import { useGeoms } from "../tissueUtils";

/**
 * Jaringan Otot Hewan — 3 jenis dipilih lewat prop `kind`:
 * rangka (silindris berlurik, inti multipel di tepi),
 * polos (gelendong, tanpa lurik, inti sentral),
 * jantung (bercabang, berlurik, diskus interkalaris).
 * Seluruh data statis berada di konstanta modul agar tidak ada hooks
 * yang dipanggil secara kondisional.
 */

export type MuscleKind = "rangka" | "polos" | "jantung";

type Props = SceneProps & { kind: MuscleKind };

const FIBER = "#C0787A";
const STRIATION = "#8A4A52";

/* ====================== DATA STATIS: OTOT RANGKA ====================== */
const RANGKA_FIBERS = [
  { y: 0.5, z: 0.2, len: 3.4 },
  { y: 0.1, z: 0.65, len: 3.1 },
  { y: -0.3, z: 0.15, len: 3.5 },
];

const RANGKA_DETAILS = RANGKA_FIBERS.flatMap((f, fi) => {
  const striations = [-1.3, -1.0, -0.7, -0.4, -0.1, 0.2, 0.5, 0.8, 1.1, 1.4].map((x) => ({
    pos: [x, f.y, f.z] as [number, number, number],
    k: `s${fi}-${x}`,
    isNuc: false,
  }));
  const nuclei = [-1.15, -0.55, 0.05, 0.65, 1.25].map((x, ni) => ({
    pos: [x, f.y + 0.13, f.z + (ni % 2 === 0 ? 0.08 : -0.08)] as [number, number, number],
    k: `n${fi}-${x}`,
    isNuc: true,
  }));
  return [...striations, ...nuclei];
});

const TENDON_STRANDS = [-0.42, -0.18, 0.06, 0.3, 0.54];

/* ====================== DATA STATIS: OTOT POLOS ====================== */
const POLOS_CELLS = [
  { x: -0.9, y: 0.55, z: 0.3, rz: 0.1 },
  { x: 0.7, y: 0.5, z: 0.6, rz: -0.08 },
  { x: -0.4, y: 0.0, z: 0.55, rz: 0.05 },
  { x: 1.1, y: -0.05, z: 0.3, rz: 0.12 },
  { x: -1.15, y: -0.5, z: 0.45, rz: -0.1 },
  { x: 0.5, y: -0.55, z: 0.65, rz: 0.07 },
];

const POLOS_BINDERS = [-0.75, -0.25, 0.25, 0.75];

/* ====================== DATA STATIS: OTOT JANTUNG ====================== */
const JANTUNG_FIBERS = [
  { y: 0.5, z: 0.3, len: 3.0 },
  { y: -0.05, z: 0.5, len: 3.2 },
];

const JANTUNG_STRIATIONS = [-1.1, -0.7, -0.3, 0.1, 0.5, 0.9];
const JANTUNG_NUCLEI = [-0.6, 0.3];

const JANTUNG_BRANCHES: [number, number, number][][] = [
  [
    [-0.2, 0.5, 0.3],
    [0.15, 0.25, 0.45],
    [0.5, -0.05, 0.5],
  ],
  [
    [0.9, -0.05, 0.5],
    [1.15, 0.2, 0.4],
    [1.4, 0.45, 0.3],
  ],
  [
    [-1.2, -0.1, 0.55],
    [-0.95, 0.15, 0.45],
    [-0.7, 0.45, 0.35],
  ],
];

export default function MuscleTissue3D({ selected, onSelect, kind }: Props) {
  const p = { selected, onSelect };

  /* ---------- Otot rangka: serabut silindris panjang berlurik ---------- */
  if (kind === "rangka") {
    return (
      <group position={[0, 0.15, 0]}>
        {RANGKA_FIBERS.map((f, i) => (
          <Part
            key={`fib-${i}`}
            id="serabut-otot"
            color={FIBER}
            materialPreset="tissue"
            position={[0, f.y, f.z]}
            rotation={[0, 0, Math.PI / 2]}
            {...p}
          >
            <cylinderGeometry args={[0.17, 0.17, f.len, 20]} />
          </Part>
        ))}
        {RANGKA_DETAILS.map((d) =>
          d.isNuc ? (
            <Part
              key={d.k}
              id="inti-multipel"
              color={STRIATION}
              materialPreset="nucleus"
              position={d.pos}
              scale={[1, 0.55, 0.9]}
              {...p}
            >
              <sphereGeometry args={[0.08, 12, 10]} />
            </Part>
          ) : (
            <Part
              key={d.k}
              id="serabut-otot"
              color={STRIATION}
              materialPreset="tissue"
              position={d.pos}
              rotation={[0, 0, Math.PI / 2]}
              {...p}
            >
              <torusGeometry args={[0.172, 0.016, 8, 20]} />
            </Part>
          )
        )}
        {/* Tendon: berkas kolagen sejajar yang menghubungkan otot ke tulang */}
        {TENDON_STRANDS.map((y, i) => (
          <Part
            key={`tend-${i}`}
            id="tendon"
            color="#D9C9A8"
            materialPreset="wall"
            position={[2.15, y, 0.4]}
            rotation={[0, 0, Math.PI / 2]}
            {...p}
          >
            <cylinderGeometry args={[0.035, 0.028, 1.4, 10]} />
          </Part>
        ))}
      </group>
    );
  }

  /* ---------- Otot polos: sel gelendong, inti sentral, tanpa lurik ---------- */
  if (kind === "polos") {
    return (
      <group position={[0, 0.1, 0]}>
        {POLOS_CELLS.map((c, i) => (
          <group key={`sp-${i}`} position={[c.x, c.y, c.z]} rotation={[0, 0, c.rz]}>
            {/* Badan sel gelendong (fusiform) */}
            <Part
              id="sel-gelendong"
              color={FIBER}
              materialPreset="tissue"
              scale={[1.9, 0.45, 0.45]}
              {...p}
            >
              <sphereGeometry args={[0.32, 20, 14]} />
            </Part>
            {/* Ujung runcing khas gelendong */}
            {[-1, 1].map((s) => (
              <Part
                key={`tip-${s}`}
                id="sel-gelendong"
                color={FIBER}
                materialPreset="tissue"
                position={[s * 0.62, 0, 0]}
                rotation={[0, 0, (s * Math.PI) / 2]}
                scale={[0.5, 1, 0.5]}
                {...p}
              >
                <coneGeometry args={[0.14, 0.34, 12]} />
              </Part>
            ))}
            {/* Satu inti di tengah sel */}
            <Part
              id="inti-sentral"
              color={STRIATION}
              materialPreset="nucleus"
              scale={[1.4, 1, 1]}
              {...p}
            >
              <sphereGeometry args={[0.11, 14, 12]} />
            </Part>
          </group>
        ))}
        {/* Serat pengikat (endomisium) di sekeliling berkas sel */}
        {POLOS_BINDERS.map((y, i) => (
          <Part
            key={`bind-${i}`}
            id="serat-pengikat"
            color="#D9C9A8"
            materialPreset="wall"
            position={[0, y - 0.05, 0.15]}
            rotation={[0, 0, Math.PI / 2]}
            {...p}
          >
            <cylinderGeometry args={[0.022, 0.022, 3.2, 8]} />
          </Part>
        ))}
      </group>
    );
  }

  /* ---------- Otot jantung: serabut bercabang + diskus interkalaris ---------- */
  return (
    <group position={[0, 0.15, 0]}>
      {/* Serabut utama berlurik */}
      {JANTUNG_FIBERS.map((f, i) => (
        <group key={`jf-${i}`}>
          <Part
            id="serabut-bercabang"
            color="#C46A6A"
            materialPreset="tissue"
            position={[0, f.y, f.z]}
            rotation={[0, 0, Math.PI / 2]}
            {...p}
          >
            <cylinderGeometry args={[0.16, 0.16, f.len, 18]} />
          </Part>
          {/* Lurik melintang halus */}
          {JANTUNG_STRIATIONS.map((x) => (
            <Part
              key={`js-${i}-${x}`}
              id="serabut-bercabang"
              color={STRIATION}
              materialPreset="tissue"
              position={[x, f.y, f.z]}
              rotation={[0, 0, Math.PI / 2]}
              {...p}
            >
              <torusGeometry args={[0.162, 0.014, 8, 18]} />
            </Part>
          ))}
          {/* Inti sentral di tengah serabut */}
          {JANTUNG_NUCLEI.map((x) => (
            <Part
              key={`jn-${i}-${x}`}
              id="inti-sentral"
              color={STRIATION}
              materialPreset="nucleus"
              position={[x, f.y, f.z]}
              scale={[1.3, 1, 1]}
              {...p}
            >
              <sphereGeometry args={[0.1, 14, 10]} />
            </Part>
          ))}
        </group>
      ))}

      {/* Cabang-cabang penghubung antar serabut + diskus interkalaris */}
      {JANTUNG_BRANCHES.map((pts, i) => {
        const mid = pts[Math.floor(pts.length / 2)];
        return (
          <group key={`br-${i}`}>
            <BranchTube id="serabut-bercabang" color="#C46A6A" points={pts} {...p} />
            {/* Diskus interkalaris di titik sambungan */}
            <Part
              id="diskus-interkalaris"
              color="#7A3A3C"
              materialPreset="tissue"
              position={mid}
              rotation={[Math.PI / 2, 0, 0]}
              scale={[1, 1, 0.6]}
              {...p}
            >
              <torusGeometry args={[0.09, 0.03, 8, 16]} />
            </Part>
          </group>
        );
      })}
    </group>
  );
}

/** Tabung melengkung mengikuti daftar titik (untuk serabut bercabang). */
function BranchTube({
  id,
  color,
  points,
  selected,
  onSelect,
}: {
  id: string;
  color: string;
  points: [number, number, number][];
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  const { geo } = useGeoms(() => ({
    geo: (() => {
      const curve = new THREE.CatmullRomCurve3(
        points.map((q) => new THREE.Vector3(q[0], q[1], q[2]))
      );
      return new THREE.TubeGeometry(curve, 32, 0.085, 10, false);
    })(),
  }));
  return (
    <Part id={id} color={color} materialPreset="tissue" selected={selected} onSelect={onSelect}>
      <primitive object={geo} attach="geometry" />
    </Part>
  );
}
