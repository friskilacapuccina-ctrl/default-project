"use client";

import dynamic from "next/dynamic";
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Box, Sparkles } from "lucide-react";
import { BIO_MODELS } from "./model-info";
import type { BioModel, BioStructure, BioVariant, SceneProps } from "./types";
import AnimalCell3D from "./scenes/AnimalCell3D";
import PlantCell3D from "./scenes/PlantCell3D";
import Digestive3D from "./scenes/Digestive3D";
import Respiratory3D from "./scenes/Respiratory3D";
import Circulatory3D from "./scenes/Circulatory3D";
import Ecosystem3D from "./scenes/Ecosystem3D";
/* Jaringan tumbuhan — satu scene per jenis jaringan. */
import PlantEpidermis3D from "./scenes/plant/Epidermis3D";
import PlantMeristem3D from "./scenes/plant/Meristem3D";
import PlantParenchyma3D from "./scenes/plant/Parenchyma3D";
import PlantVascular3D from "./scenes/plant/Vascular3D";
import PlantCollenchyma3D from "./scenes/plant/Collenchyma3D";
import PlantSclerenchyma3D from "./scenes/plant/Sclerenchyma3D";
/* Jaringan hewan — scene diparameterisasi per jenis. */
import Epithelium3D from "./scenes/animal/Epithelium3D";
import MuscleTissue3D from "./scenes/animal/MuscleTissue3D";
import Neuron3D from "./scenes/animal/Neuron3D";
import ConnectiveTissue3D from "./scenes/animal/ConnectiveTissue3D";
import type { BioCanvasHandle, MarkerDef } from "./BioCanvas";
import { ModelControls } from "./ModelControls";
import { StructureList } from "./StructureList";
import { StructureDetailPanel } from "./StructureDetailPanel";
import { ModelErrorState } from "./ModelErrorState";

const BioCanvasDyn = dynamic(() => import("./BioCanvas").then((m) => m.BioCanvas), {
  ssr: false,
  loading: () => (
    <div className="h-[440px] sm:h-[500px] lg:h-[560px] w-full rounded-2xl border border-[#bfd0c8] dark:border-[#4a6060] bg-[#e2e9e5] dark:bg-[#304247] flex items-center justify-center">
      <p className="text-sm text-slate-600 dark:text-slate-300 animate-pulse">Memuat model 3D…</p>
    </div>
  ),
});

/** Scene per materi (model tunggal). */
const SCENES: Record<string, React.ComponentType<SceneProps>> = {
  "sistem-pencernaan-manusia": Digestive3D,
  "sistem-pernapasan-manusia": Respiratory3D,
  "sistem-peredaran-darah-manusia": Circulatory3D,
  "ekosistem-dan-interaksi": Ecosystem3D,
};

/** Scene per varian (mis. sel hewan vs sel tumbuhan). */
const VARIANT_SCENES: Record<string, Record<string, React.ComponentType<SceneProps>>> = {
  "sel-dan-struktur-sel": { hewan: AnimalCell3D, tumbuhan: PlantCell3D },
};

/** Scene per sub-model (jenis jaringan). */
const SUB_SCENES: Record<
  string,
  Record<string, Record<string, React.ComponentType<SceneProps>>>
> = {
  "jaringan-tumbuhan-hewan": {
    tumbuhan: {
      epidermis: PlantEpidermis3D,
      meristem: PlantMeristem3D,
      parenkim: PlantParenchyma3D,
      pengangkut: PlantVascular3D,
      kolenkim: PlantCollenchyma3D,
      sklerenkim: PlantSclerenchyma3D,
    },
    hewan: {
      "epitel-pipih": (props) => <Epithelium3D {...props} kind="pipih" />,
      "epitel-kubus": (props) => <Epithelium3D {...props} kind="kubus" />,
      "epitel-silindris": (props) => <Epithelium3D {...props} kind="silindris" />,
      "epitel-berlapis": (props) => <Epithelium3D {...props} kind="berlapis" />,
      "otot-rangka": (props) => <MuscleTissue3D {...props} kind="rangka" />,
      "otot-polos": (props) => <MuscleTissue3D {...props} kind="polos" />,
      "otot-jantung": (props) => <MuscleTissue3D {...props} kind="jantung" />,
      saraf: Neuron3D,
      "ikat-longgar": (props) => <ConnectiveTissue3D {...props} kind="longgar" />,
      "ikat-padat": (props) => <ConnectiveTissue3D {...props} kind="padat" />,
      adiposa: (props) => <ConnectiveTissue3D {...props} kind="adiposa" />,
      "tulang-rawan": (props) => <ConnectiveTissue3D {...props} kind="rawan" />,
      tulang: (props) => <ConnectiveTissue3D {...props} kind="tulang" />,
      darah: (props) => <ConnectiveTissue3D {...props} kind="darah" />,
    },
  },
};

