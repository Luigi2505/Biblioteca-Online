/**
 * Página Sobre - Biblioteca Online
 * Funcionalidades interativas e animações
 */

// Inicialização
document.addEventListener("DOMContentLoaded", () => {
  setupScrollAnimations();
  setupCounterAnimation();
  setupTeamInteractions();
});

/**
 * Configura interações com a equipe
 */
function setupTeamInteractions() {
  const teamMembers = document.querySelectorAll(".team-member");

  teamMembers.forEach((member) => {
    member.addEventListener("mouseenter", function () {
      this.style.transform = "translateY(-10px)";
    });

    member.addEventListener("mouseleave", function () {
      this.style.transform = "translateY(0)";
    });
  });
}
