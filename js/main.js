/* ═══════════════════════════════════════════════════════
   OSAMA & KEVWE — scroll journey engine
   Lenis smooth scroll + GSAP ScrollTrigger + canvases
   ═══════════════════════════════════════════════════════ */

gsap.registerPlugin(ScrollTrigger);
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ── smooth scroll ───────────────────────────────────── */
let lenis = null;
if (!reduceMotion) {
  lenis = new Lenis({ duration: 1.35, smoothWheel: true });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}

/* ── text splitting helpers ──────────────────────────── */
document.querySelectorAll("[data-split]").forEach((el) => {
  const text = el.textContent;
  el.textContent = "";
  el.setAttribute("aria-label", text);
  [...text].forEach((ch) => {
    const s = document.createElement("span");
    s.className = "char";
    s.textContent = ch === " " ? " " : ch;
    s.setAttribute("aria-hidden", "true");
    el.appendChild(s);
  });
});

document.querySelectorAll("[data-words]").forEach((el) => {
  const words = el.textContent.trim().split(/\s+/);
  el.setAttribute("aria-label", words.join(" "));
  el.innerHTML = words
    .map((w) => `<span class="word" aria-hidden="true">${w}</span>`)
    .join(" ");
});

// letter body word-split (keeps the <em>)
(() => {
  const body = document.getElementById("letterBody");
  if (!body) return;
  const wrap = (node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const frag = document.createDocumentFragment();
      node.textContent.trim().split(/\s+/).forEach((w) => {
        if (!w) return;
        const s = document.createElement("span");
        s.className = "word";
        s.textContent = w;
        frag.appendChild(s);
        frag.appendChild(document.createTextNode(" "));
      });
      node.replaceWith(frag);
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      [...node.childNodes].forEach(wrap);
    }
  };
  [...body.childNodes].forEach(wrap);
})();

/* ── preloader ───────────────────────────────────────── */
(() => {
  const pre = document.getElementById("preloader");
  const fill = document.getElementById("preloaderFill");
  let progress = 0;
  const heroDone = new Promise((res) => {
    const iv = setInterval(() => {
      progress = Math.min(progress + 6 + Math.random() * 12, 100);
      fill.style.width = progress + "%";
      if (progress >= 100) { clearInterval(iv); res(); }
    }, 90);
  });
  heroDone.then(() => {
    setTimeout(() => {
      pre.classList.add("done");
      playHeroIntro();
    }, 350);
  });
})();

/* ── hero intro timeline ─────────────────────────────── */
function playHeroIntro() {
  const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
  tl.fromTo(".hero-bg", { scale: 1.12, opacity: 0.4 }, { scale: 1, opacity: 1, duration: 2.2, ease: "power2.out" })
    .to(".hero-kicker", { opacity: 1, y: 0, duration: 0.9 }, "-=1.6")
    .to(".hero-names .name .char", { opacity: 1, y: 0, rotateX: 0, stagger: 0.05, duration: 1.1, ease: "back.out(1.6)" }, "-=1.2")
    .to(".hero-amp", { opacity: 1, scale: 1, duration: 0.8, ease: "elastic.out(1, 0.5)" }, "-=0.8")
    .to(".hero-rule", { opacity: 1, y: 0, duration: 0.9 }, "-=0.6")
    .to(".hero-sub", { opacity: 1, y: 0, duration: 0.9 }, "-=0.6")
    .to(".hero-invite", { opacity: 1, y: 0, duration: 0.9 }, "-=0.6")
    .to(".scroll-cue", { opacity: 1, duration: 1 }, "-=0.5");
}
// initial hero states
gsap.set(".hero-kicker, .hero-rule, .hero-sub, .hero-invite", { opacity: 0, y: 26 });
gsap.set(".hero-names .name .char", { opacity: 0, y: 70, rotateX: -70 });
gsap.set(".hero-amp", { opacity: 0, scale: 0.3 });
gsap.set(".scroll-cue", { opacity: 0 });

/* subtle pointer parallax on the hero */
(() => {
  if (reduceMotion) return;
  const bg = document.querySelector(".hero-bg img");
  const content = document.getElementById("heroContent");
  addEventListener("pointermove", (e) => {
    if (scrollY > innerHeight) return;
    const dx = (e.clientX / innerWidth - 0.5);
    const dy = (e.clientY / innerHeight - 0.5);
    gsap.to(bg, { xPercent: dx * -1.6, yPercent: dy * -1.2, duration: 1.2, ease: "power2.out", overwrite: "auto" });
    gsap.to(content, { x: dx * 14, y: dy * 10, duration: 1.2, ease: "power2.out", overwrite: "auto" });
  });
})();

/* ── hero exit parallax ──────────────────────────────── */
gsap.to("#heroContent", {
  yPercent: -46, opacity: 0, ease: "none",
  scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom 40%", scrub: true },
});
gsap.to(".hero-bg", {
  yPercent: 14, ease: "none",
  scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom top", scrub: true },
});

