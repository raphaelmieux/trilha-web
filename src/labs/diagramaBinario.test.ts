import { describe, it, expect } from 'vitest';
import {
  DIAGRAMA_INICIAL, PECAS, VERIFICACOES, acrescentarPeca, caminhoDosBits,
  chegouNaSaida, desligar, ehCodigoBinario, ligar, pecasDoDiagrama, tirarPeca,
  ondePararam, tudoFeito, type Diagrama,
} from './diagramaBinario';

/*
  O diagrama do requisito 5 da AP045.

  As duas travas que carregam este arquivo são as de sempre, e as duas já
  custaram caro nesta casa: laboratório que abre resolvido não ensina nada, e
  laboratório que ninguém consegue vencer é pior do que um que abre resolvido.

  A terceira é desta lição: a seta ao contrário não estoura. Um diagrama com
  todas as peças e todas as setas escritas, uma delas apontando do monitor para
  a CPU, é um diagrama bonito que afirma o contrário do que o requisito ensina.
*/

/** Monta um diagrama pelos mesmos gestos que o desbravador daria. */
function montar(passos: (d: Diagrama) => Diagrama): Diagrama {
  return passos(DIAGRAMA_INICIAL);
}

/** A solução de referência: o caminho de um toque de tecla, como a teoria o conta. */
const SOLUCAO = montar(d => {
  let x = d;
  for (const id of ['teclado', 'cpu', 'ram', 'video', 'monitor']) x = acrescentarPeca(x, id);
  x = ligar(x, 'teclado', 'cpu', '01000001');
  x = ligar(x, 'cpu', 'ram', '01000001');
  x = ligar(x, 'cpu', 'video', '11111010');
  x = ligar(x, 'video', 'monitor', '11111010');
  return x;
});

describe('o diagrama abre vazio', () => {
  it('nenhuma verificação nasce verde', () => {
    /* Um diagrama que abrisse com o teclado e a CPU no lugar deixaria metade
       da lista verde no segundo zero, e "montar um diagrama" viraria "ligar as
       duas peças que já estão aí". */
    for (const v of VERIFICACOES) {
      expect(v.feita(DIAGRAMA_INICIAL), `${v.id} abre verde`).toBe(false);
    }
  });

  it('e a lista tem o que conferir', () => {
    /* A guarda contra o vazio, aplicada à própria trava: uma lista de
       verificações vazia deixaria o teste acima verde por não ter conferido
       nada. */
    expect(VERIFICACOES.length).toBeGreaterThanOrEqual(6);
  });

  it('toda verificação tem dica, e nenhuma dica entrega a resposta', () => {
    for (const v of VERIFICACOES) {
      expect(v.dica.length, `${v.id} sem dica`).toBeGreaterThan(20);
      /* Dica que escreve o gabarito faz da lista um formulário de cópia. O
         código de exemplo da lição pode aparecer — ele está na teoria —, mas o
         par de peças a ligar, não. */
      expect(v.dica).not.toMatch(/ligue .* (à|ao|na) /i);
    }
  });
});

describe('a solução de referência fecha a lista', () => {
  it('todas as verificações passam', () => {
    /* Laboratório impossível de vencer deixa quem fez tudo certo olhando uma
       lista vermelha sem nada na tela que explique. */
    for (const v of VERIFICACOES) {
      expect(v.feita(SOLUCAO), `${v.id} não fecha`).toBe(true);
    }
    expect(tudoFeito(SOLUCAO)).toBe(true);
  });

  it('o caminho vai do teclado ao monitor, passando pela placa de vídeo', () => {
    expect(caminhoDosBits(SOLUCAO)).toEqual(['teclado', 'cpu', 'video', 'monitor']);
  });
});

