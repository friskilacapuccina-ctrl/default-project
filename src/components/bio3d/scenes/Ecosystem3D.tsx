"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Part } from "../Part";
import type { SceneProps } from "../types";

type Vec3 = [number, number, number];
type PartPicker = { selected: string | null; onSelect: (id: string) => void };

/** Tabung dengan radius bervariasi (batang, tubuh, antena). */
function sweep(points: Vec3[], radiusAt: (t: number) => number, radial = 8, tubular = 24) {
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

/**
 * Helai daun padi: pita melengkung dari kuadratik (naik lalu menjuntai)
 * dengan lebar melebar di tengah dan meruncing di ujung.
 */
function bladeGeometry(len: number, width: number, lift: number, droop: number) {
  const segs = 14;
  const curve = new THREE.CubicBezierCurve3(
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(len * 0.18, lift, 0),
    new THREE.Vector3(len * 0.6, lift + droop, 0),
    new THREE.Vector3(len, lift + droop * 1.5, 0)
  );
  const pos: number[] = [];
  const idx: number[] = [];
  for (let i = 0; i <= segs; i++) {
    const t = i / segs;
    const c = curve.getPoint(t);
    const w = width * Math.pow(Math.sin(Math.min(1, 0.18 + t * 0.85) * Math.PI), 0.6) * (1 - 0.25 * t);
    pos.push(c.x, c.y, -w / 2, c.x, c.y, w / 2);
  }
  for (let i = 0; i < segs; i++) {
    const a = i * 2;
    idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
  }
  const geo = new THREE.BufferGeometry();
  geo.setIndex(idx);
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.computeVertexNormals();
  return geo;
}

/** Sayap burung: pita melebar di pangkal, meruncing ke ujung dengan busur. */
function wingGeometry(dirSign: number) {
  const segs = 16;
  const curve = new THREE.CubicBezierCurve3(
    new THREE.Vector3(0, 0, 0.1),
    new THREE.Vector3(dirSign * 0.4, 0.1, 0.14),
    new THREE.Vector3(dirSign * 0.8, 0.07, 0.02),
    new THREE.Vector3(dirSign * 1.1, -0.04, -0.22)
  );
  const pos: number[] = [];
  const idx: number[] = [];
  const T = new THREE.Vector3();
  const side = new THREE.Vector3();
  const up = new THREE.Vector3(0, 1, 0);
  for (let i = 0; i <= segs; i++) {
    const t = i / segs;
    const c = curve.getPoint(t);
    curve.getTangent(t, T);
    side.crossVectors(T, up).normalize();
    const chord = 0.34 * Math.pow(1 - t, 0.65) + 0.07;
    pos.push(
      c.x - side.x * chord * 0.5,
      c.y - side.y * chord * 0.5,
      c.z - side.z * chord * 0.5,
      c.x + side.x * chord * 0.5,
      c.y + side.y * chord * 0.5,
      c.z + side.z * chord * 0.5
    );
  }
  for (let i = 0; i < segs; i++) {
    const a = i * 2;
    idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
  }
  const geo = new THREE.BufferGeometry();
  geo.setIndex(idx);
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.computeVertexNormals();
  return geo;
}

/** Panah perpindahan energi (dimakan → memakan); ujung tidak menutupi objek. */
function FlowArrow({ from, to, color = "#C98A3F" }: { from: Vec3; to: Vec3; color?: string }) {
  const { shaftPos, shaftLen, tipPos, quat } = useMemo(() => {
    const a = new THREE.Vector3(...from);
    const b = new THREE.Vector3(...to);
    const dir = b.clone().sub(a);
    const len = dir.length();
    const d = dir.clone().normalize();
    const margin = Math.min(0.34, len * 0.3);
    const shaftLen = Math.max(0.05, len - margin * 2);
    const shaftCenter = a.clone().add(d.clone().multiplyScalar(margin + shaftLen / 2));
    const tipCenter = b.clone().sub(d.clone().multiplyScalar(margin * 0.6));
    const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d);
    return {
      shaftPos: shaftCenter.toArray() as Vec3,
      shaftLen,
      tipPos: tipCenter.toArray() as Vec3,
      quat,
    };
  }, [from, to]);

  return (
    <group>
      <mesh position={shaftPos} quaternion={quat}>
        <cylinderGeometry args={[0.028, 0.028, shaftLen, 8]} />
        <meshStandardMaterial color={color} roughness={0.5} emissive={color} emissiveIntensity={0.2} />
      </mesh>
      <mesh position={tipPos} quaternion={quat}>
        <coneGeometry args={[0.09, 0.22, 10]} />
        <meshStandardMaterial color={color} roughness={0.45} emissive={color} emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
}

/** Rumpun padi tinggi (produsen) — batang, daun melengkung, malai berbutir. */
function PadiPlant({ position, p }: { position: Vec3; p: PartPicker }) {
  const g = useMemo(() => {
    const stalks = [
      sweep([[0, 0, 0], [0.04, 0.7, 0.02], [0.1, 1.4, 0.03], [0.14, 1.95, 0]], (t) => 0.034 - 0.013 * t, 8, 20).geo,
      sweep(
        [[-0.14, 0, 0.06], [-0.12, 0.6, 0.05], [-0.07, 1.2, 0.04], [-0.03, 1.68, 0.02]],
        (t) => 0.03 - 0.011 * t,
        8,
        20
      ).geo,
      sweep(
        [[0.16, 0, -0.07], [0.18, 0.55, -0.05], [0.22, 1.1, -0.04], [0.26, 1.5, -0.03]],
        (t) => 0.03 - 0.011 * t,
        8,
        20
      ).geo,
    ];
    return {
      stalks,
      blade: bladeGeometry(1.15, 0.17, 0.5, 0.32),
      blade2: bladeGeometry(0.85, 0.13, 0.42, 0.28),
      malai: sweep(
        [[0.14, 1.95, 0], [0.3, 1.82, 0.02], [0.42, 1.6, 0.04], [0.46, 1.36, 0.05]],
        () => 0.016,
        8,
        18
      ).geo,
    };
  }, []);

  // Posisi butiran padi di sepanjang malai yang menjuntai
  const butir = useMemo(() => {
    const c = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.14, 1.95, 0),
      new THREE.Vector3(0.3, 1.82, 0.02),
      new THREE.Vector3(0.42, 1.6, 0.04),
      new THREE.Vector3(0.46, 1.36, 0.05),
    ]);
    const out: Vec3[] = [];
    for (let i = 1; i <= 8; i++) {
      const pt = c.getPoint(i / 9);
      out.push([pt.x + (i % 2 ? 0.055 : -0.055), pt.y - 0.03, pt.z + ((i % 3) - 1) * 0.045]);
    }
    return out;
  }, []);

  useEffect(
    () => () => {
      g.stalks.forEach((geo) => geo.dispose());
      g.blade.dispose();
      g.blade2.dispose();
      g.malai.dispose();
    },
    [g]
  );

  const daun = [
    { yaw: 0.4, pitch: 0.18, y: 0.55, geo: g.blade },
    { yaw: 1.5, pitch: -0.08, y: 0.85, geo: g.blade },
    { yaw: 2.6, pitch: 0.22, y: 1.1, geo: g.blade },
    { yaw: 3.7, pitch: -0.05, y: 1.35, geo: g.blade2 },
    { yaw: 4.8, pitch: 0.26, y: 1.6, geo: g.blade2 },
    { yaw: 5.7, pitch: 0.02, y: 0.7, geo: g.blade2 },
  ];

  return (
    <group position={position}>
      {/* Batang-batang tegak */}
      {g.stalks.map((geo, i) => (
        <Part key={`st${i}`} id="padi" color={i === 0 ? "#3A8077" : "#2F665F"} materialPreset="organelle" {...p}>
          <primitive object={geo} attach="geometry" />
        </Part>
      ))}
      {/* Daun panjang melengkung */}
      {daun.map((L, i) => (
        <Part
          key={`dn${i}`}
          id="padi"
          color={i % 2 ? "#3A8077" : "#48A89A"}
          materialPreset="organelle"
          side={THREE.DoubleSide}
          {...p}
          position={[0, L.y, 0]}
          rotation={[0, L.yaw, L.pitch]}
        >
          <primitive object={L.geo} attach="geometry" />
        </Part>
      ))}
      {/* Malai padi menjuntai */}
      <Part id="padi" color="#7A9A5F" materialPreset="organelle" {...p}>
        <primitive object={g.malai} attach="geometry" />
      </Part>
      {/* Butiran padi */}
      {butir.map((pos, i) => (
        <Part
          key={`bt${i}`}
          id="padi"
          color={i % 2 ? "#C9B45F" : "#B8A24E"}
          materialPreset="organelle"
          {...p}
          position={pos}
          rotation={[0, 0, 0.7]}
          scale={[0.55, 1, 0.55]}
        >
          <sphereGeometry args={[0.042, 8, 8]} />
        </Part>
      ))}
    </group>
  );
}

