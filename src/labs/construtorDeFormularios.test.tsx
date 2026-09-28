// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import {
  CSS_DO_CONSTRUTOR, BarraDeRespostas, CartaoDoConstrutor, ListaDeOpcoes,
  PeDoCartao, PreviaDoFormulario, SeletorDeTipo, TabelaDeRespostas,
  TopoDoConstrutor,
} from './construtorDeFormularios';
import { type Campo, NOME_DO_TIPO, recusas } from './formulario';

/*
  A janela do construtor de formulários.

  Ela é programa novo, então não há recorte a conferir — o que esta trava pega é
  outra coisa: **o que a janela não pode dizer**.

  O requisito 7 pede que o desbravador identifique quais dos dados coletados são
  pessoais, e o requisito 5.2 pede que ele ache as inconsistências de
  preenchimento. As duas respostas estão no modelo, e a janela tem acesso às
  duas: escrever qualquer uma delas na tela resolveria o requisito numa olhada,
  e resolveria só para quem olha. É a decisão da linha da nuvem que não escreve
  o papel de ninguém, na CC-ES006.
*/

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;

function montar(no: React.ReactNode) {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  act(() => root.render(no));
}

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

const texto = () => container.textContent ?? '';
const botoes = () => [...container.querySelectorAll('button')];
const porTexto = (t: string) => botoes().find(b => (b.textContent ?? '').includes(t));
const clicar = (b: Element | undefined) => {
  expect(b).toBeDefined();
  act(() => { (b as HTMLElement).click(); });
};

const campo = (extra: Partial<Campo> = {}): Campo => ({
  id: 'x', rotulo: 'Nome do desbravador', tipo: 'texto-curto',
  obrigatorio: false, pessoal: false, ...extra,
});

describe('a janela não diz quais dados são pessoais', () => {
  /**
   * O teste forte: dois formulários iguais em tudo menos em `pessoal` têm de
   * desenhar exatamente a mesma coisa.
   *
   * Procurar a palavra "pessoal" na tela pegaria só a versão óbvia do defeito.
   * Comparar o desenho pega qualquer uma — um ícone, uma cor, um asterisco a
   * mais, um `aria-label` diferente.
   *
   * E ele mora na prévia, que é a peça que de fato **recebe** o `Campo`. A
   * primeira versão desta trava comparava dois desenhos de `CartaoDoConstrutor`,
   * que não recebe o campo nenhum: ela comparava uma string com ela mesma e não
   * podia reprovar em hipótese nenhuma. Trava que não pode falhar é pior do que
   * trava nenhuma, porque se lê como cobertura.
   */
  const desenhoCom = (pessoal: boolean) => {
    montar(
      <PreviaDoFormulario
        titulo="Inscrição" descricao="Uma ficha por desbravador"
        campos={[campo({ id: 'nome', rotulo: 'Nome do desbravador', pessoal })]}
        valores={{ nome: 'Ana' }} aoMudar={() => {}} recusas={[]} aoEnviar={() => {}}
      />,
    );
    const html = container.innerHTML;
    act(() => root.unmount());
    container.remove();
    return html;
  };

  it('dois campos iguais menos em pessoal desenham igual', () => {
    const comum = desenhoCom(false);
    const pessoalmente = desenhoCom(true);
    expect(comum.length).toBeGreaterThan(200);
    expect(pessoalmente).toBe(comum);
    montar(<span>fim</span>);
  });

  it('e nenhuma palavra do assunto chega à tela nem ao leitor de tela', () => {
    const campos = [campo({ id: 'a', rotulo: 'Nome', pessoal: true }),
      campo({ id: 'b', rotulo: 'Unidade', pessoal: false })];
    montar(
      <PreviaDoFormulario
        titulo="Inscrição" descricao="Uma ficha por desbravador"
        campos={campos} valores={{}} aoMudar={() => {}} recusas={[]} aoEnviar={() => {}}
      />,
    );
    const proibidas = ['pessoal', 'sensível', 'sensivel', 'privado', 'LGPD', 'protegido'];
    for (const pr of proibidas) expect(texto().toLowerCase()).not.toContain(pr.toLowerCase());
    const rotulos = [...container.querySelectorAll('[aria-label]')]
      .map(e => e.getAttribute('aria-label') ?? '').join(' ').toLowerCase();
    for (const pr of proibidas) expect(rotulos).not.toContain(pr.toLowerCase());
  });
});

