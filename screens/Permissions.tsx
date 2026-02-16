import React, { useState } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';

interface PermissionsProps {
  onContinue: () => void;
  onBack: () => void;
}

export const Permissions: React.FC<PermissionsProps> = ({ onContinue, onBack }) => {
  const [toggles, setToggles] = useState({
    recharge: true,
    location: true,
    device: true,
  });

  const toggle = (key: keyof typeof toggles) => {
    setToggles(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const allSelected = Object.values(toggles).every(Boolean);

  return (
    <div className="flex flex-col h-full w-full max-w-md mx-auto p-6 pt-12 mesh-gradient relative overflow-hidden animate-in slide-in-from-right duration-500 transition-colors duration-500">

      <header className="mb-12 relative z-10 px-2">
        <button onClick={onBack} className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 shadow-premium border border-white dark:border-white/10 flex items-center justify-center mb-12 hover:scale-110 active:scale-95 transition-all text-slate-800 dark:text-white">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tighter leading-[0.9]">Confianza <br /><span className="text-cy-primary">Digital 👋</span></h1>
        <p className="text-slate-400 dark:text-slate-500 font-bold text-[11px] uppercase tracking-[0.2em] leading-relaxed max-w-[280px]">
          Usamos tu comportamiento técnico como garantía. Sin trámites físicos.
        </p>
      </header>

      <div className="space-y-4 flex-1 overflow-y-auto no-scrollbar pb-10 relative z-10 px-2">

        {/* Toggle 1 */}
        <Card variant="filled" className={`p-6 border-none transition-all duration-300 shadow-premium rounded-[32px] ${toggles.recharge ? 'bg-white dark:bg-slate-900' : 'bg-slate-50 dark:bg-slate-900/40 opacity-60'}`}>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-5">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${toggles.recharge ? 'bg-cy-primary/10 text-cy-primary shadow-glow' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                <span className="material-symbols-outlined text-[28px]">signal_cellular_alt</span>
              </div>
              <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-widest text-[13px]">Cash Flow</h3>
            </div>
            <div
              onClick={() => toggle('recharge')}
              className={`w-16 h-9 rounded-full p-1.5 cursor-pointer transition-all duration-300 ${toggles.recharge ? 'bg-cy-primary' : 'bg-slate-300 dark:bg-slate-700'}`}
            >
              <div className={`w-6 h-6 bg-white rounded-full shadow-lg transition-all duration-500 ease-spring ${toggles.recharge ? 'translate-x-7' : 'translate-x-0'}`}></div>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 font-bold uppercase leading-relaxed pl-1 shadow-none tracking-[0.05em]">
            Analizamos la constancia de tus recargas telefónicas para validar tus ingresos diarios.
          </p>
        </Card>

        {/* Toggle 2 */}
        <Card variant="filled" className={`p-6 border-none transition-all duration-300 shadow-premium rounded-[32px] ${toggles.location ? 'bg-white dark:bg-slate-900' : 'bg-slate-50 dark:bg-slate-900/40 opacity-60'}`}>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-5">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${toggles.location ? 'bg-cy-success/10 text-cy-success shadow-glow-green' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                <span className="material-symbols-outlined text-[28px]">location_on</span>
              </div>
              <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-widest text-[13px]">Geolocalización</h3>
            </div>
            <div
              onClick={() => toggle('location')}
              className={`w-16 h-9 rounded-full p-1.5 cursor-pointer transition-all duration-300 ${toggles.location ? 'bg-cy-success' : 'bg-slate-300 dark:bg-slate-700'}`}
            >
              <div className={`w-6 h-6 bg-white rounded-full shadow-lg transition-all duration-500 ease-spring ${toggles.location ? 'translate-x-7' : 'translate-x-0'}`}></div>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 font-bold uppercase leading-relaxed pl-1 tracking-[0.05em]">
            Verificamos tu punto de venta habitual para ofrecerte mejores tasas de interés sociales.
          </p>
        </Card>

        {/* Toggle 3 */}
        <Card variant="filled" className={`p-6 border-none transition-all duration-300 shadow-premium rounded-[32px] ${toggles.device ? 'bg-white dark:bg-slate-900' : 'bg-slate-50 dark:bg-slate-900/40 opacity-60'}`}>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-5">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${toggles.device ? 'bg-slate-800 text-white shadow-xl' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                <span className="material-symbols-outlined text-[28px]">fingerprint</span>
              </div>
              <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-widest text-[13px]">Safe ID</h3>
            </div>
            <div
              onClick={() => toggle('device')}
              className={`w-16 h-9 rounded-full p-1.5 cursor-pointer transition-all duration-300 ${toggles.device ? 'bg-slate-800 dark:bg-slate-700' : 'bg-slate-300 dark:bg-slate-700'}`}
            >
              <div className={`w-6 h-6 bg-white rounded-full shadow-lg transition-all duration-500 ease-spring ${toggles.device ? 'translate-x-7' : 'translate-x-0'}`}></div>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 font-bold uppercase leading-relaxed pl-1 tracking-[0.05em]">
            Tokenizamos tu dispositivo para prevenir robo de identidad y asegurar tus transferencias.
          </p>
        </Card>

        <div className="bg-cy-primary/5 dark:bg-cy-primary/10 p-6 rounded-[32px] flex gap-5 items-start mt-8 border border-cy-primary/10">
          <span className="material-symbols-outlined text-cy-primary text-[28px]">shield_person</span>
          <div>
            <p className="text-[12px] font-black text-slate-800 dark:text-white uppercase tracking-widest mb-1">Privacidad Extrema</p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase leading-tight tracking-wider opacity-80">
              Solo usamos metadatos técnicos. Nunca accedemos a tus mensajes, fotos ni contactos personales.
            </p>
          </div>
        </div>

      </div>

      <div className="mt-auto pb-10 relative z-20 px-2 lg:px-4">
        <Button
          fullWidth
          onClick={onContinue}
          icon="auto_awesome"
          disabled={!allSelected}
          className={`h-18 text-xl shadow-neon transition-all duration-500 ${!allSelected ? 'opacity-20 grayscale cursor-not-allowed' : 'bg-cy-dark dark:bg-cy-primary dark:text-white scale-105'}`}
        >
          {allSelected ? 'ANALIZAR MI SCORE' : 'ACTIVA TUS PERMISOS'}
        </Button>
      </div>

    </div>
  );
};