/** Rumpun padi kecil (produsen tambahan di sawah). */
function RiceClump({ position, p }: { position: Vec3; p: PartPicker }) {
  const g = useMemo(
    () => ({
      blades: [bladeGeometry(0.72, 0.1, 0.3, 0.2), bladeGeometry(0.55, 0.08, 0.26, 0.18)],
      malai: sweep([[0, 0.52, 0], [0.07, 0.46, 0.02], [0.12, 0.36, 0.04]], () => 0.013, 6, 12).geo,
    }),
    []
  );

  useEffect(
    () => () => {
      g.blades.forEach((geo) => geo.dispose());
      g.malai.dispose();
    },
    [g]
  );

  return (
    <group position={position}>
      {[0, 1, 1.2, 2.4, 3.5, 4.6].map((yaw, i) => (
        <Part
          key={`rb${i}`}
          id="padi"
          color={i % 2 ? "#3A8077" : "#48A89A"}
          materialPreset="organelle"
          side={THREE.DoubleSide}
          {...p}
          position={[0, 0.06 * (i % 3), 0]}
          rotation={[0, yaw, 0.12 + (i % 2) * 0.16]}
        >
          <primitive object={g.blades[i % 2]} attach="geometry" />
        </Part>
      ))}
      <Part id="padi" color="#7A9A5F" materialPreset="organelle" {...p}>
        <primitive object={g.malai} attach="geometry" />
      </Part>
      {[
        [0.06, 0.45, 0.03],
        [0.11, 0.4, 0.05],
        [0.14, 0.33, 0.05],
        [0.03, 0.48, 0.01],
      ].map((pos, i) => (
        <Part key={`rg${i}`} id="padi" color="#C9B45F" materialPreset="organelle" {...p} position={pos as Vec3} scale={[0.55, 1, 0.55]}>
          <sphereGeometry args={[0.038, 8, 8]} />
        </Part>
      ))}
    </group>
  );
}

