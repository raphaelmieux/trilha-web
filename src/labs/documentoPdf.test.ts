import { describe, it, expect } from 'vitest';
import {
  type DocumentoPdf, type Pagina, type Captura,
  CAPTURA_BOA, pesoKb, pesoEscrito, procurar, ehPesquisavel, paginasSemTexto,
  juntar, extrair, dividir, comprimir, reconhecerTexto, qualidadeDaCaptura,
  lerComoOcr, preencher, camposPorPreencher, anotar, impressaoDoDocumento,
  assinarComImagem, assinarVerificavel, estadoDaAssinatura,
  proteger, removerSenha, copiarTexto,
} from './documentoPdf';

/*
  O motor do documento PDF.

  Quase tudo aqui mede a mesma coisa por ângulos diferentes: a diferença que
  **não se vê**. Um PDF pesquisável e um em imagem desenham igual; uma
  assinatura colada e uma verificável mostram o mesmo rabisco; um documento
  protegido por senha parece um cofre. Cada trava abaixo existe para que uma
  dessas três continue acontecendo de verdade, e não só no enunciado.
*/

const digital = (id: string, linhas: string[]): Pagina =>
  ({ id, linhas, texto: linhas.join('\n'), origem: 'programa' });

const digitalizada = (id: string, linhas: string[], captura: Captura = CAPTURA_BOA): Pagina =>
  ({ id, linhas, captura, origem: 'papel' });

const doc = (nome: string, paginas: Pagina[]): DocumentoPdf =>
  ({ nome, paginas, campos: [], anotacoes: [] });

const ATA = ['Ata da reunião do clube', 'O acampamento foi aprovado pela diretoria.'];

describe('procurar lê o texto por baixo, e nunca o desenho', () => {
  /*
    É a trava que faz o requisito 5 ter o que comprovar. As duas páginas
    desenham exatamente as mesmas linhas; uma tem texto dentro e a outra não.
    Se a procura olhasse o desenho, as duas responderiam igual e "comprovar o
    resultado localizando uma palavra" deixaria de comprovar qualquer coisa.
  */
  it('acha a palavra no documento pesquisável', () => {
    expect(procurar(doc('ata.pdf', [digital('p1', ATA)]), 'acampamento')).toHaveLength(1);
  });

  it('não acha nada no documento em imagem, que desenha o mesmo', () => {
    const imagem = doc('ata.pdf', [digitalizada('p1', ATA)]);
    const texto = doc('ata.pdf', [digital('p1', ATA)]);

    /* As duas desenham a mesma coisa — é esse o ponto. */
    expect(imagem.paginas[0].linhas).toEqual(texto.paginas[0].linhas);
    expect(procurar(imagem, 'acampamento')).toHaveLength(0);
  });

  it('acha sem acento e sem maiúscula, como qualquer leitor de PDF', () => {
    const d = doc('ata.pdf', [digital('p1', ['A REUNIÃO foi longa'])]);
    expect(procurar(d, 'reuniao')).toHaveLength(1);
  });

  it('procurar vazio não acha tudo', () => {
    /* `''` está contido em qualquer string: sem a guarda, procurar nada
       devolveria o documento inteiro e a tarefa de comprovar abriria verde. */
    expect(procurar(doc('ata.pdf', [digital('p1', ATA)]), '  ')).toHaveLength(0);
  });
});

describe('pesquisável é uma conta sobre todas as páginas', () => {
  it('uma página sem texto basta para não ser', () => {
    const d = doc('dossie.pdf', [digital('p1', ATA), digitalizada('p2', ATA)]);
    expect(ehPesquisavel(d)).toBe(false);
    expect(paginasSemTexto(d).map(p => p.id)).toEqual(['p2']);
  });

  it('documento sem página nenhuma não é pesquisável', () => {
    /*
      "Zero de zero é tudo" outra vez: `every` sobre lista vazia é `true`, e
      sem a guarda um PDF sem páginas se diria pesquisável — o dossiê do
      requisito 8 fecharia verde com um arquivo vazio dentro.
    */
    expect(ehPesquisavel(doc('vazio.pdf', []))).toBe(false);
  });
});

