export interface Pausa {
  tipo: string;
  horario: string; // Formato 24h "HH:MM" (ex: "10:15", "14:30")
}

export interface Operador {
  nome: string;
  pausas: Pausa[];
}

/**
 * ============================================================================
 * ESCALA FIXA DE OPERADORES E PAUSAS DIÁRIAS
 * ============================================================================
 * Para atualizar a escala da operação, basta editar, adicionar ou remover
 * objetos na lista abaixo seguindo exatamente o formato:
 *
 *   {
 *     nome: "Nome Completo",
 *     pausas: [
 *       { tipo: "Pausa 1", horario: "10:15" },
 *       { tipo: "Almoço",  horario: "12:30" },
 *       { tipo: "Pausa 2", horario: "15:45" }
 *     ]
 *   }
 *
 * Os horários devem estar no formato 24h ("HH:MM").
 * O sinalizador disparará automaticamente 10 minutos antes de cada horário.
 * ============================================================================
 */
export const OPERADORES_ESCALA: Operador[] = [
  {
    nome: "Ana Carolina Mendes",
    pausas: [
      { tipo: "Pausa 1", horario: "09:40" },
      { tipo: "Almoço", horario: "12:00" },
      { tipo: "Pausa 2", horario: "15:10" },
    ],
  },
  {
    nome: "Bruno Henrique Costa",
    pausas: [
      { tipo: "Pausa 1", horario: "10:00" },
      { tipo: "Almoço", horario: "12:20" },
      { tipo: "Pausa 2", horario: "15:30" },
    ],
  },
  {
    nome: "Camila Ferreira Duarte",
    pausas: [
      { tipo: "Pausa 1", horario: "10:15" },
      { tipo: "Almoço", horario: "12:30" },
      { tipo: "Pausa 2", horario: "15:45" },
    ],
  },
  {
    nome: "Diego Augusto Martins",
    pausas: [
      { tipo: "Pausa 1", horario: "10:30" },
      { tipo: "Almoço", horario: "13:00" },
      { tipo: "Pausa 2", horario: "16:00" },
    ],
  },
  {
    nome: "Eduarda Lima Nogueira",
    pausas: [
      { tipo: "Pausa 1", horario: "10:45" },
      { tipo: "Almoço", horario: "13:15" },
      { tipo: "Pausa 2", horario: "16:20" },
    ],
  },
  {
    nome: "Felipe Rocha Almeida",
    pausas: [
      { tipo: "Pausa 1", horario: "11:00" },
      { tipo: "Almoço", horario: "13:30" },
      { tipo: "Pausa 2", horario: "16:40" },
    ],
  },
  {
    nome: "Gabriela Souza Ribeiro",
    pausas: [
      { tipo: "Pausa 1", horario: "14:20" },
      { tipo: "Lanche", horario: "17:00" },
      { tipo: "Pausa 2", horario: "19:15" },
    ],
  },
  {
    nome: "João Silva",
    pausas: [
      { tipo: "Pausa 1", horario: "10:15" },
      { tipo: "Almoço", horario: "12:30" },
      { tipo: "Pausa 2", horario: "15:45" },
    ],
  },
  {
    nome: "Larissa Oliveira Santos",
    pausas: [
      { tipo: "Pausa 1", horario: "14:40" },
      { tipo: "Lanche", horario: "17:30" },
      { tipo: "Pausa 2", horario: "19:45" },
    ],
  },
  {
    nome: "Mateus Pereira Barros",
    pausas: [
      { tipo: "Pausa 1", horario: "15:00" },
      { tipo: "Lanche", horario: "18:00" },
      { tipo: "Pausa 2", horario: "20:10" },
    ],
  },
];
