"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/** PRNG deterministik (mulberry32) agar penyebaran acak stabil antar render. */
export function mulberry(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Lazy-init geometri + dispose otomatis saat unmount.
 * Geometri dibuat tepat sekali lalu dilepas saat scene ditutup /
 * ganti tab agar tidak bocor memori.
 */
export function useGeoms<T extends Record<string, THREE.BufferGeometry | THREE.BufferGeometry[]>>(
  make: () => T
): T {
  const ref = useRef<T | null>(null);
  if (ref.current === null) ref.current = make();
  const geos = ref.current;
  useEffect(() => {
    const list = geos;
    return () => {
      Object.values(list).flat().forEach((g) => g.dispose());
    };
  }, [geos]);
  return geos;
}

/**
 * Tabung melengkung sepanjang sumbu X (untuk serabut kolagen/elastin
 * yang bergelombang khas jaringan ikat).
 */
export function wavyTube(
  len: number,
  radius: number,
  amp: number,
  freq: number,
  seed: number,
  yOffset = 0,
  zOffset = 0,
  segs = 64
) {
  const rnd = mulberry(seed);
  const p1 = rnd() * Math.PI * 2;
  const p2 = rnd() * Math.PI * 2;
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= segs; i++) {
    const t = i / segs;
    pts.push(
      new THREE.Vector3(
        (t - 0.5) * len,
        Math.sin(t * freq * Math.PI * 2 + p1) * amp + yOffset,
        Math.cos(t * freq * Math.PI * 1.7 + p2) * amp * 0.55 + zOffset
      )
    );
  }
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), segs, radius, 8, false);
}

/** Kurva TubeGeometry dari daftar titik (untuk percabangan dendrit/bronkus dsb.). */
export function tubeFromPoints(pts: [number, number, number][], radius: number, segs = 48) {
  const curve = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(p[0], p[1], p[2])));
  return new THREE.TubeGeometry(curve, segs, radius, 8, false);
}

/** Rotasi untuk silindris memanjang pada sumbu X (rotateZ 90°). */
export const ROT_X = Math.PI / 2;
