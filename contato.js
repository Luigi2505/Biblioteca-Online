/**
 * Página Contato - Biblioteca Online
 * Funcionalidades do formulário de contato e interações
 */

// Elementos do DOM
const contactForm = document.getElementById("contactForm");
const submitBtn = document.getElementById("submitContactBtn");
const clearBtn = document.getElementById("clearContactBtn");

// Campos do formulário
const nameInput = document.getElementById("contactName");
const emailInput = document.getElementById("contactEmail");
const phoneInput = document.getElementById("contactPhone");
const subjectSelect = document.getElementById("contactSubject");
const messageTextarea = document.getElementById("contactMessage");
const newsletterCheckbox = document.getElementById("contactNewsletter");

// Mensagens de erro
const nameError = document.getElementById("nameError");
const emailError = document.getElementById("emailError");
const phoneError = document.getElementById("phoneError");
const subjectError = document.getElementById("subjectError");
const messageError = document.getElementById("messageError");

// Inicialização
document.addEventListener("DOMContentLoaded", () => {
  setupFormValidation();
  setupPhoneMask();
  setupFormSubmission();
  setupClearForm();
  setupSocialLinks();
});

/**
 * Configura validação do formulário
 */
function setupFormValidation() {
  // Validação em tempo real
  nameInput.addEventListener("blur", () => validateName());
  emailInput.addEventListener("blur", () => validateEmail());
  phoneInput.addEventListener("blur", () => validatePhone());
  subjectSelect.addEventListener("change", () => validateSubject());
  messageTextarea.addEventListener("blur", () => validateMessage());

  // Limpar erros ao digitar
  nameInput.addEventListener("input", () => clearError(nameError));
  emailInput.addEventListener("input", () => clearError(emailError));
  phoneInput.addEventListener("input", () => clearError(phoneError));
  messageTextarea.addEventListener("input", () => clearError(messageError));
}

/**
 * Validação do nome
 */
function validateName() {
  const name = nameInput.value.trim();
  if (name.length < 3) {
    showError(nameError, "O nome deve ter pelo menos 3 caracteres");
    return false;
  }
  clearError(nameError);
  return true;
}

/**
 * Validação do e-mail
 */
function validateEmail() {
  const email = emailInput.value.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email) {
    showError(emailError, "O e-mail é obrigatório");
    return false;
  }

  if (!emailRegex.test(email)) {
    showError(emailError, "Digite um e-mail válido");
    return false;
  }

  clearError(emailError);
  return true;
}

/**
 * Validação do telefone
 */
function validatePhone() {
  const phone = phoneInput.value.trim();
  if (phone && !/^(\(\d{2}\)\s?\d{4,5}-\d{4})$/.test(phone)) {
    showError(phoneError, "Digite um telefone válido");
    return false;
  }
  clearError(phoneError);
  return true;
}

/**
 * Validação do assunto
 */
function validateSubject() {
  const subject = subjectSelect.value;
  if (!subject) {
    showError(subjectError, "Selecione um assunto");
    return false;
  }
  clearError(subjectError);
  return true;
}

/**
 * Validação da mensagem
 */
function validateMessage() {
  const message = messageTextarea.value.trim();
  if (message.length < 10) {
    showError(messageError, "A mensagem deve ter pelo menos 10 caracteres");
    return false;
  }
  clearError(messageError);
  return true;
}

/**
 * Configura máscara de telefone
 */
