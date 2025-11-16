// --- ESTADO GLOBAL DO CATÁLOGO ---
let catalogBooks = []; // Lista original (master) vinda da API
let filteredBooks = []; // Lista filtrada (usada para renderização)
let currentPage = 1; // Página atual da paginação
let booksPerPage = 12; // Quantidade de livros por página
let currentGenre = "all"; // Filtro de gênero ativo
let currentSort = "title"; // Ordenação ativa

// --- ELEMENTOS DOM ---
// Objeto para guardar referências aos elementos do catálogo
const elements = {
  catalogBooks: document.getElementById("catalogBooks"),
  catalogLoading: document.getElementById("catalogLoading"),
  catalogError: document.getElementById("catalogError"),
  catalogEmpty: document.getElementById("catalogEmpty"),
  catalogSearch: document.getElementById("catalogSearch"),
  searchCatalogBtn: document.getElementById("searchCatalogBtn"),
  sortSelect: document.getElementById("sortSelect"),
  clearFilters: document.getElementById("clearFilters"),
  pagination: document.getElementById("pagination"),
  totalBooks: document.getElementById("totalBooks"),
  totalAuthors: document.getElementById("totalAuthors"),
  totalGenres: document.getElementById("totalGenres"),
};

// API (usando o mesmo mock)
const API_BASE_URL = "https://jsonplaceholder.typicode.com/posts";

// --- INICIALIZAÇÃO ---
document.addEventListener("DOMContentLoaded", () => {
  loadCatalogBooks(); // Carrega os livros
  setupCatalogEventListeners(); // Configura os filtros e botões
});

/**
 * Configura os event listeners da página de catálogo
 */
function setupCatalogEventListeners() {
  elements.catalogSearch.addEventListener("input", handleCatalogSearch);
  elements.searchCatalogBtn.addEventListener("click", handleCatalogSearch);

  elements.sortSelect.addEventListener("change", handleSort);

  // Adiciona 'click' para CADA botão de gênero
  document.querySelectorAll(".genre-filter").forEach((btn) => {
    btn.addEventListener("click", handleGenreFilter);
  });

  elements.clearFilters.addEventListener("click", clearAllFilters);
}

/**
 * Carrega (GET) os livros da API para o catálogo
 */
async function loadCatalogBooks() {
  showCatalogLoading(true);
  hideCatalogMessages();

  try {
    const response = await fetch(API_BASE_URL);
    if (!response.ok) {
      throw new Error("Erro ao carregar o catálogo");
    }
    const data = await response.json();

    // Mapeia os dados da API para o formato de catálogo (mock data)
    // Usamos 50 itens para ter paginação
    catalogBooks = data.slice(0, 50).map((item, index) => ({
      id: item.id,
      title: item.title,
      author: generateAuthor(index), // Helper para gerar nomes falsos
      year: 1990 + (index % 34),
      genre: [
        "ficcao",
        "nao-ficcao",
        "biografia",
        "tecnico",
        "infantil",
        "poesia",
      ][index % 6],
      description: item.body,
      rating: (3 + Math.random() * 2).toFixed(1), // Rating falso
      pages: 100 + Math.floor(Math.random() * 500), // Páginas falsas
    }));

    filteredBooks = [...catalogBooks]; // Inicialmente, a lista filtrada é igual à original
    updateStats(); // Atualiza os números (total de livros, etc.)
    renderCatalog(); // Renderiza a primeira página
  } catch (error) {
    console.error("Erro ao carregar catálogo:", error);
    showCatalogError("Erro ao carregar o catálogo. Tente novamente.");
  } finally {
    showCatalogLoading(false);
  }
}

/**
 * Helper para gerar nomes de autores (mock)
 * @param {number} index - O índice do livro
 * @returns {string} - Um nome de autor
 */
function generateAuthor(index) {
  const authors = [
    "Machado de Assis",
    "Clarice Lispector",
    "Jorge Amado",
    "Cecília Meireles",
    "Carlos Drummond de Andrade",
    "Manuel Bandeira",
    "Vinicius de Moraes",
    "José Saramago",
    "Gabriel García Márquez",
    "Pablo Neruda",
    "Julio Cortázar",
    "Mario Vargas Llosa",
    "Isabel Allende",
    "Stephen King",
    "J.K. Rowling",
    "George R.R. Martin",
    "Tolkien",
    "C.S. Lewis",
    "Umberto Eco",
    "Italo Calvino",
  ];
  return authors[index % authors.length]; // Usa o módulo (%) para repetir a lista
}

/**
 * Renderiza os cards de livros na página atual
 */
