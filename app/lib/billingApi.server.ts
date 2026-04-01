const PLANS = {
  PRO: {
    name: "PageBuilder Pro",
    amount: 19.99,
    currencyCode: "USD",
    interval: "EVERY_30_DAYS",
    trialDays: 14,
  },
  AGENCY: {
    name: "PageBuilder Agency",
    amount: 79.99,
    currencyCode: "USD",
    interval: "EVERY_30_DAYS",
    trialDays: 14,
  },
} as const;

export async function createSubscription(
  admin: any,
  plan: "PRO" | "AGENCY",
  returnUrl: string,
) {
  const p = PLANS[plan];
  const response = await admin.graphql(
    `
    mutation appSubscriptionCreate($name: String!, $lineItems: [AppSubscriptionLineItemInput!]!, $returnUrl: URL!, $trialDays: Int) {
      appSubscriptionCreate(name: $name, returnUrl: $returnUrl, trialDays: $trialDays, lineItems: $lineItems, test: false) {
        userErrors { field message }
        confirmationUrl
        appSubscription { id status }
      }
    }
  `,
    {
      variables: {
        name: p.name,
        returnUrl,
        trialDays: p.trialDays,
        lineItems: [
          {
            plan: {
              appRecurringPricingDetails: {
                price: { amount: p.amount, currencyCode: p.currencyCode },
                interval: p.interval,
              },
            },
          },
        ],
      },
    },
  );

  const data = await response.json();
  return data.data.appSubscriptionCreate;
}

export async function cancelSubscription(admin: any, subscriptionId: string) {
  const response = await admin.graphql(
    `
    mutation appSubscriptionCancel($id: ID!) {
      appSubscriptionCancel(id: $id) {
        userErrors { field message }
        appSubscription { id status }
      }
    }
  `,
    { variables: { id: subscriptionId } },
  );
  return (await response.json()).data.appSubscriptionCancel;
}

export async function getActiveSubscription(admin: any) {
  const response = await admin.graphql(
    `
    query { currentAppInstallation { activeSubscriptions { id name status currentPeriodEnd } } }
  `,
  );
  return (await response.json()).data.currentAppInstallation.activeSubscriptions[0] || null;
}