/** Belalang (konsumen I): tubuh bersegmen, antena, sayap, kaki loncat. */
function Grasshopper({ position, p }: { position: Vec3; p: PartPicker }) {
  const g = useMemo(
    () => ({
      antena: [
        sweep([[0.28, 0.16, 0.03], [0.4, 0.3, 0.05], [0.48, 0.45, 0.07]], () => 0.008, 6, 12).geo,
        sweep([[0.28, 0.16, -0.03], [0.4, 0.3, -0.05], [0.48, 0.45, -0.07]], () => 0.008, 6, 12).geo,
      ],
    }),
    []
  );

  useEffect(() => () => g.antena.forEach((geo) => geo.dispose()), [g]);

  const kakiDepan: Vec3[] = [
    [0.17, -0.1, 0.08],
    [0.17, -0.1, -0.08],
    [-0.03, -0.11, 0.09],
    [-0.03, -0.11, -0.09],
  ];

  return (
    <group position={position} rotation={[0, 0.4, 0]}>
      {/* Perut (abdomen) bersegmen memanjang */}
      <Part id="belalang" color="#8AA65C" materialPreset="organelle" {...p} position={[-0.22, 0.04, 0]} scale={[0.26, 0.11, 0.1]}>
        <sphereGeometry args={[1, 16, 12]} />
      </Part>
      <Part id="belalang" color="#7A964E" materialPreset="organelle" {...p} position={[-0.46, 0.06, 0]} scale={[0.12, 0.075, 0.07]}>
        <sphereGeometry args={[1, 12, 10]} />
      </Part>
      {/* Segmen perut (garis melingkar) */}
      {[-0.14, -0.26, -0.37].map((x, i) => (
        <Part key={`sg${i}`} id="belalang" color="#6E8A45" materialPreset="organelle" {...p} position={[x, 0.04, 0]} rotation={[0, 0, Math.PI / 2]} scale={[1, 1, 0.9]}>
          <torusGeometry args={[0.105, 0.012, 6, 16]} />
        </Part>
      ))}
      {/* Dada (thorax) */}
      <Part id="belalang" color="#7A964E" materialPreset="organelle" {...p} position={[0.05, 0.06, 0]} scale={[0.15, 0.13, 0.12]}>
        <sphereGeometry args={[1, 14, 12]} />
      </Part>
      {/* Kepala + mata majemuk */}
      <Part id="belalang" color="#5C7A3A" materialPreset="organelle" {...p} position={[0.22, 0.1, 0]} scale={[0.1, 0.09, 0.085]}>
        <sphereGeometry args={[1, 12, 12]} />
      </Part>
      {[0.06, -0.06].map((z, i) => (
        <Part key={`mt${i}`} id="belalang" color="#2A3318" materialPreset="organelle" {...p} position={[0.28, 0.15, z]}>
          <sphereGeometry args={[0.032, 8, 8]} />
        </Part>
      ))}
      {/* Antena panjang */}
      {g.antena.map((geo, i) => (
        <Part key={`an${i}`} id="belalang" color="#4E6B32" materialPreset="organelle" {...p}>
          <primitive object={geo} attach="geometry" />
        </Part>
      ))}
      {/* Kaki depan & tengah */}
      {kakiDepan.map((pos, i) => (
        <Part
          key={`kd${i}`}
          id="belalang"
          color="#4E6B32"
          materialPreset="organelle"
          {...p}
          position={pos}
          rotation={[0, 0, i < 2 ? 3.55 : 3.35]}
        >
          <cylinderGeometry args={[0.012, 0.016, 0.2, 6]} />
        </Part>
      ))}
      {/* Kaki loncat besar (femur + tibia) */}
      {[0.11, -0.11].map((z, i) => (
        <group key={`kl${i}`}>
          <Part id="belalang" color="#5C7A3A" materialPreset="organelle" {...p} position={[-0.02, 0.15, z]} rotation={[0, 0, 1.15]} scale={[0.8, 1, 0.55]}>
            <capsuleGeometry args={[0.05, 0.2, 4, 8]} />
          </Part>
          <Part id="belalang" color="#4E6B32" materialPreset="organelle" {...p} position={[-0.22, 0.02, z]} rotation={[0, 0, 2.79]} scale={[0.8, 1, 0.8]}>
            <capsuleGeometry args={[0.016, 0.24, 4, 6]} />
          </Part>
        </group>
      ))}
      {/* Sayap menutupi perut */}
      {[0.045, -0.045].map((z, i) => (
        <Part
          key={`sy${i}`}
          id="belalang"
          color="#6E8A45"
          materialPreset="tissue"
          side={THREE.DoubleSide}
          {...p}
          position={[-0.16, 0.13, z]}
          rotation={[0, 0, -0.1]}
          scale={[0.26, 0.03, 0.075]}
        >
          <sphereGeometry args={[1, 12, 10]} />
        </Part>
      ))}
    </group>
  );
}

