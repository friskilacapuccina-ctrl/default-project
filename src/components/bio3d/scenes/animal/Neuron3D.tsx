"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { Part } from "../../Part";
import type { SceneProps } from "../../types";
import { useGeoms, tubeFromPoints } from "../tissueUtils";

/**
 * Jaringan Saraf (Neuron).
 * Badan sel dengan inti, dendrit bercabang, akson panjang berselubung
 * mielin bersegmen dengan nodus ranvier, hingga terminal akson bercabang
 * yang berujung bouton.
 */

const SOMA: [number, number, number] = [-1.7, 0, 0.2];
const AXON_Y = -0.22;
const AXON_Z = 0.15;
const AXON_X0 = -1.25;
const AXON_X1 = 2.7;

/** Dendrit: kurva bercabang dari badan sel ke arah kiri-atas. */
const DENDRITE_CURVES: [number, number, number][][] = [
  [
    [-1.95, 0.2, 0.25],
    [-2.3, 0.55, 0.3],
    [-2.6, 0.85, 0.32],
    [-2.8, 1.15, 0.3],
  ],
  [
    [-2.05, 0.1, 0.15],
    [-2.45, 0.3, 0.1],
    [-2.75, 0.45, 0.05],
  ],
  [
    [-1.85, -0.25, 0.3],
    [-2.2, -0.55, 0.4],
    [-2.5, -0.75, 0.45],
  ],
  [
    [-1.8, 0.3, 0.05],
    [-2.0, 0.65, -0.2],
    [-2.2, 0.95, -0.4],
  ],
  [
    [-1.75, -0.05, -0.15],
    [-2.05, -0.2, -0.45],
    [-2.35, -0.25, -0.7],
  ],
];

/** Cabang halus dendrit (radius menyempit ke ujung). */
const DENDRITE_TWIGS: [number, number, number][][] = [
  [
    [-2.6, 0.85, 0.32],
    [-2.75, 0.8, 0.55],
    [-2.9, 0.85, 0.7],
  ],
  [
    [-2.45, 0.3, 0.1],
    [-2.6, 0.15, 0.25],
    [-2.75, 0.1, 0.4],
  ],
  [
    [-2.2, 0.95, -0.4],
    [-2.05, 1.15, -0.55],
    [-1.95, 1.3, -0.7],
  ],
];

/** Segmen selubung mielin pada akson (jarak antar segmen = nodus ranvier). */
const MYELIN_SEGS = [-0.5, 0.45, 1.4, 2.35];

/** Terminal akson: cabang yang berujung bouton. */
const TERMINAL_CURVES: [number, number, number][][] = [
  [
    [AXON_X1, AXON_Y, AXON_Z],
    [2.95, 0.1, 0.15],
    [3.05, 0.45, 0.2],
    [2.95, 0.7, 0.25],
  ],
  [
    [AXON_X1, AXON_Y, AXON_Z],
    [3.05, 0.0, 0.0],
    [3.25, 0.25, -0.1],
  ],
  [
    [AXON_X1, AXON_Y, AXON_Z],
    [2.85, 0.05, 0.35],
    [2.7, 0.4, 0.55],
    [2.65, 0.65, 0.65],
  ],
];

