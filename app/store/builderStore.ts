import { create } from "zustand";
import { temporal } from "zundo";
import { nanoid } from "nanoid";
import type { PageContent, Section, Element } from "~/lib/pageSchema";
import {
  createDefaultElement,
  createDefaultSection,
  createDefaultColumn,
} from "~/lib/builderDefaults";

interface BuilderState {
  // Page data
  pageId: string | null;
  pageContent: PageContent;
  pageMeta: {
    title: string;
    handle: string;
    seoTitle: string;
    seoDescription: string;
  };

  // Selection
  selectedElementId: string | null;
  selectedSectionId: string | null;
  hoveredElementId: string | null;

  // UI state
  activeBreakpoint: "desktop" | "tablet" | "mobile";
  sidebarTab: "elements" | "layers" | "navigator";
  settingsPanelOpen: boolean;
  isDragging: boolean;
  isSaving: boolean;
  isPublishing: boolean;
  hasUnsavedChanges: boolean;
  previewMode: boolean;
  libraryRefreshNonce: number;

  // Actions — page
  setPageContent: (content: PageContent) => void;
  updateGlobalStyles: (styles: Partial<PageContent["globalStyles"]>) => void;

  // Actions — sections
  addSection: (section: Partial<Section>, atIndex?: number) => void;
  duplicateSection: (sectionId: string) => void;
  deleteSection: (sectionId: string) => void;
  updateSection: (sectionId: string, updates: Partial<Section>) => void;
  setSectionColumns: (sectionId: string, widths: number[]) => void;
  reverseSectionColumns: (sectionId: string) => void;
  updateSectionSettings: (
    sectionId: string,
    settings: Partial<Section["settings"]>,
  ) => void;
  moveSectionUp: (sectionId: string) => void;
  moveSectionDown: (sectionId: string) => void;
  setSections: (sections: Section[]) => void;

  // Actions — elements
  addElement: (
    sectionId: string,
    columnId: string,
    element: Partial<Element>,
    atIndex?: number,
  ) => void;
  duplicateElement: (elementId: string) => void;
  deleteElement: (elementId: string) => void;
  updateElement: (elementId: string, updates: Partial<Element>) => void;
  moveElement: (
    elementId: string,
    fromSectionId: string,
    fromColumnId: string,
    fromIndex: number,
    toSectionId: string,
    toColumnId: string,
    toIndex: number,
  ) => void;

  // Actions — selection
  selectElement: (elementId: string | null, sectionId?: string | null) => void;
  hoverElement: (elementId: string | null) => void;

  // Actions — UI
  setBreakpoint: (bp: "desktop" | "tablet" | "mobile") => void;
  setSidebarTab: (tab: "elements" | "layers" | "navigator") => void;
  setPreviewMode: (preview: boolean) => void;
  setIsSaving: (saving: boolean) => void;
  setIsPublishing: (publishing: boolean) => void;
  setHasUnsavedChanges: (changed: boolean) => void;
  bumpLibraryRefreshNonce: () => void;
}