/** Katak (konsumen II): tubuh melengkung, mata menonjol, kaki depan & belakang. */
function Frog({ position, p }: { position: Vec3; p: PartPicker }) {
  return (
    <group position={position}>
      {/* Badan melebar */}
      <Part id="katak" color="#6BABA0" materialPreset="organelle" {...p} scale={[0.36, 0.24, 0.3]}>
        <sphereGeometry args={[1, 22, 18]} />
      </Part>
      {/* Kepala menyatu dengan badan */}
      <Part id="katak" color="#5C9A90" materialPreset="organelle" {...p} position={[0.28, 0.1, 0]} scale={[0.2, 0.15, 0.19]}>
        <sphereGeometry args={[1, 18, 16]} />
      </Part>
      {/* Mata menonjol di atas kepala */}
      {[0.11, -0.11].map((z, i) => (
        <group key={`mt${i}`} position={[0.33, 0.26, z]}>
          <Part id="katak" color="#E8E4DA" materialPreset="organelle" {...p}>
            <sphereGeometry args={[0.09, 12, 12]} />
          </Part>
          <Part id="katak" color="#1F2A24" materialPreset="organelle" {...p} position={[0.05, 0.02, z > 0 ? 0.03 : -0.03]}>
            <sphereGeometry args={[0.04, 8, 8]} />
          </Part>
        </group>
      ))}
      {/* Kaki depan */}
      {[0.2, -0.2].map((z, i) => (
        <group key={`kd${i}`}>
          <Part id="katak" color="#5C9A90" materialPreset="organelle" {...p} position={[0.26, -0.16, z]} rotation={[0, 0, 0.4]}>
            <capsuleGeometry args={[0.045, 0.14, 4, 8]} />
          </Part>
          <Part id="katak" color="#4E8078" materialPreset="organelle" {...p} position={[0.3, -0.28, z]} scale={[0.08, 0.03, 0.05]}>
            <sphereGeometry args={[1, 10, 8]} />
          </Part>
        </group>
      ))}
      {/* Kaki belakang besar (paha + betis terlipat + kaki) */}
      {[0.24, -0.24].map((z, i) => (
        <group key={`kb${i}`}>
          <Part id="katak" color="#5C9A90" materialPreset="organelle" {...p} position={[-0.2, 0.02, z]} rotation={[0, 0, 0.55]} scale={[1, 1, 0.7]}>
            <sphereGeometry args={[0.17, 14, 12]} />
          </Part>
          <Part id="katak" color="#4E8078" materialPreset="organelle" {...p} position={[-0.3, -0.13, z]} rotation={[0, 0, -0.85]}>
            <capsuleGeometry args={[0.04, 0.2, 4, 8]} />
          </Part>
          <Part id="katak" color="#4E8078" materialPreset="organelle" {...p} position={[-0.14, -0.27, z]} rotation={[Math.PI / 2, 0, 0.3]}>
            <capsuleGeometry args={[0.03, 0.16, 4, 8]} />
          </Part>
        </group>
      ))}
    </group>
  );
}