describe('a tabela de respostas mostra o que foi digitado', () => {
  const CABECALHO = ['Enviado em', 'Nome', 'Unidade', 'Diárias'];
  const LINHAS = [
    ['2026-06-08T19:12', 'Ana Beatriz Lima', 'Falcão', '3'],
    ['2026-06-08T19:40', 'Bruno Costa', 'falcao', '3'],
    ['2026-06-09T08:22', 'Daniel Rocha', 'FALCÃO', '3'],
    ['2026-06-10T14:20', 'João Pedro Alves', 'Falcao ', '3'],
    ['2026-06-09T09:01', 'Eduarda Pires', '', '3'],
    ['2026-06-09T12:47', 'Felipe Andrade', 'Arara', '1.5'],
  ];

  it('as quatro grafias saem como quatro, sem nada marcando', () => {
    montar(<TabelaDeRespostas cabecalho={CABECALHO} linhas={LINHAS} />);
    const coluna = [...container.querySelectorAll('tbody tr')]
      .map(tr => tr.children[2].textContent ?? '');
    // O espaço atrás sobrevive até a tela: é a grafia que ninguém vê, e
    // aparar aqui a apagaria depois de o motor a ter preservado.
    expect(coluna).toEqual(['Falcão', 'falcao', 'FALCÃO', 'Falcao ', '', 'Arara']);
    // E nada na tela diz qual delas está errada.
    expect(texto()).not.toContain('(vazio)');
    expect(container.querySelectorAll('[data-erro], .fb-recusa').length).toBe(0);
  });

  it('e o número com ponto sai com ponto', () => {
    montar(<TabelaDeRespostas cabecalho={CABECALHO} linhas={LINHAS} />);
    expect(texto()).toContain('1.5');
    expect(texto()).not.toContain('1,5');
  });
});

describe('as peças aparecem pela presença do setter', () => {
  it('o nome só vira campo de digitar com aoMudarNome', () => {
    montar(
      <TopoDoConstrutor
        nome="Inscrição" aba="perguntas" aoTrocarAba={() => {}} respostas={16}
      />,
    );
    expect(container.querySelector('input.fb-nome')).toBeNull();
    expect(texto()).toContain('Inscrição');
  });

  it('e vira com ele', () => {
    montar(
      <TopoDoConstrutor
        nome="Inscrição" aoMudarNome={() => {}} aba="perguntas"
        aoTrocarAba={() => {}} respostas={16}
      />,
    );
    const campoNome = container.querySelector('input.fb-nome') as HTMLInputElement;
    expect(campoNome).not.toBeNull();
    expect(campoNome.value).toBe('Inscrição');
  });

  it('a contagem de respostas fica na aba', () => {
    montar(
      <TopoDoConstrutor nome="x" aba="perguntas" aoTrocarAba={() => {}} respostas={16} />,
    );
    const aba = botoes().find(b => (b.textContent ?? '').includes('Respostas'));
    expect(aba?.textContent).toContain('16');
  });

  it('Criar planilha e Baixar .csv só existem quando a lição os entrega', () => {
    montar(<BarraDeRespostas total={16} />);
    expect(porTexto('Criar planilha')).toBeUndefined();
    expect(porTexto('Baixar')).toBeUndefined();
    act(() => root.unmount());
    container.remove();

    let criou = false;
    montar(<BarraDeRespostas total={16} aoCriarPlanilha={() => { criou = true; }} />);
    clicar(porTexto('Criar planilha'));
    expect(criou).toBe(true);
  });

  it('a lista de opções é só de leitura sem aoMudar', () => {
    montar(<ListaDeOpcoes tipo="lista" opcoes={['Falcão', 'Águia']} />);
    const campos = [...container.querySelectorAll('input')] as HTMLInputElement[];
    expect(campos.length).toBe(2);
    expect(campos.every(c => c.readOnly)).toBe(true);
    expect(porTexto('Adicionar opção')).toBeUndefined();
  });

  it('e não desenha nada para um tipo que não tem opções', () => {
    montar(<ListaDeOpcoes tipo="texto-curto" opcoes={['nada']} aoMudar={() => {}} />);
    expect(container.querySelectorAll('input').length).toBe(0);
  });
});

