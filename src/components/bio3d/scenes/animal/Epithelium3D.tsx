"use client";

import { Part } from "../../Part";
import type { SceneProps } from "../../types";

/**
 * Jaringan Epitel Hewan — 4 jenis dipilih lewat prop `kind`:
 * pipih selapis, kubus selapis, silindris selapis, pipih berlapis.
 * Bentuk & susunan tiap jenis berbeda nyata sesuai histologi.
 */

export type EpitheliumKind = "pipih" | "kubus" | "silindris" | "berlapis";

type Props = SceneProps & { kind: EpitheliumKind };

const PINK = "#E8BFC6";
const NUCLEUS = "#8A5F72";

/** Sel epitel pipih: posisi sel heksagon pipih di atas membran basal. */
const PIPEH_CELLS = [-1.3, -0.65, 0, 0.65, 1.3].map((x, i) => ({
  x,
  rz: (i % 2 === 0 ? -1 : 1) * 0.06,
}));

/** Sel epitel kubus. */
const KUBUS_CELLS = [-1.1, -0.55, 0, 0.55, 1.1];

/** Kolom epitel silindris + posisi mikrovili di permukaan atas. */
const SILINDRIS_COLS = [-1.0, -0.5, 0, 0.5, 1.0];
const MIKROVILI = SILINDRIS_COLS.flatMap((cx) =>
  [-0.16, -0.08, 0, 0.08, 0.16].map((dz) => ({
    pos: [cx, 1.16, 0.65 + dz] as [number, number, number],
  }))
);

/** Lapisan epitel pipih berlapis. */
const BERLAPIS_LAYERS = {
  basal: [-1.05, -0.7, -0.35, 0, 0.35, 0.7, 1.05].map((x) => ({ x, y: -0.95 })),
  middle: [
    { x: -1.0, y: -0.35 },
    { x: -0.35, y: -0.3 },
    { x: 0.35, y: -0.34 },
    { x: 1.0, y: -0.32 },
    { x: -0.7, y: 0.25 },
    { x: 0, y: 0.3 },
    { x: 0.7, y: 0.27 },
  ],
  surface: [
    { x: -0.95, y: 0.85, rz: -0.12 },
    { x: -0.2, y: 0.95, rz: 0.08 },
    { x: 0.6, y: 0.88, rz: -0.05 },
    { x: 1.15, y: 1.05, rz: 0.3 },
  ],
};

