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
   4. THREE.JS FLOATING LINES BACKGROUND
   ========================================== */
const container = document.getElementById('canvas-container');
if (container && typeof THREE !== 'undefined') {
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    camera.position.z = 1;
    
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    container.appendChild(renderer.domElement);

    const vertexShader = `
    precision highp float;
    void main() {
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }`;

    const fragmentShader = `
    precision highp float;
    uniform float iTime;
    uniform vec3  iResolution;
    uniform float animationSpeed;
    uniform vec2 iMouse;
    uniform bool interactive;
    uniform float bendRadius;
    uniform float bendStrength;
    uniform float bendInfluence;

    const vec3 BLACK = vec3(0.0);
    const vec3 PINK  = vec3(233.0, 71.0, 245.0) / 255.0;
    const vec3 BLUE  = vec3(47.0,  75.0, 162.0) / 255.0;

    mat2 rotate(float r) {
      return mat2(cos(r), sin(r), -sin(r), cos(r));
    }

    vec3 background_color(vec2 uv) {
      vec3 col = vec3(0.0);
      float y = sin(uv.x - 0.2) * 0.3 - 0.1;
      float m = uv.y - y;
      col += mix(BLUE, BLACK, smoothstep(0.0, 1.0, abs(m)));
      col += mix(PINK, BLACK, smoothstep(0.0, 1.0, abs(m - 0.8)));
      return col * 0.5;
    }

    float wave(vec2 uv, float offset, vec2 screenUv, vec2 mouseUv, bool shouldBend) {
      float time = iTime * animationSpeed;
      float x_offset   = offset;
      float x_movement = time * 0.1;
      float amp        = sin(offset + time * 0.2) * 0.3;
      float y          = sin(uv.x + x_offset + x_movement) * amp;

      if (shouldBend) {
        vec2 d = screenUv - mouseUv;
        float influence = exp(-dot(d, d) * bendRadius);
        float bendOffset = (mouseUv.y - screenUv.y) * influence * bendStrength * bendInfluence;
        y += bendOffset;
      }
      float m = uv.y - y;
      return 0.0175 / max(abs(m) + 0.01, 1e-3) + 0.01;
    }

    void mainImage(out vec4 fragColor, in vec2 fragCoord) {
      vec2 baseUv = (2.0 * fragCoord - iResolution.xy) / iResolution.y;
      baseUv.y *= -1.0;
      
      vec3 col = vec3(0.0);
      vec3 b = background_color(baseUv);

      vec2 mouseUv = vec2(0.0);
      if (interactive) {
        mouseUv = (2.0 * iMouse - iResolution.xy) / iResolution.y;
        mouseUv.y *= -1.0;
      }
      
      // Top Lines
      for (int i = 0; i < 6; ++i) {
        float fi = float(i);
        float t = fi / 5.0;
        float angle = -0.4 * log(length(baseUv) + 1.0);
        vec2 ruv = baseUv * rotate(angle);
        ruv.x *= -1.0;
        col += b * wave(ruv + vec2(0.01 * fi + 10.0, 0.5), 1.0 + 0.2 * fi, baseUv, mouseUv, interactive) * 0.1;
      }

      // Middle Lines
      for (int i = 0; i < 6; ++i) {
        float fi = float(i);
        float t = fi / 5.0;
        float angle = 0.2 * log(length(baseUv) + 1.0);
        vec2 ruv = baseUv * rotate(angle);
        col += b * wave(ruv + vec2(0.01 * fi + 5.0, 0.0), 2.0 + 0.15 * fi, baseUv, mouseUv, interactive);
      }

      // Bottom Lines
      for (int i = 0; i < 6; ++i) {
        float fi = float(i);
        float t = fi / 5.0;
        float angle = 0.4 * log(length(baseUv) + 1.0);
        vec2 ruv = baseUv * rotate(angle);
        col += b * wave(ruv + vec2(0.01 * fi + 2.0, -0.7), 1.5 + 0.2 * fi, baseUv, mouseUv, interactive) * 0.2;
      }

      fragColor = vec4(col, 1.0);
    }

    void main() {
      vec4 color = vec4(0.0);
      mainImage(color, gl_FragCoord.xy);
      gl_FragColor = color;
    }`;

    const uniforms = {
        iTime: { value: 0 },
        iResolution: { value: new THREE.Vector3(1, 1, 1) },
        animationSpeed: { value: 1.0 },
        iMouse: { value: new THREE.Vector2(-1000, -1000) },
        interactive: { value: true },
        bendRadius: { value: 5.0 },
        bendStrength: { value: -0.5 },
        bendInfluence: { value: 0 }
    };

    const material = new THREE.ShaderMaterial({ uniforms, vertexShader, fragmentShader });
    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const clock = new THREE.Clock();
    let targetMouse = new THREE.Vector2(-1000, -1000);
    let currentMouse = new THREE.Vector2(-1000, -1000);
    let targetInfluence = 0;
    let currentInfluence = 0;

    function resizeThree() {
        const width = container.clientWidth || 1;
        const height = container.clientHeight || 1;
        renderer.setSize(width, height, false);
        uniforms.iResolution.value.set(renderer.domElement.width, renderer.domElement.height, 1);
    }
    window.addEventListener('resize', resizeThree);
    resizeThree();

    renderer.domElement.addEventListener('pointermove', e => {
        const rect = renderer.domElement.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const dpr = renderer.getPixelRatio();
        targetMouse.set(x * dpr, (rect.height - y) * dpr);
        targetInfluence = 1.0;
    });

    renderer.domElement.addEventListener('pointerleave', () => targetInfluence = 0.0);

    function animate() {
        uniforms.iTime.value = clock.getElapsedTime();
        currentMouse.lerp(targetMouse, 0.05);
        uniforms.iMouse.value.copy(currentMouse);
        currentInfluence += (targetInfluence - currentInfluence) * 0.05;
        uniforms.bendInfluence.value = currentInfluence;
        
        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    }
    animate();
}