/* ── generic reveal-line ─────────────────────────────── */
document.querySelectorAll(".reveal-line").forEach((el) => {
  if (el.closest(".hero")) return; // hero handles its own
  gsap.to(el, {
    opacity: 1, y: 0, duration: 1.2, ease: "power3.out",
    scrollTrigger: { trigger: el, start: "top 86%" },
  });
});

/* ── quote word cascades ─────────────────────────────── */
document.querySelectorAll(".big-quote").forEach((q) => {
  const words = q.querySelectorAll(".word");
  gsap.set(words, { opacity: 0.08, filter: "blur(6px)", y: 20 });
  gsap.to(words, {
    opacity: 1, filter: "blur(0px)", y: 0,
    stagger: 0.09, ease: "none",
    scrollTrigger: {
      trigger: q, start: "top 78%", end: "top 30%", scrub: true,
    },
  });
});

/* ── chapter titles: char rise ───────────────────────── */
document.querySelectorAll(".chapter-title, .finale-names span[data-split], .video-title, .notes-title").forEach((t) => {
  const chars = t.querySelectorAll(".char");
  if (!chars.length) {
    gsap.set(t, { opacity: 0, y: 40 });
    gsap.to(t, { opacity: 1, y: 0, duration: 1.2, ease: "power3.out",
      scrollTrigger: { trigger: t, start: "top 85%" } });
    return;
  }
  gsap.set(chars, { opacity: 0, y: 60, rotateX: -50 });
  gsap.to(chars, {
    opacity: 1, y: 0, rotateX: 0, stagger: 0.045, duration: 1, ease: "back.out(1.7)",
    scrollTrigger: { trigger: t, start: "top 85%" },
  });
});
document.querySelectorAll(".chapter-num").forEach((n) => {
  gsap.set(n, { opacity: 0, letterSpacing: "1.2em" });
  gsap.to(n, {
    opacity: 1, letterSpacing: ".6em", duration: 1.4, ease: "power2.out",
    scrollTrigger: { trigger: n, start: "top 88%" },
  });
});

/* ── chapter I: horizontal pinned gallery ────────────── */
(() => {
  const wrap = document.getElementById("heliGallery");
  const track = wrap.querySelector(".hgallery-track");
  const getDist = () => track.scrollWidth - innerWidth;
  gsap.to(track, {
    x: () => -getDist(),
    ease: "none",
    scrollTrigger: {
      trigger: wrap,
      start: "top top",
      end: () => "+=" + getDist(),
      pin: true,
      scrub: 1,
      invalidateOnRefresh: true,
      anticipatePin: 1,
    },
  });
  // slight per-card parallax inside the track
  wrap.querySelectorAll(".hcard img").forEach((img) => {
    gsap.fromTo(img, { xPercent: -6 }, {
      xPercent: 6, ease: "none",
      scrollTrigger: { trigger: wrap, start: "top top", end: () => "+=" + getDist(), scrub: true },
    });
  });
})();

/* ── chapter II: collage reveal + parallax ───────────── */
document.querySelectorAll(".cg-item").forEach((item, i) => {
  gsap.to(item, {
    opacity: 1, y: 0, scale: 1, duration: 1.3, ease: "power3.out", delay: (i % 3) * 0.12,
    scrollTrigger: { trigger: item, start: "top 90%" },
  });
});
document.querySelectorAll(".parallax").forEach((el) => {
  const speed = parseFloat(el.dataset.speed || 1);
  gsap.to(el, {
    yPercent: (1 - speed) * 26, ease: "none",
    scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: true },
  });
});

/* ── video section: autoplay in view, tap for sound ──── */
function initVideoSection(frame, video, soundBtn) {
  if (!frame || !video || !soundBtn) return; // guards against a missing/renamed id

  gsap.set(frame, { opacity: 0, y: 80, scale: 0.92 });
  gsap.to(frame, {
    opacity: 1, y: 0, scale: 1, duration: 1.4, ease: "power3.out",
    scrollTrigger: { trigger: frame, start: "top 85%" },
  });

  // autoplay (muted) whenever the frame is on screen, pause when it leaves.
  // IntersectionObserver is independent of the scrub timeline and works the
  // same on mobile (full-bleed frame) and desktop.
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) video.play().catch(() => {});
        else video.pause();
      });
    }, { threshold: 0.35 });
    io.observe(frame);
  } else {
    ScrollTrigger.create({
      trigger: frame, start: "top 80%", end: "bottom 15%",
      onEnter: () => video.play().catch(() => {}),
      onEnterBack: () => video.play().catch(() => {}),
      onLeave: () => video.pause(),
      onLeaveBack: () => video.pause(),
    });
  }

  // insurance: if autoplay was blocked, start on the first user interaction
  const kick = () => {
    const r = frame.getBoundingClientRect();
    if (video.paused && r.top < innerHeight && r.bottom > 0) video.play().catch(() => {});
  };
  addEventListener("pointerdown", kick);
  addEventListener("touchstart", kick, { passive: true });

  soundBtn.addEventListener("click", () => {
    video.muted = !video.muted;
    soundBtn.classList.toggle("on", !video.muted);
    soundBtn.setAttribute("aria-label", video.muted ? "Turn sound on" : "Turn sound off");
    if (!video.muted) { video.currentTime = 0; video.play().catch(() => {}); }
  });
}

