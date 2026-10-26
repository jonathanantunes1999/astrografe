(function () {
  "use strict";

  var topo = document.querySelector(".topo");
  var burger = document.getElementById("burger");

  if (burger && topo) {
    burger.addEventListener("click", function () {
      var aberto = topo.classList.toggle("nav-aberto");
      burger.setAttribute("aria-expanded", aberto ? "true" : "false");
      burger.setAttribute("aria-label", aberto ? "Fechar menu" : "Abrir menu");
    });

    // fechar ao escolher uma entrada do menu
    topo.querySelectorAll(".nav a").forEach(function (a) {
      a.addEventListener("click", function () {
        topo.classList.remove("nav-aberto");
        burger.setAttribute("aria-expanded", "false");
      });
    });
  }

  var subir = document.getElementById("subir");

  if (subir) {
    var arco = subir.querySelector(".prog");
    var volta = 2 * Math.PI * 20;
    var fim = document.querySelector(".pe-base");

    var marcar = function () {
      // primeiro le-se tudo, so depois se escreve: a ordem inversa obriga
      // o browser a recalcular o layout a meio de cada scroll
      var altura = window.innerHeight;
      var y = window.scrollY;
      var percurso = document.documentElement.scrollHeight - altura;
      var topoDoFim = fim ? fim.getBoundingClientRect().top : null;

      var lido = percurso > 0 ? y / percurso : 0;
      arco.style.strokeDashoffset = volta * (1 - Math.min(lido, 1));
      subir.classList.toggle("ver", y > 600);

      // ao chegar ao fim do rodape o botao encosta, em vez de tapar o texto
      if (topoDoFim !== null) {
        var folga = window.innerWidth >= 960 ? 28 : 16;
        subir.style.bottom = Math.max(folga, altura - topoDoFim + 12) + "px";
      }
    };

    // no maximo uma vez por fotograma
    var pedido = false;
    var aoRolar = function () {
      if (pedido) return;
      pedido = true;
      requestAnimationFrame(function () {
        pedido = false;
        marcar();
      });
    };

    window.addEventListener("scroll", aoRolar, { passive: true });
    window.addEventListener("resize", aoRolar);
    marcar();

    subir.addEventListener("click", function () {
      var parado = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: 0, behavior: parado ? "auto" : "smooth" });
    });
  }

  var form = document.getElementById("form-orcamento");

  if (form) {
    var aviso = document.getElementById("form-aviso");
    var botao = form.querySelector('button[type="submit"]');
    var familia = form.querySelector("#familia");

    // a familia pode vir escolhida da pagina de produtos: orcamento/?familia=calendarios
    var pedida = new URLSearchParams(window.location.search).get("familia");
    if (familia && pedida) {
      Array.prototype.forEach.call(familia.options, function (opcao) {
        if (opcao.value === pedida) familia.value = pedida;
      });
    }

    var caixaDe = function (campo) {
      return campo.closest(".campo, .campo-check");
    };

    var ESPERA = 5000;

    var limpar = function (campo) {
      var caixa = caixaDe(campo);
      if (!caixa) return;
      clearTimeout(caixa.relogio);
      caixa.classList.remove("mau");
      campo.removeAttribute("aria-invalid");
      campo.removeAttribute("aria-describedby");
      var marca = caixa.querySelector(".erro");
      if (marca) marca.remove();
    };

    var razao = function (campo) {
      if (campo.validity.valueMissing) {
        if (campo.type === "checkbox") return "É preciso autorizar para podermos responder.";
        if (campo.tagName === "SELECT") return "Escolha uma opção da lista.";
        return "Preencha este campo.";
      }
      if (campo.validity.typeMismatch && campo.type === "email") {
        return "Este email não parece estar certo.";
      }
      if (campo.validity.typeMismatch && campo.type === "url") {
        return "O link tem de começar por http:// ou https://";
      }
      return "Verifique este campo.";
    };

    var assinalar = function (campo) {
      var caixa = caixaDe(campo);
      if (!caixa || caixa.querySelector(".erro")) return;
      var marca = document.createElement("span");
      marca.className = "erro";
      marca.id = "erro-" + campo.id;
      marca.textContent = razao(campo);
      caixa.appendChild(marca);
      caixa.classList.add("mau");
      campo.setAttribute("aria-invalid", "true");
      campo.setAttribute("aria-describedby", marca.id);

      // a marca apaga-se sozinha, para o formulario nao ficar vermelho para sempre
      caixa.relogio = setTimeout(function () {
        marca.classList.add("sai");
        caixa.classList.remove("mau");
        setTimeout(function () { limpar(campo); }, 400);
      }, ESPERA);
    };

    var porPreencher = function () {
      var maus = [];
      Array.prototype.forEach.call(form.elements, function (campo) {
        if (!campo.name || campo.type === "hidden" || campo.classList.contains("mel")) return;
        limpar(campo);
        if (!campo.checkValidity()) {
          assinalar(campo);
          maus.push(campo);
        }
      });
      return maus;
    };

    // ao corrigir um campo, a marca de erro sai logo
    ["input", "change"].forEach(function (evento) {
      form.addEventListener(evento, function (e) {
        if (e.target.willValidate && e.target.checkValidity()) limpar(e.target);
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var maus = porPreencher();
      if (maus.length) {
        aviso.className = "form-aviso erro";
        aviso.textContent = maus.length === 1
          ? "Falta preencher um campo. Está assinalado acima."
          : "Faltam " + maus.length + " campos. Estão assinalados acima.";
        var parado = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        maus[0].focus({ preventScroll: true });
        maus[0].scrollIntoView({ block: "center", behavior: parado ? "auto" : "smooth" });

        // abanam todos em cascata, depois de a pagina chegar ao primeiro
        if (!parado) {
          setTimeout(function () {
            maus.forEach(function (campo, i) {
              campo.style.animationDelay = i * 70 + "ms";
              campo.classList.add("abana");
              campo.addEventListener("animationend", function () {
                campo.classList.remove("abana");
                campo.style.animationDelay = "";
              }, { once: true });
            });
          }, 350);
        }

        clearTimeout(form.relogio);
        form.relogio = setTimeout(function () { aviso.className = "form-aviso"; }, ESPERA);
        return;
      }

      botao.disabled = true;
      botao.textContent = "A enviar…";
      aviso.className = "form-aviso";

      fetch(form.action, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(form)
      })
        .then(function (resposta) { return resposta.json(); })
        .then(function (dados) {
          if (!dados.success) throw new Error(dados.message);
          form.reset();
          aviso.className = "form-aviso ok";
          aviso.textContent = "Pedido enviado. Respondemos em 24 horas úteis.";
        })
        .catch(function () {
          aviso.className = "form-aviso erro";
          aviso.innerHTML =
            'Não foi possível enviar o pedido. Tente outra vez ou ligue para ' +
            '<a href="tel:+351219822088">219 822 088</a>.';
        })
        .then(function () {
          botao.disabled = false;
          botao.textContent = "Enviar pedido";
        });
    });
  }

  var escada = document.querySelectorAll(".escada-item");

  if (escada.length) {
    if ("IntersectionObserver" in window) {
      // alterna a classe, por isso a entrada repete-se a subir e a descer
      var vigia = new IntersectionObserver(function (entradas) {
        entradas.forEach(function (entrada) {
          entrada.target.classList.toggle("vista", entrada.isIntersecting);
        });
      }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

      escada.forEach(function (linha) { vigia.observe(linha); });
    } else {
      escada.forEach(function (linha) { linha.classList.add("vista"); });
    }
  }

  var atalhos = document.querySelectorAll(".atalhos a");
  var seccoes = document.querySelectorAll(".bloco");

  if (atalhos.length && seccoes.length && "IntersectionObserver" in window) {
    var aLer = [];

    var acender = function () {
      // com duas na faixa, manda a que entrou por ultimo
      var escolhida = null;
      aLer.forEach(function (seccao) {
        if (!escolhida || seccao.getBoundingClientRect().top > escolhida.getBoundingClientRect().top) {
          escolhida = seccao;
        }
      });
      if (!escolhida) return;

      atalhos.forEach(function (atalho) {
        atalho.classList.toggle("ativo", atalho.getAttribute("href") === "#" + escolhida.id);
      });
    };

    var olho = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (entrada) {
        var posicao = aLer.indexOf(entrada.target);
        if (entrada.isIntersecting && posicao === -1) aLer.push(entrada.target);
        if (!entrada.isIntersecting && posicao !== -1) aLer.splice(posicao, 1);
      });
      acender();
    }, { rootMargin: "-135px 0px -75% 0px" });

    seccoes.forEach(function (seccao) { olho.observe(seccao); });
  }

  var ano = document.getElementById("ano");
  if (ano) ano.textContent = new Date().getFullYear();
})();
