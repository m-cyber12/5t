/* ADRIAN KESSLER — interactions
   loader · cursor · canvas waveform · reveals · counters · clock */
(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- loader ---------- */
  var loader = document.getElementById("loader");
  var count = 0;
  var countEl = document.getElementById("loaderCount");
  function tick() {
    count += Math.random() * 9 + 3;
    if (count >= 100) {
      count = 100;
      countEl.textContent = "100";
      setTimeout(function () {
        loader.classList.add("done");
        document.body.style.overflow = "";
      }, 300);
      return;
    }
    countEl.textContent = String(Math.floor(count)).padStart(2, "0");
    setTimeout(tick, 55 + Math.random() * 70);
  }
  document.body.style.overflow = "hidden";
  if (reduced) {
    countEl.textContent = "100";
    loader.classList.add("done");
    document.body.style.overflow = "";
  } else {
    setTimeout(tick, 250);
  }

  /* ---------- custom cursor ---------- */
  var dot = document.getElementById("cursorDot");
  var ring = document.getElementById("cursorRing");
  var fine = window.matchMedia("(pointer: fine)").matches;
  if (fine && !reduced) {
    var mx = -100, my = -100, rx = -100, ry = -100;
    window.addEventListener("mousemove", function (e) {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = "translate(" + mx + "px," + my + "px) translate(-50%,-50%)";
    }, { passive: true });
    (function loop() {
      rx += (mx - rx) * 0.14;
      ry += (my - ry) * 0.14;
      ring.style.transform = "translate(" + rx + "px," + ry + "px) translate(-50%,-50%)";
      requestAnimationFrame(loop);
    })();
    document.querySelectorAll('a, button, [data-cursor]').forEach(function (el) {
      el.addEventListener("mouseenter", function () { ring.classList.add("grow"); });
      el.addEventListener("mouseleave", function () { ring.classList.remove("grow"); });
    });
  }

  /* ---------- hero waveform canvas ---------- */
  var canvas = document.getElementById("waveCanvas");
  if (canvas && !reduced) {
    var ctx = canvas.getContext("2d");
    var W = 0, H = 0, t = 0;
    var mouse = { x: 0.5, amp: 1 };
    var waves = [
      { color: "rgba(210,154,75,0.8)",   freq: 0.7,  speed: 0.55, yBase: 0.42, yAmp: 74,  width: 2 },
      { color: "rgba(232,228,220,0.35)", freq: 1.3,  speed: -0.32, yBase: 0.46, yAmp: 46, width: 1 },
      { color: "rgba(210,154,75,0.3)",   freq: 2.1,  speed: 0.85, yBase: 0.4,  yAmp: 26, width: 1 }
    ];
    function resize() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.clientWidth; H = canvas.clientHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("mousemove", function (e) {
      var r = canvas.getBoundingClientRect();
      mouse.x = (e.clientX - r.left) / r.width;
    }, { passive: true });

    function draw() {
      ctx.clearRect(0, 0, W, H);
      t++;
      for (var i = 0; i < waves.length; i++) {
        var w = waves[i];
        ctx.beginPath();
        ctx.strokeStyle = w.color;
        ctx.lineWidth = w.width;
        for (var x = 0; x <= W; x += 3) {
          var k = x / W;
          var swell = Math.exp(-Math.pow((k - mouse.x) * 2.2, 2)) * w.yAmp * 0.55 + 1;
          var y = H * w.yBase + Math.sin(k * w.freq * Math.PI * 4 + t * 0.02 * w.speed) * w.yAmp * swell;
          if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      requestAnimationFrame(draw);
    }
    draw();
  }

  /* ---------- reveal on scroll ---------- */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) {
        en.target.classList.add("in");
        io.unobserve(en.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
  document.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });

  /* ---------- animated counters ---------- */
  var cio = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      cio.unobserve(en.target);
      var el = en.target;
      var target = parseInt(el.getAttribute("data-count"), 10);
      var start = null, dur = 1600;
      if (reduced) { el.textContent = String(target); return; }
      function step(ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 4);
        el.textContent = String(Math.round(target * eased));
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }, { threshold: 0.6 });
  document.querySelectorAll("[data-count]").forEach(function (el) { cio.observe(el); });

  /* ---------- nav scrolled state ---------- */
  var nav = document.getElementById("nav");
  function onScroll() {
    nav.classList.toggle("scrolled", window.scrollY > 40);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- text scramble on hover ---------- */
  document.querySelectorAll("[data-scramble]").forEach(function (el) {
    if (reduced) return;
    var original = el.textContent;
    var chars = "01╱/\\·—=__+=*#AEKLMNOPRSTUX";
    var frame = null;
    el.addEventListener("mouseenter", function () {
      var iter = 0;
      cancelAnimationFrame(frame);
      (function scramble() {
        el.textContent = original.split("").map(function (ch, idx) {
          if (ch === " ") return " ";
          if (idx < iter) return original[idx];
          return chars[Math.floor(Math.random() * chars.length)];
        }).join("");
        iter += 0.6;
        if (iter < original.length) {
          frame = requestAnimationFrame(scramble);
        } else {
          el.textContent = original;
        }
      })();
    });
    el.addEventListener("mouseleave", function () {
      cancelAnimationFrame(frame);
      el.textContent = original;
    });
  });

  /* ---------- live Zürich clock ---------- */
  var clock = document.getElementById("clock");
  function updateClock() {
    var now = new Date();
    var zurich = new Date(now.getTime() + (now.getTimezoneOffset() * 60000) + 3600000);
    var h = String(zurich.getHours()).padStart(2, "0");
    var m = String(zurich.getMinutes()).padStart(2, "0");
    var s = String(zurich.getSeconds()).padStart(2, "0");
    clock.textContent = "ZÜRICH — " + h + ":" + m + ":" + s;
  }
  updateClock();
  setInterval(updateClock, 1000);

  /* ---------- back to top ---------- */
  document.getElementById("toTop").addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  });
})();
