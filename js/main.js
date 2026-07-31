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
   
   /* ── chapter I: draggable slide gallery + custom scrubber ──
      Replaces the old vertical-scroll-hijacking pin: the section no
      longer traps page scroll. Instead the photos live in place and
      the visitor slides them sideways directly, or via the scrubber/
      arrows below — the page itself just scrolls normally past it. */
   (() => {
     const wrap = document.getElementById("heliGallery");
     const track = document.getElementById("hgTrack");
     const scrollbar = document.getElementById("hgScrollbar");
     const thumb = document.getElementById("hgThumb");
     const fill = document.getElementById("hgFill");
     const prevBtn = document.getElementById("hgPrev");
     const nextBtn = document.getElementById("hgNext");
     if (!wrap || !track || !scrollbar || !thumb || !prevBtn || !nextBtn) return;

     let minX = 0;      // most-negative allowed translateX
     let x = 0;         // current translateX
     let flingTween = null;
     let thumbW = 48;   // cached scrollbar-thumb width
     let usable = 1;    // cached usable travel distance for the thumb

     // Expensive: reads clientWidth/scrollWidth (forces layout). Only call
     // this when the available space actually changes — resize/load/orientation
     // — never on every drag or animation frame, or dragging gets janky.
     function measure() {
       minX = Math.min(0, wrap.clientWidth - track.scrollWidth);
       const trackW = scrollbar.clientWidth;
       const ratio = track.scrollWidth ? Math.min(1, wrap.clientWidth / track.scrollWidth) : 1;
       thumbW = Math.max(48, ratio * trackW);
       usable = Math.max(1, trackW - thumbW);
       thumb.style.width = thumbW + "px";
       const canScroll = minX < -1;
       scrollbar.style.opacity = canScroll ? "1" : ".35";
       scrollbar.style.pointerEvents = canScroll ? "auto" : "none";
       syncUI();
     }

     // Cheap: only writes styles based on already-cached numbers, safe to
     // call on every pointermove/animation frame.
     function syncUI() {
       const progress = minX === 0 ? 0 : x / minX;
       const thumbLeft = progress * usable;
       thumb.style.transform = `translate(${thumbLeft}px, -50%)`;
       fill.style.width = thumbLeft + "px";
       scrollbar.setAttribute("aria-valuenow", String(Math.round(progress * 100)));
       prevBtn.disabled = x >= -1;
       nextBtn.disabled = x <= minX + 1;
     }

     function setX(newX) {
       x = Math.min(0, Math.max(minX, newX));
       track.style.transform = `translate3d(${x}px,0,0)`;
       syncUI();
     }

     function animateTo(target) {
       if (flingTween) flingTween.kill();
       target = Math.min(0, Math.max(minX, target));
       if (reduceMotion) { setX(target); return; }
       const proxy = { v: x };
       flingTween = gsap.to(proxy, {
         v: target, duration: 0.6, ease: "power3.out",
         onUpdate: () => setX(proxy.v),
         onComplete: () => { flingTween = null; },
       });
     }

     /* drag the photos directly */
     let dragging = false, startPX = 0, startX = 0, vLastX = 0, vLastT = 0, velocity = 0;
     track.addEventListener("pointerdown", (e) => {
       if (flingTween) flingTween.kill();
       dragging = true; startPX = e.clientX; startX = x;
       vLastX = e.clientX; vLastT = performance.now(); velocity = 0;
       track.classList.add("dragging");
       track.setPointerCapture(e.pointerId);
     });
     track.addEventListener("pointermove", (e) => {
       if (!dragging) return;
       setX(startX + (e.clientX - startPX));
       const now = performance.now();
       const dt = now - vLastT;
       if (dt > 0) velocity = (e.clientX - vLastX) / dt;
       vLastX = e.clientX; vLastT = now;
     });
     function endDrag(e) {
       if (!dragging) return;
       dragging = false;
       track.classList.remove("dragging");
       if (e && e.pointerId != null) track.releasePointerCapture(e.pointerId);
       if (!reduceMotion && Math.abs(velocity) > 0.05) animateTo(x + velocity * 260);
       else setX(x);
     }
     track.addEventListener("pointerup", endDrag);
     track.addEventListener("pointercancel", endDrag);
     track.addEventListener("dragstart", (e) => e.preventDefault());

     /* the scrubber: drag the thumb, or click the groove to jump */
     function seekTo(clientX) {
       const rect = scrollbar.getBoundingClientRect();
       const ratio = usable <= 0 ? 0 : Math.min(1, Math.max(0, (clientX - rect.left - thumbW / 2) / usable));
       setX(ratio * minX);
     }
     scrollbar.addEventListener("pointerdown", (e) => {
       if (flingTween) flingTween.kill();
       scrollbar.classList.add("dragging");
       scrollbar.setPointerCapture(e.pointerId);
       seekTo(e.clientX);
     });
     scrollbar.addEventListener("pointermove", (e) => {
       if (e.buttons !== 1) return;
       seekTo(e.clientX);
     });
     scrollbar.addEventListener("pointerup", (e) => {
       scrollbar.classList.remove("dragging");
       if (e.pointerId != null) scrollbar.releasePointerCapture(e.pointerId);
     });
     scrollbar.addEventListener("keydown", (e) => {
       if (e.key === "ArrowRight") animateTo(x - 90);
       if (e.key === "ArrowLeft") animateTo(x + 90);
       if (e.key === "Home") animateTo(0);
       if (e.key === "End") animateTo(minX);
     });

     prevBtn.addEventListener("click", () => animateTo(x + wrap.clientWidth * 0.85));
     nextBtn.addEventListener("click", () => animateTo(x - wrap.clientWidth * 0.85));

     const remeasure = () => { measure(); setX(x); };
     addEventListener("resize", remeasure);
     addEventListener("load", remeasure);
     // ResizeObserver catches layout shifts window "resize" misses (fonts
     // swapping in, images loading, container width changing without the
     // viewport itself changing) so the slider's bounds never go stale.
     if ("ResizeObserver" in window) {
       const ro = new ResizeObserver(() => remeasure());
       ro.observe(wrap);
     }
     measure();
     setX(0);

     /* gentle reveal in place of the old scroll-scrub */
     if (reduceMotion) {
       gsap.set(wrap.querySelectorAll(".hcard"), { opacity: 1, y: 0 });
     } else {
       gsap.set(wrap.querySelectorAll(".hcard"), { opacity: 0, y: 46 });
       gsap.to(wrap.querySelectorAll(".hcard"), {
         opacity: 1, y: 0, duration: 1.1, ease: "power3.out", stagger: 0.08,
         scrollTrigger: { trigger: wrap, start: "top 78%" },
       });
     }
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
   
   /* ── video section: autoplay in view, tap for sound, tap to pause ─ */
   function initVideoSection(frame, video, soundBtn, playBtn) {
     if (!frame || !video || !soundBtn) return; // guards against a missing/renamed id
   
     gsap.set(frame, { opacity: 0, y: 80, scale: 0.92 });
     gsap.to(frame, {
       opacity: 1, y: 0, scale: 1, duration: 1.4, ease: "power3.out",
       scrollTrigger: { trigger: frame, start: "top 85%" },
     });
   
     // becomes true once the visitor explicitly hits pause, so scrolling
     // back into view doesn't override their choice by auto-resuming it.
     let userPaused = false;
   
     // autoplay (muted) whenever the frame is on screen, pause when it leaves.
     // IntersectionObserver is independent of the scrub timeline and works the
     // same on mobile (full-bleed frame) and desktop.
     if ("IntersectionObserver" in window) {
       const io = new IntersectionObserver((entries) => {
         entries.forEach((e) => {
           if (e.isIntersecting) { if (!userPaused) video.play().catch(() => {}); }
           else video.pause();
         });
       }, { threshold: 0.35 });
       io.observe(frame);
     } else {
       ScrollTrigger.create({
         trigger: frame, start: "top 80%", end: "bottom 15%",
         onEnter: () => { if (!userPaused) video.play().catch(() => {}); },
         onEnterBack: () => { if (!userPaused) video.play().catch(() => {}); },
         onLeave: () => video.pause(),
         onLeaveBack: () => video.pause(),
       });
     }
   
     // insurance: if autoplay was blocked, start on the first user interaction
     const kick = () => {
       const r = frame.getBoundingClientRect();
       if (video.paused && !userPaused && r.top < innerHeight && r.bottom > 0) video.play().catch(() => {});
     };
     addEventListener("pointerdown", kick);
     addEventListener("touchstart", kick, { passive: true });
   
     // controls (play/pause + sound) are hidden by default and only appear
     // on hover — for touch devices, which have no hover, tapping the frame
     // reveals them for a few seconds and then they fade away again.
     let hideTimer = null;
     const revealControls = () => {
       frame.classList.add("controls-visible");
       clearTimeout(hideTimer);
       hideTimer = setTimeout(() => frame.classList.remove("controls-visible"), 3000);
     };
     frame.addEventListener("pointerenter", revealControls);
     frame.addEventListener("pointermove", revealControls);
     frame.addEventListener("touchstart", revealControls, { passive: true });
     frame.addEventListener("pointerleave", () => {
       clearTimeout(hideTimer);
       frame.classList.remove("controls-visible");
     });
   
     // sound button ONLY mutes/unmutes — it never restarts or replays the video
     soundBtn.addEventListener("click", () => {
       video.muted = !video.muted;
       soundBtn.classList.toggle("on", !video.muted);
       soundBtn.setAttribute("aria-label", video.muted ? "Turn sound on" : "Turn sound off");
       revealControls();
     });
   
     if (playBtn) {
       const syncIcon = () => {
         playBtn.classList.toggle("is-playing", !video.paused);
         playBtn.setAttribute("aria-label", video.paused ? "Play video" : "Pause video");
       };
       video.addEventListener("play", syncIcon);
       video.addEventListener("pause", syncIcon);
       syncIcon();
   
       playBtn.addEventListener("click", () => {
         if (video.paused) { userPaused = false; video.play().catch(() => {}); }
         else { userPaused = true; video.pause(); }
         revealControls();
       });
     }
   }
   
   initVideoSection(
     document.getElementById("videoFrame"),
     document.getElementById("proposalVideo"),
     document.getElementById("videoSound"),
     document.getElementById("videoPlay")
   );
   initVideoSection(
     document.getElementById("videoFrame2"),
     document.getElementById("proposalVideo2"),
     document.getElementById("videoSound2"),
     document.getElementById("videoPlay2")
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
   