/** Ular (konsumen III): tubuh melingkar menanjak dengan kepala terangkat. */
function Snake({ position, p }: { position: Vec3; p: PartPicker }) {
  const body = useMemo(() => {
    const pts: Vec3[] = [];
    const turns = 1.75;
    for (let i = 0; i <= 64; i++) {
      const t = i / 64;
      const a = t * turns * Math.PI * 2;
      const r = 0.52 * (1 - 0.72 * t);
      pts.push([Math.cos(a) * r, 0.03 + t * t * 0.5, Math.sin(a) * r * 0.85]);
    }
    return sweep(
      pts,
      (t) =>
        0.022 +
        0.062 * Math.sin(Math.min(t * 3, 1) * Math.PI * 0.5) * (1 - 0.32 * Math.max(0, (t - 0.75) / 0.25)),
      10,
      90
    );
  }, []);

  useEffect(() => () => body.geo.dispose(), [body]);

  return (
    <group position={position}>
      <Part id="ular" color="#8A6F5C" materialPreset="organelle" {...p}>
        <primitive object={body.geo} attach="geometry" />
      </Part>
      {/* Kepala terangkat menghadap luar lingkaran */}
      <Part id="ular" color="#7A5F4C" materialPreset="organelle" {...p} position={[0, 0.57, -0.15]} scale={[0.11, 0.07, 0.08]}>
        <sphereGeometry args={[1, 14, 12]} />
      </Part>
      <Part id="ular" color="#6B5344" materialPreset="organelle" {...p} position={[0, 0.55, -0.24]} scale={[0.07, 0.045, 0.06]}>
        <sphereGeometry args={[1, 12, 10]} />
      </Part>
      {[0.055, -0.055].map((x, i) => (
        <Part key={`me${i}`} id="ular" color="#1F2A24" materialPreset="organelle" {...p} position={[x, 0.6, -0.2]}>
          <sphereGeometry args={[0.02, 8, 8]} />
        </Part>
      ))}
      {/* Lidah bercabang */}
      {[0.015, -0.015].map((x, i) => (
        <Part key={`lg${i}`} id="ular" color="#B34A3A" materialPreset="organelle" {...p} position={[x, 0.54, -0.31]} rotation={[Math.PI / 2, x > 0 ? 0.25 : -0.25, 0]}>
          <cylinderGeometry args={[0.005, 0.005, 0.09, 5]} />
        </Part>
      ))}
    </group>
  );
}

/** Elang (konsumen IV): sayap lebar terbuka, kepala, paruh, kaki. */
function Eagle({ position, p }: { position: Vec3; p: PartPicker }) {
  const g = useMemo(
    () => ({
      body: sweep(
        [
          [0, 0, -0.42],
          [0, 0.02, -0.1],
          [0, 0.03, 0.12],
          [0, 0.06, 0.28],
        ],
        (t) => 0.045 + 0.1 * Math.sin(Math.min(t * 1.5, 1) * Math.PI * 0.5) * (1 - 0.5 * Math.max(0, (t - 0.72) / 0.28)),
        12,
        36
      ).geo,
      sayapKiri: wingGeometry(-1),
      sayapKanan: wingGeometry(1),
    }),
    []
  );

  useEffect(
    () => () => {
      g.body.dispose();
      g.sayapKiri.dispose();
      g.sayapKanan.dispose();
    },
    [g]
  );

  return (
    <group position={position}>
      {/* Badan memanjang */}
      <Part id="elang" color="#64748B" materialPreset="organelle" {...p}>
        <primitive object={g.body} attach="geometry" />
      </Part>
      {/* Kepala */}
      <Part id="elang" color="#475569" materialPreset="organelle" {...p} position={[0, 0.08, 0.34]}>
        <sphereGeometry args={[0.11, 14, 12]} />
      </Part>
      {/* Paruh bengkok */}
      <Part id="elang" color="#D9A05F" materialPreset="organelle" {...p} position={[0, 0.06, 0.45]} rotation={[1.9, 0, 0]}>
        <coneGeometry args={[0.05, 0.17, 8]} />
      </Part>
      {/* Mata */}
      {[0.07, -0.07].map((x, i) => (
        <Part key={`el${i}`} id="elang" color="#1F2A24" materialPreset="organelle" {...p} position={[x, 0.11, 0.41]}>
          <sphereGeometry args={[0.028, 8, 8]} />
        </Part>
      ))}
      {/* Kaki & cakar */}
      {[0.07, -0.07].map((x, i) => (
        <group key={`kk${i}`}>
          <Part id="elang" color="#D9A05F" materialPreset="organelle" {...p} position={[x, -0.14, 0.06]}>
            <capsuleGeometry args={[0.026, 0.08, 4, 8]} />
          </Part>
          <Part id="elang" color="#C9944A" materialPreset="organelle" {...p} position={[x, -0.21, 0.09]} rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[0.024, 0.07, 6]} />
          </Part>
        </group>
      ))}
      {/* Ekor menjalar (kipas) */}
      {[
        { x: 0.05, ry: 0.2 },
        { x: -0.05, ry: -0.2 },
        { x: 0.1, ry: 0.5 },
        { x: -0.1, ry: -0.5 },
      ].map((t, i) => (
        <Part key={`ek${i}`} id="elang" color="#475569" materialPreset="tissue" side={THREE.DoubleSide} {...p} position={[t.x, 0, -0.5]} rotation={[0, t.ry, 0]}>
          <boxGeometry args={[0.055, 0.015, 0.3]} />
        </Part>
      ))}
    </group>
  );
}

