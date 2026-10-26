import Link from "next/link";
import { Film, ShieldCheck, Cpu, Code2, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-white/10 bg-[#07090D] text-gray-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center">
                <Film className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-base text-white tracking-tight">EditMind AI</span>
            </div>
            <p className="text-gray-400 text-xs leading-relaxed">
              &quot;Show us what you want. Give us your clips. Get an edit you can actually control.&quot;
            </p>
            <div className="flex items-center gap-2 text-[11px] text-gray-500">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Private media sandboxing & zero model training</span>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-200 uppercase tracking-wider text-[11px] mb-3">
              Platform
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/dashboard" className="hover:text-white transition-colors">
                  Creator Dashboard
                </Link>
              </li>
              <li>
                <a href="#dna" className="hover:text-white transition-colors">
                  Reference DNA Extraction
                </a>
              </li>
              <li>
                <a href="#footage-intelligence" className="hover:text-white transition-colors">
                  Footage Intelligence
                </a>
              </li>
              <li>
                <a href="#multi-platform" className="hover:text-white transition-colors">
                  One Video, Every Platform
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-200 uppercase tracking-wider text-[11px] mb-3">
              Engines & Tech
            </h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-violet-400" />
                <span>Deterministic FFmpeg / H.264</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-blue-400" />
                <span>Structured EDL JSON Decision Lists</span>
              </li>
              <li>
                <span>Indic Scripts (ML, TA, HI)</span>
              </li>
              <li>
                <span>Audio Ducking & Beat-sync</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-200 uppercase tracking-wider text-[11px] mb-3">
              Security & Privacy
            </h4>
            <p className="text-gray-400 text-xs leading-relaxed mb-3">
              All raw footage and reference media remain private in isolated storage. No external scraping or unauthorized audio extraction.
            </p>
            <div className="inline-block px-2.5 py-1 rounded bg-white/5 border border-white/10 text-[10px] text-violet-300">
              Production Verified Engine
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-gray-500">
          <div>© {new Date().getFullYear()} EditMind AI. Built for creators worldwide.</div>
          <div className="flex items-center gap-1">
            <span>Powered by Next.js, React 19, FFmpeg & AI Planning</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
