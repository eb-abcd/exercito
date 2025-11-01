// =================== CONFIG ===================
const ADMIN_PASS = "1822br";
const STORAGE_KEY = "inscricoesMilitares";

// =================== FUNÇÃO SALVAR FORM ===================
function salvarInscricao(data) {
  const inscricoes = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  inscricoes.push(data);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(inscricoes));
}

// =================== FORMULÁRIO (FAÇA PARTE) ===================
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formInscricao");
  const notif = document.getElementById("notifOverlay");
  const notifClose = document.getElementById("notifClose");
  const btnEntrar = document.getElementById("btnEntrar");
  const btnSair = document.getElementById("btnSair");
  const tabela = document.getElementById("tabelaInscricoes")?.querySelector("tbody");

  // ========= FORM SUBMIT =========
  if (form) {
    form.addEventListener("submit", e => {
      e.preventDefault();
      const data = {
        nome: form.querySelector("#nome").value.trim(),
        idade: form.querySelector("#idade").value.trim(),
        documento: form.querySelector("#documento").value.trim(),
        telefone: form.querySelector("#telefone").value.trim(),
        email: form.querySelector("#email").value.trim(),
        area: form.querySelector("#area").value,
        motivo: form.querySelector("#motivo").value,
        descricao: form.querySelector("#descricao")?.value.trim() || ""
      };
      salvarInscricao(data);

      // Mostra notificação de sucesso
      if (notif) {
        notif.classList.add("show");
        notif.querySelector("h4").textContent = "Alistamento enviado!";
      }
      form.reset();
    });
  }

  // ========= FECHAR NOTIF =========
  if (notifClose) {
    notifClose.addEventListener("click", () => notif.classList.remove("show"));
  }

  // ========= LOGIN (BOTÃO ENTRAR) =========
  if (btnEntrar) {
    btnEntrar.addEventListener("click", () => {
      const senha = prompt("Digite a senha de administrador:");
      if (senha === ADMIN_PASS) {
        sessionStorage.setItem("adminAuth", "true");
        window.location.href = "admin.html";
      } else {
        alert("Senha incorreta!");
      }
    });
  }

  // ========= SAIR (PAINEL ADMIN) =========
  if (btnSair) {
    btnSair.addEventListener("click", () => {
      sessionStorage.removeItem("adminAuth");
      window.location.href = "index.html";
    });
  }

  // ========= VERIFICAR LOGIN =========
  if (window.location.pathname.includes("admin.html")) {
    if (sessionStorage.getItem("adminAuth") !== "true") {
      window.location.href = "index.html";
      return;
    }

    carregarInscricoes();

    function carregarInscricoes() {
      tabela.innerHTML = "";
      const inscricoes = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

      inscricoes.forEach((item, index) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${item.nome}</td>
          <td>${item.idade}</td>
          <td>${item.documento}</td>
          <td>${item.telefone}</td>
          <td>${item.email}</td>
          <td>${item.area}</td>
          <td>${item.motivo}</td>
          <td>${item.descricao}</td>
          <td><button class="btn-apagar" data-index="${index}">Excluir</button></td>
        `;
        tabela.appendChild(tr);
      });

      // Eventos de exclusão
      document.querySelectorAll(".btn-apagar").forEach(btn => {
        btn.addEventListener("click", e => {
          const i = e.target.dataset.index;
          inscricoes.splice(i, 1);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(inscricoes));
          carregarInscricoes();
        });
      });
    }
  }
});
