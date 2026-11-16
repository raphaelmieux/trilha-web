import { getSpecialty } from '../curriculum';
import { nomeCompleto, type Certification } from '../types';
import { TRILHAS_DO_ME006, mestrados } from './mestrados';

/*
  A seção do ME006 no relatório.

  O certificado do Mestrado oficial existia, era emitido pela Faixa e ficava
  fora do documento entregue ao clube: o relatório anexava só os Token.Web()
  das trilhas escolhidas, e o do ME006 não é trilha. Quem tinha fechado sete
  trilhas da lista entregava um papel que não dizia uma palavra sobre o
  Mestrado — e o Mestrado é justamente o que a liderança precisa registrar.

  Anexar sem explicar também não basta. Quem lê o relatório conhece a ficha
  das especialidades e não conhece a plataforma: um certificado de Mestrado
  emitido por um site levanta a pergunta "com base em quê?", e a resposta tem
  de estar escrita ao lado dele. Por isso a seção diz três coisas, nesta
  ordem: o que o documento oficial pede, o que a plataforma conferiu para
  emitir, e o que ela **não** confere — as especialidades da lista que não
  existem aqui não entram na conta, e o registro continua sendo do clube.

  O texto mora aqui, fora da tela, porque o texto é a entrega — a decisão de
  `relatorioDeVeredas.ts`. A tela e o PDF leem a mesma seção.
*/

/*
  O requisito 1 do documento oficial, como está escrito em
  `public/curriculum files/ME006 Mestrado em Ciência e Tecnologia.pdf`. A
  lista é necessária para dizer quais especialidades **ficaram de fora** da
  conta, e é por nome porque é assim que a ficha do clube as escreve.
  `relatorioDoMestrado.test.ts` confere que toda trilha de `TRILHAS_DO_ME006`
  está nela pelo nome exato do registro.
*/
export const ESPECIALIDADES_DO_ME006 = [
  'Computação 1', 'Computação 2', 'Computação 3', 'Computação 4', 'Computação 5',
  'Desenvolvimento de Software', 'Eletrônica', 'Experimentos Científicos', 'Física',
  'Habilidades em Matemática 1', 'Habilidades em Matemática 2', 'Informática Programável',
  'Internet', 'Internet, Avançado', 'Metodologia de Estudo', 'Óptica', 'Química',
  'Segurança nas Redes Sociais', 'Web Designer', 'Web Designer, Avançado',
] as const;

export interface SecaoDoMestrado {
  titulo: string;
  paragrafos: string[];
  certificado: Certification;
}

const dataLonga = (iso: string) =>
  new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

const enumerar = (itens: string[]) =>
  itens.length <= 1 ? (itens[0] ?? '')
    : `${itens.slice(0, -1).join(', ')} e ${itens[itens.length - 1]}`;

