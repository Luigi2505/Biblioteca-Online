/**
 * Página Sobre - Biblioteca Online
 * Funcionalidades interativas e animações
 */

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    setupScrollAnimations();
    setupCounterAnimation();
    setupTeamInteractions();
});

/**
 * Configura animações de scroll
 */
function setupScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);

    // Observar elementos para animação
    const animatedElements = document.querySelectorAll(
        '.about-intro, .mission-card, .feature-item, .team-member, .stat-card'
    );
    
    animatedElements.forEach(element => {
        observer.observe(element);
    });
}

/**
 * Configura animação de contadores
 */
function setupCounterAnimation() {
    const counters = document.querySelectorAll('.stat-number');
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
                animateCounter(entry.target);
                entry.target.classList.add('counted');
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => {
        counterObserver.observe(counter);
    });
}

/**
 * Anima um contador
 */
function animateCounter(element) {
    const target = element.textContent;
    const hasPlus = target.includes('+');
    const hasPercent = target.includes('%');
    const numericValue = parseInt(target.replace(/\D/g, ''));
    
    let current = 0;
    const increment = numericValue / 50;
    const timer = setInterval(() => {
        current += increment;
        if (current >= numericValue) {
            current = numericValue;
            clearInterval(timer);
        }
        
        let displayValue = Math.floor(current);
        if (hasPlus) displayValue += '+';
        if (hasPercent) displayValue += '%';
        
        element.textContent = displayValue;
    }, 30);
}

/**
 * Configura interações com a equipe
 */
function setupTeamInteractions() {
    const teamMembers = document.querySelectorAll('.team-member');
    
    teamMembers.forEach(member => {
        member.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px)';
        });
        
        member.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
}

/**
 * Adiciona classes CSS para animações
 */
const style = document.createElement('style');
style.textContent = `
    .about-intro,
    .mission-card,
    .feature-item,
    .team-member,
    .stat-card {
        opacity: 0;
        transform: translateY(30px);
        transition: all 0.6s ease-out;
    }
    
    .animate-in {
        opacity: 1;
        transform: translateY(0);
    }
    
    .mission-card:nth-child(1) { transition-delay: 0.1s; }
    .mission-card:nth-child(2) { transition-delay: 0.2s; }
    .mission-card:nth-child(3) { transition-delay: 0.3s; }
    
    .feature-item:nth-child(1) { transition-delay: 0.1s; }
    .feature-item:nth-child(2) { transition-delay: 0.2s; }
    .feature-item:nth-child(3) { transition-delay: 0.3s; }
    .feature-item:nth-child(4) { transition-delay: 0.4s; }
    .feature-item:nth-child(5) { transition-delay: 0.5s; }
    .feature-item:nth-child(6) { transition-delay: 0.6s; }
    
    .team-member:nth-child(1) { transition-delay: 0.1s; }
    .team-member:nth-child(2) { transition-delay: 0.2s; }
    .team-member:nth-child(3) { transition-delay: 0.3s; }
    .team-member:nth-child(4) { transition-delay: 0.4s; }
    
    .stat-card:nth-child(1) { transition-delay: 0.1s; }
    .stat-card:nth-child(2) { transition-delay: 0.2s; }
    .stat-card:nth-child(3) { transition-delay: 0.3s; }
    .stat-card:nth-child(4) { transition-delay: 0.4s; }
`;
document.head.appendChild(style);
