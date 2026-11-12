/* Planeta em foco — interações do site.
   Cada bloco só roda se os elementos dele existirem na página. */
(function () {
  "use strict";

  var reduzMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function guardar(chave, valor) {
    try { localStorage.setItem(chave, valor); } catch (e) { /* armazenamento indisponível */ }
  }
  function ler(chave) {
    try { return localStorage.getItem(chave); } catch (e) { return null; }
  }

  /* ---------- Barra de progresso + botão de topo ---------- */
  function iniciarRolagem() {
    var barra = document.createElement("div");
    barra.className = "progresso-leitura";
    barra.setAttribute("aria-hidden", "true");
    document.body.appendChild(barra);

    var topo = document.createElement("button");
    topo.type = "button";
    topo.className = "botao-topo";
    topo.setAttribute("aria-label", "Voltar ao topo da página");
    topo.textContent = "↑";
    document.body.appendChild(topo);

    topo.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduzMovimento ? "auto" : "smooth" });
    });

    var agendado = false;
    function atualizar() {
      agendado = false;
      var total = document.documentElement.scrollHeight - window.innerHeight;
      var progresso = total > 0 ? window.scrollY / total : 0;
      barra.style.transform = "scaleX(" + Math.min(Math.max(progresso, 0), 1) + ")";
      topo.classList.toggle("visivel", window.scrollY > 600);
    }
    window.addEventListener("scroll", function () {
      if (!agendado) { agendado = true; requestAnimationFrame(atualizar); }
    }, { passive: true });
    window.addEventListener("resize", atualizar);
    atualizar();
  }

  /* ---------- Menu: página atual, fechar ao clicar fora ou com Esc ---------- */
  function iniciarMenu() {
    var menu = document.querySelector(".menu");
    if (!menu) return;

    var atual = location.pathname.split("/").pop() || "index.html";
    menu.querySelectorAll(".opcoes-menu a").forEach(function (link) {
      var destino = link.getAttribute("href").split("/").pop();
      if (destino === atual) link.setAttribute("aria-current", "page");
    });

    document.addEventListener("click", function (e) {
      if (menu.open && !menu.contains(e.target)) menu.open = false;
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menu.open) {
        menu.open = false;
        var botao = menu.querySelector("summary");
        if (botao) botao.focus();
      }
    });
  }

  /* ---------- Planeta: gira, inclina com o mouse e pulsa ao clicar ---------- */
  function iniciarPlaneta() {
    var planeta = document.querySelector(".capa .imagem-planeta");
    if (!planeta) return;

    planeta.setAttribute("tabindex", "0");
    planeta.setAttribute("role", "button");
    planeta.setAttribute("aria-label", "Planeta Terra visto do espaço. Ative para fazer o planeta pulsar.");

    if (!reduzMovimento) planeta.classList.add("planeta-vivo");

    var capa = planeta.closest(".capa");
    if (capa && !reduzMovimento && window.matchMedia("(hover: hover)").matches) {
      capa.addEventListener("pointermove", function (e) {
        var r = planeta.getBoundingClientRect();
        var dx = (e.clientX - (r.left + r.width / 2)) / window.innerWidth;
        var dy = (e.clientY - (r.top + r.height / 2)) / window.innerHeight;
        planeta.style.setProperty("--inclina-y", (dx * 26).toFixed(1) + "deg");
        planeta.style.setProperty("--inclina-x", (-dy * 26).toFixed(1) + "deg");
      });
      capa.addEventListener("pointerleave", function () {
        planeta.style.setProperty("--inclina-x", "0deg");
        planeta.style.setProperty("--inclina-y", "0deg");
      });
    }

    function pulsar() {
      if (reduzMovimento) return;
      planeta.classList.remove("planeta-pulso");
      void planeta.offsetWidth;
      planeta.classList.add("planeta-pulso");
    }
    planeta.addEventListener("click", pulsar);
    planeta.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pulsar(); }
    });
    planeta.addEventListener("animationend", function (e) {
      if (e.animationName === "pulso-planeta") planeta.classList.remove("planeta-pulso");
    });
  }

  /* ---------- Lightbox para as imagens de projetos e galeria ---------- */
  function iniciarLightbox() {
    var imagens = Array.prototype.slice.call(document.querySelectorAll("main .imagem-projeto-um"));
    if (!imagens.length) return;

    var caixa = document.createElement("div");
    caixa.className = "lightbox";
    caixa.setAttribute("role", "dialog");
    caixa.setAttribute("aria-modal", "true");
    caixa.setAttribute("aria-label", "Imagem ampliada");
    caixa.innerHTML =
      '<button type="button" class="lightbox-fechar" aria-label="Fechar imagem">✕</button>' +
      '<button type="button" class="lightbox-anterior" aria-label="Imagem anterior">←</button>' +
      '<img alt="" />' +
      '<p class="lightbox-legenda"><b></b><span></span></p>' +
      '<button type="button" class="lightbox-proxima" aria-label="Próxima imagem">→</button>';
    document.body.appendChild(caixa);

    var foto = caixa.querySelector("img");
    var contador = caixa.querySelector(".lightbox-legenda b");
    var legenda = caixa.querySelector(".lightbox-legenda span");
    var botaoFechar = caixa.querySelector(".lightbox-fechar");
    var indice = 0;
    var origem = null;
    caixa.dataset.unica = imagens.length < 2 ? "true" : "false";

    function mostrar(i, animar) {
      indice = (i + imagens.length) % imagens.length;
      var img = imagens[indice];
      var trocar = function () {
        foto.src = img.currentSrc || img.src;
        foto.alt = img.alt;
        legenda.textContent = img.alt;
        contador.textContent = (indice + 1) + " de " + imagens.length;
        foto.classList.remove("trocando");
      };
      if (animar && !reduzMovimento) {
        foto.classList.add("trocando");
        setTimeout(trocar, 140);
      } else {
        trocar();
      }
    }

    function abrir(i, gatilho) {
      origem = gatilho;
      mostrar(i, false);
      caixa.classList.add("aberta");
      document.body.style.overflow = "hidden";
      botaoFechar.focus();
    }
    function fechar() {
      caixa.classList.remove("aberta");
      document.body.style.overflow = "";
      if (origem) origem.focus();
    }

    imagens.forEach(function (img, i) {
      img.classList.add("imagem-ampliavel");
      img.setAttribute("tabindex", "0");
      img.setAttribute("role", "button");
      img.addEventListener("click", function () { abrir(i, img); });
      img.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); abrir(i, img); }
      });
    });

    caixa.querySelector(".lightbox-anterior").addEventListener("click", function () { mostrar(indice - 1, true); });
    caixa.querySelector(".lightbox-proxima").addEventListener("click", function () { mostrar(indice + 1, true); });
    botaoFechar.addEventListener("click", fechar);
    caixa.addEventListener("click", function (e) {
      if (e.target === caixa) fechar();
    });

    document.addEventListener("keydown", function (e) {
      if (!caixa.classList.contains("aberta")) return;
      if (e.key === "Escape") fechar();
      else if (e.key === "ArrowLeft") mostrar(indice - 1, true);
      else if (e.key === "ArrowRight") mostrar(indice + 1, true);
      else if (e.key === "Tab") {
        var focaveis = Array.prototype.filter.call(
          caixa.querySelectorAll("button"),
          function (b) { return b.offsetParent !== null; }
        );
        var primeiro = focaveis[0];
        var ultimo = focaveis[focaveis.length - 1];
        if (e.shiftKey && document.activeElement === primeiro) { e.preventDefault(); ultimo.focus(); }
        else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primeiro.focus(); }
      }
    });

    var inicioToque = null;
    caixa.addEventListener("touchstart", function (e) { inicioToque = e.touches[0].clientX; }, { passive: true });
    caixa.addEventListener("touchend", function (e) {
      if (inicioToque === null) return;
      var delta = e.changedTouches[0].clientX - inicioToque;
      inicioToque = null;
      if (Math.abs(delta) > 50) mostrar(indice + (delta < 0 ? 1 : -1), true);
    });
  }

  /* ---------- Blog: busca e filtro por categoria ---------- */
  function iniciarFiltroBlog() {
    var grade = document.querySelector(".grade-noticias");
    if (!grade) return;
    var cards = Array.prototype.slice.call(grade.querySelectorAll(".card-noticia"));
    if (cards.length < 2) return;

    var categorias = [];
    cards.forEach(function (card) {
      var tag = card.querySelector(".tag-noticia");
      card.dataset.categoria = tag ? tag.textContent.trim() : "";
      card.dataset.busca = card.textContent.toLowerCase();
      if (tag && categorias.indexOf(card.dataset.categoria) === -1) categorias.push(card.dataset.categoria);
    });

    var filtro = document.createElement("div");
    filtro.className = "filtro-noticias";
    filtro.setAttribute("role", "search");
    filtro.innerHTML =
      '<label class="visualmente-oculto" for="busca-noticias" style="position:absolute;left:-9999px">Buscar notícias</label>' +
      '<input id="busca-noticias" class="filtro-busca" type="search" placeholder="Buscar por tema, local ou palavra" autocomplete="off" />' +
      '<div class="filtro-chips" role="group" aria-label="Filtrar por categoria"></div>' +
      '<p class="filtro-resultado" aria-live="polite"></p>';
    grade.parentNode.insertBefore(filtro, grade);

    var campo = filtro.querySelector("input");
    var chips = filtro.querySelector(".filtro-chips");
    var resultado = filtro.querySelector(".filtro-resultado");
    var ativa = "";

    function criarChip(texto, valor) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "filtro-chip";
      b.textContent = texto;
      b.dataset.valor = valor;
      b.setAttribute("aria-pressed", valor === ativa ? "true" : "false");
      chips.appendChild(b);
    }
    criarChip("Todas", "");
    categorias.forEach(function (c) { criarChip(c, c); });

    var vazio = document.createElement("p");
    vazio.className = "filtro-vazio";
    vazio.hidden = true;
    vazio.innerHTML = 'Nenhuma notícia combina com essa busca. <button type="button">Limpar filtros</button>';
    grade.appendChild(vazio);

    function limpar() {
      campo.value = "";
      ativa = "";
      aplicar();
      campo.focus();
    }
    vazio.querySelector("button").addEventListener("click", limpar);

    function aplicar() {
      var termo = campo.value.trim().toLowerCase();
      var visiveis = 0;
      cards.forEach(function (card) {
        var passa =
          (!ativa || card.dataset.categoria === ativa) &&
          (!termo || card.dataset.busca.indexOf(termo) !== -1);
        var estavaOculto = card.hidden;
        card.hidden = !passa;
        if (passa) {
          visiveis++;
          if (estavaOculto && !reduzMovimento) {
            card.classList.remove("card-entrando");
            void card.offsetWidth;
            card.classList.add("card-entrando");
          }
        }
      });
      chips.querySelectorAll(".filtro-chip").forEach(function (b) {
        b.setAttribute("aria-pressed", b.dataset.valor === ativa ? "true" : "false");
      });
      vazio.hidden = visiveis !== 0;
      resultado.textContent = visiveis === cards.length
        ? "Mostrando todas as " + cards.length + " notícias."
        : "Mostrando " + visiveis + " de " + cards.length + " notícias.";
    }

    chips.addEventListener("click", function (e) {
      var b = e.target.closest(".filtro-chip");
      if (!b) return;
      ativa = b.dataset.valor;
      aplicar();
    });
    campo.addEventListener("input", aplicar);
    aplicar();
  }

  /* ---------- Início: pequenas escolhas e muda que cresce ---------- */
  function iniciarEscolhas() {
    var secao = document.querySelector(".escolhas");
    if (!secao) return;

    var caixas = Array.prototype.slice.call(secao.querySelectorAll(".escolhas-lista input"));
    var muda = secao.querySelector(".escolhas-muda svg");
    var legenda = secao.querySelector(".escolhas-muda figcaption");
    var limpar = secao.querySelector(".escolhas-limpar");
    var caule = muda.querySelector(".muda-caule");
    var folhas = Array.prototype.slice.call(muda.querySelectorAll(".muda-folha"));
    var fruto = muda.querySelector(".muda-fruto");

    var mensagens = [
      "A semente está pronta. Marque a primeira escolha.",
      "Brotou. Toda mudança começa pequena.",
      "Duas escolhas e já há folhas novas.",
      "A muda ganhou altura. Falta pouco.",
      "Quase uma árvore. Mais uma escolha.",
      "Cinco escolhas: a árvore deu fruto."
    ];

    var salvo = ler("pef-escolhas");
    if (salvo) {
      salvo.split(",").forEach(function (v, i) { if (caixas[i]) caixas[i].checked = v === "1"; });
    }

    function atualizar() {
      var n = caixas.filter(function (c) { return c.checked; }).length;
      caule.style.setProperty("--altura", String(n / caixas.length));
      folhas.forEach(function (f) {
        f.classList.toggle("ativa", Number(f.dataset.passo) <= n);
      });
      fruto.classList.toggle("ativa", n === caixas.length);
      legenda.textContent = mensagens[n];
      limpar.disabled = n === 0;
      guardar("pef-escolhas", caixas.map(function (c) { return c.checked ? "1" : "0"; }).join(","));
    }

    caixas.forEach(function (c) { c.addEventListener("change", atualizar); });
    limpar.addEventListener("click", function () {
      caixas.forEach(function (c) { c.checked = false; });
      atualizar();
      caixas[0].focus();
    });
    atualizar();
  }

  /* ---------- Voluntariado: máscara de telefone e contador ---------- */
  function iniciarFormulario() {
    var telefone = document.getElementById("telefone-voluntario");
    var texto = document.getElementById("motivacao-voluntario");

    if (telefone) {
      var mascara = function () {
        var d = telefone.value.replace(/\D/g, "").slice(0, 11);
        var m = d;
        if (d.length > 10) m = "(" + d.slice(0, 2) + ") " + d.slice(2, 7) + "-" + d.slice(7);
        else if (d.length > 6) m = "(" + d.slice(0, 2) + ") " + d.slice(2, 6) + "-" + d.slice(6);
        else if (d.length > 2) m = "(" + d.slice(0, 2) + ") " + d.slice(2);
        else if (d.length > 0) m = "(" + d;
        telefone.value = m;
      };
      telefone.setAttribute("inputmode", "tel");
      telefone.setAttribute("placeholder", "(11) 91234-5678");
      telefone.addEventListener("input", mascara, { capture: true });
      mascara();
    }

    if (texto) {
      var limite = 600;
      texto.setAttribute("maxlength", String(limite));
      var contador = document.createElement("span");
      contador.className = "contador-campo";
      contador.setAttribute("aria-live", "polite");
      texto.parentNode.appendChild(contador);
      var contar = function () {
        var n = texto.value.length;
        contador.textContent = n + " de " + limite + " caracteres";
        contador.classList.toggle("limite", n >= limite - 40);
      };
      texto.addEventListener("input", contar);
      contar();
    }
  }

  function iniciar() {
    iniciarRolagem();
    iniciarMenu();
    iniciarPlaneta();
    iniciarLightbox();
    iniciarFiltroBlog();
    iniciarEscolhas();
    iniciarFormulario();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar);
  else iniciar();
})();
