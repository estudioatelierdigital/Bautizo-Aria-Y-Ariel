/*
  NOTA RÁPIDA DE EDICIÓN (script.js):
  - Datos principales del evento: modifica `EVENT_CONFIG` al inicio del archivo (`honoreesNames`, `whatsappNumber`, `eventStartIso`, `eventEndIso`, `audioSrc`, `locationSummary`, `eventTitle`, `eventDescription`).
  - Música de fondo: coloca el archivo MP3 ("BABY MINE - Lullaby from Dumbo | Piano Cover by Paul Hankinson") en `assets/audio/music.mp3` o cambia la ruta en `EVENT_CONFIG.audioSrc`.
  - Confirmación por WhatsApp: el número ya está configurado en `EVENT_CONFIG.whatsappNumber` (`5216471080679`).
  - Textos dinámicos y mensajes: ajusta `MESSAGES` en `EVENT_CONFIG` (cuenta regresiva, rascar para revelar, validación RSVP, compartir).
  - Galería: cuando agregues tus fotos en `assets/img/galeria-01.jpg` a `assets/img/galeria-05.jpg`, el script las detectará automáticamente y ocultará los textos de espacio reservado.
*/

/* ==========================================================================
   CONFIGURACIÓN CENTRALIZADA DE LA INVITACIÓN (BAUTIZO)
   ========================================================================== */
const EVENT_CONFIG = {
  honoreesNames: "Aria Leonor & Ariel Leobardo",
  whatsappNumber: "526471080679",
  eventStartIso: "2026-12-12T11:00:00-07:00", // Huatabampo, Sonora (UTC-7)
  eventEndIso: "2026-12-12T22:00:00-07:00",
  audioSrc: "assets/audio/music.mp3",
  locationSummary:
    "Iglesia Católica Cristo Rey (11:00 AM) & Mezquite Jardín de Eventos (5:00 PM), Huatabampo, Sonora.",
  eventTitle: "Bautizo de Aria Leonor & Ariel Leobardo",
  eventDescription:
    "Celebración del bautizo de Aria Leonor y Ariel Leobardo. Ceremonia religiosa 11:00 AM en Iglesia Católica Cristo Rey y recepción 5:00 PM en Mezquite Jardín de Eventos. Confirmar antes del 4 de diciembre.",

  messages: {
    musicPlay: "Música",
    musicPause: "Pausar",
    musicUnavailable: "Sin audio",
    copied: "Enlace copiado al portapapeles",
    shareUnavailable: "Copia la URL desde la barra del navegador",
    fullscreenUnsupported: "Pantalla completa no disponible en este dispositivo",
    scratchPrompt: "Desliza el dedo o el cursor para rascar",
    scratchProgress: "Descubierto: {pct}%",
    scratchDone: "¡Fecha descubierta!",
    countdownHappeningNow: "¡Hoy es el gran día! La celebración del bautizo está en marcha.",
    countdownFinished: "El bautizo de Aria Leonor y Ariel Leobardo ya se celebró. ¡Gracias por acompañarnos!",
    clabeCopied: "Dato copiado al portapapeles",
    nameRequired: "Por favor ingresa tu nombre completo.",
    openingWhatsapp: ""
  }
};

/* ==========================================================================
   ESTADO DE LA APLICACIÓN
   ========================================================================== */
const state = {
  isEnvelopeOpen: false,
  isPlayingAudio: false,
  audioAvailable: true,
  scratchRevealed: false,
  scratchPercent: 0,
  lightboxIndex: 0
};

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function msg(key, replacements = {}) {
  let str = EVENT_CONFIG.messages[key] !== undefined ? EVENT_CONFIG.messages[key] : key;
  Object.entries(replacements).forEach(([k, v]) => {
    str = str.replace(`{${k}}`, v);
  });
  return str;
}

/* ==========================================================================
   1. ANIMACIÓN TIPOGRÁFICA DE PORTADA
   ========================================================================== */
