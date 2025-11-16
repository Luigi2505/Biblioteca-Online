/**
 * Página Contato - Biblioteca Online
 * Funções: Máscara de telefone, validação e envio simulado de formulário.
 */

// --- ELEMENTOS DO DOM ---
const contactForm = document.getElementById("contactForm");
const clearBtn = document.getElementById("clearContactBtn");

// --- INICIALIZAÇÃO ---
document.addEventListener("DOMContentLoaded", () => {
  setupPhoneMask(); // Configura a máscara de telefone
  setupFormSubmission(); // Configura o envio
  setupClearForm(); // Configura o botão de limpar
});

/**
 * Configura a máscara de telefone (ex: (41) 99999-9999)
 */
function setupPhoneMask() {
  const phoneInput = document.getElementById("contactPhone");

  // Ouve o evento 'input' (cada vez que o usuário digita algo)
  phoneInput.addEventListener("input", (e) => {
    // 1. Limpa tudo que não for dígito
    let value = e.target.value.replace(/\D/g, "");

    // 2. Aplica a formatação condicionalmente
    if (value.length <= 2) {
      // (XX
      value = `(${value}`;
    } else if (value.length <= 7) {
      // (XX) XXXXX
      value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
    } else {
      // (XX) XXXXX-XXXX
      value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(
        7,
        11
      )}`;
    }

    // 3. Atualiza o valor no campo
    e.target.value = value;
  });
}

/**
 * Configura o envio do formulário de contato
 */
function setupFormSubmission() {
  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault(); // Impede o envio padrão

    // --- 1. Validação ---
    const name = document.getElementById("contactName").value.trim();
    const email = document.getElementById("contactEmail").value.trim();
    const subject = document.getElementById("contactSubject").value;
    const message = document.getElementById("contactMessage").value.trim();

    // Validação de campos obrigatórios
    if (!name || !email || !subject || message.length < 10) {
      showMessage("Por favor, preencha todos os campos obrigatórios", "error");
      return; // Interrompe o envio
    }

    // Validação de formato de e-mail (Regex)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showMessage("Digite um e-mail válido", "error");
      return;
    }

    // --- 2. Feedback de Envio ---
    const submitBtn = document.getElementById("submitContactBtn");
    submitBtn.disabled = true;
    submitBtn.innerHTML = "Enviando..."; // Feedback visual

    try {
      // --- 3. Simulação de Envio (Requisição API) ---
      // Substitua isso por uma requisição 'fetch' real no futuro
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Espera 1.5s

      // Se a "API" responder com sucesso
      showMessage(
        "Mensagem enviada com sucesso! Entraremos em contato em breve.",
        "success"
      );
      contactForm.reset(); // Limpa o formulário
    } catch (error) {
      // Se a "API" der erro
      showMessage("Erro ao enviar mensagem. Tente novamente.", "error");
    } finally {
      // --- 4. Reabilitar o Botão ---
      // Executa sempre (sucesso ou erro)
      submitBtn.disabled = false;
      submitBtn.innerHTML = "Enviar Mensagem";
    }
  });
}

/**
 * Configura o botão de limpar formulário
 */
function setupClearForm() {
  clearBtn.addEventListener("click", () => {
    // Pede confirmação
    if (confirm("Tem certeza que deseja limpar todos os campos?")) {
      contactForm.reset();
      showMessage("Formulário limpo com sucesso", "info");
    }
  });
}

/**
 * Abre o mapa em uma nova aba
 * (Esta função é chamada pelo 'onclick' no HTML)
 */
function openMap() {
  window.open("https://www.google.com/maps/place/PUCPR", "_blank");
  showMessage("Abrindo localização da PUCPR no Google Maps...", "info");
}

/**
 * Mostra uma mensagem de feedback (sucesso, erro, info) na tela
 * @param {string} message - O texto da mensagem
 * @param {string} type - 'info', 'success', ou 'error'
 */
function showMessage(message, type = "info") {
  // Remove mensagens anteriores para não acumular
  const existingMessage = document.querySelector(".contact-message");
  if (existingMessage) {
    existingMessage.remove();
  }

  // Cria o elemento <div> da mensagem
  const messageDiv = document.createElement("div");
  messageDiv.className = `contact-message ${type}`; // Classe para CSS futuro
  messageDiv.textContent = message;

  // Estilos básicos aplicados via JS
  messageDiv.style.cssText = `
    padding: 1rem;
    margin: 1rem 0;
    border-radius: 8px;
    font-weight: 500;
    animation: slideDown 0.3s ease-out;
    background-color: ${
      type === "success" ? "#10b981" : type === "error" ? "#ef4444" : "#3b82f6"
    };
    color: white;
  `;

  // Insere a mensagem logo após o formulário
  contactForm.insertAdjacentElement("afterend", messageDiv);

  // Remove a mensagem automaticamente após 5 segundos
  setTimeout(() => {
    messageDiv.remove();
  }, 5000);
}

// --- Injeção de Estilo para Animação ---
// Adiciona a animação @keyframes 'slideDown' ao <head>
const style = document.createElement("style");
style.textContent = `
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;
document.head.appendChild(style);
