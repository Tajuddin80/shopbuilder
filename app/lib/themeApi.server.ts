type GraphqlUserError = {
  code?: string | null;
  field?: string[] | string | null;
  filename?: string | null;
  message?: string | null;
};

type ThemeSummary = {
  id: string;
  name: string;
  role: string;
};

function formatGraphqlErrorMessage(errors: GraphqlUserError[] = []) {
  return errors
    .map((error) => {
      const field = Array.isArray(error.field)
        ? error.field.join(".")
        : typeof error.field === "string"
          ? error.field
          : typeof error.filename === "string"
            ? error.filename
            : "";
      const message = String(error.message || "").trim();
      const fallbackMessage = String(error.code || "").trim();

      if (!field && !message) return fallbackMessage;
      if (!field) return message || fallbackMessage;
      if (!message) return fallbackMessage ? `${field}: ${fallbackMessage}` : field;
      return `${field}: ${message}`;
    })
    .filter(Boolean)
    .join(" ");
}

function normalizeThemeErrorMessage(message: string) {
  const normalized = message.replace(/\s+/g, " ").trim();

  if (
    /themefilesupsert|modify theme files|write_themes|protected scope|exemption/i.test(
      normalized,
    )
  ) {
    return "Shopify didn't allow this app to edit theme files for this store. The section was still saved in ShopBuilder and can be added from the ShopBuilder app block.";
  }

  return normalized;
}

async function adminGraphql<TData>(
  admin: any,
  query: string,
  variables?: Record<string, unknown>,
) {
  const response = await admin.graphql(query, variables ? { variables } : {});
  const json = await response.json();
  const topLevelErrors = Array.isArray(json?.errors) ? json.errors : [];

  if (topLevelErrors.length > 0) {
    throw new Error(
      formatGraphqlErrorMessage(topLevelErrors) ||
        "Shopify returned a GraphQL error.",
    );
  }

  return (json?.data || {}) as TData;
}

function ensureNoUserErrors(errors: GraphqlUserError[] = [], normalize = false) {
  const message = formatGraphqlErrorMessage(errors);
  if (!message) return;

  throw new Error(normalize ? normalizeThemeErrorMessage(message) : message);
}

function toPageGid(pageId: string) {
  return pageId.startsWith("gid://") ? pageId : `gid://shopify/Page/${pageId}`;
}

type ThemeFileBody =
  | { content?: string | null }
  | { contentBase64?: string | null }
  | { url?: string | null }
  | null
  | undefined;

function getThemeFileBodyText(body: ThemeFileBody) {
  if (!body || typeof body !== "object") return "";
  if ("content" in body && typeof body.content === "string") {
    return body.content;
  }
  if ("contentBase64" in body && typeof body.contentBase64 === "string") {
    return Buffer.from(body.contentBase64, "base64").toString("utf8");
  }
  return "";
}