function animateHeroTypewriter(immediate = false) {
  const targets = Array.from(document.querySelectorAll("#hero [data-typewriter]"));
  if (!targets.length) return;

  let globalDelay = 80;

  targets.forEach((el) => {
    const text = el.textContent || "";
    el.textContent = "";
    const fragment = document.createDocumentFragment();
    const charSpans = [];

    Array.from(text).forEach((ch) => {
      if (ch === " ") {
        const space = document.createElement("span");
        space.className = "tw-space";
        space.innerHTML = "&nbsp;";
        space.setAttribute("aria-hidden", "true");
        fragment.appendChild(space);
      } else {
        const span = document.createElement("span");
        span.className = "tw-char";
        span.textContent = ch;
        fragment.appendChild(span);
        charSpans.push(span);
      }
    });

    el.appendChild(fragment);

    if (immediate || prefersReducedMotion) {
      charSpans.forEach((span) => span.classList.add("is-typed"));
      return;
    }

    charSpans.forEach((span) => {
      const delay = globalDelay;
      globalDelay += 36;
      window.setTimeout(() => {
        span.classList.add("is-typed");
      }, delay);
    });

    globalDelay += 110;
  });
}

/* ==========================================================================
   2. SOBRE INTERACTIVO DE APERTURA Y MÚSICA AMBIENTAL
   ========================================================================== */
function updateMusicButtonLabel() {
  const statusEl = document.getElementById("music-status-text");
  const btn = document.getElementById("floating-music-btn");
  if (!statusEl || !btn) return;

  if (!state.audioAvailable) {
    statusEl.textContent = msg("musicUnavailable");
    btn.setAttribute("aria-pressed", "false");
    btn.disabled = true;
    return;
  }

  btn.disabled = false;
  statusEl.textContent = state.isPlayingAudio ? msg("musicPause") : msg("musicPlay");
  btn.setAttribute("aria-pressed", String(state.isPlayingAudio));
}

async function toggleMusic(forcePlay = null) {
  const audio = document.getElementById("bg-music");
  if (!audio || !state.audioAvailable) return;

  const shouldPlay = forcePlay !== null ? forcePlay : !state.isPlayingAudio;

  if (shouldPlay) {
    try {
      await audio.play();
      state.isPlayingAudio = true;
    } catch {
      state.isPlayingAudio = false;
    }
  } else {
    audio.pause();
    state.isPlayingAudio = false;
  }
  updateMusicButtonLabel();
}

function initAudio() {
  const audio = document.getElementById("bg-music");
  const toggleBtn = document.getElementById("floating-music-btn");
  if (!audio) return;

  audio.src = EVENT_CONFIG.audioSrc;

  audio.addEventListener("error", () => {
    state.audioAvailable = false;
    state.isPlayingAudio = false;
    updateMusicButtonLabel();
  });

  audio.addEventListener("play", () => {
    state.isPlayingAudio = true;
    updateMusicButtonLabel();
  });

  audio.addEventListener("pause", () => {
    state.isPlayingAudio = false;
    updateMusicButtonLabel();
  });

  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => toggleMusic());
  }
}

function initEnvelope() {
  const overlay = document.getElementById("envelope-overlay");
  const openBtn = document.getElementById("open-envelope-btn");
  const main = document.getElementById("invitation-main");
  if (!overlay || !openBtn || !main) return;

  animateHeroTypewriter(true);

  openBtn.addEventListener("click", async () => {
    if (state.isEnvelopeOpen) return;
    state.isEnvelopeOpen = true;

    overlay.classList.add("is-opening");
    main.classList.remove("is-locked");
    main.classList.add("is-unlocked");

    await toggleMusic(true);

    window.setTimeout(() => {
      overlay.classList.add("is-hidden");
      revealVisibleElements();
      window.requestAnimationFrame(() => animateHeroTypewriter(false));
    }, prefersReducedMotion ? 50 : 650);
  });
}

/* ==========================================================================
   3. REVELACIÓN AL DESPLAZAR Y PARALLAX SUAVE
   ========================================================================== */
function revealVisibleElements() {
  const items = document.querySelectorAll("[data-reveal]");
  items.forEach((el) => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.95) {
      el.classList.add("is-visible");
    }
  });
}

