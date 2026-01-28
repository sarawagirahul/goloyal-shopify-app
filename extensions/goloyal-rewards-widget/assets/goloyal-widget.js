(function () {
  if (window.goloyalLoaded) return;
  window.goloyalLoaded = true;

  const root = document.getElementById("goloyal-widget-root");
  if (!root) return;

  const shop =
    window.Shopify?.shop ||
    window.Shopify?.analytics?.meta?.shop ||
    window.location.hostname;

  const button = document.createElement("div");
  button.id = "goloyal-widget-button";
  button.innerText = "Rewards";

  const modal = document.createElement("div");
  modal.id = "goloyal-widget-modal";
  modal.innerHTML = `
    <div style="padding:16px;font-weight:600;border-bottom:1px solid #e5e7eb;">
      Available Rewards
    </div>
    <div id="goloyal-rewards-content" style="padding:16px;">
      <div>Loading rewards…</div>
    </div>
  `;

  let isOpen = false;
  let loaded = false;

  async function loadRewards() {
    if (loaded) return;
    loaded = true;

    const content = modal.querySelector("#goloyal-rewards-content");

    try {
      const res = await fetch(`/apps/goloyal/rewards?shop=${encodeURIComponent(shop)}`)

      
    //   fetch(
    //     `/api/rewards?shop=${encodeURIComponent(shop)}`
    //   );

      if (!res.ok) {
        throw new Error("Failed to load rewards");
      }

      const data = await res.json();
      const rewards = data.rewards || [];

      if (!rewards.length) {
        content.innerHTML = `<div>No rewards available right now.</div>`;
        return;
      }

      content.innerHTML = rewards
        .map(
          (r) => `
          <div style="margin-bottom:12px;">
            <div style="font-weight:600;">${r.title}</div>
            ${
              r.description
                ? `<div style="font-size:13px;color:#6b7280;">${r.description}</div>`
                : ""
            }
            ${
              r.ctaUrl
                ? `<a href="${r.ctaUrl}" style="display:inline-block;margin-top:6px;color:#2563eb;">${r.ctaText || "Redeem"}</a>`
                : ""
            }
          </div>
        `
        )
        .join("");
    } catch (e) {
      console.error("GoLoyal widget error:", e);
      content.innerHTML = `<div>Unable to load rewards.</div>`;
    }
  }

  button.addEventListener("click", () => {
    isOpen = !isOpen;
    modal.style.display = isOpen ? "flex" : "none";
    if (isOpen) loadRewards();
  });

  root.appendChild(button);
  root.appendChild(modal);
})();
