// ===============================
//  CONFIGURAÇÃO SUPABASE
// ===============================
const SUPABASE_URL = "https://vwnzmmyoesrjqpthsstg.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3bnptbXlvZXNyanFwdGhzc3RnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5NTIyMTAsImV4cCI6MjA3NzUyODIxMH0.F6z3GoZbC-htwzOZSlOnwZUbVOSbgCSbeFE1qskQihw";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ===============================
//  GERAL — EVENTOS GLOBAIS
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ script.js carregado com sucesso!");

  const isAdmin = window.location.pathname.includes("admin");
  const isForm = window.location.pathname.includes("faca-parte");

  // ---------- BOTÃO LOGIN ----------
  const btnEntrar = document.getElementById("btnEntrar");
  const loginPopup = document.getElementById("loginPopup");
  const loginClose = document.getElementById("loginClose");
  const loginConfirm = document.getElementById("loginConfirm");

  if (btnEntrar && loginPopup) {
    btnEntrar.addEventListener("click", () => loginPopup.removeAttribute("aria-hidden"));
  }

  if (loginClose) {
    loginClose.addEventListener("click", () => loginPopup.setAttribute("aria-hidden", "true"));
  }

  if (loginConfirm) {
    loginConfirm.addEventListener("click", () => {
      const user = document.getElementById("adminUser").value.trim();
      const pass = document.getElementById("adminPass").value.trim();

      if (user === "admin" && pass === "1234") {
        window.location.href = "admin.html";
      } else {
        alert("Usuário ou senha incorretos!");
      }
    });
  }

  // ===============================
  //  ENVIO DO FORMULÁRIO (FAÇA PARTE)
  // ===============================
  if (isForm) {
    const form = document.getElementById("formInscricao");
    const notifOverlay = document.getElementById("notifOverlay");
    const notifClose = document.getElementById("notifClose");
    const motivoSelect = document.getElementById("motivo");
    const campoMotivo = document.getElementById("campoMotivo");

    motivoSelect.addEventListener("change", () => {
      campoMotivo.classList.toggle("d-none", motivoSelect.value !== "outros");
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const dados = {
        nome: document.getElementById("nome").value,
        idade: document.getElementById("idade").value,
        documento: document.getElementById("documento").value,
        telefone: document.getElementById("telefone").value,
        email: document.getElementById("email").value,
        area: document.getElementById("area").value,
        motivo: document.getElementById("motivo").value,
        descricao: document.getElementById("descricao").value || "",
        criado_em: new Date().toISOString(),
      };

      const { error } = await supabase.from("inscricoes").insert([dados]);
      if (error) {
        console.error("❌ Erro ao enviar:", error);
        alert("Erro ao enviar: " + error.message);
      } else {
        notifOverlay.removeAttribute("aria-hidden");
      }
    });

    notifClose.addEventListener("click", () => {
      notifOverlay.setAttribute("aria-hidden", "true");
      form.reset();
    });
  }

  // ===============================
  //  ADMIN — LER DADOS
  // ===============================
  if (isAdmin) {
    const status = document.getElementById("status");
    const cardsContainer = document.getElementById("cardsContainer");
    const filtro = document.getElementById("filtroArea");
    const btnVoltar = document.getElementById("btnVoltar");

    if (btnVoltar) btnVoltar.addEventListener("click", () => (window.location.href = "index.html"));

    async function carregarInscricoes(filtroValor = "todos") {
      status.textContent = "Carregando dados...";
      let query = supabase.from("inscricoes").select("*").order("id", { ascending: false });
      if (filtroValor !== "todos") query = query.eq("area", filtroValor);

      const { data, error } = await query;

      if (error) {
        console.error("Erro ao buscar dados:", error);
        status.textContent = "❌ Erro ao carregar.";
        return;
      }

      cardsContainer.innerHTML = "";
      if (!data || data.length === 0) {
        status.textContent = "Nenhum registro encontrado.";
        return;
      }

      status.textContent = `Total: ${data.length}`;
      data.forEach((item) => {
        const card = document.createElement("div");
        card.classList.add("card");
        card.innerHTML = `
          <h3>${item.nome}</h3>
          <p><b>Idade:</b> ${item.idade}</p>
          <p><b>Área:</b> ${item.area}</p>
          <p><b>Email:</b> ${item.email}</p>
          <small>${new Date(item.criado_em).toLocaleString()}</small>
        `;
        cardsContainer.appendChild(card);
      });
    }

    filtro.addEventListener("change", () => carregarInscricoes(filtro.value));
    carregarInscricoes();
  }
});
