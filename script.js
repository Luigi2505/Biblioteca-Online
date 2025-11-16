/**
 * Sistema de Gerenciamento de Biblioteca
 * Implementação de CRUD com Fetch API
 */

// Estado global da aplicação
let books = [];
let editingBookId = null;

// Elementos DOM
const elements = {
  bookForm: document.getElementById("bookForm"),
  bookId: document.getElementById("bookId"),
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

// Configuração da API
const API_BASE_URL = "https://jsonplaceholder.typicode.com/posts";

// Inicialização
document.addEventListener("DOMContentLoaded", () => {
  loadBooks();
  setupEventListeners();
});

/**
 * Configura os event listeners
 */
function setupEventListeners() {
  // Form submission
  elements.bookForm.addEventListener("submit", handleFormSubmit);

  // Search functionality
  elements.searchInput.addEventListener("input", handleSearch);
  elements.searchBtn.addEventListener("click", handleSearch);

  // Cancel button
  elements.cancelBtn.addEventListener("click", resetForm);

  // Real-time validation
  elements.bookTitle.addEventListener("input", validateTitle);
  elements.bookAuthor.addEventListener("input", validateAuthor);
}

/**
 * Carrega os livros da API
 */
async function loadBooks() {
  showLoading(true);
  hideMessages();

  try {
    const response = await fetch(API_BASE_URL);

    if (!response.ok) {
      throw new Error("Erro ao carregar os livros");
    }

    const data = await response.json();

    // Transformar dados da API para nosso formato de livro
    books = data.slice(0, 10).map((item) => ({
      id: item.id,
      title: item.title,
      author: `Autor ${item.id}`,
      year: 2020 + (item.id % 4),
      genre: ["ficcao", "nao-ficcao", "biografia", "tecnico"][item.id % 4],
      description: item.body,
    }));

    renderBooks();
    showSuccess("Livros carregados com sucesso!");
  } catch (error) {
    console.error("Erro ao carregar livros:", error);
    showError("Erro ao carregar os livros. Tente novamente.");
  } finally {
    showLoading(false);
  }
}

/**
 * Renderiza a lista de livros
 */
function renderBooks(booksToRender = books) {
  const filteredBooks = filterBooks(booksToRender);

  if (filteredBooks.length === 0) {
    elements.booksList.style.display = "none";
    elements.emptyState.style.display = "block";
    return;
  }

  elements.booksList.style.display = "grid";
  elements.emptyState.style.display = "none";

  elements.booksList.innerHTML = filteredBooks
    .map((book) => createBookCard(book))
    .join("");
}

/**
 * Cria o HTML de um card de livro
 */
function createBookCard(book) {
  const genreLabels = {
    ficcao: "Ficção",
    "nao-ficcao": "Não-ficção",
    biografia: "Biografia",
    tecnico: "Técnico",
    infantil: "Infantil",
    poesia: "Poesia",
  };

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
              book.description
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
 * Filtra livros baseado na busca
 */
function filterBooks(booksList) {
  const searchTerm = elements.searchInput.value.toLowerCase().trim();

  if (!searchTerm) {
    return booksList;
  }

  return booksList.filter(
    (book) =>
      book.title.toLowerCase().includes(searchTerm) ||
      book.author.toLowerCase().includes(searchTerm) ||
      (book.description && book.description.toLowerCase().includes(searchTerm))
  );
}

/**
 * Manipula o envio do formulário
 */
async function handleFormSubmit(event) {
  event.preventDefault();

  if (!validateForm()) {
    return;
  }

  const formData = getFormData();

  if (editingBookId) {
    await updateBook(editingBookId, formData);
  } else {
    await createBook(formData);
  }
}

/**
 * Valida o formulário
 */
function validateForm() {
  const isTitleValid = validateTitle();
  const isAuthorValid = validateAuthor();

  return isTitleValid && isAuthorValid;
}

/**
 * Valida o campo de título
 */
function validateTitle() {
  const title = elements.bookTitle.value.trim();

  if (title.length < 3) {
    elements.bookTitle.classList.add("error");
    elements.titleError.classList.add("show");
    return false;
  }

  elements.bookTitle.classList.remove("error");
  elements.titleError.classList.remove("show");
  return true;
}

/**
 * Valida o campo de autor
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
 * Obtém os dados do formulário
 */
function getFormData() {
  return {
    title: elements.bookTitle.value.trim(),
    author: elements.bookAuthor.value.trim(),
    year: elements.bookYear.value ? parseInt(elements.bookYear.value) : null,
    genre: elements.bookGenre.value || "nao-ficcao",
    description: elements.bookDescription.value.trim(),
    userId: 1,
  };
}

/**
 * Cria um novo livro
 */
async function createBook(bookData) {
  try {
    showLoading(true);

    // Simulação de POST para JSONPlaceholder
    const response = await fetch(API_BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: bookData.title,
        body: bookData.description || "",
        userId: bookData.userId,
      }),
    });

    if (!response.ok) {
      throw new Error("Erro ao criar o livro");
    }

    const createdBook = await response.json();

    // Atualização otimista - adiciona localmente
    const newBook = {
      ...bookData,
      id: Date.now(), // ID temporário baseado no timestamp
    };

    books.unshift(newBook);
    renderBooks();
    resetForm();
    showSuccess("Livro adicionado com sucesso!");
  } catch (error) {
    console.error("Erro ao criar livro:", error);
    showError("Erro ao adicionar o livro. Tente novamente.");
  } finally {
    showLoading(false);
  }
}

