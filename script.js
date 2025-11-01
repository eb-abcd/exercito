document.addEventListener('DOMContentLoaded', function () {
  // ------------------------------
  // LOGIN ADMIN POPUP
  // ------------------------------
  const btnEntrar = document.getElementById('btnEntrar');
  const popup = document.getElementById('loginPopup');
  const btnClose = document.getElementById('loginClose');
  const btnLoginConfirm = document.getElementById('loginConfirm');

  if (btnEntrar && popup) {
    btnEntrar.addEventListener('click', () => popup.classList.add('show'));
  }

  if (btnClose && popup) {
    btnClose.addEventListener('click', () => popup.classList.remove('show'));
  }

  if (btnLoginConfirm) {
    btnLoginConfirm.addEventListener('click', () => {
      const u = document.getElementById('adminUser').value || '';
      const p = document.getElementById('adminPass').value || '';

      if (u === 'Admin' && p === '1822br') {
        sessionStorage.setItem('adminLogado', 'true');
        popup.classList.remove('show');
        window.location.href = 'admin.html';
      } else {
        alert('Credenciais incorretas');
      }
    });
  }

  // ------------------------------
  // FAÇA PARTE ABRIR NOVA GUIA
  // ------------------------------
  const facaParteLink = document.querySelector('a[href="faca-parte.html"]');
  if (facaParteLink) {
    facaParteLink.addEventListener('click', (e) => {
      e.preventDefault();
      window.open('faca-parte.html', '_blank');
    });
  }

  // ------------------------------
  // FORMULÁRIO "FAÇA PARTE"
  // ------------------------------
  const form = document.getElementById('formInscricao');
  if (form) {
    const motivoSel = document.getElementById('motivo');
    const campoMotivo = document.getElementById('campoMotivo');
    const notif = document.getElementById('notifOverlay');
    const notifClose = document.getElementById('notifClose');
    const areaSel = document.getElementById('area');

    form.setAttribute('novalidate', 'true');

    motivoSel.addEventListener('change', () => {
      if (motivoSel.value === 'outros')
        campoMotivo.classList.remove('d-none');
      else
        campoMotivo.classList.add('d-none');
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      const data = {
        nome: document.getElementById('nome').value.trim(),
        idade: document.getElementById('idade').value.trim(),
        documento: document.getElementById('documento').value.trim(),
        telefone: document.getElementById('telefone').value.trim(),
        email: document.getElementById('email').value.trim(),
        area: areaSel ? areaSel.value : '',
        motivo: motivoSel.value,
        descricao: document.getElementById('descricao').value.trim(),
        enviadoEm: new Date().toISOString()
      };

      if (!data.nome || !data.documento || !data.email || !data.area) {
        const oldMsg = document.querySelector('.form-error');
        if (oldMsg) oldMsg.remove();

        const msg = document.createElement('div');
        msg.className = 'form-error';
        msg.textContent = 'Por favor, preencha todos os dados obrigatórios.';

        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.insertAdjacentElement('afterend', msg);

        setTimeout(() => msg.remove(), 3000);
        return;
      }

      const arr = JSON.parse(localStorage.getItem('inscricoes') || '[]');
      arr.push(data);
      localStorage.setItem('inscricoes', JSON.stringify(arr));

      if (notif) notif.classList.add('show');

      form.reset();
      campoMotivo.classList.add('d-none');
    });

    if (notifClose) {
      notifClose.addEventListener('click', () => {
        const notif = document.getElementById('notifOverlay');
        notif.classList.remove('show');
        setTimeout(() => {
          window.close();
        }, 400);
      });
    }
  }

  // ------------------------------
  // PÁGINA ADMIN
  // ------------------------------
  if (window.location.pathname.split('/').pop() === 'admin.html') {
    if (sessionStorage.getItem('adminLogado') !== 'true') {
      alert('Acesso restrito: faça login.');
      window.location.href = 'index.html';
      return;
    }

    const container = document.getElementById('cardsContainer');
    const filtro = document.getElementById('filtroArea');
    const dados = JSON.parse(localStorage.getItem('inscricoes') || '[]');

    function renderCards(filtroSelecionado = 'todos') {
      container.innerHTML = '';

      const filtrados =
        filtroSelecionado === 'todos'
          ? dados
          : dados.filter(
              (d) => (d.area || '').toLowerCase() === filtroSelecionado
            );

      if (filtrados.length === 0) {
        container.innerHTML = '<p class="text-muted">Nenhum registro.</p>';
        return;
      }

      filtrados.forEach((d) => {
        const div = document.createElement('div');
        div.className = 'admin-card';
        div.innerHTML = `
          <h5 style="color:#4b5320">${escapeHtml(d.nome)}</h5>
          <p><b>Idade:</b> ${escapeHtml(d.idade)}</p>
          <p><b>ID:</b> ${escapeHtml(d.documento)}</p>
          <p><b>Tel:</b> ${escapeHtml(d.telefone)}</p>
          <p><b>Email:</b> ${escapeHtml(d.email)}</p>
          <p><b>Onde quer servir:</b> ${escapeHtml(d.area || 'Não informado')}</p>
          <p><b>Motivo:</b> ${escapeHtml(d.motivo)} ${
          d.descricao ? ' - ' + escapeHtml(d.descricao) : ''
        }</p>
          <p style="font-size:12px;color:#666"><b>Enviado:</b> ${new Date(
            d.enviadoEm
          ).toLocaleString()}</p>
        `;
        container.appendChild(div);
      });
    }

    renderCards();

    if (filtro) {
      filtro.addEventListener('change', () => {
        renderCards(filtro.value);
      });
    }

    // ------------------------------
    // EXPORTAR E EXCLUIR REGISTROS
    // ------------------------------
    const btnExcluir = document.getElementById('btnExcluir');
    if (btnExcluir) {
      btnExcluir.addEventListener('click', () => {
        if (!confirm('Deseja exportar e excluir todos os registros?')) return;

        const all = JSON.parse(localStorage.getItem('inscricoes') || '[]');
        if (all.length === 0) {
          alert('Nenhum registro para exportar.');
          return;
        }

        const txt = all
          .map((d) => {
            return `Nome: ${d.nome || ''}
Idade: ${d.idade || ''}

ID: ${d.documento || ''}

Tel: ${d.telefone || ''}

Email: ${d.email || ''}

Onde quer servir: ${d.area || 'Não informado'}

Motivo: ${d.motivo || ''}${
              d.descricao ? ' - ' + d.descricao : ''
            }

Enviado: ${new Date(d.enviadoEm).toLocaleString()}

------------------------------
`;
          })
          .join('\n');

        const blob = new Blob([txt], { type: 'text/plain' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download =
          'backup_inscricoes_' + new Date().toISOString().slice(0, 10) + '.txt';
        document.body.appendChild(a);
        a.click();
        a.remove();

        localStorage.removeItem('inscricoes');
        alert('Registros exportados e excluídos com sucesso.');
        window.location.reload();
      });
    }

    const btnVoltar = document.getElementById('btnVoltar');
    if (btnVoltar) {
      btnVoltar.addEventListener('click', () => {
        sessionStorage.removeItem('adminLogado');
        window.location.href = 'index.html';
      });
    }
  }

  // ------------------------------
  // PROTEÇÃO HTML
  // ------------------------------
  function escapeHtml(s) {
    return String(s || '').replace(/[&<>"']/g, (c) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[c])
    );
  }
});

// ------------------------------
// CARROSSEL DE OPERAÇÕES
// ------------------------------
const carousel = document.querySelector('.carousel');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const dots = document.querySelectorAll('.carousel-indicators .dot');

if (carousel && prevBtn && nextBtn && dots.length > 0) {
  let currentPage = 0;
  const cardWidth = 325;
  const visibleCards = Math.floor(carousel.offsetWidth / cardWidth);
  const totalPages = Math.ceil(carousel.children.length / visibleCards);

  function updateCarousel() {
    const scrollPos = currentPage * cardWidth * visibleCards;
    carousel.scrollTo({ left: scrollPos, behavior: 'smooth' });
    dots.forEach((dot, i) => dot.classList.toggle('active', i === currentPage));
  }

  prevBtn.addEventListener('click', () => {
    currentPage = currentPage > 0 ? currentPage - 1 : totalPages - 1;
    updateCarousel();
  });

  nextBtn.addEventListener('click', () => {
    currentPage = currentPage < totalPages - 1 ? currentPage + 1 : 0;
    updateCarousel();
  });

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      currentPage = i;
      updateCarousel();
    });
  });
}

/* === Função de alerta bonito (substitui alert nativo) === */
function showAlert(message) {
  const overlay = document.createElement('div');
  overlay.className = 'custom-alert';

  const card = document.createElement('div');
  card.className = 'custom-alert-card';

  const msg = document.createElement('p');
  msg.textContent = message;

  const btn = document.createElement('button');
  btn.className = 'btn-outline-success';
  btn.textContent = 'Fechar';
  btn.onclick = () => overlay.remove();

  card.appendChild(msg);
  card.appendChild(btn);
  overlay.appendChild(card);
  document.body.appendChild(overlay);
}
