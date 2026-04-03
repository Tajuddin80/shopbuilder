import { Button, Card, InlineStack, Text } from "@shopify/polaris";
import { PLAN_LIMITS } from "~/lib/planLimits";

export function PlanBanner({
  plan,
  pagesCount,
  onUpgrade,
}: {
  plan: keyof typeof PLAN_LIMITS;
  pagesCount: number;
  onUpgrade: () => void;
}) {
  const limits = PLAN_LIMITS[plan];
  const pagesLabel =
    limits.maxPages === Infinity
      ? "Unlimited section workspaces"
      : `${limits.maxPages} section workspaces`;

  return (
    <Card>
      <InlineStack align="space-between" blockAlign="center">
        <div>
          <div
            style={{
              fontSize: 12,
              textTransform: "uppercase",
              color: "#64748b",
            }}
          >
            Current plan
          </div>
          <Text as="p" fontWeight="semibold">
            {plan} plan
          </Text>
          <div
            style={{
              marginTop: 4,
              fontSize: 13,
              color: "#5c6a79",
              lineHeight: 1.6,
            }}
          >
            {pagesLabel}. You currently have {pagesCount} workspace
            {pagesCount === 1 ? "" : "s"} in the builder.
          </div>
        </div>

        {plan === "FREE" ? (
          <Button variant="primary" onClick={onUpgrade}>
            Upgrade
          </Button>
        ) : (
          <div
            style={{
              padding: "8px 12px",
              borderRadius: 999,
              background: "#ecfdf5",
              color: "#047857",
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            Active
          </div>
        )}
      </InlineStack>
    </Card>
  );
}