const POR_EXTENSO = ['zero', 'uma', 'duas', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove', 'dez', 'onze', 'doze'];
const extenso = (n: number) => POR_EXTENSO[n] ?? String(n);

/**
 * A seção do ME006, ou `null` quando não há certificado **ativo** dele.
 *
 * Revogado não entra: a liderança que revogou não quer ver o documento
 * voltar anexado ao relatório — é a regra de `buildSpecialtyNarrative` para
 * os certificados das trilhas.
 */
export function montarSecaoDoMe006(
  certifications: readonly Certification[],
  studentName: string,
): SecaoDoMestrado | null {
  const certificado = certifications.find(c => c.status === 'active' && c.curriculum_code === 'ME006');
  if (!certificado) return null;

  const me006 = mestrados().find(m => m.code === 'mestrado_me006')!;
  const titulo = me006.nome;

  /* As trilhas que sustentam o Mestrado são as que têm Token.Web() **ativo**,
     que é exatamente o que a Edge Function conferiu ao emitir. Uma trilha
     concluída cujo certificado foi revogado depois não sustenta nada, e
     citá-la aqui afirmaria o que o servidor não aceitou. */
  const daLista = new Set<string>(TRILHAS_DO_ME006);
  const sustentam = certifications
    .filter(c => c.status === 'active' && daLista.has(c.curriculum_code))
    .sort((a, b) => a.issued_at.localeCompare(b.issued_at))
    .map(c => {
      const trilha = getSpecialty(c.curriculum_code);
      const nome = trilha ? nomeCompleto(trilha) : c.curriculum_code;
      return `${nome} (Token.Web() ${c.code}, de ${dataLonga(c.issued_at)})`;
    });

  const nomesAqui = new Set(TRILHAS_DO_ME006.map(code => getSpecialty(code)?.name).filter(Boolean));
  const deFora = ESPECIALIDADES_DO_ME006.filter(n => !nomesAqui.has(n));

  const oQueE = `O ${titulo} é um Mestrado oficial da classificação de especialidades do Clube de Desbravadores. O documento oficial tem um único requisito: ter ${extenso(me006.minimo)} das ${ESPECIALIDADES_DO_ME006.length} especialidades de uma lista que reúne computação, internet, programação, matemática e ciências. Não há prova própria do Mestrado: ele reconhece um conjunto de especialidades já conquistadas.`;

  /* Se alguma trilha teve o certificado revogado depois da emissão, a lista
     de hoje fica abaixo do mínimo — e escrever "concluiu cinco; o mínimo é
     sete" como motivo da emissão seria o relatório se contradizendo. Diz-se
     o que vale hoje, e que a emissão aconteceu antes. */
  const abaixo = sustentam.length < me006.minimo;
  const conclusao = abaixo
    ? `porque, na data da emissão, tinha ${extenso(me006.minimo)} especialidades da lista concluídas nesta plataforma, que é o mínimo exigido. Hoje ${sustentam.length === 1 ? 'continua ativo o certificado de uma delas' : `continuam ativos os certificados de ${extenso(sustentam.length)} delas`}: ${enumerar(sustentam)}.`
    : `porque concluiu nesta plataforma ${extenso(sustentam.length)} especialidades da lista — o mínimo exigido é ${extenso(me006.minimo)}: ${enumerar(sustentam)}.`;

  const porQue = `${studentName} recebeu o Token.Web() do ${titulo}, registrado sob o código ${certificado.code} em ${dataLonga(certificado.issued_at)}, ${conclusao} Cada uma foi conferida pelo próprio Token.Web() da trilha, que só é emitido depois de todos os requisitos cumpridos e da aprovação na avaliação final. Na emissão do Mestrado, a plataforma conferiu esses certificados no servidor, e só os ativos contaram: nenhum foi declarado pelo desbravador.`;

  const limite = `Das ${ESPECIALIDADES_DO_ME006.length} especialidades da lista, ${extenso(TRILHAS_DO_ME006.length)} existem na plataforma. As outras ${extenso(deFora.length)} — ${enumerar(deFora)} — não são oferecidas aqui e por isso não entraram na conta, mesmo que tenham sido conquistadas por outro caminho. O certificado atesta o que a plataforma conferiu; o reconhecimento e o registro do Mestrado continuam sendo feitos pela liderança do clube, pelos canais oficiais. O certificado segue anexo e pode ser conferido a qualquer tempo, informando o código na página de verificação da plataforma.`;

  return { titulo, paragrafos: [oQueE, porQue, limite], certificado };
}

/*
  A frase do anexo, para a capa, o fim do corpo e a tela.

  Ela sai na capa numa linha só — `desenharCapa` corta o que passar da
  margem —, e por isso é curta e diz os números, e não os nomes: os nomes
  estão nas seções.
*/
export function notaDeAnexo(certificadosDeTrilha: number, comMestrado: boolean): string | undefined {
  const total = certificadosDeTrilha + (comMestrado ? 1 : 0);
  if (total === 0) return undefined;
  if (!comMestrado) {
    return certificadosDeTrilha === 1
      ? 'Segue anexo o certificado Token.Web() referente à trilha concluída.'
      : `Seguem anexos os ${certificadosDeTrilha} certificados Token.Web() referentes às trilhas concluídas.`;
  }
  if (certificadosDeTrilha === 0) return 'Segue anexo o certificado Token.Web() do ME006 Mestrado em Ciência e Tecnologia.';
  return `Seguem anexos ${total} certificados Token.Web(): ${certificadosDeTrilha === 1 ? 'o da trilha concluída' : `${certificadosDeTrilha} de trilhas`} e o do ME006.`;
}