export default function Epithelium3D({ selected, onSelect, kind }: Props) {
  const p = { selected, onSelect };

  /* ---------- Epitel pipih selapis ---------- */
  if (kind === "pipih") {
    return (
      <group>
        {PIPEH_CELLS.map((c, i) => (
          <group key={`pipih-${i}`} position={[c.x, 0.05, 0.5]}>
            {/* Sel pipih seperti ubin */}
            <Part id="sel-epitel" color={PINK} materialPreset="tissue" rotation={[0, c.rz, 0]} {...p}>
              <sphereGeometry args={[0.34, 22, 14]} />
            </Part>
            {/* Inti pipih menonjol ke arah rongga */}
            <Part
              id="inti-sel"
              color={NUCLEUS}
              materialPreset="nucleus"
              position={[0, 0.09, 0]}
              scale={[1, 0.5, 1]}
              {...p}
            >
              <sphereGeometry args={[0.13, 16, 12]} />
            </Part>
          </group>
        ))}
        {/* Membran basal */}
        <Part
          id="membran-basal"
          color="#C9A0A8"
          materialPreset="membrane"
          position={[0, -0.42, 0.45]}
          {...p}
        >
          <boxGeometry args={[3.4, 0.14, 1.3]} />
        </Part>
      </group>
    );
  }

  /* ---------- Epitel kubus selapis ---------- */
  if (kind === "kubus") {
    return (
      <group>
        {KUBUS_CELLS.map((x, i) => (
          <group key={`kub-${i}`} position={[x, 0.2, 0.6]}>
            {/* Sel kubus */}
            <Part id="sel-kubus" color={PINK} materialPreset="tissue" {...p}>
              <boxGeometry args={[0.5, 0.5, 0.5]} />
            </Part>
            {/* Inti bulat di tengah sel */}
            <Part id="inti-sel" color={NUCLEUS} materialPreset="nucleus" {...p}>
              <sphereGeometry args={[0.17, 18, 14]} />
            </Part>
          </group>
        ))}
        {/* Membran basal */}
        <Part
          id="membran-basal"
          color="#C9A0A8"
          materialPreset="membrane"
          position={[0, -0.62, 0.55]}
          {...p}
        >
          <boxGeometry args={[3.0, 0.14, 1.3]} />
        </Part>
      </group>
    );
  }

  /* ---------- Epitel silindris selapis ---------- */
  if (kind === "silindris") {
    return (
      <group>
        {SILINDRIS_COLS.map((x, i) => (
          <group key={`sil-${i}`} position={[x, 0.45, 0.65]}>
            {/* Sel tinggi seperti tiang */}
            <Part id="sel-silindris" color={PINK} materialPreset="tissue" {...p}>
              <boxGeometry args={[0.42, 1.2, 0.46]} />
            </Part>
            {/* Inti di bagian bawah (basal) */}
            <Part
              id="inti-basal"
              color={NUCLEUS}
              materialPreset="nucleus"
              position={[0, -0.38, 0]}
              scale={[1, 0.9, 1]}
              {...p}
            >
              <sphereGeometry args={[0.14, 16, 12]} />
            </Part>
          </group>
        ))}

        {/* Sel goblet berbentuk cawan di antara sel silindris */}
        {[-0.75, 0.75].map((x, i) => (
          <group key={`gob-${i}`} position={[x, 0.5, 0.65]}>
            <Part id="sel-goblet" color="#B7D8E8" materialPreset="vesicle" scale={[1, 1.4, 1]} {...p}>
              <sphereGeometry args={[0.17, 18, 14]} />
            </Part>
            <Part
              id="sel-goblet"
              color="#9CC0D6"
              materialPreset="tissue"
              position={[0, -0.32, 0]}
              scale={[0.5, 1, 0.5]}
              {...p}
            >
              <sphereGeometry args={[0.15, 14, 10]} />
            </Part>
          </group>
        ))}

        {/* Mikrovili (brush border) */}
        {MIKROVILI.map((mv, i) => (
          <Part
            key={`mv-${i}`}
            id="mikrovili"
            color="#D98A9A"
            materialPreset="organelle"
            position={mv.pos}
            {...p}
          >
            <cylinderGeometry args={[0.018, 0.022, 0.16, 8]} />
          </Part>
        ))}

        {/* Membran basal */}
        <Part
          id="membran-basal"
          color="#C9A0A8"
          materialPreset="membrane"
          position={[0, -0.62, 0.6]}
          {...p}
        >
          <boxGeometry args={[2.9, 0.14, 1.3]} />
        </Part>
      </group>
    );
  }

  /* ---------- Epitel pipih berlapis (stratified) ---------- */
  return (
    <group>
      {/* Lapisan basal: sel kubus kecil yang terus membelah */}
      {BERLAPIS_LAYERS.basal.map((c, i) => (
        <group key={`bas-${i}`} position={[c.x, c.y, 0.5]}>
          <Part id="lapisan-basal" color="#B0708A" materialPreset="tissue" {...p}>
            <boxGeometry args={[0.3, 0.32, 0.42]} />
          </Part>
          <Part
            id="lapisan-basal"
            color="#7A4660"
            materialPreset="nucleus"
            position={[0, 0, 0.02]}
            {...p}
          >
            <sphereGeometry args={[0.1, 12, 10]} />
          </Part>
        </group>
      ))}

      {/* Lapisan tengah: sel polihedral lebih besar */}
      {BERLAPIS_LAYERS.middle.map((c, i) => (
        <group key={`mid-${i}`} position={[c.x, c.y, 0.55]}>
          <Part
            id="lapisan-tengah"
            color="#D89AA6"
            materialPreset="tissue"
            scale={[1.15, 1, 1.05]}
            {...p}
          >
            <sphereGeometry args={[0.26, 18, 14]} />
          </Part>
          <Part
            id="lapisan-tengah"
            color="#9A6272"
            materialPreset="nucleus"
            position={[0, 0, 0.03]}
            {...p}
          >
            <sphereGeometry args={[0.09, 12, 10]} />
          </Part>
        </group>
      ))}

      {/* Lapisan permukaan: sel pipih sebagian sudah mati & mengelupas */}
      {BERLAPIS_LAYERS.surface.map((c, i) => (
        <Part
          key={`surf-${i}`}
          id="lapisan-permukaan"
          color="#F0C8CE"
          materialPreset="tissue"
          position={[c.x, c.y, 0.55]}
          rotation={[0, 0, c.rz]}
          scale={[1.3, 0.28, 1.15]}
          {...p}
        >
          <sphereGeometry args={[0.28, 18, 12]} />
        </Part>
      ))}

      {/* Membran basal */}
      <Part
        id="membran-basal"
        color="#9A5F72"
        materialPreset="membrane"
        position={[0, -1.35, 0.5]}
        {...p}
      >
        <boxGeometry args={[2.8, 0.14, 1.2]} />
      </Part>
    </group>
  );
}
