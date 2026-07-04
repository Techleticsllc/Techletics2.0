/* ============================================================
   TECHLETICS — interactions.js
   Everything in this file is intentionally independent of the
   3D hero (script.js). If WebGL/Three.js fails to load for any
   reason, every section below still works: nav, reveals, counters,
   tech list sync, phone tilt, carousel, CTA particles.
   ============================================================ */
(function () {
  "use strict";

  var hasGSAP = typeof window.gsap !== "undefined";
  if (hasGSAP && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
  }

  /* ============ Cursor glow ============ */
  var cursorGlow = document.getElementById("cursorGlow");
  window.addEventListener("mousemove", function (e) {
    if (hasGSAP) {
      gsap.to(cursorGlow, { x: e.clientX, y: e.clientY, duration: 0.6, ease: "power3.out" });
    } else if (cursorGlow) {
      cursorGlow.style.transform = "translate(" + (e.clientX - 210) + "px," + (e.clientY - 210) + "px)";
    }
  });

  /* ============ Navbar show/hide on scroll direction ============ */
  var navbar = document.getElementById("navbar");
  var lastScroll = 0;
  window.addEventListener("scroll", function () {
    var cur = window.scrollY;
    if (!navbar) return;
    if (cur > lastScroll && cur > 140) navbar.classList.add("hide");
    else navbar.classList.remove("hide");
    lastScroll = cur;
  }, { passive: true });

  /* ============ Mobile menu ============ */
  var navBurger = document.getElementById("navBurger");
  var mobileMenu = document.getElementById("mobileMenu");
  if (navBurger && mobileMenu) {
    navBurger.addEventListener("click", function () { mobileMenu.classList.toggle("open"); });
    mobileMenu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { mobileMenu.classList.remove("open"); });
    });
  }

  /* ============ Magnetic buttons ============ */
  if (hasGSAP) {
    document.querySelectorAll(".magnetic").forEach(function (el) {
      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect();
        var x = e.clientX - r.left - r.width / 2;
        var y = e.clientY - r.top - r.height / 2;
        gsap.to(el, { x: x * 0.25, y: y * 0.5, duration: 0.4, ease: "power3.out" });
      });
      el.addEventListener("mouseleave", function () {
        gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.4)" });
      });
    });
  }

  /* ============ Scroll reveal animations ============
     Content is visible by default in CSS. gsap.from() only adds
     motion on top — if GSAP isn't available, everything already
     renders in its final, fully visible state. */
  if (hasGSAP) {
    var heroTl = gsap.timeline({ delay: 0.3 });
    heroTl
      .from(".eyebrow", { opacity: 0, y: 40, duration: 0.8, ease: "power3.out" })
      .from(".hero-title .title-line", { opacity: 0, y: 40, duration: 1, stagger: 0.12, ease: "power3.out" }, "-=0.4")
      .from(".hero-sub", { opacity: 0, y: 40, duration: 0.9, ease: "power3.out" }, "-=0.5")
      .from(".hero-actions", { opacity: 0, y: 40, duration: 0.9, ease: "power3.out" }, "-=0.6");

    document.querySelectorAll(".reveal-up").forEach(function (el) {
      if (el.closest(".hero")) return;
      gsap.from(el, {
        opacity: 0, y: 50, duration: 1, ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 92%", once: true }
      });
    });

    gsap.utils.toArray(".feature-card").forEach(function (card, i) {
      gsap.from(card, {
        opacity: 0, y: 60, scale: 0.94, duration: 0.9, ease: "power3.out",
        delay: (i % 3) * 0.08,
        scrollTrigger: { trigger: card, start: "top 94%", once: true }
      });

      card.addEventListener("mousemove", function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        gsap.to(card, { rotateY: px * 10, rotateX: -py * 10, duration: 0.4, ease: "power2.out", transformPerspective: 700 });
      });
      card.addEventListener("mouseleave", function () {
        gsap.to(card, { rotateY: 0, rotateX: 0, duration: 0.6, ease: "power3.out" });
      });
    });

    gsap.from(".tech-visual", {
      opacity: 0, scale: 0.85, duration: 1.2, ease: "power3.out",
      scrollTrigger: { trigger: ".tech-visual", start: "top 92%", once: true }
    });

    gsap.from(".phone-mock", {
      opacity: 0, y: 60, duration: 1.1, ease: "power3.out",
      scrollTrigger: { trigger: ".phone-stage", start: "top 92%", once: true }
    });

    gsap.utils.toArray(".how-step").forEach(function (el, i) {
      gsap.from(el, {
        opacity: 0, y: 50, duration: 0.9, ease: "power3.out", delay: i * 0.1,
        scrollTrigger: { trigger: ".how-track", start: "top 88%", once: true }
      });
    });
    gsap.utils.toArray(".how-connector i").forEach(function (el, i) {
      gsap.fromTo(el, { scaleX: 0 }, {
        scaleX: 1, duration: 0.8, ease: "power2.inOut", transformOrigin: "left center", delay: 0.2 + i * 0.12,
        scrollTrigger: { trigger: ".how-track", start: "top 88%", once: true }
      });
    });
  } else {
    // graceful fallback: reveal the hero immediately without GSAP
    document.querySelectorAll(".hero .reveal-up").forEach(function (el) { el.style.opacity = 1; });
  }

  /* ============ Technology node <-> list sync ============ */
  var techNodes = document.querySelectorAll(".tech-node");
  var techItems = document.querySelectorAll(".tech-item");
  function setActiveNode(n) {
    techNodes.forEach(function (node) { node.classList.toggle("active", node.dataset.node === n); });
    techItems.forEach(function (item) { item.classList.toggle("active", item.dataset.node === n); });
  }
  techNodes.forEach(function (node) {
    node.addEventListener("mouseenter", function () { setActiveNode(node.dataset.node); });
  });
  techItems.forEach(function (item) {
    item.addEventListener("mouseenter", function () { setActiveNode(item.dataset.node); });
  });
  var techCycle = 1;
  setInterval(function () {
    if (document.querySelector(".tech-visual:hover")) return;
    setActiveNode(String(techCycle));
    techCycle = techCycle > 6 ? 1 : techCycle + 1;
  }, 1800);

  var techVisual = document.getElementById("techVisual");
  if (techVisual && hasGSAP) {
    techVisual.addEventListener("mousemove", function (e) {
      var r = techVisual.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width - 0.5;
      var py = (e.clientY - r.top) / r.height - 0.5;
      gsap.to(techVisual, { rotateY: px * 12, rotateX: -py * 12, duration: 0.5, ease: "power2.out", transformPerspective: 1000 });
    });
    techVisual.addEventListener("mouseleave", function () {
      gsap.to(techVisual, { rotateY: 0, rotateX: 0, duration: 0.8 });
    });
  }

  /* ============ Phone tilt with mouse ============ */
  var phoneStage = document.querySelector(".phone-stage");
  var phoneMock = document.getElementById("phoneMock");
  if (phoneStage && phoneMock && hasGSAP) {
    phoneStage.addEventListener("mousemove", function (e) {
      var r = phoneStage.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width - 0.5;
      var py = (e.clientY - r.top) / r.height - 0.5;
      gsap.to(phoneMock, { rotateY: -14 + px * 16, rotateX: py * -10, duration: 0.6, ease: "power2.out" });
    });
    phoneStage.addEventListener("mouseleave", function () {
      gsap.to(phoneMock, { rotateY: -14, rotateX: 0, duration: 1 });
    });
  }

  /* ============ Animated counters ============
     Numbers already show their final value in the HTML;
     this just animates a count-up on top when the element
     scrolls into view. */
  function animateCounter(el) {
    var target = parseFloat(el.dataset.count);
    var decimals = parseInt(el.dataset.decimal || "0", 10);
    var suffix = el.dataset.suffix || "";
    if (hasGSAP) {
      var obj = { val: 0 };
      gsap.to(obj, {
        val: target, duration: 2, ease: "power2.out",
        onUpdate: function () { el.textContent = obj.val.toFixed(decimals) + suffix; }
      });
    } else {
      el.textContent = target.toFixed(decimals) + suffix;
    }
  }
  document.querySelectorAll("[data-count]").forEach(function (el) {
    if (hasGSAP && window.ScrollTrigger) {
      ScrollTrigger.create({
        trigger: el, start: "top 92%", once: true,
        onEnter: function () { animateCounter(el); }
      });
    }
    // if no GSAP/ScrollTrigger, the HTML default value is already the final number
  });

  /* ============ Testimonial carousel ============ */
  var track = document.getElementById("carouselTrack");
  var dotsWrap = document.getElementById("carouselDots");
  var cards = track ? Array.prototype.slice.call(track.children) : [];
  cards.forEach(function (card, i) {
    var d = document.createElement("span");
    if (i === 0) d.classList.add("active");
    d.addEventListener("click", function () {
      cards[i].scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    });
    if (dotsWrap) dotsWrap.appendChild(d);
  });
  function updateActiveCard() {
    if (!track) return;
    var trackRect = track.getBoundingClientRect();
    var center = trackRect.left + trackRect.width / 2;
    var closest = 0, closestDist = Infinity;
    cards.forEach(function (c, i) {
      var r = c.getBoundingClientRect();
      var dist = Math.abs((r.left + r.width / 2) - center);
      if (dist < closestDist) { closestDist = dist; closest = i; }
      c.classList.toggle("is-active", dist < r.width / 2);
    });
    if (dotsWrap) {
      dotsWrap.querySelectorAll("span").forEach(function (d, i) { d.classList.toggle("active", i === closest); });
    }
  }
  if (track) {
    track.addEventListener("scroll", function () { requestAnimationFrame(updateActiveCard); }, { passive: true });
    updateActiveCard();
    if (cards[0]) cards[0].classList.add("is-active");
  }

  /* ============ CTA canvas — explosive particles (pure Canvas2D, no WebGL) ============ */
  var ctaCanvas = document.getElementById("cta-canvas");
  if (ctaCanvas) {
    var ctx = ctaCanvas.getContext("2d");
    var w, h, particles = [];

    function resize() {
      w = ctaCanvas.width = ctaCanvas.clientWidth;
      h = ctaCanvas.height = ctaCanvas.clientHeight;
    }
    window.addEventListener("resize", resize);
    resize();

    function spawn() {
      particles = [];
      var count = Math.min(140, Math.floor(w / 8));
      for (var i = 0; i < count; i++) {
        particles.push({
          x: w / 2, y: h / 2,
          vx: (Math.random() - 0.5) * 4,
          vy: (Math.random() - 0.5) * 4,
          life: Math.random() * 1 + 0.5,
          age: 0,
          color: Math.random() > 0.5 ? "30,144,255" : "255,106,0",
          r: Math.random() * 2 + 0.6,
        });
      }
    }

    var started = false;
    if (hasGSAP && window.ScrollTrigger) {
      ScrollTrigger.create({
        trigger: ctaCanvas, start: "top 85%", once: true,
        onEnter: function () { started = true; spawn(); }
      });
    } else {
      started = true; spawn();
    }

    function loop() {
      requestAnimationFrame(loop);
      ctx.clearRect(0, 0, w, h);
      if (!started) return;
      particles.forEach(function (p) {
        p.age += 0.008;
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.99; p.vy *= 0.99;
        var alpha = Math.max(0, 1 - p.age / p.life);
        ctx.beginPath();
        ctx.fillStyle = "rgba(" + p.color + "," + (alpha * 0.8) + ")";
        ctx.shadowColor = "rgba(" + p.color + ",1)";
        ctx.shadowBlur = 8;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        if (p.age >= p.life) {
          p.x = w / 2; p.y = h / 2; p.age = 0;
          p.vx = (Math.random() - 0.5) * 4;
          p.vy = (Math.random() - 0.5) * 4;
        }
      });
    }
    loop();
  }
})();
