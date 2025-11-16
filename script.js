/**
 * Sistema de Gerenciamento de Biblioteca (Página Inicial)
 * Implementação de CRUD com Fetch API
 */

// --- ESTADO GLOBAL ---
// Armazena a lista de livros localmente
let books = [];
// Armazena o ID do livro que está sendo editado (null se for criação)
let editingBookId = null;

// --- ELEMENTOS DOM ---
// Objeto para guardar referências aos elementos HTML para fácil acesso
const elements = {
  bookForm: document.getElementById("bookForm"),
  bookId: document.getElementById("bookId"), // Campo 'hidden' para guardar o ID
  bookTitle: document.getElementById("bookTitle"),
  bookAuthor: document.getElementById("bookAuthor"),
  bookYear: document.getElementById("bookYear"),
  bookGenre: document.getElementById("bookGenre"),
  bookDescription: document.getElementById("bookDescription"),
  booksList: document.getElementById("booksList"),
  loadingMessage: document.getElementById("loadingMessage"),
  errorMessage: document.getElementById("errorMessage"),
  successMessage: document.getElementById("successMessage"),
  successText: document.getElementById("successText"),
  emptyState: document.getElementById("emptyState"),
  searchInput: document.getElementById("searchInput"),
  searchBtn: document.getElementById("searchBtn"),
  submitBtn: document.getElementById("submitBtn"),
  cancelBtn: document.getElementById("cancelBtn"),
  formTitle: document.getElementById("formTitle"),
  titleError: document.getElementById("titleError"),
  authorError: document.getElementById("authorError"),
};

// --- CONFIGURAÇÃO DA API ---
// URL base da API (usando JSONPlaceholder como mock)
const API_BASE_URL = "https://jsonplaceholder.typicode.com/posts";

// --- INICIALIZAÇÃO ---
// Espera o DOM carregar antes de executar qualquer script
document.addEventListener("DOMContentLoaded", () => {
  loadBooks(); // Carrega os livros da API
  setupEventListeners(); // Configura os "ouvintes" de eventos (cliques, envios)
});

/**
 * Configura todos os event listeners da página
 */
function setupEventListeners() {
  // Envio do formulário (para criar ou editar)
  elements.bookForm.addEventListener("submit", handleFormSubmit);

  // Funcionalidade de busca (em tempo real e no botão)
  elements.searchInput.addEventListener("input", handleSearch);
  elements.searchBtn.addEventListener("click", handleSearch);

  // Botão de cancelar edição
  elements.cancelBtn.addEventListener("click", resetForm);

  // Validação em tempo real (enquanto o usuário digita)
  elements.bookTitle.addEventListener("input", validateTitle);
  elements.bookAuthor.addEventListener("input", validateAuthor);
}

/**
 * Carrega (GET) os livros da API
 */
async function loadBooks() {
  showLoading(true);
  hideMessages();

  try {
    // Faz a requisição (GET por padrão)
    const response = await fetch(API_BASE_URL);

    // Se a resposta não for OK (ex: erro 404, 500), lança um erro
    if (!response.ok) {
      throw new Error("Erro ao carregar os livros");
    }

    const data = await response.json();

    // Transforma os dados da API (posts) para o nosso formato (livros)
    // Usamos .slice(0, 10) para pegar apenas os 10 primeiros
    books = data.slice(0, 10).map((item) => ({
      id: item.id,
      title: item.title,
      author: `Autor ${item.id}`, // Mock de dados de autor
      year: 2020 + (item.id % 4), // Mock de dados de ano
      genre: ["ficcao", "nao-ficcao", "biografia", "tecnico"][item.id % 4], // Mock de dados de gênero
      description: item.body,
    }));

    renderBooks(); // Atualiza a lista na tela
    showSuccess("Livros carregados com sucesso!");
  } catch (error) {
    console.error("Erro ao carregar livros:", error);
    showError("Erro ao carregar os livros. Tente novamente.");
  } finally {
    // Garante que o loading seja escondido, mesmo se der erro
    showLoading(false);
  }
}

