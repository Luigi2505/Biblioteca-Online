/**
 * Lógica da Página Sobre
 * Funcionalidade: Modal (pop-up) para membros da equipe.
 */

// 1. Espera o HTML carregar completamente antes de rodar o script
document.addEventListener("DOMContentLoaded", () => {
  // --- A. SELEÇÃO DOS ELEMENTOS ---

  // Seleciona todos os cards que, quando clicados, abrem o modal
  const teamMembers = document.querySelectorAll(".team-member");

  // Seleciona os elementos principais do modal (o pop-up)
  const modal = document.getElementById("teamModal");
  const closeModalBtn = document.getElementById("modalClose");

  // Seleciona os "destinos" dentro do modal onde o conteúdo vai
  const modalAvatar = document.getElementById("modalAvatar");
  const modalName = document.getElementById("modalName");
  const modalRole = document.getElementById("modalRole");
  const modalBio = document.getElementById("modalBio");
  const modalSocials = document.getElementById("modalSocials");

  // --- B. LÓGICA PARA ABRIR O MODAL ---

  // Para cada card de membro, adiciona um "ouvinte de clique"
  teamMembers.forEach((memberCard) => {
    memberCard.addEventListener("click", () => {
      // 1. Obtém os dados do card que foi clicado
      // O 'dataset' lê os atributos 'data-*' que você colocou no HTML
      const name = memberCard.dataset.name;
      const role = memberCard.dataset.role;
      const avatar = memberCard.dataset.avatar;
      const bioLong = memberCard.dataset.bioLong;
      const linkedin = memberCard.dataset.linkedin;
      const instagram = memberCard.dataset.instagram;
      // Adicione mais (ex: data-github) se precisar

      // 2. Preenche o modal com os dados que pegamos
      modalName.textContent = name;
      modalRole.textContent = role;
      modalAvatar.textContent = avatar;
      modalBio.textContent = bioLong;

      // 3. Lógica para os links sociais
      // Primeiro, limpa o container (para não acumular links de cliques anteriores)
      modalSocials.innerHTML = "";

      // Verifica se o link do LinkedIn existe
      if (linkedin) {
        // Cria um link (<a>)
        const linkElement = document.createElement("a");
        linkElement.href = linkedin;
        linkElement.textContent = "LinkedIn"; // Você pode trocar por um ícone
        linkElement.target = "_blank"; // Para abrir em nova aba
        linkElement.rel = "noopener noreferrer"; // Boa prática de segurança
        // Adiciona o link ao 'modalSocials'
        modalSocials.appendChild(linkElement);
      }

      // Verifica se o link do Twitter existe
      if (instagram) {
        const linkElement = document.createElement("a");
        linkElement.href = instagram;
        linkElement.textContent = "Instagram";
        linkElement.target = "_blank";
        linkElement.rel = "noopener noreferrer";
        modalSocials.appendChild(linkElement);
      }

      // (Repita o 'if' acima para outros links como 'github')

      // 4. Finalmente, mostra o modal
      modal.classList.add("show");
    });
  });

  // --- C. LÓGICA PARA FECHAR O MODAL ---

  // 1. Cria uma função que esconde o modal
  function closeModal() {
    modal.classList.remove("show");
  }

  // 2. Fecha o modal ao clicar no botão 'X'
  closeModalBtn.addEventListener("click", closeModal);

  // 3. (Bônus) Fecha o modal ao clicar fora dele (no fundo escuro)
  modal.addEventListener("click", (event) => {
    // Verifica se o local clicado (event.target) é o próprio fundo (modal)
    // Se for, fecha o modal. Se for um filho (a caixa branca), não faz nada.
    if (event.target === modal) {
      closeModal();
    }
  });
});
