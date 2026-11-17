import React, { useEffect, useState } from 'react';
import {
  Plus,
  RotateCcw,
  Save,
  Trash2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Operador, Pausa } from '../data/operadores';
import {
  ALERT_10_SECONDS,
  ALERT_5_SECONDS,
  formatSecondsToHHMM,
  parseHorarioToSeconds,
} from '../utils/schedule';

interface BreakEditorTabProps {
  operador: Operador;
  hasCustomOverride: boolean;
  onSaveOperatorBreaks: (operatorName: string, pausas: Pausa[]) => void;
  onResetOperatorBreaks: (operatorName: string) => void;
  onBackToPanel?: () => void;
}

function isValidTimeFormat(value: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

export const BreakEditorTab: React.FC<BreakEditorTabProps> = ({
  operador,
  hasCustomOverride,
  onSaveOperatorBreaks,
  onResetOperatorBreaks,
  onBackToPanel,
}) => {
  const [draftPausas, setDraftPausas] = useState<Pausa[]>(() =>
    operador.pausas.map((p) => ({ ...p })),
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    setDraftPausas(operador.pausas.map((p) => ({ ...p })));
  }, [operador]);

  const handleFieldChange = (
    index: number,
    field: keyof Pausa,
    value: string,
  ) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setDraftPausas((prev) =>
      prev.map((item, idx) =>
        idx === index ? { ...item, [field]: value } : item,
      ),
    );
  };

  const handleAddRow = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setDraftPausas((prev) => [
      ...prev,
      {
        tipo: `Pausa ${prev.length + 1}`,
        horario: '12:00',
        horarioFim: '12:10',
      },
    ]);
  };

  const handleRemoveRow = (index: number) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setDraftPausas((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const cleaned: Pausa[] = [];
    for (let i = 0; i < draftPausas.length; i++) {
      const row = draftPausas[i];
      const tipo = row.tipo.trim();
      const horario = row.horario.trim();
      const horarioFim = row.horarioFim?.trim() || undefined;

      if (!tipo) {
        setErrorMessage(`Informe o nome/tipo da pausa na linha ${i + 1}.`);
        return;
      }
      if (!isValidTimeFormat(horario)) {
        setErrorMessage(
          `Informe um horário de início válido (HH:MM) para "${tipo}".`,
        );
        return;
      }
      if (horarioFim && !isValidTimeFormat(horarioFim)) {
        setErrorMessage(
          `Informe um horário de término válido (HH:MM) para "${tipo}".`,
        );
        return;
      }

      cleaned.push(
        horarioFim ? { tipo, horario, horarioFim } : { tipo, horario },
      );
    }

    cleaned.sort(
      (a, b) =>
        parseHorarioToSeconds(a.horario) - parseHorarioToSeconds(b.horario),
    );

    onSaveOperatorBreaks(operador.nome, cleaned);
    setDraftPausas(cleaned.map((p) => ({ ...p })));
    setErrorMessage(null);
    setSuccessMessage(
      `Pausas de ${operador.nome} atualizadas. Os avisos automáticos de 10 e 5 minutos já utilizam os novos horários.`,
    );
  };

  const handleReset = () => {
    onResetOperatorBreaks(operador.nome);
    setErrorMessage(null);
    setSuccessMessage(
      `Pausas de ${operador.nome} restauradas para os horários padrão.`,
    );
  };

  return (
    <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
      <div className="px-6 sm:px-8 py-6 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            Alterar Pausas — {operador.nome}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Ajuste os horários deste operador para validar a contagem regressiva e os disparos automáticos com voz (10m e 5m antes).
          </p>
        </div>

        {onBackToPanel && (
          <button
            type="button"
            onClick={onBackToPanel}
            className="h-9 px-3.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/70 text-sm font-medium text-slate-700 dark:text-slate-200 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:focus-visible:ring-blue-400"
          >
            Voltar ao Painel
          </button>
        )}
      </div>

      <form onSubmit={handleSave} className="p-6 sm:p-8 space-y-6">
        {draftPausas.length === 0 ? (
          <div className="py-10 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Nenhuma pausa cadastrada para este operador.
            </p>
            <button
              type="button"
              onClick={handleAddRow}
              className="mt-4 h-10 px-4 rounded-lg text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 transition-colors inline-flex items-center gap-2 whitespace-nowrap"
            >
              <Plus className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Adicionar Primeira Pausa</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="hidden md:grid md:grid-cols-12 gap-4 px-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <div className="col-span-4">Tipo da Pausa</div>
              <div className="col-span-2">Início</div>
              <div className="col-span-2">Término (opcional)</div>
              <div className="col-span-3 text-right">Avisos (10m · 5m)</div>
              <div className="col-span-1 text-right">Ação</div>
            </div>

            {draftPausas.map((pausa, index) => {
              const valid = isValidTimeFormat(pausa.horario);
              const startSec = valid ? parseHorarioToSeconds(pausa.horario) : 0;
              const alert10 = valid
                ? formatSecondsToHHMM(startSec - ALERT_10_SECONDS)
                : '--:--';
              const alert5 = valid
                ? formatSecondsToHHMM(startSec - ALERT_5_SECONDS)
                : '--:--';

              return (
                <div
                  key={index}
                  className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 items-center p-4 md:p-3 rounded-lg bg-slate-50/70 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800"
                >
                  <div className="md:col-span-4">
                    <label
                      htmlFor={`pausa-tipo-${index}`}
                      className="block md:hidden text-xs font-medium text-slate-500 dark:text-slate-400 mb-1"
                    >
                      Tipo da Pausa
                    </label>
                    <input
                      id={`pausa-tipo-${index}`}
                      type="text"
                      value={pausa.tipo}
                      onChange={(e) =>
                        handleFieldChange(index, 'tipo', e.target.value)
                      }
                      placeholder="Ex: Pausa 1, Lanche, Almoço"
                      className="w-full h-10 px-3 text-sm text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:border-blue-600 dark:focus:border-blue-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label
                      htmlFor={`pausa-inicio-${index}`}
                      className="block md:hidden text-xs font-medium text-slate-500 dark:text-slate-400 mb-1"
                    >
                      Início
                    </label>
                    <input
                      id={`pausa-inicio-${index}`}
                      type="time"
                      value={pausa.horario}
                      onChange={(e) =>
                        handleFieldChange(index, 'horario', e.target.value)
                      }
                      className="w-full h-10 px-3 text-sm font-mono tabular-nums text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:border-blue-600 dark:focus:border-blue-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label
                      htmlFor={`pausa-fim-${index}`}
                      className="block md:hidden text-xs font-medium text-slate-500 dark:text-slate-400 mb-1"
                    >
                      Término (opcional)
                    </label>
                    <input
                      id={`pausa-fim-${index}`}
                      type="time"
                      value={pausa.horarioFim ?? ''}
                      onChange={(e) =>
                        handleFieldChange(index, 'horarioFim', e.target.value)
                      }
                      className="w-full h-10 px-3 text-sm font-mono tabular-nums text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:border-blue-600 dark:focus:border-blue-500"
                    />
                  </div>

                  <div className="md:col-span-3 flex items-center justify-between md:justify-end text-xs font-mono tabular-nums text-slate-600 dark:text-slate-400">
                    <span className="md:hidden font-sans">Avisos (10m · 5m):</span>
                    <span>
                      {alert10} · {alert5}
                    </span>
                  </div>

                  <div className="md:col-span-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleRemoveRow(index)}
                      aria-label={`Remover ${pausa.tipo || 'pausa'}`}
                      className="h-10 w-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-red-50 dark:hover:bg-red-950/40 text-slate-500 hover:text-red-700 dark:text-slate-400 dark:hover:text-red-400 transition-colors inline-flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
                    >
                      <Trash2 className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {errorMessage && (
          <div
            role="alert"
            className="flex items-center gap-2.5 text-sm text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/70 rounded-lg px-4 py-3"
          >
            <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div
            role="status"
            className="flex items-center gap-2.5 text-sm text-emerald-800 dark:text-emerald-200 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/70 rounded-lg px-4 py-3"
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>{successMessage}</span>
          </div>
        )}

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleAddRow}
            className="h-11 px-4 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/70 transition-colors inline-flex items-center justify-center gap-2 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:focus-visible:ring-blue-400"
          >
            <Plus className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Adicionar Pausa</span>
          </button>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {hasCustomOverride && (
              <button
                type="button"
                onClick={handleReset}
                className="h-11 px-4 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors inline-flex items-center justify-center gap-2 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:focus-visible:ring-blue-400"
              >
                <RotateCcw className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>Restaurar Padrão</span>
              </button>
            )}

            <button
              type="submit"
              className="h-11 px-6 rounded-lg text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 transition-colors inline-flex items-center justify-center gap-2 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:focus-visible:ring-blue-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
            >
              <Save className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Salvar Alterações</span>
            </button>
          </div>
        </div>
      </form>
    </section>
  );
};
