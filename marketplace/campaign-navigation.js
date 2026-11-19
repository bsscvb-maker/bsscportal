(() => {
  const groups = [
    { id: "apparel", title: "Apparel", categories: ["Men's Apparel", "Women's Apparel", "Unisex Apparel"], subtitle: "T-shirts, tanks and hoodies" },
    { id: "headwear", title: "Headwear", categories: ["Headwear"], subtitle: "Hats, visors and beanies" },
    { id: "drinkware", title: "Drinkware & Coozies", categories: ["Drinkware"], subtitle: "Can and bottle coozies" },
    { id: "accessories", title: "Accessories & Collectibles", categories: ["Accessories", "Patches & Pins", "Coins"], subtitle: "Patches, pins, challenge coins, flags and more" },
  ];
  const imageBase = new URL(".", document.currentScript.src);
  const all = { id: "all", title: "All Products" };
  const catalog = document.querySelector("#catalog");
  const filters = document.querySelector("#filters");
  const originalHero = document.querySelector(".hero-banner");
  if (!catalog || !filters || !originalHero || typeof INVENTORY === "undefined") return;
  const descriptions = {
    "mens-short-sleeve": "A classic crew-neck tee with short sleeves for everyday wear or layering under a riding jacket. Use the color swatches to preview the BoneShakers artwork on each shirt color.",
    "mens-long-sleeve": "A crew-neck long-sleeve tee with BSSC lettering down the sleeves. The extra sleeve coverage makes it a practical layer for cool mornings, club meetings, and outdoor events.",
    "mens-tank": "A sleeveless BoneShakers top with an open arm cut for warm days. Wear it on its own at a cookout or layer it under an open shirt.",
    "mens-pullover-hoodie": "A pullover sweatshirt with a drawstring hood and a front pouch pocket. It layers over a tee for cool-weather club events and keeps the BoneShakers artwork in view.",
    "mens-zip-hoodie": "A full-zip sweatshirt with a drawstring hood and split front pockets. The pictured design pairs a chest emblem with a large skull-and-crossbones graphic on the back and BSSC lettering down the sleeves.",
    "womens-vneck": "A women’s short-sleeve shirt with a V-neck and BoneShakers artwork. The V-shaped neckline sits lower than a crew neck and works on its own or under an open jacket.",
    "womens-racerback": "A women’s sleeveless top with straps that meet between the shoulder blades, leaving more of the shoulders open. Its racerback cut works well for warm weather and casual layering.",
    "womens-vneck-long-sleeve": "A women’s V-neck tee with full-length sleeves. It offers more arm coverage for cooler days and layers under a vest or jacket, with BoneShakers artwork shown in the product photo.",
    "flexfit-hat": "A curved-bill cap with a stretch-fit band. Choose your size for the fitted shape and use the color swatches to compare the club artwork on each cap.",
    "flat-bill-hat": "A BoneShakers cap with a straight, flat brim and a defined front profile. The broad front panel puts the club artwork in clear view.",
    "visor": "An open-top visor that shades the eyes while leaving the crown uncovered. Its low-profile design suits sunny club events and works with a ponytail. Choose a color to preview the design.",
    "beanie": "A brimless knit cap for cool mornings and outdoor club events. It pulls down over the ears, and the product photo shows where the BoneShakers artwork sits on the cap.",
    "standard-can-koozie": "An insulating sleeve sized for a standard-width beverage can. It gives you a place to grip the can and helps keep condensation off your hand.",
    "slim-can-koozie": "An insulating sleeve shaped for tall, narrow beverage cans. Its narrower profile makes it the better fit for slim cans such as those commonly used for seltzer.",
    "zippered-bottle-koozie": "A bottle-shaped insulating sleeve with a zipper that opens for loading. Zip it around the bottle for an easy grip and a barrier between your hand and the cold container.",
    "big-lick-pin": "Show your BoneShakers pride with the BSSC lapel pin. Wear it on a jacket or vest, or add it to your club memorabilia collection.",
    "bssc-logo-sticker": "Put the BoneShakers Social Club emblem on your toolbox, gear case, or another smooth surface with this club logo sticker.",
    "bssc-motorcycle-flag": "Fly the BoneShakers colors on your next ride. This black 12 × 18-inch motorcycle flag features the club’s white skull and crossbones, red accents, and Est. 2005 lettering.",
    "bft-motorcycle-flag": "Celebrate BoneShakers’ Virginia Beach bicycle giveaway with this black 12 × 18-inch motorcycle flag. The club skull sits above colorful Bikes for Tykes lettering and two kids on bicycles.",
    "bssc-wall-flag": "Bring the BoneShakers colors to your garage, clubhouse, or home. This black 3 × 5-foot wall flag features the club’s skull and crossbones, red accents, and Est. 2005 lettering.",
    "bft-wall-flag": "Celebrate the Virginia Beach Bikes for Tykes bicycle giveaway with a black 3 × 5-foot wall flag. Colorful lettering and two young cyclists share the design with the BoneShakers skull and crossbones.",
    "bssc-ring": "Wear your BoneShakers affiliation with a club ring made to your selected size. Allow approximately 1–2 months for processing.",
    "anniv-20-patch": "Mark 20 years of BoneShakers Social Club with this anniversary patch. Add it to a vest or jacket, or keep it with your club memorabilia.",
    "challenge-coin": "Commemorate Bikes for Tykes, BoneShakers’ bicycle giveaway for local children, with this collectible challenge coin. Keep it on display or give it to a fellow supporter.",
  };
  const flagImages = {
    "bssc-motorcycle-flag": "bssc-motorcycle-flag-12x18.svg",
    "bft-motorcycle-flag": "bikes-for-tykes-motorcycle-flag-12x18.svg",
    "bssc-wall-flag": "bssc-wall-flag-3x5.svg",
    "bft-wall-flag": "bft-wall-flag-3x5.svg",
  };
  const newFlags = [
    { id: "bft-motorcycle-flag", name: "Bikes for Tykes Motorcycle Flag", size: "12 × 18 in" },
    { id: "bssc-wall-flag", name: "BoneShakers 3 × 5 ft Wall Flag", size: "3 × 5 ft" },
    { id: "bft-wall-flag", name: "Bikes for Tykes 3 × 5 ft Wall Flag", size: "3 × 5 ft" },
  ];
  function refreshAccessoryProducts() {
    for (const { id, name } of newFlags) {
      if (!INVENTORY.some(product => product.id === id)) {
        INVENTORY.push({ id, name, category: "Accessories", visible: true, price: 0, stock: {} });
      }
    }
    for (const product of INVENTORY) {
      if (descriptions[product.id]) product.description = descriptions[product.id];
      const artwork = flagImages[product.id];
      if (!artwork) continue;
      product.img = new URL(artwork, imageBase).href;
      product.sizes = [newFlags.find(flag => flag.id === product.id)?.size ?? "12 × 18 in"];
      product.oneSize = true;
      product.hasColors = false;
      PICTURES_WITHOUT_TITLES.add(product.id);
    }
  }
  refreshAccessoryProducts();
  const newElement = (tag, className, value) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (value) element.textContent = value;
    return element;
  };

  const style = newElement("style", "", `
    .market-categories {color:#fff;margin:4px 0 26px}
    .market-categories [hidden],#catalog[hidden],#catalog article[hidden] {display:none!important}
    .market-categories h1,.market-categories h2 {letter-spacing:-.035em;line-height:1.05;margin:0}
    .market-categories h1 {font-size:clamp(2.35rem,6vw,4.7rem);font-weight:900}
    .market-categories h2 {font-size:clamp(1.8rem,4vw,3.2rem);font-weight:850}
    .market-categories p {margin:10px 0 0;color:#cdcdcd}
    .market-shop-intro {
      display:flex;flex-direction:column;align-items:flex-start;justify-content:center;
      min-height:390px;padding:clamp(28px,5vw,64px);margin:0 0 22px;
      border:1px solid #383434;border-radius:16px;text-align:left;
      background-color:#171415;
      background-image:linear-gradient(90deg,#0b0a0af5,#0b0a0a9c 44%,#0b0a0a12 76%),url("${new URL("campaign-hero.webp", imageBase).href}");
      background-position:center,center top;background-size:cover;
    }
    .market-shop-intro p {max-width:38ch;color:#fff}
    .market-shop-intro .market-category-actions button {background:#a92824;border-color:#e06a60;padding-inline:24px}
    .market-shop-intro .market-category-actions button:hover {background:#861d1a}
    @media(max-width:620px){
      .market-shop-intro {justify-content:flex-end;min-height:0;padding-top:52%;background-image:linear-gradient(0deg,#0b0a0a 36%,#0b0a0ac0 51%,transparent 78%),url("${new URL("campaign-hero.webp", imageBase).href}");background-position:center,center top;background-size:cover,100% auto;background-repeat:no-repeat}
    }
    .market-category-grid {display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}
    .market-category-card {appearance:none;display:flex;flex-direction:column;min-width:0;overflow:hidden;width:100%;padding:0;border:1px solid #323232;border-radius:16px;color:#fff;background:#111;text-align:left;font:inherit;cursor:pointer}
    .market-category-card:hover,.market-category-card:focus-visible {border-color:#e26760;background:#191414}
    .market-category-photo {display:block;width:100%;aspect-ratio:16/9;background:#191414;overflow:hidden}
    .market-category-photo img {display:block;width:100%;height:100%;object-fit:cover}
    @media(max-width:520px){.market-category-grid {grid-template-columns:1fr!important}}
    .market-category-caption {padding:14px 17px 17px;display:grid;width:100%;gap:4px}
    .market-category-name {font-size:clamp(1rem,2vw,1.18rem);font-weight:800;line-height:1.25}
    .market-category-sub {color:#c3c3c3;font-size:.86rem;grid-column:1}
    .market-category-actions,.market-category-tabs {display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-top:14px}
    .market-category-actions button,.market-category-tabs button {background:#171717;color:#fff;border:1px solid #424242;border-radius:999px;padding:8px 14px;min-height:42px;font:inherit;font-size:.88rem;font-weight:700;cursor:pointer}
    .market-category-actions button:hover,.market-category-tabs button:hover {border-color:#e26760}
    .market-category-tabs button[aria-pressed="true"] {background:#a52b25;border-color:#e26760}
    .market-categories button:focus-visible {outline:2px solid #fff;outline-offset:3px}
    .market-category-detail {padding:2px 0 8px}
    .market-category-detail .market-category-actions {margin:0 0 18px}
    .market-category-status:empty {display:none}
    .market-category-result {font-size:.9rem}
    #catalog .product .imgwrap {width:100%;aspect-ratio:1}
    #catalog .product h3 {line-height:1.22;min-height:0;margin-top:0}
    @supports (grid-template-rows:subgrid) {
      #catalog .product.market-aligned-card {
        display:grid;grid-row:span 12;grid-template-columns:minmax(0,1fr);
        grid-template-rows:subgrid;row-gap:6px;align-items:start;min-width:0;height:auto
      }
      #catalog .market-aligned-card > :last-child,
      #catalog .market-aligned-card .optrow {display:contents!important}
      #catalog .market-aligned-card .imgwrap {grid-row:1}
      #catalog .market-aligned-card h3 {grid-row:2}
      #catalog .market-aligned-card .market-product-category {grid-row:3}
      #catalog .market-aligned-card .product-description {grid-row:4}
      #catalog .market-aligned-card .price {grid-row:5;align-self:center}
      #catalog .market-aligned-card .size-help-link {grid-row:6;justify-self:center}
      #catalog .market-size-options {grid-row:7}
      #catalog .market-color-options {grid-row:8}
      #catalog .market-quantity-options {grid-row:9}
      #catalog .market-aligned-card .stockline {grid-row:10}
      #catalog .market-aligned-card [data-help] {grid-row:11}
      #catalog .market-aligned-card .row {grid-row:12;align-self:end;flex-wrap:wrap;margin-top:0!important}
      #catalog :is(.market-size-options,.market-color-options,.market-quantity-options) {
        display:flex;flex-wrap:wrap;justify-content:center;align-items:center;gap:6px;min-width:0
      }
      #catalog .market-color-options {flex-direction:column}
      #catalog .market-color-options .swatches {display:flex;flex-wrap:wrap;justify-content:center;gap:6px}
      #catalog .market-size-options select {max-width:100%}
    }
    #catalog .product-description {min-height:0}
    /* Fit the source first so title margins are measured on the photo, not the frame. */
    :is(#catalog .product .imgwrap,#productModal .picture-preview)::before,
    :is(#catalog .product .imgwrap,#productModal .picture-preview)::after {display:none!important}
    :is(#catalog .product .imgwrap,#productModal .picture-preview) > :is(.productImg,.product-modal-image) {
      width:auto;height:auto;max-width:100%;max-height:100%;min-width:0;align-self:center;object-fit:contain!important;object-position:center;clip-path:inset(var(--product-title-margin,0%) 0 0)!important
    }
    #productModal .picture-preview > .product-modal-image {max-height:min(100%,72vh)}
    :is(#catalog .product .imgwrap,#productModal .picture-preview):is(
      [data-open-product="mens-short-sleeve"],[data-open-product="mens-long-sleeve"],[data-open-product="mens-tank"],
      [data-open-product="mens-pullover-hoodie"],[data-open-product="womens-vneck"],[data-open-product="womens-vneck-long-sleeve"]
    ) {--product-title-margin:10.5%}
    :is(#catalog .product .imgwrap,#productModal .picture-preview)[data-open-product="mens-zip-hoodie"] {--product-title-margin:11.5%}
    :is(#catalog .product .imgwrap,#productModal .picture-preview)[data-open-product="visor"] {--product-title-margin:6%}
    :is(#catalog .product .imgwrap,#productModal .picture-preview)[data-open-product="flat-bill-hat"] {--product-title-margin:24%}
    :is(#catalog .product .imgwrap,#productModal .picture-preview):is(
      [data-open-product="standard-can-koozie"],[data-open-product="slim-can-koozie"],[data-open-product="zippered-bottle-koozie"]
    ) {--product-title-margin:17%}
    @media(max-width:700px){.market-category-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.market-category-caption{padding:12px}.market-category-sub{font-size:.78rem}}
    @media(max-width:360px){.market-category-grid{grid-template-columns:1fr}}
    @media(prefers-reduced-motion:reduce){.market-categories *{scroll-behavior:auto!important}}
  `);
  document.head.append(style);
  const root = newElement("section", "market-categories");
  root.setAttribute("aria-label", "Shop Marketplace categories");
  const landing = newElement("div");
  const intro = newElement("div", "market-shop-intro");
  const headline = newElement("h1", "", "Gear Up.");
  headline.append(document.createElement("br"), document.createTextNode("Ride BoneShakers."));
  intro.append(headline, newElement("p", "", "Official BoneShakers merchandise. Local pickup in Virginia Beach."));
  const introActions = newElement("div", "market-category-actions");
  intro.append(introActions);
  const tiles = newElement("div", "market-category-grid");
  landing.append(intro, tiles);

  const detail = newElement("div", "market-category-detail");
  const actions = newElement("nav", "market-category-actions");
  actions.setAttribute("aria-label", "Marketplace navigation");
  const title = newElement("h2");
  title.tabIndex = -1;
  const tabs = newElement("div", "market-category-tabs");
  tabs.setAttribute("aria-label", "Product categories");
  const apparelTabs = newElement("div", "market-category-tabs");
  apparelTabs.setAttribute("aria-label", "Apparel filters");
  const count = newElement("p", "market-category-result");
  count.setAttribute("aria-live", "polite");
  const status = newElement("p", "market-category-status");
  status.setAttribute("role", "status");
  detail.append(actions, title, tabs, apparelTabs, count, status);
  root.append(landing, detail);
  document.querySelector("main").prepend(root);
  filters.hidden = true;
  filters.style.display = "none";
  originalHero.hidden = true;
  originalHero.style.display = "none";

  let host = window;
  try {
    if (window.parent !== window && window.parent.location.pathname.replace(/\/$/, "") === "/marketplace") host = window.parent;
  } catch {
    // GoDaddy isolates the editor preview from the enclosing page.
  }
  let selected = null;
  let apparelFilter = "";
  const button = (label, action) => {
    const control = newElement("button", "", label);
    control.type = "button";
    control.addEventListener("click", action);
    return control;
  };
  const byId = id => {
    const categoryId = ["patches-pins", "challenge-coins"].includes(id) ? "accessories" : id;
    return [all, ...groups].find(group => group.id === categoryId) ?? null;
  };
  function routeUrl(group) {
    const url = new URL(host === window ? "https://boneshakerssocialclub.com/marketplace" : host.location.href);
    if (group) url.searchParams.set("category", group.id);
    else url.searchParams.delete("category");
    return url;
  }

  function scrollToShop() {
    const destination = selected ? title : intro.querySelector("h1");
    destination.tabIndex = -1;
    destination.focus({ preventScroll: true });
    if (host !== window && window.frameElement) {
      const top = host.scrollY + window.frameElement.getBoundingClientRect().top + root.getBoundingClientRect().top;
      host.scrollTo({ top: Math.max(0, top - 146) });
    } else {
      destination.scrollIntoView({ block: "start" });
    }
  }

  const accessoryOrder = ["big-lick-pin", "bssc-logo-sticker", "bssc-motorcycle-flag", "bft-motorcycle-flag", "bssc-wall-flag", "bft-wall-flag", "bssc-ring", "anniv-20-patch", "challenge-coin"];
  function arrangeAccessories() {
    const cards = new Map([...catalog.querySelectorAll("article [data-open-product]")]
      .map(element => [element.dataset.openProduct, element.closest("article")]));
    for (const id of accessoryOrder) {
      const card = cards.get(id);
      if (!card) continue;
      if (flagImages[id]) {
        card.querySelector(".stockline").textContent = "Allow ~3 weeks for fulfillment";
        card.querySelector(".stockline").classList.add("custom-lead");
        card.querySelector(".addBtn + .pill")?.remove();
      }
      catalog.append(card);
    }
  }
  function updateVisibility() {
    const products = [...catalog.querySelectorAll("article[data-category]")];
    let matches = 0;
    for (const card of products) {
      const category = card.dataset.category;
      const visible = selected === all || (!!selected && selected.categories.includes(category) && (!apparelFilter || apparelFilter === category));
      card.hidden = !visible;
      if (visible) matches += 1;
    }
    catalog.hidden = !selected;
    count.textContent = matches ? `${matches} ${matches === 1 ? "item" : "items"}` : "No products in this category yet.";
  }

  function updateView() {
    landing.hidden = !!selected;
    detail.hidden = !selected;
    status.textContent = "";
    title.textContent = selected?.title || "";
    for (const tab of tabs.children) tab.setAttribute("aria-pressed", String(tab.dataset.category === selected?.id));
    apparelTabs.hidden = selected?.id !== "apparel";
    for (const tab of apparelTabs.children) tab.setAttribute("aria-pressed", String(tab.dataset.apparel === apparelFilter));
    updateVisibility();
  }

  function navigate(group, writeHistory = true, moveFocus = true) {
    const changed = selected !== group;
    selected = group;
    apparelFilter = "";
    if (changed && writeHistory && host !== window) host.history.pushState(null, "", routeUrl(group));
    updateView();
    if (moveFocus) scrollToShop();
  }
  introActions.append(button("Shop All Gear", () => navigate(all)));
  actions.append(button("← All Categories", () => navigate(null)), button("Shop All Gear", () => navigate(all)));
  const share = button("Copy Category Link", async () => {
    const url = routeUrl(selected).href;
    try {
      await host.navigator.clipboard.writeText(url);
      status.textContent = "Category link copied.";
    } catch {
      const field = newElement("input");
      field.value = url;
      field.readOnly = true;
      field.setAttribute("aria-label", "Category link");
      status.replaceChildren(field);
      field.select();
      field.focus();
    }
  });
  actions.append(share);

  for (const group of groups) {
    const tile = button("", () => navigate(group));
    tile.className = "market-category-card";
    const photo = newElement("span", "market-category-photo");
    const image = newElement("img");
    image.src = new URL("campaign-" + group.id + "-scene.webp", imageBase).href;
    image.alt = "";
    image.decoding = "async";
    photo.append(image);
    const caption = newElement("span", "market-category-caption");
    caption.append(newElement("span", "market-category-name", group.title), newElement("span", "market-category-sub", group.subtitle));
    tile.append(photo, caption);
    tiles.append(tile);
    const tab = button(group.title, () => navigate(group));
    tab.dataset.category = group.id;
    tabs.append(tab);
  }

  for (const value of ["", ...groups[0].categories]) {
    const tab = button(value || "All Apparel", () => {
      apparelFilter = value;
      updateView();
    });
    tab.dataset.apparel = value;
    apparelTabs.append(tab);
  }

  const existingAvailableFor = availableFor;
  availableFor = function (product, size) {
    return flagImages[product?.id] ? 999 : existingAvailableFor(product, size);
  };

  function alignProductCards() {
    if (!CSS.supports("grid-template-rows", "subgrid")) return;
    for (const card of catalog.querySelectorAll("article.product")) {
      const options = card.querySelector(".optrow");
      if (!options || card.classList.contains("market-aligned-card")) continue;
      card.classList.add("market-aligned-card");
      card.querySelector("h3").nextElementSibling.classList.add("market-product-category");
      const size = options.querySelector(".sizeSel");
      const quantity = options.querySelector(".qtyInp");
      const colors = options.querySelector(".swatches");
      const colorName = options.querySelector("[data-colorname]");
      const sizeGroup = newElement("div", "market-size-options");
      const colorGroup = newElement("div", "market-color-options");
      const quantityGroup = newElement("div", "market-quantity-options");
      sizeGroup.append(size.previousElementSibling, size);
      if (colors && colorName) colorGroup.append(colors, colorName);
      quantityGroup.append(quantity.previousElementSibling, quantity);
      options.append(sizeGroup, colorGroup, quantityGroup);
    }
  }

  const existingRender = renderCatalog;
  renderCatalog = function () {
    refreshAccessoryProducts();
    existingRender();
    alignProductCards();
    arrangeAccessories();
    updateVisibility();
  };
  const existingModalStock = updateModalStock;
  updateModalStock = function () {
    existingModalStock();
    if (!flagImages[MODAL_PRODUCT_ID]) return;
    document.querySelector("#modalStock").textContent = "Allow ~3 weeks for fulfillment";
    document.querySelector("#modalStock").className = "custom-lead";
    document.querySelector("#modalHelp").textContent = "Sold as pictured";
  };
  document.querySelector("#modalQtyInp").addEventListener("input", updateModalStock);
  document.querySelector("#modalSizeSel").addEventListener("change", updateModalStock);

  function applyUrl(moveFocus) {
    const params = new URLSearchParams(host === window ? "" : host.location.search);
    navigate(byId(params.get("category")), false, moveFocus);
  }
  renderCatalog();
  applyUrl(false);
  if (host !== window) host.addEventListener("popstate", () => applyUrl(true));

  if (host !== window && window.frameElement) {
    const cartCount = document.querySelector("#cartCount");
    const order = host.document.createElement("button");
    order.type = "button";
    order.style.cssText = "position:fixed;bottom:24px;left:clamp(12px,3vw,30px);z-index:900;background:#a52b25;color:white;border:1px solid #ef7970;border-radius:999px;padding:11px 16px;font:700 14px system-ui;box-shadow:0 5px 18px #0008;cursor:pointer";
    const refreshOrder = () => { order.textContent = `View Order · ${cartCount.textContent.trim()}`; };
    refreshOrder();
    new MutationObserver(refreshOrder).observe(cartCount, { childList: true, characterData: true, subtree: true });
    order.addEventListener("click", () => {
      openCart({ pageY: Math.max(0, -window.frameElement.getBoundingClientRect().top) + 205 });
    });
    host.document.body.append(order);
    window.addEventListener("pagehide", () => order.remove(), { once: true });
  }
})();
