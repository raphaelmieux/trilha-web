-- Dois Mestrados da plataforma mudam de nome: o da família Artes e
-- Habilidades Manuais passa a se chamar Fina Arte, e o da família Base passa
-- a se chamar Básico.
--
-- Só o nome muda. O código continua sendo o da família — é por ele que a
-- insígnia é concedida, que a arte é achada em public/assets/mestrados/ e que
-- quem já a tem continua com ela —, e a descrição continua dizendo de que
-- família de trilhas ou veredas o Mestrado é.
--
-- Idempotente: o mesmo INSERT ... ON CONFLICT da migration que os semeou.
INSERT INTO badges (code, name, description, icon, tier, sort_order) VALUES
  ('mestrado_artes_e_habilidades_manuais', 'Mestrado Fina Arte',
   'Mestrado da plataforma: concluiu todas as trilhas da família Artes e Habilidades Manuais.',
   'award', 'companheiro', 1604),
  ('mestrado_base', 'Mestrado Básico',
   'Mestrado da plataforma: concluiu todas as veredas da família Base.',
   'award', 'companheiro', 1605)
ON CONFLICT (code) DO UPDATE
  SET name = EXCLUDED.name,
      description = EXCLUDED.description,
      icon = EXCLUDED.icon,
      tier = EXCLUDED.tier,
      sort_order = EXCLUDED.sort_order;
