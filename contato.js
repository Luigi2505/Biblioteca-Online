/**
 * Página Contato - Biblioteca Online
 * Versão Simplificada
 */

// Elementos do DOM
const contactForm = document.getElementById("contactForm");
const clearBtn = document.getElementById("clearContactBtn");

// Inicialização
document.addEventListener("DOMContentLoaded", () => {
  setupPhoneMask();
  setupFormSubmission();
  setupClearForm();
});

/**
 * Configura máscara de telefone
 */
function setupPhoneMask() {
  const phoneInput = document.getElementById("contactPhone");
  
  phoneInput.addEventListener("input", (e) => {
    let value = e.target.value.replace(/\D/g, "");

    if (value.length <= 2) {
      value = `(${value}`;
    } else if (value.length <= 7) {
      value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
    } else {
      value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7, 11)}`;
    }

    e.target.value = value;
  });
}

/**
 * Configura envio do formulário
 */
function setupFormSubmission() {
  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Validar campos obrigatórios
    const name = document.getElementById("contactName").value.trim();
    const email = document.getElementById("contactEmail").value.trim();
    const subject = document.getElementById("contactSubject").value;
    const message = document.getElementById("contactMessage").value.trim();

    if (!name || !email || !subject || message.length < 10) {
      showMessage("Por favor, preencha todos os campos obrigatórios", "error");
      return;
    }

    // Validar e-mail
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showMessage("Digite um e-mail válido", "error");
      return;
    }

    // Desabilitar botão e mostrar loading
    const submitBtn = document.getElementById("submitContactBtn");
    submitBtn.disabled = true;
    submitBtn.innerHTML = "Enviando...";

    try {
      // Simular envio
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      showMessage("Mensagem enviada com sucesso! Entraremos em contato em breve.", "success");
      contactForm.reset();
      
    } catch (error) {
      showMessage("Erro ao enviar mensagem. Tente novamente.", "error");
    } finally {
      // Reabilitar botão
      submitBtn.disabled = false;
      submitBtn.innerHTML = "Enviar Mensagem";
    }
  });
}

/**
 * Configura botão de limpar formulário
 */
function setupClearForm() {
  clearBtn.addEventListener("click", () => {
    if (confirm("Tem certeza que deseja limpar todos os campos?")) {
      contactForm.reset();
      showMessage("Formulário limpo com sucesso", "info");
    }
  });
}

/**
 * Abre mapa externo da PUCPR
 */
function openMap() {
  window.open("https://www.google.com/maps/place/PUCPR", "_blank");
  showMessage("Abrindo localização da PUCPR no Google Maps...", "info");
}

/**
 * Mostra mensagem de feedback
 */
function showMessage(message, type = "info") {
  // Remover mensagens existentes
  const existingMessage = document.querySelector(".contact-message");
  if (existingMessage) {
    existingMessage.remove();
  }

  // Criar nova mensagem
  const messageDiv = document.createElement("div");
  messageDiv.className = `contact-message ${type}`;
  messageDiv.textContent = message;

  // Estilos básicos
  messageDiv.style.cssText = `
    padding: 1rem;
    margin: 1rem 0;
    border-radius: 8px;
    font-weight: 500;
    animation: slideDown 0.3s ease-out;
    background-color: ${type === "success" ? "#10b981" : type === "error" ? "#ef4444" : "#3b82f6"};
    color: white;
  `;

  // Inserir após o formulário
  contactForm.insertAdjacentElement("afterend", messageDiv);

  // Remover após 5 segundos
  setTimeout(() => {
    messageDiv.remove();
  }, 5000);
}

// Adicionar animação CSS
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