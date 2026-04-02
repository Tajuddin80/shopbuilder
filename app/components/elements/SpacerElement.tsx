import {
  getElementContent,
  type ElementComponentProps,
  responsiveValue,
} from "./shared";

export function SpacerElement({ element }: ElementComponentProps) {
  const content = getElementContent(element);
  return <div style={{ height: responsiveValue(content.height, 40) }} />;
}
