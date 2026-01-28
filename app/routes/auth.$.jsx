import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import { supabase } from "../supabase.server";

export const loader = async ({ request }) => {
  // 1. Complete Shopify OAuth & get session
  const { session } = await authenticate.admin(request);

  const shop = session.shop;

  // 2. Store shop in Supabase (idempotent)
  await supabase
    .from("shops")
    .upsert({ shop_domain: shop });

  // 3. Let Shopify handle redirect
  return null;
};

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
