(() => {
  const selector = "[data-shopbuilder-block]";

  function renderHtml(root, html) {
    root.innerHTML = html;

    root.querySelectorAll("script").forEach((script) => {
      const nextScript = document.createElement("script");

      Array.from(script.attributes).forEach((attribute) => {
        nextScript.setAttribute(attribute.name, attribute.value);
      });
      nextScript.textContent = script.textContent || "";
      script.replaceWith(nextScript);
    });
  }

  async function hydrate(root) {
    if (!(root instanceof HTMLElement)) return;

    const proxyUrl = root.dataset.proxyUrl || "/apps/shopbuilder/section";
    const handle = root.dataset.handle || "";
    const instance = root.dataset.instance || "";
    const requestKey = `${handle}::${instance}`;
    if (root.dataset.shopbuilderLoaded === requestKey && root.childElementCount) {
      return;
    }

    const url = new URL(proxyUrl, window.location.origin);

    if (handle) {
      url.searchParams.set("handle", handle);
    }
    if (instance) {
      url.searchParams.set("instance", instance);
    }

    root.dataset.shopbuilderLoaded = requestKey;

    try {
      const response = await fetch(url.toString(), {
        credentials: "same-origin",
        headers: { Accept: "text/html" },
      });

      if (!response.ok) {
        throw new Error(`ShopBuilder proxy failed with ${response.status}`);
      }

      const html = await response.text();
      if (!html.trim()) {
        root.innerHTML =
          '<div class="shopbuilder-app-block__empty">No saved ShopBuilder section was found for this block yet.</div>';
        return;
      }

      renderHtml(root, html);
    } catch (_error) {
      root.dataset.shopbuilderLoaded = "";
      root.innerHTML =
        '<div class="shopbuilder-app-block__empty">ShopBuilder could not load this saved section right now.</div>';
    }
  }

  function hydrateAll() {
    document.querySelectorAll(selector).forEach((node) => {
      hydrate(node);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", hydrateAll, { once: true });
  } else {
    hydrateAll();
  }

  document.addEventListener("shopify:section:load", hydrateAll);
  document.addEventListener("shopify:block:select", hydrateAll);
})();
