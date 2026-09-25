/* ═══════════════════════════════════════════════════
   UI INTERACTIONS
   Loader, cursor, scroll reveals, tilt,s magnetic, counters
   ═══════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ───── YEAR ───── */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ───── LOADER ───── */
  const loader = document.getElementById('loader');
  const loaderBar = document.getElementById('loaderBar');
  let progress = 0;

  const loaderInterval = setInterval(() => {
    progress += Math.random() * 18 + 6;
    if (progress >= 100) {
      progress = 100;
      clearInterval(loaderInterval);
      setTimeout(() => {
        loader.classList.add('done');
        document.body.style.overflow = '';
        // trigger initial reveals
        document.querySelectorAll('.hero .reveal').forEach((el) => el.classList.add('in'));
      }, 400);
    }
    loaderBar.style.width = progress + '%';
  }, 180);

  document.body.style.overflow = 'hidden';

  /* ───── CUSTOM CURSOR ───── */
  const cursor = document.getElementById('cursor');
  const cursorDot = document.getElementById('cursorDot');
  const cursorGlow = document.getElementById('cursorGlow');

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let cX = mouseX, cY = mouseY;
  let dX = mouseX, dY = mouseY;
  let gX = mouseX, gY = mouseY;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  }, { passive: true });

  function animateCursor() {
    cX += (mouseX - cX) * 0.18;
    cY += (mouseY - cY) * 0.18;
    dX += (mouseX - dX) * 0.55;
    dY += (mouseY - dY) * 0.55;
    gX += (mouseX - gX) * 0.08;
    gY += (mouseY - gY) * 0.08;

    if (cursor) cursor.style.transform = `translate(${cX}px, ${cY}px) translate(-50%, -50%)`;
    if (cursorDot) cursorDot.style.transform = `translate(${dX}px, ${dY}px) translate(-50%, -50%)`;
    if (cursorGlow) cursorGlow.style.transform = `translate(${gX}px, ${gY}px) translate(-50%, -50%)`;

    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  // hover state on interactive elements
  const hoverTargets = document.querySelectorAll('a, button, .card, .chip, .journey__chip, .panel, .award, .tl');
  hoverTargets.forEach((el) => {
    el.addEventListener('mouseenter', () => cursor && cursor.classList.add('hover'));
    el.addEventListener('mouseleave', () => cursor && cursor.classList.remove('hover'));
  });

  /* ───── NAV ───── */
  const nav = document.getElementById('nav');
  const burger = document.getElementById('burger');
  const navLinks = document.getElementById('navLinks');

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (nav) nav.classList.toggle('scrolled', y > 40);

    const docH = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docH > 0 ? (y / docH) * 100 : 0;
    const bar = document.getElementById('progress');
    if (bar) bar.style.width = pct + '%';
  }, { passive: true });

  if (burger && navLinks) {
    burger.addEventListener('click', () => {
      const open = navLinks.classList.toggle('open');
      burger.setAttribute('aria-expanded', open);
    });
    navLinks.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => {
        navLinks.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ───── SCROLL REVEAL ───── */
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
  );
  document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

  /* ───── COUNT UP ───── */
  const countIo = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseFloat(el.dataset.count);
        const suffix = el.dataset.suffix || '';
        const dur = 1600;
        const start = performance.now();

        function tick(now) {
          const p = Math.min((now - start) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          const val = Math.floor(target * eased);
          el.textContent = val + suffix;
          if (p < 1) requestAnimationFrame(tick);
          else el.textContent = target + suffix;
        }
        requestAnimationFrame(tick);
        countIo.unobserve(el);
      });
    },
    { threshold: 0.5 }
  );
  document.querySelectorAll('[data-count]').forEach((el) => countIo.observe(el));

  /* ───── 3D TILT + GLOW FOLLOW ───── */
  document.querySelectorAll('.tilt').forEach((el) => {
    const accent = el.dataset.accent || '#7c5cff';
    el.style.setProperty('--accent', accent);

    let raf = null;

    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const rx = ((y - cy) / cy) * -6;
      const ry = ((x - cx) / cx) * 6;

      el.style.setProperty('--mx', x + 'px');
      el.style.setProperty('--my', y + 'px');

      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-6px)`;
      });
    });

    el.addEventListener('mouseleave', () => {
      if (raf) cancelAnimationFrame(raf);
      el.style.transform = '';
    });
  });

  /* ───── MAGNETIC BUTTONS ───── */
  document.querySelectorAll('.magnetic').forEach((btn) => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });

  /* ───── COPY EMAIL ───── */
  const copyBtn = document.getElementById('copyEmail');
  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      const email = copyBtn.dataset.email;
      try {
        await navigator.clipboard.writeText(email);
        const original = copyBtn.textContent;
        copyBtn.textContent = '✓ Copied!';
        setTimeout(() => (copyBtn.textContent = original), 1600);
      } catch (err) {
        window.location.href = 'mailto:' + email;
      }
    });
  }

  /* ───── PARALLAX HERO SHAPES ───── */
  const shapes = document.querySelectorAll('.hero__bg-shapes .shape');
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    shapes.forEach((s, i) => {
      const speed = 0.05 + i * 0.03;
      s.style.transform = `translateY(${y * speed}px)`;
    });
  }, { passive: true });

  /* ───── ROLE ROTATION (hero) ───── */
  const roles = document.querySelectorAll('[data-role]');
  if (roles.length) {
    let idx = 0;
    setInterval(() => {
      roles.forEach((r) => r.classList.remove('active'));
      roles[idx].classList.add('active');
      idx = (idx + 1) % roles.length;
    }, 2200);
  }

})();