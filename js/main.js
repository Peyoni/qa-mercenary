/* =========================
   SITE EFFECTS
   (separate from main.js so the bug hunt stays untouched)
   ========================= */

document.addEventListener("DOMContentLoaded", () => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* ---- Scroll progress bar ---- */
    const bar = document.getElementById("progress");
    function onScroll() {
        const h = document.documentElement;
        const max = h.scrollHeight - h.clientHeight;
        if (bar && max > 0) bar.style.width = (h.scrollTop / max) * 100 + "%";
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    /* ---- Reveal on scroll (class is removed afterwards so hover transitions stay snappy) ---- */
    const reveals = document.querySelectorAll(".rv");
    if (!("IntersectionObserver" in window) || reduce) {
        reveals.forEach((el) => el.classList.remove("rv"));
    } else {
        const io = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                const el = entry.target;
                const siblings = Array.from(el.parentElement.children).filter((c) => c.classList.contains("rv"));
                el.style.transitionDelay = Math.min(siblings.indexOf(el), 5) * 90 + "ms";
                el.classList.add("in");
                io.unobserve(el);
                setTimeout(() => {
                    el.classList.remove("rv", "in");
                    el.style.transitionDelay = "";
                }, 1000);
            });
        }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
        reveals.forEach((el) => io.observe(el));
    }

    /* ---- Count-up stats ---- */
    const counters = document.querySelectorAll("[data-count]");
    function runCounter(el) {
        const target = parseFloat(el.dataset.count);
        const dec = parseInt(el.dataset.dec || "0", 10);
        if (reduce) { el.textContent = target.toFixed(dec); return; }
        const start = performance.now();
        const dur = 1200;
        (function tick(now) {
            const t = Math.min((now - start) / dur, 1);
            const eased = 1 - Math.pow(1 - t, 3);
            el.textContent = (target * eased).toFixed(dec);
            if (t < 1) requestAnimationFrame(tick);
        })(start);
    }
    if ("IntersectionObserver" in window) {
        const co = new IntersectionObserver((entries) => {
            entries.forEach((e) => {
                if (e.isIntersecting) { runCounter(e.target); co.unobserve(e.target); }
            });
        }, { threshold: 0.6 });
        counters.forEach((el) => co.observe(el));
    }

    /* ---- Cursor spotlight on cards ---- */
    document.querySelectorAll(".spot").forEach((el) => {
        el.addEventListener("pointermove", (e) => {
            const r = el.getBoundingClientRect();
            el.style.setProperty("--mx", e.clientX - r.left + "px");
            el.style.setProperty("--my", e.clientY - r.top + "px");
        });
        el.addEventListener("pointerleave", () => {
            el.style.removeProperty("--mx");
            el.style.removeProperty("--my");
        });
    });

    /* ---- Active nav link (scrollspy) ---- */
    const links = Array.from(document.querySelectorAll("#menu a[href^='#']:not(.nav-cta)"));
    const targets = links.map((a) => document.querySelector(a.getAttribute("href"))).filter(Boolean);
    function spy() {
        const y = window.scrollY + 140;
        let current = null;
        targets.forEach((t) => { if (t.offsetTop <= y) current = t.id; });
        links.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + current));
    }
    window.addEventListener("scroll", spy, { passive: true });
    spy();

    /* ---- Mobile menu ---- */
    const btn = document.getElementById("menuBtn");
    const menu = document.getElementById("menu");
    if (btn && menu) {
        const setOpen = (open) => {
            menu.classList.toggle("open", open);
            btn.setAttribute("aria-expanded", String(open));
        };
        btn.addEventListener("click", () => setOpen(!menu.classList.contains("open")));
        menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setOpen(false)));
    }

    /* ---- Copy email ---- */
    const copy = document.getElementById("copyMail");
    if (copy) {
        const label = copy.textContent;
        copy.addEventListener("click", async () => {
            try {
                await navigator.clipboard.writeText(copy.dataset.mail);
                copy.textContent = "Copied ✓";
            } catch (err) {
                copy.textContent = copy.dataset.mail;
            }
            setTimeout(() => { copy.textContent = label; }, 2000);
        });
    }
    /* ---- Sample report: play status flow + stamp when visible ---- */
    const ticket = document.querySelector(".ticket");
    if (ticket && "IntersectionObserver" in window && !reduce) {
        ticket.classList.add("armed");
        const to = new IntersectionObserver((entries) => {
            entries.forEach((e) => {
                if (e.isIntersecting) { ticket.classList.add("play"); to.disconnect(); }
            });
        }, { threshold: 0.45 });
        to.observe(ticket);
    }

    /* ---- Brief form: builds a pre-filled email (no backend needed) ---- */
    const brief = document.getElementById("brief");
    if (brief) {
        brief.addEventListener("submit", (e) => {
            e.preventDefault();
            const f = new FormData(brief);
            const name = String(f.get("name") || "").trim();
            const project = String(f.get("project") || "").trim();
            const msg = String(f.get("message") || "").trim();
            const services = f.getAll("services");
            const lines = [
                "Hi Nikola,",
                "",
                "Name: " + name,
                project ? "Project / studio: " + project : null,
                services.length ? "Looking for: " + services.join(", ") : null,
                msg ? "" : null,
                msg || null,
                "",
                "— " + name
            ].filter((l) => l !== null);
            const subject = "Project inquiry" + (project ? " — " + project : "");
            window.location.href = "mailto:nikolapejic002@gmail.com?subject=" +
                encodeURIComponent(subject) + "&body=" + encodeURIComponent(lines.join("\n"));
        });
    }
    /* ---- Floating embers (canvas) ---- */
    const cv = document.getElementById("embers");
    if (cv && cv.getContext && !reduce) {
        const ctx = cv.getContext("2d");
        const count = window.innerWidth < 700 ? 24 : 48;
        const rnd = (a, b) => a + Math.random() * (b - a);
        let w = 0, h = 0, dpr = 1, raf = 0, parts = [];
        const make = (init) => ({
            x: rnd(0, w), y: init ? rnd(0, h) : h + rnd(0, 40),
            r: rnd(0.6, 2.1), vy: rnd(0.25, 0.9), sway: rnd(0.4, 1.6),
            ph: rnd(0, 6.28), life: rnd(0.55, 1), hue: rnd(16, 38)
        });
        function resize() {
            dpr = Math.min(window.devicePixelRatio || 1, 2);
            w = window.innerWidth; h = window.innerHeight;
            cv.width = w * dpr; cv.height = h * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            if (!parts.length) parts = Array.from({ length: count }, () => make(true));
        }
        function frame(t) {
            ctx.clearRect(0, 0, w, h);
            for (const p of parts) {
                p.y -= p.vy;
                p.x += Math.sin(t / 900 + p.ph) * 0.35 * p.sway;
                const fade = Math.max(0, Math.min(1, (p.y / h) * 1.6)) * p.life;
                const a = fade * (0.75 + 0.25 * Math.sin(t / 140 + p.ph * 3));
                const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 5);
                g.addColorStop(0, "hsla(" + p.hue + ",95%,62%," + a + ")");
                g.addColorStop(0.35, "hsla(" + p.hue + ",95%,50%," + a * 0.45 + ")");
                g.addColorStop(1, "hsla(" + p.hue + ",95%,40%,0)");
                ctx.fillStyle = g;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r * 5, 0, 6.283);
                ctx.fill();
                if (p.y < -10 || p.x < -20 || p.x > w + 20) Object.assign(p, make(false));
            }
            raf = requestAnimationFrame(frame);
        }
        resize();
        window.addEventListener("resize", resize);
        document.addEventListener("visibilitychange", () => {
            if (document.hidden) cancelAnimationFrame(raf);
            else raf = requestAnimationFrame(frame);
        });
        raf = requestAnimationFrame(frame);
    }
});
