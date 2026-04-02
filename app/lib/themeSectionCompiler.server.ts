import type { Element, Section } from "./pageSchema";

type SchemaSetting = Record<string, unknown>;

function rangeSetting(
  id: string,
  label: string,
  min: number,
  max: number,
  step: number,
  defaultValue: number,
): SchemaSetting {
  return {
    type: "range",
    id,
    label,
    min,
    max,
    step,
    default: defaultValue,
  };
}

function colorSetting(
  id: string,
  label: string,
  defaultValue: string,
): SchemaSetting {
  return { type: "color", id, label, default: defaultValue };
}

function textSetting(
  id: string,
  label: string,
  defaultValue: string,
): SchemaSetting {
  return { type: "text", id, label, default: defaultValue };
}

function textareaSetting(
  id: string,
  label: string,
  defaultValue: string,
): SchemaSetting {
  return { type: "textarea", id, label, default: defaultValue };
}

function selectSetting(
  id: string,
  label: string,
  defaultValue: string,
  options: Array<{ value: string; label: string }>,
): SchemaSetting {
  return { type: "select", id, label, default: defaultValue, options };
}

function checkboxSetting(
  id: string,
  label: string,
  defaultValue: boolean,
): SchemaSetting {
  return { type: "checkbox", id, label, default: defaultValue };
}

function urlSetting(id: string, label: string): SchemaSetting {
  return { type: "url", id, label };
}

