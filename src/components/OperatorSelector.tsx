import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Search, ChevronDown, Check, ArrowRight, Moon, Sun } from 'lucide-react';
import { Operador } from '../data/operadores';

interface OperatorSelectorProps {
  operadores: Operador[];
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onSelectOperator: (operador: Operador) => void;
}

export const OperatorSelector: React.FC<OperatorSelectorProps> = ({
  operadores,
  theme,
  onToggleTheme,
  onSelectOperator,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedName, setSelectedName] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredOperadores = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return operadores;
    return operadores.filter((op) =>
      op.nome.toLowerCase().includes(query),
    );
  }, [operadores, searchTerm]);

  const selectedOperador = useMemo(
    () => operadores.find((op) => op.nome === selectedName) ?? null,
    [operadores, selectedName],
  );

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  useEffect(() => {
    setHighlightedIndex(0);
  }, [searchTerm, isDropdownOpen]);

  const handleChooseOption = (op: Operador) => {
    setSelectedName(op.nome);
    setSearchTerm(op.nome);
    setIsDropdownOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setIsDropdownOpen(true);
    if (selectedName && value !== selectedName) {
      setSelectedName('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isDropdownOpen && (e.key === 'ArrowDown' || e.key === 'Enter')) {
      setIsDropdownOpen(true);
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        filteredOperadores.length > 0 ? (prev + 1) % filteredOperadores.length : 0,
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        filteredOperadores.length > 0
          ? (prev - 1 + filteredOperadores.length) % filteredOperadores.length
          : 0,
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (isDropdownOpen && filteredOperadores[highlightedIndex]) {
        handleChooseOption(filteredOperadores[highlightedIndex]);
      } else if (selectedOperador) {
        onSelectOperator(selectedOperador);
      }
    } else if (e.key === 'Escape') {
      setIsDropdownOpen(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedOperador) {
      onSelectOperator(selectedOperador);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors">
      <header className="w-full border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
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
          <div className="flex items-center gap-4 shrink-0">
            <span className="hidden sm:inline text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">
              Área do Operador
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
                  <span>Modo Claro</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-slate-500 shrink-0" aria-hidden="true" />
                  <span>Modo Escuro</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8">
          <div className="mb-7">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 text-balance">
              Identifique seu acesso
            </h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Selecione o seu nome na escala do dia para acompanhar seus horários de pausa e receber os avisos automáticos.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div ref={containerRef} className="relative">
              <label
                htmlFor="operador-search"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
              >
                Operador
              </label>

              <div className="relative">
                <Search
                  className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  ref={inputRef}
                  id="operador-search"
                  type="text"
                  role="combobox"
                  aria-expanded={isDropdownOpen}
                  aria-controls="operador-listbox"
                  aria-autocomplete="list"
                  autoComplete="off"
                  placeholder="Digite ou selecione seu nome..."
                  value={searchTerm}
                  onFocus={() => setIsDropdownOpen(true)}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  className="w-full h-11 pl-10 pr-10 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-600/15 dark:focus:ring-blue-500/20 transition-colors"
                />
                <button
                  type="button"
                  aria-label="Abrir lista de operadores"
                  onClick={() => {
                    setIsDropdownOpen((prev) => !prev);
                    inputRef.current?.focus();
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-200 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:focus-visible:ring-blue-400"
                >
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-150 ${
                      isDropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
              </div>

              {isDropdownOpen && (
                <ul
                  id="operador-listbox"
                  role="listbox"
                  className="absolute z-20 mt-1.5 w-full max-h-60 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg dark:shadow-black/50 py-1"
                >
                  {filteredOperadores.length === 0 ? (
                    <li className="px-3.5 py-3 text-sm text-slate-500 dark:text-slate-400">
                      Nenhum operador encontrado com "{searchTerm}".
                    </li>
                  ) : (
                    filteredOperadores.map((op, index) => {
                      const isSelected = op.nome === selectedName;
                      const isHighlighted = index === highlightedIndex;
                      return (
                        <li
                          key={op.nome}
                          role="option"
                          aria-selected={isSelected}
                          onMouseEnter={() => setHighlightedIndex(index)}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            handleChooseOption(op);
                          }}
                          className={`px-3.5 py-2.5 text-sm cursor-pointer flex items-center justify-between gap-3 transition-colors ${
                            isHighlighted
                              ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-900 dark:text-blue-100'
                              : 'text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/70'
                          }`}
                        >
                          <div className="min-w-0">
                            <p className="font-medium truncate">{op.nome}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums mt-0.5">
                              {op.pausas.map((p) => p.horario).join(' · ')}
                            </p>
                          </div>
                          {isSelected && (
                            <Check
                              className="w-4 h-4 text-blue-700 dark:text-blue-400 shrink-0"
                              aria-hidden="true"
                            />
                          )}
                        </li>
                      );
                    })
                  )}
                </ul>
              )}
            </div>

            {selectedOperador && (
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                  Pausas programadas para hoje
                </p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-700 dark:text-slate-300 font-mono tabular-nums">
                  {selectedOperador.pausas.map((pausa, idx) => (
                    <React.Fragment key={`${pausa.tipo}-${pausa.horario}`}>
                      {idx > 0 && (
                        <span className="text-slate-300 dark:text-slate-700" aria-hidden="true">
                          ·
                        </span>
                      )}
                      <span>
                        <span className="font-sans text-slate-600 dark:text-slate-400">{pausa.tipo}:</span>{' '}
                        <span className="font-semibold text-slate-900 dark:text-slate-100">{pausa.horario}</span>
                      </span>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={!selectedOperador}
              className="w-full h-11 px-4 rounded-lg text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:focus-visible:ring-blue-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 whitespace-nowrap"
            >
              <span>Acessar</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};