describe('a seta ao contrário', () => {
  /* O defeito que esta lição existe para pegar, e o único que nenhuma
     verificação de "existe ligação" enxergaria. */
  const AO_CONTRARIO = montar(d => {
    let x = d;
    for (const id of ['teclado', 'cpu', 'ram', 'monitor']) x = acrescentarPeca(x, id);
    x = ligar(x, 'teclado', 'cpu', '01000001');
    x = ligar(x, 'cpu', 'ram', '01000001');
    x = ligar(x, 'monitor', 'cpu', '11111010');
    return x;
  });

  it('as peças estão todas lá, e o caminho não chega', () => {
    expect(pecasDoDiagrama(AO_CONTRARIO)).toHaveLength(4);
    expect(chegouNaSaida(AO_CONTRARIO)).toBe(false);
    expect(caminhoDosBits(AO_CONTRARIO)).toEqual(['teclado', 'cpu', 'ram']);
  });

  it('e a lista não fecha', () => {
    expect(tudoFeito(AO_CONTRARIO)).toBe(false);
  });

  it('a ligação só conta na direção em que foi desenhada', () => {
    /* A trava de ponta a ponta acima reprova o diagrama inteiro, mas pela
       simulação — e isso deixava a conferência da **direção** sem teste
       nenhum. Foi a mutação que tornou `ligaComBinario` bidirecional que
       mostrou: ela sobreviveu à lista inteira e só derrubou um teste de
       rótulo, por acaso. */
    const cpuSaida = VERIFICACOES.find(v => v.id === 'cpu-saida')!;
    expect(cpuSaida.feita(AO_CONTRARIO)).toBe(false);

    const paraFrente = ligar(desligar(AO_CONTRARIO, 'monitor', 'cpu'), 'cpu', 'monitor', '11111010');
    expect(cpuSaida.feita(paraFrente)).toBe(true);
  });

  it('e a da entrada também', () => {
    const entradaCpu = VERIFICACOES.find(v => v.id === 'entrada-cpu')!;
    const invertida = ligar(desligar(SOLUCAO, 'teclado', 'cpu'), 'cpu', 'teclado', '01000001');
    expect(entradaCpu.feita(invertida)).toBe(false);
  });

  it('virar a seta conserta', () => {
    const certo = ligar(desligar(AO_CONTRARIO, 'monitor', 'cpu'), 'cpu', 'monitor', '11111010');
    expect(chegouNaSaida(certo)).toBe(true);
    expect(tudoFeito(certo)).toBe(true);
  });
});

describe('a simulação mostra, e não julga', () => {
  it('uma peça solta ao lado não impede os bits de chegarem', () => {
    /* Quem põe o teclado e o mouse e liga só o teclado montou um diagrama certo
       com uma peça solta ao lado. Começar o percurso pela primeira entrada da
       lista faria os bits saírem do mouse, não chegarem a lugar nenhum, e a
       tela acusar de erro um diagrama que está certo. */
    const comMouseSolto = acrescentarPeca(SOLUCAO, 'mouse');
    expect(chegouNaSaida(comMouseSolto)).toBe(true);
    expect(ondePararam(comMouseSolto)).toBeNull();
    expect(tudoFeito(comMouseSolto)).toBe(true);
  });

  it('e diz onde eles pararam quando não chegam', () => {
    /* É por aqui que a seta ao contrário aparece **enquanto se monta**, em vez
       de aparecer como um item vermelho sem explicação. */
    const preso = desligar(SOLUCAO, 'video', 'monitor');
    expect(ondePararam(preso)).toBe('video');
  });

  it('entre dois caminhos, vale o que chega — e não o mais comprido', () => {
    /* O desbravador ligou um ramo lateral mais longo que o caminho principal.
       "O mais comprido" escolheria o ramo, os bits parariam na placa de vídeo,
       e a tela acusaria um diagrama em que a informação chega. */
    let d = DIAGRAMA_INICIAL;
    for (const id of ['scanner', 'ram', 'cpu', 'video', 'teclado', 'monitor']) d = acrescentarPeca(d, id);
    d = ligar(d, 'scanner', 'ram', '01000001');
    d = ligar(d, 'ram', 'cpu', '01000001');
    d = ligar(d, 'cpu', 'video', '11111010');
    d = ligar(d, 'teclado', 'monitor', '11111010');
    expect(caminhoDosBits(d)).toEqual(['teclado', 'monitor']);
    expect(chegouNaSaida(d)).toBe(true);
  });

  it('e na CPU o caminho vai para a saída, não para a peça solta', () => {
    /* Quem acrescenta a placa de vídeo, liga a CPU a ela e **também** liga a
       CPU direto ao monitor tem duas saídas possíveis a partir da CPU. Seguir a
       primeira da lista pararia os bits na placa, num diagrama que chega. */
    let d = DIAGRAMA_INICIAL;
    for (const id of ['teclado', 'cpu', 'ram', 'video', 'monitor']) d = acrescentarPeca(d, id);
    d = ligar(d, 'teclado', 'cpu', '01000001');
    d = ligar(d, 'cpu', 'ram', '01000001');
    d = ligar(d, 'cpu', 'video', '11111010');
    d = ligar(d, 'cpu', 'monitor', '11111010');
    expect(caminhoDosBits(d)).toEqual(['teclado', 'cpu', 'monitor']);
  });

  it('num diagrama vazio ela não aponta para lugar nenhum', () => {
    expect(ondePararam(DIAGRAMA_INICIAL)).toBeNull();
    expect(caminhoDosBits(DIAGRAMA_INICIAL)).toEqual([]);
  });
});

