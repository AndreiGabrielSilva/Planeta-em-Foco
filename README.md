# Planeta em Foco

Site informativo sobre iniciativas ambientais, com páginas de projetos,
campanhas, voluntariado, galeria e conteúdos de conscientização.

## Como abrir

O projeto usa HTML, CSS e JavaScript sem processo de build ou instalação de
dependências. Abra `index.html` diretamente no navegador. Uma conexão com a
internet permite carregar as fontes e algumas imagens externas.

## Páginas

- `index.html`: página inicial e temas ambientais.
- `html/sobre-nos.html`: apresentação da iniciativa.
- `html/projetos.html`: projetos Água para Todos e Comunidade Limpa.
- `html/feitos.html`: objetivos e informações disponíveis sobre as iniciativas.
- `html/blog.html`: notícias e conteúdos ambientais.
- `html/comoajudar.html`: formas de apoiar as iniciativas.
- `html/voluntario.html`: ficha de interesse em voluntariado.
- `html/campanhas.html`: informações sobre as frentes de mobilização.
- `html/galeria.html`: imagens relacionadas às iniciativas.
- `html/contatos.html`: colaboradores e informações de contato disponíveis.
- `html/acessibilidade.html`: preferências de leitura e guia de navegação por teclado.
- `html/orcamento_hospedagem.html`: comparação de hospedagem e domínio.

## Estrutura

- `css/style.css`: estilos compartilhados pelas páginas.
- `css/acessibilidade.css` e `js/acessibilidade.js`: tamanho do texto, tema, daltonismo,
  alto contraste, inversão de cores e leitura em voz alta (preferências salvas no navegador).
- `css/idioma.css` e `js/idioma.js`: seletor de idioma presente em todas as páginas
  (tradução automática pelo Google Translate, requer internet).
- `html/`: páginas internas do site.
- `img/`: imagens locais utilizadas nos projetos e na galeria.
- `colaboradores.txt`: relação de integrantes do trabalho.

## Observações

- A ficha de voluntariado valida os campos no navegador, mas ainda não envia nem
	armazena respostas. Para receber inscrições, é necessário conectá-la a um
	serviço ou backend.
- Os valores de hospedagem e domínio são referências, podem mudar e devem ser
	confirmados nos sites dos provedores antes de uma contratação. A página do
	comparativo informa a data da consulta e as respectivas fontes.
- O site inclui recursos básicos de acessibilidade, como estrutura semântica,
	rótulos de formulário e navegação por teclado, mas ainda não passou por uma
	auditoria completa de acessibilidade.

## Interações

`css/interacoes.css` e `js/interacoes.js` reúnem as interações do site: barra de
progresso de leitura, botão de voltar ao topo, menu com página atual, planeta
interativo na capa, ampliação de imagens (projetos e galeria), busca e filtros no
blog, "pequenas escolhas" na página inicial e máscara/contador na ficha de
voluntariado, além de painéis que abrem e fecham em Campanhas, Como ajudar e
Feitos. Todas respeitam `prefers-reduced-motion` e mantêm o contraste e a
hierarquia de títulos da versão de acessibilidade.
