(function () {
  "use strict";

  var root = document.getElementById("projects-root");
  var count = document.getElementById("project-count");
  var projects = Array.isArray(window.PROJECTS) ? window.PROJECTS : [];
  var groups = [
    { key: "done", label: "Terminados" },
    { key: "in-progress", label: "En desarrollo" }
  ];

  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (character) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }[character];
    });
  }

  function getInitials(title) {
    var words = String(title || "").trim().split(/\s+/).filter(Boolean);
    if (words.length === 1) {
      return words[0].slice(0, 2).toUpperCase();
    }
    return words.slice(0, 2).map(function (word) {
      return word.charAt(0).toUpperCase();
    }).join("") || "PR";
  }

  function buildTags(tags) {
    return (Array.isArray(tags) ? tags : []).map(function (tag) {
      return '<li class="tag">' + escapeHtml(tag) + "</li>";
    }).join("");
  }

  function buildLinks(project) {
    var links = [];
    if (project.demo) {
      links.push('<a href="' + escapeHtml(project.demo) + '" target="_blank" rel="noopener noreferrer">Ver demo ↗</a>');
    }
    if (project.repo) {
      links.push('<a href="' + escapeHtml(project.repo) + '" target="_blank" rel="noopener noreferrer">Código ↗</a>');
    }
    if (!links.length) {
      links.push('<span class="muted-link">Sin enlace aún</span>');
    }
    return links.join("");
  }

  function isDone(project) {
    return project.status === "done";
  }

  function buildCard(project, index) {
    var hue = (index * 25 + 200) % 360;
    var done = isDone(project);
    return (
      '<article class="project-card reveal" style="--hue: ' + hue + '">' +
        '<div class="project-cover" aria-hidden="true">' +
          '<span class="project-index">' + String(index + 1).padStart(2, "0") + "</span>" +
          '<span class="status-badge ' + (done ? "status-done" : "status-progress") + '">' +
            (done ? "Terminado" : "En desarrollo") +
          "</span>" +
          '<span class="project-initials">' + escapeHtml(getInitials(project.title)) + "</span>" +
        "</div>" +
        '<div class="project-body">' +
          '<div class="project-top">' +
            "<h3>" + escapeHtml(project.title) + "</h3>" +
            (project.year ? '<span class="project-year">' + escapeHtml(project.year) + "</span>" : "") +
          "</div>" +
          '<p class="project-description">' + escapeHtml(project.description) + "</p>" +
          '<ul class="tags">' + buildTags(project.tags) + "</ul>" +
          '<div class="project-links">' + buildLinks(project) + "</div>" +
        "</div>" +
      "</article>"
    );
  }

  function renderProjects() {
    if (!root) return;

    if (!projects.length) {
      root.innerHTML = '<p class="noscript">Todavía no hay proyectos publicados.</p>';
      return;
    }

    var counter = 0;
    root.innerHTML = groups.map(function (group) {
      var members = projects.filter(function (project) {
        return group.key === "done" ? isDone(project) : !isDone(project);
      });
      if (!members.length) return "";

      var cards = members.map(function (project) {
        counter += 1;
        return buildCard(project, counter - 1);
      }).join("");

      return (
        '<div class="project-group">' +
          '<div class="group-head">' +
            '<h3><span class="group-dot group-dot--' + (group.key === "done" ? "done" : "progress") + '"></span>' +
              group.label +
            "</h3>" +
            '<span class="group-count">' + members.length + "</span>" +
          "</div>" +
          '<div class="projects-grid">' + cards + "</div>" +
        "</div>"
      );
    }).join("");

    if (count) {
      count.textContent = projects.length + (projects.length === 1 ? " proyecto" : " proyectos");
    }
  }

  function initReveal() {
    var elements = document.querySelectorAll(".reveal");
    if (!elements.length) return;

    if (!("IntersectionObserver" in window)) {
      elements.forEach(function (element) {
        element.classList.add("is-visible");
      });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

    elements.forEach(function (element) {
      observer.observe(element);
    });
  }

  function initYear() {
    var year = document.getElementById("year");
    if (year) year.textContent = new Date().getFullYear();
  }

  function initHeroStars() {
    var field = document.querySelector(".hero-stars");
    if (!field) return;

    var prefersReduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      field.innerHTML = "";
      return;
    }

    field.innerHTML = "";

    var palette = [
      "linear-gradient(135deg, #eaf6ff, #3d8bff)",
      "linear-gradient(135deg, #d8ecff, #2b7be0)",
      "linear-gradient(135deg, #f2fbff, #2ee6f6)",
      "linear-gradient(135deg, #cfe6ff, #4f9dff)"
    ];
    var STAR_COUNT = 18;
    var stars = [];

    function random(min, max) {
      return min + Math.random() * (max - min);
    }

    function resetStar(star, fromEdge) {
      var width = field.clientWidth || window.innerWidth;
      var height = field.clientHeight || window.innerHeight;
      var speed = random(170, 300);
      var slope = random(0.06, 0.2);

      if (fromEdge) {
        star.x = star.direction > 0 ? random(-160, -30) : random(width + 30, width + 160);
      } else {
        star.x = random(-width * 0.1, width * 1.1);
      }

      star.y = random(-height * 0.1, height * 0.85);
      star.vx = speed * star.direction;
      star.vy = speed * slope;
      star.active = true;
      star.el.classList.remove("star--collapsed");
      star.el.style.opacity = "1";
    }

    function makeStar() {
      var el = document.createElement("span");
      var direction = Math.random() < 0.5 ? 1 : -1;
      var star = {
        el: el,
        direction: direction,
        size: random(8, 17),
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        active: true
      };

      el.className = "star" + (direction < 0 ? " star--right" : "");
      el.style.width = star.size + "px";
      el.style.height = star.size + "px";
      el.style.background = palette[Math.floor(Math.random() * palette.length)];
      field.appendChild(el);
      resetStar(star, false);
      return star;
    }

    function spawnCollapse(x, y, size) {
      var burst = document.createElement("span");
      burst.className = "star-collapse";
      burst.style.left = x + "px";
      burst.style.top = y + "px";
      burst.style.setProperty("--burst-size", Math.max(size * 2.6, 34) + "px");
      field.appendChild(burst);
      window.setTimeout(function () {
        if (burst.parentNode) burst.parentNode.removeChild(burst);
      }, 950);
    }

    function collapse(a, b) {
      a.active = false;
      b.active = false;
      a.el.classList.add("star--collapsed");
      b.el.classList.add("star--collapsed");
      spawnCollapse(
        (a.x + b.x) / 2 + a.size / 2,
        (a.y + b.y) / 2 + a.size / 2,
        Math.max(a.size, b.size)
      );

      window.setTimeout(function () {
        resetStar(a, true);
        resetStar(b, true);
      }, 900);
    }

    for (var i = 0; i < STAR_COUNT; i += 1) {
      stars.push(makeStar());
    }

    var last = performance.now();

    function frame(now) {
      var dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      var width = field.clientWidth || window.innerWidth;
      var height = field.clientHeight || window.innerHeight;

      stars.forEach(function (star) {
        if (!star.active) return;

        star.x += star.vx * dt;
        star.y += star.vy * dt;

        if (star.direction > 0 && star.x > width + 40) {
          resetStar(star, true);
        } else if (star.direction < 0 && star.x < -40) {
          resetStar(star, true);
        }

        if (star.y > height + 60) {
          star.y = random(-60, -10);
        }

        star.el.style.transform = "translate3d(" + star.x + "px, " + star.y + "px, 0)";
      });

      for (var a = 0; a < stars.length; a += 1) {
        if (!stars[a].active) continue;
        for (var b = a + 1; b < stars.length; b += 1) {
          if (!stars[b].active || stars[a].direction === stars[b].direction) continue;
          var dx = (stars[a].x + stars[a].size / 2) - (stars[b].x + stars[b].size / 2);
          var dy = (stars[a].y + stars[a].size / 2) - (stars[b].y + stars[b].size / 2);
          if (Math.sqrt(dx * dx + dy * dy) < (stars[a].size + stars[b].size) / 2 + 8) {
            collapse(stars[a], stars[b]);
          }
        }
      }

      window.requestAnimationFrame(frame);
    }

    window.requestAnimationFrame(frame);
  }

  function initSceneBackground() {
    var body = document.body;
    var sceneMap = [
      { id: "inicio", scene: "space" },
      { id: "proyectos", scene: "tech" },
      { id: "sobre-mi", scene: "profile" },
      { id: "contacto", scene: "contact" }
    ];
    var sections = [];

    body.setAttribute("data-scene", "space");

    sceneMap.forEach(function (item) {
      var element = document.getElementById(item.id);
      if (!element) return;
      element.setAttribute("data-scene", item.scene);
      sections.push(element);
    });

    if (!("IntersectionObserver" in window)) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          body.setAttribute("data-scene", entry.target.getAttribute("data-scene"));
        }
      });
    }, { rootMargin: "-45% 0px -45% 0px", threshold: 0 });

    sections.forEach(function (section) {
      observer.observe(section);
    });
  }

  renderProjects();
  initReveal();
  initYear();
  initHeroStars();
  initSceneBackground();
})();
