import { z } from "zod";

// ----------------------------
// Types (runtime shape mirrors DB Json field)
// ----------------------------

export type ResponsiveValue<T> = {
  desktop: T;
  tablet: T;
  mobile: T;
};

export interface AnimationSettings {
  type:
    | "none"
    | "fadeIn"
    | "fadeInUp"
    | "fadeInDown"
    | "slideInLeft"
    | "slideInRight"
    | "zoomIn";
  duration: number;
  delay: number;
  once: boolean;
}

export interface PageContent {
  version: string;
  globalStyles: {
    backgroundColor: string;
    fontFamily: string;
    maxWidth: number;
    customCss: string;
  };
  sections: Section[];
}

export interface Section {
  id: string;
  type: "section";
  name: string;
  settings: SectionSettings;
  columns: Column[];
  visible: boolean;
  locked: boolean;
}

export interface SectionSettings {
  backgroundColor: ResponsiveValue<string>;
  backgroundImage: string | null;
  backgroundSize: string;
  backgroundPosition: string;
  paddingTop: ResponsiveValue<number>;
  paddingBottom: ResponsiveValue<number>;
  paddingLeft: ResponsiveValue<number>;
  paddingRight: ResponsiveValue<number>;
  marginTop: ResponsiveValue<number>;
  marginBottom: ResponsiveValue<number>;
  fullWidth: boolean;
  minHeight: ResponsiveValue<number | null>;
  borderRadius: number;
  borderWidth: number;
  borderColor: string;
  borderStyle: string;
  customCss: string;
  customId: string;
  customClass: string;
  animation: AnimationSettings;
}

export interface Column {
  id: string;
  width: ResponsiveValue<number>;
  elements: Element[];
  settings: ColumnSettings;
}

export interface ColumnSettings {
  verticalAlign: "top" | "middle" | "bottom";
  paddingTop: ResponsiveValue<number>;
  paddingBottom: ResponsiveValue<number>;
  paddingLeft: ResponsiveValue<number>;
  paddingRight: ResponsiveValue<number>;
  backgroundColor: string;
}

export interface BaseElementSettings {
  marginTop: ResponsiveValue<number>;
  marginBottom: ResponsiveValue<number>;
  marginLeft: ResponsiveValue<number>;
  marginRight: ResponsiveValue<number>;
  paddingTop: ResponsiveValue<number>;
  paddingBottom: ResponsiveValue<number>;
  paddingLeft: ResponsiveValue<number>;
  paddingRight: ResponsiveValue<number>;
  width: ResponsiveValue<string>;
  maxWidth: ResponsiveValue<string>;
  textAlign: ResponsiveValue<"left" | "center" | "right">;
  display: ResponsiveValue<"block" | "none">;
  borderWidth: number;
  borderStyle: string;
  borderColor: string;
  borderRadius: number;
  backgroundColor: string;
  opacity: number;
  animation: AnimationSettings;
  customCss: string;
  customId: string;
  customClass: string;
}

export interface BaseElement {
  id: string;
  type: string;
  name: string;
  visible: boolean;
  locked: boolean;
  settings: BaseElementSettings;
}

// For now we keep Element as a discriminated union by `type` in the UI.
export type Element = BaseElement & Record<string, unknown>;

// ----------------------------
// Zod schemas (server validation)
// ----------------------------

const responsive = <T extends z.ZodTypeAny>(schema: T) =>
  z.object({ desktop: schema, tablet: schema, mobile: schema });

const animationSettingsSchema = z.object({
  type: z.enum([
    "none",
    "fadeIn",
    "fadeInUp",
    "fadeInDown",
    "slideInLeft",
    "slideInRight",
    "zoomIn",
  ]),
  duration: z.number(),
  delay: z.number(),
  once: z.boolean(),
});

const baseElementSettingsSchema = z.object({
  marginTop: responsive(z.number()),
  marginBottom: responsive(z.number()),
  marginLeft: responsive(z.number()),
  marginRight: responsive(z.number()),
  paddingTop: responsive(z.number()),
  paddingBottom: responsive(z.number()),
  paddingLeft: responsive(z.number()),
  paddingRight: responsive(z.number()),
  width: responsive(z.string()),
  maxWidth: responsive(z.string()),
  textAlign: responsive(z.enum(["left", "center", "right"])),
  display: responsive(z.enum(["block", "none"])),
  borderWidth: z.number(),
  borderStyle: z.string(),
  borderColor: z.string(),
  borderRadius: z.number(),
  backgroundColor: z.string(),
  opacity: z.number(),
  animation: animationSettingsSchema,
  customCss: z.string(),
  customId: z.string(),
  customClass: z.string(),
});

const elementSchema = z.object({
  id: z.string(),
  type: z.string(),
  name: z.string(),
  visible: z.boolean(),
  locked: z.boolean(),
  settings: baseElementSettingsSchema,
}).passthrough();

const columnSchema = z.object({
  id: z.string(),
  width: responsive(z.number()),
  elements: z.array(elementSchema),
  settings: z.object({
    verticalAlign: z.enum(["top", "middle", "bottom"]),
    paddingTop: responsive(z.number()),
    paddingBottom: responsive(z.number()),
    paddingLeft: responsive(z.number()),
    paddingRight: responsive(z.number()),
    backgroundColor: z.string(),
  }),
});

const sectionSettingsSchema = z.object({
  backgroundColor: responsive(z.string()),
  backgroundImage: z.string().nullable(),
  backgroundSize: z.string(),
  backgroundPosition: z.string(),
  paddingTop: responsive(z.number()),
  paddingBottom: responsive(z.number()),
  paddingLeft: responsive(z.number()),
  paddingRight: responsive(z.number()),
  marginTop: responsive(z.number()),
  marginBottom: responsive(z.number()),
  fullWidth: z.boolean(),
  minHeight: responsive(z.number().nullable()),
  borderRadius: z.number(),
  borderWidth: z.number(),
  borderColor: z.string(),
  borderStyle: z.string(),
  customCss: z.string(),
  customId: z.string(),
  customClass: z.string(),
  animation: animationSettingsSchema,
});

const sectionSchema = z.object({
  id: z.string(),
  type: z.literal("section"),
  name: z.string(),
  settings: sectionSettingsSchema,
  columns: z.array(columnSchema),
  visible: z.boolean(),
  locked: z.boolean(),
});

export const pageContentSchema = z.object({
  version: z.string(),
  globalStyles: z.object({
    backgroundColor: z.string(),
    fontFamily: z.string(),
    maxWidth: z.number(),
    customCss: z.string(),
  }),
  sections: z.array(sectionSchema),
});

