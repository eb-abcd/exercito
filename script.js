// Inicializa o Supabase
const supabaseUrl = "https://vwnzmmyoesrjqpthsstg.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3bnptbXlvZXNyanFwdGhzc3RnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5NTIyMTAsImV4cCI6MjA3NzUyODIxMH0.F6z3GoZbC-htwzOZSlOnwZUbVOSbgCSbeFE1qskQihw";
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

document.addEventListener("DOMContentLoaded", function () {
  // ------------------------------
  // LOGIN ADMIN POPUP
  // ------------------------------
  const btnEntrar = document.getElementById("btnEntrar");
  const popup = document.getElementById("loginPopup");
  const btnClose = document.getElementById("loginClose");
  const btnLoginConfirm = document.getElementById("loginConfirm");

  if (btnEntrar && popup) {
    btnEntrar.addEventListener("click", () => popup.classList.add("show"));
  }
  if (btnClose && popup) {
    btnClose.addEventListener("click", () => popup.classList.remove("show"));
  }
  if (btnLoginConfirm) {
    btnLoginConfirm.addEventListener("click", () => {
      const u = document.getElementById("adminUser").value || "";
      const p = document.getElementById("adminPass").value || "";

      if (u === "Admin" && p === "1822br") {
        sessionStorage.setItem("adminLogado", "true");
        popup.classList.remove("show");
        window.location.href = "admin.html";
      } else {
        alert("Credenciais incorretas");
      }
    });
  }

  // ------------------------------
  // FORMULÁRIO "FAÇA PARTE"
  // ------------------------------
  const form = document.getElementById("formInscricao");
  if (form) {
    const motivoSel = document.getElementById("motivo");
    const campoMotivo = document.getElementById("campoMotivo");
    const notif = document.getElementById("notifOverlay");
    const notifClose = document.getElementById("notifClose");
    const areaSel = document.getElementById("area");

    form.setAttribute("novalidate", "true");

    motivoSel.addEventListener("change", () => {
      if (motivoSel.value === "outros")
        campoMotivo.classList.remove("d-none");
      else campoMotivo.classList.add("d-none");
    });

    form.addEventListener("submit", async function (e) {
      e.preventDefault();

      const data = {
        nome: document.getElementById("nome").value.trim(),
        idade: document.getElementById("idade").value.trim(),
        documento: document.getElementById("documento").value.trim(),
        telefone: document.getElementById("telefone").value.trim(),
        email: document.getElementById("email").value.trim(),
        area: areaSel ? areaSel.value : "",
        motivo: motivoSel.value,
        descricao: document.getElementById("descricao").value.trim(),
        enviado_em: new Date().toISOString(),
      };

      if (!data.nome || !data.documento || !data.email || !data.area) {
        showAlert("Por favor, preencha todos os dados obrigatórios.");
        return;
      }

      const { error } = await supabase.from("inscricoes").insert([data]);
      if (error) {
        console.error("Erro ao enviar:", error);
        showAlert("Erro ao enviar inscrição. Tente novamente.");
        return;
      }

      if (notif) notif.classList.add("show");
      form.reset();
      campoMotivo.classList.add("d-none");
    });

    if (notifClose) {
      notifClose.addEventListener("click", () => {
        notif.classList.remove("show");
        setTimeout(() => window.close(), 400);
      });
    }
  }

  // ------------------------------
  // PÁGINA ADMIN
  // ------------------------------
  if (window.location.pathname.split("/").pop() === "admin.html") {
    if (sessionStorage.getItem("adminLogado") !== "true") {
      alert("Acesso restrito: faça login.");
      window.location.href = "index.html";
      return;
    }

    const container = document.getElementById("cardsContainer");
    const filtro = document.getElementById("filtroArea");

    async function carregarDados(filtroSelecionado = "todos") {
      const { data, error } = await supabase.from("inscricoes").select("*").order("id", { ascending: false });
      if (error) {
        console.error("Erro ao carregar dados:", error);
        return;
      }

      container.innerHTML = "";

      const filtrados =
        filtroSelecionado === "todos"
          ? data
          : data.filter(
              (d) => (d.area || "").toLowerCase() === filtroSelecionado
            );

      if (filtrados.length === 0) {
        container.innerHTML = "<p class='text-muted'>Nenhum registro.</p>";
        return;
      }

      filtrados.forEach((d) => {
        const div = document.createElement("div");
        div.className = "admin-card";
        div.innerHTML = `
          <h5 style="color:#4b5320">${escapeHtml(d.nome)}</h5>
          <p><b>Idade:</b> ${escapeHtml(d.idade)}</p>
          <p><b>ID:</b> ${escapeHtml(d.documento)}</p>
          <p><b>Tel:</b> ${escapeHtml(d.telefone)}</p>
          <p><b>Email:</b> ${escapeHtml(d.email)}</p>
          <p><b>Onde quer servir:</b> ${escapeHtml(d.area || "Não informado")}</p>
          <p><b>Motivo:</b> ${escapeHtml(d.motivo)} ${
          d.descricao ? " - " + escapeHtml(d.descricao) : ""
        }</p>
          <p style="font-size:12px;color:#666"><b>Enviado:</b> ${new Date(
            d.enviado_em
          ).toLocaleString()}</p>
        `;
        container.appendChild(div);
      });
    }

    carregarDados();

    if (filtro) {
      filtro.addEventListener("change", () => carregarDados(filtro.value));
    }

    // ------------------------------
    // REALTIME (atualização automática)
    // ------------------------------
    supabase
      .channel("inscricoes-change")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "inscricoes" },
        (payload) => {
          console.log("Mudança detectada:", payload);
          carregarDados(filtro ? filtro.value : "todos");
        }
      )
      .subscribe();

    // ------------------------------
    // EXPORTAR REGISTROS
    // ------------------------------
    const btnExcluir = document.getElementById("btnExcluir");
    if (btnExcluir) {
      btnExcluir.addEventListener("click", async () => {
        const { data, error } = await supabase.from("inscricoes").select("*");
        if (error || !data.length) {
          showAlert("Nenhum registro para exportar.");
          return;
        }

        const txt = data
          .map((d) => {
            return `Nome: ${d.nome || ""}
Idade: ${d.idade || ""}

ID: ${d.documento || ""}

Tel: ${d.telefone || ""}

Email: ${d.email || ""}

Onde quer servir: ${d.area || "Não informado"}

Motivo: ${d.motivo || ""}${d.descricao ? " - " + d.descricao : ""}

Enviado: ${new Date(d.enviado_em).toLocaleString()}

------------------------------`;
          })
          .join("\n\n");

        const blob = new Blob([txt], { type: "text/plain" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "backup_inscricoes_" + new Date().toISOString().slice(0, 10) + ".txt";
        a.click();

        await supabase.from("inscricoes").delete().neq("id", 0);
        showAlert("Registros exportados e excluídos com sucesso.");
        carregarDados();
      });
    }

    const btnVoltar = document.getElementById("btnVoltar");
    if (btnVoltar) {
      btnVoltar.addEventListener("click", () => {
        sessionStorage.removeItem("adminLogado");
        window.location.href = "index.html";
      });
    }
  }

  // ------------------------------
  // ESCAPE HTML
  // ------------------------------
  function escapeHtml(s) {
    return String(s || "").replace(/[&<>"']/g, (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      }[c])
    );
  }
});

// ------------------------------
// ALERTA BONITO
// ------------------------------
function showAlert(message) {
  const overlay = document.createElement("div");
  overlay.className = "custom-alert";

  const card = document.createElement("div");
  card.className = "custom-alert-card";

  const msg = document.createElement("p");
  msg.textContent = message;

  const btn = document.createElement("button");
  btn.className = "btn-outline-success";
  btn.textContent = "Fechar";
  btn.onclick = () => overlay.remove();

  card.appendChild(msg);
  card.appendChild(btn);
  overlay.appendChild(card);
  document.body.appendChild(overlay);
}
