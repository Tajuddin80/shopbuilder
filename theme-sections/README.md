Add your native Shopify section files here.

How it works:

- Put any complete Shopify section file in this folder, for example `hero-banner.liquid`.
- Install the app. The builder also auto-syncs this folder whenever the section library loads or a page is saved.
- The app uploads each file into the active theme under `sections/<filename>.liquid`.
- After that, merchants can add those sections directly from Shopify theme customization.

Notes:

- These files should already be valid Shopify section files, including their own `{% schema %}`.
- The builder sidebar will also list them so you can reference them inside pages with `{% section 'handle' %}`.
