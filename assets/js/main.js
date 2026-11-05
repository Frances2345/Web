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

  renderProjects();
  initReveal();
  initYear();
})();
