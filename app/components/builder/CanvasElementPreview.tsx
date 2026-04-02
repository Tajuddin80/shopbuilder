import { AccordionElement } from "~/components/elements/AccordionElement";
import { ButtonElement } from "~/components/elements/ButtonElement";
import { CollectionElement } from "~/components/elements/CollectionElement";
import { CountdownElement } from "~/components/elements/CountdownElement";
import { DividerElement } from "~/components/elements/DividerElement";
import { FormElement } from "~/components/elements/FormElement";
import { HeadingElement } from "~/components/elements/HeadingElement";
import { HtmlElement } from "~/components/elements/HtmlElement";
import { IconElement } from "~/components/elements/IconElement";
import { ImageElement } from "~/components/elements/ImageElement";
import { LiquidElement } from "~/components/elements/LiquidElement";
import { MapElement } from "~/components/elements/MapElement";
import { ProductCardElement } from "~/components/elements/ProductCardElement";
import { ProductGridElement } from "~/components/elements/ProductGridElement";
import { SliderElement } from "~/components/elements/SliderElement";
import { SocialIconsElement } from "~/components/elements/SocialIconsElement";
import { SpacerElement } from "~/components/elements/SpacerElement";
import { TabsElement } from "~/components/elements/TabsElement";
import { TestimonialElement } from "~/components/elements/TestimonialElement";
import { TextElement } from "~/components/elements/TextElement";
import { VideoElement } from "~/components/elements/VideoElement";

export function CanvasElementPreview({
  element,
  previewId,
}: {
  element: any;
  previewId: string;
}) {
  switch (element.type) {
    case "heading":
      return <HeadingElement element={element} previewId={previewId} />;
    case "text":
      return <TextElement element={element} previewId={previewId} />;
    case "button":
      return <ButtonElement element={element} previewId={previewId} />;
    case "image":
      return <ImageElement element={element} previewId={previewId} />;
    case "divider":
      return <DividerElement element={element} previewId={previewId} />;
    case "spacer":
      return <SpacerElement element={element} previewId={previewId} />;
    case "html":
      return <HtmlElement element={element} previewId={previewId} />;
    case "liquid":
      return <LiquidElement element={element} previewId={previewId} />;
    case "video":
      return <VideoElement element={element} previewId={previewId} />;
    case "icon":
      return <IconElement element={element} previewId={previewId} />;
    case "social_icons":
      return <SocialIconsElement element={element} previewId={previewId} />;
    case "testimonial":
      return <TestimonialElement element={element} previewId={previewId} />;
    case "accordion":
      return <AccordionElement element={element} previewId={previewId} />;
    case "tabs":
      return <TabsElement element={element} previewId={previewId} />;
    case "countdown":
      return <CountdownElement element={element} previewId={previewId} />;
    case "form":
      return <FormElement element={element} previewId={previewId} />;
    case "slider":
      return <SliderElement element={element} previewId={previewId} />;
    case "product_card":
      return <ProductCardElement element={element} previewId={previewId} />;
    case "product_grid":
      return <ProductGridElement element={element} previewId={previewId} />;
    case "collection":
      return <CollectionElement element={element} previewId={previewId} />;
    case "map":
      return <MapElement element={element} previewId={previewId} />;
    default:
      return (
        <div
          style={{
            padding: 14,
            borderRadius: 12,
            background: "#f8fafc",
            color: "#475569",
            fontSize: 13,
          }}
        >
          {element.type} block preview
        </div>
      );
  }
}
