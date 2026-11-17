import { AlertMinutes } from './schedule';

export type NotificationPermissionState = NotificationPermission | 'unsupported';

let sharedAudioContext: AudioContext | null = null;
let repeatingAlertTimer: number | null = null;
let pendingVoiceTimer: number | null = null;

function getOrCreateAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return null;
  if (!sharedAudioContext) {
    sharedAudioContext = new AudioCtx();
  }
  return sharedAudioContext;
}

export function isAudioUnlocked(): boolean {
  return sharedAudioContext !== null && sharedAudioContext.state === 'running';
}

export async function unlockAudioContext(): Promise<boolean> {
  const ctx = getOrCreateAudioContext();
  if (!ctx) return false;
  try {
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
    return ctx.state === 'running';
  } catch {
    return false;
  }
}

function getPortugueseVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return null;
  }
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;

  return (
    voices.find((v) => v.lang.toLowerCase() === 'pt-br') ??
    voices.find((v) => v.lang.toLowerCase().startsWith('pt')) ??
    null
  );
}

export function speakMessagePtBr(message: string): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return false;
  }
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.lang = 'pt-BR';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    const ptVoice = getPortugueseVoice();
    if (ptVoice) {
      utterance.voice = ptVoice;
    }

    window.speechSynthesis.speak(utterance);
    return true;
  } catch {
    return false;
  }
}

export function stopVoiceAnnouncement(): void {
  if (pendingVoiceTimer !== null) {
    window.clearTimeout(pendingVoiceTimer);
    pendingVoiceTimer = null;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // Ignora erro ao cancelar síntese de voz
    }
  }
}

export function getVoiceAnnouncementText(minutesBefore: AlertMinutes): string {
  return minutesBefore === 5
    ? 'Sua pausa começa em 5 minutos'
    : 'Sua pausa começa em 10 minutos';
}

/**
 * Toca um breve sinal sonoro e confirma a voz ao ativar os alertas.
 */
export async function playConfirmationTone(): Promise<boolean> {
  const unlocked = await unlockAudioContext();
  const ctx = sharedAudioContext;
  if (!unlocked || !ctx) return false;

  const now = ctx.currentTime;
  const notes = [587.33, 880]; // D5 -> A5

  notes.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const start = now + idx * 0.11;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, start);

    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.16, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.24);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + 0.26);
  });

  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.getVoices();
    pendingVoiceTimer = window.setTimeout(() => {
      speakMessagePtBr('Alertas e voz ativados');
    }, 320);
  }

  return true;
}

/**
 * Toca um alerta sonoro perceptível via Web Audio API.
 */
export async function playBreakAlertChime(): Promise<boolean> {
  const unlocked = await unlockAudioContext();
  const ctx = sharedAudioContext;
  if (!unlocked || !ctx) return false;

  const now = ctx.currentTime;
  const sequence = [
    { offset: 0, freq: 783.99, duration: 0.18 }, // G5
    { offset: 0.2, freq: 1046.5, duration: 0.24 }, // C6
    { offset: 0.52, freq: 783.99, duration: 0.18 }, // G5
    { offset: 0.72, freq: 1046.5, duration: 0.28 }, // C6
  ];

  sequence.forEach(({ offset, freq, duration }) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const start = now + offset;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, start);

    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.28, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + duration + 0.02);
  });

  return true;
}

/**
 * Dispara o sinal sonoro seguido da mensagem de voz ("Sua pausa começa em 10 minutos"
 * ou "Sua pausa começa em 5 minutos") e repete periodicamente até o operador fechar o aviso.
 */
export function startRepeatingBreakAlertWithVoice(
  minutesBefore: AlertMinutes,
): void {
  stopRepeatingBreakAlertWithVoice();

  const triggerCycle = () => {
    void playBreakAlertChime();
    const text = getVoiceAnnouncementText(minutesBefore);
    pendingVoiceTimer = window.setTimeout(() => {
      speakMessagePtBr(text);
    }, 1050);
  };

  triggerCycle();
  repeatingAlertTimer = window.setInterval(triggerCycle, 9000);
}

export function stopRepeatingBreakAlertWithVoice(): void {
  if (repeatingAlertTimer !== null) {
    window.clearInterval(repeatingAlertTimer);
    repeatingAlertTimer = null;
  }
  stopVoiceAnnouncement();
}

export function getNotificationPermission(): NotificationPermissionState {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
}

export async function requestBrowserNotificationPermission(): Promise<NotificationPermissionState> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  if (Notification.permission === 'granted') {
    return 'granted';
  }
  try {
    return await Notification.requestPermission();
  } catch {
    return Notification.permission;
  }
}

export function sendBreakBrowserNotification(
  operatorName: string,
  breakType: string,
  breakTime: string,
  minutesBefore: AlertMinutes,
): boolean {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }
  if (Notification.permission !== 'granted') {
    return false;
  }

  try {
    const title = `Aviso de Pausa (${minutesBefore} min) — ${breakType}`;
    const body = `Atenção, ${operatorName}! Sua ${breakType} começa em ${minutesBefore} minutos (às ${breakTime}).`;

    const notification = new Notification(title, {
      body,
      icon: '/assets/aistudio/image_0674f66e.png',
      tag: `break-${operatorName}-${breakType}-${breakTime}-${minutesBefore}m`,
      requireInteraction: true,
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };
    return true;
  } catch {
    return false;
  }
}