function initScrollRevealAndParallax() {
  const revealEls = document.querySelectorAll("[data-reveal]");

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );

  revealEls.forEach((el) => observer.observe(el));

  const parallaxEls = document.querySelectorAll("[data-parallax]");
  let ticking = false;

  window.addEventListener(
    "scroll",
    () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        parallaxEls.forEach((el) => {
          const factor = parseFloat(el.dataset.parallax) || 0.1;
          const offset = el.classList.contains("hero-backdrop")
            ? -Math.min(28, scrollY * factor)
            : Math.max(-36, Math.min(36, scrollY * factor));
          const extraScale = el.classList.contains("hero-backdrop") ? " scale(1.03)" : "";
          el.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)${extraScale}`;
        });
        ticking = false;
      });
    },
    { passive: true }
  );
}

/* ==========================================================================
   4. EFECTO AMBIENTAL SUTIL EN CANVAS
   ========================================================================== */
function initAmbientCanvas() {
  const canvas = document.getElementById("ambient-canvas");
  if (!canvas || prefersReducedMotion) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  let width = 0;
  let height = 0;
  let animId = null;

  const particles = Array.from({ length: 18 }, () => ({
    x: Math.random(),
    y: Math.random(),
    r: 1.2 + Math.random() * 2.2,
    vy: 0.00018 + Math.random() * 0.00025,
    vx: (Math.random() - 0.5) * 0.00015,
    alpha: 0.14 + Math.random() * 0.22
  }));

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function render() {
    ctx.clearRect(0, 0, width, height);
    particles.forEach((p) => {
      p.y += p.vy;
      p.x += p.vx;
      if (p.y > 1.05) {
        p.y = -0.05;
        p.x = Math.random();
      }
      if (p.x < -0.05) p.x = 1.05;
      if (p.x > 1.05) p.x = -0.05;

      ctx.beginPath();
      ctx.arc(p.x * width, p.y * height, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(184, 150, 88, ${p.alpha})`;
      ctx.fill();
    });
    animId = window.requestAnimationFrame(render);
  }

  resize();
  window.addEventListener("resize", resize, { passive: true });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && animId) {
      window.cancelAnimationFrame(animId);
      animId = null;
    } else if (!document.hidden && !animId) {
      animId = window.requestAnimationFrame(render);
    }
  });

  render();
}

/* ==========================================================================
   5. RASCAR PARA REVELAR + CUENTA REGRESIVA (SIN CALENDARIO VISUAL)
   ========================================================================== */
function updateScratchProgressLabel() {
  const label = document.getElementById("scratch-progress-label");
  if (!label) return;
  if (state.scratchRevealed) {
    label.textContent = msg("scratchDone");
  } else if (state.scratchPercent > 0) {
    label.textContent = msg("scratchProgress", { pct: state.scratchPercent });
  } else {
    label.textContent = msg("scratchPrompt");
  }
}

function revealDateCompletely() {
  const canvas = document.getElementById("scratch-canvas");
  state.scratchRevealed = true;
  state.scratchPercent = 100;

  if (canvas) {
    canvas.classList.add("is-cleared");
  }
  updateScratchProgressLabel();
}

function initScratchCard() {
  const canvas = document.getElementById("scratch-canvas");
  const revealBtn = document.getElementById("scratch-reveal-btn");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  let isDrawing = false;
  let lastPoint = null;

  function paintFoil() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "#3b4f41";
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = "rgba(184, 150, 88, 0.45)";
    ctx.lineWidth = 1;
    ctx.strokeRect(10, 10, w - 20, h - 20);
  }

  function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  }

  function scratchLine(from, to) {
    ctx.globalCompositeOperation = "destination-out";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 34;
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
  }

  function evaluateClearedArea() {
    if (state.scratchRevealed) return;
    const { width, height } = canvas;
    if (!width || !height) return;

    const sampleStep = 16;
    const imageData = ctx.getImageData(0, 0, width, height).data;
    let transparent = 0;
    let total = 0;

    for (let y = 0; y < height; y += sampleStep) {
      for (let x = 0; x < width; x += sampleStep) {
        total++;
        const alphaIndex = (y * width + x) * 4 + 3;
        if (imageData[alphaIndex] < 128) transparent++;
      }
    }

    const ratio = total > 0 ? transparent / total : 0;
    state.scratchPercent = Math.min(100, Math.round((ratio / 0.55) * 100));
    updateScratchProgressLabel();

    if (ratio >= 0.55) {
      revealDateCompletely();
    }
  }

  function onStart(e) {
    if (state.scratchRevealed) return;
    isDrawing = true;
    lastPoint = getPos(e);
    scratchLine(lastPoint, lastPoint);
    evaluateClearedArea();
  }

  function onMove(e) {
    if (!isDrawing || state.scratchRevealed) return;
    if (e.cancelable) e.preventDefault();
    const current = getPos(e);
    scratchLine(lastPoint, current);
    lastPoint = current;
    evaluateClearedArea();
  }

  function onEnd() {
    if (!isDrawing) return;
    isDrawing = false;
    lastPoint = null;
    evaluateClearedArea();
  }

  paintFoil();
  window.addEventListener(
    "resize",
    () => {
      if (!state.scratchRevealed) paintFoil();
    },
    { passive: true }
  );

  canvas.addEventListener("pointerdown", onStart);
  canvas.addEventListener("pointermove", onMove);
  window.addEventListener("pointerup", onEnd);

  canvas.addEventListener("touchstart", onStart, { passive: true });
  canvas.addEventListener("touchmove", onMove, { passive: false });
  window.addEventListener("touchend", onEnd);

  if (revealBtn) {
    revealBtn.addEventListener("click", revealDateCompletely);
  }
}

