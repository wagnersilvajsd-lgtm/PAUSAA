import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  getOperatorAlertStages,
  OPERADORES_ESCALA,
  Operador,
  Pausa,
} from './data/operadores';
import { OperatorSelector } from './components/OperatorSelector';
import { OperatorDashboard } from './components/OperatorDashboard';
import { ActiveBreakAlert, BreakAlertModal } from './components/BreakAlertModal';
import {
  buildEnrichedPausas,
  getBreakStageKey,
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
  startRepeatingBreakAlertWithVoice,
  stopRepeatingBreakAlertWithVoice,
} from './utils/audioAndNotification';

const STORAGE_OPERATOR_KEY = 'sinalizador_operador_nome';
const STORAGE_ACK_KEY = 'sinalizador_pausas_sinalizadas';
const STORAGE_THEME_KEY = 'sinalizador_tema';
const STORAGE_CUSTOM_SCHEDULES_KEY = 'sinalizador_escala_custom';

type ThemeMode = 'light' | 'dark';

function loadInitialTheme(): ThemeMode {
  try {
    const saved = localStorage.getItem(STORAGE_THEME_KEY);
    return saved === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

function loadSavedOperatorName(): string | null {
  try {
    const savedName = localStorage.getItem(STORAGE_OPERATOR_KEY);
    if (!savedName) return null;
    const exists = OPERADORES_ESCALA.some((op) => op.nome === savedName);
    return exists ? savedName : null;
  } catch {
    return null;
  }
}

function loadCustomSchedules(): Record<string, Pausa[]> {
  try {
    const raw = localStorage.getItem(STORAGE_CUSTOM_SCHEDULES_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return {};
    }
    return parsed as Record<string, Pausa[]>;
  } catch {
    return {};
  }
}

function saveCustomSchedules(data: Record<string, Pausa[]>): void {
  try {
    localStorage.setItem(STORAGE_CUSTOM_SCHEDULES_KEY, JSON.stringify(data));
  } catch {
    // Ignora falha de armazenamento em navegação privada restrita
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
  const [selectedOperatorName, setSelectedOperatorName] = useState<string | null>(() =>
    loadSavedOperatorName(),
  );
  const [customSchedules, setCustomSchedules] = useState<Record<string, Pausa[]>>(() =>
    loadCustomSchedules(),
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

  // Limpa timers sonoros e síntese de voz se o componente desmontar
  useEffect(() => {
    return () => {
      stopRepeatingBreakAlertWithVoice();
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

  const allOperadores = useMemo<Operador[]>(() => {
    return OPERADORES_ESCALA.map((op) => ({
      nome: op.nome,
      pausas: customSchedules[op.nome] ?? op.pausas,
    }));
  }, [customSchedules]);

  const selectedOperador = useMemo<Operador | null>(() => {
    if (!selectedOperatorName) return null;
    return allOperadores.find((op) => op.nome === selectedOperatorName) ?? null;
  }, [allOperadores, selectedOperatorName]);

  // Regra automática: verificar a cada segundo os estágios configurados (25m/10m ou 10m/5m)
  useEffect(() => {
    const currentDateKey = getTodayDateKey(now);
    const currentSeconds = getSecondsOfDay(now);
    const prev = lastCheckedRef.current;

    if (!selectedOperador) {
      lastCheckedRef.current = { dateKey: currentDateKey, seconds: currentSeconds };
      return;
    }

    const sameDay = prev.dateKey === currentDateKey;
    const [firstAlertMinutes, secondAlertMinutes] = getOperatorAlertStages(
      selectedOperador.nome,
    );
    const checkOrder = [secondAlertMinutes, firstAlertMinutes];
    let triggered = false;

    for (const pausa of selectedOperador.pausas) {
      if (triggered) break;
      const startSeconds = parseHorarioToSeconds(pausa.horario);

      // Verifica primeiro o estágio mais próximo da pausa e depois o primeiro aviso
      for (const minutesBefore of checkOrder) {
        const alertSeconds = startSeconds - minutesBefore * 60;
        const breakKey = getBreakStageKey(
          currentDateKey,
          selectedOperador.nome,
          pausa,
          minutesBefore,
        );

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
            minutesBefore,
            isFinalAlert: minutesBefore === secondAlertMinutes,
          });
          startRepeatingBreakAlertWithVoice(minutesBefore);
          sendBreakBrowserNotification(
            selectedOperador.nome,
            pausa.tipo,
            pausa.horario,
            minutesBefore,
          );
          triggered = true;
          break;
        }
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
    setSelectedOperatorName(operador.nome);
    setActivationFeedback(null);
  }, []);

  const handleSwitchOperator = useCallback(() => {
    stopRepeatingBreakAlertWithVoice();
    setActiveAlert(null);
    triggeredKeysRef.current.clear();
    try {
      localStorage.removeItem(STORAGE_OPERATOR_KEY);
    } catch {
      // Ignora erro de localStorage se bloqueado
    }
    setSelectedOperatorName(null);
    setActivationFeedback(null);
  }, []);

  const handleSaveOperatorBreaks = useCallback(
    (operatorName: string, pausas: Pausa[]) => {
      setCustomSchedules((prev) => {
        const next = { ...prev, [operatorName]: pausas };
        saveCustomSchedules(next);
        return next;
      });
    },
    [],
  );

  const handleResetOperatorBreaks = useCallback((operatorName: string) => {
    setCustomSchedules((prev) => {
      const next = { ...prev };
      delete next[operatorName];
      saveCustomSchedules(next);
      return next;
    });
  }, []);

  const handleActivateAlerts = useCallback(async () => {
    const soundOk = await playConfirmationTone();
    setAudioUnlocked(soundOk || isAudioUnlocked());

    const perm = await requestBrowserNotificationPermission();
    setNotificationPermission(perm);

    if (soundOk && perm === 'granted') {
      setActivationFeedback('Áudio, voz e notificações do sistema ativados.');
    } else if (soundOk && perm === 'denied') {
      setActivationFeedback(
        'Áudio e voz liberados. Notificações bloqueadas no navegador — libere nas permissões do site se desejar avisos na área de trabalho.',
      );
    } else if (soundOk) {
      setActivationFeedback('Áudio e voz liberados para alertas neste painel.');
    } else {
      setActivationFeedback(
        'Não foi possível inicializar o áudio automaticamente. Verifique o som do dispositivo.',
      );
    }
  }, []);

  const handleAcknowledgeAlert = useCallback((alert: ActiveBreakAlert) => {
    stopRepeatingBreakAlertWithVoice();
    setActiveAlert(null);

    setAcknowledgedKeys((prev) => {
      const next = new Set(prev);
      next.add(alert.breakKey);
      saveAcknowledgedKeys(next, getTodayDateKey(new Date()));
      return next;
    });
  }, []);

  return (
    <>
      {selectedOperador ? (
        <OperatorDashboard
          operador={selectedOperador}
          customSchedules={customSchedules}
          now={now}
          pausas={enrichedPausas}
          audioUnlocked={audioUnlocked}
          notificationPermission={notificationPermission}
          activationFeedback={activationFeedback}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          onActivateAlerts={handleActivateAlerts}
          onSaveOperatorBreaks={handleSaveOperatorBreaks}
          onResetOperatorBreaks={handleResetOperatorBreaks}
          onSwitchOperator={handleSwitchOperator}
        />
      ) : (
        <OperatorSelector
          operadores={allOperadores}
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
