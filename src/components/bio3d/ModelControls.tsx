"use client";

import { Pause, Play, RotateCcw, Tags, X, ZoomIn, ZoomOut } from "lucide-react";

type Props = {
  autoRotate: boolean;
  onToggleRotate: () => void;
  showMarkers: boolean;
  onToggleMarkers: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  onResetSelection: () => void;
  hasFlow?: boolean;
  flowPlaying?: boolean;
  onToggleFlow?: () => void;
  flowLabel?: string;
};

const btn = "btn-secondary btn-sm inline-flex items-center gap-1.5";

/** Kontrol model: rotasi, zoom in/out, reset kamera, reset seleksi, marker, animasi aliran. */
export function ModelControls({
  autoRotate,
  onToggleRotate,
  showMarkers,
  onToggleMarkers,
  onZoomIn,
  onZoomOut,
  onResetView,
  onResetSelection,
  hasFlow,
  flowPlaying,
  onToggleFlow,
  flowLabel,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" onClick={onZoomIn} className={btn} aria-label="Zoom in">
        <ZoomIn className="w-4 h-4" />
        <span className="hidden sm:inline">Zoom In</span>
      </button>
      <button type="button" onClick={onZoomOut} className={btn} aria-label="Zoom out">
        <ZoomOut className="w-4 h-4" />
        <span className="hidden sm:inline">Zoom Out</span>
      </button>
      <button type="button" onClick={onResetView} className={btn} aria-label="Reset kamera">
        <RotateCcw className="w-4 h-4" />
        <span className="hidden sm:inline">Reset Kamera</span>
      </button>
      <button type="button" onClick={onResetSelection} className={btn} aria-label="Reset seleksi">
        <X className="w-4 h-4" />
        <span className="hidden sm:inline">Reset Seleksi</span>
      </button>
      <button
        type="button"
        onClick={onToggleRotate}
        className={btn}
        aria-pressed={autoRotate}
        aria-label={autoRotate ? "Hentikan rotasi model" : "Putar model otomatis"}
      >
        {autoRotate ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        <span className="hidden sm:inline">{autoRotate ? "Jeda Rotasi" : "Putar Model"}</span>
      </button>
      <button
        type="button"
        onClick={onToggleMarkers}
        className={btn}
        aria-pressed={showMarkers}
        aria-label={showMarkers ? "Sembunyikan marker" : "Tampilkan marker"}
      >
        <Tags className="w-4 h-4" />
        <span className="hidden sm:inline">{showMarkers ? "Marker On" : "Marker Off"}</span>
      </button>
      {hasFlow && onToggleFlow && (
        <button
          type="button"
          onClick={onToggleFlow}
          className="btn-primary btn-sm inline-flex items-center gap-1.5"
          aria-pressed={flowPlaying}
          aria-label={flowPlaying ? `Jeda animasi ${flowLabel ?? ""}` : `Putar animasi ${flowLabel ?? ""}`}
        >
          {flowPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          <span className="hidden sm:inline">
            {flowPlaying ? `Jeda ${flowLabel ?? "Animasi"}` : `Putar ${flowLabel ?? "Animasi"}`}
          </span>
        </button>
      )}
    </div>
  );
}