describe('o seletor de tipo oferece todos os tipos', () => {
  it('os sete, com o de agora marcado', () => {
    // O requisito 4 pede três tipos diferentes, e "diferentes" só significa
    // alguma coisa se houver de onde escolher. Um menu com dois deixaria a
    // tarefa impossível de fechar.
    montar(
      <SeletorDeTipo tipo="texto-curto" aberto aoAbrir={() => {}} aoEscolher={() => {}} />,
    );
    const itens = [...container.querySelectorAll('[role="menuitemradio"]')];
    expect(itens.length).toBe(Object.keys(NOME_DO_TIPO).length);
    expect(itens.length).toBeGreaterThanOrEqual(3);
    const marcados = itens.filter(i => i.getAttribute('aria-checked') === 'true');
    expect(marcados.length).toBe(1);
    expect(marcados[0].textContent).toContain(NOME_DO_TIPO['texto-curto']);
  });

  it('e escolher um diz qual foi', () => {
    let escolhido = '';
    montar(
      <SeletorDeTipo
        tipo="texto-curto" aberto aoAbrir={() => {}}
        aoEscolher={t => { escolhido = t; }}
      />,
    );
    clicar(botoes().find(b => (b.textContent ?? '').includes(NOME_DO_TIPO.numero)));
    expect(escolhido).toBe('numero');
  });

  it('fechado, ele não desenha o menu', () => {
    // Sem isto os sete itens ficariam na tela de todo cartão, e a lista de
    // perguntas viraria um muro.
    montar(
      <SeletorDeTipo tipo="lista" aberto={false} aoAbrir={() => {}} aoEscolher={() => {}} />,
    );
    expect(container.querySelectorAll('[role="menuitemradio"]').length).toBe(0);
    expect(texto()).toContain(NOME_DO_TIPO.lista);
  });
});

describe('o cartão escolhido se distingue', () => {
  it('e o clique nele diz que foi escolhido', () => {
    let ativou = false;
    montar(
      <CartaoDoConstrutor ativo aoAtivar={() => { ativou = true; }}>
        <span>Pergunta</span>
      </CartaoDoConstrutor>,
    );
    const cartao = container.querySelector('.fb-cartao') as HTMLElement;
    expect(cartao.dataset.ativo).toBe('sim');
    act(() => { cartao.click(); });
    expect(ativou).toBe(true);
  });
});

describe('o interruptor de obrigatório diz o estado por mais de uma coisa', () => {
  it('pela palavra ao lado e pelo estado do controle, e não só pela cor', () => {
    montar(<PeDoCartao obrigatorio aoTrocarObrigatorio={() => {}} />);
    const chave = container.querySelector('[role="switch"]');
    expect(chave).not.toBeNull();
    expect(chave!.getAttribute('aria-checked')).toBe('true');
    expect(texto()).toContain('Obrigatório');
  });
});

