import React, { useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Card } from '../components/Card';

interface KYCProps {
  onComplete: () => void;
  onBack: () => void;
}

export const KYC: React.FC<KYCProps> = ({ onComplete, onBack }) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${step === 1 ? 'id_front' : 'selfie'}_${Date.now()}.${fileExt}`;
      const filePath = `kyc-docs/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('kyc')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      if (step === 2) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ kyc_verified: true })
          .eq('id', user.id);

        if (profileError) throw profileError;
        onComplete();
      } else {
        setStep(2);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col h-full w-full max-w-md mx-auto bg-cy-dark text-white relative overflow-hidden animate-in fade-in duration-500">

      <input
        type="file"
        accept="image/*"
        capture="environment"
        ref={fileInputRef}
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Static Header Overlays */}
      <div className="absolute top-0 left-0 w-full p-8 z-20 flex justify-between items-center bg-gradient-to-b from-black/60 to-transparent">
        <button onClick={onBack} className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-xl border border-white/10 hover:bg-white/20 transition-all">
          <span className="material-symbols-outlined text-2xl">close</span>
        </button>
        <div className="text-[10px] font-black bg-cy-primary/20 text-cy-primary px-5 py-2 rounded-full backdrop-blur-xl border border-cy-primary/20 tracking-[0.2em]">
          PASO {step} / 2
        </div>
      </div>

      {/* Main Viewfinder Section */}
      <div className="flex-1 relative flex flex-col items-center justify-center p-8">

        {/* Background Visual Texture */}
        <div className="absolute inset-0 bg-slate-900 z-0 overflow-hidden">
          <div className="w-full h-full opacity-30 bg-[url('https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=1000')] bg-cover bg-center mix-blend-color-dodge"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-cy-dark via-transparent to-transparent"></div>
        </div>

        {/* Guides Rendering */}
        <div className="relative z-10 w-full flex flex-col items-center animate-in zoom-in duration-500">
          {step === 1 ? (
            <div className="w-full aspect-[1.58] border-[3px] border-white/20 rounded-[32px] relative overflow-hidden backdrop-blur-[4px] shadow-2xl">
              <div className="absolute top-4 left-4 w-12 h-12 border-t-8 border-l-8 border-cy-teal rounded-tl-xl opacity-80"></div>
              <div className="absolute top-4 right-4 w-12 h-12 border-t-8 border-r-8 border-cy-teal rounded-tr-xl opacity-80"></div>
              <div className="absolute bottom-4 left-4 w-12 h-12 border-b-8 border-l-8 border-cy-teal rounded-bl-xl opacity-80"></div>
              <div className="absolute bottom-4 right-4 w-12 h-12 border-b-8 border-r-8 border-cy-teal rounded-br-xl opacity-80"></div>

              {isUploading && (
                <div className="absolute top-0 left-0 w-full h-1.5 bg-cy-teal shadow-[0_0_30px_#2DD4BF] animate-[scan_2s_infinite]"></div>
              )}

              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[10px] font-black text-white/90 bg-black/40 px-6 py-2.5 rounded-2xl backdrop-blur-md border border-white/10 uppercase tracking-widest">
                  {isUploading ? "Analizando..." : "Frente del carnet"}
                </span>
              </div>
            </div>
          ) : (
            <div className="w-64 h-80 border-[3px] border-white/20 rounded-[120px] relative overflow-hidden backdrop-blur-[4px] shadow-2xl">
              {isUploading && (
                <div className="absolute inset-0 border-[6px] border-cy-accent rounded-[120px] animate-pulse shadow-[0_0_40px_#F43F5E]"></div>
              )}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[10px] font-black text-white bg-black/50 px-6 py-3 rounded-2xl backdrop-blur-md border border-white/10 text-center uppercase tracking-widest leading-relaxed">
                  {isUploading ? "Verificando Bio..." : "Selfie del Rostro 🤳"}
                </span>
              </div>
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-32 h-1 rounded-full bg-white/10"></div>
            </div>
          )}

          <div className="mt-12 text-center space-y-4">
            <h2 className="text-4xl font-black tracking-tighter leading-tight">
              {step === 1 ? "Sube tu Identidad" : "Validación Bio"}
            </h2>
            <p className="text-gray-400 text-[13px] max-w-[240px] mx-auto font-bold uppercase tracking-tight leading-relaxed opacity-80">
              {step === 1
                ? "Coloca tu documento frente a la cámara con buena luz."
                : "Posiciona tu cara dentro del marco y mantente quieto."}
            </p>
            {error && (
              <Card className="bg-cy-accent/20 border border-cy-accent/40 p-4 mt-4 animate-in shake duration-300">
                <p className="text-[11px] text-cy-accent font-black uppercase tracking-tight">{error}</p>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-10 pb-12 bg-cy-dark relative z-20 flex flex-col items-center gap-8 rounded-t-[56px] shadow-[0_-20px_60px_rgba(0,0,0,0.8)] border-t border-white/5">
        {!isUploading ? (
          <button
            onClick={triggerFileSelect}
            className="w-24 h-24 rounded-full border-[8px] border-white/10 flex items-center justify-center bg-transparent active:scale-90 transition-all group relative overflow-visible"
          >
            <div className="absolute inset-0 rounded-full border-4 border-cy-primary/30 animate-ping"></div>
            <div className="w-20 h-20 bg-white rounded-full shadow-2xl group-hover:bg-cy-primary transition-colors flex items-center justify-center">
              <span className="material-symbols-outlined text-cy-dark group-hover:text-white text-3xl">photo_camera</span>
            </div>
          </button>
        ) : (
          <div className="h-24 flex flex-col items-center justify-center gap-4">
            <div className="w-10 h-10 border-[4px] border-cy-teal/20 border-t-cy-teal rounded-full animate-spin"></div>
            <span className="text-cy-teal text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">Procesando</span>
          </div>
        )}

        <div className="flex gap-2 items-center">
          <span className="material-symbols-outlined text-cy-teal text-[18px]">verified</span>
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Safe & Encryption by CrediYA Vault</span>
        </div>
      </div>

      <style>{`
        @keyframes scan {
            0% { top: 0%; opacity: 0; }
            15% { opacity: 1; }
            85% { opacity: 1; }
            100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};