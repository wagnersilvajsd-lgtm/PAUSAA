import React, { useEffect } from 'react';
import { BellRing, CheckCircle2, Clock } from 'lucide-react';

export interface ActiveBreakAlert {
  operatorName: string;
  breakType: string;
  breakTime: string;
  breakKey: string;
  isTest: boolean;
}

interface BreakAlertModalProps {
  alert: ActiveBreakAlert | null;
  onAcknowledge: (alert: ActiveBreakAlert) => void;
}

export const BreakAlertModal: React.FC<BreakAlertModalProps> = ({
  alert,
  onAcknowledge,
}) => {
  useEffect(() => {
    if (!alert) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onAcknowledge(alert);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [alert, onAcknowledge]);

  if (!alert) return null;

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="break-alert-title"
      aria-describedby="break-alert-message"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-sm"
    >
      <div className="w-full max-w-xl bg-white border border-slate-200 rounded-2xl shadow-2xl p-8 sm:p-10 text-center">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mb-6">
          <BellRing className="w-8 h-8 text-amber-600" aria-hidden="true" />
        </div>

        <p className="text-sm font-medium text-amber-700 mb-3">
          {alert.isTest ? 'Simulação de Alerta de Pausa' : 'Aviso Automático · 10 Minutos Antes'}
        </p>

        <h2
          id="break-alert-title"
          className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 text-balance leading-snug"
        >
          Atenção, {alert.operatorName}! Sua {alert.breakType} começa em 10 minutos (às{' '}
          <span className="font-mono tabular-nums">{alert.breakTime}</span>).
        </h2>

        <p
          id="break-alert-message"
          className="mt-4 text-sm sm:text-base text-slate-600 leading-relaxed flex items-center justify-center gap-2"
        >
          <Clock className="w-4 h-4 text-slate-400 shrink-0" aria-hidden="true" />
          <span>Finalize o atendimento em curso antes do início da pausa.</span>
        </p>

        <div className="mt-8">
          <button
            type="button"
            autoFocus
            onClick={() => onAcknowledge(alert)}
            className="w-full sm:w-auto min-w-64 h-12 px-8 rounded-xl text-base font-semibold text-white bg-blue-700 hover:bg-blue-800 transition-colors inline-flex items-center justify-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 whitespace-nowrap"
          >
            <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
            <span>Ciente / Fechar Aviso</span>
          </button>
        </div>
      </div>
    </div>
  );
};