/**
 * Renderiza (desenha) a lista de livros na tela
 * @param {Array} booksToRender - A lista de livros a ser renderizada (padrão: lista global)
 */
function renderBooks(booksToRender = books) {
  // Aplica o filtro de busca antes de renderizar
  const filteredBooks = filterBooks(booksToRender);

  // Verifica se a lista filtrada está vazia
  if (filteredBooks.length === 0) {
    elements.booksList.style.display = "none";
    elements.emptyState.style.display = "block"; // Mostra a mensagem de "vazio"
    return;
  }

  // Se houver livros, mostra a lista e esconde a mensagem de "vazio"
  elements.booksList.style.display = "grid";
  elements.emptyState.style.display = "none";

  // Gera o HTML para cada livro e junta tudo em uma string
  elements.booksList.innerHTML = filteredBooks
    .map((book) => createBookCard(book))
    .join("");
}

/**
 * Cria o HTML de um card de livro
 * @param {object} book - O objeto do livro
 * @returns {string} - A string HTML do card
 */
function createBookCard(book) {
  // Mapeia os valores internos (ex: 'ficcao') para texto legível
  const genreLabels = {
    ficcao: "Ficção",
    "nao-ficcao": "Não-ficção",
    biografia: "Biografia",
    tecnico: "Técnico",
    infantil: "Infantil",
    poesia: "Poesia",
  };

  // Retorna o template string do HTML do card
  return `
        <div class="book-card" data-book-id="${book.id}">
            <h4 class="book-title">${escapeHtml(book.title)}</h4>
            <p class="book-author">por ${escapeHtml(book.author)}</p>
            
            <div class="book-meta">
                <span class="book-meta-item">${book.year || "N/A"}</span>
                <span class="book-meta-item">${
                  genreLabels[book.genre] || "Não informado"
                }</span>
            </div>
            
            ${
              book.description // Renderização condicional da descrição
                ? `
                <p class="book-description">${escapeHtml(book.description)}</p>
            `
                : ""
            }
            
            <div class="book-actions">
                <button class="btn btn-warning" onclick="editBook(${book.id})">
                     Editar
                </button>
                <button class="btn btn-danger" onclick="deleteBook(${book.id})">
                     Excluir
                </button>
            </div>
        </div>
    `;
}

/**
 * Filtra a lista de livros baseada no campo de busca
 * @param {Array} booksList - A lista de livros para filtrar
 * @returns {Array} - A lista de livros filtrada
 */
function filterBooks(booksList) {
  const searchTerm = elements.searchInput.value.toLowerCase().trim();

  // Se a busca estiver vazia, retorna a lista completa
  if (!searchTerm) {
    return booksList;
  }

  // Filtra o array 'booksList'
  return booksList.filter(
    (book) =>
      book.title.toLowerCase().includes(searchTerm) ||
      book.author.toLowerCase().includes(searchTerm) ||
      (book.description && book.description.toLowerCase().includes(searchTerm))
  );
}

/**
 * Manipula o evento de "submit" do formulário (Criar ou Atualizar)
 */
async function handleFormSubmit(event) {
  event.preventDefault(); // Impede o recarregamento da página

  // Se a validação falhar, interrompe a função
  if (!validateForm()) {
    return;
  }

  // Pega os dados dos campos do formulário
  const formData = getFormData();

  // Se 'editingBookId' estiver definido, estamos editando
  if (editingBookId) {
    await updateBook(editingBookId, formData);
  } else {
    // Caso contrário, estamos criando
    await createBook(formData);
  }
}

/**
 * Valida o formulário inteiro
 * @returns {boolean} - True se o formulário for válido
 */
function validateForm() {
  const isTitleValid = validateTitle();
  const isAuthorValid = validateAuthor();
  return isTitleValid && isAuthorValid;
}

/**
 * Valida o campo de título
 * @returns {boolean} - True se o título for válido
 */
