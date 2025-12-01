// script.js - Homepage interactive features

// Create floating particles
function createParticles() {
  const particlesContainer = document.getElementById('particles');
  const particleCount = 50;

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.classList.add('particle');
    
    // Random position
    particle.style.left = Math.random() * 100 + '%';
    particle.style.top = Math.random() * 100 + '%';
    
    // Random animation delay
    particle.style.animationDelay = Math.random() * 20 + 's';
    
    // Random animation duration
    particle.style.animationDuration = (15 + Math.random() * 10) + 's';
    
    particlesContainer.appendChild(particle);
  }
}

// Add hover effect sound (optional visual feedback)
function initializeCardInteractions() {
  const cards = document.querySelectorAll('.menu-card');
  
  cards.forEach(card => {
    // Add ripple effect on click
    card.addEventListener('click', function(e) {
      const ripple = document.createElement('div');
      ripple.classList.add('ripple');
      
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      ripple.style.left = x + 'px';
      ripple.style.top = y + 'px';
      
      card.appendChild(ripple);
      
      setTimeout(() => {
        ripple.remove();
      }, 600);
    });

    // Tilt effect on mouse move
    card.addEventListener('mousemove', function(e) {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = (y - centerY) / 20;
      const rotateY = (centerX - x) / 20;
      
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
    });
    
    card.addEventListener('mouseleave', function() {
      card.style.transform = '';
    });
  });
}

// Add ripple CSS dynamically
function addRippleStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .ripple {
      position: absolute;
      border-radius: 50%;
      background: rgba(102, 126, 234, 0.5);
      width: 20px;
      height: 20px;
      pointer-events: none;
      animation: ripple-animation 0.6s ease-out;
      transform: translate(-50%, -50%);
    }
    
    @keyframes ripple-animation {
      to {
        width: 300px;
        height: 300px;
        opacity: 0;
      }
    }
    
    .menu-card {
      transition: transform 0.3s ease;
    }
  `;
  document.head.appendChild(style);
}

// Intersection Observer for scroll animations
function initializeScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, {
    threshold: 0.1
  });

  const cards = document.querySelectorAll('.menu-card');
  cards.forEach(card => {
    observer.observe(card);
  });
}

// Add keyboard navigation
function initializeKeyboardNav() {
  const cards = document.querySelectorAll('.menu-card');
  let currentIndex = -1;

  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      currentIndex = (currentIndex + 1) % cards.length;
      cards[currentIndex].focus();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      currentIndex = currentIndex <= 0 ? cards.length - 1 : currentIndex - 1;
      cards[currentIndex].focus();
    } else if (e.key === 'Enter' && currentIndex >= 0) {
      cards[currentIndex].click();
    }
  });

  // Make cards focusable
  cards.forEach((card, index) => {
    card.setAttribute('tabindex', '0');
    card.addEventListener('focus', () => {
      currentIndex = index;
    });
  });
}

// Add loading animation
function initializeLoadingEffect() {
  document.body.style.opacity = '0';
  
  window.addEventListener('load', () => {
    setTimeout(() => {
      document.body.style.transition = 'opacity 0.5s ease';
      document.body.style.opacity = '1';
    }, 100);
  });
}

// Performance monitoring (optional)
function logPerformance() {
  if (window.performance) {
    window.addEventListener('load', () => {
      const perfData = window.performance.timing;
      const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
      console.log(`Page load time: ${pageLoadTime}ms`);
    });
  }
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  createParticles();
  addRippleStyles();
  initializeCardInteractions();
  initializeScrollAnimations();
  initializeKeyboardNav();
  initializeLoadingEffect();
  
  // Optional: log performance in development
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    logPerformance();
  }
});

// Add smooth scroll behavior
document.documentElement.style.scrollBehavior = 'smooth';

// Preload linked pages on hover (optional performance enhancement)
const cards = document.querySelectorAll('.menu-card');
cards.forEach(card => {
  card.addEventListener('mouseenter', function() {
    const link = this.getAttribute('href');
    if (link && !document.querySelector(`link[rel="prefetch"][href="${link}"]`)) {
      const prefetch = document.createElement('link');
      prefetch.rel = 'prefetch';
      prefetch.href = link;
      document.head.appendChild(prefetch);
    }
  });
});

// Add theme color meta tag for mobile browsers
const metaTheme = document.createElement('meta');
metaTheme.name = 'theme-color';
metaTheme.content = '#1a1a2e';
document.head.appendChild(metaTheme);