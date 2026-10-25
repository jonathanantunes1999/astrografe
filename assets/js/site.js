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

    var marcar = function () {
      var percurso = document.documentElement.scrollHeight - window.innerHeight;
      var lido = percurso > 0 ? window.scrollY / percurso : 0;
      arco.style.strokeDashoffset = volta * (1 - Math.min(lido, 1));
      subir.classList.toggle("ver", window.scrollY > 600);
    };

    window.addEventListener("scroll", marcar, { passive: true });
    window.addEventListener("resize", marcar);
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

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
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

  var ano = document.getElementById("ano");
  if (ano) ano.textContent = new Date().getFullYear();
})();
