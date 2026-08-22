/*
  Renomeia as lições da AP034 e da AP035 na voz da AP041.

  Os módulos já tinham sido renomeados; as lições ficaram para trás, e os
  laboratórios eram os mais destoantes — "CodeLab — Editor HTML",
  "ImageLab — Otimização de Imagens", "WebLab - Navegação e Pesquisa". O nome do
  laboratório é detalhe de implementação: diz ao programador qual componente
  abre, e ao desbravador não diz nada sobre o que ele vai fazer ali.

  A regra é a da AP041: teoria em frase simples, laboratório em gerúndio e do
  ponto de vista de quem faz.

  O aplicativo lê os títulos do currículo em TypeScript; estas linhas existem
  para que `lessons` não fique contando outra história a quem consulta o banco.
  Re-executável: são UPDATEs por código.
*/

DO $$
BEGIN
  UPDATE lessons SET title = 'Navegador, streaming, busca e antivírus' WHERE code = 'AP034.2-L2';
  UPDATE lessons SET title = 'A linha do tempo da Internet' WHERE code = 'AP034.3-L1';
  UPDATE lessons SET title = 'Ameaças e proteção' WHERE code = 'AP034.4-L1';
  UPDATE lessons SET title = 'Filtros de conteúdo' WHERE code = 'AP034.5-L0';
  UPDATE lessons SET title = 'Website, e-mail e vírus' WHERE code = 'AP034.1-L3';
  UPDATE lessons SET title = 'Escrevendo a história da Internet' WHERE code = 'AP034.3-L2';
  UPDATE lessons SET title = 'Reconhecendo ameaças e escolhendo a proteção' WHERE code = 'AP034.4-L2';
  UPDATE lessons SET title = 'Montando o seu compromisso digital' WHERE code = 'AP034.5-L1';
  UPDATE lessons SET title = 'Navegando e pesquisando com cuidado' WHERE code = 'AP034.6-L1';
  UPDATE lessons SET title = 'Escrevendo e-mails e reconhecendo golpes' WHERE code = 'AP034.7-L1';
  UPDATE lessons SET title = 'Aplicando o filtro de Filipenses 4:8' WHERE code = 'AP034.8-L1';
  UPDATE lessons SET title = 'HTTP, HTTPS e hyperlinks' WHERE code = 'AP035.1-L1';
  UPDATE lessons SET title = 'HTML, PHP, cliente e servidor' WHERE code = 'AP035.1-L2';
  UPDATE lessons SET title = 'Navegador seguro e cores em hexadecimal' WHERE code = 'AP035.1-L3';
  UPDATE lessons SET title = 'A URL por dentro: as partes de um endereço' WHERE code = 'AP035.1-L4';
  UPDATE lessons SET title = 'Escolher o formato: GIF, PNG e JPEG' WHERE code = 'AP035.1-L5';
  UPDATE lessons SET title = 'O que a IA é, e como ela responde' WHERE code = 'AP035.6-L1';
  UPDATE lessons SET title = 'Conferindo a especialidade de Internet' WHERE code = 'AP035.0-L1';
  UPDATE lessons SET title = 'Escrevendo a sua primeira página' WHERE code = 'AP035.2-L1';
  UPDATE lessons SET title = 'Organizando dados numa tabela' WHERE code = 'AP035.3-L1';
  UPDATE lessons SET title = 'Deixando as imagens leves' WHERE code = 'AP035.4-L1';
  UPDATE lessons SET title = 'Montando um site de quatro páginas' WHERE code = 'AP035.5-L1';
  UPDATE lessons SET title = 'Pedindo à IA, e conferindo o que voltou' WHERE code = 'AP035.7-L1';
END $$;
