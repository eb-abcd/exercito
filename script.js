// --- CONFIG SUPABASE ---
const SUPABASE_URL = "https://vwnzmmyoesrjqpthsstg.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3bnptbXlvZXNyanFwdGhzc3RnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5NTIyMTAsImV4cCI6MjA3NzUyODIxMH0.F6z3GoZbC-htwzOZSlOnwZUbVOSbgCSbeFE1qskQihw";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// --- DOM READY ---
document.addEventListener("DOMContentLoaded", async () => {
  const isAdmin = window.location.pathname.includes("admin");
  const statusTxt = document.getElementById("status");
  const cardsContainer = document.getElementById("cardsContainer");
  const form = document.querySelector("form");
  const btnVoltar = document.getElementById("btnVoltar");
  const btnExcluir = document.getElementById("btnExcluir");
  const filtroArea = document.getElementById("filtroArea");

  // ====== LOGIN / ENVIO DE INSCRIÇÃO ======
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const data = {
        nome: form.nome.value.trim(),
        idade: form.idade.value.trim(),
        documento: form.documento.value.trim(),
        telefone: form.telefone.value.trim(),
        email: form.email.value.trim(),
        area: form.area.value,
        motivo: form.motivo.value.trim(),
        descricao: form.descricao.value.trim(),
        enviadoEm: new Date().toISOString(),
      };

      try {
        const { error } = await supabase.from("inscricoes").insert([data]);
        if (error) throw error;

        alert("✅ Inscrição enviada com sucesso!");
        form.reset();
      } catch (err) {
        alert("❌ Erro ao enviar: " + err.message);
      }
    });
  }

  // ====== ADMIN PAINEL ======
  if (isAdmin && statusTxt && cardsContainer) {
    async function carregarInscricoes() {
      try {
        statusTxt.textContent = "Carregando dados...";
        const { data, error } = await supabase.from("inscricoes").select("*").order("id", { ascending: false });

        if (error) throw error;
        if (!data || data.length === 0) {
          statusTxt.textContent = "Nenhuma inscrição encontrada.";
          return;
        }

        statusTxt.textContent = `Total: ${data.length} registros.`;
        cardsContainer.innerHTML = "";

        data.forEach((item) => {
          const card = document.createElement("div");
          card.className = "card";

          card.innerHTML = `
            <h3>${item.nome}</h3>
            <p><b>Idade:</b> ${item.idade}</p>
            <p><b>Documento:</b> ${item.documento}</p>
            <p><b>Telefone:</b> ${item.telefone}</p>
            <p><b>Email:</b> ${item.email}</p>
            <p><b>Área:</b> ${item.area}</p>
            <p><b>Motivo:</b> ${item.motivo}</p>
            <p><b>Descrição:</b> ${item.descricao}</p>
            <p><small>${new Date(item.enviadoEm).toLocaleString()}</small></p>
          `;
          cardsContainer.appendChild(card);
        });
      } catch (err) {
        statusTxt.textContent = "Erro ao carregar: " + err.message;
      }
    }

    // Atualização em tempo real
    const canal = supabase
      .channel("tabela-inscricoes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "inscricoes" },
        (payload) => {
          console.log("Atualização detectada:", payload);
          carregarInscricoes();
        }
      )
      .subscribe();

    // Carregar inicial
    await carregarInscricoes();

    // Filtro por área
    filtroArea?.addEventListener("change", async () => {
      const valor = filtroArea.value;
      let query = supabase.from("inscricoes").select("*");
      if (valor !== "todos") query = query.eq("area", valor);
      const { data } = await query;
      cardsContainer.innerHTML = "";
      data.forEach((item) => {
        const div = document.createElement("div");
        div.className = "card";
        div.innerHTML = `<h3>${item.nome}</h3><p>${item.area}</p>`;
        cardsContainer.appendChild(div);
      });
    });

    // Botões
    btnVoltar?.addEventListener("click", () => (window.location.href = "index.html"));
    btnExcluir?.addEventListener("click", async () => {
      if (confirm("Tem certeza que deseja excluir todas as inscrições?")) {
        await supabase.from("inscricoes").delete().neq("id", 0);
        alert("Registros excluídos!");
        await carregarInscricoes();
      }
    });
  }
});
