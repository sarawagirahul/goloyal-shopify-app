import { Form, useLoaderData, useActionData, useNavigation } from "react-router";
import {
  Page,
  Card,
  Text,
  TextField,
  Button,
  BlockStack,
  InlineStack,
  Banner,
  Checkbox,
  Spinner,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { supabase } from "../supabase.server";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { useEffect, useState } from "react";

/**
 * Loader
 */
export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  const { data: shopRow } = await supabase
    .from("shops")
    .select("merchant_id, is_active")
    .eq("shop_domain", shop)
    .maybeSingle();

  return {
    isConnected: Boolean(shopRow?.merchant_id),
    isActive: shopRow?.is_active ?? false,
  };
};

/**
 * Action
 */
export const action = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  const formData = await request.formData();
  const merchantId = formData.get("merchant_id");
  const isActive = formData.get("is_active");

  // Toggle save
  if (isActive !== null) {
    await supabase
      .from("shops")
      .update({ is_active: isActive === "true" })
      .eq("shop_domain", shop);

    return { success: true };
  }

  // Merchant connect
  const { data: merchant } = await supabase
    .from("merchants")
    .select("id")
    .eq("merchant_id", merchantId)
    .maybeSingle();

  if (!merchant) {
    return { error: "Invalid Merchant ID" };
  }

  await supabase
    .from("shops")
    .update({
      merchant_id: merchant.id,
      is_active: true,
    })
    .eq("shop_domain", shop);

  return { success: true };
};

/**
 * UI
 */
export default function AppIndex() {
  const { isConnected, isActive } = useLoaderData();
  const actionData = useActionData();
  const navigation = useNavigation();

  const isSubmitting = navigation.state === "submitting";

  // Local UI state
  const [merchantId, setMerchantId] = useState("");
  const [enabled, setEnabled] = useState(isActive);

  // Sync loader → UI on refresh
  useEffect(() => {
    setEnabled(isActive);
  }, [isActive]);

  return (
    <Page title="GoLoyal Rewards">
      {!isConnected ? (
        <Card>
          <BlockStack gap="400">
            <Text variant="headingMd">Connect your Merchant Account</Text>

            {actionData?.error && (
              <Banner status="critical">{actionData.error}</Banner>
            )}

            <Form method="post">
              <TextField
                label="Merchant ID"
                name="merchant_id"
                value={merchantId}
                onChange={setMerchantId}
                placeholder="e.g. MERCH_ABC123"
                autoComplete="off"
                required
                disabled={isSubmitting}
              />

              <InlineStack align="end">
                <Button submit primary loading={isSubmitting}>
                  Connect
                </Button>
              </InlineStack>
            </Form>
          </BlockStack>
        </Card>
      ) : (
        <Card>
          <BlockStack gap="400">
            <Text variant="headingMd">App Status</Text>

            <Form method="post">
              <Checkbox
                label="Enable rewards widget on storefront"
                checked={enabled}
                onChange={setEnabled}
                disabled={isSubmitting}
              />

              <input
                type="hidden"
                name="is_active"
                value={String(enabled)}
              />

              <InlineStack align="end">
                <Button submit loading={isSubmitting}>
                  Save
                </Button>
              </InlineStack>
            </Form>
          </BlockStack>
        </Card>
      )}
    </Page>
  );
}

export const headers = (headersArgs) => boundary.headers(headersArgs);
