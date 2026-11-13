/* Planeta em foco — acessibilidade.
   Carregado no <head> de todas as páginas: aplica as preferências salvas
   antes da página aparecer; o painel e a leitura em voz alta iniciam depois. */
(function () {
  "use strict";

  var CHAVE = "planeta-em-foco-acessibilidade";
  var PASSOS = [80, 90, 100, 115, 130, 150, 175, 200];
  var PADRAO = {
    tamanho: 100,
    tema: "sistema",
    daltonismo: "original",
    contraste: false,
    inversao: false,
    voz: { ativa: false, uri: "", velocidade: 1 }
  };
  var html = document.documentElement;

  /* ---------- Armazenamento ---------- */
  function copiar(o) { return JSON.parse(JSON.stringify(o)); }

  function carregar() {
    var prefs = copiar(PADRAO);
    try {
      var salvo = JSON.parse(localStorage.getItem(CHAVE) || "null");
      if (salvo && typeof salvo === "object") {
        Object.keys(PADRAO).forEach(function (k) {
          if (k === "voz" && salvo.voz && typeof salvo.voz === "object") {
            prefs.voz.ativa = !!salvo.voz.ativa;
            prefs.voz.uri = String(salvo.voz.uri || "");
            var v = Number(salvo.voz.velocidade);
            if (v >= 0.5 && v <= 2) prefs.voz.velocidade = v;
          } else if (k !== "voz" && salvo[k] !== undefined) {
            prefs[k] = salvo[k];
          }
        });
      }
    } catch (e) { /* armazenamento indisponível ou inválido */ }
    if (PASSOS.indexOf(Number(prefs.tamanho)) < 0) prefs.tamanho = 100;
    prefs.tamanho = Number(prefs.tamanho);
    if (["sistema", "claro", "escuro"].indexOf(prefs.tema) < 0) prefs.tema = "sistema";
    if (["original", "protanopia", "deuteranopia", "tritanopia", "acromatopsia"]
      .indexOf(prefs.daltonismo) < 0) prefs.daltonismo = "original";
    return prefs;
  }

  var prefs = carregar();

  function salvar() {
    try { localStorage.setItem(CHAVE, JSON.stringify(prefs)); } catch (e) { /* ignora */ }
  }

  /* ---------- Aplicação visual ---------- */
  var midiaEscuro = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;

  function aplicar() {
    var escuro = prefs.tema === "escuro" ||
      (prefs.tema === "sistema" && midiaEscuro && midiaEscuro.matches);
    html.setAttribute("data-tema", escuro ? "escuro" : "claro");
    html.setAttribute("data-tema-escolhido", prefs.tema);
    html.setAttribute("data-daltonismo", prefs.daltonismo);
    html.setAttribute("data-contraste", prefs.contraste ? "alto" : "normal");
    html.setAttribute("data-inversao", prefs.inversao ? "sim" : "nao");
    html.style.setProperty("--escala-texto", String(prefs.tamanho / 100));

    var filtros = [];
    if (prefs.daltonismo === "acromatopsia") filtros.push("grayscale(1)");
    if (prefs.inversao) filtros.push("invert(1)");
    html.style.filter = filtros.length ? filtros.join(" ") : "";
  }

  aplicar();
  if (midiaEscuro) {
    var ouvinte = function () { if (prefs.tema === "sistema") aplicar(); };
    if (midiaEscuro.addEventListener) midiaEscuro.addEventListener("change", ouvinte);
    else if (midiaEscuro.addListener) midiaEscuro.addListener(ouvinte);
  }

  /* ---------- Leitura em voz alta ---------- */
  var sintese = "speechSynthesis" in window && "SpeechSynthesisUtterance" in window
    ? window.speechSynthesis : null;
  var vozes = [];
  var lendo = null;
  var temporizador = null;
  var ultimoTexto = "";

  var SELETOR_LEITURA = "h1,h2,h3,h4,h5,h6,p,li,a,button,label,legend,figcaption," +
    "summary,td,th,dt,dd,caption,img[alt],input,select,textarea,[role='option']";

  function atualizarVozes() {
    if (!sintese) return;
    vozes = sintese.getVoices() || [];
    var seletor = document.getElementById("a11y-voz");
    if (seletor) preencherVozes(seletor);
  }

  function idiomaDaPagina() {
    return (html.getAttribute("lang") || "pt-BR").toLowerCase();
  }

  function vozEscolhida() {
    var i;
    for (i = 0; i < vozes.length; i++) if (vozes[i].voiceURI === prefs.voz.uri) return vozes[i];
    var lang = idiomaDaPagina();
    for (i = 0; i < vozes.length; i++) if (vozes[i].lang.toLowerCase() === lang) return vozes[i];
    var base = lang.split("-")[0];
    for (i = 0; i < vozes.length; i++) if (vozes[i].lang.toLowerCase().indexOf(base) === 0) return vozes[i];
    return null;
  }

  function falar(texto, elemento) {
    if (!sintese || !texto) return;
    sintese.cancel();
    if (lendo) lendo.classList.remove("lendo-agora");
    var fala = new SpeechSynthesisUtterance(texto);
    var voz = vozEscolhida();
    if (voz) { fala.voice = voz; fala.lang = voz.lang; } else { fala.lang = idiomaDaPagina(); }
    fala.rate = prefs.voz.velocidade;
    if (elemento) {
      lendo = elemento;
      elemento.classList.add("lendo-agora");
      var fim = function () { elemento.classList.remove("lendo-agora"); };
      fala.onend = fim;
      fala.onerror = fim;
    }
    sintese.speak(fala);
  }

  function pararLeitura() {
    clearTimeout(temporizador);
    if (sintese) sintese.cancel();
    if (lendo) { lendo.classList.remove("lendo-agora"); lendo = null; }
    ultimoTexto = "";
  }

  function textoDe(el) {
    var texto = el.getAttribute("aria-label") || "";
    if (!texto && el.tagName === "IMG") texto = el.getAttribute("alt") || "";
    if (!texto && /^(INPUT|SELECT|TEXTAREA)$/.test(el.tagName)) {
      var rotulo = el.labels && el.labels[0] ? el.labels[0].innerText : (el.getAttribute("placeholder") || "");
      var valor = el.type === "checkbox" || el.type === "radio"
        ? (el.checked ? "marcado" : "desmarcado") : el.value;
      texto = (rotulo + ". " + (valor || "")).trim();
    }
    if (!texto) texto = el.innerText || el.textContent || "";
    return texto.replace(/\s+/g, " ").trim().slice(0, 500);
  }

  function alvoDeLeitura(origem) {
    if (!origem || !origem.closest) return null;
    if (origem.closest(".idioma-lista")) return null;
    return origem.closest(SELETOR_LEITURA);
  }

  function lerElemento(el) {
    if (!prefs.voz.ativa || !el) return;
    var texto = textoDe(el);
    if (!texto || texto === ultimoTexto) return;
    ultimoTexto = texto;
    falar(texto, el);
  }

  function iniciarLeitura() {
    document.addEventListener("mouseover", function (e) {
      if (!prefs.voz.ativa) return;
      var el = alvoDeLeitura(e.target);
      clearTimeout(temporizador);
      if (el) temporizador = setTimeout(function () { lerElemento(el); }, 350);
    });
    document.addEventListener("focusin", function (e) {
      if (!prefs.voz.ativa) return;
      lerElemento(alvoDeLeitura(e.target));
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") pararLeitura();
    });
    window.addEventListener("pagehide", pararLeitura);

    if (sintese) {
      atualizarVozes();
      if (sintese.addEventListener) sintese.addEventListener("voiceschanged", atualizarVozes);
      else sintese.onvoiceschanged = atualizarVozes;
    }
  }

  /* ---------- Painel (somente em acessibilidade.html) ---------- */
  function preencherVozes(seletor) {
    var lang = idiomaDaPagina().split("-")[0];
    var ordenadas = vozes.slice().sort(function (a, b) {
      var pa = a.lang.toLowerCase().indexOf(lang) === 0 ? 0 : 1;
      var pb = b.lang.toLowerCase().indexOf(lang) === 0 ? 0 : 1;
      return pa - pb || a.name.localeCompare(b.name);
    });
    var atual = vozEscolhida();
    seletor.innerHTML = "";
    if (!ordenadas.length) {
      var vazio = document.createElement("option");
      vazio.textContent = "Nenhuma voz disponível neste navegador";
      seletor.appendChild(vazio);
      seletor.disabled = true;
      return;
    }
    seletor.disabled = false;
    ordenadas.forEach(function (v) {
      var o = document.createElement("option");
      o.value = v.voiceURI;
      o.textContent = v.name + " (" + v.lang + ")";
      if (atual && atual.voiceURI === v.voiceURI) o.selected = true;
      seletor.appendChild(o);
    });
  }

  function opcoes(nome, itens, atual) {
    return itens.map(function (it) {
      return '<label class="opcao-a11y"><input type="radio" name="' + nome + '" value="' + it[0] + '"' +
        (it[0] === atual ? " checked" : "") + "><span>" + it[1] + "</span></label>";
    }).join("");
  }

  function montarPainel(raiz) {
    raiz.innerHTML =
      '<section class="grupo-acessibilidade" aria-labelledby="a11y-t-texto">' +
        '<h3 id="a11y-t-texto" class="rotulo-grupo">Tamanho do texto</h3>' +
        '<div class="linha-botoes">' +
          '<button type="button" class="botao-a11y" id="a11y-menos" aria-label="Diminuir o texto">A−</button>' +
          '<button type="button" class="botao-a11y" id="a11y-padrao">Tamanho padrão</button>' +
          '<button type="button" class="botao-a11y" id="a11y-mais" aria-label="Aumentar o texto">A+</button>' +
        "</div>" +
        '<p class="estado-acessibilidade" id="a11y-estado-tamanho" role="status" aria-live="polite"></p>' +
      "</section>" +

      '<fieldset class="grupo-acessibilidade"><legend>Tema do site</legend>' +
        '<div class="linha-botoes">' +
          opcoes("a11y-tema", [["sistema", "Seguir sistema"], ["claro", "Claro"], ["escuro", "Escuro"]], prefs.tema) +
        "</div>" +
        "<p>O modo escuro usa fundos profundos e luz suave, mantendo as cores das imagens.</p>" +
      "</fieldset>" +

      '<fieldset class="grupo-acessibilidade"><legend>Cores para daltonismo</legend>' +
        '<div class="linha-botoes">' +
          opcoes("a11y-dalt", [["original", "Paleta original"], ["protanopia", "Protanopia"],
            ["deuteranopia", "Deuteranopia"], ["tritanopia", "Tritanopia"], ["acromatopsia", "Acromatopsia"]],
            prefs.daltonismo) +
        "</div>" +
        "<p>Experimente a paleta mais confortável para você. Links sublinhados e marcas de seleção " +
        "ajudam a identificar ações sem depender só das cores.</p>" +
      "</fieldset>" +

      '<section class="grupo-acessibilidade" aria-labelledby="a11y-t-contraste">' +
        '<h3 id="a11y-t-contraste" class="rotulo-grupo">Contraste da interface</h3>' +
        '<div class="linha-botoes"><button type="button" class="botao-a11y" id="a11y-contraste" ' +
        'aria-pressed="false">Alto contraste</button></div>' +
        "<p>Reforça a diferença entre texto e fundo, os contornos e o foco. Funciona com o tema claro " +
        "ou escuro e prioriza a legibilidade das outras paletas.</p>" +
      "</section>" +

      '<section class="grupo-acessibilidade" aria-labelledby="a11y-t-inversao">' +
        '<h3 id="a11y-t-inversao" class="rotulo-grupo">Inversão de cores</h3>' +
        '<div class="linha-botoes"><button type="button" class="botao-a11y" id="a11y-inversao" ' +
        'aria-pressed="false">Inverter cores</button></div>' +
        "<p>Inverte todas as cores da página, incluindo imagens. O tema escolhido continua o mesmo.</p>" +
      "</section>" +

      '<div class="linha-botoes"><button type="button" class="botao-a11y" id="a11y-restaurar">' +
        "Restaurar preferências visuais</button></div>" +

      "<hr>" +

      '<section class="grupo-acessibilidade" aria-labelledby="a11y-t-voz">' +
        '<h4 id="a11y-t-voz">Leitura em voz alta</h4>' +
        "<p>Ouça os trechos ao passar o mouse ou navegar com o teclado. Escolha a voz e a velocidade.</p>" +
        '<div class="linha-botoes"><button type="button" class="botao-a11y" id="a11y-voz-ativa" ' +
        'aria-pressed="false">Ativar leitura em voz alta</button>' +
        '<button type="button" class="botao-a11y" id="a11y-voz-teste">Ouvir exemplo</button></div>' +
        '<label for="a11y-voz" class="rotulo-grupo">Voz</label>' +
        '<select id="a11y-voz"></select>' +
        '<label for="a11y-velocidade" class="rotulo-grupo">Velocidade: ' +
        '<span id="a11y-velocidade-valor"></span></label>' +
        '<input type="range" id="a11y-velocidade" min="0.5" max="2" step="0.1">' +
        '<p id="a11y-voz-aviso" role="status" aria-live="polite"></p>' +
      "</section>" +

      "<p>Esses controles ajustam a apresentação. Nenhum dado pessoal é solicitado.</p>";

    var $ = function (id) { return document.getElementById(id); };

    function sincronizar() {
      $("a11y-estado-tamanho").textContent = "Tamanho do texto: " + prefs.tamanho + "%.";
      $("a11y-menos").disabled = prefs.tamanho <= PASSOS[0];
      $("a11y-mais").disabled = prefs.tamanho >= PASSOS[PASSOS.length - 1];
      $("a11y-padrao").disabled = prefs.tamanho === 100;
      $("a11y-contraste").setAttribute("aria-pressed", String(prefs.contraste));
      $("a11y-inversao").setAttribute("aria-pressed", String(prefs.inversao));
      $("a11y-voz-ativa").setAttribute("aria-pressed", String(prefs.voz.ativa));
      $("a11y-voz-ativa").textContent = prefs.voz.ativa
        ? "Leitura em voz alta ativada" : "Ativar leitura em voz alta";
      $("a11y-velocidade").value = prefs.voz.velocidade;
      $("a11y-velocidade-valor").textContent = prefs.voz.velocidade.toFixed(1) + "×";
      raiz.querySelectorAll("input[name=a11y-tema]").forEach(function (i) { i.checked = i.value === prefs.tema; });
      raiz.querySelectorAll("input[name=a11y-dalt]").forEach(function (i) { i.checked = i.value === prefs.daltonismo; });
    }

    function mudar() { aplicar(); salvar(); sincronizar(); }

    $("a11y-menos").addEventListener("click", function () {
      var i = PASSOS.indexOf(prefs.tamanho);
      if (i > 0) { prefs.tamanho = PASSOS[i - 1]; mudar(); }
    });
    $("a11y-mais").addEventListener("click", function () {
      var i = PASSOS.indexOf(prefs.tamanho);
      if (i < PASSOS.length - 1) { prefs.tamanho = PASSOS[i + 1]; mudar(); }
    });
    $("a11y-padrao").addEventListener("click", function () { prefs.tamanho = 100; mudar(); });

    raiz.querySelectorAll("input[name=a11y-tema]").forEach(function (i) {
      i.addEventListener("change", function () { prefs.tema = i.value; mudar(); });
    });
    raiz.querySelectorAll("input[name=a11y-dalt]").forEach(function (i) {
      i.addEventListener("change", function () { prefs.daltonismo = i.value; mudar(); });
    });
    $("a11y-contraste").addEventListener("click", function () { prefs.contraste = !prefs.contraste; mudar(); });
    $("a11y-inversao").addEventListener("click", function () { prefs.inversao = !prefs.inversao; mudar(); });

    $("a11y-restaurar").addEventListener("click", function () {
      var voz = prefs.voz;
      prefs = copiar(PADRAO);
      prefs.voz = voz;
      mudar();
    });

    /* Voz */
    var aviso = $("a11y-voz-aviso");
    if (!sintese) {
      aviso.textContent = "Este navegador não oferece leitura em voz alta.";
      ["a11y-voz-ativa", "a11y-voz-teste", "a11y-voz", "a11y-velocidade"].forEach(function (id) {
        $(id).disabled = true;
      });
    } else {
      preencherVozes($("a11y-voz"));
      $("a11y-voz").addEventListener("change", function (e) {
        prefs.voz.uri = e.target.value; salvar();
      });
      $("a11y-velocidade").addEventListener("input", function (e) {
        prefs.voz.velocidade = Number(e.target.value); salvar(); sincronizar();
      });
      $("a11y-voz-ativa").addEventListener("click", function () {
        prefs.voz.ativa = !prefs.voz.ativa;
        if (!prefs.voz.ativa) pararLeitura();
        salvar(); sincronizar();
        aviso.textContent = prefs.voz.ativa
          ? "Leitura ativada. Passe o mouse ou use Tab sobre um trecho. Esc interrompe a fala."
          : "Leitura desativada.";
      });
      $("a11y-voz-teste").addEventListener("click", function () {
        ultimoTexto = "";
        falar("Esta é a voz escolhida para a leitura do Planeta em foco.", null);
      });
    }
    sincronizar();
  }

  function iniciar() {
    var painel = document.getElementById("painel-acessibilidade");
    if (painel) {
      var aviso = document.getElementById("aviso-sem-js");
      if (aviso) aviso.hidden = true;
      montarPainel(painel);
    }
    var atual = (location.pathname.split("/").pop() || "");
    document.querySelectorAll(".botao-acessibilidade").forEach(function (a) {
      if (a.getAttribute("href").split("/").pop() === atual) a.setAttribute("aria-current", "page");
    });
    iniciarLeitura();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar);
  else iniciar();
})();
