import React, { useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Button } from '../components/Button';

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

      // 1. Upload to Storage
      const { error: uploadError } = await supabase.storage
        .from('kyc')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. If it's the last step, update profile to verified
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
    <div className="flex flex-col h-full w-full max-w-md mx-auto bg-cy-dark text-white relative animate-in fade-in duration-300">

      {/* Hidden File Input */}
      <input
        type="file"
        accept="image/*"
        capture="environment"
        ref={fileInputRef}
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Top Bar */}
      <div className="absolute top-0 left-0 w-full p-6 z-20 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
        <button onClick={onBack} className="text-white hover:bg-white/10 rounded-full p-1 transition-colors">
          <span className="material-symbols-outlined text-3xl">close</span>
        </button>
        <div className="text-sm font-bold bg-white/10 px-4 py-1.5 rounded-full backdrop-blur-md border border-white/10">
          {step} / 2
        </div>
      </div>

      {/* Main Viewfinder Area */}
      <div className="flex-1 relative flex flex-col items-center justify-center p-6">

        <div className="absolute inset-0 bg-gray-900 z-0 overflow-hidden">
          <div className="w-full h-full opacity-40 bg-[url('https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=1000')] bg-cover bg-center mix-blend-overlay"></div>
        </div>

        {/* Overlay Guides */}
        <div className="relative z-10 w-full flex flex-col items-center">

          {step === 1 ? (
            <div className="w-full aspect-[1.58] border-[3px] border-white/30 rounded-2xl relative overflow-hidden backdrop-blur-[2px]">
              <div className="absolute top-0 left-0 w-10 h-10 border-t-[4px] border-l-[4px] border-cy-teal rounded-tl-2xl"></div>
              <div className="absolute top-0 right-0 w-10 h-10 border-t-[4px] border-r-[4px] border-cy-teal rounded-tr-2xl"></div>
              <div className="absolute bottom-0 left-0 w-10 h-10 border-b-[4px] border-l-[4px] border-cy-teal rounded-bl-2xl"></div>
              <div className="absolute bottom-0 right-0 w-10 h-10 border-b-[4px] border-r-[4px] border-cy-teal rounded-br-2xl"></div>

              {isUploading && (
                <div className="absolute top-0 left-0 w-full h-1 bg-cy-primary shadow-[0_0_20px_#6366F1] animate-[scan_2s_infinite]"></div>
              )}

              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white font-bold bg-black/50 px-4 py-2 rounded-xl backdrop-blur-md border border-white/10">
                  Frente de tu C.I.
                </span>
              </div>
            </div>
          ) : (
            <div className="w-64 h-80 border-[3px] border-white/30 rounded-[100px] relative overflow-hidden backdrop-blur-[2px]">
              {isUploading && (
                <div className="absolute inset-0 border-[4px] border-cy-accent rounded-[100px] animate-pulse shadow-[0_0_30px_#F43F5E]"></div>
              )}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white font-bold bg-black/50 px-4 py-2 rounded-xl backdrop-blur-md border border-white/10 text-center">
                  {isUploading ? "Analizando rostro..." : "Tómate una Selfie 🤳"}
                </span>
              </div>
            </div>
          )}

          <div className="mt-10 text-center space-y-2">
            <h2 className="text-3xl font-extrabold tracking-tight">
              {step === 1 ? "Foto de tu Identidad" : "Verificación Facial"}
            </h2>
            <p className="text-gray-300 text-sm max-w-xs mx-auto font-medium">
              {step === 1
                ? "Asegúrate de que tus datos sean legibles."
                : "Mira a la cámara y sonríe."}
            </p>
            {error && <p className="text-cy-accent text-xs font-bold mt-2 bg-cy-accent/10 p-2 rounded-lg">{error}</p>}
          </div>
        </div>

      </div>

      {/* Bottom Controls */}
      <div className="p-8 pb-10 bg-cy-dark z-10 flex flex-col items-center gap-6 rounded-t-[40px] shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">

        {!isUploading ? (
          <button
            onClick={triggerFileSelect}
            className="w-20 h-20 rounded-full border-[6px] border-white flex items-center justify-center bg-transparent active:bg-cy-primary active:border-cy-primary transition-all scale-100 hover:scale-105"
          >
            <div className="w-16 h-16 bg-white rounded-full"></div>
          </button>
        ) : (
          <div className="h-20 flex flex-col items-center justify-center gap-2">
            <div className="w-8 h-8 border-4 border-cy-teal border-t-transparent rounded-full animate-spin"></div>
            <span className="text-cy-teal font-bold text-sm animate-pulse">Subiendo...</span>
          </div>
        )}

        <div className="flex gap-4 items-center opacity-60">
          <div className="flex items-center gap-1 text-[11px] text-gray-300 font-medium">
            <span className="material-symbols-outlined text-sm text-cy-teal">verified_user</span>
            Verificación Segura con CrediYA
          </div>
        </div>

      </div>

      <style>{`
        @keyframes scan {
            0% { top: 0%; opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};