function setupPhoneMask() {
  phoneInput.addEventListener("input", (e) => {
    let value = e.target.value.replace(/\D/g, "");

    if (value.length <= 2) {
      value = `(${value}`;
    } else if (value.length <= 7) {
      value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
    } else {
      value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(
        7,
        11
      )}`;
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

    // Validar todos os campos
    const isNameValid = validateName();
    const isEmailValid = validateEmail();
    const isPhoneValid = validatePhone();
    const isSubjectValid = validateSubject();
    const isMessageValid = validateMessage();

    if (
      !isNameValid ||
      !isEmailValid ||
      !isPhoneValid ||
      !isSubjectValid ||
      !isMessageValid
    ) {
      showMessage("Por favor, corrija os erros no formulário", "error");
      return;
    }

    // Desabilitar botão e mostrar loading
    submitBtn.disabled = true;
    submitBtn.innerHTML = "Enviando...";

    try {
      // Simular envio (em um projeto real, aqui seria uma chamada API)
      await simulateFormSubmission();

      // Mostrar mensagem de sucesso
      showMessage(
        "Mensagem enviada com sucesso! Entraremos em contato em breve.",
        "success"
      );

      // Limpar formulário
      clearFormFields();

      // Salvar no localStorage (simulação)
      saveContactData();
    } catch (error) {
      showMessage(
        "Erro ao enviar mensagem. Tente novamente mais tarde.",
        "error"
      );
    } finally {
      // Reabilitar botão
      submitBtn.disabled = false;
      submitBtn.innerHTML = "Enviar Mensagem";
    }
  });
}

/**
 * Simula envio do formulário
 */
function simulateFormSubmission() {
  return new Promise((resolve) => {
    setTimeout(resolve, 2000);
  });
}

/**
 * Salva dados do contato no localStorage
 */
function saveContactData() {
  const contactData = {
    name: nameInput.value.trim(),
    email: emailInput.value.trim(),
    phone: phoneInput.value.trim(),
    subject: subjectSelect.value,
    message: messageTextarea.value.trim(),
    newsletter: newsletterCheckbox.checked,
    timestamp: new Date().toISOString(),
  };

  // Salvar no localStorage
  let contacts = JSON.parse(localStorage.getItem("contacts") || "[]");
  contacts.push(contactData);
  localStorage.setItem("contacts", JSON.stringify(contacts));
}

/**
 * Configura botão de limpar formulário
 */
function setupClearForm() {
  clearBtn.addEventListener("click", () => {
    if (confirm("Tem certeza que deseja limpar todos os campos?")) {
      clearFormFields();
      showMessage("Formulário limpo com sucesso", "info");
    }
  });
}

/**
 * Limpa todos os campos do formulário
 */
function clearFormFields() {
  contactForm.reset();
  clearAllErrors();
}

/**
 * Abre mapa externo
 */
function openMap() {
  showMessage("Abrindo no Google Maps...", "info");
  // Em um projeto real, aqui abriria o endereço real
  setTimeout(() => {
    showMessage("Mapa simulado - em produção abriria o endereço real", "info");
  }, 1000);
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

  // Adicionar estilos
  messageDiv.style.cssText = `
        padding: 1rem;
        margin: 1rem 0;
        border-radius: 8px;
        font-weight: 500;
        animation: slideDown 0.3s ease-out;
    `;

  // Definir cores
  switch (type) {
    case "success":
      messageDiv.style.backgroundColor = "#10b981";
      messageDiv.style.color = "white";
      break;
    case "error":
      messageDiv.style.backgroundColor = "#ef4444";
      messageDiv.style.color = "white";
      break;
    case "info":
      messageDiv.style.backgroundColor = "#3b82f6";
      messageDiv.style.color = "white";
      break;
  }

  // Inserir após o formulário
  contactForm.insertAdjacentElement("afterend", messageDiv);

  // Remover após 5 segundos
  setTimeout(() => {
    messageDiv.remove();
  }, 5000);
}

/**
 * Mostra erro
 */
function showError(element, message) {
  element.textContent = message;
  element.style.display = "block";
  element.previousElementSibling.style.borderColor = "#ef4444";
}

/**
 * Limpa erro
 */
function clearError(element) {
  element.style.display = "none";
  element.previousElementSibling.style.borderColor = "";
}

/**
 * Limpa todos os erros
 */
function clearAllErrors() {
  const errors = document.querySelectorAll(".error-message");
  errors.forEach((error) => {
    error.style.display = "none";
    error.previousElementSibling.style.borderColor = "";
  });
}
