/**
 * As soluções de referência dos laboratórios da CC-FE004 DOM.
 *
 * Só as travas importam isto: a de motor, que confere que cada uma fecha a
 * lista, e a que clica, que as escreve no editor. Ficam num arquivo próprio
 * para as duas escreverem o mesmo texto — duas cópias da resposta divergiriam,
 * e a trava que clica passaria a conferir uma solução que a de motor não
 * confere. Nenhuma tela importa daqui.
 */

import { LICOES_DA_CC_FE004, type DescobertasDoDom, type LicaoDaCcFe004 } from './metasDaCcFe004';
import type { Arquivos } from './paginaViva';

export const com = (licao: LicaoDaCcFe004, script: string, html?: string): Arquivos => ({
  ...LICOES_DA_CC_FE004[licao].arquivos,
  'script.js': script,
  ...(html ? { 'index.html': html } : {}),
});

/* ── As soluções ─────────────────────────────────────────────────────── */

export const MURAL_CERTO = LICOES_DA_CC_FE004.juntos.arquivos['index.html']
  .replace('  <!-- A folha de estilo e o script estão na pasta, mas a página ainda não os chama. -->\n',
    '  <link rel="stylesheet" href="estilo.css">\n  <script src="script.js" defer></script>\n');

export const SOLUCOES: Record<LicaoDaCcFe004, Arquivos> = {
  juntos: com('juntos', `${LICOES_DA_CC_FE004.juntos.arquivos['script.js']}
const avisos = document.querySelectorAll('#avisos li');
document.querySelector('#contador').textContent = avisos.length + ' avisos';
`, MURAL_CERTO),

  achar: com('achar', `const titulo = document.querySelector('#titulo');
console.log(titulo);
console.log(document.querySelectorAll('.pessoa').length);
console.log(document.querySelector('[data-cargo="conselheira"]').textContent);
console.log(document.querySelectorAll('#membros li').length);
`),

  mudar: com('mudar', `const unidade = 'Jatobá';
const corDaUnidade = '#2E7D32';
const minimo = 50;

document.querySelector('#titulo').textContent = 'Unidade ' + unidade;
document.querySelector('#faixa').style.backgroundColor = corDaUnidade;

let soma = 0;
for (const membro of document.querySelectorAll('.membro')) {
  const pontos = Number(membro.dataset.pontos);
  if (pontos < minimo) membro.classList.add('abaixo');
  soma = soma + pontos;
}
document.querySelector('#total').textContent = soma;
`),

  'criar-e-remover': com('criar-e-remover', `const tarefas = [
  { texto: 'Montar a barraca', feita: true },
  { texto: 'Recolher lenha seca', feita: false },
  { texto: 'Encher os galões de água', feita: false },
  { texto: 'Cavar a vala em volta da barraca', feita: true },
];

const lista = document.querySelector('#tarefas');
document.querySelector('#carregando').remove();
for (const tarefa of tarefas) {
  const item = document.createElement('li');
  item.textContent = tarefa.texto;
  if (tarefa.feita) item.classList.add('feita');
  lista.append(item);
}
if (tarefas.length === 0) document.querySelector('#vazio').hidden = false;
`),

  eventos: com('eventos', `let presentes = 0;
const contador = document.querySelector('#presentes');

document.querySelector('#marcar').addEventListener('click', () => {
  presentes = presentes + 1;
  contador.textContent = presentes;
});
document.querySelector('#desfazer').addEventListener('click', () => {
  if (presentes > 0) presentes = presentes - 1;
  contador.textContent = presentes;
});

const busca = document.querySelector('#busca');
busca.addEventListener('input', () => {
  const procurado = busca.value.toLowerCase();
  for (const item of document.querySelectorAll('#membros li')) {
    const tem = item.textContent.toLowerCase().includes(procurado);
    item.classList.toggle('escondido', !tem);
  }
});

const ajuda = document.querySelector('#ajuda');
document.querySelector('#ajuda-botao').addEventListener('click', () => {
  ajuda.hidden = !ajuda.hidden;
});
`),

  formulario: com('formulario', `const formulario = document.querySelector('#inscricao');
const inscritos = document.querySelector('#inscritos');

formulario.addEventListener('submit', function (evento) {
  evento.preventDefault();
  const nome = document.querySelector('#nome').value.trim();
  const idade = Number(document.querySelector('#idade').value);
  const unidade = document.querySelector('#unidade').value;
  let certo = true;

  const avisar = (id, texto) => {
    document.querySelector(id).textContent = texto;
    if (texto) certo = false;
  };
  avisar('#erro-nome', nome === '' ? 'Escreva o nome.' : '');
  avisar('#erro-idade', idade < 10 || idade > 15 ? 'A idade de desbravador vai de 10 a 15 anos.' : '');
  avisar('#erro-unidade', unidade === '' ? 'Escolha a unidade.' : '');

  if (certo) {
    const item = document.createElement('li');
    item.textContent = nome + ' — ' + unidade;
    inscritos.append(item);
    formulario.reset();
  }
});
`),

  ferramentas: com('ferramentas', LICOES_DA_CC_FE004.ferramentas.arquivos['script.js']
    .replace('const pontos = campo.value;', 'const pontos = Number(campo.value);')),

  api: com('api', `const lista = document.querySelector('#feriados');
const escolhaDoAno = document.querySelector('#ano');
const carregando = document.querySelector('#carregando');
const erro = document.querySelector('#erro');

async function buscarFeriados(ano) {
  carregando.hidden = false;
  erro.hidden = true;
  try {
    const resposta = await fetch('https://brasilapi.com.br/api/feriados/v1/' + ano);
    const feriados = await resposta.json();
    lista.textContent = '';
    for (const f of feriados) {
      const item = document.createElement('li');
      item.textContent = f.date.slice(8, 10) + '/' + f.date.slice(5, 7) + ' — ' + f.name;
      lista.append(item);
    }
  } catch (e) {
    erro.textContent = 'Não foi possível buscar os feriados. Confira a conexão.';
    erro.hidden = false;
  } finally {
    carregando.hidden = true;
  }
}

escolhaDoAno.addEventListener('change', () => buscarFeriados(escolhaDoAno.value));
buscarFeriados(escolhaDoAno.value);
`),

  pagina: com('pagina', `const corpo = document.querySelector('#estados');
let estados = [];

const regiao = document.querySelector('#regiao');
const busca = document.querySelector('#busca');
const ordem = document.querySelector('#ordem');

function desenhar() {
  const procurado = busca.value.toLowerCase();
  const visiveis = estados
    .filter(e => regiao.value === '' || e.regiao.nome === regiao.value)
    .filter(e => e.nome.toLowerCase().includes(procurado))
    .sort((a, b) => (ordem.value === 'sigla' ? a.sigla.localeCompare(b.sigla) : a.nome.localeCompare(b.nome)));
  corpo.textContent = '';
  for (const e of visiveis) {
    const linha = document.createElement('tr');
    for (const valor of [e.sigla, e.nome, e.capital, e.regiao.nome]) {
      const celula = document.createElement('td');
      celula.textContent = valor;
      linha.append(celula);
    }
    corpo.append(linha);
  }
  document.querySelector('#contagem').textContent = visiveis.length + ' estados';
}

async function carregar() {
  const erro = document.querySelector('#erro');
  try {
    const resposta = await fetch('https://brasilapi.com.br/api/ibge/uf/v1');
    estados = await resposta.json();
    desenhar();
  } catch (e) {
    erro.textContent = 'Sem conexão: não deu para buscar os estados.';
    erro.hidden = false;
  }
}

regiao.addEventListener('change', desenhar);
busca.addEventListener('input', desenhar);
ordem.addEventListener('change', desenhar);
carregar();
`),
};

/* As descobertas do módulo 6 são gesto, e não estado: a solução as traz
   prontas, como a tela as entregaria depois de a pessoa olhar. */
export const OLHOU: DescobertasDoDom = {
  inspecionados: [{ id: 1, tag: 'strong', idDoElemento: 'total', classes: [], nome: 'strong#total', largura: 0, altura: 0, estilos: {}, texto: '0' }],
  paradas: [{ linha: 9, vez: 1, variaveis: [{ nome: 'pontos', valor: "'10'", tipo: 'string' }] }],
};
