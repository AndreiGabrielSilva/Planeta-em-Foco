/* Planeta em foco — seletor de idioma.
   Traduz a página inteira com o Google Translate (precisa de internet) e
   lembra o idioma escolhido ao navegar entre as páginas.
   O site original está em português do Brasil (código "pt"). */
(function () {
  "use strict";

  var CHAVE = "planeta-em-foco-idioma";
  var BASE = "pt";

  /* Idiomas em destaque, na ordem do seletor de referência. */
  var DESTAQUES = [
    ["pt", "Português (Brasil)"],
    ["en", "English"],
    ["zh-CN", "普通话"],
    ["de", "Deutsch"],
    ["fr", "Français"],
    ["es", "Español (Latinoamérica)"],
    ["ru", "Русский"],
    ["ja", "日本語"],
    ["hi", "हिन्दी (Hindi)"]
  ];

  /* Todos os demais idiomas aceitos pelo Google Translate:
     [código, nome no próprio idioma, nome em inglês para ordenar]. */
  var OUTROS = [
    ["af", "Afrikaans", "Afrikaans"], ["sq", "Shqip", "Albanian"],
    ["am", "አማርኛ", "Amharic"], ["ar", "العربية", "Arabic"],
    ["hy", "Հայերեն", "Armenian"], ["az", "Azərbaycan", "Azerbaijani"],
    ["eu", "Euskara", "Basque"], ["be", "Беларуская", "Belarusian"],
    ["bn", "বাংলা", "Bengali"], ["bs", "Bosanski", "Bosnian"],
    ["bg", "Български", "Bulgarian"], ["ca", "Català", "Catalan"],
    ["ceb", "Cebuano", "Cebuano"], ["ny", "Chichewa", "Chichewa"],
    ["zh-TW", "中文 (繁體)", "Chinese Traditional"], ["co", "Corsu", "Corsican"],
    ["hr", "Hrvatski", "Croatian"], ["cs", "Čeština", "Czech"],
    ["da", "Dansk", "Danish"], ["nl", "Nederlands", "Dutch"],
    ["eo", "Esperanto", "Esperanto"], ["et", "Eesti", "Estonian"],
    ["tl", "Filipino", "Filipino"], ["fi", "Suomi", "Finnish"],
    ["fy", "Frysk", "Frisian"], ["gl", "Galego", "Galician"],
    ["ka", "ქართული", "Georgian"], ["el", "Ελληνικά", "Greek"],
    ["gu", "ગુજરાતી", "Gujarati"], ["ht", "Kreyòl ayisyen", "Haitian Creole"],
    ["ha", "Hausa", "Hausa"], ["haw", "ʻŌlelo Hawaiʻi", "Hawaiian"],
    ["iw", "עברית", "Hebrew"], ["hmn", "Hmoob", "Hmong"],
    ["hu", "Magyar", "Hungarian"], ["is", "Íslenska", "Icelandic"],
    ["ig", "Igbo", "Igbo"], ["id", "Bahasa Indonesia", "Indonesian"],
    ["ga", "Gaeilge", "Irish"], ["it", "Italiano", "Italian"],
    ["jw", "Basa Jawa", "Javanese"], ["kn", "ಕನ್ನಡ", "Kannada"],
    ["kk", "Қазақ тілі", "Kazakh"], ["km", "ខ្មែរ", "Khmer"],
    ["rw", "Kinyarwanda", "Kinyarwanda"], ["ko", "한국어", "Korean"],
    ["ku", "Kurdî", "Kurdish"], ["ky", "Кыргызча", "Kyrgyz"],
    ["lo", "ລາວ", "Lao"], ["la", "Latina", "Latin"],
    ["lv", "Latviešu", "Latvian"], ["lt", "Lietuvių", "Lithuanian"],
    ["lb", "Lëtzebuergesch", "Luxembourgish"], ["mk", "Македонски", "Macedonian"],
    ["mg", "Malagasy", "Malagasy"], ["ms", "Bahasa Melayu", "Malay"],
    ["ml", "മലയാളം", "Malayalam"], ["mt", "Malti", "Maltese"],
    ["mi", "Māori", "Maori"], ["mr", "मराठी", "Marathi"],
    ["mn", "Монгол", "Mongolian"], ["my", "မြန်မာ", "Myanmar"],
    ["ne", "नेपाली", "Nepali"], ["no", "Norsk", "Norwegian"],
    ["or", "ଓଡ଼ିଆ", "Odia"], ["ps", "پښتو", "Pashto"],
    ["fa", "فارسی", "Persian"], ["pl", "Polski", "Polish"],
    ["pa", "ਪੰਜਾਬੀ", "Punjabi"], ["ro", "Română", "Romanian"],
    ["sm", "Gagana Samoa", "Samoan"], ["gd", "Gàidhlig", "Scots Gaelic"],
    ["sr", "Српски", "Serbian"], ["st", "Sesotho", "Sesotho"],
    ["sn", "Shona", "Shona"], ["sd", "سنڌي", "Sindhi"],
    ["si", "සිංහල", "Sinhala"], ["sk", "Slovenčina", "Slovak"],
    ["sl", "Slovenščina", "Slovenian"], ["so", "Soomaali", "Somali"],
    ["su", "Basa Sunda", "Sundanese"], ["sw", "Kiswahili", "Swahili"],
    ["sv", "Svenska", "Swedish"], ["tg", "Тоҷикӣ", "Tajik"],
    ["ta", "தமிழ்", "Tamil"], ["tt", "Татарча", "Tatar"],
    ["te", "తెలుగు", "Telugu"], ["th", "ไทย", "Thai"],
    ["tr", "Türkçe", "Turkish"], ["tk", "Türkmen", "Turkmen"],
    ["uk", "Українська", "Ukrainian"], ["ur", "اردو", "Urdu"],
    ["ug", "ئۇيغۇرچە", "Uyghur"], ["uz", "Oʻzbek", "Uzbek"],
    ["vi", "Tiếng Việt", "Vietnamese"], ["cy", "Cymraeg", "Welsh"],
    ["xh", "isiXhosa", "Xhosa"], ["yi", "ייִדיש", "Yiddish"],
    ["yo", "Yorùbá", "Yoruba"], ["zu", "isiZulu", "Zulu"]
  ].sort(function (a, b) { return a[2].localeCompare(b[2]); });

  var TODOS = DESTAQUES.concat(OUTROS);
  var RTL = ["ar", "iw", "fa", "ur", "ps", "sd", "ug", "yi"];

  /* ---------- Armazenamento (localStorage, cookie e window.name) ---------- */
  function lerCookie() {
    var m = document.cookie.match(/(?:^|;\s*)googtrans=\/[^/]*\/([^;]+)/);
    return m ? decodeURIComponent(m[1]) : null;
  }

  function definirCookie(codigo) {
    if (location.protocol.indexOf("http") !== 0) return;
    var base = "googtrans=" + (codigo ? "/" + BASE + "/" + codigo : "") + "; path=/";
    if (codigo) {
      document.cookie = base;
    } else {
      var expira = "; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = base + expira;
      document.cookie = base + expira + "; domain=" + location.hostname;
      document.cookie = base + expira + "; domain=." + location.hostname;
    }
  }

  function lerIdioma() {
    var valor = null;
    try { valor = localStorage.getItem(CHAVE); } catch (e) { /* sem acesso */ }
    if (!valor) valor = lerCookie();
    if (!valor && window.name.indexOf(CHAVE + ":") === 0) {
      valor = window.name.slice(CHAVE.length + 1);
    }
    return existe(valor) ? valor : BASE;
  }

  function guardarIdioma(codigo) {
    try {
      if (codigo === BASE) localStorage.removeItem(CHAVE);
      else localStorage.setItem(CHAVE, codigo);
    } catch (e) { /* sem acesso */ }
    definirCookie(codigo === BASE ? null : codigo);
    window.name = codigo === BASE ? "" : CHAVE + ":" + codigo;
  }

  function existe(codigo) {
    return TODOS.some(function (i) { return i[0] === codigo; });
  }

  function nomeDe(codigo) {
    for (var i = 0; i < TODOS.length; i++) {
      if (TODOS[i][0] === codigo) return TODOS[i][1];
    }
    return TODOS[0][1];
  }

  /* ---------- Google Translate ---------- */
  var pendente = null;
  var carregando = false;

  function aviso(texto) {
    var el = document.querySelector(".idioma-aviso");
    if (!el) return;
    el.textContent = texto;
    el.hidden = false;
    clearTimeout(aviso.t);
    aviso.t = setTimeout(function () { el.hidden = true; }, 5000);
  }

  function carregarGoogle() {
    if (carregando) return;
    carregando = true;

    var alvo = document.createElement("div");
    alvo.id = "google_translate_element";
    alvo.setAttribute("translate", "no");
    document.body.appendChild(alvo);

    window.planetaIniciarTraducao = function () {
      /* eslint-disable-next-line no-undef */
      new google.translate.TranslateElement(
        { pageLanguage: BASE, autoDisplay: false },
        "google_translate_element"
      );
      esperarCombo(0);
    };

    var s = document.createElement("script");
    s.src = "https://translate.google.com/translate_a/element.js?cb=planetaIniciarTraducao";
    s.async = true;
    s.onerror = function () {
      carregando = false;
      aviso("Não foi possível carregar a tradução. Verifique sua conexão com a internet.");
    };
    document.head.appendChild(s);
  }

  function esperarCombo(tentativas) {
    var combo = document.querySelector(".goog-te-combo");
    if (combo) {
      aplicarNoCombo(combo);
      return;
    }
    if (tentativas > 100) {
      aviso("A tradução demorou demais para iniciar. Tente de novo.");
      return;
    }
    setTimeout(function () { esperarCombo(tentativas + 1); }, 100);
  }

  function aplicarNoCombo(combo) {
    if (!pendente || combo.value === pendente) return;
    combo.value = pendente;
    combo.dispatchEvent(new Event("change"));
  }

  function traduzir(codigo) {
    pendente = codigo;
    var combo = document.querySelector(".goog-te-combo");
    if (combo) aplicarNoCombo(combo);
    else carregarGoogle();
  }

  function escolher(codigo) {
    var anterior = lerIdioma();
    if (codigo === anterior) return;
    guardarIdioma(codigo);
    document.documentElement.dir = RTL.indexOf(codigo) >= 0 ? "rtl" : "ltr";

    if (codigo === BASE) {
      /* Voltar ao original: recarregar é o jeito confiável de desfazer. */
      location.reload();
    } else {
      traduzir(codigo);
    }
  }

  /* ---------- Interface do seletor ---------- */
  var SETA =
    '<svg class="idioma-seta" viewBox="0 0 16 16" aria-hidden="true">' +
    '<path d="M3 6l5 5 5-5" fill="none" stroke="currentColor" stroke-width="1.8" ' +
    'stroke-linecap="round" stroke-linejoin="round"/></svg>';

  function criarSeletor() {
    var atual = lerIdioma();

    var raiz = document.createElement("div");
    raiz.className = "idioma";

    var rotulo = document.createElement("span");
    rotulo.className = "idioma-rotulo";
    rotulo.id = "idioma-rotulo";
    rotulo.textContent = "Idioma";

    var caixa = document.createElement("div");
    caixa.className = "idioma-caixa";
    caixa.setAttribute("translate", "no");

    var botao = document.createElement("button");
    botao.type = "button";
    botao.className = "idioma-botao";
    botao.setAttribute("aria-haspopup", "listbox");
    botao.setAttribute("aria-expanded", "false");
    botao.setAttribute("aria-labelledby", "idioma-rotulo idioma-atual");
    botao.innerHTML = '<span id="idioma-atual"></span>' + SETA;

    var lista = document.createElement("ul");
    lista.className = "idioma-lista";
    lista.id = "idioma-lista";
    lista.setAttribute("role", "listbox");
    lista.setAttribute("aria-labelledby", "idioma-rotulo");
    lista.tabIndex = -1;
    lista.hidden = true;
    botao.setAttribute("aria-controls", "idioma-lista");

    var itens = [];
    TODOS.forEach(function (idioma, indice) {
      if (indice === DESTAQUES.length) {
        var sep = document.createElement("li");
        sep.className = "idioma-separador";
        sep.setAttribute("role", "separator");
        lista.appendChild(sep);
      }
      var li = document.createElement("li");
      li.id = "idioma-op-" + indice;
      li.setAttribute("role", "option");
      li.setAttribute("lang", idioma[0]);
      li.dataset.codigo = idioma[0];
      li.textContent = idioma[1];
      lista.appendChild(li);
      itens.push(li);
    });

    var avisoEl = document.createElement("div");
    avisoEl.className = "idioma-aviso";
    avisoEl.setAttribute("role", "status");
    avisoEl.hidden = true;

    caixa.appendChild(botao);
    caixa.appendChild(lista);
    raiz.appendChild(rotulo);
    raiz.appendChild(caixa);
    raiz.appendChild(avisoEl);

    var indiceAtivo = 0;
    var busca = "";
    var buscaTimer = null;

    function marcarSelecionado(codigo) {
      itens.forEach(function (li) {
        li.setAttribute("aria-selected", li.dataset.codigo === codigo ? "true" : "false");
      });
      botao.querySelector("#idioma-atual").textContent = nomeDe(codigo);
    }

    function ativar(indice, rolar) {
      indiceAtivo = Math.max(0, Math.min(itens.length - 1, indice));
      itens.forEach(function (li, i) { li.classList.toggle("ativo", i === indiceAtivo); });
      lista.setAttribute("aria-activedescendant", itens[indiceAtivo].id);
      if (rolar !== false) itens[indiceAtivo].scrollIntoView({ block: "nearest" });
    }

    function abrir() {
      lista.hidden = false;
      botao.setAttribute("aria-expanded", "true");
      var sel = lerIdioma();
      var i = itens.findIndex(function (li) { return li.dataset.codigo === sel; });
      ativar(i < 0 ? 0 : i);
      lista.focus({ preventScroll: true });
    }

    function fechar(voltarFoco) {
      lista.hidden = true;
      botao.setAttribute("aria-expanded", "false");
      if (voltarFoco) botao.focus();
    }

    function confirmar(indice) {
      var codigo = itens[indice].dataset.codigo;
      marcarSelecionado(codigo);
      fechar(true);
      escolher(codigo);
    }

    botao.addEventListener("click", function () {
      if (lista.hidden) abrir(); else fechar(false);
    });
    botao.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        abrir();
      }
    });

    lista.addEventListener("click", function (e) {
      var li = e.target.closest("li[role='option']");
      if (li) confirmar(itens.indexOf(li));
    });
    lista.addEventListener("mousemove", function (e) {
      var li = e.target.closest("li[role='option']");
      if (li) ativar(itens.indexOf(li), false);
    });
    lista.addEventListener("keydown", function (e) {
      switch (e.key) {
        case "ArrowDown": e.preventDefault(); ativar(indiceAtivo + 1); break;
        case "ArrowUp": e.preventDefault(); ativar(indiceAtivo - 1); break;
        case "Home": e.preventDefault(); ativar(0); break;
        case "End": e.preventDefault(); ativar(itens.length - 1); break;
        case "Enter":
        case " ": e.preventDefault(); confirmar(indiceAtivo); break;
        case "Escape": e.preventDefault(); fechar(true); break;
        case "Tab": fechar(false); break;
        default:
          if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
            busca += e.key.toLowerCase();
            clearTimeout(buscaTimer);
            buscaTimer = setTimeout(function () { busca = ""; }, 700);
            var achou = itens.findIndex(function (li) {
              return li.textContent.toLowerCase().indexOf(busca) === 0;
            });
            if (achou >= 0) ativar(achou);
          }
      }
    });

    document.addEventListener("click", function (e) {
      if (!lista.hidden && !raiz.contains(e.target)) fechar(false);
    });

    marcarSelecionado(atual);
    return raiz;
  }

  function inserir() {
    var seletor = criarSeletor();
    var nav = document.querySelector(".navegacao");
    var barra = document.querySelector(".linha-superior");
    if (nav) nav.insertBefore(seletor, nav.firstChild);
    else if (barra) barra.appendChild(seletor);
    else document.body.insertBefore(seletor, document.body.firstChild);
  }

  function iniciar() {
    inserir();
    var idioma = lerIdioma();
    document.documentElement.dir = RTL.indexOf(idioma) >= 0 ? "rtl" : "ltr";
    if (idioma !== BASE) traduzir(idioma);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciar);
  } else {
    iniciar();
  }
})();