export async function writeThemePage(
  admin: any,
  {
    handle,
    title,
    liquidContent,
    cssContent,
    themePageId,
    shopDomain,
  }: {
    handle: string;
    title: string;
    liquidContent: string;
    cssContent: string;
    themePageId?: string | null;
    shopDomain?: string | null;
  },
) {
  const activeTheme = await getActiveTheme(admin);
  const themeId = activeTheme.id;

  await saveThemeAsset(admin, themeId, `assets/pb-page-${handle}.css`, cssContent);

  const liquidWithStyle = `<link rel="stylesheet" href="{{ 'pb-page-${handle}.css' | asset_url }}">\n${liquidContent}`;
  await saveThemeAsset(
    admin,
    themeId,
    `templates/page.pb-${handle}.liquid`,
    `{% layout 'theme' %}\n${liquidWithStyle}`,
  );

  if (themePageId) {
    const data = await adminGraphql<{
      pageUpdate: {
        page: { id: string } | null;
        userErrors: GraphqlUserError[];
      };
    }>(
      admin,
      `#graphql
      mutation UpdatePage($id: ID!, $page: PageUpdateInput!) {
        pageUpdate(id: $id, page: $page) {
          page {
            id
          }
          userErrors {
            code
            field
            message
          }
        }
      }`,
      {
        id: toPageGid(String(themePageId)),
        page: {
          title,
          handle,
          body: "<!-- Managed by Shop Builder App. Edit in the app admin. -->",
          isPublished: true,
          templateSuffix: `pb-${handle}`,
        },
      },
    );

    ensureNoUserErrors(data.pageUpdate?.userErrors || []);

    return {
      pageId: String(data.pageUpdate?.page?.id || themePageId),
      previewUrl: shopDomain ? `https://${shopDomain}/pages/${handle}` : `/pages/${handle}`,
    };
  }

  const data = await adminGraphql<{
    pageCreate: {
      page: { id: string } | null;
      userErrors: GraphqlUserError[];
    };
  }>(
    admin,
    `#graphql
    mutation CreatePage($page: PageCreateInput!) {
      pageCreate(page: $page) {
        page {
          id
        }
        userErrors {
          code
          field
          message
        }
      }
    }`,
    {
      page: {
        title,
        handle,
        body: "<!-- Managed by Shop Builder App. Edit in the app admin. -->",
        isPublished: true,
        templateSuffix: `pb-${handle}`,
      },
    },
  );

  ensureNoUserErrors(data.pageCreate?.userErrors || []);

  return {
    pageId: String(data.pageCreate?.page?.id || ""),
    previewUrl: shopDomain ? `https://${shopDomain}/pages/${handle}` : `/pages/${handle}`,
  };
}

export async function getThemeTemplates(admin: any) {
  const activeTheme = await getActiveTheme(admin);
  const data = await adminGraphql<{
    theme: {
      files: {
        nodes: Array<{ filename: string }>;
        userErrors: GraphqlUserError[];
      } | null;
    } | null;
  }>(
    admin,
    `#graphql
    query ThemeFiles($themeId: ID!) {
      theme(id: $themeId) {
        files(first: 250) {
          nodes {
            filename
          }
          userErrors {
            code
            filename
          }
        }
      }
    }`,
    {
      themeId: activeTheme.id,
    },
  );

  ensureNoUserErrors(data.theme?.files?.userErrors || [], true);

  return (data.theme?.files?.nodes || [])
    .filter((file) => file.filename.startsWith("templates/"))
    .map((file) => ({ key: file.filename }));
}

export async function getThemes(admin: any): Promise<ThemeSummary[]> {
  const data = await adminGraphql<{
    themes: {
      nodes: ThemeSummary[];
    } | null;
  }>(
    admin,
    `#graphql
    query Themes {
      themes(first: 25) {
        nodes {
          id
          name
          role
        }
      }
    }`,
  );

  return data.themes?.nodes || [];
}

export async function getActiveTheme(admin: any) {
  const themes = await getThemes(admin);
  const activeTheme =
    themes.find((theme) => theme.role === "MAIN") ||
    themes.find((theme) => theme.role === "DEVELOPMENT") ||
    themes[0];

  if (!activeTheme) throw new Error("No active theme found");
  return activeTheme;
}

export async function saveThemeAsset(
  admin: any,
  themeId: string,
  key: string,
  value: string,
) {
  const data = await adminGraphql<{
    themeFilesUpsert: {
      upsertedThemeFiles: Array<{ filename: string }>;
      userErrors: GraphqlUserError[];
    };
  }>(
    admin,
    `#graphql
    mutation ThemeFilesUpsert(
      $files: [OnlineStoreThemeFilesUpsertFileInput!]!
      $themeId: ID!
    ) {
      themeFilesUpsert(files: $files, themeId: $themeId) {
        upsertedThemeFiles {
          filename
        }
        userErrors {
          field
          message
        }
      }
    }`,
    {
      themeId,
      files: [
        {
          filename: key,
          body: {
            type: "TEXT",
            value,
          },
        },
      ],
    },
  );

  ensureNoUserErrors(data.themeFilesUpsert?.userErrors || [], true);
  return data.themeFilesUpsert?.upsertedThemeFiles?.[0] || null;
}

