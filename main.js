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
