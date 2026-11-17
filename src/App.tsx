import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { OPERADORES_ESCALA, Operador } from './data/operadores';
import { OperatorSelector } from './components/OperatorSelector';
import { OperatorDashboard } from './components/OperatorDashboard';
import { ActiveBreakAlert, BreakAlertModal } from './components/BreakAlertModal';
import {
  ALERT_ADVANCE_SECONDS,
  buildEnrichedPausas,
  getBreakKey,
  getSecondsOfDay,
  getTodayDateKey,
  parseHorarioToSeconds,
} from './utils/schedule';
import {
  getNotificationPermission,
  isAudioUnlocked,
  NotificationPermissionState,
  playConfirmationTone,
  requestBrowserNotificationPermission,
  sendBreakBrowserNotification,
  startRepeatingBreakAlertChime,
  stopRepeatingBreakAlertChime,
} from './utils/audioAndNotification';

const STORAGE_OPERATOR_KEY = 'sinalizador_operador_nome';
const STORAGE_ACK_KEY = 'sinalizador_pausas_sinalizadas';
const STORAGE_THEME_KEY = 'sinalizador_tema';

type ThemeMode = 'light' | 'dark';

function loadInitialTheme(): ThemeMode {
  try {
    const saved = localStorage.getItem(STORAGE_THEME_KEY);
    return saved === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

function loadSavedOperator(): Operador | null {
  try {
    const savedName = localStorage.getItem(STORAGE_OPERATOR_KEY);
    if (!savedName) return null;
    return OPERADORES_ESCALA.find((op) => op.nome === savedName) ?? null;
  } catch {
    return null;
  }
}

function loadTodayAcknowledgedKeys(todayKey: string): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_ACK_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    const validToday = parsed.filter(
      (item): item is string =>
        typeof item === 'string' && item.startsWith(`${todayKey}|`),
    );
    return new Set(validToday);
  } catch {
    return new Set();
  }
}

function saveAcknowledgedKeys(keys: Set<string>, todayKey: string): void {
  try {
    const todayOnly = Array.from(keys).filter((item) =>
      item.startsWith(`${todayKey}|`),
    );
    localStorage.setItem(STORAGE_ACK_KEY, JSON.stringify(todayOnly));
  } catch {
    // Ignora falha de armazenamento em navegação privada restrita
  }
}

