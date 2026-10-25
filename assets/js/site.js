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

  var ano = document.getElementById("ano");
  if (ano) ano.textContent = new Date().getFullYear();
})();