export function buildThemeSectionLiquid({
  section,
  displayName,
  containerWidth,
}: {
  section: Section;
  displayName: string;
  containerWidth: number;
}) {
  const schemaSettings: SchemaSetting[] = [
    { type: "header", content: "Section styles" },
    colorSetting(
      "pb_background_color",
      "Background color",
      section.settings.backgroundColor.desktop,
    ),
    {
      type: "image_picker",
      id: "pb_background_image",
      label: "Background image",
    },
    textSetting(
      "pb_background_image_url",
      "Fallback background image URL",
      section.settings.backgroundImage || "",
    ),
    rangeSetting(
      "pb_container_width",
      "Container width",
      600,
      1800,
      20,
      containerWidth,
    ),
    {
      type: "checkbox",
      id: "pb_full_width",
      label: "Full width",
      default: section.settings.fullWidth,
    },
    rangeSetting(
      "pb_padding_top",
      "Padding top",
      0,
      200,
      4,
      section.settings.paddingTop.desktop,
    ),
    rangeSetting(
      "pb_padding_bottom",
      "Padding bottom",
      0,
      200,
      4,
      section.settings.paddingBottom.desktop,
    ),
    rangeSetting(
      "pb_padding_left",
      "Padding left",
      0,
      120,
      4,
      section.settings.paddingLeft.desktop,
    ),
    rangeSetting(
      "pb_padding_right",
      "Padding right",
      0,
      120,
      4,
      section.settings.paddingRight.desktop,
    ),
    rangeSetting(
      "pb_margin_top",
      "Margin top",
      0,
      160,
      4,
      section.settings.marginTop.desktop,
    ),
    rangeSetting(
      "pb_margin_bottom",
      "Margin bottom",
      0,
      160,
      4,
      section.settings.marginBottom.desktop,
    ),
    rangeSetting(
      "pb_border_radius",
      "Border radius",
      0,
      80,
      2,
      section.settings.borderRadius,
    ),
    rangeSetting(
      "pb_border_width",
      "Border width",
      0,
      12,
      1,
      section.settings.borderWidth,
    ),
    colorSetting(
      "pb_border_color",
      "Border color",
      section.settings.borderColor,
    ),
    selectSetting(
      "pb_border_style",
      "Border style",
      section.settings.borderStyle,
      [
        { value: "solid", label: "Solid" },
        { value: "dashed", label: "Dashed" },
        { value: "dotted", label: "Dotted" },
        { value: "double", label: "Double" },
      ],
    ),
    textSetting(
      "pb_custom_class",
      "Custom class",
      section.settings.customClass,
    ),
    textSetting("pb_anchor_id", "Anchor ID", section.settings.customId),
    textareaSetting("pb_custom_css", "Custom CSS", section.settings.customCss),
  ];

  const markup = section.columns
    .map((column, columnIndex) => {
      const columnMarkup = column.elements
        .map((element, elementIndex) =>
          buildElementMarkup({
            element,
            schemaSettings,
            columnIndex,
            elementIndex,
          }),
        )
        .join("\n");

      const columnStyle = [
        `width:${column.width.desktop}%`,
        `padding:${column.settings.paddingTop.desktop}px ${column.settings.paddingRight.desktop}px ${column.settings.paddingBottom.desktop}px ${column.settings.paddingLeft.desktop}px`,
        `background-color:${column.settings.backgroundColor}`,
      ].join("; ");

      return `<div class="sb-native-column sb-native-column--${columnIndex + 1}" style="${columnStyle}">
  ${columnMarkup}
</div>`;
    })
    .join("\n");

  const schema = {
    name: displayName,
    settings: schemaSettings,
    presets: [{ name: displayName }],
  };

  return `
{% assign sb_anchor_id = section.settings.pb_anchor_id | strip %}
<style>
  #shopbuilder-section-{{ section.id }} {
    background-color: {{ section.settings.pb_background_color }};
    padding: {{ section.settings.pb_padding_top }}px {{ section.settings.pb_padding_right }}px {{ section.settings.pb_padding_bottom }}px {{ section.settings.pb_padding_left }}px;
    margin: {{ section.settings.pb_margin_top }}px 0 {{ section.settings.pb_margin_bottom }}px;
    border-radius: {{ section.settings.pb_border_radius }}px;
    {% if section.settings.pb_border_width > 0 %}
      border: {{ section.settings.pb_border_width }}px {{ section.settings.pb_border_style }} {{ section.settings.pb_border_color }};
    {% endif %}
    {% if section.settings.pb_background_image != blank %}
      background-image: url({{ section.settings.pb_background_image | image_url: width: 2400 }});
    {% elsif section.settings.pb_background_image_url != blank %}
      background-image: url({{ section.settings.pb_background_image_url }});
    {% endif %}
    background-size: cover;
    background-position: center;
  }

  #shopbuilder-section-{{ section.id }} .sb-native-container {
    max-width: {% if section.settings.pb_full_width %}100%{% else %}{{ section.settings.pb_container_width }}px{% endif %};
    margin: 0 auto;
  }

  #shopbuilder-section-{{ section.id }} .sb-native-columns {
    display: flex;
    flex-wrap: wrap;
  }

  #shopbuilder-section-{{ section.id }} .sb-native-column {
    box-sizing: border-box;
  }

  #shopbuilder-section-{{ section.id }} .sb-native-element {
    box-sizing: border-box;
  }

  #shopbuilder-section-{{ section.id }} [data-sb-accordion-panel][hidden],
  #shopbuilder-section-{{ section.id }} [data-sb-tab-panel][hidden] {
    display: none !important;
  }

  #shopbuilder-section-{{ section.id }} [data-sb-slider-slide] {
    display: none;
  }

  #shopbuilder-section-{{ section.id }} [data-sb-slider-slide].is-active {
    display: flex;
  }

  {% if section.settings.pb_custom_css != blank %}
    #shopbuilder-section-{{ section.id }} {
      {{ section.settings.pb_custom_css }}
    }
  {% endif %}
  @media screen and (max-width: 749px) {
    #shopbuilder-section-{{ section.id }} .sb-native-column {
      width: 100% !important;
    }
  }
</style>

<section id="shopbuilder-section-{{ section.id }}" class="shopbuilder-native-section {{ section.settings.pb_custom_class }}"{% if sb_anchor_id != blank %} data-anchor-id="{{ sb_anchor_id }}"{% endif %}>
  <div class="sb-native-container">
    <div class="sb-native-columns">
      ${markup}
    </div>
  </div>
</section>

<script>
  (() => {
    const root = document.getElementById("shopbuilder-section-{{ section.id }}");
    if (!root) return;

    root.querySelectorAll("[data-sb-accordion]").forEach((accordion) => {
      const allowMultiple =
        accordion.getAttribute("data-allow-multiple") === "true";
      const items = Array.from(
        accordion.querySelectorAll("[data-sb-accordion-item]"),
      );

      accordion
        .querySelectorAll("[data-sb-accordion-trigger]")
        .forEach((trigger) => {
          trigger.addEventListener("click", () => {
            const item = trigger.closest("[data-sb-accordion-item]");
            if (!item) return;

            const nextOpen = !item.classList.contains("is-open");

            if (!allowMultiple) {
              items.forEach((candidate) => {
                candidate.classList.remove("is-open");
                const panel = candidate.querySelector(
                  "[data-sb-accordion-panel]",
                );
                const button = candidate.querySelector(
                  "[data-sb-accordion-trigger]",
                );
                if (panel) panel.hidden = true;
                if (button) button.setAttribute("aria-expanded", "false");
              });
            }

            item.classList.toggle("is-open", nextOpen);
            const panel = item.querySelector("[data-sb-accordion-panel]");
            if (panel) panel.hidden = !nextOpen;
            trigger.setAttribute("aria-expanded", String(nextOpen));
          });
        });
    });

    root.querySelectorAll("[data-sb-tabs]").forEach((tabs) => {
      const buttons = Array.from(tabs.querySelectorAll("[data-sb-tab-button]"));
      const panels = Array.from(tabs.querySelectorAll("[data-sb-tab-panel]"));

      const activate = (tabId) => {
        buttons.forEach((button) => {
          const isActive =
            button.getAttribute("data-sb-tab-button") === tabId;
          const activeColor =
            button.getAttribute("data-active-color") || "#111111";
          const inactiveColor =
            button.getAttribute("data-inactive-color") || "#64748b";
          button.style.color = isActive ? activeColor : inactiveColor;
          button.style.borderBottomColor = isActive
            ? activeColor
            : "transparent";
        });

        panels.forEach((panel) => {
          panel.hidden = panel.getAttribute("data-sb-tab-panel") !== tabId;
        });
      };

      const initialTab =
        buttons[0]?.getAttribute("data-sb-tab-button") || null;
      if (initialTab) activate(initialTab);

      buttons.forEach((button) => {
        button.addEventListener("click", () => {
          const tabId = button.getAttribute("data-sb-tab-button");
          if (tabId) activate(tabId);
        });
      });
    });

    root.querySelectorAll("[data-sb-countdown]").forEach((countdown) => {
      const targetDate = countdown.getAttribute("data-target-date");
      const expiredText = countdown.getAttribute("data-expired-text") || "";
      if (!targetDate) return;

      const target = new Date(targetDate).getTime();
      const parts = Array.from(
        countdown.querySelectorAll("[data-sb-count-part]"),
      );
      const expiredNode = countdown.querySelector("[data-sb-count-expired]");

      const render = () => {
        const distance = Math.max(0, target - Date.now());
        const values = {
          days: Math.floor(distance / 86400000),
          hours: Math.floor((distance % 86400000) / 3600000),
          minutes: Math.floor((distance % 3600000) / 60000),
          seconds: Math.floor((distance % 60000) / 1000),
        };

        parts.forEach((part) => {
          const key = part.getAttribute("data-sb-count-part");
          const value = key && key in values ? values[key] : 0;
          part.textContent = String(value).padStart(2, "0");
        });

        if (distance <= 0 && expiredNode && expiredText) {
          expiredNode.hidden = false;
        }
      };

      render();
      setInterval(render, 1000);
    });

    root.querySelectorAll("[data-sb-form]").forEach((form) => {
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const success = form.querySelector("[data-sb-form-success]");
        if (success) success.hidden = false;
      });
    });

    root.querySelectorAll("[data-sb-slider]").forEach((slider) => {
      const slides = Array.from(slider.querySelectorAll("[data-sb-slider-slide]"));
      const dots = Array.from(slider.querySelectorAll("[data-sb-slider-dot]"));
      if (!slides.length) return;

      let current = 0;
      let timer = null;
      const autoplay = slider.getAttribute("data-autoplay") !== "false";
      const speed = Number(slider.getAttribute("data-speed") || 5000);

      const showSlide = (index) => {
        current = index;
        slides.forEach((slide, slideIndex) => {
          slide.classList.toggle("is-active", slideIndex === current);
        });
        dots.forEach((dot, dotIndex) => {
          dot.style.opacity = dotIndex === current ? "1" : "0.4";
        });
      };

      const startTimer = () => {
        if (!autoplay || slides.length < 2) return;
        if (timer) clearInterval(timer);
        timer = setInterval(() => {
          showSlide((current + 1) % slides.length);
        }, Math.max(speed, 1200));
      };

      dots.forEach((dot, index) => {
        dot.addEventListener("click", () => {
          showSlide(index);
          startTimer();
        });
      });

      showSlide(0);
      startTimer();
    });
  })();
</script>

{% schema %}
${JSON.stringify(schema, null, 2)}
{% endschema %}
`.trim();
}

