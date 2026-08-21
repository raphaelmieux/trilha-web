/*
 * Os temas de redação, um por trilha que pede um texto escrito.
 *
 * O laboratório era escrito em cima de um tema só — exigia menção a ARPANET e a
 * Tim Berners-Lee, o que é a história da Internet e de mais nada. A AP041 pede
 * um relatório sobre a história dos computadores, e uma terceira trilha pedirá
 * outro assunto: o tema passa a ser dado, e o laboratório fica genérico.
 *
 * Os critérios aqui só afirmam o que dá para verificar. A versão anterior
 * listava "Não contém plágio óbvio" e "Boa ortografia" e conferia, em ambos os
 * casos, se o texto tinha mais de zero palavras — dizia avaliar o que não
 * avaliava, que é pior do que não avaliar.
 */

export interface Exigencia {
  id: string;
  /** O que a pessoa lê na lista de critérios. */
  rotulo: string;
  /** Palavras ou expressões que satisfazem a exigência, em qualquer variação. */
  termos: string[];
}

export interface TemaDeRedacao {
  titulo: string;
  instrucoes: string;
  minimoPalavras: number;
  maximoPalavras: number;
  /** Assuntos que o texto precisa tocar. */
  exigencias: Exigencia[];
  placeholder: string;
}

export const TEMAS: Record<string, TemaDeRedacao> = {
  AP034: {
    titulo: 'História da Internet',
    instrucoes: 'Escreva sobre a história da Internet, em 250 a 300 palavras. Fale da ARPANET, da World Wide Web, dos protocolos que fazem a rede funcionar e do que a Internet mudou na vida das pessoas.',
    minimoPalavras: 250,
    maximoPalavras: 300,
    placeholder: 'Comece contando como tudo começou...',
    exigencias: [
      { id: 'e1', rotulo: 'Cita a ARPANET', termos: ['ARPANET', 'ARPA'] },
      { id: 'e2', rotulo: 'Cita a World Wide Web ou Tim Berners-Lee', termos: ['WWW', 'World Wide Web', 'Tim Berners-Lee', 'Berners-Lee'] },
      { id: 'e3', rotulo: 'Cita algum protocolo', termos: ['TCP/IP', 'TCP', 'HTTP', 'protocolo'] },
      { id: 'e4', rotulo: 'Fala do que mudou para as pessoas', termos: ['sociedade', 'pessoas', 'mudou', 'transformou', 'hoje', 'vida'] },
    ],
  },

  AP041: {
    titulo: 'História dos computadores',
    instrucoes: 'Escreva sobre a história dos computadores, com pelo menos 250 palavras. Conte como as pessoas calculavam antes, quais máquinas vieram depois, o que mudou com o computador pessoal e como ele é hoje.',
    /* O documento oficial pede "pelo menos 250 palavras" e não põe teto. O
       limite alto existe só para o campo não virar um despejo de texto copiado. */
    minimoPalavras: 250,
    maximoPalavras: 600,
    placeholder: 'Comece contando como as pessoas faziam contas antes de existir computador...',
    exigencias: [
      { id: 'e1', rotulo: 'Cita alguma máquina de calcular antiga', termos: ['abaco', 'ábaco', 'pascalina', 'Pascal', 'Babbage', 'Leibniz', 'régua de cálculo'] },
      { id: 'e2', rotulo: 'Cita um computador do século XX', termos: ['ENIAC', 'UNIVAC', 'Colossus', 'Mark I', 'valvula', 'válvula', 'transistor'] },
      { id: 'e3', rotulo: 'Fala do computador pessoal', termos: ['pessoal', 'PC', 'Apple', 'IBM', 'Microsoft', 'casa'] },
      { id: 'e4', rotulo: 'Fala dos computadores de hoje', termos: ['hoje', 'celular', 'smartphone', 'tablet', 'notebook', 'nuvem', 'atual'] },
      { id: 'e5', rotulo: 'Conta o que mudou para as pessoas', termos: ['mudou', 'facilitou', 'ajuda', 'vida', 'trabalho', 'escola', 'pessoas'] },
    ],
  },
};
