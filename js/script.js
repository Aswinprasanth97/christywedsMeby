/* ============================================================
   Meby & Christy — Wedding Invitation
   Vanilla JS: loader, countdown, RSVP (localStorage),
   calendar (.ics), share, copy, music, back-to-top.
   ============================================================ */
(function () {
  "use strict";

  /* ---------- Wedding config (single source of truth) ---------- */
  var WEDDING = {
    coupleShort: "Meby & Christy",
    coupleFull: "Meby Abraham & Christy Thomas",
    // Local time: Monday, 16 Nov 2026, 11:00 AM IST
    dateLocalISO: "2026-11-16T11:00:00",
    // UTC for the .ics file (IST = UTC+5:30 → 11:00 IST = 05:30Z)
    icsStartUTC: "20261116T053000Z",
    icsEndUTC: "20261116T073000Z",
    venue: "St. John The Baptist Jacobite Syrian Church (Attamangalam Pally)",
    address:
      "St. John The Baptist Jacobite Syrian Church (Attamangalam Pally), Kottayam–Cherthala Road, Kumarakom, Kerala – 686563",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=St%20John%20The%20Baptist%20Jacobite%20Syrian%20Church%20Attamangalam%20Kumarakom%20Kerala",

    // Paste your Google Apps Script Web App URL here to collect RSVPs in a Sheet.
    // Leave "" to keep responses saved only on the guest's device (localStorage).
    // See google-apps-script/README.md for the 4-step setup.
    sheetEndpoint:
      "https://script.google.com/macros/s/AKfycbwJQY9RE7zSfd5x76wxsPULn0dGy9gdqeA9JbNknZ3s3LWSkNoDWZb7yFe7Y_w6rDrt/exec",
  };

  var $ = function (sel, ctx) {
    return (ctx || document).querySelector(sel);
  };
  var $$ = function (sel, ctx) {
    return Array.prototype.slice.call((ctx || document).querySelectorAll(sel));
  };

  /* ---------- Toast ---------- */
  var toastTimer;
  function toast(msg) {
    var t = $("#toast");
    if (!t) return;
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      t.classList.remove("show");
    }, 2600);
  }

  /* ---------- Loader / "Open Invitation" entry gate ---------- */
  var startMusic = function () {}; // assigned by initMusic()

  function hideLoader() {
    var loader = $("#loader");
    if (loader) loader.classList.add("hidden");
    document.body.style.overflow = "";
  }

  function initLoader() {
    var loader = $("#loader");
    if (!loader) return;
    document.body.style.overflow = "hidden"; // lock scroll behind the gate

    var enterBtn = $("#enterBtn");
    var ring = $("#loaderRing");
    var hint = $("#loaderHint");
    var entered = false;

    // Swap the spinner for the "Open Invitation" button once assets are in.
    function ready() {
      if (ring) ring.style.display = "none";
      if (enterBtn) enterBtn.style.display = "inline-flex";
      if (hint) hint.style.display = "block";
      if (enterBtn) {
        try {
          enterBtn.focus({ preventScroll: true });
        } catch (e) {}
      }
    }
    if (document.readyState === "complete") setTimeout(ready, 300);
    else
      window.addEventListener("load", function () {
        setTimeout(ready, 350);
      });
    setTimeout(ready, 3500); // safety: reveal even if 'load' never fires

    function enter() {
      if (entered) return;
      entered = true;
      hideLoader();
      startMusic(false); // real user click → browsers permit sound

      // Land on the hero/top section, then reveal its animations.
      window.scrollTo(0, 0);
      var hero = $("#top");
      if (hero) hero.scrollIntoView({ block: "start" });
      if (window.AOS && window.AOS.refresh) {
        // Scroll was locked while the gate was up — recalc so the hero fades in.
        setTimeout(function () {
          window.AOS.refresh();
        }, 60);
      }
    }
    if (enterBtn) enterBtn.addEventListener("click", enter);
  }

  /* ---------- AOS (optional, loaded via CDN) ---------- */
  function initAOS() {
    if (window.AOS) {
      window.AOS.init({
        duration: 850,
        easing: "ease-out-cubic",
        once: true,
        offset: 60,
        disable: function () {
          return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        },
      });
    }
  }

  /* ---------- Animated background: drifting petals ---------- */
  function initBackground() {
    var host = $("#bgFx");
    if (!host) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Fewer petals on small screens to keep things light.
    var count = window.innerWidth < 640 ? 18 : 34;
    var frag = document.createDocumentFragment();

    function rand(min, max) { return Math.random() * (max - min) + min; }

    for (var i = 0; i < count; i++) {
      var p = document.createElement("span");
      p.className = "petal" + (Math.random() < 0.35 ? " gold" : "");

      var size = rand(12, 30);
      var duration = rand(10, 20);
      var delay = -rand(0, duration); // negative delay = staggered, already in motion
      var drift = rand(-8, 8);        // horizontal sway in vw
      var spin = rand(180, 720) * (Math.random() < 0.5 ? -1 : 1);

      p.style.left = rand(-2, 100) + "vw";
      p.style.width = size + "px";
      p.style.height = size + "px";
      p.style.animationDuration = duration + "s";
      p.style.animationDelay = delay + "s";
      p.style.setProperty("--drift", drift + "vw");
      p.style.setProperty("--spin", spin + "deg");
      p.style.opacity = rand(0.35, 0.8).toFixed(2);

      frag.appendChild(p);
    }
    host.appendChild(frag);
  }

  /* ---------- Countdown ---------- */
  function initCountdown() {
    var target = new Date(WEDDING.dateLocalISO).getTime();
    var elD = $("#cd-days"),
      elH = $("#cd-hours"),
      elM = $("#cd-mins"),
      elS = $("#cd-secs");
    var wrap = $("#countdown"),
      done = $("#countdown-done");
    if (!elD) return;

    function pad(n) {
      return (n < 10 ? "0" : "") + n;
    }

    function tick() {
      var now = Date.now();
      var diff = target - now;
      if (diff <= 0) {
        if (wrap) wrap.style.display = "none";
        if (done) done.style.display = "block";
        clearInterval(timer);
        return;
      }
      var days = Math.floor(diff / 86400000);
      var hours = Math.floor((diff % 86400000) / 3600000);
      var mins = Math.floor((diff % 3600000) / 60000);
      var secs = Math.floor((diff % 60000) / 1000);
      elD.textContent = pad(days);
      elH.textContent = pad(hours);
      elM.textContent = pad(mins);
      elS.textContent = pad(secs);
    }
    tick();
    var timer = setInterval(tick, 1000);
  }

  /* ---------- RSVP form + localStorage ---------- */
  var RSVP_KEY = "mc_wedding_rsvps";

  function loadRsvps() {
    try {
      return JSON.parse(localStorage.getItem(RSVP_KEY)) || [];
    } catch (e) {
      return [];
    }
  }
  function saveRsvps(list) {
    try {
      localStorage.setItem(RSVP_KEY, JSON.stringify(list));
    } catch (e) {}
  }

  function initRSVP() {
    var form = $("#rsvpForm");
    if (!form) return;
    var thanks = $("#rsvpThanks");
    var thanksName = $("#thanksName");
    var submitBtn = form.querySelector('button[type="submit"]');

    function showThanks(name) {
      if (thanksName)
        thanksName.textContent = (name || "").split(" ")[0] || "friend";
      form.style.display = "none";
      if (thanks) {
        thanks.style.display = "block";
        thanks.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      toast("Thank you for your response ❤️");
    }

    // Restore a friendly note if they've already responded on this device
    var existing = loadRsvps();
    if (existing.length) {
      var last = existing[existing.length - 1];
      var note = $("#rsvpReturning");
      if (note && last && last.name) {
        note.textContent =
          "You've already responded as " +
          last.name +
          ". You may submit again to update your response.";
        note.style.display = "block";
      }
    }

    // Access controls safely (form.name would return the <form>'s own name prop)
    function field(n) {
      return form.elements.namedItem(n);
    }
    function val(n) {
      var el = field(n);
      return el ? (el.value || "").trim() : "";
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var data = {
        name: val("name"),
        mobile: val("mobile"),
        email: val("email"),
        attending:
          (form.querySelector('input[name="attending"]:checked') || {}).value ||
          "",
        guests: val("guests") || "1",
        message: val("message"),
        at: new Date().toISOString(),
      };

      if (!data.name) {
        toast("Please enter your name");
        var fn = field("name");
        if (fn) fn.focus();
        return;
      }
      if (!data.mobile) {
        toast("Please enter your mobile number");
        var fm = field("mobile");
        if (fm) fm.focus();
        return;
      }
      if (!data.attending) {
        toast("Please let us know if you can attend");
        return;
      }

      // Always keep a local backup copy on the device.
      var list = loadRsvps();
      list.push(data);
      saveRsvps(list);

      // Send to the Google Sheet if an endpoint is configured.
      var endpoint = WEDDING.sheetEndpoint;
      if (endpoint && /^https:\/\//.test(endpoint)) {
        var oldLabel = submitBtn ? submitBtn.innerHTML : "";
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = "Sending…";
        }

        var finish = function (ok, err) {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = oldLabel;
          }
          if (!ok) {
            console.warn(
              "RSVP: could not confirm Sheet write —",
              err,
              "(response is saved locally as a backup)",
            );
          }
          showThanks(data.name);
        };

        // The Apps Script endpoint sends Access-Control-Allow-Origin: *,
        // so we can read a real success/error response. text/plain keeps it
        // a "simple" request (no CORS preflight, which Apps Script can't answer).
        fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify(data),
        })
          .then(function (res) {
            return res.json().catch(function () {
              return { result: res.ok ? "success" : "error" };
            });
          })
          .then(function (out) {
            finish(out && out.result === "success", out && out.error);
          })
          .catch(function (e) {
            finish(false, e);
          });
      } else {
        showThanks(data.name);
      }
    });

    // "Respond again" resets the form view
    var again = $("#rsvpAgain");
    if (again) {
      again.addEventListener("click", function () {
        form.reset();
        form.style.display = "";
        if (thanks) thanks.style.display = "none";
        form.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    }
  }

  /* ---------- Add to Calendar (.ics) ---------- */
  function downloadICS() {
    var uid = "mc-wedding-" + Date.now() + "@invitation";
    var lines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Meby & Christy//Wedding//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      "UID:" + uid,
      "DTSTAMP:" +
        new Date().toISOString().replace(/[-:]/g, "").split(".")[0] +
        "Z",
      "DTSTART:" + WEDDING.icsStartUTC,
      "DTEND:" + WEDDING.icsEndUTC,
      "SUMMARY:" + WEDDING.coupleFull + " — Wedding",
      "DESCRIPTION:Holy Sacrament of Matrimony. We would be honoured by your presence.",
      "LOCATION:" + WEDDING.address.replace(/,/g, "\\,"),
      "STATUS:CONFIRMED",
      "END:VEVENT",
      "END:VCALENDAR",
    ];
    var blob = new Blob([lines.join("\r\n")], {
      type: "text/calendar;charset=utf-8",
    });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "Meby-Christy-Wedding.ics";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 1500);
    toast("Calendar invite downloaded 📅");
  }

  /* ---------- Copy address ---------- */
  function copyAddress() {
    var text = WEDDING.address;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(
        function () {
          toast("Address copied to clipboard ✓");
        },
        function () {
          fallbackCopy(text);
        },
      );
    } else {
      fallbackCopy(text);
    }
  }
  function fallbackCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
      toast("Address copied to clipboard ✓");
    } catch (e) {
      toast("Copy not supported — please copy manually");
    }
    document.body.removeChild(ta);
  }

  /* ---------- WhatsApp share ---------- */
  function shareWhatsApp() {
    var msg =
      "You're invited to the wedding of " +
      WEDDING.coupleFull +
      " on Monday, 16 November 2026 at 11:00 AM, " +
      WEDDING.venue +
      ". " +
      "View the invitation: " +
      window.location.href;
    var url = "https://wa.me/?text=" + encodeURIComponent(msg);
    window.open(url, "_blank", "noopener");
  }

  /* ---------- Native share fallback ---------- */
  function nativeShare() {
    if (navigator.share) {
      navigator
        .share({
          title: WEDDING.coupleFull + " — Wedding Invitation",
          text: "You're invited to our wedding on 16 November 2026 ❤️",
          url: window.location.href,
        })
        .catch(function () {});
    } else {
      shareWhatsApp();
    }
  }

  /* ---------- Background music ---------- */
  function initMusic() {
    var btn = $("#musicToggle");
    var audio = $("#bgMusic");
    if (!btn || !audio) return;
    var iconOn = $("#musicOn"),
      iconOff = $("#musicOff");
    var playing = false;

    function setIcon() {
      if (iconOn) iconOn.style.display = playing ? "block" : "none";
      if (iconOff) iconOff.style.display = playing ? "none" : "block";
      btn.setAttribute("aria-label", playing ? "Mute music" : "Play music");
      btn.setAttribute("aria-pressed", String(playing));
    }
    setIcon();

    function play(showHint) {
      audio.muted = false;
      var p = audio.play();
      if (p && typeof p.then === "function") {
        return p
          .then(function () {
            playing = true;
            setIcon();
          })
          .catch(function (err) {
            playing = false;
            setIcon();
            if (showHint) toast("Add an audio file to /audio to enable music");
            throw err;
          });
      }
      playing = true;
      setIcon();
      return Promise.resolve();
    }

    // Exposed so the "Open Invitation" gate can kick off music on entry.
    startMusic = function (showHint) {
      play(!!showHint).catch(function () {});
    };

    // Manual mute / unmute toggle.
    btn.addEventListener("click", function () {
      if (playing) {
        audio.pause();
        playing = false;
        setIcon();
      } else {
        play(true);
      }
    });
  }

  /* ---------- Back to top + RSVP FAB visibility ---------- */
  function initScrollFabs() {
    var top = $("#backToTop");
    var rsvpFab = $("#rsvpJump");
    function onScroll() {
      var y = window.scrollY || window.pageYOffset;
      if (top) top.classList.toggle("show", y > 500);
      if (rsvpFab) rsvpFab.classList.toggle("show-fab", y > 700);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    if (top)
      top.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
  }

  /* ---------- Smooth anchor scrolling (for older browsers) ---------- */
  function initAnchors() {
    $$('a[href^="#"]').forEach(function (a) {
      a.addEventListener("click", function (e) {
        var id = a.getAttribute("href");
        if (id.length < 2) return;
        var el = document.querySelector(id);
        if (el) {
          e.preventDefault();
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    });
  }

  /* ---------- Wire up buttons ---------- */
  function initButtons() {
    $$("[data-action]").forEach(function (el) {
      el.addEventListener("click", function (e) {
        var action = el.getAttribute("data-action");
        switch (action) {
          case "calendar":
            e.preventDefault();
            downloadICS();
            break;
          case "copy":
            e.preventDefault();
            copyAddress();
            break;
          case "whatsapp":
            e.preventDefault();
            shareWhatsApp();
            break;
          case "share":
            e.preventDefault();
            nativeShare();
            break;
          case "maps":
            /* real link, let it open */ break;
        }
      });
    });
  }

  /* ---------- Boot ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    initAOS();
    initBackground(); // aura + drifting petals
    initCountdown();
    initRSVP();
    initMusic(); // defines startMusic()
    initLoader(); // "Open Invitation" gate → starts music on entry
    initScrollFabs();
    initAnchors();
    initButtons();

    // Set current year in footer
    var yr = $("#year");
    if (yr) yr.textContent = new Date().getFullYear();
  });
})();
