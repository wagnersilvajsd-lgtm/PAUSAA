export interface Pausa {
  tipo: string;
  horario: string; // Horário de início no formato 24h "HH:MM" (ex: "10:15")
  horarioFim?: string; // Horário opcional de término no formato 24h "HH:MM"
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
 * objetos na lista abaixo seguindo o formato:
 *
 *   {
 *     nome: "NOME DO OPERADOR",
 *     pausas: [
 *       { tipo: "Pausa 1", horario: "09:00", horarioFim: "09:10" },
 *       { tipo: "Lanche",  horario: "10:45", horarioFim: "11:05" },
 *       { tipo: "Pausa 2", horario: "12:20", horarioFim: "12:30" },
 *     ],
 *   }
 *
 * O sinalizador disparará automaticamente 10 e 5 minutos antes de cada `horario`
 * (ou 25 e 10 minutos antes para os colaboradores configurados em `OPERADORES_AVISO_25_10`).
 * ============================================================================
 */
export const OPERADORES_AVISO_25_10: ReadonlySet<string> = new Set([
  "HYLLARY BIANKA NASCIMENTO FIRMINO",
  "SAMARA VITÓRIA RUFINO DOS SANTOS",
  "VICTOR SILVA DE SOUZA",
  "GABRIEL SANTOS DA CRUZ NÓBREGA",
  "JÚLIA MARIA SOUSA GOMES",
  "LAIS CAMILA CANUTO PATRICIO DE ABREU",
  "AMANDA SANT' ANNA",
  "ANA KAROLINE DA SILVA SANTOS",
  "LAUDENICE NASCIMENTO DA SILVA VIEIRA",
  "LIVIA MARIA GONÇALVES BERTI",
  "MARIA SARA CABRAL DA SILVEIRA",
  "ALANA KETLYN DA SILVA SANTOS",
  "GIAN GABRIEL MUNIZ TAVARES DOS SANTOS",
  "STEFANIE HERCULANO DA SILVA",
  "JANDERSON PAULINO DE SOUZA",
]);

export function getOperatorAlertStages(operatorName: string): [25, 10] | [10, 5] {
  return OPERADORES_AVISO_25_10.has(operatorName) ? [25, 10] : [10, 5];
}

export const OPERADORES_ESCALA: Operador[] = [
  {
    nome: "OPERADOR TESTE",
    pausas: [
      { tipo: "Pausa 1", horario: "09:00", horarioFim: "09:10" },
      { tipo: "Lanche", horario: "12:00", horarioFim: "12:20" },
      { tipo: "Pausa 2", horario: "15:00", horarioFim: "15:10" },
    ],
  },
  {
    nome: "LILIANE RODRIGUES DE OLIVEIRA",
    pausas: [
      { tipo: "Pausa 1", horario: "01:00", horarioFim: "01:10" },
      { tipo: "Lanche", horario: "02:45", horarioFim: "03:05" },
      { tipo: "Pausa 2", horario: "04:20", horarioFim: "04:30" },
    ],
  },
  {
    nome: "LUANA SILVA DO NASCIMENTO",
    pausas: [
      { tipo: "Pausa 1", horario: "01:10", horarioFim: "01:20" },
      { tipo: "Lanche", horario: "02:55", horarioFim: "03:15" },
      { tipo: "Pausa 2", horario: "04:30", horarioFim: "04:40" },
    ],
  },
  {
    nome: "PEDRO VINICIUS DA SILVA",
    pausas: [
      { tipo: "Pausa 1", horario: "01:20", horarioFim: "01:30" },
      { tipo: "Lanche", horario: "03:05", horarioFim: "03:25" },
      { tipo: "Pausa 2", horario: "04:40", horarioFim: "04:50" },
    ],
  },
  {
    nome: "AMANDA KELLY LACERDA",
    pausas: [
      { tipo: "Pausa 1", horario: "07:00", horarioFim: "07:10" },
      { tipo: "Lanche", horario: "08:45", horarioFim: "09:05" },
      { tipo: "Pausa 2", horario: "10:20", horarioFim: "10:30" },
    ],
  },
  {
    nome: "CRISTIANE SILVA DE MELO",
    pausas: [
      { tipo: "Pausa 1", horario: "07:10", horarioFim: "07:20" },
      { tipo: "Lanche", horario: "08:55", horarioFim: "09:15" },
      { tipo: "Pausa 2", horario: "10:30", horarioFim: "10:40" },
    ],
  },
  {
    nome: "DANIELLA DE SOUZA FELIX SILVESTRE",
    pausas: [
      { tipo: "Pausa 1", horario: "07:20", horarioFim: "07:30" },
      { tipo: "Lanche", horario: "09:05", horarioFim: "09:25" },
      { tipo: "Pausa 2", horario: "10:40", horarioFim: "10:50" },
    ],
  },
  {
    nome: "ANA KAROLINE DA SILVA SANTOS",
    pausas: [
      { tipo: "Pausa 1", horario: "08:00", horarioFim: "08:10" },
      { tipo: "Lanche", horario: "09:45", horarioFim: "10:05" },
      { tipo: "Pausa 2", horario: "11:20", horarioFim: "11:30" },
    ],
  },
  {
    nome: "ANA KLECIA MARTINS DE ARAUJO",
    pausas: [
      { tipo: "Pausa 1", horario: "08:10", horarioFim: "08:20" },
      { tipo: "Lanche", horario: "09:55", horarioFim: "10:15" },
      { tipo: "Pausa 2", horario: "11:30", horarioFim: "11:40" },
    ],
  },
  {
    nome: "GABRIEL SANTOS DA CRUZ NÓBREGA",
    pausas: [
      { tipo: "Pausa 1", horario: "08:20", horarioFim: "08:30" },
      { tipo: "Lanche", horario: "10:05", horarioFim: "10:25" },
      { tipo: "Pausa 2", horario: "11:40", horarioFim: "11:50" },
    ],
  },
  {
    nome: "ADELAIDE KAROLINE SOARES PEREIRA",
    pausas: [
      { tipo: "Pausa 1", horario: "09:00", horarioFim: "09:10" },
      { tipo: "Lanche", horario: "10:45", horarioFim: "11:05" },
      { tipo: "Pausa 2", horario: "12:20", horarioFim: "12:30" },
    ],
  },
  {
    nome: "AMANDA SANT' ANNA",
    pausas: [
      { tipo: "Pausa 1", horario: "09:05", horarioFim: "09:15" },
      { tipo: "Lanche", horario: "10:50", horarioFim: "11:10" },
      { tipo: "Pausa 2", horario: "12:25", horarioFim: "12:35" },
    ],
  },
  {
    nome: "BIANCA LETICIA FELIPE",
    pausas: [
      { tipo: "Pausa 1", horario: "09:10", horarioFim: "09:20" },
      { tipo: "Lanche", horario: "10:55", horarioFim: "11:15" },
      { tipo: "Pausa 2", horario: "12:30", horarioFim: "12:40" },
    ],
  },
  {
    nome: "IRLEY RAYANNE GOMES DO NASCIMENTO",
    pausas: [
      { tipo: "Pausa 1", horario: "09:15", horarioFim: "09:25" },
      { tipo: "Lanche", horario: "11:00", horarioFim: "11:20" },
      { tipo: "Pausa 2", horario: "12:35", horarioFim: "12:45" },
    ],
  },
  {
    nome: "LAYDY DAYANE NASCIMENTO DA SILVA",
    pausas: [
      { tipo: "Pausa 1", horario: "09:20", horarioFim: "09:30" },
      { tipo: "Lanche", horario: "11:05", horarioFim: "11:25" },
      { tipo: "Pausa 2", horario: "12:40", horarioFim: "12:50" },
    ],
  },
  {
    nome: "LIANDRA LAYSA DOMINGUES OLIVEIRA",
    pausas: [
      { tipo: "Pausa 1", horario: "09:25", horarioFim: "09:35" },
      { tipo: "Lanche", horario: "11:10", horarioFim: "11:30" },
      { tipo: "Pausa 2", horario: "12:45", horarioFim: "12:55" },
    ],
  },
  {
    nome: "MICHELI SANTANA DE FREITAS SILVA",
    pausas: [
      { tipo: "Pausa 1", horario: "09:30", horarioFim: "09:40" },
      { tipo: "Lanche", horario: "11:15", horarioFim: "11:35" },
      { tipo: "Pausa 2", horario: "12:50", horarioFim: "13:00" },
    ],
  },
  {
    nome: "KÁTIA CEANE GOMES DOS SANTOS",
    pausas: [
      { tipo: "Pausa 1", horario: "09:30", horarioFim: "09:40" },
      { tipo: "Lanche", horario: "11:15", horarioFim: "11:35" },
      { tipo: "Pausa 2", horario: "12:50", horarioFim: "13:00" },
    ],
  },
  {
    nome: "MARIA CAROLINA GOMES FELIX",
    pausas: [
      { tipo: "Pausa 1", horario: "09:40", horarioFim: "09:50" },
      { tipo: "Lanche", horario: "11:25", horarioFim: "11:45" },
      { tipo: "Pausa 2", horario: "13:00", horarioFim: "13:10" },
    ],
  },
  {
    nome: "MARIA SARA CABRAL DA SILVEIRA",
    pausas: [
      { tipo: "Pausa 1", horario: "09:50", horarioFim: "10:00" },
      { tipo: "Lanche", horario: "11:35", horarioFim: "11:55" },
      { tipo: "Pausa 2", horario: "13:10", horarioFim: "13:20" },
    ],
  },
  {
    nome: "GISELE LIANY CRUZ DA SILVA",
    pausas: [
      { tipo: "Pausa 1", horario: "10:00", horarioFim: "10:10" },
      { tipo: "Lanche", horario: "11:45", horarioFim: "12:05" },
      { tipo: "Pausa 2", horario: "13:20", horarioFim: "13:30" },
    ],
  },
  {
    nome: "JÚLIA MARIA SOUSA GOMES",
    pausas: [
      { tipo: "Pausa 1", horario: "10:05", horarioFim: "10:15" },
      { tipo: "Lanche", horario: "11:50", horarioFim: "12:10" },
      { tipo: "Pausa 2", horario: "13:25", horarioFim: "13:35" },
    ],
  },
  {
    nome: "LAIS CAMILA CANUTO PATRICIO DE ABREU",
    pausas: [
      { tipo: "Pausa 1", horario: "10:10", horarioFim: "10:20" },
      { tipo: "Lanche", horario: "11:55", horarioFim: "12:15" },
      { tipo: "Pausa 2", horario: "13:30", horarioFim: "13:40" },
    ],
  },
  {
    nome: "LAUDENICE NASCIMENTO DA SILVA VIEIRA",
    pausas: [
      { tipo: "Pausa 1", horario: "10:15", horarioFim: "10:25" },
      { tipo: "Lanche", horario: "12:00", horarioFim: "12:20" },
      { tipo: "Pausa 2", horario: "13:35", horarioFim: "13:45" },
    ],
  },
  {
    nome: "MARIA EDUARDA DE LIMA",
    pausas: [
      { tipo: "Pausa 1", horario: "10:20", horarioFim: "10:30" },
      { tipo: "Lanche", horario: "12:05", horarioFim: "12:25" },
      { tipo: "Pausa 2", horario: "13:40", horarioFim: "13:50" },
    ],
  },
  {
    nome: "MARIA LETÍCIA DA SILVA ELIAS",
    pausas: [
      { tipo: "Pausa 1", horario: "10:25", horarioFim: "10:35" },
      { tipo: "Lanche", horario: "12:10", horarioFim: "12:30" },
      { tipo: "Pausa 2", horario: "13:45", horarioFim: "13:55" },
    ],
  },
  {
    nome: "STEFANIE HERCULANO DA SILVA",
    pausas: [
      { tipo: "Pausa 1", horario: "10:30", horarioFim: "10:40" },
      { tipo: "Lanche", horario: "12:15", horarioFim: "12:35" },
      { tipo: "Pausa 2", horario: "13:50", horarioFim: "14:00" },
    ],
  },
  {
    nome: "VANESSA RAQUEL SOARES DOS SANTOS",
    pausas: [
      { tipo: "Pausa 1", horario: "10:35", horarioFim: "10:45" },
      { tipo: "Lanche", horario: "12:20", horarioFim: "12:40" },
      { tipo: "Pausa 2", horario: "13:55", horarioFim: "14:05" },
    ],
  },
  {
    nome: "WILMARA FERREIRA DA SILVA",
    pausas: [
      { tipo: "Pausa 1", horario: "10:45", horarioFim: "10:55" },
      { tipo: "Lanche", horario: "12:30", horarioFim: "12:50" },
      { tipo: "Pausa 2", horario: "14:05", horarioFim: "14:15" },
    ],
  },
  {
    nome: "WISLANNY MARIA",
    pausas: [
      { tipo: "Pausa 1", horario: "10:50", horarioFim: "11:00" },
      { tipo: "Lanche", horario: "12:35", horarioFim: "12:55" },
      { tipo: "Pausa 2", horario: "14:10", horarioFim: "14:20" },
    ],
  },
  {
    nome: "BIANCA RODRIGUES NEVES",
    pausas: [
      { tipo: "Pausa 1", horario: "11:00", horarioFim: "11:10" },
      { tipo: "Lanche", horario: "12:45", horarioFim: "13:05" },
      { tipo: "Pausa 2", horario: "14:20", horarioFim: "14:30" },
    ],
  },
  {
    nome: "KAUANNE KARLA M R DA SILVA",
    pausas: [
      { tipo: "Pausa 1", horario: "11:05", horarioFim: "11:15" },
      { tipo: "Lanche", horario: "12:50", horarioFim: "13:10" },
      { tipo: "Pausa 2", horario: "14:25", horarioFim: "14:35" },
    ],
  },
  {
    nome: "MARIA VITORIA PEREIRA DOS SANTOS",
    pausas: [
      { tipo: "Pausa 1", horario: "11:10", horarioFim: "11:20" },
      { tipo: "Lanche", horario: "12:55", horarioFim: "13:15" },
      { tipo: "Pausa 2", horario: "14:30", horarioFim: "14:40" },
    ],
  },
  {
    nome: "RAFAELLY ALVES DA SILVA",
    pausas: [
      { tipo: "Pausa 1", horario: "11:15", horarioFim: "11:25" },
      { tipo: "Lanche", horario: "13:00", horarioFim: "13:20" },
      { tipo: "Pausa 2", horario: "14:35", horarioFim: "14:45" },
    ],
  },
  {
    nome: "RHAYSSA LÚCIA LIMA DE VASCONCELOS",
    pausas: [
      { tipo: "Pausa 1", horario: "11:20", horarioFim: "11:30" },
      { tipo: "Lanche", horario: "13:05", horarioFim: "13:25" },
      { tipo: "Pausa 2", horario: "14:40", horarioFim: "14:50" },
    ],
  },
  {
    nome: "THAIS SOARES REIS CARVALHO",
    pausas: [
      { tipo: "Pausa 1", horario: "11:25", horarioFim: "11:35" },
      { tipo: "Lanche", horario: "13:10", horarioFim: "13:30" },
      { tipo: "Pausa 2", horario: "14:45", horarioFim: "14:55" },
    ],
  },
  {
    nome: "VICTHORIA PAULA DA SILVA CABRAL",
    pausas: [
      { tipo: "Pausa 1", horario: "11:30", horarioFim: "11:40" },
      { tipo: "Lanche", horario: "13:15", horarioFim: "13:35" },
      { tipo: "Pausa 2", horario: "14:50", horarioFim: "15:00" },
    ],
  },
  {
    nome: "JULIANA ALEXANDRE DA SILVA",
    pausas: [
      { tipo: "Pausa 1", horario: "12:00", horarioFim: "12:10" },
      { tipo: "Lanche", horario: "13:45", horarioFim: "14:05" },
      { tipo: "Pausa 2", horario: "15:20", horarioFim: "15:30" },
    ],
  },
  {
    nome: "ALANA KETLYN DA SILVA SANTOS",
    pausas: [
      { tipo: "Pausa 1", horario: "13:00", horarioFim: "13:10" },
      { tipo: "Lanche", horario: "14:45", horarioFim: "15:05" },
      { tipo: "Pausa 2", horario: "16:20", horarioFim: "16:30" },
    ],
  },
  {
    nome: "IZABELLA DAYANA DUARTE",
    pausas: [
      { tipo: "Pausa 1", horario: "13:10", horarioFim: "13:20" },
      { tipo: "Lanche", horario: "14:55", horarioFim: "15:15" },
      { tipo: "Pausa 2", horario: "16:30", horarioFim: "16:40" },
    ],
  },
  {
    nome: "EVELLYN FERREIRA DE ALMEIDA",
    pausas: [
      { tipo: "Pausa 1", horario: "14:00", horarioFim: "14:10" },
      { tipo: "Lanche", horario: "15:45", horarioFim: "16:05" },
      { tipo: "Pausa 2", horario: "17:20", horarioFim: "17:30" },
    ],
  },
  {
    nome: "HYLLARY BIANKA NASCIMENTO FIRMINO",
    pausas: [
      { tipo: "Pausa 1", horario: "14:10", horarioFim: "14:20" },
      { tipo: "Lanche", horario: "15:55", horarioFim: "16:15" },
      { tipo: "Pausa 2", horario: "17:30", horarioFim: "17:40" },
    ],
  },
  {
    nome: "RAFAELA PEREIRA DOS SANTOS",
    pausas: [
      { tipo: "Pausa 1", horario: "14:20", horarioFim: "14:30" },
      { tipo: "Lanche", horario: "16:05", horarioFim: "16:25" },
      { tipo: "Pausa 2", horario: "17:40", horarioFim: "17:50" },
    ],
  },
  {
    nome: "SAMARA VITÓRIA RUFINO DOS SANTOS",
    pausas: [
      { tipo: "Pausa 1", horario: "14:30", horarioFim: "14:40" },
      { tipo: "Lanche", horario: "16:15", horarioFim: "16:35" },
      { tipo: "Pausa 2", horario: "17:50", horarioFim: "18:00" },
    ],
  },
  {
    nome: "TALLYTA SOUZA BATISTA",
    pausas: [
      { tipo: "Pausa 1", horario: "14:40", horarioFim: "14:50" },
      { tipo: "Lanche", horario: "16:25", horarioFim: "16:45" },
      { tipo: "Pausa 2", horario: "18:00", horarioFim: "18:10" },
    ],
  },
  {
    nome: "ALESSANDRA MORAIS DE LIMA",
    pausas: [
      { tipo: "Pausa 1", horario: "15:00", horarioFim: "15:10" },
      { tipo: "Lanche", horario: "16:45", horarioFim: "17:05" },
      { tipo: "Pausa 2", horario: "18:20", horarioFim: "18:30" },
    ],
  },
  {
    nome: "ISAC PEREIRA TONON",
    pausas: [
      { tipo: "Pausa 1", horario: "15:10", horarioFim: "15:20" },
      { tipo: "Lanche", horario: "16:55", horarioFim: "17:15" },
      { tipo: "Pausa 2", horario: "18:30", horarioFim: "18:40" },
    ],
  },
  {
    nome: "LIVIA MARIA GONÇALVES BERTI",
    pausas: [
      { tipo: "Pausa 1", horario: "15:20", horarioFim: "15:30" },
      { tipo: "Lanche", horario: "17:05", horarioFim: "17:25" },
      { tipo: "Pausa 2", horario: "18:40", horarioFim: "18:50" },
    ],
  },
  {
    nome: "MARIANA TEODÓSIO MAIA MARIANO",
    pausas: [
      { tipo: "Pausa 1", horario: "15:30", horarioFim: "15:40" },
      { tipo: "Lanche", horario: "17:15", horarioFim: "17:35" },
      { tipo: "Pausa 2", horario: "18:50", horarioFim: "19:00" },
    ],
  },
  {
    nome: "PEDRO HENRIQUE SANTOS",
    pausas: [
      { tipo: "Pausa 1", horario: "15:40", horarioFim: "15:50" },
      { tipo: "Lanche", horario: "17:25", horarioFim: "17:45" },
      { tipo: "Pausa 2", horario: "19:00", horarioFim: "19:10" },
    ],
  },
  {
    nome: "DAIANA LIMA",
    pausas: [
      { tipo: "Pausa 1", horario: "16:00", horarioFim: "16:10" },
      { tipo: "Lanche", horario: "17:45", horarioFim: "18:05" },
      { tipo: "Pausa 2", horario: "19:20", horarioFim: "19:30" },
    ],
  },
  {
    nome: "GIAN GABRIEL MUNIZ TAVARES DOS SANTOS",
    pausas: [
      { tipo: "Pausa 1", horario: "16:10", horarioFim: "16:20" },
      { tipo: "Lanche", horario: "17:55", horarioFim: "18:15" },
      { tipo: "Pausa 2", horario: "19:30", horarioFim: "19:40" },
    ],
  },
  {
    nome: "ANA VITÓRIA DA SILVA CARVALHO",
    pausas: [
      { tipo: "Pausa 1", horario: "17:00", horarioFim: "17:10" },
      { tipo: "Lanche", horario: "18:45", horarioFim: "19:05" },
      { tipo: "Pausa 2", horario: "20:20", horarioFim: "20:30" },
    ],
  },
  {
    nome: "LUIZ FELIPE SOUZA COSTA",
    pausas: [
      { tipo: "Pausa 1", horario: "17:10", horarioFim: "17:20" },
      { tipo: "Lanche", horario: "18:55", horarioFim: "19:15" },
      { tipo: "Pausa 2", horario: "20:30", horarioFim: "20:40" },
    ],
  },
  {
    nome: "VICTOR SILVA DE SOUZA",
    pausas: [
      { tipo: "Pausa 1", horario: "17:20", horarioFim: "17:30" },
      { tipo: "Lanche", horario: "19:05", horarioFim: "19:25" },
      { tipo: "Pausa 2", horario: "20:40", horarioFim: "20:50" },
    ],
  },
  {
    nome: "LUCIMAR SILVA DO REGO ARAUJO",
    pausas: [
      { tipo: "Pausa 1", horario: "18:00", horarioFim: "18:10" },
      { tipo: "Lanche", horario: "19:45", horarioFim: "20:05" },
      { tipo: "Pausa 2", horario: "21:20", horarioFim: "21:30" },
    ],
  },
  {
    nome: "VITORIA LIMA DA SILVA",
    pausas: [
      { tipo: "Pausa 1", horario: "18:10", horarioFim: "18:20" },
      { tipo: "Lanche", horario: "19:55", horarioFim: "20:15" },
      { tipo: "Pausa 2", horario: "21:30", horarioFim: "21:40" },
    ],
  },
  {
    nome: "ERIKA KELLA QUEIROZ BALBINO",
    pausas: [
      { tipo: "Pausa 1", horario: "19:00", horarioFim: "19:10" },
      { tipo: "Lanche", horario: "20:45", horarioFim: "21:05" },
      { tipo: "Pausa 2", horario: "22:20", horarioFim: "22:30" },
    ],
  },
  {
    nome: "JANDERSON PAULINO DE SOUZA",
    pausas: [
      { tipo: "Pausa 1", horario: "19:10", horarioFim: "19:20" },
      { tipo: "Lanche", horario: "20:55", horarioFim: "21:15" },
      { tipo: "Pausa 2", horario: "22:30", horarioFim: "22:40" },
    ],
  },
  {
    nome: "JÉSSICA MARIA DE SOUZA FELIX",
    pausas: [
      { tipo: "Pausa 1", horario: "19:20", horarioFim: "19:30" },
      { tipo: "Lanche", horario: "21:05", horarioFim: "21:25" },
      { tipo: "Pausa 2", horario: "22:40", horarioFim: "22:50" },
    ],
  },
];