export default function Neuron3D({ selected, onSelect }: SceneProps) {
  const p = { selected, onSelect };

  const geos = useGeoms(() => ({
    soma: (() => {
      const g = new THREE.SphereGeometry(0.42, 40, 30);
      const pos = g.attributes.position;
      const v = new THREE.Vector3();
      for (let i = 0; i < pos.count; i++) {
        v.fromBufferAttribute(pos, i);
        const n =
          Math.sin(v.x * 4.1) * Math.cos(v.y * 3.6) * Math.sin(v.z * 3.9) * 0.06 +
          Math.sin(v.y * 7.2 + 1.3) * 0.03;
        const s = 1 + n;
        pos.setXYZ(i, v.x * s, v.y * s, v.z * s);
      }
      g.computeVertexNormals();
      return g;
    })(),
    dendrites: DENDRITE_CURVES.map((c) => tubeFromPoints(c, 0.055, 40)),
    twigs: DENDRITE_TWIGS.map((c) => tubeFromPoints(c, 0.028, 28)),
    terminals: TERMINAL_CURVES.map((c) => tubeFromPoints(c, 0.04, 32)),
    axonHillock: (() => {
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-1.45, 0, 0.2),
        new THREE.Vector3(-1.35, -0.1, 0.18),
        new THREE.Vector3(AXON_X0, AXON_Y, AXON_Z),
      ]);
      return new THREE.TubeGeometry(curve, 20, 0.055, 10, false);
    })(),
    axon: (() => {
      const g = new THREE.CylinderGeometry(0.055, 0.055, AXON_X1 - AXON_X0, 14);
      g.rotateZ(Math.PI / 2);
      g.translate((AXON_X0 + AXON_X1) / 2, AXON_Y, AXON_Z);
      return g;
    })(),
  }));

  return (
    <group>
      {/* ===== BADAN SEL (soma) + inti ===== */}
      <Part id="badan-sel" color="#7A9BB5" materialPreset="organelle" position={SOMA} {...p}>
        <primitive object={geos.soma} attach="geometry" />
      </Part>
      <Part
        id="badan-sel"
        color="#5C7E97"
        materialPreset="nucleus"
        position={[SOMA[0], SOMA[1], SOMA[2]]}
        {...p}
      >
        <sphereGeometry args={[0.19, 22, 18]} />
      </Part>

      {/* ===== DENDRIT: prosesus bercabang pendek ===== */}
      {geos.dendrites.map((g, i) => (
        <Part key={`den-${i}`} id="dendrit" color="#8FAFC4" materialPreset="organelle" {...p}>
          <primitive object={g} attach="geometry" />
        </Part>
      ))}
      {geos.twigs.map((g, i) => (
        <Part key={`twig-${i}`} id="dendrit" color="#A3C0D2" materialPreset="organelle" {...p}>
          <primitive object={g} attach="geometry" />
        </Part>
      ))}

      {/* ===== AKSON + tonjolan akson (hillock) ===== */}
      <Part id="akson" color="#5F87A3" materialPreset="organelle" {...p}>
        <primitive object={geos.axonHillock} attach="geometry" />
      </Part>
      <Part id="akson" color="#5F87A3" materialPreset="organelle" {...p}>
        <primitive object={geos.axon} attach="geometry" />
      </Part>

      {/* ===== SELUBUNG MIELIN: segmen berlemak yang membungkus akson ===== */}
      {MYELIN_SEGS.map((mx, i) => (
        <Part
          key={`my-${i}`}
          id="selubung-mielin"
          color="#E4DCC8"
          materialPreset="tissue"
          position={[mx, AXON_Y, AXON_Z]}
          rotation={[0, 0, Math.PI / 2]}
          scale={[1, 1, 1.15]}
          {...p}
        >
          <capsuleGeometry args={[0.15, 0.62, 6, 16]} />
        </Part>
      ))}

      {/* ===== NODUS RANVIER: celah terekspos antar segmen mielin ===== */}
      {[-0.03, 0.92, 1.87].map((nx, i) => (
        <Part
          key={`nr-${i}`}
          id="nodus-ranvier"
          color="#4A6B8A"
          materialPreset="membrane"
          position={[nx, AXON_Y, AXON_Z]}
          rotation={[0, 0, Math.PI / 2]}
          {...p}
        >
          <torusGeometry args={[0.07, 0.022, 8, 16]} />
        </Part>
      ))}

      {/* ===== TERMINAL AKSON: cabang berujung bouton ===== */}
      {geos.terminals.map((g, i) => (
        <Part key={`term-${i}`} id="terminal-akson" color="#3D5A75" materialPreset="organelle" {...p}>
          <primitive object={g} attach="geometry" />
        </Part>
      ))}
      {[
        [2.95, 0.7, 0.25],
        [3.25, 0.25, -0.1],
        [2.65, 0.65, 0.65],
        [3.05, 0.45, 0.2],
      ].map((bp, i) => (
        <Part
          key={`bouton-${i}`}
          id="terminal-akson"
          color="#3D5A75"
          materialPreset="organelle"
          position={bp as [number, number, number]}
          {...p}
        >
          <sphereGeometry args={[0.075, 14, 12]} />
        </Part>
      ))}
    </group>
  );
}