describe('o reconhecimento erra quando a captura está ruim', () => {
  const torta: Captura = { inclinacao: 14, margem: 30, contraste: 34, nitidez: 100 };

  it('com a captura boa, o texto sai inteiro', () => {
    const d = reconhecerTexto(doc('ata.pdf', [digitalizada('p1', ATA)]));
    expect(d.paginas[0].texto).toBe(ATA.join('\n'));
    expect(procurar(d, 'acampamento')).toHaveLength(1);
  });

  it('com a captura ruim, o texto sai quase certo — e a procura falha', () => {
    const d = reconhecerTexto(doc('ata.pdf', [digitalizada('p1', ATA, torta)]));

    /* Reconheceu: existe texto. É essa a parte cruel — do lado de fora o
       arquivo passou a ser "pesquisável". */
    expect(d.paginas[0].texto).toBeTruthy();
    expect(ehPesquisavel(d)).toBe(true);

    /* E não acha a palavra, porque ela saiu escrita de outro jeito. */
    expect(procurar(d, 'acampamento')).toHaveLength(0);
  });

  it('o erro é a troca clássica, e não garrancho', () => {
    /*
      Reconhecimento ruim não produz lixo, produz palavra parecida — o "m" que
      vira "rn" é a mais famosa delas. Importa que seja assim: texto que falta
      se percebe olhando, texto quase certo não se percebe de jeito nenhum.
    */
    expect(lerComoOcr('acampamento', 0)).toBe('acarnparnento');
  });

  it('e nenhuma palavra portuguesa comum escapa da troca', () => {
    /*
      A lista de trocas começou com quatro letras e tinha um buraco calado:
      palavra sem m, l, 0 ou ç saía intacta de um reconhecimento péssimo. Cinco
      destas oito passavam ilesas — entre elas "Ficha", "Recibo" e "Chácara",
      que são as que as lições mandam procurar. A página ficava mal lida e
      perfeitamente pesquisável.
    */
    const comuns = [
      'Ficha', 'médica', 'Clube', 'Desbravadores', 'Recibo',
      'Chácara', 'acampamento', 'reunião', 'ata', 'presença',
    ];
    for (const palavra of comuns) {
      expect(lerComoOcr(palavra, 0), `"${palavra}" saiu intacta`).not.toBe(palavra);
    }
  });

  it('a qualidade cai com cada um dos três defeitos, sozinho', () => {
    const q = qualidadeDaCaptura;
    expect(q(CAPTURA_BOA)).toBe(1);
    expect(q({ ...CAPTURA_BOA, contraste: 30 })).toBeLessThan(1);
    expect(q({ ...CAPTURA_BOA, inclinacao: 15 })).toBeLessThan(1);
    expect(q({ ...CAPTURA_BOA, margem: 40 })).toBeLessThan(1);
    expect(q({ ...CAPTURA_BOA, nitidez: 20 })).toBeLessThan(1);
  });

  it('não reconhece por cima de quem já tem texto', () => {
    /*
      A página de prova aqui é uma **digitalizada que já foi reconhecida**, e
      não uma digital: a digital não tem captura nenhuma, então a primeira
      metade da guarda sozinha já a protegeria, e a trava passaria sem nunca
      exercitar a segunda.

      O caso de verdade é o do requisito 8: juntam-se cinco documentos, manda-se
      reconhecer o dossiê inteiro, e as páginas que já estavam boas seriam
      relidas — trocando texto exato por texto adivinhado, num arquivo que
      continuaria dizendo "pesquisável".
    */
    const jaLido = reconhecerTexto(doc('ata.pdf', [digitalizada('p1', ATA)]));
    expect(procurar(jaLido, 'acampamento')).toHaveLength(1);

    const deNovo = reconhecerTexto({
      ...jaLido,
      paginas: jaLido.paginas.map(p => ({
        ...p, captura: { ...p.captura!, contraste: 20, nitidez: 25 },
      })),
    });
    expect(deNovo.paginas[0].texto).toBe(jaLido.paginas[0].texto);
    expect(procurar(deNovo, 'acampamento')).toHaveLength(1);
  });
});