/**
 * Edita um livro
 */
function editBook(bookId) {
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

  // Atualiza a interface para modo de edição
  editingBookId = bookId;
  elements.formTitle.textContent = "Editar Livro";
  elements.submitBtn.textContent = "Atualizar Livro";
  elements.cancelBtn.style.display = "block";

  // Limpa mensagens de erro
  clearValidationErrors();
}

/**
 * Atualiza um livro existente
 */
async function updateBook(bookId, bookData) {
  try {
    showLoading(true);

    // Simulação de PUT para JSONPlaceholder
    const response = await fetch(`${API_BASE_URL}/${bookId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
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

    // Atualização otimista - atualiza localmente
    const bookIndex = books.findIndex((b) => b.id === bookId);
    if (bookIndex !== -1) {
      books[bookIndex] = { ...books[bookIndex], ...bookData };
      renderBooks();
    }

    resetForm();
    showSuccess("Livro atualizado com sucesso!");
  } catch (error) {
    console.error("Erro ao atualizar livro:", error);
    showError("Erro ao atualizar o livro. Tente novamente.");
  } finally {
    showLoading(false);
  }
}

/**
 * Exclui um livro
 */
async function deleteBook(bookId) {
  if (!confirm("Tem certeza que deseja excluir este livro?")) {
    return;
  }

  try {
    showLoading(true);

    // Simulação de DELETE para JSONPlaceholder
    const response = await fetch(`${API_BASE_URL}/${bookId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Erro ao excluir o livro");
    }

    // Atualização otimista - remove localmente
    books = books.filter((b) => b.id !== bookId);
    renderBooks();
    showSuccess("Livro excluído com sucesso!");
  } catch (error) {
    console.error("Erro ao excluir livro:", error);
    showError("Erro ao excluir o livro. Tente novamente.");
  } finally {
    showLoading(false);
  }
}

/**
 * Manipula a busca
 */
function handleSearch() {
  renderBooks();
}

/**
 * Reseta o formulário
 */
function resetForm() {
  elements.bookForm.reset();
  elements.bookId.value = "";
  editingBookId = null;
  elements.formTitle.textContent = "Adicionar Novo Livro";
  elements.submitBtn.textContent = "Adicionar Livro";
  elements.cancelBtn.style.display = "none";
  clearValidationErrors();
}

/**
 * Limpa mensagens de validação
 */
function clearValidationErrors() {
  elements.bookTitle.classList.remove("error");
  elements.bookAuthor.classList.remove("error");
  elements.titleError.classList.remove("show");
  elements.authorError.classList.remove("show");
}

/**
 * Mostra/esconde loading
 */
function showLoading(show) {
  if (show) {
    elements.loadingMessage.style.display = "block";
    elements.bookForm.classList.add("loading");
  } else {
    elements.loadingMessage.style.display = "none";
    elements.bookForm.classList.remove("loading");
  }
}

/**
 * Mostra mensagem de sucesso
 */
function showSuccess(message) {
  elements.successText.textContent = message;
  elements.successMessage.style.display = "block";
  elements.errorMessage.style.display = "none";

  setTimeout(() => {
    elements.successMessage.style.display = "none";
  }, 3000);
}

/**
 * Mostra mensagem de erro
 */
function showError(message) {
  elements.errorMessage.innerHTML = `<p>${message}</p>`;
  elements.errorMessage.style.display = "block";
  elements.successMessage.style.display = "none";

  setTimeout(() => {
    elements.errorMessage.style.display = "none";
  }, 5000);
}

/**
 * Esconde todas as mensagens
 */
function hideMessages() {
  elements.successMessage.style.display = "none";
  elements.errorMessage.style.display = "none";
}

/**
 * Escapa HTML para prevenir XSS
 */
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
