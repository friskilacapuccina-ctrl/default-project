"use client";

import { Component, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

type Props = { children: ReactNode };
type State = { hasError: boolean };

/** Menangkap kegagalan render WebGL/model 3D dan menampilkan pesan yang mudah dipahami. */
export class ModelErrorState extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-[440px] sm:h-[500px] lg:h-[560px] w-full rounded-2xl border border-[#bfd0c8] dark:border-[#4a6060] bg-[#e2e9e5] dark:bg-[#304247] flex flex-col items-center justify-center gap-3 p-6 text-center">
          <AlertTriangle className="w-8 h-8 text-amber-500" />
          <div>
            <p className="font-semibold text-slate-800 dark:text-slate-100">Model 3D gagal ditampilkan</p>
            <p className="text-sm text-slate-500 dark:text-slate-300 mt-1">
              Peramban Anda mungkin tidak mendukung WebGL, atau terjadi galat saat merender model.
              Daftar bagian dan panel penjelasan di samping tetap dapat digunakan.
            </p>
          </div>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false })}
            className="btn-secondary btn-sm inline-flex items-center gap-1.5"
          >
            <RefreshCw className="w-4 h-4" />
            Coba Lagi
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
