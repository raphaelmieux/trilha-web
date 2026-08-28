# A arte das veredas

Um arquivo por vereda, com o nome do código dela: `VD01.svg`, `VD02.svg`.

O cartão da página inicial desenha a arte em **48 × 48**, então o SVG precisa
de `viewBox` e de traço que aguente esse tamanho — as artes das trilhas
completas, em `public/assets/specialties/`, usam `viewBox="0 0 170.08 133.71"`
e servem de referência.

Enquanto o arquivo não existe, o cartão mostra o ícone de livro. Um código sem
arte não deixa buraco na tela, e não quebra nada.