initVideoSection(
  document.getElementById("videoFrame"),
  document.getElementById("proposalVideo"),
  document.getElementById("videoSound")
);
initVideoSection(
  document.getElementById("videoFrame2"),
  document.getElementById("proposalVideo2"),
  document.getElementById("videoSound2")
);

/* ── THE YES ─────────────────────────────────────────── */
(() => {
  const spans = document.querySelectorAll(".yes-text span");
  gsap.timeline({
    scrollTrigger: { trigger: "#yesSection", start: "top 62%" },
  })
    .to(spans, {
      opacity: 1, scale: 1, stagger: 0.22, duration: 0.8, ease: "elastic.out(1, 0.45)",
    })
    .fromTo(".yes-word", { filter: "drop-shadow(0 0 0px rgba(255,92,138,0))" },
      { filter: "drop-shadow(0 0 44px rgba(255,92,138,.85))", duration: 0.7 }, "-=0.3");

  // gentle float on the YES afterwards
  gsap.to(".yes-word", {
    y: -10, repeat: -1, yoyo: true, duration: 1.8, ease: "sine.inOut", delay: 2,
  });
})();

/* ── chapter III: masonry stagger ────────────────────── */
document.querySelectorAll(".m-item").forEach((item, i) => {
  gsap.to(item, {
    opacity: 1, y: 0, duration: 1.1, ease: "power3.out", delay: (i % 4) * 0.09,
    scrollTrigger: { trigger: item, start: "top 92%" },
  });
});

/* ── little love notes ───────────────────────────────── */
document.querySelectorAll(".note-card").forEach((card, i) => {
  gsap.to(card, {
    opacity: 1, y: 0, duration: 1.1, ease: "power3.out", delay: (i % 3) * 0.12,
    scrollTrigger: { trigger: card, start: "top 90%" },
  });
});

/* ── love letter ─────────────────────────────────────── */
(() => {
  const card = document.querySelector(".letter-card");
  gsap.to(card, {
    opacity: 1, y: 0, duration: 1.4, ease: "power3.out",
    scrollTrigger: { trigger: card, start: "top 82%" },
  });
  const words = document.querySelectorAll("#letterBody .word");
  gsap.set(words, { opacity: 0.06 });
  gsap.to(words, {
    opacity: 1, stagger: 0.03, ease: "none",
    scrollTrigger: { trigger: card, start: "top 70%", end: "bottom 55%", scrub: true },
  });
})();

/* ── finale ──────────────────────────────────────────── */
(() => {
  document.getElementById("replayBtn").addEventListener("click", () => {
    if (lenis) lenis.scrollTo(0, { duration: 2.4 });
    else window.scrollTo({ top: 0, behavior: "smooth" });
  });
})();

/* ── scroll progress bar ─────────────────────────────── */
(() => {
  const fill = document.getElementById("progressFill");
  ScrollTrigger.create({
    start: 0, end: () => document.documentElement.scrollHeight - innerHeight,
    onUpdate: (self) => (fill.style.width = self.progress * 100 + "%"),
  });
})();

/* ── lightbox ────────────────────────────────────────── */
(() => {
  const lb = document.getElementById("lightbox");
  const lbImg = document.getElementById("lbImg");
  const items = [...document.querySelectorAll(".m-item img, .cg-item img")];
  let idx = 0;

  function open(i) {
    idx = i;
    lbImg.src = items[idx].src;
    lbImg.alt = items[idx].alt;
    lb.classList.add("open");
    if (lenis) lenis.stop();
  }
  function close() {
    lb.classList.remove("open");
    if (lenis) lenis.start();
  }
  function step(d) {
    idx = (idx + d + items.length) % items.length;
    gsap.fromTo(lbImg, { opacity: 0, scale: 0.96 }, { opacity: 1, scale: 1, duration: 0.4 });
    lbImg.src = items[idx].src;
    lbImg.alt = items[idx].alt;
  }

  items.forEach((img, i) => img.parentElement.addEventListener("click", () => open(i)));
  document.getElementById("lbClose").addEventListener("click", close);
  document.getElementById("lbPrev").addEventListener("click", () => step(-1));
  document.getElementById("lbNext").addEventListener("click", () => step(1));
  lb.addEventListener("click", (e) => { if (e.target === lb) close(); });
  addEventListener("keydown", (e) => {
    if (!lb.classList.contains("open")) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") step(-1);
    if (e.key === "ArrowRight") step(1);
  });
})();

/* refresh triggers once images settle */
addEventListener("load", () => ScrollTrigger.refresh());