describe('comprimir tira de quem é imagem, e a ordem importa', () => {
  it('a foto de papel pesa muito mais que a página digitada', () => {
    /*
      Esta assimetria é a **premissa** do módulo inteiro, e por isso ela é
      trava e não constante solta: é dela que sai por que comprimir um
      documento digitado não adianta e comprimir um digitalizado adianta
      muito. Igualadas as duas, todas as outras contas daqui continuariam
      certas — as relativas ainda passariam — e o requisito 4.4 viraria um
      botão que mexe num número sem nada por trás.
    */
    const digitada = doc('ata.pdf', [digital('p1', ATA)]);
    const fotografada = doc('foto.pdf', [digitalizada('p1', ATA)]);
    expect(pesoKb(fotografada)).toBeGreaterThan(pesoKb(digitada) * 20);
  });

  it('num documento digitado quase não muda o peso', () => {
    const antes = doc('ata.pdf', [digital('p1', ATA), digital('p2', ATA)]);
    expect(pesoKb(comprimir(antes, 'forte'))).toBe(pesoKb(antes));
  });

  it('num digitalizado o peso despenca', () => {
    const antes = doc('foto.pdf', [digitalizada('p1', ATA)]);
    expect(pesoKb(comprimir(antes, 'forte'))).toBeLessThan(pesoKb(antes) / 3);
  });

  it('reconhecer e depois comprimir mantém o arquivo pesquisável', () => {
    const d = comprimir(reconhecerTexto(doc('foto.pdf', [digitalizada('p1', ATA)])), 'forte');
    expect(procurar(d, 'acampamento')).toHaveLength(1);
    expect(pesoKb(d)).toBeLessThan(600);
  });

  it('comprimir e depois reconhecer estraga o texto, sem nada avisar', () => {
    /*
      A mesma foto, as mesmas duas operações, a ordem trocada — e o arquivo
      fica do mesmo tamanho nos dois casos. É a família do sumário que guarda
      o que leu: nada na tela diz que a ordem custou alguma coisa.
    */
    const naOrdemCerta = comprimir(reconhecerTexto(doc('f.pdf', [digitalizada('p1', ATA)])), 'forte');
    const naOrdemErrada = reconhecerTexto(comprimir(doc('f.pdf', [digitalizada('p1', ATA)]), 'forte'));

    expect(procurar(naOrdemErrada, 'acampamento')).toHaveLength(0);
    expect(procurar(naOrdemCerta, 'acampamento')).toHaveLength(1);
  });

  it('a nitidez só desce', () => {
    const uma = comprimir(doc('f.pdf', [digitalizada('p1', ATA)]), 'leve');
    const duas = comprimir(uma, 'leve');
    expect(duas.paginas[0].captura!.nitidez).toBeLessThan(uma.paginas[0].captura!.nitidez);
  });

  it('o peso se escreve como o gerenciador de arquivos escreve', () => {
    expect(pesoEscrito(840)).toBe('840 KB');
    expect(pesoEscrito(1850)).toBe('1,8 MB');
  });
});

describe('juntar, extrair e dividir', () => {
  const a = doc('a.pdf', [digital('a1', ['Primeira']), digital('a2', ['Segunda'])]);
  const b = doc('b.pdf', [digital('b1', ['Terceira'])]);

  it('juntar põe as páginas na ordem dos documentos', () => {
    expect(juntar([a, b], 'dossie.pdf').paginas.map(p => p.id)).toEqual(['a1', 'a2', 'b1']);
  });

  it('juntar não leva assinatura nenhuma adiante', () => {
    /*
      A assinatura verificável afirma sobre o documento que foi assinado, e o
      juntado é outro. Sobrevivendo à junção, ela estaria afirmando sobre
      páginas que nunca viu — e mostrando "válida" para quem conferisse.
    */
    const assinado = assinarVerificavel(a, 'Tia Rute', 1_700_000_000_000);
    expect(estadoDaAssinatura(juntar([assinado, b], 'd.pdf'))).toBe('nenhuma');
  });

  it('extrair não mexe no original', () => {
    const so = extrair(a, ['a2'], 'so.pdf');
    expect(so.paginas.map(p => p.id)).toEqual(['a2']);
    expect(a.paginas).toHaveLength(2);
  });

  it('extrair leva só as anotações das páginas que foram', () => {
    const comNotas = anotar(anotar(a,
      { id: 'n1', paginaId: 'a1', tipo: 'comentario', texto: 'rever', por: 'Tia Rute' }),
    { id: 'n2', paginaId: 'a2', tipo: 'destaque', texto: 'Segunda', por: 'Tia Rute' });

    expect(extrair(comNotas, ['a2'], 'so.pdf').anotacoes.map(n => n.id)).toEqual(['n2']);
  });

  it('dividir devolve os dois lados, sem perder página', () => {
    const [um, dois] = dividir(a, 'a2', ['um.pdf', 'dois.pdf']);
    expect(um.paginas.map(p => p.id)).toEqual(['a1']);
    expect(dois.paginas.map(p => p.id)).toEqual(['a2']);
  });
});