export const useBuilderStore = create<BuilderState>()(
  temporal(
    (set, get) => ({
      pageId: null,
      pageContent: {
        version: "1.0",
        globalStyles: {
          backgroundColor: "#ffffff",
          fontFamily: "sans-serif",
          maxWidth: 1200,
          customCss: "",
        },
        sections: [],
      },
      pageMeta: { title: "", handle: "", seoTitle: "", seoDescription: "" },

      selectedElementId: null,
      selectedSectionId: null,
      hoveredElementId: null,

      activeBreakpoint: "desktop",
      sidebarTab: "elements",
      settingsPanelOpen: false,
      isDragging: false,
      isSaving: false,
      isPublishing: false,
      hasUnsavedChanges: false,
      previewMode: false,
      libraryRefreshNonce: 0,

      setPageContent: (content) =>
        set({ pageContent: content, hasUnsavedChanges: false }),

      updateGlobalStyles: (styles) =>
        set((state) => ({
          pageContent: {
            ...state.pageContent,
            globalStyles: { ...state.pageContent.globalStyles, ...styles },
          },
          hasUnsavedChanges: true,
        })),

      addSection: (partial, atIndex) =>
        set((state) => {
          const newSection = createDefaultSection(partial);
          const sections = [...state.pageContent.sections];
          const idx = atIndex !== undefined ? atIndex : sections.length;
          sections.splice(idx, 0, newSection);
          return {
            pageContent: { ...state.pageContent, sections },
            hasUnsavedChanges: true,
          };
        }),

      duplicateSection: (sectionId) =>
        set((state) => {
          const idx = state.pageContent.sections.findIndex(
            (s) => s.id === sectionId,
          );
          if (idx < 0) return state;
          const original = state.pageContent.sections[idx];
          const clone: Section = {
            ...original,
            id: nanoid(),
            name: `${original.name} (Copy)`,
            columns: original.columns.map((c) => ({
              ...c,
              id: nanoid(),
              elements: c.elements.map((e) => ({
                ...(e as any),
                id: nanoid(),
              })),
            })),
          };
          const sections = [...state.pageContent.sections];
          sections.splice(idx + 1, 0, clone);
          return {
            pageContent: { ...state.pageContent, sections },
            hasUnsavedChanges: true,
          };
        }),

      deleteSection: (sectionId) =>
        set((state) => ({
          pageContent: {
            ...state.pageContent,
            sections: state.pageContent.sections.filter(
              (s) => s.id !== sectionId,
            ),
          },
          selectedSectionId: null,
          selectedElementId: null,
          hasUnsavedChanges: true,
        })),

      updateSection: (sectionId, updates) =>
        set((state) => ({
          pageContent: {
            ...state.pageContent,
            sections: state.pageContent.sections.map((section) =>
              section.id === sectionId
                ? {
                    ...section,
                    ...updates,
                    settings: updates.settings
                      ? { ...section.settings, ...updates.settings }
                      : section.settings,
                  }
                : section,
            ),
          },
          hasUnsavedChanges: true,
        })),

      setSectionColumns: (sectionId, widths) =>
        set((state) => ({
          pageContent: {
            ...state.pageContent,
            sections: state.pageContent.sections.map((section) => {
              if (section.id !== sectionId) return section;

              const nextColumns = widths.map((width, index) => {
                const existingColumn = section.columns[index];
                if (existingColumn) {
                  return {
                    ...existingColumn,
                    width: {
                      desktop: width,
                      tablet: 100,
                      mobile: 100,
                    },
                  };
                }

                return createDefaultColumn({
                  width: { desktop: width, tablet: 100, mobile: 100 },
                });
              });

              if (section.columns.length > widths.length) {
                const overflowElements = section.columns
                  .slice(widths.length)
                  .flatMap((column) => column.elements);

                if (overflowElements.length > 0) {
                  const lastColumn = nextColumns[nextColumns.length - 1];
                  lastColumn.elements = [
                    ...lastColumn.elements,
                    ...overflowElements,
                  ];
                }
              }

              return { ...section, columns: nextColumns };
            }),
          },
          hasUnsavedChanges: true,
        })),

      reverseSectionColumns: (sectionId) =>
        set((state) => ({
          pageContent: {
            ...state.pageContent,
            sections: state.pageContent.sections.map((section) =>
              section.id === sectionId
                ? { ...section, columns: [...section.columns].reverse() }
                : section,
            ),
          },
          hasUnsavedChanges: true,
        })),

      updateSectionSettings: (sectionId, settings) =>
        set((state) => ({
          pageContent: {
            ...state.pageContent,
            sections: state.pageContent.sections.map((s) =>
              s.id === sectionId
                ? { ...s, settings: { ...s.settings, ...settings } }
                : s,
            ),
          },
          hasUnsavedChanges: true,
        })),

      moveSectionUp: (sectionId) =>
        set((state) => {
          const idx = state.pageContent.sections.findIndex(
            (s) => s.id === sectionId,
          );
          if (idx <= 0) return state;
          const sections = [...state.pageContent.sections];
          const [s] = sections.splice(idx, 1);
          sections.splice(idx - 1, 0, s);
          return {
            pageContent: { ...state.pageContent, sections },
            hasUnsavedChanges: true,
          };
        }),

      moveSectionDown: (sectionId) =>
        set((state) => {
          const idx = state.pageContent.sections.findIndex(
            (s) => s.id === sectionId,
          );
          if (idx < 0 || idx >= state.pageContent.sections.length - 1)
            return state;
          const sections = [...state.pageContent.sections];
          const [s] = sections.splice(idx, 1);
          sections.splice(idx + 1, 0, s);
          return {
            pageContent: { ...state.pageContent, sections },
            hasUnsavedChanges: true,
          };
        }),

      setSections: (sections) =>
        set((state) => ({
          pageContent: { ...state.pageContent, sections },
          hasUnsavedChanges: true,
        })),

      addElement: (sectionId, columnId, partial, atIndex) =>
        set((state) => {
          const newElement = createDefaultElement(partial);
          return {
            pageContent: {
              ...state.pageContent,
              sections: state.pageContent.sections.map((s) =>
                s.id !== sectionId
                  ? s
                  : {
                      ...s,
                      columns: s.columns.map((col) => {
                        if (col.id !== columnId) return col;
                        const elements = [...col.elements];
                        const idx =
                          atIndex !== undefined ? atIndex : elements.length;
                        elements.splice(idx, 0, newElement as Element);
                        return { ...col, elements };
                      }),
                    },
              ),
            },
            selectedElementId: newElement.id,
            selectedSectionId: sectionId,
            hasUnsavedChanges: true,
          };
        }),

      duplicateElement: (elementId) =>
        set((state) => {
          let duplicated: Element | null = null;
          const sections = state.pageContent.sections.map((s) => ({
            ...s,
            columns: s.columns.map((col) => {
              const idx = col.elements.findIndex((el) => el.id === elementId);
              if (idx < 0) return col;
              const original = col.elements[idx] as any;
              duplicated = {
                ...original,
                id: nanoid(),
                name: `${original.name} (Copy)`,
              } as Element;
              const elements = [...col.elements];
              elements.splice(idx + 1, 0, duplicated);
              return { ...col, elements };
            }),
          }));
          if (!duplicated) return {} as any;
          const dup = duplicated as Element;
          return {
            pageContent: { ...state.pageContent, sections },
            selectedElementId: dup.id,
            hasUnsavedChanges: true,
          };
        }),

      deleteElement: (elementId) =>
        set((state) => ({
          pageContent: {
            ...state.pageContent,
            sections: state.pageContent.sections.map((s) => ({
              ...s,
              columns: s.columns.map((col) => ({
                ...col,
                elements: col.elements.filter((el) => el.id !== elementId),
              })),
            })),
          },
          selectedElementId: null,
          hasUnsavedChanges: true,
        })),

      updateElement: (elementId, updates) =>
        set((state) => ({
          pageContent: {
            ...state.pageContent,
            sections: state.pageContent.sections.map((s) => ({
              ...s,
              columns: s.columns.map((col) => ({
                ...col,
                elements: col.elements.map((el) =>
                  el.id === elementId ? deepMerge(el, updates) : el,
                ),
              })),
            })),
          },
          hasUnsavedChanges: true,
        })),

      moveElement: (
        elementId,
        fromSectionId,
        fromColumnId,
        fromIndex,
        toSectionId,
        toColumnId,
        toIndex,
      ) =>
        set((state) => {
          let moving: Element | undefined;
          const sectionsAfterRemove = state.pageContent.sections.map((s) => {
            if (s.id !== fromSectionId) return s;
            return {
              ...s,
              columns: s.columns.map((c) => {
                if (c.id !== fromColumnId) return c;
                const next = c.elements.filter((el) => {
                  if (el.id !== elementId) return true;
                  moving = el;
                  return false;
                });
                return { ...c, elements: next };
              }),
            };
          });
          if (!moving) return state;

          const sectionsAfterInsert = sectionsAfterRemove.map((s) => {
            if (s.id !== toSectionId) return s;
            return {
              ...s,
              columns: s.columns.map((c) => {
                if (c.id !== toColumnId) return c;
                const elements = [...c.elements];
                const adjustedIndex =
                  fromSectionId === toSectionId &&
                  fromColumnId === toColumnId &&
                  toIndex > fromIndex
                    ? toIndex - 1
                    : toIndex;
                const idx = Math.max(
                  0,
                  Math.min(adjustedIndex, elements.length),
                );
                elements.splice(idx, 0, moving!);
                return { ...c, elements };
              }),
            };
          });

          return {
            pageContent: {
              ...state.pageContent,
              sections: sectionsAfterInsert,
            },
            hasUnsavedChanges: true,
          };
        }),

      selectElement: (elementId, sectionId = null) =>
        set({
          selectedElementId: elementId,
          selectedSectionId: sectionId,
          settingsPanelOpen: !!elementId || !!sectionId,
        }),

      hoverElement: (elementId) => set({ hoveredElementId: elementId }),
      setBreakpoint: (bp) => set({ activeBreakpoint: bp }),
      setSidebarTab: (tab) => set({ sidebarTab: tab }),
      setPreviewMode: (preview) => set({ previewMode: preview }),
      setIsSaving: (saving) => set({ isSaving: saving }),
      setIsPublishing: (publishing) => set({ isPublishing: publishing }),
      setHasUnsavedChanges: (changed) => set({ hasUnsavedChanges: changed }),
      bumpLibraryRefreshNonce: () =>
        set((state) => ({
          libraryRefreshNonce: state.libraryRefreshNonce + 1,
        })),
    }),
    {
      limit: 50,
      partialize: (state) => ({ pageContent: state.pageContent }),
    },
  ),
);

function deepMerge(target: any, source: any): any {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (
      source[key] &&
      typeof source[key] === "object" &&
      !Array.isArray(source[key])
    ) {
      result[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}
