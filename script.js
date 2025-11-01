// ==========================
// === CONFIG SUPABASE ===
// ==========================
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://YOUR-PROJECT.supabase.co";
const SUPABASE_KEY = "YOUR-ANON-KEY";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ==========================
// === FORMULÁRIO ENVIO ===
// ==========================
const form = document.querySelector("#formulario");
if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
      nome: form.nome.value.trim(),
      idade: form.idade.value.trim(),
      cpf: form.cpf.value.trim(),
      telefone: form.telefone.value.trim(),
      area: form.area.value.trim(),
      motivo: form.motivo.value.trim(),
      observacao: form.observacao.value.trim(),
      created_at: new Date().toISOString(),
    };

    if (!data.nome || !data.idade || !data.cpf || !data.telefone) {
      showAlert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    const { error } = await supabase.from("formularios").insert([data]);
    if (error) {
      console.error(error);
      showAlert("Erro ao enviar formulário.");
    } else {
      showNotification("Formulário enviado com sucesso!");
      form.reset();
    }
  });
}

// ==========================
// === LOGIN ADMIN ===
// ==========================
const loginBtn = document.querySelector("#loginBtn");
const popup = document.querySelector("#loginPopup");
const popupForm = document.querySelector("#loginForm");
const adminPanel = document.querySelector("#adminPanel");

const ADMIN_USER = "admin";
const ADMIN_PASS = "12345"; // 🔐 defina sua senha real aqui

if (loginBtn) {
  loginBtn.addEventListener("click", () => popup.classList.add("show"));
}

if (popupForm) {
  popupForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const user = popupForm.querySelector("#user").value.trim();
    const pass = popupForm.querySelector("#password").value.trim();

    if (user === ADMIN_USER && pass === ADMIN_PASS) {
      localStorage.setItem("isAdmin", "true");
      popup.classList.remove("show");
      showNotification("Login realizado com sucesso!");
      loadAdminData();
    } else {
      showAlert("Usuário ou senha incorretos.");
    }
  });
}

// Impede acesso manual via localStorage
window.addEventListener("DOMContentLoaded", () => {
  const isAdmin = localStorage.getItem("isAdmin") === "true";
  if (adminPanel && isAdmin) {
    loadAdminData();
  } else if (adminPanel && !isAdmin) {
    adminPanel.innerHTML = `<div class="form-error">⚠️ Acesso negado. Faça login primeiro.</div>`;
  }
});

// ==========================
// === ADMIN PANEL ===
// ==========================
async function loadAdminData() {
  if (!adminPanel) return;
  const { data, error } = await supabase.from("formularios").select("*").order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    adminPanel.innerHTML = "<p>Erro ao carregar dados.</p>";
    return;
  }

  if (!data.length) {
    adminPanel.innerHTML = "<p>Nenhum formulário encontrado.</p>";
    return;
  }

  adminPanel.innerHTML = `
    <h3>📋 Formulários Recebidos</h3>
    <div class="cards-grid">
      ${data.map(item => `
        <div class="admin-card">
          <p><b>Nome:</b> ${item.nome}</p>
          <p><b>Idade:</b> ${item.idade}</p>
          <p><b>CPF:</b> ${item.cpf}</p>
          <p><b>Telefone:</b> ${item.telefone}</p>
          <p><b>Área:</b> ${item.area}</p>
          <p><b>Motivo:</b> ${item.motivo}</p>
          <p><b>Data:</b> ${new Date(item.created_at).toLocaleString()}</p>
          <button class="btn-outline-success delete-btn" data-id="${item.id}">Apagar</button>
        </div>
      `).join("")}
    </div>
  `;

  // Adiciona listeners de exclusão
  document.querySelectorAll(".delete-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;
      const confirmDel = confirm("Deseja realmente apagar este formulário?");
      if (!confirmDel) return;

      const { error } = await supabase.from("formularios").delete().eq("id", id);
      if (error) {
        showAlert("Erro ao apagar registro.");
      } else {
        showNotification("Registro apagado com sucesso!");
        loadAdminData();
      }
    });
  });
}

// ==========================
// === NOTIFICAÇÕES ===
// ==========================
function showNotification(msg) {
  let overlay = document.createElement("div");
  overlay.className = "notif-overlay show";
  overlay.innerHTML = `
    <div class="notif-card">
      <img src="https://cdn-icons-png.flaticon.com/512/845/845646.png" alt="check" />
      <h4>Sucesso!</h4>
      <p>${msg}</p>
      <button id="notifClose">Fechar</button>
    </div>
  `;
  document.body.appendChild(overlay);
  overlay.querySelector("#notifClose").addEventListener("click", () => overlay.remove());
}

function showAlert(msg) {
  let alert = document.createElement("div");
  alert.className = "custom-alert";
  alert.innerHTML = `
    <div class="custom-alert-card">
      <p>${msg}</p>
      <button class="btn-outline-success" id="alertClose">Fechar</button>
    </div>
  `;
  document.body.appendChild(alert);
  alert.querySelector("#alertClose").addEventListener("click", () => alert.remove());
}
