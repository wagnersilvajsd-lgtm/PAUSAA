import { Pausa } from '../data/operadores';

export type BreakStatus = 'concluida' | 'proxima' | 'agendada';

export interface EnrichedPausa extends Pausa {
  index: number;
  startSeconds: number;
  alertSeconds: number;
  alertHorario: string;
  status: BreakStatus;
  isAlertWindow: boolean;
  isAcknowledged: boolean;
  breakKey: string;
}

export const ALERT_ADVANCE_MINUTES = 10;
export const ALERT_ADVANCE_SECONDS = ALERT_ADVANCE_MINUTES * 60;

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

export function getBreakKey(dateKey: string, operatorName: string, pausa: Pausa): string {
  return `${dateKey}|${operatorName}|${pausa.tipo}|${pausa.horario}`;
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
    const alertSeconds = item.startSeconds - ALERT_ADVANCE_SECONDS;
    const alertHorario = formatSecondsToHHMM(alertSeconds);
    const breakKey = getBreakKey(dateKey, operatorName, item);
    const isAcknowledged = acknowledgedKeys.has(breakKey);

    let status: BreakStatus = 'agendada';
    if (item.startSeconds <= nowSeconds) {
      status = 'concluida';
    } else if (idx === nextIndex) {
      status = 'proxima';
    }

    const isAlertWindow =
      nowSeconds >= alertSeconds && nowSeconds < item.startSeconds;

    return {
      tipo: item.tipo,
      horario: item.horario,
      horarioFim: item.horarioFim,
      index: idx,
      startSeconds: item.startSeconds,
      alertSeconds,
      alertHorario,
      status,
      isAlertWindow,
      isAcknowledged,
      breakKey,
    };
  });
}