function buildElementMarkup({
  element,
  schemaSettings,
  columnIndex,
  elementIndex,
}: {
  element: Element;
  schemaSettings: SchemaSetting[];
  columnIndex: number;
  elementIndex: number;
}) {
  const prefix = `pb_c${columnIndex + 1}_e${elementIndex + 1}`;
  const labelPrefix = `Column ${columnIndex + 1} block ${elementIndex + 1}`;
  const settings = (element as any).settings;
  const content = (element as any).content || {};
  const elementId = `${prefix}_id`;
  const customCssId = `${prefix}_custom_css`;

  schemaSettings.push(
    textSetting(elementId, `${labelPrefix} custom ID`, settings.customId || ""),
  );
  schemaSettings.push(
    textareaSetting(
      customCssId,
      `${labelPrefix} custom CSS`,
      settings.customCss || "",
    ),
  );

  const wrapperStyles = [
    `margin:${settings.marginTop.desktop}px ${settings.marginRight.desktop}px ${settings.marginBottom.desktop}px ${settings.marginLeft.desktop}px`,
    `padding:${settings.paddingTop.desktop}px ${settings.paddingRight.desktop}px ${settings.paddingBottom.desktop}px ${settings.paddingLeft.desktop}px`,
    `width:${settings.width.desktop}`,
    `text-align:${settings.textAlign.desktop}`,
    settings.backgroundColor !== "transparent"
      ? `background-color:${settings.backgroundColor}`
      : "",
    settings.borderWidth
      ? `border:${settings.borderWidth}px ${settings.borderStyle} ${settings.borderColor}; border-radius:${settings.borderRadius}px`
      : "",
  ]
    .filter(Boolean)
    .join("; ");

  const open = `<div id="shopbuilder-${prefix}-{{ section.id }}"{% if section.settings.${elementId} != blank %} data-custom-id="{{ section.settings.${elementId} }}"{% endif %} class="sb-native-element sb-native-element--${element.type} sb-native-element--${elementIndex + 1}" style="${wrapperStyles}">
{% if section.settings.${customCssId} != blank %}
  <style>
    #shopbuilder-${prefix}-{{ section.id }} {
      {{ section.settings.${customCssId} }}
    }
  </style>
{% endif %}`;

  switch ((element as any).type) {
    case "heading": {
      const textId = `${prefix}_text`;
      const tagId = `${prefix}_tag`;
      const colorId = `${prefix}_color`;
      const sizeId = `${prefix}_size`;
      const weightId = `${prefix}_weight`;

      schemaSettings.push(
        textSetting(textId, `${labelPrefix} heading text`, content.text || ""),
      );
      schemaSettings.push(
        selectSetting(
          tagId,
          `${labelPrefix} heading tag`,
          content.tag || "h2",
          [
            { value: "h1", label: "H1" },
            { value: "h2", label: "H2" },
            { value: "h3", label: "H3" },
            { value: "h4", label: "H4" },
          ],
        ),
      );
      schemaSettings.push(
        colorSetting(
          colorId,
          `${labelPrefix} text color`,
          content.color || "#111111",
        ),
      );
      schemaSettings.push(
        rangeSetting(
          sizeId,
          `${labelPrefix} font size`,
          14,
          96,
          1,
          content.fontSize?.desktop || 32,
        ),
      );
      schemaSettings.push(
        selectSetting(
          weightId,
          `${labelPrefix} font weight`,
          String(content.fontWeight || "700"),
          [
            { value: "400", label: "Regular" },
            { value: "500", label: "Medium" },
            { value: "600", label: "Semi bold" },
            { value: "700", label: "Bold" },
            { value: "800", label: "Extra bold" },
          ],
        ),
      );

      return `${open}
{% case section.settings.${tagId} %}
  {% when 'h1' %}
    <h1 style="font-size:{{ section.settings.${sizeId} }}px; color:{{ section.settings.${colorId} }}; font-weight:{{ section.settings.${weightId} }};">{{ section.settings.${textId} }}</h1>
  {% when 'h2' %}
    <h2 style="font-size:{{ section.settings.${sizeId} }}px; color:{{ section.settings.${colorId} }}; font-weight:{{ section.settings.${weightId} }};">{{ section.settings.${textId} }}</h2>
  {% when 'h3' %}
    <h3 style="font-size:{{ section.settings.${sizeId} }}px; color:{{ section.settings.${colorId} }}; font-weight:{{ section.settings.${weightId} }};">{{ section.settings.${textId} }}</h3>
  {% else %}
    <h4 style="font-size:{{ section.settings.${sizeId} }}px; color:{{ section.settings.${colorId} }}; font-weight:{{ section.settings.${weightId} }};">{{ section.settings.${textId} }}</h4>
{% endcase %}
</div>`;
    }

    case "text": {
      const richTextId = `${prefix}_content`;
      schemaSettings.push({
        type: "richtext",
        id: richTextId,
        label: `${labelPrefix} text content`,
        default: content.html || "<p>Text content</p>",
      });
      return `${open}
  {{ section.settings.${richTextId} }}
</div>`;
    }

    case "image": {
      const imageId = `${prefix}_image`;
      const urlId = `${prefix}_image_url`;
      const altId = `${prefix}_alt`;
      const linkId = `${prefix}_link`;
      const radiusId = `${prefix}_radius`;
      schemaSettings.push({
        type: "image_picker",
        id: imageId,
        label: `${labelPrefix} image`,
      });
      schemaSettings.push(
        textSetting(
          urlId,
          `${labelPrefix} fallback image URL`,
          content.src || "",
        ),
      );
      schemaSettings.push(
        textSetting(altId, `${labelPrefix} alt text`, content.alt || ""),
      );
      schemaSettings.push({
        type: "url",
        id: linkId,
        label: `${labelPrefix} link URL`,
      });
      schemaSettings.push(
        rangeSetting(
          radiusId,
          `${labelPrefix} image radius`,
          0,
          60,
          2,
          settings.borderRadius || 0,
        ),
      );
      return `${open}
{% assign sb_image = section.settings.${imageId} %}
{% capture sb_image_markup %}
  {% if sb_image != blank %}
    <img src="{{ sb_image | image_url: width: 1600 }}" alt="{{ section.settings.${altId} }}" loading="lazy" style="width:100%; display:block; border-radius:{{ section.settings.${radiusId} }}px;">
  {% elsif section.settings.${urlId} != blank %}
    <img src="{{ section.settings.${urlId} }}" alt="{{ section.settings.${altId} }}" loading="lazy" style="width:100%; display:block; border-radius:{{ section.settings.${radiusId} }}px;">
  {% endif %}
{% endcapture %}
{% if section.settings.${linkId} != blank %}
  <a href="{{ section.settings.${linkId} }}">{{ sb_image_markup }}</a>
{% else %}
  {{ sb_image_markup }}
{% endif %}
</div>`;
    }

    case "button": {
      const textId = `${prefix}_text`;
      const urlId = `${prefix}_url`;
      const bgId = `${prefix}_bg`;
      const textColorId = `${prefix}_text_color`;
      const borderColorId = `${prefix}_border_color`;
      const sizeId = `${prefix}_size`;
      schemaSettings.push(
        textSetting(
          textId,
          `${labelPrefix} button text`,
          content.text || "Button",
        ),
      );
      schemaSettings.push({
        type: "url",
        id: urlId,
        label: `${labelPrefix} button URL`,
      });
      schemaSettings.push(
        colorSetting(
          bgId,
          `${labelPrefix} button background`,
          content.backgroundColor || "#111111",
        ),
      );
      schemaSettings.push(
        colorSetting(
          textColorId,
          `${labelPrefix} button text color`,
          content.textColor || "#ffffff",
        ),
      );
      schemaSettings.push(
        colorSetting(
          borderColorId,
          `${labelPrefix} button border color`,
          content.borderColor || "#111111",
        ),
      );
      schemaSettings.push(
        selectSetting(
          sizeId,
          `${labelPrefix} button size`,
          content.size || "medium",
          [
            { value: "small", label: "Small" },
            { value: "medium", label: "Medium" },
            { value: "large", label: "Large" },
          ],
        ),
      );
      return `${open}
  <a href="{{ section.settings.${urlId} }}" style="display:inline-block; text-decoration:none; font-weight:600; background-color:{{ section.settings.${bgId} }}; color:{{ section.settings.${textColorId} }}; border:2px solid {{ section.settings.${borderColorId} }}; border-radius:6px; padding:{% case section.settings.${sizeId} %}{% when 'small' %}8px 16px{% when 'large' %}16px 36px{% else %}12px 24px{% endcase %};">
    {{ section.settings.${textId} }}
  </a>
</div>`;
    }

    case "divider": {
      const colorId = `${prefix}_color`;
      const thicknessId = `${prefix}_thickness`;
      const widthId = `${prefix}_width`;
      const alignmentId = `${prefix}_alignment`;
      const styleId = `${prefix}_style`;
      schemaSettings.push(
        colorSetting(
          colorId,
          `${labelPrefix} divider color`,
          content.color || "#e5e7eb",
        ),
      );
      schemaSettings.push(
        rangeSetting(
          thicknessId,
          `${labelPrefix} thickness`,
          1,
          12,
          1,
          content.thickness || 1,
        ),
      );
      schemaSettings.push(
        rangeSetting(
          widthId,
          `${labelPrefix} width`,
          10,
          100,
          1,
          content.width || 100,
        ),
      );
      schemaSettings.push(
        selectSetting(
          alignmentId,
          `${labelPrefix} alignment`,
          content.alignment || "center",
          [
            { value: "left", label: "Left" },
            { value: "center", label: "Center" },
            { value: "right", label: "Right" },
          ],
        ),
      );
      schemaSettings.push(
        selectSetting(
          styleId,
          `${labelPrefix} style`,
          content.style || "solid",
          [
            { value: "solid", label: "Solid" },
            { value: "dashed", label: "Dashed" },
            { value: "dotted", label: "Dotted" },
          ],
        ),
      );
      return `${open}
  <div style="display:flex; justify-content:{% case section.settings.${alignmentId} %}{% when 'left' %}flex-start{% when 'right' %}flex-end{% else %}center{% endcase %};">
    <div style="width:{{ section.settings.${widthId} }}%; border-top:{{ section.settings.${thicknessId} }}px {{ section.settings.${styleId} }} {{ section.settings.${colorId} }};"></div>
  </div>
</div>`;
    }

    case "spacer": {
      const heightId = `${prefix}_height`;
      schemaSettings.push(
        rangeSetting(
          heightId,
          `${labelPrefix} height`,
          0,
          240,
          4,
          content.height?.desktop || 40,
        ),
      );
      return `${open}
  <div style="height:{{ section.settings.${heightId} }}px;"></div>
</div>`;
    }

    case "html":
    case "liquid": {
      const liquidId = `${prefix}_liquid`;
      schemaSettings.push({
        type: "liquid",
        id: liquidId,
        label: `${labelPrefix} custom ${element.type}`,
        default: String(
          element.type === "html" ? content.html || "" : content.liquid || "",
        ),
      });
      return `${open}
  {{ section.settings.${liquidId} }}
</div>`;
    }

    case "video": {
      const urlId = `${prefix}_video_url`;
      const aspectId = `${prefix}_aspect_ratio`;
      const posterId = `${prefix}_poster_url`;
      schemaSettings.push(
        textSetting(urlId, `${labelPrefix} video URL`, content.url || ""),
      );
      schemaSettings.push(
        selectSetting(
          aspectId,
          `${labelPrefix} aspect ratio`,
          content.aspectRatio || "16:9",
          [
            { value: "16:9", label: "16:9" },
            { value: "4:3", label: "4:3" },
            { value: "1:1", label: "1:1" },
            { value: "21:9", label: "21:9" },
          ],
        ),
      );
      schemaSettings.push(
        textSetting(
          posterId,
          `${labelPrefix} fallback poster URL`,
          content.posterImage || "",
        ),
      );

      return `${open}
{% assign sb_video_url = section.settings.${urlId} | strip %}
{% assign sb_video_embed = sb_video_url %}
{% if sb_video_url contains 'youtube.com/watch?v=' %}
  {% assign sb_video_embed = sb_video_url | replace: 'watch?v=', 'embed/' %}
{% elsif sb_video_url contains 'youtu.be/' %}
  {% assign sb_video_embed = sb_video_url | replace: 'youtu.be/', 'youtube.com/embed/' %}
{% elsif sb_video_url contains 'vimeo.com/' %}
  {% assign sb_video_embed = sb_video_url | replace: 'vimeo.com/', 'player.vimeo.com/video/' %}
{% endif %}
{% if sb_video_url != blank %}
  <div style="position:relative; width:100%; overflow:hidden; border-radius:12px; background:#0f172a; padding-top:{% case section.settings.${aspectId} %}{% when '1:1' %}100%{% when '4:3' %}75%{% when '21:9' %}42.85%{% else %}56.25%{% endcase %};">
    <iframe src="{{ sb_video_embed }}" title="Video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position:absolute; inset:0; width:100%; height:100%; border:0;"></iframe>
  </div>
{% elsif section.settings.${posterId} != blank %}
  <img src="{{ section.settings.${posterId} }}" alt="" style="width:100%; display:block; border-radius:12px;">
{% else %}
  <div style="padding:20px; border-radius:14px; background:#0f172a; color:#e2e8f0; text-align:center;">Add a YouTube or Vimeo URL in theme settings.</div>
{% endif %}
</div>`;
    }

    case "map": {
      const queryId = `${prefix}_map_query`;
      schemaSettings.push(
        textSetting(
          queryId,
          `${labelPrefix} map query`,
          content.query || "New York, NY",
        ),
      );

      return `${open}
  <div style="position:relative; width:100%; padding-top:56.25%; overflow:hidden; border-radius:12px;">
    <iframe src="https://www.google.com/maps?q={{ section.settings.${queryId} | url_encode }}&output=embed" title="Map" style="position:absolute; inset:0; width:100%; height:100%; border:0;"></iframe>
  </div>
</div>`;
    }

    case "icon": {
      const iconId = `${prefix}_icon`;
      const colorId = `${prefix}_icon_color`;
      const sizeId = `${prefix}_icon_size`;
      schemaSettings.push(
        selectSetting(iconId, `${labelPrefix} icon`, content.icon || "star", [
          { value: "star", label: "Star" },
          { value: "circle", label: "Circle" },
          { value: "heart", label: "Heart" },
          { value: "check", label: "Check" },
        ]),
      );
      schemaSettings.push(
        colorSetting(
          colorId,
          `${labelPrefix} icon color`,
          content.color || "#111111",
        ),
      );
      schemaSettings.push(
        rangeSetting(
          sizeId,
          `${labelPrefix} icon size`,
          16,
          120,
          2,
          content.size?.desktop || 40,
        ),
      );

      return `${open}
  <div style="display:inline-flex; align-items:center; justify-content:center; width:{{ section.settings.${sizeId} }}px; height:{{ section.settings.${sizeId} }}px; font-size:{{ section.settings.${sizeId} | divided_by: 2 }}px; color:{{ section.settings.${colorId} }};">
    {% case section.settings.${iconId} %}
      {% when 'star' %}&#9733;
      {% when 'heart' %}&#9829;
      {% when 'check' %}&#10003;
      {% else %}&#9679;
    {% endcase %}
  </div>
</div>`;
    }

    case "social_icons": {
      const itemsId = `${prefix}_social_items`;
      const sizeId = `${prefix}_social_size`;
      const colorId = `${prefix}_social_color`;
      const alignmentId = `${prefix}_social_alignment`;
      const defaultItems = Array.isArray(content.icons)
        ? content.icons
            .map((item: any) => `${item.platform || "icon"}|${item.url || "#"}`)
            .join("\n")
        : "";
      schemaSettings.push(
        textareaSetting(itemsId, `${labelPrefix} social icons`, defaultItems),
      );
      schemaSettings.push(
        rangeSetting(
          sizeId,
          `${labelPrefix} icon size`,
          16,
          64,
          2,
          content.iconSize || 24,
        ),
      );
      schemaSettings.push(
        colorSetting(
          colorId,
          `${labelPrefix} icon color`,
          content.iconColor || "#111111",
        ),
      );
      schemaSettings.push(
        selectSetting(
          alignmentId,
          `${labelPrefix} alignment`,
          content.alignment || "center",
          [
            { value: "left", label: "Left" },
            { value: "center", label: "Center" },
            { value: "right", label: "Right" },
          ],
        ),
      );

      return `${open}
{% assign sb_social_items = section.settings.${itemsId} | newline_to_br | split: '<br />' %}
  <div style="display:flex; flex-wrap:wrap; gap:12px; justify-content:{% case section.settings.${alignmentId} %}{% when 'left' %}flex-start{% when 'right' %}flex-end{% else %}center{% endcase %};">
    {% for sb_social_item in sb_social_items %}
      {% assign sb_social_line = sb_social_item | strip %}
      {% if sb_social_line != blank %}
        {% assign sb_social_parts = sb_social_line | split: '|' %}
        <a href="{{ sb_social_parts[1] | strip | default: '#' }}" style="display:inline-flex; align-items:center; justify-content:center; width:{{ section.settings.${sizeId} }}px; height:{{ section.settings.${sizeId} }}px; border:1px solid #cbd5e1; border-radius:999px; color:{{ section.settings.${colorId} }}; text-decoration:none; text-transform:uppercase; font-size:10px;">
          {{ sb_social_parts[0] | strip | slice: 0, 2 }}
        </a>
      {% endif %}
    {% endfor %}
  </div>
</div>`;
    }

    case "testimonial": {
      const itemsId = `${prefix}_testimonial_items`;
      const columnsId = `${prefix}_testimonial_columns`;
      const defaultItems = Array.isArray(content.items)
        ? content.items
            .map(
              (item: any) =>
                `${item.quote || "Quote"}|${item.author || "Author"}|${item.role || ""}`,
            )
            .join("\n")
        : "";
      schemaSettings.push(
        textareaSetting(itemsId, `${labelPrefix} testimonials`, defaultItems),
      );
      schemaSettings.push(
        rangeSetting(
          columnsId,
          `${labelPrefix} columns`,
          1,
          4,
          1,
          content.columns?.desktop || 3,
        ),
      );

      return `${open}
{% assign sb_testimonials = section.settings.${itemsId} | newline_to_br | split: '<br />' %}
  <div style="display:grid; grid-template-columns:repeat({{ section.settings.${columnsId} }}, minmax(0, 1fr)); gap:12px;">
    {% for sb_testimonial in sb_testimonials %}
      {% assign sb_testimonial_line = sb_testimonial | strip %}
      {% if sb_testimonial_line != blank %}
        {% assign sb_testimonial_parts = sb_testimonial_line | split: '|' %}
        <div style="border:1px solid #e2e8f0; border-radius:14px; padding:14px; background:#ffffff;">
          <div style="font-size:13px; line-height:1.7; color:#334155;">{{ sb_testimonial_parts[0] | strip }}</div>
          <div style="margin-top:10px; font-size:12px; color:#64748b;">{{ sb_testimonial_parts[1] | strip }}{% if sb_testimonial_parts[2] != blank %}, {{ sb_testimonial_parts[2] | strip }}{% endif %}</div>
        </div>
      {% endif %}
    {% endfor %}
  </div>
</div>`;
    }

    case "accordion": {
      const itemsId = `${prefix}_accordion_items`;
      const allowMultipleId = `${prefix}_accordion_multi`;
      const borderColorId = `${prefix}_accordion_border`;
      const headingColorId = `${prefix}_accordion_heading`;
      const contentColorId = `${prefix}_accordion_content`;
      const defaultItems = Array.isArray(content.items)
        ? content.items
            .map(
              (item: any) =>
                `${item.question || "Question"}|${item.answer || "Answer"}`,
            )
            .join("\n")
        : "";
      schemaSettings.push(
        textareaSetting(
          itemsId,
          `${labelPrefix} accordion items`,
          defaultItems,
        ),
      );
      schemaSettings.push(
        checkboxSetting(
          allowMultipleId,
          `${labelPrefix} allow multiple open`,
          Boolean(content.allowMultiple),
        ),
      );
      schemaSettings.push(
        colorSetting(
          borderColorId,
          `${labelPrefix} border color`,
          content.borderColor || "#e5e7eb",
        ),
      );
      schemaSettings.push(
        colorSetting(
          headingColorId,
          `${labelPrefix} heading color`,
          content.headingColor || "#111111",
        ),
      );
      schemaSettings.push(
        colorSetting(
          contentColorId,
          `${labelPrefix} content color`,
          content.contentColor || "#555555",
        ),
      );

      return `${open}
{% assign sb_accordion_items = section.settings.${itemsId} | newline_to_br | split: '<br />' %}
  <div data-sb-accordion data-allow-multiple="{{ section.settings.${allowMultipleId} }}" style="display:flex; flex-direction:column; gap:8px;">
    {% for sb_accordion_item in sb_accordion_items %}
      {% assign sb_accordion_line = sb_accordion_item | strip %}
      {% if sb_accordion_line != blank %}
        {% assign sb_accordion_parts = sb_accordion_line | split: '|' %}
        <div data-sb-accordion-item class="{% if forloop.first %}is-open{% endif %}" style="border:1px solid {{ section.settings.${borderColorId} }}; border-radius:12px; overflow:hidden; background:#ffffff;">
          <button type="button" data-sb-accordion-trigger aria-expanded="{% if forloop.first %}true{% else %}false{% endif %}" style="width:100%; text-align:left; border:0; background:#f8fafc; padding:12px; font-weight:600; color:{{ section.settings.${headingColorId} }}; cursor:pointer;">{{ sb_accordion_parts[0] | strip }}</button>
          <div data-sb-accordion-panel {% unless forloop.first %}hidden{% endunless %} style="padding:12px; color:{{ section.settings.${contentColorId} }};">{{ sb_accordion_parts[1] | strip }}</div>
        </div>
      {% endif %}
    {% endfor %}
  </div>
</div>`;
    }

    case "tabs": {
      const tabsId = `${prefix}_tabs_items`;
      const activeColorId = `${prefix}_tabs_active`;
      const inactiveColorId = `${prefix}_tabs_inactive`;
      const defaultTabs = Array.isArray(content.tabs)
        ? content.tabs
            .map(
              (tab: any) => `${tab.label || "Tab"}|${tab.content || "Content"}`,
            )
            .join("\n")
        : "";
      schemaSettings.push(
        textareaSetting(tabsId, `${labelPrefix} tabs`, defaultTabs),
      );
      schemaSettings.push(
        colorSetting(
          activeColorId,
          `${labelPrefix} active color`,
          content.activeColor || "#111111",
        ),
      );
      schemaSettings.push(
        colorSetting(
          inactiveColorId,
          `${labelPrefix} inactive color`,
          content.inactiveColor || "#64748b",
        ),
      );

      return `${open}
{% assign sb_tabs = section.settings.${tabsId} | newline_to_br | split: '<br />' %}
  <div data-sb-tabs>
    <div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:12px;">
      {% for sb_tab in sb_tabs %}
        {% assign sb_tab_line = sb_tab | strip %}
        {% if sb_tab_line != blank %}
          {% assign sb_tab_parts = sb_tab_line | split: '|' %}
          <button type="button" data-sb-tab-button="${prefix}-tab-{{ forloop.index }}" data-active-color="{{ section.settings.${activeColorId} }}" data-inactive-color="{{ section.settings.${inactiveColorId} }}" style="border:0; background:transparent; border-bottom:2px solid {% if forloop.first %}{{ section.settings.${activeColorId} }}{% else %}transparent{% endif %}; color:{% if forloop.first %}{{ section.settings.${activeColorId} }}{% else %}{{ section.settings.${inactiveColorId} }}{% endif %}; padding:8px 12px; font-weight:600; cursor:pointer;">{{ sb_tab_parts[0] | strip }}</button>
        {% endif %}
      {% endfor %}
    </div>
    {% for sb_tab in sb_tabs %}
      {% assign sb_tab_line = sb_tab | strip %}
      {% if sb_tab_line != blank %}
        {% assign sb_tab_parts = sb_tab_line | split: '|' %}
        <div data-sb-tab-panel="${prefix}-tab-{{ forloop.index }}" {% unless forloop.first %}hidden{% endunless %} style="border:1px solid #e2e8f0; border-radius:12px; padding:12px; background:#ffffff;">{{ sb_tab_parts[1] | strip }}</div>
      {% endif %}
    {% endfor %}
  </div>
</div>`;
    }

    case "countdown": {
      const targetDateId = `${prefix}_countdown_target`;
      const numberColorId = `${prefix}_countdown_number`;
      const labelColorId = `${prefix}_countdown_label`;
      const expiredTextId = `${prefix}_countdown_expired`;
      schemaSettings.push(
        textSetting(
          targetDateId,
          `${labelPrefix} target date`,
          content.targetDate || "",
        ),
      );
      schemaSettings.push(
        colorSetting(
          numberColorId,
          `${labelPrefix} number color`,
          content.numberColor || "#111111",
        ),
      );
      schemaSettings.push(
        colorSetting(
          labelColorId,
          `${labelPrefix} label color`,
          content.labelColor || "#64748b",
        ),
      );
      schemaSettings.push(
        textSetting(
          expiredTextId,
          `${labelPrefix} expired text`,
          content.expiredText || "This offer has ended",
        ),
      );

      return `${open}
  <div data-sb-countdown data-target-date="{{ section.settings.${targetDateId} }}" data-expired-text="{{ section.settings.${expiredTextId} }}" style="display:flex; gap:8px; flex-wrap:wrap;">
    <div style="min-width:68px; padding:12px; border-radius:12px; background:#ffffff; border:1px solid #e2e8f0; text-align:center;">
      <div data-sb-count-part="days" style="font-size:20px; font-weight:700; color:{{ section.settings.${numberColorId} }};">00</div>
      <div style="margin-top:4px; font-size:11px; color:{{ section.settings.${labelColorId} }};">Days</div>
    </div>
    <div style="min-width:68px; padding:12px; border-radius:12px; background:#ffffff; border:1px solid #e2e8f0; text-align:center;">
      <div data-sb-count-part="hours" style="font-size:20px; font-weight:700; color:{{ section.settings.${numberColorId} }};">00</div>
      <div style="margin-top:4px; font-size:11px; color:{{ section.settings.${labelColorId} }};">Hours</div>
    </div>
    <div style="min-width:68px; padding:12px; border-radius:12px; background:#ffffff; border:1px solid #e2e8f0; text-align:center;">
      <div data-sb-count-part="minutes" style="font-size:20px; font-weight:700; color:{{ section.settings.${numberColorId} }};">00</div>
      <div style="margin-top:4px; font-size:11px; color:{{ section.settings.${labelColorId} }};">Minutes</div>
    </div>
    <div style="min-width:68px; padding:12px; border-radius:12px; background:#ffffff; border:1px solid #e2e8f0; text-align:center;">
      <div data-sb-count-part="seconds" style="font-size:20px; font-weight:700; color:{{ section.settings.${numberColorId} }};">00</div>
      <div style="margin-top:4px; font-size:11px; color:{{ section.settings.${labelColorId} }};">Seconds</div>
    </div>
    <div data-sb-count-expired hidden style="width:100%; color:#64748b; font-size:13px;">{{ section.settings.${expiredTextId} }}</div>
  </div>
</div>`;
    }

    case "form": {
      const fieldsId = `${prefix}_form_fields`;
      const submitTextId = `${prefix}_form_submit`;
      const successMessageId = `${prefix}_form_success`;
      const borderColorId = `${prefix}_form_border`;
      const buttonColorId = `${prefix}_form_button`;
      const buttonTextColorId = `${prefix}_form_button_text`;
      const defaultFields = Array.isArray(content.fields)
        ? content.fields
            .map(
              (field: any) =>
                `${field.type || "text"}|${field.label || "Field"}|${field.placeholder || ""}|${field.required ? "true" : "false"}`,
            )
            .join("\n")
        : "";
      schemaSettings.push(
        textareaSetting(fieldsId, `${labelPrefix} form fields`, defaultFields),
      );
      schemaSettings.push(
        textSetting(
          submitTextId,
          `${labelPrefix} submit text`,
          content.submitText || "Submit",
        ),
      );
      schemaSettings.push(
        textSetting(
          successMessageId,
          `${labelPrefix} success message`,
          content.successMessage || "Thank you!",
        ),
      );
      schemaSettings.push(
        colorSetting(
          borderColorId,
          `${labelPrefix} input border color`,
          content.inputBorderColor || "#d1d5db",
        ),
      );
      schemaSettings.push(
        colorSetting(
          buttonColorId,
          `${labelPrefix} button color`,
          content.buttonColor || "#111111",
        ),
      );
      schemaSettings.push(
        colorSetting(
          buttonTextColorId,
          `${labelPrefix} button text color`,
          content.buttonTextColor || "#ffffff",
        ),
      );

      return `${open}
{% assign sb_form_fields = section.settings.${fieldsId} | newline_to_br | split: '<br />' %}
  <form data-sb-form style="display:flex; flex-direction:column; gap:10px;">
    {% for sb_form_field in sb_form_fields %}
      {% assign sb_form_line = sb_form_field | strip %}
      {% if sb_form_line != blank %}
        {% assign sb_form_parts = sb_form_line | split: '|' %}
        <div style="display:flex; flex-direction:column; gap:4px;">
          <label style="font-size:12px; color:#334155;">{{ sb_form_parts[1] | strip }}</label>
          {% if sb_form_parts[0] | strip == 'textarea' %}
            <textarea placeholder="{{ sb_form_parts[2] | strip }}" {% if sb_form_parts[3] | strip == 'true' %}required{% endif %} style="width:100%; padding:10px 12px; border-radius:10px; border:1px solid {{ section.settings.${borderColorId} }}; min-height:120px;"></textarea>
          {% else %}
            <input type="{{ sb_form_parts[0] | strip | default: 'text' }}" placeholder="{{ sb_form_parts[2] | strip }}" {% if sb_form_parts[3] | strip == 'true' %}required{% endif %} style="width:100%; padding:10px 12px; border-radius:10px; border:1px solid {{ section.settings.${borderColorId} }};">
          {% endif %}
        </div>
      {% endif %}
    {% endfor %}
    <button type="submit" style="margin-top:4px; padding:12px 16px; border:0; border-radius:10px; background:{{ section.settings.${buttonColorId} }}; color:{{ section.settings.${buttonTextColorId} }}; font-weight:600;">{{ section.settings.${submitTextId} }}</button>
    <div data-sb-form-success hidden style="font-size:13px; color:#0f766e;">{{ section.settings.${successMessageId} }}</div>
  </form>
</div>`;
    }

    case "slider": {
      const slidesId = `${prefix}_slider_items`;
      const autoplayId = `${prefix}_slider_autoplay`;
      const speedId = `${prefix}_slider_speed`;
      const heightId = `${prefix}_slider_height`;
      const defaultSlides =
        Array.isArray(content.slides) && content.slides.length
          ? content.slides
              .map(
                (slide: any) =>
                  `${slide.heading || slide.title || "Slide"}|${slide.text || slide.subtitle || ""}|${slide.image || slide.imageUrl || slide.src || ""}`,
              )
              .join("\n")
          : "Slide one|Add slides in theme settings.|";
      schemaSettings.push(
        textareaSetting(slidesId, `${labelPrefix} slides`, defaultSlides),
      );
      schemaSettings.push(
        checkboxSetting(
          autoplayId,
          `${labelPrefix} autoplay`,
          content.autoplay !== false,
        ),
      );
      schemaSettings.push(
        rangeSetting(
          speedId,
          `${labelPrefix} autoplay speed`,
          1200,
          12000,
          100,
          content.autoplaySpeed || 5000,
        ),
      );
      schemaSettings.push(
        rangeSetting(
          heightId,
          `${labelPrefix} slider height`,
          180,
          800,
          10,
          content.height?.desktop || 420,
        ),
      );

      return `${open}
{% assign sb_slides = section.settings.${slidesId} | newline_to_br | split: '<br />' %}
  <div data-sb-slider data-autoplay="{{ section.settings.${autoplayId} }}" data-speed="{{ section.settings.${speedId} }}">
    <div style="position:relative; min-height:{{ section.settings.${heightId} }}px; border-radius:14px; overflow:hidden; background:#0f172a; color:#e2e8f0;">
      {% for sb_slide in sb_slides %}
        {% assign sb_slide_line = sb_slide | strip %}
        {% if sb_slide_line != blank %}
          {% assign sb_slide_parts = sb_slide_line | split: '|' %}
          <div data-sb-slider-slide class="{% if forloop.first %}is-active{% endif %}" style="position:{% if forloop.first %}relative{% else %}absolute{% endif %}; inset:0; min-height:{{ section.settings.${heightId} }}px; padding:28px; align-items:flex-end; background:{% if sb_slide_parts[2] != blank %}linear-gradient(180deg, rgba(15,23,42,0.12), rgba(15,23,42,0.82)), url({{ sb_slide_parts[2] | strip }}) center/cover no-repeat{% else %}linear-gradient(135deg, #0f172a 0%, #2563eb 100%){% endif %};">
            <div style="max-width:520px;">
              <div style="font-size:30px; font-weight:700; line-height:1.1;">{{ sb_slide_parts[0] | strip }}</div>
              <div style="margin-top:10px; font-size:14px; line-height:1.6;">{{ sb_slide_parts[1] | strip }}</div>
            </div>
          </div>
        {% endif %}
      {% endfor %}
    </div>
    <div style="display:flex; justify-content:center; gap:6px; margin-top:10px;">
      {% for sb_slide in sb_slides %}
        {% assign sb_slide_line = sb_slide | strip %}
        {% if sb_slide_line != blank %}
          <button type="button" data-sb-slider-dot style="width:10px; height:10px; border-radius:999px; border:0; background:#0f172a; opacity:{% if forloop.first %}1{% else %}0.4{% endif %}; cursor:pointer;"></button>
        {% endif %}
      {% endfor %}
    </div>
  </div>
</div>`;
    }

    case "product_card": {
      const productHandleId = `${prefix}_product_handle`;
      const showTitleId = `${prefix}_product_show_title`;
      const showVendorId = `${prefix}_product_show_vendor`;
      const showPriceId = `${prefix}_product_show_price`;
      schemaSettings.push(
        textSetting(
          productHandleId,
          `${labelPrefix} product handle`,
          content.productHandle || "",
        ),
      );
      schemaSettings.push(
        checkboxSetting(
          showTitleId,
          `${labelPrefix} show title`,
          content.showTitle !== false,
        ),
      );
      schemaSettings.push(
        checkboxSetting(
          showVendorId,
          `${labelPrefix} show vendor`,
          Boolean(content.showVendor),
        ),
      );
      schemaSettings.push(
        checkboxSetting(
          showPriceId,
          `${labelPrefix} show price`,
          content.showPrice !== false,
        ),
      );

      return `${open}
{% assign sb_product = all_products[section.settings.${productHandleId}] %}
{% if sb_product != blank %}
  <a href="{{ sb_product.url }}" style="display:block; border:1px solid #e2e8f0; border-radius:14px; overflow:hidden; background:#ffffff; text-decoration:none;">
    {% if sb_product.featured_image != blank %}
      <img src="{{ sb_product.featured_image | image_url: width: 900 }}" alt="{{ sb_product.title | escape }}" style="width:100%; display:block;">
    {% endif %}
    <div style="padding:12px;">
      {% if section.settings.${showVendorId} %}<div style="font-size:12px; color:#64748b;">{{ sb_product.vendor }}</div>{% endif %}
      {% if section.settings.${showTitleId} %}<div style="font-weight:600; color:#0f172a;">{{ sb_product.title }}</div>{% endif %}
      {% if section.settings.${showPriceId} %}<div style="margin-top:4px; color:#334155;">{{ sb_product.price | money }}</div>{% endif %}
    </div>
  </a>
{% else %}
  <div style="border:1px solid #e2e8f0; border-radius:14px; overflow:hidden; background:#ffffff; padding:14px;">Add a valid product handle to show real product data.</div>
{% endif %}
</div>`;
    }

    case "product_grid":
    case "collection": {
      const isCollection = element.type === "collection";
      const collectionHandleId = `${prefix}_collection_handle`;
      const columnsId = `${prefix}_collection_columns`;
      const limitId = `${prefix}_collection_limit`;
      const showTitleId = `${prefix}_collection_show_title`;
      schemaSettings.push(
        textSetting(
          collectionHandleId,
          `${labelPrefix} collection handle`,
          content.collectionHandle || content.collectionId || "",
        ),
      );
      schemaSettings.push(
        rangeSetting(
          columnsId,
          `${labelPrefix} columns`,
          1,
          4,
          1,
          content.columns?.desktop || 3,
        ),
      );
      schemaSettings.push(
        rangeSetting(
          limitId,
          `${labelPrefix} item limit`,
          1,
          24,
          1,
          content.limit || 6,
        ),
      );
      schemaSettings.push(
        checkboxSetting(
          showTitleId,
          `${labelPrefix} show collection title`,
          content.showTitle !== false,
        ),
      );

      return `${open}
{% assign sb_collection = collections[section.settings.${collectionHandleId}] %}
{% if sb_collection != blank %}
  <div>
    ${isCollection ? `{% if section.settings.${showTitleId} %}<h3 style="margin:0 0 16px; color:#0f172a;">{{ sb_collection.title }}</h3>{% endif %}` : ""}
    <div style="display:grid; grid-template-columns:repeat({{ section.settings.${columnsId} }}, minmax(0, 1fr)); gap:12px;">
      {% for product in sb_collection.products limit: section.settings.${limitId} %}
        <a href="{{ product.url }}" style="display:block; border:1px solid #e2e8f0; border-radius:14px; overflow:hidden; background:#ffffff; text-decoration:none;">
          {% if product.featured_image != blank %}
            <img src="{{ product.featured_image | image_url: width: 900 }}" alt="{{ product.title | escape }}" style="width:100%; display:block;">
          {% endif %}
          <div style="padding:12px;">
            <div style="font-weight:600; color:#0f172a;">{{ product.title }}</div>
            ${isCollection ? "" : `<div style="margin-top:4px; color:#334155;">{{ product.price | money }}</div>`}
          </div>
        </a>
      {% endfor %}
    </div>
  </div>
{% else %}
  <div style="padding:14px; border:1px solid #e2e8f0; border-radius:14px; background:#ffffff;">Add a valid collection handle to show real store data.</div>
{% endif %}
</div>`;
    }

    default: {
      const noteId = `${prefix}_note`;
      schemaSettings.push(
        textareaSetting(
          noteId,
          `${labelPrefix} unsupported note`,
          `Unsupported builder element type: ${element.type}`,
        ),
      );
      return `${open}
  <div>{{ section.settings.${noteId} }}</div>
</div>`;
    }
  }
}
