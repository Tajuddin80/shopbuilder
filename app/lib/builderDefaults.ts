import { nanoid } from "nanoid";
import type { Column, Element, ResponsiveValue, Section } from "./pageSchema";

export function responsiveValue<T>(value: T): ResponsiveValue<T> {
  return { desktop: value, tablet: value, mobile: value };
}

export function defaultAnimationSettings() {
  return { type: "none" as const, duration: 600, delay: 0, once: true };
}

export function defaultSectionSettings(): Section["settings"] {
  return {
    backgroundColor: responsiveValue("#ffffff"),
    backgroundImage: null,
    backgroundSize: "cover",
    backgroundPosition: "center",
    paddingTop: responsiveValue(40),
    paddingBottom: responsiveValue(40),
    paddingLeft: responsiveValue(20),
    paddingRight: responsiveValue(20),
    marginTop: responsiveValue(0),
    marginBottom: responsiveValue(0),
    fullWidth: false,
    minHeight: responsiveValue<number | null>(null),
    borderRadius: 0,
    borderWidth: 0,
    borderColor: "#e5e7eb",
    borderStyle: "solid",
    customCss: "",
    customId: "",
    customClass: "",
    animation: defaultAnimationSettings(),
  };
}

export function defaultColumnSettings(): Column["settings"] {
  return {
    verticalAlign: "top",
    paddingTop: responsiveValue(0),
    paddingBottom: responsiveValue(0),
    paddingLeft: responsiveValue(10),
    paddingRight: responsiveValue(10),
    backgroundColor: "transparent",
  };
}

export function createDefaultColumn(partial: Partial<Column> = {}): Column {
  return {
    id: nanoid(),
    width: responsiveValue(100),
    elements: [],
    settings: defaultColumnSettings(),
    ...partial,
  };
}

export function defaultElementSettings(): Element["settings"] {
  return {
    marginTop: responsiveValue(0),
    marginBottom: responsiveValue(15),
    marginLeft: responsiveValue(0),
    marginRight: responsiveValue(0),
    paddingTop: responsiveValue(0),
    paddingBottom: responsiveValue(0),
    paddingLeft: responsiveValue(0),
    paddingRight: responsiveValue(0),
    width: responsiveValue("100%"),
    maxWidth: responsiveValue("100%"),
    textAlign: responsiveValue<"left" | "center" | "right">("left"),
    display: responsiveValue<"block" | "none">("block"),
    borderWidth: 0,
    borderStyle: "solid",
    borderColor: "transparent",
    borderRadius: 0,
    backgroundColor: "transparent",
    opacity: 1,
    animation: defaultAnimationSettings(),
    customCss: "",
    customId: "",
    customClass: "",
  };
}

export function createDefaultElement(partial: Partial<Element>): Element {
  return {
    id: nanoid(),
    type: "text",
    name: "Element",
    visible: true,
    locked: false,
    settings: defaultElementSettings(),
    ...partial,
  } as Element;
}

export function createDefaultSection(partial: Partial<Section> = {}): Section {
  return {
    id: nanoid(),
    type: "section",
    name: "New Section",
    visible: true,
    locked: false,
    settings: defaultSectionSettings(),
    columns: [createDefaultColumn()],
    ...partial,
  };
}

export function cloneSectionWithNewIds(section: Section): Section {
  return {
    ...section,
    id: nanoid(),
    columns: section.columns.map((column) => ({
      ...column,
      id: nanoid(),
      elements: column.elements.map((element) => ({
        ...(element as Element),
        id: nanoid(),
      })),
    })),
  };
}