/** Satu sayap elang (diputar saat mengepak). */
function EagleWing({
  side,
  geo,
  p,
}: {
  side: 1 | -1;
  geo: THREE.BufferGeometry;
  p: PartPicker;
}) {
  const bulu: Array<{ pos: Vec3; rotY: number }> = [
    { pos: [side * 1.02, -0.03, -0.2], rotY: side > 0 ? 0.3 : Math.PI - 0.3 },
    { pos: [side * 1.08, -0.04, -0.22], rotY: side > 0 ? 0 : Math.PI },
    { pos: [side * 1.02, -0.03, -0.24], rotY: side > 0 ? -0.3 : Math.PI + 0.3 },
  ];
  return (
    <group>
      <Part id="elang" color="#475569" materialPreset="tissue" side={THREE.DoubleSide} {...p}>
        <primitive object={geo} attach="geometry" />
      </Part>
      {bulu.map((f, i) => (
        <Part key={`bl${i}`} id="elang" color="#475569" materialPreset="tissue" side={THREE.DoubleSide} {...p} position={f.pos} rotation={[0, f.rotY, 0]}>
          <boxGeometry args={[0.3, 0.014, 0.07]} />
        </Part>
      ))}
    </group>
  );
}

/**
 * Ekosistem sawah: produsen → konsumen I–IV → dekomposer + unsur abiotik.
 * Organisme dibentuk anatomis (batang & daun, tubuh bersegmen, sayap, kaki).
 * Panah menunjukkan arah perpindahan energi (rantai makanan) dengan jarak aman.
 */