type Props = { slug: string; materialId?: string };

/**
 * Bagian "Model 3D Interaktif" pada halaman detail materi.
 * Layout dua kolom: kiri = model 3D + kontrol, kanan = daftar bagian + panel detail.
 * Mendukung tab varian (mis. Sel Hewan / Sel Tumbuhan) dan sub-tab jenis (mis. jenis jaringan).
 */
export default function Biology3DSection({ slug, materialId }: Props) {
  const model = BIO_MODELS[slug];
  const variantOrder = model?.variantOrder ?? [];

  const [variant, setVariant] = useState<string>(variantOrder[0] ?? "");
  const [sub, setSub] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const [showMarkers, setShowMarkers] = useState(true);
  const [flowPlaying, setFlowPlaying] = useState(true);

  const canvasHandle = useRef<BioCanvasHandle | null>(null);
  const onCanvasReady = useCallback((h: BioCanvasHandle) => {
    canvasHandle.current = h;
  }, []);

  // Resolusi view aktif: sub-model (jenis jaringan) → varian → model.
  const { activeVariant, activeSub } = useMemo(() => {
    const av: BioVariant | undefined = variant ? model?.variants?.[variant] : undefined;
    const as: BioVariant | undefined =
      sub && av?.subvariants ? av.subvariants[sub] : undefined;
    return { activeVariant: av, activeSub: as };
  }, [model, variant, sub]);

  // Saat varian berubah, pilih sub-model pertamanya (jika ada) dan bersihkan seleksi.
  useEffect(() => {
    const first = model?.variants?.[variant]?.subOrder?.[0] ?? null;
    setSub(first);
    setSelectedId(null);
  }, [model, variant]);

  const structures = useMemo<BioStructure[]>(
    () => activeSub?.structures ?? activeVariant?.structures ?? model?.structures ?? [],
    [activeSub, activeVariant, model]
  );
  const camera = activeSub?.camera ?? activeVariant?.camera ?? model?.camera;
  const title = activeSub?.title ?? activeVariant?.title ?? model?.title ?? "";
  const intro = activeSub?.intro ?? activeVariant?.intro ?? model?.intro ?? "";
  const schematicNote =
    activeSub?.schematicNote ?? activeVariant?.schematicNote ?? model?.schematicNote;

  const Scene = useMemo(() => {
    if (activeVariant && VARIANT_SCENES[slug]) {
      return VARIANT_SCENES[slug][variant] ?? SCENES[slug];
    }
    if (activeVariant && SUB_SCENES[slug]) {
      return sub ? SUB_SCENES[slug][variant]?.[sub] ?? SCENES[slug] : SCENES[slug];
    }
    return SCENES[slug];
  }, [activeVariant, slug, variant, sub]);

  const markers = useMemo<MarkerDef[]>(
    () =>
      structures.map((s) => ({
        id: s.id,
        number: s.number,
        name: s.name,
        color: s.color,
        anchor: s.marker,
      })),
    [structures]
  );

  const structure = selectedId ? structures.find((s) => s.id === selectedId) ?? null : null;

  if (!model || !Scene) return null;

  function switchVariant(v: string) {
    setVariant(v);
    setSelectedId(null);
  }

  function switchSub(k: string) {
    setSub(k);
    setSelectedId(null);
  }

  const subOrder = activeVariant?.subOrder ?? [];
  const subLabels = activeVariant?.subLabels ?? {};
  const subGroups = activeVariant?.subGroups;

  const subTab = (k: string) => (
    <button
      key={k}
      type="button"
      role="tab"
      aria-selected={sub === k}
      onClick={() => switchSub(k)}
      className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-all ${
        sub === k
          ? "bg-aurora-700 text-white border-aurora-700 shadow"
          : "bg-white text-slate-600 border-slate-200 hover:border-aurora-400"
      }`}
    >
      {subLabels[k] ?? k}
    </button>
  );

  return (
    <section id="model-3d" className="card-hover mb-8 scroll-mt-24">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-aurora-700 to-aurora-900 flex items-center justify-center flex-shrink-0">
            <Box className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900">Model 3D Interaktif — {title}</h2>
            <p className="text-xs text-slate-500">{model.hint}</p>
          </div>
        </div>
        {schematicNote && (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500 bg-slate-50 border border-slate-200 rounded-full px-3 py-1">
            <Sparkles className="w-3 h-3" />
            Visualisasi skematis
          </span>
        )}
      </div>

      {variantOrder.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-3" role="tablist" aria-label="Pilihan model">
          {variantOrder.map((v) => (
            <button
              key={v}
              type="button"
              role="tab"
              aria-selected={variant === v}
              onClick={() => switchVariant(v)}
              className={`px-4 py-2 text-sm font-medium rounded-xl border transition-all ${
                variant === v
                  ? "bg-aurora-800 text-white border-aurora-800 shadow"
                  : "bg-white text-slate-600 border-slate-200 hover:border-aurora-400"
              }`}
            >
              {model.variantLabels?.[v] ?? v}
            </button>
          ))}
        </div>
      )}

      {subOrder.length > 1 && (
        <div className="mb-4" role="tablist" aria-label="Pilihan jenis">
          {subGroups ? (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              {subGroups.map((g) => (
                <Fragment key={g.label}>
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    {g.label}
                  </span>
                  <div className="flex flex-wrap gap-1.5">{g.keys.map(subTab)}</div>
                </Fragment>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-1.5">{subOrder.map(subTab)}</div>
          )}
        </div>
      )}

      <div className="grid lg:grid-cols-[minmax(0,1fr)_340px] gap-4 items-start">
        <div className="min-w-0 flex flex-col gap-3">
          <div className="relative">
            <ModelErrorState key={`${slug}:${variant}:${sub ?? ""}`}>
              <BioCanvasDyn
                autoRotate={autoRotate}
                camera={camera}
                markers={markers}
                selectedId={selectedId}
                showMarkers={showMarkers}
                onSelect={setSelectedId}
                onDeselect={() => setSelectedId(null)}
                onReady={onCanvasReady}
              >
                <Scene selected={selectedId} onSelect={setSelectedId} flowPlaying={flowPlaying} />
              </BioCanvasDyn>
            </ModelErrorState>

            <div className="absolute inset-x-2 top-2 z-50 lg:hidden">
              <StructureList compact structures={structures} selectedId={selectedId} onSelect={setSelectedId} />
            </div>
            <div className="absolute inset-x-2 bottom-2 z-50 lg:hidden">
              <StructureDetailPanel compact structure={structure} intro={intro} onClose={() => setSelectedId(null)} />
            </div>
          </div>

          <ModelControls
            autoRotate={autoRotate}
            onToggleRotate={() => setAutoRotate((v) => !v)}
            showMarkers={showMarkers}
            onToggleMarkers={() => setShowMarkers((v) => !v)}
            onZoomIn={() => canvasHandle.current?.zoomIn()}
            onZoomOut={() => canvasHandle.current?.zoomOut()}
            onResetView={() => canvasHandle.current?.resetView()}
            onResetSelection={() => setSelectedId(null)}
            hasFlow={model.hasFlow}
            flowPlaying={flowPlaying}
            onToggleFlow={() => setFlowPlaying((v) => !v)}
            flowLabel={model.flowLabel}
          />

          {model.legendNote && (
            <p className="text-xs text-slate-500 leading-relaxed">{model.legendNote}</p>
          )}
        </div>

        <div className="hidden flex-col gap-3 lg:sticky lg:top-6 lg:flex">
          <StructureList structures={structures} selectedId={selectedId} onSelect={setSelectedId} />
          <StructureDetailPanel
            structure={structure}
            intro={intro}
            schematicNote={schematicNote}
            legendNote={model.legendNote}
            aiHref={materialId ? `/ai-tutor?materialId=${materialId}` : "/ai-tutor"}
            onClose={() => setSelectedId(null)}
          />
        </div>
      </div>
    </section>
  );
}
