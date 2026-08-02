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

/* ==========================================
   4. SUBTLE CURSOR GRID BACKGROUND
   ========================================== */
(function() {
    const canvas = document.getElementById('cursor-grid-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Configuration for a very subtle, elegant effect
    const cellSize = 35;
    const color = '#D48C8C'; // Matches your primary pink
    const radius = 140;
    const holdTime = 400;
    const fadeDuration = 800;
    const lineWidth = 1.2;
    const maxOpacity = 0.25; // Kept low for subtlety
    const gridOpacity = 0.02; // Barely visible base grid
    const clickPulse = true;
    const pulseSpeed = 600;

    const hexToRgb = hex => {
        const h = hex.replace('#', '');
        const num = parseInt(h.slice(0, 6), 16);
        return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
    };
    
    const [cr, cg, cb] = hexToRgb(color);
    const easeSmooth = t => t * t * (3 - 2 * t);

    let w, h, cols, rows, offX, offY;
    let alphas = new Float32Array(0);
    let touched = new Float64Array(0);
    let pulses = [];
    let raf = 0;
    let running = false;
    let lastFrame = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    function rebuild() {
        w = window.innerWidth;
        h = window.innerHeight;
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        cols = Math.ceil(w / cellSize) + 1;
        rows = Math.ceil(h / cellSize) + 1;
        offX = (w - cols * cellSize) / 2;
        offY = (h - rows * cellSize) / 2;
        alphas = new Float32Array(cols * rows);
        touched = new Float64Array(cols * rows);
    }

    function cellCenter(i) {
        const cx = offX + (i % cols) * cellSize + cellSize / 2;
        const cy = offY + Math.floor(i / cols) * cellSize + cellSize / 2;
        return [cx, cy];
    }

    function energize(x, y, boost = 1) {
        const r = Math.max(radius, 1);
        const now = performance.now();
        const minCol = Math.max(0, Math.floor((x - r - offX) / cellSize));
        const maxCol = Math.min(cols - 1, Math.floor((x + r - offX) / cellSize));
        const minRow = Math.max(0, Math.floor((y - r - offY) / cellSize));
        const maxRow = Math.min(rows - 1, Math.floor((y + r - offY) / cellSize));

        for (let cRow = minRow; cRow <= maxRow; cRow++) {
            for (let cCol = minCol; cCol <= maxCol; cCol++) {
                const i = cRow * cols + cCol;
                const [cx, cy] = cellCenter(i);
                const dist = Math.hypot(cx - x, cy - y);
                if (dist > r) continue;
                const level = easeSmooth(1 - dist / r) * maxOpacity * boost;
                if (level > alphas[i]) {
                    alphas[i] = level;
                    touched[i] = now;
                } else if (level > 0) {
                    touched[i] = now;
                }
            }
        }
    }

    function draw(now) {
        const dt = Math.min(now - lastFrame, 50);
        lastFrame = now;
        ctx.clearRect(0, 0, w, h);

        // Draw faint static grid
        if (gridOpacity > 0) {
            ctx.strokeStyle = `rgba(${cr}, ${cg}, ${cb}, ${gridOpacity})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            for (let cCol = 0; cCol <= cols; cCol++) {
                const x = Math.round(offX + cCol * cellSize) + 0.5;
                ctx.moveTo(x, 0);
                ctx.lineTo(x, h);
            }
            for (let cRow = 0; cRow <= rows; cRow++) {
                const y = Math.round(offY + cRow * cellSize) + 0.5;
                ctx.moveTo(0, y);
                ctx.lineTo(w, y);
            }
            ctx.stroke();
        }

        // Handle click pulses
        for (let pi = pulses.length - 1; pi >= 0; pi--) {
            const pulse = pulses[pi];
            const age = (now - pulse.t0) / 1000;
            const ringR = age * pulseSpeed;
            if (ringR > Math.hypot(w, h)) {
                pulses.splice(pi, 1);
                continue;
            }
            const band = cellSize;
            const minCol = Math.max(0, Math.floor((pulse.x - ringR - band - offX) / cellSize));
            const maxCol = Math.min(cols - 1, Math.floor((pulse.x + ringR + band - offX) / cellSize));
            const minRow = Math.max(0, Math.floor((pulse.y - ringR - band - offY) / cellSize));
            const maxRow = Math.min(rows - 1, Math.floor((pulse.y + ringR + band - offY) / cellSize));

            for (let cRow = minRow; cRow <= maxRow; cRow++) {
                for (let cCol = minCol; cCol <= maxCol; cCol++) {
                    const i = cRow * cols + cCol;
                    const [cx, cy] = cellCenter(i);
                    const dist = Math.hypot(cx - pulse.x, cy - pulse.y);
                    if (Math.abs(dist - ringR) < band / 2 && maxOpacity > alphas[i]) {
                        alphas[i] = maxOpacity;
                        touched[i] = now;
                    }
                }
            }
        }

        let anyVisible = pulses.length > 0;
        const fadeStep = dt / Math.max(fadeDuration, 16);
        const half = cellSize / 2;

        // Draw active lit-up cells
        for (let i = 0; i < alphas.length; i++) {
            let a = alphas[i];
            if (a <= 0) continue;
            if (now - touched[i] > holdTime) {
                a = Math.max(0, a - fadeStep);
                alphas[i] = a;
                if (a <= 0) continue;
            }
            anyVisible = true;

            const [cx, cy] = cellCenter(i);
            const gradient = ctx.createRadialGradient(cx, cy, half * 0.1, cx, cy, cellSize);
            gradient.addColorStop(0, `rgba(${cr}, ${cg}, ${cb}, ${a})`);
            gradient.addColorStop(1, `rgba(${cr}, ${cg}, ${cb}, 0)`);

            const x = cx - half + 0.5;
            const y = cy - half + 0.5;
            const s = cellSize - 1;

            ctx.beginPath();
            ctx.rect(x, y, s, s);
            ctx.strokeStyle = gradient;
            ctx.lineWidth = lineWidth;
            ctx.stroke();
        }

        if (anyVisible || gridOpacity > 0) {
            raf = requestAnimationFrame(draw);
        } else {
            running = false;
            ctx.clearRect(0, 0, w, h);
        }
    }

    function wake() {
        if (running) return;
        running = true;
        lastFrame = performance.now();
        raf = requestAnimationFrame(draw);
    }

    window.addEventListener('resize', () => {
        rebuild();
        wake();
    });
    
    window.addEventListener('mousemove', (e) => {
        energize(e.clientX, e.clientY);
        wake();
    });

    window.addEventListener('click', (e) => {
        if (!clickPulse) return;
        pulses.push({ x: e.clientX, y: e.clientY, t0: performance.now() });
        wake();
    });

    // Initialize
    rebuild();
    wake();
})();
