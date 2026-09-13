// ============ SETUP ============
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
document.getElementById('year').textContent = new Date().getFullYear();

// ============ NAV ============
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
navToggle.addEventListener('click', () => navLinks.classList.toggle('is-open'));
navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('is-open')));

// ============ FALLING -> UP LETTER ANIMATION ============
function buildWord(el, word, startIndex){
  let i = startIndex;
  [...word].forEach(ch => {
    const span = document.createElement('span');
    span.style.setProperty('--i', i);
    if(ch === ' '){
      span.className = 'fu-letter is-space';
      span.innerHTML = '&nbsp;';
    } else {
      span.className = 'fu-letter';
      span.textContent = ch;
    }
    if(!reduceMotion){
      span.style.animationDelay = (i * 65) + 'ms';
    } else {
      span.style.transform = 'none';
      span.style.opacity = '1';
    }
    el.appendChild(span);
    i++;
  });
  return i;
}

const lines = document.querySelectorAll('.fu-line');
let idx = 0;
lines.forEach(line => {
  idx = buildWord(line, line.dataset.word, idx);
});

if(!reduceMotion){
  // trigger the fall on next frame so initial (pre-fall) state paints first
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.querySelectorAll('.fu-letter').forEach(l => l.classList.add('fall'));
      const totalDelay = idx * 65 + 1600;
      setTimeout(() => {
        document.getElementById('fuWord').classList.add('is-settled');
      }, totalDelay);
    });
  });
} else {
  document.getElementById('fuWord').classList.add('is-settled');
}

// ============ CREW ROSTER ============
const crew = [
  "Aman", "Neo", "Vishnu", "Suresh Sunkee", "Om", "Divanshi",
  "Saamarth", "Abhimanyu", "Kislay Niraj", "Vaibhav Niraj",
  "Aditya Arjuna", "Kareem", "Manu", "Vaibhav"
];
const crewGrid = document.getElementById('crewGrid');
crew.forEach(name => {
  const li = document.createElement('li');
  li.textContent = name;
  crewGrid.appendChild(li);
});

// ============ PARTICLES (rising embers, matches the logo's falling dust) ============
const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');
let w, h, particles = [];

function resize(){
  w = canvas.width = window.innerWidth;
  h = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

function makeParticle(spawnAtBottom){
  return {
    x: Math.random() * w,
    y: spawnAtBottom ? h + Math.random() * 40 : Math.random() * h,
    r: Math.random() * 1.6 + 0.4,
    speed: Math.random() * 0.5 + 0.15,
    drift: Math.random() * 0.6 - 0.3,
    alpha: Math.random() * 0.5 + 0.15,
    hue: Math.random() > 0.25 ? '111,216,255' : '231,237,243'
  };
}

const count = window.innerWidth < 700 ? 26 : 55;
for(let i = 0; i < count; i++) particles.push(makeParticle(false));

function draw(){
  ctx.clearRect(0, 0, w, h);
  particles.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${p.hue},${p.alpha})`;
    ctx.shadowColor = `rgba(${p.hue},0.8)`;
    ctx.shadowBlur = 6;
    ctx.fill();

    p.y -= p.speed;
    p.x += p.drift * 0.3;

    if(p.y < -10){
      Object.assign(p, makeParticle(true));
    }
  });
}

if(!reduceMotion){
  (function loop(){
    draw();
    requestAnimationFrame(loop);
  })();
} else {
  draw();
}

// ============ CONTACT FORM (FormSubmit.co — no backend needed) ============
const cform = document.getElementById('cform');
const cformStatus = document.getElementById('cformStatus');
const CONTACT_EMAIL = 'fallingupstudios.in@gmail.com';

if(cform){
  cform.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = cform.querySelector('.cform__submit');
    const data = {
      name: cform.name.value.trim(),
      email: cform.email.value.trim(),
      message: cform.message.value.trim(),
      _subject: 'New message from Falling Up website'
    };

    submitBtn.disabled = true;
    cformStatus.textContent = 'Sending...';
    cformStatus.className = 'cform__status is-pending';

    try {
      const res = await fetch(`https://formsubmit.co/ajax/${CONTACT_EMAIL}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      if(res.ok && (result.success === 'true' || result.success === true)){
        cformStatus.textContent = "Sent! We'll get back to you soon.";
        cformStatus.className = 'cform__status is-success';
        cform.reset();
      } else {
        throw new Error('Send failed');
      }
    } catch(err){
      cformStatus.textContent = "Couldn't send right now — please email us directly instead.";
      cformStatus.className = 'cform__status is-error';
    } finally {
      submitBtn.disabled = false;
    }
  });
}