function renderCatalog() {
  // Calcula quais livros mostrar baseado na página atual
  const startIndex = (currentPage - 1) * booksPerPage;
  const endIndex = startIndex + booksPerPage;
  const booksToShow = filteredBooks.slice(startIndex, endIndex);

  // Mostra a mensagem de "vazio" se não houver livros
  if (filteredBooks.length === 0) {
    elements.catalogBooks.style.display = "none";
    elements.catalogEmpty.style.display = "block";
    elements.pagination.style.display = "none";
    return;
  }

  // Se houver livros, mostra a lista
  elements.catalogBooks.style.display = "grid";
  elements.catalogEmpty.style.display = "none";
  elements.pagination.style.display = "flex";

  // Gera o HTML e atualiza o DOM
  elements.catalogBooks.innerHTML = booksToShow
    .map((book) => createCatalogCard(book))
    .join("");

  // Atualiza os botões da paginação
  renderPagination();
}

/**
 * Cria o HTML de um card de livro do catálogo
 * @param {object} book - O objeto do livro
 * @returns {string} - A string HTML do card
 */
function createCatalogCard(book) {
  const genreLabels = {
    ficcao: "Ficção",
    "nao-ficcao": "Não-ficção",
    biografia: "Biografia",
    tecnico: "Técnico",
    infantil: "Infantil",
    poesia: "Poesia",
  };

  return `
        <div class="catalog-card">
            <div class="catalog-card-header">
                <h4 class="catalog-title">${escapeHtml(book.title)}</h4>
                <div class="catalog-rating">
                    ⭐ ${book.rating}
                </div>
            </div>
            <p class="catalog-author">por ${escapeHtml(book.author)}</p>
            <div class="catalog-meta">
                <span class="catalog-meta-item">${book.year}</span>
                <span class="catalog-meta-item">${book.pages} páginas</span>
                <span class="catalog-meta-item">${
                  genreLabels[book.genre]
                }</span>
            </div>
            <p class="catalog-description">${escapeHtml(
              book.description.substring(0, 150)
            )}...</p>
            <div class="catalog-actions">
                <button class="btn btn-primary btn-small" onclick="viewBookDetails(${
                  book.id
                })">
                    📖 Ver Detalhes
                </button>
                <button class="btn btn-secondary btn-small" onclick="reserveBook(${
                  book.id
                })">
                    📚 Reservar
                </button>
            </div>
        </div>
    `;
}

/**
 * Renderiza os controles de paginação (botões de página)
 */
function renderPagination() {
  const totalPages = Math.ceil(filteredBooks.length / booksPerPage);

  if (totalPages <= 1) {
    elements.pagination.style.display = "none"; // Esconde se só tiver 1 página
    return;
  }

  let paginationHTML = "";

  // Botão "Anterior"
  paginationHTML += `
        <button class="pagination-btn" ${currentPage === 1 ? "disabled" : ""} 
                onclick="changePage(${currentPage - 1})">
            ← Anterior
        </button>
    `;

  // Lógica para mostrar os números das páginas (ex: 1 ... 4 5 6 ... 10)
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 || // Sempre mostra a primeira
      i === totalPages || // Sempre mostra a última
      (i >= currentPage - 2 && i <= currentPage + 2) // Mostra as 2 Vizinhas
    ) {
      paginationHTML += `
                <button class="pagination-btn ${
                  i === currentPage ? "active" : ""
                }" 
                        onclick="changePage(${i})">
                    ${i}
                </button>
            `;
    } else if (i === currentPage - 3 || i === currentPage + 3) {
      paginationHTML += '<span class="pagination-dots">...</span>'; // Mostra "..."
    }
  }

  // Botão "Próximo"
  paginationHTML += `
        <button class="pagination-btn" ${
          currentPage === totalPages ? "disabled" : ""
        } 
                onclick="changePage(${currentPage + 1})">
            Próximo →
        </button>
    `;

  elements.pagination.innerHTML = paginationHTML;
}

/**
 * Manipula a busca (combina busca e filtro de gênero)
 */
function handleCatalogSearch() {
  const searchTerm = elements.catalogSearch.value.toLowerCase().trim();

  // Filtra a lista 'catalogBooks' (a original)
  filteredBooks = catalogBooks.filter((book) => {
    // Verifica se o texto da busca bate
    const matchesSearch =
      !searchTerm ||
      book.title.toLowerCase().includes(searchTerm) ||
      book.author.toLowerCase().includes(searchTerm) ||
      (book.description && book.description.toLowerCase().includes(searchTerm));

    // Verifica se o gênero bate
    const matchesGenre = currentGenre === "all" || book.genre === currentGenre;

    // Retorna true apenas se bater em ambos (ou nos que se aplicam)
    return matchesSearch && matchesGenre;
  });

  applySorting(); // Aplica a ordenação atual
  currentPage = 1; // Reseta para a página 1
  renderCatalog();
  updateStats();
}

