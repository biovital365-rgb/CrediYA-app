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
      const fileName = `${step === 1 ? 'id_front' : 'selfie'}_${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

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
    <div className="flex flex-col h-full w-full max-w-md mx-auto bg-slate-900 dark:bg-black text-white relative overflow-hidden animate-in fade-in duration-500">

      <input
        type="file"
        accept="image/*"
        capture="environment"
        ref={fileInputRef}
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Static Header Overlays */}
      <div className="absolute top-0 left-0 w-full p-8 z-20 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
        <button onClick={onBack} className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-xl border border-white/5 hover:bg-white/20 transition-all">
          <span className="material-symbols-outlined text-2xl">close</span>
        </button>
        <div className="text-[10px] font-black bg-cy-primary text-white px-5 py-2.5 rounded-full shadow-lg tracking-[0.2em] uppercase">
          Pasos Verificación: {step}/2
        </div>
      </div>

      {/* Main Viewfinder Section */}
      <div className="flex-1 relative flex flex-col items-center justify-center p-8">

        {/* Background Visual Texture */}
        <div className="absolute inset-0 bg-slate-950 z-0 overflow-hidden">
          <div className="w-full h-full opacity-20 bg-[url('https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=1000')] bg-cover bg-center mix-blend-color-dodge"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black"></div>
        </div>

        {/* Guides Rendering */}
        <div className="relative z-10 w-full flex flex-col items-center animate-in zoom-in-95 duration-700">
          {step === 1 ? (
            <div className="w-full aspect-[1.58] border-[3px] border-white/10 rounded-[40px] relative overflow-hidden backdrop-blur-[4px] shadow-2xl bg-white/5">
              <div className="absolute top-6 left-6 w-14 h-14 border-t-8 border-l-8 border-cy-primary rounded-tl-2xl opacity-80"></div>
              <div className="absolute top-6 right-6 w-14 h-14 border-t-8 border-r-8 border-cy-primary rounded-tr-2xl opacity-80"></div>
              <div className="absolute bottom-6 left-6 w-14 h-14 border-b-8 border-l-8 border-cy-primary rounded-bl-2xl opacity-80"></div>
              <div className="absolute bottom-6 right-6 w-14 h-14 border-b-8 border-r-8 border-cy-primary rounded-br-2xl opacity-80"></div>

              {isUploading && (
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-cy-primary to-cy-success shadow-[0_0_35px_#f97316] animate-[scan_2.5s_infinite]"></div>
              )}

              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-black/60 px-8 py-3 rounded-2xl backdrop-blur-md border border-white/10 flex items-center gap-3">
                  <span className="material-symbols-outlined text-cy-primary">badge</span>
                  <span className="text-[11px] font-black text-white/90 uppercase tracking-[0.2em]">Frente del Documento</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-72 h-80 border-[3px] border-white/10 rounded-[120px] relative overflow-hidden backdrop-blur-[4px] shadow-2xl bg-white/5">
              {isUploading && (
                <div className="absolute inset-0 border-[8px] border-cy-success rounded-[120px] animate-pulse shadow-[0_0_50px_#10b981]"></div>
              )}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-black/60 px-8 py-4 rounded-2xl backdrop-blur-md border border-white/10 flex flex-col items-center gap-2">
                  <span className="material-symbols-outlined text-4xl text-cy-success">face</span>
                  <span className="text-[11px] font-black text-white text-center uppercase tracking-[0.2em] leading-relaxed">
                    {isUploading ? "Analizando Rostro..." : "Tómate una Selfie"}
                  </span>
                </div>
              </div>
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-40 h-1.5 rounded-full bg-white/10"></div>
            </div>
          )}

          <div className="mt-16 text-center space-y-4">
            <h2 className="text-4xl font-black tracking-tighter leading-tight uppercase">
              {step === 1 ? "Validar I.D." : "Bio-Seguridad"}
            </h2>
            <p className="text-white/40 text-[13px] max-w-[260px] mx-auto font-bold uppercase tracking-widest leading-relaxed opacity-80 px-4">
              {step === 1
                ? "Coloca tu cédula dentro del marco. Evita reflejos de luz."
                : "Alinea tu cara y mantén una expresión neutra."}
            </p>
            {error && (
              <Card className="bg-red-500/20 border border-red-500/40 p-4 mt-8 animate-in shake duration-300">
                <p className="text-[11px] text-red-500 font-black uppercase tracking-widest leading-tight">{error}</p>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-12 pb-14 bg-slate-950 relative z-20 flex flex-col items-center gap-10 rounded-t-[64px] shadow-[0_-25px_80px_rgba(0,0,0,0.9)] border-t border-white/5 transition-all duration-500">
        {!isUploading ? (
          <button
            onClick={triggerFileSelect}
            className="w-28 h-28 rounded-full border-[10px] border-white/5 flex items-center justify-center bg-transparent active:scale-90 transition-all group relative overflow-visible"
          >
            <div className="absolute inset-[-10px] rounded-full border-4 border-cy-primary/30 animate-pulse"></div>
            <div className="w-22 h-22 bg-white rounded-full shadow-[0_0_50px_rgba(255,255,255,0.3)] group-hover:bg-cy-primary transition-colors flex items-center justify-center">
              <span className="material-symbols-outlined text-slate-900 group-hover:text-white text-4xl font-bold">photo_camera</span>
            </div>
          </button>
        ) : (
          <div className="h-28 flex flex-col items-center justify-center gap-6">
            <div className="w-12 h-12 border-[4px] border-cy-primary/20 border-t-cy-primary rounded-full animate-spin shadow-glow"></div>
            <span className="text-cy-primary text-[11px] font-black uppercase tracking-[0.4em] animate-pulse">Encriptando</span>
          </div>
        )}

        <div className="flex gap-3 items-center bg-white/5 py-2 px-6 rounded-full border border-white/5">
          <span className="material-symbols-outlined text-cy-success text-[18px]">verified_user</span>
          <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Bank-Grade Security</span>
        </div>
      </div>

      <style>{`
        @keyframes scan {
            0% { top: 0%; opacity: 0; }
            20% { opacity: 1; }
            80% { opacity: 1; }
            100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};