export default function Ecosystem3D({ selected, onSelect }: SceneProps) {
  const p = { selected, onSelect };
  const awan = useRef<THREE.Group>(null!);
  const elang = useRef<THREE.Group>(null!);
  const sayapKiri = useRef<THREE.Group>(null!);
  const sayapKanan = useRef<THREE.Group>(null!);

  /* ---------- Sayap elang (geometri dipakai kiri & kanan) ---------- */
  const geoSayap = useMemo(
    () => ({ kiri: wingGeometry(-1), kanan: wingGeometry(1) }),
    []
  );
  useEffect(
    () => () => {
      geoSayap.kiri.dispose();
      geoSayap.kanan.dispose();
    },
    [geoSayap]
  );

  /* ---------- Topi jamur (lathe payung) ---------- */
  const geoTopiJamur = useMemo(
    () =>
      new THREE.LatheGeometry(
        [
          new THREE.Vector2(0.02, 0.1),
          new THREE.Vector2(0.09, 0.088),
          new THREE.Vector2(0.15, 0.05),
          new THREE.Vector2(0.18, 0.005),
          new THREE.Vector2(0.165, -0.015),
          new THREE.Vector2(0.02, -0.03),
        ],
        20
      ),
    []
  );
  useEffect(() => () => geoTopiJamur.dispose(), [geoTopiJamur]);

  /* ---------- Helai rumput abiotik ---------- */
  const geoRumput = useMemo(() => bladeGeometry(0.34, 0.05, 0.12, 0.1), []);
  useEffect(() => () => geoRumput.dispose(), [geoRumput]);

  /* ---------- Sinar matahari menuju padi ---------- */
  const sunBeams = useMemo(() => {
    const base = new THREE.Vector3(2.6, 2.6, -2.2);
    const target = new THREE.Vector3(-2.35, -0.7, -0.7);
    const dir = target.clone().sub(base).normalize();
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
    const side = new THREE.Vector3(0, 0, 1).cross(dir).normalize();
    const out: Array<{ pos: Vec3; q: THREE.Quaternion }> = [];
    for (let i = 0; i < 3; i++) {
      const pt = base.clone().addScaledVector(dir, 1.0 + i * 0.4).addScaledVector(side, (i - 1) * 0.3);
      out.push({ pos: pt.toArray() as Vec3, q });
    }
    return out;
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (awan.current) awan.current.position.x = -1.4 + Math.sin(t * 0.12) * 0.8;
    if (elang.current) elang.current.position.y = 3.45 + Math.sin(t * 1.1) * 0.12;
    const flap = Math.sin(t * 3.2) * 0.4;
    if (sayapKiri.current) sayapKiri.current.rotation.z = 0.15 + flap;
    if (sayapKanan.current) sayapKanan.current.rotation.z = -0.15 - flap;
  });

  // Arah rantai makanan: padi → belalang → katak → ular → elang
  // (titik ujung dijaga agar tidak menutupi organisme)
  const rantai = useMemo(
    () => [
      { from: [-1.95, -1.35, -0.6] as Vec3, to: [-1.15, -2.1, 0.05] as Vec3 },
      { from: [-0.1, -2.3, 0.5] as Vec3, to: [0.3, -2.35, 0.55] as Vec3 },
      { from: [1.1, -2.3, 0.3] as Vec3, to: [1.4, -2.3, -0.25] as Vec3 },
      { from: [1.6, -1.75, -0.85] as Vec3, to: [-0.3, 2.85, 0.4] as Vec3 },
    ],
    []
  );

  const jamur: Array<{ pos: Vec3; h: number; rt: number; rb: number; s: number }> = [
    { pos: [0, 0, 0], h: 0.42, rt: 0.06, rb: 0.085, s: 1.45 },
    { pos: [0.18, 0, -0.12], h: 0.3, rt: 0.05, rb: 0.07, s: 1.05 },
    { pos: [-0.15, 0, 0.12], h: 0.24, rt: 0.04, rb: 0.06, s: 0.8 },
  ];

  const bakteri: Vec3[] = [
    [0.32, 0.03, 0.16],
    [-0.28, 0.03, -0.14],
    [0.1, 0.03, 0.3],
    [-0.06, 0.03, -0.3],
  ];

  const rumput: Array<{ pos: Vec3; yaw: number }> = [
    { pos: [-2.7, -2.65, 0.9], yaw: 0.4 },
    { pos: [-0.3, -2.65, -1.7], yaw: 2.1 },
    { pos: [2.7, -2.65, -0.7], yaw: 3.6 },
    { pos: [0.4, -2.65, 1.9], yaw: 5.0 },
  ];

  return (
    <group>
      {/* ================= UNSUR ABIOTIK ================= */}
      {/* Tanah sawah */}
      <Part id="abiotik" color="#8A7355" materialPreset="wall" {...p} position={[0, -2.9, 0]}>
        <cylinderGeometry args={[3.4, 3.4, 0.5, 40]} />
      </Part>
      {/* Genangan air / kolam */}
      <Part id="abiotik" color="#7A9BB5" materialPreset="vesicle" opacity={0.85} {...p} position={[1.6, -2.62, 1.35]} scale={[1.15, 1, 0.8]}>
        <cylinderGeometry args={[0.95, 0.95, 0.12, 28]} />
      </Part>
      {/* Riak air */}
      {[
        { r: 0.42, s: 1 },
        { r: 0.68, s: 0.85 },
      ].map((rp, i) => (
        <Part key={`rk${i}`} id="abiotik" color="#A9C6DC" materialPreset="vesicle" {...p} position={[1.6, -2.55, 1.35]} rotation={[Math.PI / 2, 0, 0]} scale={[rp.s * 1.2, rp.s, 1]}>
          <torusGeometry args={[rp.r, 0.016, 6, 26]} />
        </Part>
      ))}
      {/* Gelagah (rongga udara) di tepi air — menembus marker abiotik */}
      {[
        [1.6, -2.6, 1.7],
        [1.15, -2.6, 1.15],
        [2.15, -2.6, 1.0],
      ].map((pos, i) => (
        <group key={`gl${i}`} position={pos as Vec3}>
          <Part id="abiotik" color="#4A7A5F" materialPreset="organelle" {...p} position={[0, 0.35, 0]} rotation={[i * 0.1, 0, i === 1 ? -0.12 : 0.08]}>
            <cylinderGeometry args={[0.022, 0.035, 0.72, 8]} />
          </Part>
          <Part id="abiotik" color="#6B4A35" materialPreset="organelle" {...p} position={[i === 1 ? -0.06 : 0.05, 0.76, 0]} rotation={[0, 0, i === 1 ? -0.2 : 0.15]}>
            <capsuleGeometry args={[0.05, 0.16, 4, 8]} />
          </Part>
        </group>
      ))}
      {/* Rumput di permukaan tanah */}
      {rumput.map((r, i) =>
        [0, 2.1, 4.2].map((o, j) => (
          <Part
            key={`rm${i}-${j}`}
            id="abiotik"
            color={j % 2 ? "#5C8A6A" : "#6E9A7A"}
            materialPreset="organelle"
            side={THREE.DoubleSide}
            {...p}
            position={r.pos}
            rotation={[0, r.yaw + o, 0.08]}
          >
            <primitive object={geoRumput} attach="geometry" />
          </Part>
        ))
      )}
      {/* Awan */}
      <group ref={awan} position={[-1.4, 2.7, -1.4]}>
        {[
          { pos: [0, 0, 0] as Vec3, r: 0.42 },
          { pos: [0.5, -0.05, 0.1] as Vec3, r: 0.32 },
          { pos: [-0.5, -0.05, -0.05] as Vec3, r: 0.3 },
        ].map((c, i) => (
          <Part key={`aw${i}`} id="abiotik" color="#F4F7F6" materialPreset="cytoplasm" opacity={0.95} {...p} position={c.pos}>
            <sphereGeometry args={[c.r, 16, 16]} />
          </Part>
        ))}
      </group>

      {/* 7. CAHAYA MATAHARI (sumber energi) */}
      <Part id="matahari" color="#D9B45F" materialPreset="organelle" {...p} position={[2.6, 2.6, -2.2]}>
        <sphereGeometry args={[0.45, 22, 22]} />
      </Part>
      {/* Mahkota cahaya */}
      <Part id="matahari" color="#E7C86A" materialPreset="vesicle" {...p} position={[2.6, 2.6, -2.2]}>
        <sphereGeometry args={[0.58, 20, 20]} />
      </Part>
      {sunBeams.map((b, i) => (
        <mesh key={`sb${i}`} position={b.pos} quaternion={b.q}>
          <cylinderGeometry args={[0.02, 0.02, 0.5, 6]} />
          <meshStandardMaterial color="#E7C86A" emissive="#E7C86A" emissiveIntensity={0.55} roughness={0.5} />
        </mesh>
      ))}

      {/* ================= 1. PRODUSEN (PADI) ================= */}
      <PadiPlant position={[-2.35, -2.65, -0.7]} p={p} />
      <RiceClump position={[-1.1, -2.65, 0.9]} p={p} />
      <RiceClump position={[0.1, -2.65, 1.25]} p={p} />

      {/* ================= 2. KONSUMEN I — belalang ================= */}
      <Grasshopper position={[-0.55, -2.32, 0.35]} p={p} />

      {/* ================= 3. KONSUMEN II — katak ================= */}
      <Frog position={[0.65, -2.35, 0.55]} p={p} />

      {/* ================= 4. KONSUMEN III — ular ================= */}
      <Snake position={[1.55, -2.58, -0.7]} p={p} />

      {/* ================= 5. KONSUMEN IV — elang ================= */}
      <group ref={elang} position={[-0.4, 3.45, 0.4]}>
        <Eagle position={[0, 0, 0]} p={p} />
        {/* Sayap kiri (diputar saat mengepak) */}
        <group ref={sayapKiri} position={[-0.16, 0.05, 0]}>
          <EagleWing side={-1} geo={geoSayap.kiri} p={p} />
        </group>
        <group ref={sayapKanan} position={[0.16, 0.05, 0]}>
          <EagleWing side={1} geo={geoSayap.kanan} p={p} />
        </group>
      </group>

      {/* ================= 6. DEKOMPOSER — jamur & bakteri ================= */}
      <group position={[2.2, -2.62, 0.6]}>
        {jamur.map((m, i) => (
          <group key={`jm${i}`} position={m.pos}>
            {/* Batang */}
            <Part id="jamur" color="#E8E4DA" materialPreset="organelle" {...p} position={[0, m.h / 2, 0]}>
              <cylinderGeometry args={[m.rt, m.rb, m.h, 10]} />
            </Part>
            {/* Topi (payung) */}
            <Part id="jamur" color="#A3825C" materialPreset="organelle" {...p} position={[0, m.h, 0]} scale={[m.s, m.s * 0.8, m.s]}>
              <primitive object={geoTopiJamur} attach="geometry" />
            </Part>
          </group>
        ))}
        {/* Bakteri pengurai di tanah */}
        {bakteri.map((pos, i) => (
          <Part
            key={`bk${i}`}
            id="jamur"
            color="#8A9B7A"
            materialPreset="organelle"
            {...p}
            position={pos}
            rotation={[0, i * 1.1, Math.PI / 2]}
          >
            <capsuleGeometry args={[0.02, 0.05, 4, 8]} />
          </Part>
        ))}
      </group>

      {/* ================= PANAH RANTAI MAKANAN ================= */}
      {rantai.map((a, i) => (
        <FlowArrow key={`ar${i}`} from={a.from} to={a.to} />
      ))}
    </group>
  );
}