export default function App() {
  const [selectedOperador, setSelectedOperador] = useState<Operador | null>(() =>
    loadSavedOperator(),
  );
  const [now, setNow] = useState<Date>(() => new Date());
  const [acknowledgedKeys, setAcknowledgedKeys] = useState<Set<string>>(() =>
    loadTodayAcknowledgedKeys(getTodayDateKey(new Date())),
  );
  const [activeAlert, setActiveAlert] = useState<ActiveBreakAlert | null>(null);
  const [audioUnlocked, setAudioUnlocked] = useState<boolean>(() => isAudioUnlocked());
  const [notificationPermission, setNotificationPermission] =
    useState<NotificationPermissionState>(() => getNotificationPermission());
  const [activationFeedback, setActivationFeedback] = useState<string | null>(null);
  const [theme, setTheme] = useState<ThemeMode>(() => loadInitialTheme());

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem(STORAGE_THEME_KEY, theme);
    } catch {
      // Ignora erro de localStorage se bloqueado
    }
  }, [theme]);

  const handleToggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const triggeredKeysRef = useRef<Set<string>>(new Set());
  const lastCheckedRef = useRef<{ dateKey: string; seconds: number }>({
    dateKey: getTodayDateKey(new Date()),
    seconds: getSecondsOfDay(new Date()),
  });

  // Limpa timers sonoros se o componente desmontar
  useEffect(() => {
    return () => {
      stopRepeatingBreakAlertChime();
    };
  }, []);

  // Atualização do relógio a cada segundo (e ressincronização ao voltar para a aba)
  useEffect(() => {
    const tick = () => {
      setNow(new Date());
    };

    const intervalId = window.setInterval(tick, 1000);
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        tick();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  // Limpa registros de dias anteriores ao virar a meia-noite
  const todayKey = getTodayDateKey(now);
  useEffect(() => {
    setAcknowledgedKeys((prev) => {
      const filtered = new Set(
        Array.from(prev).filter((key) => key.startsWith(`${todayKey}|`)),
      );
      if (filtered.size !== prev.size) {
        saveAcknowledgedKeys(filtered, todayKey);
        return filtered;
      }
      return prev;
    });
  }, [todayKey]);

  // Regra automática: verificar a cada segundo se faltam exatamente 10 minutos para alguma pausa
  useEffect(() => {
    const currentDateKey = getTodayDateKey(now);
    const currentSeconds = getSecondsOfDay(now);
    const prev = lastCheckedRef.current;

    if (!selectedOperador) {
      lastCheckedRef.current = { dateKey: currentDateKey, seconds: currentSeconds };
      return;
    }

    const sameDay = prev.dateKey === currentDateKey;

    for (const pausa of selectedOperador.pausas) {
      const startSeconds = parseHorarioToSeconds(pausa.horario);
      const alertSeconds = startSeconds - ALERT_ADVANCE_SECONDS;
      const breakKey = getBreakKey(currentDateKey, selectedOperador.nome, pausa);

      if (
        acknowledgedKeys.has(breakKey) ||
        triggeredKeysRef.current.has(breakKey)
      ) {
        continue;
      }

      const insideExactAlertMinute =
        currentSeconds >= alertSeconds && currentSeconds < alertSeconds + 60;
      const crossedAlertThresholdInTab =
        sameDay &&
        prev.seconds < alertSeconds &&
        currentSeconds >= alertSeconds &&
        currentSeconds < startSeconds;

      if (insideExactAlertMinute || crossedAlertThresholdInTab) {
        triggeredKeysRef.current.add(breakKey);
        setActiveAlert({
          operatorName: selectedOperador.nome,
          breakType: pausa.tipo,
          breakTime: pausa.horario,
          breakKey,
        });
        startRepeatingBreakAlertChime();
        sendBreakBrowserNotification(
          selectedOperador.nome,
          pausa.tipo,
          pausa.horario,
        );
        break;
      }
    }

    lastCheckedRef.current = { dateKey: currentDateKey, seconds: currentSeconds };
  }, [now, selectedOperador, acknowledgedKeys]);

  const enrichedPausas = useMemo(() => {
    if (!selectedOperador) return [];
    return buildEnrichedPausas(
      selectedOperador.pausas,
      now,
      selectedOperador.nome,
      acknowledgedKeys,
    );
  }, [selectedOperador, now, acknowledgedKeys]);

  const handleSelectOperator = useCallback((operador: Operador) => {
    try {
      localStorage.setItem(STORAGE_OPERATOR_KEY, operador.nome);
    } catch {
      // Ignora erro de localStorage se bloqueado
    }
    triggeredKeysRef.current.clear();
    setSelectedOperador(operador);
    setActivationFeedback(null);
  }, []);

  const handleSwitchOperator = useCallback(() => {
    stopRepeatingBreakAlertChime();
    setActiveAlert(null);
    triggeredKeysRef.current.clear();
    try {
      localStorage.removeItem(STORAGE_OPERATOR_KEY);
    } catch {
      // Ignora erro de localStorage se bloqueado
    }
    setSelectedOperador(null);
    setActivationFeedback(null);
  }, []);

  const handleActivateAlerts = useCallback(async () => {
    const soundOk = await playConfirmationTone();
    setAudioUnlocked(soundOk || isAudioUnlocked());

    const perm = await requestBrowserNotificationPermission();
    setNotificationPermission(perm);

    if (soundOk && perm === 'granted') {
      setActivationFeedback('Áudio liberado e notificações do sistema ativadas.');
    } else if (soundOk && perm === 'denied') {
      setActivationFeedback(
        'Áudio liberado. Notificações bloqueadas no navegador — libere nas permissões do site se desejar avisos na área de trabalho.',
      );
    } else if (soundOk) {
      setActivationFeedback('Áudio liberado para alertas neste painel.');
    } else {
      setActivationFeedback(
        'Não foi possível inicializar o áudio automaticamente. Verifique o som do dispositivo.',
      );
    }
  }, []);

  const handleAcknowledgeAlert = useCallback(
    (alert: ActiveBreakAlert) => {
      stopRepeatingBreakAlertChime();
      setActiveAlert(null);

      setAcknowledgedKeys((prev) => {
        const next = new Set(prev);
        next.add(alert.breakKey);
        saveAcknowledgedKeys(next, getTodayDateKey(new Date()));
        return next;
      });
    },
    [],
  );

  return (
    <>
      {selectedOperador ? (
        <OperatorDashboard
          operador={selectedOperador}
          now={now}
          pausas={enrichedPausas}
          audioUnlocked={audioUnlocked}
          notificationPermission={notificationPermission}
          activationFeedback={activationFeedback}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          onActivateAlerts={handleActivateAlerts}
          onSwitchOperator={handleSwitchOperator}
        />
      ) : (
        <OperatorSelector
          operadores={OPERADORES_ESCALA}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          onSelectOperator={handleSelectOperator}
        />
      )}

      <BreakAlertModal
        alert={activeAlert}
        onAcknowledge={handleAcknowledgeAlert}
      />
    </>
  );
}