describe('formulário', () => {
  const ficha: DocumentoPdf = {
    nome: 'ficha.pdf',
    paginas: [digital('p1', ['Ficha de inscrição'])],
    campos: [
      { id: 'nome', rotulo: 'Nome', valor: '', obrigatorio: true },
      { id: 'obs', rotulo: 'Observações', valor: '', obrigatorio: false },
    ],
    anotacoes: [],
  };

  it('só o obrigatório em branco conta como por preencher', () => {
    expect(camposPorPreencher(ficha).map(c => c.id)).toEqual(['nome']);
    expect(camposPorPreencher(preencher(ficha, 'nome', 'Ana'))).toHaveLength(0);
  });

  it('espaço em branco não preenche campo', () => {
    /* "Zero link não é zero link quebrado" aplicado ao formulário: um campo
       com três espaços parece preenchido na tela e não diz nada. */
    expect(camposPorPreencher(preencher(ficha, 'nome', '   '))).toHaveLength(1);
  });
});

describe('a assinatura colada e a verificável, que são iguais na tela', () => {
  const carta = doc('carta.pdf', [digital('p1', ['Autorizo a participação.'])]);

  it('sem assinatura, nenhuma', () => {
    expect(estadoDaAssinatura(carta)).toBe('nenhuma');
  });

  it('no dia de assinar, as duas parecem a mesma coisa', () => {
    expect(estadoDaAssinatura(assinarComImagem(carta))).toBe('imagem');
    expect(estadoDaAssinatura(assinarVerificavel(carta, 'Tio Samuel', 1))).toBe('valida');
  });

  it('mexer no documento quebra a verificável', () => {
    const assinado = assinarVerificavel(carta, 'Tio Samuel', 1);
    const mexido = { ...assinado, paginas: [digital('p1', ['Autorizo a participação. E o transporte.'])] };
    expect(estadoDaAssinatura(mexido)).toBe('quebrada');
  });

  it('e não quebra a colada, que é o motivo de ela não provar nada', () => {
    const assinado = assinarComImagem(carta);
    const mexido = { ...assinado, paginas: [digital('p1', ['Autorizo tudo.'])] };
    expect(estadoDaAssinatura(mexido)).toBe('imagem');
  });

  it('preencher um campo depois de assinar também conta como mexer', () => {
    /* O documento assinado dizia outra coisa. Se a impressão lesse só as
       páginas, dava para assinar a ficha em branco e preencher depois. */
    const ficha: DocumentoPdf = {
      ...carta,
      campos: [{ id: 'valor', rotulo: 'Valor', valor: '10', obrigatorio: true }],
    };
    const assinado = assinarVerificavel(ficha, 'Tio Samuel', 1);
    expect(estadoDaAssinatura(preencher(assinado, 'valor', '1000'))).toBe('quebrada');
  });

  it('a impressão muda quando o conteúdo muda', () => {
    const outro = doc('carta.pdf', [digital('p1', ['Outra coisa.'])]);
    expect(impressaoDoDocumento(carta)).not.toBe(impressaoDoDocumento(outro));
  });
});

describe('senha não é segurança', () => {
  const sigiloso = proteger(doc('atas.pdf', [digital('p1', ['Valor em caixa: 4820'])]), {
    senha: 'clube2026',
    pedeAoLeitor: { naoCopiar: true, naoImprimir: true },
  });

  it('o texto sai mesmo com "não permitir copiar" ligado', () => {
    /*
      A restrição é um pedido gravado no arquivo, que o leitor obedece porque
      quer. Fazer a simulação obedecer ensinaria que é uma trava — que é a
      crença que o requisito 7 existe para desfazer, e pela via pior: a de
      quem confiou e mandou o documento adiante.
    */
    expect(sigiloso.protecao!.pedeAoLeitor.naoCopiar).toBe(true);
    expect(copiarTexto(sigiloso)).toContain('4820');
  });

  it('quem sabe a senha salva sem senha, e aí ela acabou', () => {
    const aberto = removerSenha(sigiloso, 'clube2026');
    expect(aberto).not.toBeNull();
    expect(aberto!.protecao).toBeUndefined();
  });

  it('com a senha errada, não', () => {
    expect(removerSenha(sigiloso, 'chute')).toBeNull();
  });
});
