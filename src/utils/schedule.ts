import { Pausa } from '../data/operadores';

export type BreakStatus = 'concluida' | 'proxima' | 'agendada';
export type AlertMinutes = 10 | 5;

export interface EnrichedPausa extends Pausa {
  index: number;
  startSeconds: number;
  alert10Seconds: number;
  alert5Seconds: number;
  alert10Horario: string;
  alert5Horario: string;
  status: BreakStatus;
  isAlertWindow: boolean;
  isAcknowledged10: boolean;
  isAcknowledged5: boolean;
  breakKey10: string;
  breakKey5: string;
}

export const ALERT_STAGES_MINUTES: readonly AlertMinutes[] = [5, 10];
export const ALERT_10_SECONDS = 10 * 60;
export const ALERT_5_SECONDS = 5 * 60;

export function parseHorarioToSeconds(horario: string): number {
  const [hhStr, mmStr] = horario.split(':');
  const hh = Number.parseInt(hhStr, 10) || 0;
  const mm = Number.parseInt(mmStr, 10) || 0;
  return hh * 3600 + mm * 60;
}

export function getSecondsOfDay(date: Date): number {
  return date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds();
}

export function formatTimeClock(date: Date): string {
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
}

export function formatDateLongPtBr(date: Date): string {
  const formatted = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date);
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export function formatCountdown(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;
  return [hours, minutes, seconds].map((val) => String(val).padStart(2, '0')).join(':');
}

export function formatSecondsToHHMM(totalSeconds: number): string {
  const normalized = ((totalSeconds % 86400) + 86400) % 86400;
  const hh = Math.floor(normalized / 3600);
  const mm = Math.floor((normalized % 3600) / 60);
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

export function getTodayDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getBreakStageKey(
  dateKey: string,
  operatorName: string,
  pausa: Pausa,
  minutesBefore: AlertMinutes,
): string {
  return `${dateKey}|${operatorName}|${pausa.tipo}|${pausa.horario}|${minutesBefore}m`;
}

export function buildEnrichedPausas(
  pausas: Pausa[],
  now: Date,
  operatorName: string,
  acknowledgedKeys: Set<string>,
): EnrichedPausa[] {
  const nowSeconds = getSecondsOfDay(now);
  const dateKey = getTodayDateKey(now);

  const sorted = [...pausas]
    .map((pausa, originalIndex) => ({
      ...pausa,
      originalIndex,
      startSeconds: parseHorarioToSeconds(pausa.horario),
    }))
    .sort((a, b) => a.startSeconds - b.startSeconds);

  const nextIndex = sorted.findIndex((item) => item.startSeconds > nowSeconds);

  return sorted.map((item, idx) => {
    const alert10Seconds = item.startSeconds - ALERT_10_SECONDS;
    const alert5Seconds = item.startSeconds - ALERT_5_SECONDS;
    const alert10Horario = formatSecondsToHHMM(alert10Seconds);
    const alert5Horario = formatSecondsToHHMM(alert5Seconds);
    const breakKey10 = getBreakStageKey(dateKey, operatorName, item, 10);
    const breakKey5 = getBreakStageKey(dateKey, operatorName, item, 5);
    const isAcknowledged10 = acknowledgedKeys.has(breakKey10);
    const isAcknowledged5 = acknowledgedKeys.has(breakKey5);

    let status: BreakStatus = 'agendada';
    if (item.startSeconds <= nowSeconds) {
      status = 'concluida';
    } else if (idx === nextIndex) {
      status = 'proxima';
    }

    const isAlertWindow =
      nowSeconds >= alert10Seconds && nowSeconds < item.startSeconds;

    return {
      tipo: item.tipo,
      horario: item.horario,
      horarioFim: item.horarioFim,
      index: idx,
      startSeconds: item.startSeconds,
      alert10Seconds,
      alert5Seconds,
      alert10Horario,
      alert5Horario,
      status,
      isAlertWindow,
      isAcknowledged10,
      isAcknowledged5,
      breakKey10,
      breakKey5,
    };
  });
}
