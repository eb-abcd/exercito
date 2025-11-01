// === SUPABASE CONFIGURAÇÃO ===
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://vwnzmmyoesrjqpthsstg.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3bnptbXlvZXNyanFwdGhzc3RnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5NTIyMTAsImV4cCI6MjA3NzUyODIxMH0.F6z3GoZbC-htwzOZSlOnwZUbVOSbgCSbeFE1qskQihw";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// === ELEMENTOS DO FORMULÁRIO ===
const form = document.getElementById("formInscricao");
const notifOverlay = document.getElementById("notifOverlay");
const notifClose = document.getElementById("notifClose");

// === ENVIO DO FORMULÁRIO ===
if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // coleta dos valores
    const nome = document.getElementById("nome").value.trim();
    const idade = document.getElementById("idade").value.trim();
    const documento = document.getElementById("documento").value.trim();
    const telefone = document.getElementById("telefone").value.trim();
    const email = document.getElementById("email").value.trim();
    const area = document.getElementById("area").value;
    const motivo = document.getElementById("motivo").value;
    const descricao = document.getElementById("descricao").value.trim();

    // validações básicas
    if (!nome || !idade || !documento || !telefone || !email || !area || !motivo) {
      showAlert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    try {
      // insere no Supabase
      const { data, error } = await supabase
        .from("inscricoes")
        .insert([{ nome, idade, documento, telefone, email, area, motivo, descricao }]);

      if (error) throw error;

      // sucesso visual
      form.reset();
      showNotification();

    } catch (err) {
      console.error("Erro ao enviar inscrição:", err);
      showAlert("Ocorreu um erro ao enviar sua inscrição. Tente novamente mais tarde.");
    }
  });
}

// === NOTIFICAÇÃO DE SUCESSO ===
function showNotification() {
  if (!notifOverlay) return;
  notifOverlay.classList.add("show");
  notifOverlay.removeAttribute("aria-hidden");
}

if (notifClose) {
  notifClose.addEventListener("click", () => {
    notifOverlay.classList.remove("show");
    notifOverlay.setAttribute("aria-hidden", "true");
  });
}

// === ALERTA BONITO ===
function showAlert(message) {
  const overlay = document.createElement("div");
  overlay.className = "custom-alert";

  const card = document.createElement("div");
  card.className = "custom-alert-card";
  card.innerHTML = `
    <p>${message}</p>
    <button class="btn-outline-success">OK</button>
  `;

  overlay.appendChild(card);
  document.body.appendChild(overlay);

  const button = card.querySelector("button");
  button.addEventListener("click", () => overlay.remove());
}

// === BOTÃO LOGIN (CASO EXISTA NO NAVBAR) ===
const btnEntrar = document.getElementById("btnEntrar");
if (btnEntrar) {
  btnEntrar.addEventListener("click", () => {
    window.location.href = "admin.html";
  });
}

// === ADMIN PANEL (caso o mesmo arquivo seja usado em admin.html) ===
const adminContainer = document.getElementById("adminContainer");
if (adminContainer) {
  carregarInscricoes();
}

async function carregarInscricoes() {
  try {
    const { data, error } = await supabase.from("inscricoes").select("*").order("id", { ascending: false });
    if (error) throw error;

    if (!data || data.length === 0) {
      adminContainer.innerHTML = "<p>Nenhuma inscrição encontrada.</p>";
      return;
    }

    adminContainer.innerHTML = `
      <div class="cards-grid">
        ${data.map(item => `
          <div class="admin-card">
            <h4>${item.nome}</h4>
            <p><b>Idade:</b> ${item.idade}</p>
            <p><b>Área:</b> ${item.area}</p>
            <p><b>Motivo:</b> ${item.motivo}</p>
            <p><b>Email:</b> ${item.email}</p>
            <p><b>Telefone:</b> ${item.telefone}</p>
            ${item.descricao ? `<p><b>Descrição:</b> ${item.descricao}</p>` : ""}
          </div>
        `).join("")}
      </div>
    `;
  } catch (err) {
    console.error("Erro ao carregar inscrições:", err);
    adminContainer.innerHTML = "<p>Erro ao carregar dados.</p>";
  }
}