function setCountdownUnit(el, ringEl, value, maxUnit) {
  const formatted = String(value).padStart(2, "0");
  if (el.textContent !== formatted) {
    el.textContent = formatted;
    if (!prefersReducedMotion) {
      el.classList.add("is-ticking");
      window.setTimeout(() => el.classList.remove("is-ticking"), 240);
    }
  }
  if (ringEl && maxUnit > 0) {
    const circumference = 276.46;
    const ratio = Math.max(0, Math.min(1, value / maxUnit));
    ringEl.style.strokeDashoffset = String(circumference * (1 - ratio));
  }
}

function updateCountdown() {
  const daysEl = document.getElementById("cd-days");
  const hoursEl = document.getElementById("cd-hours");
  const minutesEl = document.getElementById("cd-minutes");
  const secondsEl = document.getElementById("cd-seconds");
  const ringDays = document.getElementById("ring-days");
  const ringHours = document.getElementById("ring-hours");
  const ringMinutes = document.getElementById("ring-minutes");
  const ringSeconds = document.getElementById("ring-seconds");
  const statusEl = document.getElementById("countdown-status");
  if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;

  const now = Date.now();
  const start = new Date(EVENT_CONFIG.eventStartIso).getTime();
  const end = new Date(EVENT_CONFIG.eventEndIso).getTime();
  const diff = start - now;

  if (diff <= 0 && now <= end) {
    setCountdownUnit(daysEl, ringDays, 0, 365);
    setCountdownUnit(hoursEl, ringHours, 0, 24);
    setCountdownUnit(minutesEl, ringMinutes, 0, 60);
    setCountdownUnit(secondsEl, ringSeconds, 0, 60);
    if (statusEl) statusEl.textContent = msg("countdownHappeningNow");
    return;
  }

  if (now > end) {
    setCountdownUnit(daysEl, ringDays, 0, 365);
    setCountdownUnit(hoursEl, ringHours, 0, 24);
    setCountdownUnit(minutesEl, ringMinutes, 0, 60);
    setCountdownUnit(secondsEl, ringSeconds, 0, 60);
    if (statusEl) statusEl.textContent = msg("countdownFinished");
    return;
  }

  if (statusEl) statusEl.textContent = "";

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  setCountdownUnit(daysEl, ringDays, days, 365);
  setCountdownUnit(hoursEl, ringHours, hours, 24);
  setCountdownUnit(minutesEl, ringMinutes, minutes, 60);
  setCountdownUnit(secondsEl, ringSeconds, seconds, 60);
}

function initDateFeatures() {
  initScratchCard();
  updateCountdown();
  window.setInterval(updateCountdown, 1000);
}

/* ==========================================================================
   6. DETECCIÓN DE FOTOS EN GALERÍA Y LIGHTBOX
   ========================================================================== */
