import React, { useEffect, useState } from 'react';
import {
  Bell,
  BellOff,
  CheckCircle2,
  Clock,
  LogOut,
  Moon,
  Pencil,
  Sun,
  Volume2,
  VolumeX,
  Timer,
} from 'lucide-react';
import { getOperatorAlertStages, Operador, Pausa } from '../data/operadores';
import { BreakEditorTab } from './BreakEditorTab';
import {
  EnrichedPausa,
  formatCountdown,
  formatDateLongPtBr,
  formatTimeClock,
  getSecondsOfDay,
} from '../utils/schedule';
import { NotificationPermissionState } from '../utils/audioAndNotification';

type DashboardTab = 'panel' | 'edit';

interface OperatorDashboardProps {
  operador: Operador;
  customSchedules: Record<string, Pausa[]>;
  now: Date;
  pausas: EnrichedPausa[];
  audioUnlocked: boolean;
  notificationPermission: NotificationPermissionState;
  activationFeedback: string | null;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onActivateAlerts: () => void;
  onSaveOperatorBreaks: (operatorName: string, pausas: Pausa[]) => void;
  onResetOperatorBreaks: (operatorName: string) => void;
  onSwitchOperator: () => void;
}

export const OperatorDashboard: React.FC<OperatorDashboardProps> = ({
  operador,
  customSchedules,
  now,
  pausas,
  audioUnlocked,
  notificationPermission,
  activationFeedback,
  theme,
  onToggleTheme,
  onActivateAlerts,
  onSaveOperatorBreaks,
  onResetOperatorBreaks,
  onSwitchOperator,
}) => {
  const isTestOperator = operador.nome === 'OPERADOR TESTE';
  const [firstAlertMin, secondAlertMin] = getOperatorAlertStages(operador.nome);
  const [activeTab, setActiveTab] = useState<DashboardTab>('panel');

  useEffect(() => {
    setActiveTab('panel');
  }, [operador.nome]);
  const nowSeconds = getSecondsOfDay(now);
  const nextBreak = pausas.find((p) => p.status === 'proxima') ?? null;
  const completedCount = pausas.filter((p) => p.status === 'concluida').length;

  const countdownSeconds = nextBreak
    ? Math.max(0, nextBreak.startSeconds - nowSeconds)
    : 0;

  const notificationStatusLabel = (() => {
    switch (notificationPermission) {
      case 'granted':
        return 'Permitidas pelo navegador';
      case 'denied':
        return 'Bloqueadas nas configurações do navegador';
      case 'unsupported':
        return 'Não suportadas neste navegador';
      default:
        return 'Aguardando permissão';
    }
  })();

  const allReady = audioUnlocked && notificationPermission === 'granted';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors">
      <header className="w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between gap-6">
          <div className="flex items-center gap-3 whitespace-nowrap shrink-0">
            <img
              src="/assets/aistudio/image_0674f66e.png"
              alt="JSD Telecom"
              referrerPolicy="no-referrer"
              className="w-8 h-8 rounded-md object-contain bg-white p-0.5 border border-slate-200 dark:border-slate-700 shrink-0"
            />
            <span className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              Sinalizador de Pausas
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <span className="hidden md:inline text-sm text-slate-600 dark:text-slate-400 truncate max-w-xs">
              Operador:{' '}
              <strong className="font-semibold text-slate-900 dark:text-slate-100">
                {operador.nome}
              </strong>
            </span>

            <button
              type="button"
              onClick={onToggleTheme}
              aria-label={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
              className="h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-medium text-slate-700 dark:text-slate-200 transition-colors inline-flex items-center gap-2 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:focus-visible:ring-blue-400"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400 shrink-0" aria-hidden="true" />
                  <span className="hidden sm:inline">Modo Claro</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-slate-500 shrink-0" aria-hidden="true" />
                  <span className="hidden sm:inline">Modo Escuro</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onSwitchOperator}
              className="h-9 px-3.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white transition-colors inline-flex items-center gap-2 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:focus-visible:ring-blue-400"
            >
              <LogOut className="w-4 h-4 text-slate-500 dark:text-slate-400" aria-hidden="true" />
              <span>Trocar Operador</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-5xl mx-auto px-6 py-8 sm:py-10 space-y-6">
        {isTestOperator && (
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div
              role="tablist"
              aria-label="Seções do painel"
              className="inline-flex items-center gap-1 p-1 bg-slate-200/70 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg"
            >
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'panel'}
                onClick={() => setActiveTab('panel')}
                className={`h-9 px-4 rounded-md text-sm font-medium transition-colors inline-flex items-center gap-2 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:focus-visible:ring-blue-400 ${
                  activeTab === 'panel'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Clock className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>Painel do Operador</span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'edit'}
                onClick={() => setActiveTab('edit')}
                className={`h-9 px-4 rounded-md text-sm font-medium transition-colors inline-flex items-center gap-2 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:focus-visible:ring-blue-400 ${
                  activeTab === 'edit'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Pencil className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>Edição de Pausas</span>
              </button>
            </div>
          </div>
        )}

        {isTestOperator && activeTab === 'edit' ? (
          <BreakEditorTab
            operador={operador}
            hasCustomOverride={Boolean(customSchedules[operador.nome])}
            onSaveOperatorBreaks={onSaveOperatorBreaks}
            onResetOperatorBreaks={onResetOperatorBreaks}
            onBackToPanel={() => setActiveTab('panel')}
          />
        ) : (
          <div className="space-y-8">
            {/* Linha principal: Relógio + Contagem Regressiva e Controles de Alerta */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-7 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-slate-500 dark:text-slate-400">
                <span>{formatDateLongPtBr(now)}</span>
                <span className="md:hidden font-medium text-slate-700 dark:text-slate-300">
                  {operador.nome}
                </span>
              </div>

              <h1 className="mt-2 text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 text-balance">
                Olá, {operador.nome}
              </h1>

              <div className="mt-6">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                  Horário atual
                </p>
                <div
                  aria-live="off"
                  className="font-mono tabular-nums text-5xl sm:text-6xl font-bold tracking-tight text-slate-900 dark:text-slate-50 leading-none"
                >
                  {formatTimeClock(now)}
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
              {nextBreak ? (
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      Contagem regressiva para a próxima pausa
                    </p>
                    <p className="mt-1 text-base font-semibold text-slate-900 dark:text-slate-100">
                      {nextBreak.tipo}{' '}
                      <span className="text-slate-400 dark:text-slate-600 font-normal">·</span>{' '}
                      <span className="font-mono tabular-nums">
                        às {nextBreak.horario}
                      </span>
                    </p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                      Avisos automáticos às {nextBreak.firstAlertHorario} ({nextBreak.firstAlertMinutes}m) e {nextBreak.secondAlertHorario} ({nextBreak.secondAlertMinutes}m)
                    </p>
                  </div>

                  <div className="sm:text-right">
                    <span
                      className={`inline-flex items-center gap-2 font-mono tabular-nums text-3xl sm:text-4xl font-bold tracking-tight ${
                        nextBreak.isAlertWindow
                          ? 'text-amber-700 dark:text-amber-400'
                          : 'text-blue-700 dark:text-blue-400'
                      }`}
                    >
                      <Timer className="w-6 h-6 shrink-0" aria-hidden="true" />
                      <span>{formatCountdown(countdownSeconds)}</span>
                    </span>
                    {nextBreak.isAlertWindow && (
                      <p className="mt-1 text-xs font-medium text-amber-700 dark:text-amber-400">
                        {countdownSeconds <= nextBreak.secondAlertMinutes * 60
                          ? `Janela final (menos de ${nextBreak.secondAlertMinutes} min)`
                          : `Janela de aviso ativa (menos de ${nextBreak.firstAlertMinutes} min)`}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                  <CheckCircle2
                    className="w-5 h-5 text-emerald-700 dark:text-emerald-400 shrink-0"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      Todas as pausas do dia foram concluídas
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Não há mais pausas programadas na escala de hoje.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-7 sm:p-8 flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                Alertas, Voz e Sons
              </h2>
              <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Libere o áudio, o aviso por voz e as notificações do navegador para receber os alertas automáticos faltando {firstAlertMin} e {secondAlertMin} minutos para cada pausa.
              </p>

              <div className="mt-6 space-y-3 pt-5 border-t border-slate-100 dark:border-slate-800 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    {audioUnlocked ? (
                      <Volume2 className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" aria-hidden="true" />
                    ) : (
                      <VolumeX className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" aria-hidden="true" />
                    )}
                    <span>Áudio e voz do navegador</span>
                  </span>
                  <span
                    className={`font-medium ${
                      audioUnlocked
                        ? 'text-emerald-700 dark:text-emerald-400'
                        : 'text-amber-700 dark:text-amber-400'
                    }`}
                  >
                    {audioUnlocked ? 'Ativado' : 'Aguardando ativação'}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    {notificationPermission === 'granted' ? (
                      <Bell className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" aria-hidden="true" />
                    ) : (
                      <BellOff className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" aria-hidden="true" />
                    )}
                    <span>Notificações</span>
                  </span>
                  <span
                    className={`font-medium text-right ${
                      notificationPermission === 'granted'
                        ? 'text-emerald-700 dark:text-emerald-400'
                        : notificationPermission === 'denied'
                          ? 'text-red-700 dark:text-red-400'
                          : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {notificationStatusLabel}
                  </span>
                </div>
              </div>

              {activationFeedback && (
                <p className="mt-4 text-xs font-medium text-blue-800 dark:text-blue-200 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800/70 rounded-lg px-3 py-2">
                  {activationFeedback}
                </p>
              )}
            </div>

            <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onActivateAlerts}
                className={`w-full h-11 px-4 rounded-lg text-sm font-semibold transition-colors inline-flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:focus-visible:ring-blue-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 whitespace-nowrap ${
                  allReady
                    ? 'bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white'
                    : 'bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white'
                }`}
              >
                <Volume2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>
                  {allReady ? 'Alertas e Sons Ativos (Revalidar)' : 'Ativar Alertas e Sons'}
                </span>
              </button>
            </div>
          </div>
        </section>

        {/* Lista completa das pausas do dia */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          <div className="px-6 sm:px-8 py-5 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                Escala de Pausas de Hoje
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Acompanhamento automático dos horários programados para o seu turno
              </p>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <div className="text-sm text-slate-600 dark:text-slate-400 font-mono tabular-nums">
                {completedCount} de {pausas.length} concluídas
              </div>
              {isTestOperator && (
                <button
                  type="button"
                  onClick={() => setActiveTab('edit')}
                  className="h-9 px-3.5 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-sm font-medium text-blue-700 dark:text-blue-300 transition-colors inline-flex items-center gap-2 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:focus-visible:ring-blue-400"
                >
                  <Pencil className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <span>Alterar Pausas</span>
                </button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  <th className="py-3.5 pl-6 sm:pl-8 pr-4">Pausa</th>
                  <th className="py-3.5 px-4">Horário Programado</th>
                  <th className="py-3.5 px-4">Avisos ({firstAlertMin}m e {secondAlertMin}m)</th>
                  <th className="py-3.5 pl-4 pr-6 sm:pr-8 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-sm">
                {pausas.map((pausa) => {
                  const isNext = pausa.status === 'proxima';
                  const isDone = pausa.status === 'concluida';

                  const ackStages: string[] = [];
                  if (pausa.isAcknowledgedFirst) ackStages.push(`${pausa.firstAlertMinutes}m`);
                  if (pausa.isAcknowledgedSecond) ackStages.push(`${pausa.secondAlertMinutes}m`);

                  return (
                    <tr
                      key={`${pausa.tipo}-${pausa.horario}`}
                      className={`transition-colors ${
                        isNext
                          ? 'bg-blue-50/50 dark:bg-blue-950/30'
                          : isDone
                            ? 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-500'
                            : 'bg-white dark:bg-slate-900 hover:bg-slate-50/70 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <td className="py-4 pl-6 sm:pl-8 pr-4 font-semibold">
                        <span
                          className={
                            isDone
                              ? 'text-slate-500 dark:text-slate-500 font-medium'
                              : 'text-slate-900 dark:text-slate-100'
                          }
                        >
                          {pausa.tipo}
                        </span>
                      </td>

                      <td className="py-4 px-4 font-mono tabular-nums font-semibold">
                        <span
                          className={
                            isDone
                              ? 'text-slate-500 dark:text-slate-500 font-normal'
                              : 'text-slate-900 dark:text-slate-100'
                          }
                        >
                          {pausa.horarioFim ? `${pausa.horario} – ${pausa.horarioFim}` : pausa.horario}
                        </span>
                      </td>

                      <td className="py-4 px-4 font-mono tabular-nums text-slate-600 dark:text-slate-400">
                        {pausa.firstAlertHorario} · {pausa.secondAlertHorario}
                      </td>

                      <td className="py-4 pl-4 pr-6 sm:pr-8 text-right">
                        <div className="inline-flex items-center justify-end gap-2 whitespace-nowrap">
                          {isDone && (
                            <>
                              <CheckCircle2
                                className="w-4 h-4 text-slate-400 dark:text-slate-600 shrink-0"
                                aria-hidden="true"
                              />
                              <span className="font-medium text-slate-500 dark:text-slate-500">
                                Concluída
                              </span>
                            </>
                          )}

                          {isNext && (
                            <>
                              <Timer
                                className={`w-4 h-4 shrink-0 ${
                                  pausa.isAlertWindow
                                    ? 'text-amber-700 dark:text-amber-400'
                                    : 'text-blue-700 dark:text-blue-400'
                                }`}
                                aria-hidden="true"
                              />
                              <span
                                className={`font-semibold ${
                                  pausa.isAlertWindow
                                    ? 'text-amber-700 dark:text-amber-400'
                                    : 'text-blue-700 dark:text-blue-400'
                                }`}
                              >
                                Próxima
                              </span>
                            </>
                          )}

                          {pausa.status === 'agendada' && (
                            <>
                              <Clock
                                className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0"
                                aria-hidden="true"
                              />
                              <span className="font-medium text-slate-700 dark:text-slate-300">
                                Agendada
                              </span>
                            </>
                          )}

                          {ackStages.length > 0 && (
                            <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                              · Sinalizada ({ackStages.join(' e ')})
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
          </div>
        )}
      </main>
    </div>
  );
};
