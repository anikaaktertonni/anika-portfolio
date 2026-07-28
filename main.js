// Dark Mode Toggle Logic
const themeToggle = document.getElementById('themeToggle');
const htmlElement = document.documentElement;
const savedTheme = localStorage.getItem('portfolioTheme') || 'light';
htmlElement.setAttribute('data-theme', savedTheme);

themeToggle.addEventListener('click', () => {
    const currentTheme = htmlElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    htmlElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('portfolioTheme', newTheme);
});

// Scroll to Top Logic
const scrollTopBtn = document.getElementById('scrollTopBtn');
window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        scrollTopBtn.classList.add('show');
    } else {
        scrollTopBtn.classList.remove('show');
    }
});
scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Blur Text Animation Logic
document.querySelectorAll('.animate-title').forEach(title => {
    const text = title.innerText;
    title.innerHTML = '';
    text.split(' ').forEach((word, index) => {
        const span = document.createElement('span');
        span.innerText = word + ' ';
        span.className = 'blur-word';
        // Delay each word slightly for the cascading effect
        span.style.transitionDelay = `${index * 0.15}s`;
        title.appendChild(span);
    });
});

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.querySelectorAll('.blur-word').forEach(span => {
                span.classList.add('in-view');
            });
            // Unobserve after animating once so it stays visible
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

document.querySelectorAll('.animate-title').forEach(title => {
    observer.observe(title);
});
// 3D Tilt Effect for Experience Cards
const expCards = document.querySelectorAll('.exp-card');

expCards.forEach(card => {
    // When the mouse moves over the card, calculate the tilt
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left; 
        const y = e.clientY - rect.top;  
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        // Adjust the multiplier (10) to increase or decrease the tilt intensity
        const rotateX = ((y - centerY) / centerY) * -10; 
        const rotateY = ((x - centerX) / centerX) * 10;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.03) translateY(-10px)`;
    });
    
    // Reset the card smoothly when the mouse leaves
    card.addEventListener('mouseleave', () => {
        card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1) translateY(0)`;
        card.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.5s ease, border-color 0.3s ease';
    });
    
    // Remove the transition delay while moving so it snaps to the cursor instantly
    card.addEventListener('mouseenter', () => {
        card.style.transition = 'none'; 
    });
});
