"""Lê o texto de um requisito oficial, em `public/curriculum files/`.

Uso: python3 scripts/ler-requisitos.py "public/curriculum files/CC-ES011 Apresentações.pdf"

── Por que existe ───────────────────────────────────────────────────────────
Toda trilha e toda vereda sai dos PDFs daquela pasta, e nada além deles: os
módulos, as lições e os laboratórios se constroem sobre aquela lista. Ler um
requisito é, então, o primeiro gesto de todo trabalho aqui — e ele precisava
de ferramenta que esta máquina não tem.

── Por que não uma dependência ──────────────────────────────────────────────
Não há `pdftotext` instalado, e trazer uma biblioteca de PDF para o
`package.json` seria dependência nova no pacote servido ao visitante por uma
ferramenta que só o desenvolvimento usa — além de passar pela conferência de
compatibilidade com a AGPL que toda dependência nova passa. Isto é Python
puro, da biblioteca padrão, e não entra em build nenhuma.

── Por que não extrair o texto cru do fluxo ─────────────────────────────────
Estes PDFs embutem as fontes em **subconjunto**: o arquivo carrega só os
glifos que o documento usa, e o código de cada caractere não é o do Unicode —
é a posição dele dentro daquele subconjunto. Lido cru, o requisito sai como
uma fileira de símbolos sem relação com as letras. Quem traduz é o `ToUnicode`
de cada fonte, que o próprio PDF carrega, e é o que este decodificador lê.

── A armadilha que custou a primeira versão ─────────────────────────────────
O `bfrange` tem duas formas, e a segunda — a de vetor, com um destino por
código — é onde moram o espaço e as vogais acentuadas destes documentos. Lendo
só a forma de intervalo, o texto sai sem `a` e sem `o`, e um requisito sem
vogal se lê como requisito truncado em vez de requisito mal decodificado.
"""
import re, sys, zlib, pathlib

def fluxo_de(corpo: bytes):
    m = re.search(rb'stream\r?\n(.*?)endstream', corpo, re.S)
    if not m:
        return None
    try:
        return zlib.decompress(m.group(1))
    except Exception:
        return m.group(1)

def destino(h: str) -> str:
    try:
        return bytes.fromhex(h).decode('utf-16-be')
    except Exception:
        return ''

def cmap_de(dados: bytes) -> dict[int, str]:
    t = dados.decode('latin-1')
    mapa: dict[int, str] = {}
    for bloco in re.findall(r'beginbfchar(.*?)endbfchar', t, re.S):
        for a, b in re.findall(r'<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>', bloco):
            mapa[int(a, 16)] = destino(b)
    for bloco in re.findall(r'beginbfrange(.*?)endbfrange', t, re.S):
        # A forma em array dá um destino por código, e é onde moram o espaço e
        # as vogais acentuadas deste PDF. Sem ela o texto sai sem 'a' e sem 'o'.
        for a, b, arr in re.findall(
                r'<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>\s*\[(.*?)\]', bloco, re.S):
            us = re.findall(r'<([0-9A-Fa-f]+)>', arr)
            for i, u in enumerate(us):
                mapa[int(a, 16) + i] = destino(u)
        for a, b, c in re.findall(
                r'<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>', bloco):
            ini, fim, d = int(a, 16), int(b, 16), int(c, 16)
            for i in range(ini, fim + 1):
                mapa.setdefault(i, chr(d + (i - ini)))
    return mapa

def ler(caminho: str) -> str:
    raw = pathlib.Path(caminho).read_bytes()
    objetos = {int(m.group(1)): m.group(2)
               for m in re.finditer(rb'(\d+)\s+0\s+obj\b(.*?)endobj', raw, re.S)}

    tounicode: dict[int, dict[int, str]] = {}
    geral: dict[int, str] = {}
    for num, corpo in objetos.items():
        m = re.search(rb'/ToUnicode\s+(\d+)\s+0\s+R', corpo)
        if not m:
            continue
        alvo = objetos.get(int(m.group(1)))
        dados = fluxo_de(alvo) if alvo else None
        if not dados:
            continue
        mp = cmap_de(dados)
        tounicode[num] = mp
        for k, v in mp.items():
            geral.setdefault(k, v)

    porNome: dict[str, dict[int, str]] = {}
    for corpo in objetos.values():
        for nome, ref in re.findall(rb'/(F\d+)\s+(\d+)\s+0\s+R', corpo):
            mp = tounicode.get(int(ref))
            n = nome.decode()
            if mp and n not in porNome:
                porNome[n] = mp

    linhas: list[str] = []
    for corpo in objetos.values():
        dados = fluxo_de(corpo)
        if not dados or b'BT' not in dados or (b'Tj' not in dados and b'TJ' not in dados):
            continue
        t = dados.decode('latin-1')
        fora: list[str] = []
        atual: dict[int, str] = {}
        for m in re.finditer(r'/(F\d+)\s+[\d.]+\s+Tf|\[(.*?)\]\s*TJ|\((.*?)\)\s*Tj', t, re.S):
            if m.group(1):
                atual = porNome.get(m.group(1), {})
                continue
            if m.group(3) is not None:
                fora.append(m.group(3).replace('\\(', '(').replace('\\)', ')'))
                continue
            for h in re.findall(r'<([0-9A-Fa-f]+)>', m.group(2) or ''):
                for i in range(0, len(h) - 1, 4):
                    c = int(h[i:i + 4], 16)
                    fora.append(atual.get(c) or geral.get(c) or '�')
        linhas.append(''.join(fora))
    return '\n'.join(linhas)

PERDIDO = '\ufffd'

if __name__ == '__main__':
    texto = ler(sys.argv[1])
    print(texto)
    """
    E uma decodificação torta reclama, em vez de sair calada.

    Esta é a trava que o script não tem como ter em `vitest`: nenhum caractere
    perdido é o estado de hoje — os sessenta e quatro documentos da pasta saem
    inteiros, zero substituições em todos eles. Então um único `\ufffd` quer
    dizer que alguma coisa mudou, e o estrago de não dizer isso é o pior que
    esta casa conhece: um requisito lido pela metade **se parece** com um
    requisito curto, e a lição sai escrita sobre o que o documento não pede.
    """
    perdidos = texto.count(PERDIDO)
    if perdidos:
        print(
            f'\n[ler-requisitos] {perdidos} caractere(s) sem tradução no '
            'ToUnicode — o texto acima está incompleto e não serve para '
            'escrever lição nenhuma.',
            file=sys.stderr,
        )
        sys.exit(1)
