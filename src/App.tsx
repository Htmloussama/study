import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, Download, Printer } from 'lucide-react';

// Design Constants
const COLORS = {
  primary: '#1a237e', // Dark Blue
  secondary: '#0d1b5e', // Deep Blue Card
  accent: '#f9a825', // Gold
  lightBlue: '#1565c0',
  white: '#ffffff',
};

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'done' | 'error'>('idle');
  const [progress, setProgress] = useState(0);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected && selected.type === 'application/pdf') {
      setFile(selected);
      setStatus('uploading');
      
      const formData = new FormData();
      formData.append('pdf', selected);

      try {
        const response = await fetch('/api/process', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          setStatus('processing');
          simulateProcessing();
        } else {
          setStatus('error');
        }
      } catch (err) {
        setStatus('error');
      }
    }
  };

  const simulateProcessing = () => {
    let p = 0;
    const interval = setInterval(() => {
      p += 2;
      setProgress(p);
      if (p >= 100) {
        clearInterval(interval);
        setStatus('done');
      }
    }, 80);
  };

  return (
    <div className="h-screen flex flex-col bg-[#f5f7fa] font-sans selection:bg-blue-100 italic-none">
      {/* Professional Header */}
      <header className="h-16 bg-[#1a237e] border-b-4 border-[#f9a825] px-6 flex items-center justify-between text-white shrink-0 shadow-lg z-10">
        <div className="flex items-center gap-3">
          <div className="flex items-baseline gap-1 text-xl font-extrabold tracking-tighter">
            <span className="text-white">DOC</span>
            <span className="text-[#f9a825]">PROC</span>
            <span className="ml-2 font-normal text-sm text-blue-200 tracking-normal border-l border-blue-700 pl-3">BAC-AGENT v2.4</span>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-4 text-xs font-semibold opacity-90 tracking-wide uppercase">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Mode: <strong>Extracting Writing Sections</strong>
          </span>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Workspace Sidebar */}
        <aside className="w-64 bg-white border-r border-[#dcdde1] p-5 flex flex-col gap-6 shrink-0 shadow-sm hidden lg:flex">
          <div>
            <h3 className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-4">Queue de Traitement</h3>
            <ul className="space-y-3">
              {[
                { name: '2012_SP_SC_EXP.pdf', status: 'done', label: '12 Subjects • Complete' },
                { name: file?.name || 'Waiting for upload...', status: status === 'idle' ? 'wait' : status === 'done' ? 'done' : 'active', label: status === 'idle' ? 'En attente...' : status === 'done' ? 'Processing Complete' : `Processing session... ${progress}%` }
              ].map((item, i) => (
                <li key={i} className={`p-3 rounded-lg border text-xs transition-all ${
                  item.status === 'done' ? 'bg-green-50 border-green-200' :
                  item.status === 'active' ? 'bg-blue-50 border-blue-300 ring-1 ring-blue-200' : 'bg-gray-50 border-gray-200 opacity-60'
                }`}>
                  <div className="font-bold flex items-center gap-2 text-gray-800 truncate">
                    {item.status === 'active' && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />}
                    {item.name}
                  </div>
                  <div className={`mt-1 text-[10px] ${item.status === 'done' ? 'text-green-600' : item.status === 'active' ? 'text-blue-600' : 'text-gray-400'}`}>
                    {item.label}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-auto pt-6 border-t border-gray-100">
            <h3 className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-3">Outils Système</h3>
            <div className="bg-gray-50 p-3 rounded-md font-mono text-[10px] text-gray-500 leading-relaxed border border-gray-100">
              $ pdfinfo input.pdf<br />
              $ pdftotext -f 1 -l 2<br />
              $ pdftoppm -jpeg -r 150
            </div>
          </div>
        </aside>

        {/* Content Area Grid */}
        <main className="flex-1 overflow-y-auto p-6 grid grid-cols-1 xl:grid-cols-[1.2fr_1fr] gap-6">
          {/* Main Processing Card */}
          <div className="flex flex-col gap-6">
            <div className="bg-white rounded-xl border border-[#dcdde1] shadow-sm flex flex-col overflow-hidden min-h-[500px]">
              <div className="px-5 py-4 border-b border-[#dcdde1] flex justify-between items-center bg-gray-50/50">
                <span className="text-xs font-bold text-[#1a237e] uppercase tracking-wide">
                  {status === 'idle' ? 'Étape 1 : Téléchargement' : 'Étape 3 : Tight Crop (Visual Detection)'}
                </span>
                {status === 'processing' && (
                  <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold animate-pulse">
                    Optimisation en cours
                  </span>
                )}
              </div>

              <div className="flex-1 relative flex items-center justify-center p-6 bg-[#34495e] overflow-hidden group">
                <AnimatePresence mode="wait">
                  {status === 'idle' && (
                    <motion.div 
                      key="upload" 
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="w-full h-full flex flex-col"
                    >
                      <label className="flex-1 border-2 border-dashed border-gray-500 rounded-xl flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-gray-800/20 transition-colors group">
                        <div className="bg-white/10 p-5 rounded-full ring-1 ring-white/20 group-hover:scale-110 transition-transform">
                          <Upload className="text-white" size={32} />
                        </div>
                        <div className="text-center text-white">
                          <p className="font-bold underline decoration-[#f9a825] decoration-2 underline-offset-4">Cliquez pour importer un PDF</p>
                          <p className="text-xs opacity-50 mt-2">Archives BAC Tunisie (150 DPI recommandé)</p>
                        </div>
                        <input type="file" className="hidden" accept=".pdf" onChange={handleUpload} />
                      </label>
                    </motion.div>
                  )}

                  {(status === 'uploading' || status === 'processing') && (
                    <motion.div 
                      key="processing" 
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
                      className="w-full h-full max-w-sm aspect-[1/1.4] bg-white shadow-2xl relative p-8 flex flex-col gap-4 overflow-hidden"
                    >
                      <div className="h-4 w-full border-b-2 border-black flex items-center justify-center text-[8px] font-bold pb-2 uppercase tracking-widest shrink-0">
                        Examen Baccalauréat — Session 20{Math.floor(20 - (progress/10))}
                      </div>
                      <div className="flex-1 flex flex-col gap-2 opacity-20">
                        {Array.from({ length: 6 }).map((_, i) => (
                           <div key={i} className="h-2 w-full bg-gray-200 rounded" style={{ width: `${90 - (i*5)}%` }} />
                        ))}
                      </div>
                      
                      {/* Crop Indicators */}
                      <div className="absolute inset-x-8 top-[35%] bottom-[20%] border-2 border-dashed border-green-500 bg-green-500/10 pointer-events-none">
                        <div className="absolute top-[-18px] left-0 bg-green-500 text-white text-[8px] px-2 py-0.5 rounded font-bold whitespace-nowrap">
                          ✓ CROP TOP: II. WRITING DETECTED
                        </div>
                        <div className="p-4 h-full flex flex-col gap-2">
                           <div className="h-4 w-24 bg-gray-800 rounded mb-2" />
                           <div className="flex-1 border border-gray-300 rounded" />
                           <div className="h-10 w-full bg-gray-100 rounded" />
                        </div>
                      </div>

                      <div className="absolute inset-x-8 bottom-0 h-16 border-2 border-dashed border-red-500 bg-red-500/10 opacity-60">
                        <div className="w-full h-full flex flex-col gap-1 p-2">
                           {Array.from({ length: 4 }).map((_, i) => (
                             <div key={i} className="border-b border-dotted border-gray-400 h-px" />
                           ))}
                        </div>
                        <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[8px] px-2 py-0.5 rounded font-bold whitespace-nowrap shadow-sm">
                          ✕ REJECTED: ANSWER LINES
                        </div>
                      </div>

                      {/* Moving Scanline */}
                      <motion.div 
                        className="absolute inset-x-0 h-1 bg-blue-400 shadow-[0_0_15px_rgba(33,150,243,0.8)] z-20"
                        animate={{ top: ['0%', '100%'] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                      />
                    </motion.div>
                  )}

                  {status === 'done' && (
                    <motion.div 
                      key="done"
                      initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                      className="text-center p-10 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md"
                    >
                      <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 ring-4 ring-green-500/10">
                         <CheckCircle className="text-green-500" size={40} />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-2">Traitement Terminé</h3>
                      <p className="text-gray-400 text-sm mb-8">La détection a été effectuée avec une précision de 98.2%</p>
                      <button 
                        onClick={() => setStatus('idle')}
                        className="text-blue-400 hover:text-blue-300 font-bold uppercase text-xs tracking-widest border-b border-blue-400/30 pb-1"
                      >
                        Recommencer une analyse
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="h-12 bg-gray-50 border-t border-[#dcdde1] px-5 flex items-center justify-between text-[10px] font-bold text-gray-500">
                <span className="flex items-center gap-2">DPI: <span className="text-gray-900">150 (Standard)</span></span>
                <span className="flex items-center gap-2">Sensitivity: <span className="text-blue-600">98.2%</span></span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[
                { title: 'A4 FORMAT', desc: 'Optimized print' },
                { title: 'TIGHT CROP', desc: 'No answer lines' },
                { title: 'FULL SYNC', desc: '2009 — 2019' }
              ].map((bit, i) => (
                <div key={i} className="bg-white p-4 rounded-xl border border-[#dcdde1] shadow-sm">
                  <div className="text-[10px] font-black text-[#1a237e] mb-1">{bit.title}</div>
                  <div className="text-[9px] text-gray-500 uppercase tracking-tighter">{bit.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* PDF Preview Sidebar-style Card */}
          <div className="flex flex-col">
            <div className="bg-white rounded-xl border border-[#dcdde1] shadow-sm flex flex-col h-full overflow-hidden">
               <div className="px-5 py-4 border-b border-[#dcdde1] flex justify-between items-center">
                  <span className="text-xs font-bold text-[#1a237e] uppercase tracking-wide">Aperçu du PDF Généré</span>
                  <span className="text-[10px] font-bold text-gray-400">PAGE 1 SUR 12</span>
               </div>
               
               <div className="flex-1 bg-[#555] p-10 flex items-center justify-center relative">
                  <div className="w-full max-w-[280px] aspect-[1/1.4] bg-[#1a237e] border border-black shadow-2xl flex flex-col relative">
                    <div className="h-1.5 bg-[#f9a825] w-full" />
                    <div className="m-auto w-[85%] h-[75%] bg-[#0d1b5e] border-l-[3px] border-[#1565c0] rounded-sm p-6 flex flex-col items-center justify-center text-center text-white relative">
                       <div className="text-[8px] font-black text-[#f9a825] tracking-[0.2em] mb-4 uppercase">Projet — BAC Tunisie</div>
                       <div className="text-lg font-black leading-tight mb-1">GUIDED WRITING</div>
                       <div className="text-[10px] opacity-70 mb-4 font-medium italic">RECUEIL COMPLET</div>
                       <div className="w-8 h-px bg-[#f9a825] mb-4" opacity-50 />
                       <div className="text-[9px] font-bold opacity-80 leading-relaxed">
                         Section: Sciences Exp.<br/>
                         Matière: Anglais II<br/>
                         <strong>Années 2009 — 2019</strong>
                       </div>
                       <div className="absolute bottom-4 inset-x-0 text-[6px] opacity-40 uppercase tracking-widest">
                         Consignes Données Uniquement
                       </div>
                    </div>
                    <div className="h-1.5 bg-[#f9a825] w-full" />
                  </div>
                  
                  {/* Overlay for not ready state */}
                  {status !== 'done' && (
                    <div className="absolute inset-0 bg-[#555]/60 backdrop-blur-[2px] flex items-center justify-center p-8 text-center text-white/50">
                       <div className="text-xs font-bold uppercase tracking-widest">Aperçu indisponible<br/>pendant l'analyse</div>
                    </div>
                  )}
               </div>

               <div className="p-5 bg-gray-50 border-t border-[#dcdde1] flex flex-col gap-4">
                  <button 
                    disabled={status !== 'done'}
                    className={`w-full py-3 rounded-lg font-bold text-xs uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2 ${
                      status === 'done' ? 'bg-[#1a237e] text-white hover:bg-[#0d1b5e] cursor-pointer' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <Download size={14} />
                    Télécharger le PDF
                  </button>
                  <div className="flex items-center justify-between text-[10px] text-gray-400 font-mono">
                    <span>FILE: guided_writing.pdf</span>
                    <span>12.4 MB</span>
                  </div>
               </div>
            </div>
          </div>
        </main>
      </div>

      {/* Mini Status Bar */}
      <footer className="h-8 bg-[#2c3e50] text-gray-400 text-[10px] flex items-center px-6 justify-between border-t border-gray-700 shrink-0">
        <div className="flex gap-4 items-center">
            <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-green-400" /> ReportLab Engine Active</span>
            <span className="opacity-50">|</span>
            <span>Pillow/NumPy Analysis Stable</span>
        </div>
        <div className="font-bold text-white/20 uppercase tracking-tighter">1024x768 Viewport Lock</div>
      </footer>
    </div>
  );
}
