/*
  Os três níveis da classificação oficial dos Desbravadores.

  O banco aceitava dois valores, 'fundamental' e 'advanced', escritos quando a
  plataforma tinha as duas trilhas de Internet e a palavra "fundamental" parecia
  descrever a primeira. A classificação real é Básico, Intermediário e Avançado,
  e a família Computação usa os três: AP041 e AP042 básicas, AP043 e AP044
  intermediárias, AP045 avançada.

  A ordem importa. A restrição precisa aceitar os valores novos antes de as
  linhas serem convertidas — trocar primeiro os dados esbarraria no CHECK
  antigo, e trocar a restrição para só os novos valores esbarraria nos dados
  antigos. Por isso ela passa por um momento em que aceita os cinco.

  Certificados já emitidos são convertidos junto. O que muda para quem confere um
  Token.Web() é a palavra na linha "Nível": era "Fundamental", passa a ser
  "Básico". A especialidade continua sendo nomeada por `curriculum_code`, que é
  quem identifica a trilha.
*/

DO $$
BEGIN
  -- ── 1. A restrição aceita os antigos e os novos ao mesmo tempo ────────
  ALTER TABLE specialties DROP CONSTRAINT IF EXISTS specialties_level_check;
  ALTER TABLE specialties ADD CONSTRAINT specialties_level_check
    CHECK (level IN ('fundamental','advanced','basico','intermediario','avancado'));

  ALTER TABLE certifications DROP CONSTRAINT IF EXISTS certifications_level_check;
  ALTER TABLE certifications ADD CONSTRAINT certifications_level_check
    CHECK (level IN ('fundamental','advanced','basico','intermediario','avancado'));

  -- ── 2. Os dados passam para os nomes oficiais ─────────────────────────
  UPDATE specialties   SET level = 'basico'   WHERE level = 'fundamental';
  UPDATE specialties   SET level = 'avancado' WHERE level = 'advanced';
  UPDATE certifications SET level = 'basico'   WHERE level = 'fundamental';
  UPDATE certifications SET level = 'avancado' WHERE level = 'advanced';

  -- ── 3. A restrição fecha só nos três oficiais ─────────────────────────
  ALTER TABLE specialties DROP CONSTRAINT specialties_level_check;
  ALTER TABLE specialties ADD CONSTRAINT specialties_level_check
    CHECK (level IN ('basico','intermediario','avancado'));

  ALTER TABLE certifications DROP CONSTRAINT certifications_level_check;
  ALTER TABLE certifications ADD CONSTRAINT certifications_level_check
    CHECK (level IN ('basico','intermediario','avancado'));
END $$;

/*
  O módulo de pré-requisito da AP035 sai do banco.

  Ele existia para conferir a certificação de Internet e pedir um clique — ou
  seja, para pedir ao desbravador que provasse o que já estava registrado na
  conta dele. Quem controla o acesso é a plataforma: enquanto a trilha anterior
  não estiver concluída, a avançada nem abre.

  O requisito AP035-1.1 continua existindo, porque é oficial; o que muda é que
  ele passa a ser marcado quando o portão abre, e não por uma lição.

  As tentativas de lição apagam junto, por cascata de lessons.
*/
DELETE FROM lessons
  WHERE code = 'AP035.0-L1';

DELETE FROM modules
  WHERE code = 'AP035.0'
    AND specialty_id = (SELECT id FROM specialties WHERE code = 'AP035');
