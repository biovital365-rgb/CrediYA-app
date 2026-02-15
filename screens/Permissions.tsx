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
    <div className="flex flex-col h-full w-full max-w-md mx-auto p-5 pt-8 animate-in slide-in-from-right duration-300 bg-white">
      
      <header className="mb-6">
        <button onClick={onBack} className="flex items-center text-cy-primary font-bold mb-4 hover:bg-cy-primary/5 rounded-lg w-fit px-2 py-1 -ml-2 transition-colors">
          <span className="material-symbols-outlined mr-1">arrow_back_ios_new</span> Volver
        </button>
        <h1 className="text-3xl font-extrabold text-cy-dark mb-2 tracking-tight">Tu Huella Digital 👣</h1>
        <p className="text-gray-500 text-lg leading-relaxed">
          En <span className="font-bold text-cy-primary">CrediYA</span> no pedimos papeles de casa ni garantes. Tu comportamiento digital es tu garantía.
        </p>
      </header>

      <div className="space-y-4 flex-1 overflow-y-auto no-scrollbar pb-6">
        
        {/* Toggle 1: Alternative Scoring (Telco) */}
        <div className={`p-4 rounded-2xl border-2 transition-all duration-300 ${toggles.recharge ? 'border-cy-primary/20 bg-cy-primary/5' : 'border-gray-100 bg-white'}`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${toggles.recharge ? 'bg-cy-primary text-white' : 'bg-gray-100 text-gray-400'}`}>
                  <span className="material-symbols-outlined">cell_tower</span>
              </div>
              <h3 className="font-bold text-cy-dark">Historial de Recargas</h3>
            </div>
            <div 
              onClick={() => toggle('recharge')}
              className={`w-12 h-7 rounded-full p-1 cursor-pointer transition-colors ${toggles.recharge ? 'bg-cy-primary' : 'bg-gray-200'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${toggles.recharge ? 'translate-x-5' : 'translate-x-0'}`}></div>
            </div>
          </div>
          <p className="text-xs text-gray-500 pl-[52px]">
            Analizamos la constancia de tus recargas telefónicas para estimar tu flujo de caja diario.
          </p>
        </div>

        {/* Toggle 2: Geolocation (Stability) */}
        <div className={`p-4 rounded-2xl border-2 transition-all duration-300 ${toggles.location ? 'border-cy-teal/20 bg-cy-teal/5' : 'border-gray-100 bg-white'}`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${toggles.location ? 'bg-cy-teal text-white' : 'bg-gray-100 text-gray-400'}`}>
                  <span className="material-symbols-outlined">storefront</span>
              </div>
              <h3 className="font-bold text-cy-dark">Ubicación del Negocio</h3>
            </div>
            <div 
              onClick={() => toggle('location')}
              className={`w-12 h-7 rounded-full p-1 cursor-pointer transition-colors ${toggles.location ? 'bg-cy-teal' : 'bg-gray-200'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${toggles.location ? 'translate-x-5' : 'translate-x-0'}`}></div>
            </div>
          </div>
          <p className="text-xs text-gray-500 pl-[52px]">
            Verificamos que tienes un punto de venta estable (geocerca) para reducir tu tasa de riesgo.
          </p>
        </div>

        {/* Toggle 3: Device ID (Fraud Prevention) */}
        <div className={`p-4 rounded-2xl border-2 transition-all duration-300 ${toggles.device ? 'border-cy-accent/20 bg-cy-accent/5' : 'border-gray-100 bg-white'}`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${toggles.device ? 'bg-cy-accent text-white' : 'bg-gray-100 text-gray-400'}`}>
                  <span className="material-symbols-outlined">smartphone</span>
              </div>
              <h3 className="font-bold text-cy-dark">Identidad del Dispositivo</h3>
            </div>
            <div 
              onClick={() => toggle('device')}
              className={`w-12 h-7 rounded-full p-1 cursor-pointer transition-colors ${toggles.device ? 'bg-cy-accent' : 'bg-gray-200'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${toggles.device ? 'translate-x-5' : 'translate-x-0'}`}></div>
            </div>
          </div>
          <p className="text-xs text-gray-500 pl-[52px]">
            Validamos que este celular es tuyo para prevenir fraudes de identidad (Device Fingerprinting).
          </p>
        </div>

        <div className="bg-gray-50 p-4 rounded-xl flex gap-3 items-start border border-gray-100 mt-4">
            <span className="material-symbols-outlined text-gray-400 text-lg mt-0.5">lock_clock</span>
            <div>
                <p className="text-xs font-bold text-gray-700">Privacidad Primero</p>
                <p className="text-[10px] text-gray-500 leading-tight mt-1">
                    Solo usamos metadatos para calcular tu Score. Cumplimos con la normativa de la ASFI para Empresas de Tecnología Financiera (ETF).
                </p>
            </div>
        </div>

      </div>

      <div className="mt-4 pb-6 bg-white">
        <Button 
            fullWidth 
            onClick={onContinue} 
            icon="analytics"
            disabled={!allSelected}
            className={!allSelected ? 'opacity-50 cursor-not-allowed bg-gray-300' : ''}
        >
          {allSelected ? 'Calcular mi Score' : 'Activa todo para seguir'}
        </Button>
      </div>

    </div>
  );
};