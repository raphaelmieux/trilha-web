/*
  A vereda também emite Token.Web().

  Vereda é bônus e não vira `Specialty` — isso continua valendo, e é decisão,
  não preguiça: uma especialidade precisa de linha em `specialties`,
  `modules`, `lessons` e `requirements` para gravar progresso, e a partir daí
  entra no percentual, na família do painel e no XP, que é o contrário de
  bônus. O progresso da vereda sai de eventos de atividade.

  Só que o certificado não é progresso: é o documento que o desbravador leva
  ao clube. E o clube não tem por que aprender dois documentos — se a vereda
  rende um, ele se verifica em /verificar, tem PDF, tem código e vale como o
  da trilha.

  O que impedia era uma coluna: `specialty_id NOT NULL REFERENCES specialties`.
  A vereda não tem linha lá, por decisão. Nenhuma tela lê essa coluna — nem
  `verify_certificate`, nem `admin_certificate_counts`, nem `useCertifications`,
  que nomeiam as colunas que usam —, então soltá-la não muda nada do que se vê;
  o que ela ainda faz é amarrar o certificado de trilha à trilha dele, e isso
  segue valendo para quem a preenche.

  `curriculum_code` não tem CHECK: é `text` livre, e recebe o código da vereda
  como recebia o da trilha. `level` já aceita basico/intermediario/avancado — a
  vereda grava 'basico', que é o lado que reivindica menos, e a tela pública
  não imprime nível nenhum para ela: escreve que é vereda, porque vereda tem
  tamanho, não grau.

  Idempotente: `drop not null` numa coluna que já aceita nulo não faz nada.
*/

ALTER TABLE certifications ALTER COLUMN specialty_id DROP NOT NULL;

/*
  Índice por código de currículo.

  `issue-certification` pergunta "esta pessoa já tem certificado ativo DESTE
  percurso?" antes de emitir, e é a pergunta que impede o segundo. Com trilha e
  vereda no mesmo lugar a tabela passa a crescer mais depressa, e a busca é
  sempre por (user_id, curriculum_code).
*/
CREATE INDEX IF NOT EXISTS idx_cert_user_curriculum
  ON certifications(user_id, curriculum_code);
