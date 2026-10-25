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

  var ano = document.getElementById("ano");
  if (ano) ano.textContent = new Date().getFullYear();
})();
