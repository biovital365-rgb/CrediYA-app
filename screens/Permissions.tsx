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
    <div className="flex flex-col h-full w-full max-w-md mx-auto p-6 pt-8 mesh-gradient relative overflow-hidden animate-in slide-in-from-right duration-500">

      <header className="mb-10 relative z-10">
        <button onClick={onBack} className="w-12 h-12 rounded-2xl bg-white shadow-premium border border-white/60 flex items-center justify-center mb-10 hover:bg-gray-50 active:scale-95 transition-all">
          <span className="material-symbols-outlined text-cy-dark">arrow_back</span>
        </button>
        <h1 className="text-4xl font-black text-cy-dark mb-3 tracking-tighter leading-tight">Tu Huella <br />Digital <span className="text-cy-primary">👣</span></h1>
        <p className="text-gray-500 font-bold text-sm leading-relaxed uppercase tracking-tight">
          Sin papeles ni garantes. Tu comportamiento digital es tu crédito.
        </p>
      </header>

      <div className="space-y-4 flex-1 overflow-y-auto no-scrollbar pb-10 relative z-10">

        {/* Toggle 1 */}
        <Card variant="filled" className={`p-5 border-none transition-all duration-300 shadow-premium ${toggles.recharge ? 'bg-white' : 'bg-white/40 opacity-70'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${toggles.recharge ? 'bg-cy-primary text-white shadow-glow' : 'bg-gray-100 text-gray-400'}`}>
                <span className="material-symbols-outlined text-2xl">cell_tower</span>
              </div>
              <h3 className="font-black text-cy-dark uppercase tracking-tighter text-sm">Historial de Recargas</h3>
            </div>
            <div
              onClick={() => toggle('recharge')}
              className={`w-14 h-8 rounded-full p-1 cursor-pointer transition-colors ${toggles.recharge ? 'bg-cy-primary' : 'bg-gray-200'}`}
            >
              <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform ${toggles.recharge ? 'translate-x-6' : 'translate-x-0'}`}></div>
            </div>
          </div>
          <p className="text-[11px] text-gray-400 font-bold uppercase leading-relaxed pl-16">
            Analizamos la constancia de tus recargas telefónicas para estimar tu flujo de caja.
          </p>
        </Card>

        {/* Toggle 2 */}
        <Card variant="filled" className={`p-5 border-none transition-all duration-300 shadow-premium ${toggles.location ? 'bg-white' : 'bg-white/40 opacity-70'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${toggles.location ? 'bg-cy-teal text-white shadow-glow' : 'bg-gray-100 text-gray-400'}`}>
                <span className="material-symbols-outlined text-2xl">storefront</span>
              </div>
              <h3 className="font-black text-cy-dark uppercase tracking-tighter text-sm">Ubicación del Negocio</h3>
            </div>
            <div
              onClick={() => toggle('location')}
              className={`w-14 h-8 rounded-full p-1 cursor-pointer transition-colors ${toggles.location ? 'bg-cy-teal' : 'bg-gray-200'}`}
            >
              <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform ${toggles.location ? 'translate-x-6' : 'translate-x-0'}`}></div>
            </div>
          </div>
          <p className="text-[11px] text-gray-400 font-bold uppercase leading-relaxed pl-16">
            Verificamos que tienes un punto de venta estable para reducir tu tasa de interés.
          </p>
        </Card>

        {/* Toggle 3 */}
        <Card variant="filled" className={`p-5 border-none transition-all duration-300 shadow-premium ${toggles.device ? 'bg-white' : 'bg-white/40 opacity-70'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${toggles.device ? 'bg-cy-accent text-white shadow-glow' : 'bg-gray-100 text-gray-400'}`}>
                <span className="material-symbols-outlined text-2xl">smartphone</span>
              </div>
              <h3 className="font-black text-cy-dark uppercase tracking-tighter text-sm">ID del Dispositivo</h3>
            </div>
            <div
              onClick={() => toggle('device')}
              className={`w-14 h-8 rounded-full p-1 cursor-pointer transition-colors ${toggles.device ? 'bg-cy-accent' : 'bg-gray-200'}`}
            >
              <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform ${toggles.device ? 'translate-x-6' : 'translate-x-0'}`}></div>
            </div>
          </div>
          <p className="text-[11px] text-gray-400 font-bold uppercase leading-relaxed pl-16">
            Validamos que este celular es tuyo para prevenir fraudes de identidad (Bank-grade Security).
          </p>
        </Card>

        <Card className="bg-cy-dark/5 border-none p-5 rounded-3xl flex gap-4 items-start mt-6">
          <span className="material-symbols-outlined text-cy-primary text-xl mt-0.5">verified_user</span>
          <div>
            <p className="text-[11px] font-black text-cy-dark uppercase tracking-widest">Score 100% Digital</p>
            <p className="text-[10px] text-gray-400 font-bold uppercase leading-tight mt-1.5 opacity-80">
              Solo usamos metadatos para calcular tu crédito. Cumplimos con la normativa de la ASFI para Empresas Fintech.
            </p>
          </div>
        </Card>

      </div>

      <div className="mt-auto pb-8 relative z-20">
        <Button
          fullWidth
          onClick={onContinue}
          icon="rocket_launch"
          disabled={!allSelected}
          className={`h-16 text-lg shadow-neon ${!allSelected ? 'opacity-30' : 'bg-cy-dark'}`}
        >
          {allSelected ? 'CALCULAR MI SCORE' : 'ACTIVA TODO PARA SEGUIR'}
        </Button>
      </div>

    </div>
  );
};