function initPhotoSlotsDetection() {
  document.querySelectorAll(".gallery-item").forEach((container) => {
    const img = container.querySelector("img");
    if (!img) return;

    const markLoaded = () => {
      if (img.complete && img.naturalWidth > 0) {
        container.classList.add("has-image");
      }
    };

    markLoaded();
    img.addEventListener("load", markLoaded);
    img.addEventListener("error", () => {
      container.classList.remove("has-image");
    });

    window.setTimeout(markLoaded, 400);
  });
}

function initGalleryLightbox() {
  const items = Array.from(document.querySelectorAll(".gallery-item"));
  const lightbox = document.getElementById("lightbox");
  const lbImg = document.getElementById("lightbox-img");
  const lbCaption = document.getElementById("lightbox-caption");
  const closeBtn = document.getElementById("lightbox-close");
  const prevBtn = document.getElementById("lightbox-prev");
  const nextBtn = document.getElementById("lightbox-next");

  if (!items.length || !lightbox || !lbImg) return;

  function openAt(index) {
    state.lightboxIndex = (index + items.length) % items.length;
    const item = items[state.lightboxIndex];
    const img = item.querySelector("img");
    const placeholder = item.querySelector(".gallery-placeholder");

    if (img && img.complete && img.naturalWidth > 0) {
      lbImg.src = img.currentSrc || img.src;
      lbImg.alt = img.alt;
      lbCaption.textContent = img.alt || "";
    } else {
      lbImg.removeAttribute("src");
      lbImg.alt = "";
      lbCaption.textContent = placeholder ? placeholder.textContent : "";
    }

    lightbox.hidden = false;
    document.body.classList.add("is-modal-open");
  }

  function closeLightbox() {
    lightbox.hidden = true;
    document.body.classList.remove("is-modal-open");
  }

  items.forEach((item, idx) => {
    item.addEventListener("click", () => openAt(idx));
  });

  closeBtn?.addEventListener("click", closeLightbox);
  prevBtn?.addEventListener("click", () => openAt(state.lightboxIndex - 1));
  nextBtn?.addEventListener("click", () => openAt(state.lightboxIndex + 1));

  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  let touchStartX = 0;
  lightbox.addEventListener(
    "touchstart",
    (e) => {
      touchStartX = e.touches[0].clientX;
    },
    { passive: true }
  );
  lightbox.addEventListener(
    "touchend",
    (e) => {
      const diffX = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(diffX) > 45) {
        if (diffX < 0) openAt(state.lightboxIndex + 1);
        else openAt(state.lightboxIndex - 1);
      }
    },
    { passive: true }
  );

  document.addEventListener("keydown", (e) => {
    if (lightbox.hidden) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowRight") openAt(state.lightboxIndex + 1);
    if (e.key === "ArrowLeft") openAt(state.lightboxIndex - 1);
  });
}

/* ==========================================================================
   7. CONFIRMACIÓN DE ASISTENCIA (RSVP -> WHATSAPP)
   ========================================================================== */