describe('a prévia é onde obrigatório e validação significam alguma coisa', () => {
  const campos: Campo[] = [
    campo({ id: 'nome', rotulo: 'Nome do desbravador', obrigatorio: true }),
    campo({ id: 'email', rotulo: 'E-mail do responsável', obrigatorio: true, validacao: { tipo: 'email' } }),
  ];
  const form = {
    titulo: 'Inscrição', descricao: 'Uma por desbravador',
    campos, aceitandoRespostas: true, respostas: [],
  };

  it('a recusa aparece embaixo do campo que a causou', () => {
    const valores = { nome: 'Ana', email: 'joana.silva' };
    montar(
      <PreviaDoFormulario
        titulo={form.titulo} descricao={form.descricao} campos={campos}
        valores={valores} aoMudar={() => {}} recusas={recusas(form, valores)}
        aoEnviar={() => {}}
      />,
    );
    const cartoes = [...container.querySelectorAll('.fb-cartao')];
    const doEmail = cartoes.find(c => (c.textContent ?? '').includes('E-mail do responsável'));
    const doNome = cartoes.find(c => (c.textContent ?? '').includes('Nome do desbravador'));
    expect(doEmail?.querySelector('.fb-recusa')).not.toBeNull();
    // E não embaixo do outro: uma recusa que aparecesse em todos os cartões não
    // diria qual campo consertar.
    expect(doNome?.querySelector('.fb-recusa')).toBeNull();
  });

  it('o campo obrigatório leva o asterisco, e ele é anunciado', () => {
    montar(
      <PreviaDoFormulario
        titulo={form.titulo} descricao={form.descricao} campos={campos}
        valores={{}} aoMudar={() => {}} recusas={[]} aoEnviar={() => {}}
      />,
    );
    const estrelas = [...container.querySelectorAll('.fb-obrigatorio')];
    expect(estrelas.length).toBe(2);
    expect(estrelas[0].getAttribute('aria-label')).toBe('obrigatório');
  });

  it('o campo de número aceita ponto e vírgula, porque não é type=number', () => {
    // Um `type="number"` do navegador recusaria uma das duas formas antes de o
    // desbravador chegar na planilha, e a inconsistência do requisito 5.2
    // deixaria de poder acontecer. É a mesma razão de a simulação ter de
    // aguentar curiosidade.
    montar(
      <PreviaDoFormulario
        titulo="x" descricao="y"
        campos={[campo({ id: 'd', rotulo: 'Quantas diárias', tipo: 'numero' })]}
        valores={{ d: '1.5' }} aoMudar={() => {}} recusas={[]} aoEnviar={() => {}}
      />,
    );
    const entrada = container.querySelector('input.fb-resposta-campo') as HTMLInputElement;
    expect(entrada).not.toBeNull();
    expect(entrada.getAttribute('type')).not.toBe('number');
    expect(entrada.value).toBe('1.5');
  });

  it('as caixas de seleção juntam as escolhas com o separador que o CSV cita', () => {
    let escrito = '';
    montar(
      <PreviaDoFormulario
        titulo="x" descricao="y"
        campos={[campo({
          id: 'leva', rotulo: 'O que leva', tipo: 'varias-escolhas',
          opcoes: ['Alimentação', 'Transporte'],
        })]}
        valores={{ leva: 'Alimentação' }}
        aoMudar={(_, v) => { escrito = v; }} recusas={[]} aoEnviar={() => {}}
      />,
    );
    const caixas = [...container.querySelectorAll('input[type="checkbox"]')];
    clicar(caixas[1]);
    expect(escrito).toBe('Alimentação; Transporte');
  });
});

describe('a folha do construtor', () => {
  const indiceDe = (trecho: string) => CSS_DO_CONSTRUTOR.indexOf(trecho);

  it('a regra do botão desligado vem depois da do principal', () => {
    // Mesma especificidade: escrita antes, ela perde, e o botão desligado sai
    // roxo e branco com cara de clicável. Errar isso não estoura nada, e é o
    // defeito que a CC-ES005 teve nas duas janelas dela.
    const principal = indiceDe('.fb-bt[data-principal="sim"]');
    const desligado = indiceDe('.fb-bt:disabled');
    expect(principal).toBeGreaterThan(-1);
    expect(desligado).toBeGreaterThan(principal);
  });

  it('e o desligado troca o fundo, e não só a cor da palavra', () => {
    // Um retângulo roxo continua parecendo botão por mais clara que fique a
    // palavra dentro dele.
    const regra = CSS_DO_CONSTRUTOR.slice(indiceDe('.fb-bt:disabled'));
    const corpo = regra.slice(0, regra.indexOf('}'));
    expect(corpo).toContain('background');
  });

  it('no celular o diálogo sobe, e a regra vem depois da que o centra', () => {
    // A cápsula de tarefas da plataforma mora no canto de baixo. As duas regras
    // têm a mesma especificidade, então a ordem é o que decide — e a trava lê a
    // ordem, e não só a existência.
    const centra = indiceDe('.fb-fundo {');
    const media = indiceDe('@media (max-width: 760px)');
    const sobe = CSS_DO_CONSTRUTOR.indexOf('.fb-fundo { align-items: flex-start');
    expect(centra).toBeGreaterThan(-1);
    expect(sobe).toBeGreaterThan(media);
    expect(sobe).toBeGreaterThan(centra);
  });

  it('e o diálogo diz a própria cor de título', () => {
    // A plataforma pinta h1..h4 de quase branco, o que está certo no aplicativo
    // escuro dela e some em cima de papel branco.
    const regra = CSS_DO_CONSTRUTOR.slice(indiceDe('.fb-dialogo h2'));
    expect(regra.slice(0, regra.indexOf('}'))).toContain('color');
  });
});
