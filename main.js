/* ==========================================
   1. DARK MODE & UI LOGIC
   ========================================== */
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

// Scroll to Top
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

// Active Navigation Link Highlighting
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (pageYOffset >= sectionTop - 100) {
            current = section.getAttribute('id');
        }
    });
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').includes(current)) {
            link.classList.add('active');
        }
    });
});

/* ==========================================
   2. TEXT BLUR & 3D CARD ANIMATIONS
   ========================================== */
document.querySelectorAll('.animate-title').forEach(title => {
    const text = title.innerText;
    title.innerHTML = '';
    text.split(' ').forEach((word, index) => {
        const span = document.createElement('span');
        span.innerText = word + ' ';
        span.className = 'blur-word';
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
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

document.querySelectorAll('.animate-title').forEach(title => observer.observe(title));

// 3D Tilt for Experience Cards
const expCards = document.querySelectorAll('.exp-card');
expCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left; 
        const y = e.clientY - rect.top;  
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -10; 
        const rotateY = ((x - centerX) / centerX) * 10;
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.03) translateY(-10px)`;
    });
    card.addEventListener('mouseleave', () => {
        card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1) translateY(0)`;
        card.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.5s ease, border-color 0.3s ease';
    });
    card.addEventListener('mouseenter', () => {
        card.style.transition = 'none'; 
    });
});

/* ==========================================
   3. CLICK SPARK EFFECT
   ========================================== */
const sparkCanvas = document.getElementById('spark-canvas');
const sparkCtx = sparkCanvas.getContext('2d');
let sparks = [];

function resizeSparkCanvas() {
    sparkCanvas.width = window.innerWidth;
    sparkCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeSparkCanvas);
resizeSparkCanvas();

function drawSparks(timestamp) {
    sparkCtx.clearRect(0, 0, sparkCanvas.width, sparkCanvas.height);
    const duration = 400;
    
    sparks = sparks.filter(spark => {
        const elapsed = timestamp - spark.startTime;
        if (elapsed >= duration) return false;
        
        const progress = elapsed / duration;
        const eased = progress * (2 - progress); // ease-out
        
        const distance = eased * 15;
        const lineLength = 10 * (1 - eased);
        
        const x1 = spark.x + distance * Math.cos(spark.angle);
        const y1 = spark.y + distance * Math.sin(spark.angle);
        const x2 = spark.x + (distance + lineLength) * Math.cos(spark.angle);
        const y2 = spark.y + (distance + lineLength) * Math.sin(spark.angle);
        
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        sparkCtx.strokeStyle = isDark ? '#E0A0A0' : '#D48C8C';
        sparkCtx.lineWidth = 2;
        sparkCtx.beginPath();
        sparkCtx.moveTo(x1, y1);
        sparkCtx.lineTo(x2, y2);
        sparkCtx.stroke();
        
        return true;
    });
    requestAnimationFrame(drawSparks);
}
requestAnimationFrame(drawSparks);

window.addEventListener('click', (e) => {
    // Prevent sparks when clicking standard links
    if (e.target.closest('a') || e.target.closest('button')) return;
    
    const x = e.clientX;
    const y = e.clientY;
    const now = performance.now();
    const sparkCount = 8;
    
    for (let i = 0; i < sparkCount; i++) {
        sparks.push({
            x, y,
            angle: (2 * Math.PI * i) / sparkCount,
            startTime: now
        });
    }
});