describe('o rótulo da seta', () => {
  it('a letra que o código representa não vale pelo código', () => {
    /* `A` é plausível, é o que a pessoa quer dizer, e é exatamente o que não
       viaja no cabo. A lição inteira é que ali passa 01000001. */
    expect(ehCodigoBinario('A')).toBe(false);
    expect(ehCodigoBinario('letra A')).toBe(false);
    expect(ehCodigoBinario('01000001')).toBe(true);
  });

  it('seta sem rótulo não conta como seta com código', () => {
    /* "Há setas no diagrama" é verdade num diagrama de setas em branco. Toda
       verificação que o vazio satisfaz precisa exigir que algo exista. */
    const semRotulo = ligar(acrescentarPeca(acrescentarPeca(DIAGRAMA_INICIAL, 'teclado'), 'cpu'), 'teclado', 'cpu', '');
    const entradaCpu = VERIFICACOES.find(v => v.id === 'entrada-cpu')!;
    expect(entradaCpu.feita(semRotulo)).toBe(false);
  });

  it('o piso é quatro dígitos, e o espaço entre os grupos não atrapalha', () => {
    /* O requisito fala em "usando o código binário 1 e 0", não em ASCII de oito
       bits: reprovar 1011 seria cobrar uma regra que o documento não tem. */
    expect(ehCodigoBinario('1011')).toBe(true);
    expect(ehCodigoBinario('0100 0001')).toBe(true);
    expect(ehCodigoBinario('101')).toBe(false);
    expect(ehCodigoBinario('0100000A')).toBe(false);
  });
});

describe('mexer no diagrama', () => {
  it('a mesma peça não entra duas vezes', () => {
    const d = acrescentarPeca(acrescentarPeca(DIAGRAMA_INICIAL, 'cpu'), 'cpu');
    expect(d.nos).toHaveLength(1);
  });

  it('tirar uma peça leva junto as setas dela', () => {
    /* Deixá-las faria as verificações responderem sobre uma ligação que não
       está na tela — é a seleção não podada do Explorador, com outra roupa. */
    const sem = tirarPeca(SOLUCAO, 'video');
    expect(sem.setas.some(s => s.de === 'video' || s.para === 'video')).toBe(false);
    expect(chegouNaSaida(sem)).toBe(false);
  });

  it('religar duas peças reescreve o rótulo em vez de empilhar outra seta', () => {
    /* Duas setas no mesmo lugar desenham uma só, e quem corrigisse o rótulo
       veria o antigo continuar valendo, sem nada explicando por quê. */
    const d = ligar(SOLUCAO, 'teclado', 'cpu', '00110011');
    expect(d.setas.filter(s => s.de === 'teclado' && s.para === 'cpu')).toHaveLength(1);
    expect(d.setas.find(s => s.de === 'teclado')?.rotulo).toBe('00110011');
  });

  it('seta para peça que não está no diagrama não entra', () => {
    const d = ligar(acrescentarPeca(DIAGRAMA_INICIAL, 'cpu'), 'cpu', 'monitor', '1111');
    expect(d.setas).toHaveLength(0);
  });

  it('a ida e volta entre CPU e RAM não trava o percurso', () => {
    /* Ligar a CPU à RAM e a RAM de volta à CPU é uma ligação **certa**, e num
       percurso ingênuo seria um ciclo infinito com a aba travada. */
    const d = ligar(SOLUCAO, 'ram', 'cpu', '01000001');
    expect(caminhoDosBits(d)).toEqual(['teclado', 'cpu', 'video', 'monitor']);
    expect(chegouNaSaida(d)).toBe(true);
  });

  it('o desvio para a RAM não termina o percurso antes da saída', () => {
    /* Sem a escolha do caminho em `percorrer`, os bits entrariam na RAM e
       parariam ali — num diagrama que está inteiramente certo. */
    const semVideo = montar(d => {
      let x = d;
      for (const id of ['teclado', 'cpu', 'ram', 'monitor']) x = acrescentarPeca(x, id);
      x = ligar(x, 'teclado', 'cpu', '01000001');
      x = ligar(x, 'cpu', 'ram', '01000001');
      x = ligar(x, 'cpu', 'monitor', '11111010');
      return x;
    });
    expect(chegouNaSaida(semVideo)).toBe(true);
    expect(tudoFeito(semVideo)).toBe(true);
  });
});

describe('as peças são as que a lição de teoria nomeia', () => {
  it('há mais de um periférico de entrada e mais de um de saída', () => {
    /* O requisito diz "teclado, mouse ou scanner" e "monitor, impressora ou
       caixa de som". Oferecer um de cada faria a escolha desaparecer, e o
       diagrama passaria a ser o único diagrama possível. */
    expect(PECAS.filter(p => p.papel === 'entrada').length).toBeGreaterThanOrEqual(3);
    expect(PECAS.filter(p => p.papel === 'saida').length).toBeGreaterThanOrEqual(3);
  });

  it('a placa de vídeo não é periférico de saída', () => {
    /* Classificá-la como saída deixaria o diagrama terminar nela, que é onde a
       informação ainda não chegou à pessoa. */
    expect(PECAS.find(p => p.id === 'video')?.papel).toBe('intermediario');
  });

  it('toda peça diz o que faz', () => {
    for (const p of PECAS) expect(p.oQueFaz.length, `${p.id}`).toBeGreaterThan(20);
  });
});
