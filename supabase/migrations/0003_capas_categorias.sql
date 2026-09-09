-- Capas das categorias.
--
-- As nove capas são desenho nosso, versionadas em `public/categorias/`. Como
-- são servidas pelo próprio site, o caminho relativo basta: muda de domínio
-- sem quebrar.
--
-- Rode no SQL editor do Supabase. É idempotente — pode rodar de novo depois de
-- trocar um desenho.

update categories set image_url = '/categorias/criancas.svg'         where id = 47;
update categories set image_url = '/categorias/feiras-organicas.svg' where id = 22;
update categories set image_url = '/categorias/artesanato.svg'       where id = 45;
update categories set image_url = '/categorias/eventos-de-rua.svg'   where id = 40;
update categories set image_url = '/categorias/musica.svg'           where id = 41;
update categories set image_url = '/categorias/gastronomia.svg'      where id = 42;
update categories set image_url = '/categorias/pontos-turisticos.svg' where id = 46;
update categories set image_url = '/categorias/parques-e-pracas.svg' where id = 43;
update categories set image_url = '/categorias/arte-e-cultura.svg'   where id = 44;
