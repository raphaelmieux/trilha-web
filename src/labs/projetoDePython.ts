/**
 * A pasta em que o programa da pessoa roda, e o que já existe dentro dela.
 *
 * ── Por que um programa precisa de mais do que o próprio texto ───────────
 * Até a CC002 o laboratório de Python era um arquivo só, rodando sozinho:
 * variável, condição, laço, e o resultado no painel. Da CC004 em diante isso
 * deixa de bastar em dois pontos, e os dois pedem a mesma coisa.
 *
 * O requisito 5 pede ler um arquivo, um CSV e um JSON — e quem lê precisa de
 * algo gravado para ler. Um laboratório que mandasse a pessoa primeiro gravar
 * e depois ler mediria gravar duas vezes; o que existe na vida é o arquivo que
 * já estava lá, exportado pela secretaria do clube.
 *
 * O requisito 8 pede um programa em dois arquivos-fonte, e o `import` entre
 * eles só encontra o segundo se ele existir em disco, numa pasta que o Python
 * procure.
 *
 * São duas necessidades e uma peça: escrever arquivos na pasta antes de
 * executar.
 *
 * ── O disco começa igual a cada execução, e isso é decisão ───────────────
 * A pasta é apagada e refeita antes de cada execução, e não remendada. Sem
 * isso, um arquivo gravado numa execução sobrevive à seguinte — e um programa
 * que grava errado, é corrigido para não gravar mais nada, e roda de novo,
 * passaria na verificação por causa do arquivo que a primeira execução deixou.
 *
 * É a família do "laboratório que abre resolvido", em outra roupa: a lista
 * fica verde, a tela mostra o que se espera de um laboratório funcionando, e
 * o que está sendo medido é a sobra de antes.
 *
 * ── E o módulo importado precisa ser relido ──────────────────────────────
 * `import` guarda o que carregou em `sys.modules`. O worker é um só e o
 * Pyodide vive entre execuções, então editar o segundo arquivo e mandar rodar
 * de novo executaria a **primeira** versão dele, sem nada na tela dizendo
 * isso. Quem está aprendendo a dividir um programa concluiria que dividir não
 * funciona.
 *
 * Por isso o preâmbulo esquece todo módulo carregado de dentro da pasta e
 * invalida o cache de importação. É o mesmo defeito silencioso do sumário do
 * Word, que guarda o que leu: o que está na tela e o que o programa usa
 * deixam de ser a mesma coisa, e nada avisa.
 */

/** Onde o programa da pessoa roda, dentro do sistema de arquivos do Pyodide. */
export const PASTA_DO_PROJETO = '/projeto';

/**
 * Um arquivo que existe na pasta do programa, além do que se digita no editor
 * principal.
 */
export interface ArquivoDoProjetoPython {
  /** O nome dele em disco: é por este nome que o programa o abre ou o importa. */
  nome: string;
  /** O que ele traz ao abrir. */
  modelo: string;
  /**
   * Se a pessoa escreve nele.
   *
   * Ausente, não: é dado que o programa lê — o CSV que a secretaria exportou,
   * o JSON de configuração —, e ele aparece na lateral do editor só de
   * leitura, como a `marcacao` faz nos laboratórios de CSS. O segundo
   * arquivo-fonte do requisito 8 é o caso contrário: ele é `true`, porque
   * escrevê-lo **é** o exercício.
   */
  editavel?: boolean;
}

/** Só o que a pessoa escreve — o que entra no rascunho e vai para a análise. */
export const arquivosEditaveis = (arquivos: ArquivoDoProjetoPython[]) =>
  arquivos.filter(a => a.editavel);

/**
 * O Python que prepara a pasta antes de executar o programa.
 *
 * Sai daqui, e não de dentro do worker em texto solto, para poder ser lido por
 * um teste sem subir doze megabytes de Pyodide — que é a mesma razão de
 * `roteiroDePython.ts` morar em TypeScript.
 */
export function preambuloDoProjeto(arquivos: Record<string, string>): string {
  /*
    `json.loads` em vez de interpolar o texto no meio do código.

    O conteúdo é escrito por quem faz a lição: aspas, barras invertidas e
    quebras de linha entram ali sem pedir licença, e qualquer um dos três
    estoura um literal montado à mão — ou, pior, fecha a string e o que vem
    depois vira código. `JSON.stringify` de um lado e `json.loads` do outro
    fazem a travessia sem interpretar nada.
  */
  const dados = JSON.stringify(JSON.stringify(arquivos));
  /*
    Tudo dentro de uma função, e a função apagada em seguida.

    O programa da pessoa roda no mesmo espaço de nomes que este preâmbulo, e
    um `import json` escrito aqui em cima ficaria valendo lá embaixo: um
    programa que esquecesse de importar o `json` funcionaria neste
    laboratório e estouraria no computador do clube, que é o pior dos dois
    lugares para descobrir. Dentro de uma função, os imports são locais e não
    encostam no que a pessoa escreveu.
  */
  return `
def _preparar_o_projeto():
    import json, os, shutil, sys, importlib

    pasta = ${JSON.stringify(PASTA_DO_PROJETO)}

    # Sair da pasta antes de apagá-la. O sistema de arquivos do Pyodide recusa
    # remover o diretório de trabalho atual — "Resource busy" —, e como o
    # worker vive entre execuções, a execução anterior deixou o processo
    # dentro dela. Sem esta linha a primeira execução funciona e a segunda
    # estoura, que é a forma mais confusa de um laboratório quebrar.
    os.chdir('/')

    # Disco limpo a cada execução: arquivo deixado pela execução anterior faria
    # a verificação medir a sobra de antes, e não o programa de agora.
    if os.path.isdir(pasta):
        shutil.rmtree(pasta)
    os.makedirs(pasta)

    for nome, conteudo in json.loads(${dados}).items():
        destino = os.path.abspath(os.path.join(pasta, nome))
        # Nome que sai da pasta escreveria por cima do Python do navegador, e
        # o estrago só apareceria na execução seguinte.
        if not destino.startswith(pasta + os.sep):
            raise ValueError('nome de arquivo fora da pasta do projeto: ' + nome)
        os.makedirs(os.path.dirname(destino), exist_ok=True)
        with open(destino, 'w', encoding='utf-8') as arquivo:
            arquivo.write(conteudo)

    # A pasta do programa vem primeiro: é assim que o Python de verdade
    # procura, e é o que faz "import chamada" achar o chamada.py ao lado.
    while pasta in sys.path:
        sys.path.remove(pasta)
    sys.path.insert(0, pasta)

    # E é dela que os caminhos relativos partem, que é a lição do tópico sobre
    # onde o arquivo vai parar.
    os.chdir(pasta)

    # Esquece o que foi importado daqui na execução passada. Sem isto, editar o
    # segundo arquivo e mandar rodar de novo executa a versão anterior dele,
    # calado.
    for nome_do_modulo, modulo in list(sys.modules.items()):
        origem = getattr(modulo, '__file__', None)
        if origem and os.path.abspath(origem).startswith(pasta + os.sep):
            del sys.modules[nome_do_modulo]
    importlib.invalidate_caches()

_preparar_o_projeto()
del _preparar_o_projeto
`;
}
