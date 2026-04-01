(function () {
  window.addEventListener("message", function (event) {
    if (!event.data || event.data.source !== "pb-editor") return;

    const { type, payload } = event.data;

    switch (type) {
      case "UPDATE_ELEMENT_STYLE": {
        const el = document.getElementById(payload.elementId);
        if (el) Object.assign(el.style, payload.styles);
        break;
      }
      case "UPDATE_ELEMENT_CONTENT": {
        const el = document.getElementById(payload.elementId);
        if (el) el.innerHTML = payload.html;
        break;
      }
      case "HIGHLIGHT_ELEMENT": {
        document
          .querySelectorAll(".pb-highlight")
          .forEach((e) => e.classList.remove("pb-highlight"));
        if (payload.elementId) {
          const el = document.getElementById(payload.elementId);
          if (el) el.classList.add("pb-highlight");
        }
        break;
      }
      case "FULL_RELOAD": {
        const body = document.querySelector(".pb-page");
        if (body && payload.html) body.innerHTML = payload.html;
        break;
      }
      case "SCROLL_TO": {
        const el = document.getElementById(payload.elementId);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
        break;
      }
    }
  });

  const style = document.createElement("style");
  style.textContent = `
    .pb-highlight { outline: 2px solid #2c6ecb !important; outline-offset: 2px !important; }
    [data-animation] { animation-fill-mode: both; }
  `;
  document.head.appendChild(style);

  window.parent.postMessage({ source: "pb-preview", type: "READY" }, "*");

  document.addEventListener("click", function (e) {
    const el = e.target.closest("[id^='pb-el-'], [id^='pb-section-']");
    if (el) {
      e.preventDefault();
      window.parent.postMessage(
        {
          source: "pb-preview",
          type: "ELEMENT_CLICKED",
          payload: { elementId: el.id },
        },
        "*",
      );
    }
  });
})();