/**
 * Manipula a mudança no <select> de ordenação
 */
function handleSort() {
  currentSort = elements.sortSelect.value;
  applySorting(); // Aplica a nova ordenação
  renderCatalog(); // Re-renderiza
}

/**
 * Aplica a ordenação na lista 'filteredBooks'
 */
function applySorting() {
  switch (currentSort) {
    case "title":
      // Ordenação alfabética
      filteredBooks.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case "author":
      filteredBooks.sort((a, b) => a.author.localeCompare(b.author));
      break;
    case "year":
      // Ordenação numérica (decrescente)
      filteredBooks.sort((a, b) => b.year - a.year);
      break;
    case "year-desc":
      // Ordenação numérica (crescente)
      filteredBooks.sort((a, b) => a.year - b.year);
      break;
  }
}

/**
 * Manipula o clique em um filtro de gênero
 */
function handleGenreFilter(event) {
  // Remove a classe 'active' de todos os botões
  document.querySelectorAll(".genre-filter").forEach((btn) => {
    btn.classList.remove("active");
  });
  // Adiciona 'active' apenas ao clicado
  event.target.classList.add("active");

  // Atualiza o estado
  currentGenre = event.target.dataset.genre;
  // Dispara a lógica de busca (que agora considera o novo gênero)
  handleCatalogSearch();
}

/**
 * Limpa todos os filtros e reseta a lista
 */
function clearAllFilters() {
  elements.catalogSearch.value = "";
  elements.sortSelect.value = "title";
  currentGenre = "all";
  currentSort = "title";

  // Reseta os botões de gênero
  document.querySelectorAll(".genre-filter").forEach((btn) => {
    btn.classList.remove("active");
  });
  document
    .querySelector('.genre-filter[data-genre="all"]')
    .classList.add("active");

  // Reseta a lista de livros e a página
  filteredBooks = [...catalogBooks];
  currentPage = 1;
  renderCatalog();
  updateStats();
}

/**
 * Muda a página da paginação
 * @param {number} page - O número da página para ir
 */
function changePage(page) {
  const totalPages = Math.ceil(filteredBooks.length / booksPerPage);
  // Impede ir para uma página inválida
  if (page < 1 || page > totalPages) {
    return;
  }
  currentPage = page;
  renderCatalog();
  // Rola a tela para o topo da lista de livros
  elements.catalogBooks.scrollIntoView({ behavior: "smooth", block: "start" });
}

/**
 * Atualiza as estatísticas (Total de Livros, Autores, Gêneros)
 */
function updateStats() {
  elements.totalBooks.textContent = filteredBooks.length;

  // Usa 'Set' para contar apenas valores únicos
  const uniqueAuthors = new Set(filteredBooks.map((book) => book.author));
  elements.totalAuthors.textContent = uniqueAuthors.size;

  const uniqueGenres = new Set(filteredBooks.map((book) => book.genre));
  elements.totalGenres.textContent = uniqueGenres.size;
}

/**
 * Placeholder para "Ver Detalhes" (atualmente mostra um alert)
 */
function viewBookDetails(bookId) {
  const book = catalogBooks.find((b) => b.id === bookId);
  if (book) {
    alert(
      `Detalhes do livro:\n\nTítulo: ${book.title}\nAutor: ${book.author}\nAno: ${book.year}\nGênero: ${book.genre}\nAvaliação: ${book.rating}⭐\nPáginas: ${book.pages}\n\nDescrição: ${book.description}`
    );
  }
}

/**
 * Placeholder para "Reservar" (atualmente mostra um alert)
 */
function reserveBook(bookId) {
  const book = catalogBooks.find((b) => b.id === bookId);
  if (book) {
    alert(
      `Livro "${book.title}" reservado com sucesso!\n\nVocê será notificado quando estiver disponível para retirada.`
    );
  }
}

// --- Funções Auxiliares de UI ---

function showCatalogLoading(show) {
  if (show) {
    elements.catalogLoading.style.display = "block";
    elements.catalogBooks.style.display = "none";
  } else {
    elements.catalogLoading.style.display = "none";
  }
}

function showCatalogError(message) {
  elements.catalogError.innerHTML = `<p>${message}</p>`;
  elements.catalogError.style.display = "block";
  elements.catalogBooks.style.display = "none";
}

function hideCatalogMessages() {
  elements.catalogError.style.display = "none";
  elements.catalogEmpty.style.display = "none";
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