function initRsvpForm() {
  const form = document.getElementById("rsvp-form");
  const nameInput = document.getElementById("guest-name");
  const nameError = document.getElementById("guest-name-error");
  const companionsFields = document.getElementById("companions-fields");
  const companionsCount = document.getElementById("companions-count");
  const companionsNames = document.getElementById("companions-names");
  const guestMessage = document.getElementById("guest-message");
  const feedback = document.getElementById("rsvp-feedback");
  if (!form || !nameInput) return;

  const attendanceRadios = form.querySelectorAll('input[name="attendance"]');
  attendanceRadios.forEach((radio) => {
    radio.addEventListener("change", () => {
      const attending = radio.value === "yes" && radio.checked;
      if (companionsFields) {
        companionsFields.classList.toggle("is-hidden", !attending);
      }
    });
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const guestName = nameInput.value.trim();

    if (!guestName) {
      if (nameError) nameError.textContent = msg("nameRequired");
      nameInput.focus();
      return;
    }

    if (nameError) nameError.textContent = "";

    const selectedAttendance = form.querySelector('input[name="attendance"]:checked')?.value || "yes";
    const isAttending = selectedAttendance === "yes";
    const countVal = isAttending ? companionsCount?.value || "1" : "0";
    const namesVal = isAttending ? companionsNames?.value.trim() || "" : "";
    const msgVal = guestMessage?.value.trim() || "";

    const lines = [
      `Hola, confirmacion de asistencia para el Bautizo de ${EVENT_CONFIG.honoreesNames}:`,
      `• Invitado: ${guestName}`,
      `• Asistencia: ${isAttending ? "Si, asistiremos" : "No podremos asistir"}`,
      ...(isAttending ? [`• Numero de asistentes: ${countVal}`] : []),
      ...(namesVal ? [`• Nombres de asistentes: ${namesVal}`] : []),
      ...(msgVal ? [`• Mensaje: ${msgVal}`] : [])
    ];

    const encodedText = encodeURIComponent(lines.join("\n"));
    const cleanPhone = EVENT_CONFIG.whatsappNumber.replace(/[^\d]/g, "");
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedText}`;

    if (feedback) feedback.textContent = msg("openingWhatsapp");
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  });
}

/* ==========================================================================
   8. AGREGAR AL CALENDARIO (GOOGLE CALENDAR + ARCHIVO .ICS)
   ========================================================================== */
function formatUtcForCalendar(isoString) {
  const date = new Date(isoString);
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

function updateGoogleCalendarLink() {
  const link = document.getElementById("google-calendar-link");
  if (!link) return;

  const startStr = formatUtcForCalendar(EVENT_CONFIG.eventStartIso);
  const endStr = formatUtcForCalendar(EVENT_CONFIG.eventEndIso);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: EVENT_CONFIG.eventTitle,
    dates: `${startStr}/${endStr}`,
    details: EVENT_CONFIG.eventDescription,
    location: EVENT_CONFIG.locationSummary
  });

  link.href = `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function initCalendarExport() {
  updateGoogleCalendarLink();

  const icsBtn = document.getElementById("download-ics-btn");
  if (!icsBtn) return;

  icsBtn.addEventListener("click", () => {
    const startStr = formatUtcForCalendar(EVENT_CONFIG.eventStartIso);
    const endStr = formatUtcForCalendar(EVENT_CONFIG.eventEndIso);
    const summary = EVENT_CONFIG.eventTitle;
    const description = EVENT_CONFIG.eventDescription;
    const location = EVENT_CONFIG.locationSummary;

    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Atelier Digital//Invitation//ES",
      "BEGIN:VEVENT",
      "UID:bautizo-aria-ariel-2026@atelierdigital",
      `DTSTAMP:${formatUtcForCalendar(new Date().toISOString())}`,
      `DTSTART:${startStr}`,
      `DTEND:${endStr}`,
      `SUMMARY:${summary}`,
      `DESCRIPTION:${description}`,
      `LOCATION:${location}`,
      "END:VEVENT",
      "END:VCALENDAR"
    ].join("\r\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bautizo-aria-ariel.ics";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
}

/* ==========================================================================
   9. PANTALLA COMPLETA Y COMPARTIR INVITACIÓN
   ========================================================================== */
function showShareFeedback(text) {
  const el = document.getElementById("share-feedback");
  if (!el) return;
  el.textContent = text;
  window.setTimeout(() => {
    if (el.textContent === text) el.textContent = "";
  }, 3200);
}

function initFullscreenAndShare() {
  const fsBtn = document.getElementById("fullscreen-btn");
  const shareBtn = document.getElementById("share-btn");

  if (fsBtn) {
    fsBtn.addEventListener("click", async () => {
      const supported = Boolean(document.documentElement.requestFullscreen);
      if (!supported) {
        showShareFeedback(msg("fullscreenUnsupported"));
        return;
      }

      try {
        if (!document.fullscreenElement) {
          await document.documentElement.requestFullscreen();
          fsBtn.setAttribute("aria-pressed", "true");
        } else {
          await document.exitFullscreen();
          fsBtn.setAttribute("aria-pressed", "false");
        }
      } catch {
        showShareFeedback(msg("fullscreenUnsupported"));
      }
    });

    document.addEventListener("fullscreenchange", () => {
      fsBtn.setAttribute("aria-pressed", String(Boolean(document.fullscreenElement)));
    });
  }

  if (shareBtn) {
    shareBtn.addEventListener("click", async () => {
      const shareData = {
        title: EVENT_CONFIG.eventTitle,
        text: EVENT_CONFIG.eventDescription,
        url: window.location.href
      };

      if (navigator.share) {
        try {
          await navigator.share(shareData);
          return;
        } catch (err) {
          if (err && err.name === "AbortError") return;
        }
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        try {
          await navigator.clipboard.writeText(window.location.href);
          showShareFeedback(msg("copied"));
          return;
        } catch {
          // Continuar a mensaje fallback
        }
      }

      showShareFeedback(msg("shareUnavailable"));
    });
  }
}

/* ==========================================================================
   10. DINÁMICA DE ITINERARIO, MAZO DE VESTIMENTA Y MODAL BANCARIO
   ========================================================================== */
function initItineraryMotion() {
  const timeline = document.getElementById("itinerary-timeline");
  if (!timeline) return;

  const items = Array.from(timeline.querySelectorAll(".timeline-item"));
  let ticking = false;

  function updateProgress() {
    const rect = timeline.getBoundingClientRect();
    const viewH = window.innerHeight || 1;
    const totalScrollable = rect.height + viewH * 0.45;
    const current = viewH * 0.72 - rect.top;
    const progress = Math.max(0, Math.min(1, current / Math.max(1, totalScrollable)));

    timeline.style.setProperty("--timeline-progress", progress.toFixed(3));

    const centerTarget = viewH * 0.52;
    let closestItem = null;
    let minDist = Infinity;

    items.forEach((item) => {
      const r = item.getBoundingClientRect();
      const mid = r.top + r.height * 0.5;
      const dist = Math.abs(mid - centerTarget);
      if (dist < minDist && r.top < viewH * 0.85 && r.bottom > viewH * 0.15) {
        minDist = dist;
        closestItem = item;
      }
    });

    items.forEach((item) => {
      item.classList.toggle("is-active", item === closestItem);
    });

    ticking = false;
  }

  window.addEventListener(
    "scroll",
    () => {
      if (prefersReducedMotion || ticking) return;
      ticking = true;
      window.requestAnimationFrame(updateProgress);
    },
    { passive: true }
  );

  updateProgress();
}

function initDresscodeStack() {
  const stack = document.getElementById("dresscode-stack");
  const flipBtn = document.getElementById("dresscode-flip-btn");
  if (!stack) return;

  const cards = Array.from(stack.querySelectorAll(".dresscode-card"));
  if (cards.length < 2) return;

  let activeIndex = 0;
  let isAnimating = false;
  let startY = 0;
  let currentDeltaY = 0;
  let isPointerDown = false;
  let draggedCard = null;

  function applyCardStates() {
    const nextIndex = (activeIndex + 1) % cards.length;
    cards.forEach((card, idx) => {
      card.classList.remove("is-front", "is-back", "is-dismissed-up", "is-dragging");
      card.style.transform = "";
      card.style.opacity = "";

      if (idx === activeIndex) {
        card.classList.add("is-front");
        card.setAttribute("aria-hidden", "false");
      } else if (idx === nextIndex) {
        card.classList.add("is-back");
        card.setAttribute("aria-hidden", "true");
      } else {
        card.classList.add("is-dismissed-up");
        card.setAttribute("aria-hidden", "true");
      }
    });
  }

  function cycleCard() {
    if (isAnimating) return;
    isAnimating = true;

    const outgoing = cards[activeIndex];
    const incoming = cards[(activeIndex + 1) % cards.length];

    outgoing.style.transform = "";
    outgoing.style.opacity = "";
    outgoing.classList.remove("is-dragging");
    outgoing.classList.add("is-dismissed-up");

    incoming.classList.remove("is-back");
    incoming.classList.add("is-front");

    window.setTimeout(() => {
      activeIndex = (activeIndex + 1) % cards.length;
      applyCardStates();
      isAnimating = false;
    }, prefersReducedMotion ? 40 : 480);
  }

  function onDragStart(e) {
    if (isAnimating) return;
    const frontCard = cards[activeIndex];
    if (!frontCard || !frontCard.contains(e.target)) return;

    isPointerDown = true;
    draggedCard = frontCard;
    currentDeltaY = 0;
    startY = e.touches ? e.touches[0].clientY : e.clientY;
    draggedCard.classList.add("is-dragging");
  }

  function onDragMove(e) {
    if (!isPointerDown || !draggedCard) return;
    const y = e.touches ? e.touches[0].clientY : e.clientY;
    currentDeltaY = y - startY;

    if (Math.abs(currentDeltaY) > 6 && e.cancelable) {
      e.preventDefault();
    }

    const clampedY = Math.max(-140, Math.min(140, currentDeltaY));
    const tilt = (clampedY / 140) * -2.5;
    const fade = Math.max(0.35, 1 - Math.abs(clampedY) / 180);

    draggedCard.style.transform = `translate3d(0, ${clampedY}px, 0) rotate(${tilt}deg)`;
    draggedCard.style.opacity = String(fade);
  }

  function onDragEnd() {
    if (!isPointerDown || !draggedCard) return;
    isPointerDown = false;

    const delta = currentDeltaY;
    const card = draggedCard;
    draggedCard = null;
    currentDeltaY = 0;

    if (Math.abs(delta) > 48 || Math.abs(delta) < 10) {
      cycleCard();
    } else {
      card.classList.remove("is-dragging");
      card.style.transform = "";
      card.style.opacity = "";
    }
  }

  applyCardStates();

  stack.addEventListener("pointerdown", onDragStart);
  window.addEventListener("pointermove", onDragMove, { passive: false });
  window.addEventListener("pointerup", onDragEnd);

  stack.addEventListener("touchstart", onDragStart, { passive: true });
  window.addEventListener("touchmove", onDragMove, { passive: false });
  window.addEventListener("touchend", onDragEnd);

  cards.forEach((card) => {
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault();
        cycleCard();
      }
    });
  });

  flipBtn?.addEventListener("click", cycleCard);
}

function initBankModal() {
  const openBtn = document.getElementById("open-bank-modal-btn");
  const modal = document.getElementById("bank-modal");
  const closeBtn = document.getElementById("close-bank-modal-btn");
  const copyBtn = document.getElementById("copy-clabe-btn");
  const clabeEl = document.getElementById("bank-clabe-value");
  const feedbackEl = document.getElementById("bank-copy-feedback");

  if (!openBtn || !modal) return;

  function openModal() {
    if (feedbackEl) feedbackEl.textContent = "";
    modal.hidden = false;
    document.body.classList.add("is-modal-open");
    closeBtn?.focus();
  }

  function closeModal() {
    modal.hidden = true;
    document.body.classList.remove("is-modal-open");
    openBtn.focus();
  }

  openBtn.addEventListener("click", openModal);
  closeBtn?.addEventListener("click", closeModal);

  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener("keydown", (e) => {
    if (!modal.hidden && e.key === "Escape") {
      closeModal();
    }
  });

  copyBtn?.addEventListener("click", async () => {
    const textToCopy = clabeEl?.textContent?.trim() || "";
    if (!textToCopy) return;

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        const temp = document.createElement("textarea");
        temp.value = textToCopy;
        document.body.appendChild(temp);
        temp.select();
        document.execCommand("copy");
        document.body.removeChild(temp);
      }
      if (feedbackEl) feedbackEl.textContent = msg("clabeCopied");
    } catch {
      if (feedbackEl) feedbackEl.textContent = textToCopy;
    }
  });
}

function initAtelierPromo() {
  const btn = document.getElementById("atelier-promo-btn");
  const img = btn?.querySelector(".atelier-emblem");
  const box = document.getElementById("atelier-promo-box");
  if (!btn || !img || !box) return;

  btn.addEventListener("click", () => {
    img.classList.remove("is-spinning");
    void img.offsetWidth;
    img.classList.add("is-spinning");

    const isOpen = !box.hidden;
    box.hidden = isOpen;
    btn.setAttribute("aria-expanded", String(!isOpen));
  });
}

/* ==========================================================================
   INICIALIZACIÓN GENERAL
   ========================================================================== */
document.addEventListener("DOMContentLoaded", () => {
  initAudio();
  initEnvelope();
  initScrollRevealAndParallax();
  initAmbientCanvas();
  initDateFeatures();
  initPhotoSlotsDetection();
  initGalleryLightbox();
  initRsvpForm();
  initCalendarExport();
  initFullscreenAndShare();
  initItineraryMotion();
  initDresscodeStack();
  initBankModal();
  initAtelierPromo();
});