function validateTitle() {
  const title = elements.bookTitle.value.trim();
  if (title.length < 3) {
    elements.bookTitle.classList.add("error"); // Adiciona classe CSS de erro
    elements.titleError.classList.add("show"); // Mostra a mensagem de erro
    return false;
  }
  elements.bookTitle.classList.remove("error");
  elements.titleError.classList.remove("show");
  return true;
}

/**
 * Valida o campo de autor
 * @returns {boolean} - True se o autor for válido
 */
function validateAuthor() {
  const author = elements.bookAuthor.value.trim();
  if (!author) {
    elements.bookAuthor.classList.add("error");
    elements.authorError.classList.add("show");
    return false;
  }
  elements.bookAuthor.classList.remove("error");
  elements.authorError.classList.remove("show");
  return true;
}

/**
 * Coleta os dados do formulário e retorna um objeto
 * @returns {object} - Os dados do livro
 */
function getFormData() {
  return {
    title: elements.bookTitle.value.trim(),
    author: elements.bookAuthor.value.trim(),
    year: elements.bookYear.value ? parseInt(elements.bookYear.value) : null,
    genre: elements.bookGenre.value || "nao-ficcao",
    description: elements.bookDescription.value.trim(),
    userId: 1, // Dado mock para a API JSONPlaceholder
  };
}

/**
 * Cria (POST) um novo livro na API
 * @param {object} bookData - Dados do livro a ser criado
 */
async function createBook(bookData) {
  try {
    showLoading(true);

    // Simulação de POST (JSONPlaceholder sempre retorna sucesso)
    const response = await fetch(API_BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: bookData.title,
        body: bookData.description || "",
        userId: bookData.userId,
      }),
    });

    if (!response.ok) {
      throw new Error("Erro ao criar o livro");
    }

    const createdBook = await response.json(); // Dados retornados pela API

    // --- Atualização Otimista ---
    // Adicionamos o livro localmente SEM esperar a API.
    // Como a API não nos dá um ID real, usamos um ID temporário.
    const newBook = {
      ...bookData,
      id: Date.now(), // ID temporário
    };

    books.unshift(newBook); // Adiciona no início do array
    renderBooks(); // Re-renderiza a lista
    resetForm(); // Limpa o formulário
    showSuccess("Livro adicionado com sucesso!");
  } catch (error) {
    console.error("Erro ao criar livro:", error);
    showError("Erro ao adicionar o livro. Tente novamente.");
  } finally {
    showLoading(false);
  }
}

/**
 * Prepara o formulário para edição de um livro
 * @param {number} bookId - O ID do livro a ser editado
 */
function editBook(bookId) {
  // Encontra o livro no array 'books'
  const book = books.find((b) => b.id === bookId);

  if (!book) {
    showError("Livro não encontrado.");
    return;
  }

  // Preenche o formulário com os dados do livro
  elements.bookId.value = book.id;
  elements.bookTitle.value = book.title;
  elements.bookAuthor.value = book.author;
  elements.bookYear.value = book.year || "";
  elements.bookGenre.value = book.genre || "";
  elements.bookDescription.value = book.description || "";

  // Atualiza a UI para o "modo de edição"
  editingBookId = bookId;
  elements.formTitle.textContent = "Editar Livro";
  elements.submitBtn.textContent = "Atualizar Livro";
  elements.cancelBtn.style.display = "block"; // Mostra o botão "Cancelar"

  // Limpa erros de validação anteriores
  clearValidationErrors();
}

/**
 * Atualiza (PUT) um livro existente
 * @param {number} bookId - ID do livro a ser atualizado
 * @param {object} bookData - Novos dados do livro
 */
