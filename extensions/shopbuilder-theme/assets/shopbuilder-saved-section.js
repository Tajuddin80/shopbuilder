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

  function renderPicker(root, picker) {
    if (!picker || !(root instanceof HTMLElement)) return;

    root.innerHTML =
      picker.html ||
      '<div class="shopbuilder-app-block__empty">No saved ShopBuilder sections are available yet.</div>';

    const optionButtons = Array.from(
      root.querySelectorAll("[data-shopbuilder-template-id]"),
    );
    const statusNode =
      root.querySelector("[data-shopbuilder-picker-status]") ||
      document.createElement("div");
    statusNode.setAttribute("data-shopbuilder-picker-status", "true");
    statusNode.className = "shopbuilder-app-block__picker-status";
    if (!statusNode.parentElement) {
      root.appendChild(statusNode);
    }

    if (optionButtons.length > 0) {
      const setDisabledState = (disabled) => {
        optionButtons.forEach((button) => {
          if (button instanceof HTMLButtonElement) {
            button.disabled = disabled;
          }
        });
      };

      optionButtons.forEach((button) => {
        if (!(button instanceof HTMLButtonElement)) return;

        button.addEventListener("click", async () => {
          const templateId = button.dataset.shopbuilderTemplateId || "";
          const templateName = button.dataset.shopbuilderTemplateName || "section";
          if (!templateId) return;

          setDisabledState(true);
          statusNode.textContent = `Loading "${templateName}"...`;

          try {
            await bindSavedSection(root, templateId);
            statusNode.textContent = "Saved. Loading the selected section...";
            root.dataset.shopbuilderLoaded = "";
            await hydrate(root);
          } catch (error) {
            statusNode.textContent =
              error instanceof Error
                ? error.message
                : "Could not bind the saved section.";
            setDisabledState(false);
          }
        });
      });

      return;
    }

    const form = root.querySelector("[data-shopbuilder-picker-form]");
    if (!(form instanceof HTMLFormElement)) return;

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const submitButton = form.querySelector('button[type="submit"]');
      if (submitButton instanceof HTMLButtonElement) {
        submitButton.disabled = true;
      }

      statusNode.textContent = "Saving your selection...";
      if (!statusNode.parentElement) {
        form.appendChild(statusNode);
      }

      try {
        const formData = new FormData(form);
        formData.set("instance", root.dataset.instance || "");

        const response = await fetch(root.dataset.proxyUrl || "/apps/shopbuilder/section", {
          method: "POST",
          credentials: "same-origin",
          body: formData,
        });
        const payload = await response.json().catch(() => null);

        if (!response.ok || !payload?.ok) {
          throw new Error(payload?.error || "Could not bind the saved section.");
        }

        statusNode.textContent = "Saved. Loading the selected section...";
        root.dataset.shopbuilderLoaded = "";
        await hydrate(root);
      } catch (error) {
        statusNode.textContent =
          error instanceof Error
            ? error.message
            : "Could not bind the saved section.";
        if (submitButton instanceof HTMLButtonElement) {
          submitButton.disabled = false;
        }
      }
    });
  }

  async function bindSavedSection(root, templateId) {
    const proxyUrl = root.dataset.proxyUrl || "/apps/shopbuilder/section";
    const formData = new FormData();
    formData.set("templateId", templateId);
    formData.set("instance", root.dataset.instance || "");

    const response = await fetch(proxyUrl, {
      method: "POST",
      credentials: "same-origin",
      body: formData,
    });
    const payload = await response.json().catch(() => null);

    if (!response.ok || !payload?.ok) {
      throw new Error(payload?.error || "Could not bind the saved section.");
    }

    return payload;
  }

  async function loadPicker(root) {
    const proxyUrl = root.dataset.proxyUrl || "/apps/shopbuilder/section";
    const url = new URL(proxyUrl, window.location.origin);
    const instance = root.dataset.instance || "";

    url.searchParams.set("picker", "1");
    if (instance) {
      url.searchParams.set("instance", instance);
    }

    const response = await fetch(url.toString(), {
      credentials: "same-origin",
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      throw new Error(`ShopBuilder picker failed with ${response.status}`);
    }

    const payload = await response.json();

    if (Array.isArray(payload?.sections) && payload.sections.length === 1) {
      await bindSavedSection(root, String(payload.sections[0].id || ""));
      root.dataset.shopbuilderLoaded = "";
      await hydrate(root);
      return;
    }

    renderPicker(root, payload);
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
        if (window.Shopify && window.Shopify.designMode) {
          await loadPicker(root);
          return;
        }

        root.innerHTML =
          '<div class="shopbuilder-app-block__empty">No saved ShopBuilder section is linked to this block yet.</div>';
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
