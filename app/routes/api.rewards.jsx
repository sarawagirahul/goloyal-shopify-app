import { supabase } from "../supabase.server";

/**
 * GET /api/rewards?shop=...
 */
export const loader = async ({ request }) => {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");

  if (!shop) {
    return new Response(
      JSON.stringify({ error: "Missing shop parameter" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // Resolve shop → merchant
  const { data: shopRow } = await supabase
    .from("shops")
    .select("merchant_id, is_active")
    .eq("shop_domain", shop)
    .maybeSingle();

  if (!shopRow || !shopRow.merchant_id) {
    return new Response(
      JSON.stringify({ error: "Shop not connected" }),
      { status: 404, headers: { "Content-Type": "application/json" } }
    );
  }

  if (!shopRow.is_active) {
    return new Response(
      JSON.stringify({ rewards: [] }),
      { headers: { "Content-Type": "application/json" } }
    );
  }

  const { data: rewards, error } = await supabase
    .from("rewards")
    .select(`
      id,
      title,
      description,
      cta_text,
      cta_url,
      reward_type
    `)
    .eq("merchant_id", shopRow.merchant_id)
    .eq("is_active", true)
    .order("priority", { ascending: false });

  if (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch rewards" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  return new Response(
    JSON.stringify({
      merchantId: shopRow.merchant_id,
      rewards: rewards.map((r) => ({
        id: r.id,
        title: r.title,
        description: r.description,
        ctaText: r.cta_text,
        ctaUrl: r.cta_url,
        rewardType: r.reward_type,
      })),
    }),
    { headers: { "Content-Type": "application/json" } }
  );
};