export async function saveThemeAssetToActiveTheme(
  admin: any,
  key: string,
  value: string,
) {
  const activeTheme = await getActiveTheme(admin);
  await saveThemeAsset(admin, activeTheme.id, key, value);
  return activeTheme;
}

export async function saveThemeAssetToAllThemes(
  admin: any,
  key: string,
  value: string,
) {
  const themes = await getThemes(admin);

  for (const theme of themes) {
    await saveThemeAsset(admin, theme.id, key, value);
  }

  return themes;
}

export async function getThemeAsset(
  admin: any,
  themeId: string,
  key: string,
) {
  const data = await adminGraphql<{
    theme: {
      files: {
        nodes: Array<{
          filename: string;
          contentType?: string | null;
          body?: ThemeFileBody;
        } | null>;
        userErrors: GraphqlUserError[];
      } | null;
    } | null;
  }>(
    admin,
    `#graphql
    query ThemeAsset($themeId: ID!, $filenames: [String!]!) {
      theme(id: $themeId) {
        files(filenames: $filenames) {
          nodes {
            filename
            contentType
            body {
              ... on OnlineStoreThemeFileBodyText {
                content
              }
              ... on OnlineStoreThemeFileBodyBase64 {
                contentBase64
              }
              ... on OnlineStoreThemeFileBodyUrl {
                url
              }
            }
          }
          userErrors {
            code
            filename
          }
        }
      }
    }`,
    {
      themeId,
      filenames: [key],
    },
  );

  ensureNoUserErrors(data.theme?.files?.userErrors || [], true);

  const asset = data.theme?.files?.nodes?.[0];
  if (!asset) return null;

  return {
    key: asset.filename,
    value: getThemeFileBodyText(asset.body),
    contentType: asset.contentType || null,
  };
}

function getTemplateSectionInstanceId(sectionType: string) {
  const suffix = sectionType
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 48);

  return `shopbuilder_${suffix || "section"}`;
}

export async function addSectionInstanceToJsonTemplate(
  admin: any,
  themeId: string,
  {
    templateKey,
    sectionType,
  }: {
    templateKey: string;
    sectionType: string;
  },
) {
  const templateAsset = await getThemeAsset(admin, themeId, templateKey);
  const templateSource = String(templateAsset?.value || "").trim();
  if (!templateSource) return false;

  let parsed: any;
  try {
    parsed = JSON.parse(templateSource);
  } catch (_error) {
    return false;
  }

  if (!parsed || typeof parsed !== "object") return false;
  if (!parsed.sections || typeof parsed.sections !== "object") return false;
  if (!Array.isArray(parsed.order)) return false;

  const instanceId = getTemplateSectionInstanceId(sectionType);
  const nextSections = {
    ...parsed.sections,
    [instanceId]: {
      ...(parsed.sections?.[instanceId] || {}),
      type: sectionType,
      settings: {
        ...((parsed.sections?.[instanceId] || {}).settings || {}),
      },
    },
  };

  const nextOrder = parsed.order.includes(instanceId)
    ? parsed.order
    : [...parsed.order, instanceId];

  await saveThemeAsset(
    admin,
    themeId,
    templateKey,
    JSON.stringify(
      {
        ...parsed,
        sections: nextSections,
        order: nextOrder,
      },
      null,
      2,
    ),
  );

  return true;
}

export async function addSectionInstanceToAllThemes(
  admin: any,
  {
    templateKey,
    sectionType,
  }: {
    templateKey: string;
    sectionType: string;
  },
) {
  const themes = await getThemes(admin);
  let updatedThemes = 0;

  for (const theme of themes) {
    const updated = await addSectionInstanceToJsonTemplate(admin, theme.id, {
      templateKey,
      sectionType,
    });
    if (updated) updatedThemes += 1;
  }

  return { themes, updatedThemes };
}

export async function addSectionInstanceToActiveTheme(
  admin: any,
  {
    templateKey,
    sectionType,
  }: {
    templateKey: string;
    sectionType: string;
  },
) {
  const activeTheme = await getActiveTheme(admin);
  const updated = await addSectionInstanceToJsonTemplate(admin, activeTheme.id, {
    templateKey,
    sectionType,
  });

  return { theme: activeTheme, updated };
}
