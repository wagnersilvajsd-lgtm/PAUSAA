export type NotificationPermissionState = NotificationPermission | 'unsupported';

let sharedAudioContext: AudioContext | null = null;
let repeatingAlertTimer: number | null = null;

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

/**
 * Toca um breve sinal sonoro de confirmação ao ativar os alertas.
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

  return true;
}

/**
 * Toca um alerta sonoro perceptível via Web Audio API (sequência dupla clara).
 */
export async function playBreakAlertChime(): Promise<boolean> {
  const unlocked = await unlockAudioContext();
  const ctx = sharedAudioContext;
  if (!unlocked || !ctx) return false;

  const now = ctx.currentTime;
  // Sequência de 3 toques claros e perceptíveis para ambiente operacional
  const sequence = [
    { offset: 0, freq: 783.99, duration: 0.18 }, // G5
    { offset: 0.2, freq: 1046.5, duration: 0.24 }, // C6
    { offset: 0.52, freq: 783.99, duration: 0.18 }, // G5
    { offset: 0.72, freq: 1046.5, duration: 0.28 }, // C6
    { offset: 1.1, freq: 1174.66, duration: 0.36 }, // D6
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

export function startRepeatingBreakAlertChime(): void {
  stopRepeatingBreakAlertChime();
  void playBreakAlertChime();
  repeatingAlertTimer = window.setInterval(() => {
    void playBreakAlertChime();
  }, 8000);
}

export function stopRepeatingBreakAlertChime(): void {
  if (repeatingAlertTimer !== null) {
    window.clearInterval(repeatingAlertTimer);
    repeatingAlertTimer = null;
  }
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
): boolean {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }
  if (Notification.permission !== 'granted') {
    return false;
  }

  try {
    const title = `Aviso de Pausa — ${breakType}`;
    const body = `Atenção, ${operatorName}! Sua ${breakType} começa em 10 minutos (às ${breakTime}).`;

    const notification = new Notification(title, {
      body,
      tag: `break-${operatorName}-${breakType}-${breakTime}`,
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