async function updateBook(bookId, bookData) {
  try {
    showLoading(true);

    // Simulação de PUT
    const response = await fetch(`${API_BASE_URL}/${bookId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: bookId,
        title: bookData.title,
        body: bookData.description || "",
        userId: bookData.userId,
      }),
    });

    if (!response.ok) {
      throw new Error("Erro ao atualizar o livro");
    }

    // --- Atualização Otimista ---
    // Encontra o índice do livro e o atualiza no array local
    const bookIndex = books.findIndex((b) => b.id === bookId);
    if (bookIndex !== -1) {
      books[bookIndex] = { ...books[bookIndex], ...bookData };
      renderBooks(); // Re-renderiza a lista
    }

    resetForm(); // Limpa o formulário
    showSuccess("Livro atualizado com sucesso!");
  } catch (error) {
    console.error("Erro ao atualizar livro:", error);
    showError("Erro ao atualizar o livro. Tente novamente.");
  } finally {
    showLoading(false);
  }
}

/**
 * Exclui (DELETE) um livro
 * @param {number} bookId - ID do livro a ser excluído
 */
async function deleteBook(bookId) {
  // Pede confirmação ao usuário
  if (!confirm("Tem certeza que deseja excluir este livro?")) {
    return;
  }

  try {
    showLoading(true);

    // Simulação de DELETE
    const response = await fetch(`${API_BASE_URL}/${bookId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Erro ao excluir o livro");
    }

    // --- Atualização Otimista ---
    // Filtra o array local, removendo o livro com o ID correspondente
    books = books.filter((b) => b.id !== bookId);
    renderBooks(); // Re-renderiza a lista
    showSuccess("Livro excluído com sucesso!");
  } catch (error) {
    console.error("Erro ao excluir livro:", error);
    showError("Erro ao excluir o livro. Tente novamente.");
  } finally {
    showLoading(false);
  }
}

/**
 * Manipula a busca (chamado pelo 'input' e 'click')
 */
function handleSearch() {
  renderBooks(); // Apenas re-renderiza, 'renderBooks' já aplica o filtro
}

/**
 * Reseta o formulário para o estado inicial (criação)
 */
function resetForm() {
  elements.bookForm.reset(); // Limpa os campos
  elements.bookId.value = "";
  editingBookId = null; // Sai do modo de edição
  elements.formTitle.textContent = "Adicionar Novo Livro";
  elements.submitBtn.textContent = "Adicionar Livro";
  elements.cancelBtn.style.display = "none"; // Esconde o botão "Cancelar"
  clearValidationErrors();
}

/**
 * Limpa as classes e mensagens de erro do formulário
 */
function clearValidationErrors() {
  elements.bookTitle.classList.remove("error");
  elements.bookAuthor.classList.remove("error");
  elements.titleError.classList.remove("show");
  elements.authorError.classList.remove("show");
}

/**
 * Mostra ou esconde a mensagem de loading
 * @param {boolean} show - True para mostrar, false para esconder
 */
function showLoading(show) {
  if (show) {
    elements.loadingMessage.style.display = "block";
    elements.bookForm.classList.add("loading"); // Desabilita o form
  } else {
    elements.loadingMessage.style.display = "none";
    elements.bookForm.classList.remove("loading");
  }
}

/**
 * Mostra uma mensagem de sucesso temporária
 * @param {string} message - A mensagem a ser exibida
 */
function showSuccess(message) {
  elements.successText.textContent = message;
  elements.successMessage.style.display = "block";
  elements.errorMessage.style.display = "none";

  // Esconde a mensagem após 3 segundos
  setTimeout(() => {
    elements.successMessage.style.display = "none";
  }, 3000);
}

/**
 * Mostra uma mensagem de erro temporária
 * @param {string} message - A mensagem a ser exibida
 */
function showError(message) {
  elements.errorMessage.innerHTML = `<p>${message}</p>`;
  elements.errorMessage.style.display = "block";
  elements.successMessage.style.display = "none";

  // Esconde a mensagem após 5 segundos
  setTimeout(() => {
    elements.errorMessage.style.display = "none";
  }, 5000);
}

/**
 * Esconde todas as mensagens de feedback
 */
function hideMessages() {
  elements.successMessage.style.display = "none";
  elements.errorMessage.style.display = "none";
}

/**
 * Escapa HTML para prevenir ataques XSS (Cross-Site Scripting)
 * @param {string} text - Texto a ser escapado
 * @returns {string} - Texto seguro para HTML
 */
function escapeHtml(text) {
  // Converte texto em uma entidade HTML segura
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
