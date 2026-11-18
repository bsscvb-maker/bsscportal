(() => {
  const groups = [
    { id: "apparel", title: "Apparel", categories: ["Men's Apparel", "Women's Apparel", "Unisex Apparel"], picture: "mens-short-sleeve", subtitle: "T-shirts, tanks and hoodies" },
    { id: "headwear", title: "Headwear", categories: ["Headwear"], picture: "flexfit-hat", subtitle: "Hats, visors and beanies" },
    { id: "drinkware", title: "Drinkware & Coozies", categories: ["Drinkware"], picture: "standard-can-koozie", subtitle: "Can and bottle coozies" },
    { id: "accessories", title: "Accessories & Collectibles", categories: ["Accessories", "Patches & Pins", "Coins"], picture: "anniv-20-patch", subtitle: "Patches, pins, challenge coins, flags and more" },
  ];
  const all = { id: "all", title: "All Products" };
  const catalog = document.querySelector("#catalog");
  const filters = document.querySelector("#filters");
  const originalHero = document.querySelector(".hero-banner");
  if (!catalog || !filters || !originalHero || typeof INVENTORY === "undefined") return;
  const descriptions = {
    "big-lick-pin": "Show your BoneShakers pride with the BSSC lapel pin. Wear it on a jacket or vest, or add it to your club memorabilia collection.",
    "bssc-logo-sticker": "Put the BoneShakers Social Club emblem on your toolbox, gear case, or another smooth surface with this club logo sticker.",
    "bssc-motorcycle-flag": "Fly the BoneShakers colors on your next ride. This black 12 × 18-inch motorcycle flag features the club’s white skull and crossbones, red accents, and Est. 2005 lettering.",
    "bft-motorcycle-flag": "Celebrate BoneShakers’ Virginia Beach bicycle giveaway with this black 12 × 18-inch motorcycle flag. The club skull sits above colorful Bikes for Tykes lettering and two kids on bicycles.",
    "bssc-ring": "Wear your BoneShakers affiliation with a club ring made to your selected size. Allow approximately 1–2 months for processing.",
    "anniv-20-patch": "Mark 20 years of BoneShakers Social Club with this anniversary patch. Add it to a vest or jacket, or keep it with your club memorabilia.",
    "challenge-coin": "Commemorate Bikes for Tykes, BoneShakers’ bicycle giveaway for local children, with this collectible challenge coin. Keep it on display or give it to a fellow supporter.",
  };
  const flagImages = {
    "bssc-motorcycle-flag": "bssc-motorcycle-flag-12x18.svg",
    "bft-motorcycle-flag": "bikes-for-tykes-motorcycle-flag-12x18.svg",
  };
  const imageBase = new URL(".", document.currentScript.src);
  function refreshAccessoryProducts() {
    const bftId = "bft-motorcycle-flag";
    if (!INVENTORY.some(product => product.id === bftId)) {
      INVENTORY.push({ id: bftId, name: "Bikes for Tykes Motorcycle Flag", category: "Accessories", visible: true, price: 0, stock: {} });
    }
    for (const product of INVENTORY) {
      if (descriptions[product.id]) product.description = descriptions[product.id];
      const artwork = flagImages[product.id];
      if (!artwork) continue;
      product.img = new URL(artwork, imageBase).href;
      product.sizes = ["12 × 18 in"];
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
    .market-shop-intro {padding:clamp(24px,5vw,60px);border:1px solid #353030;border-radius:20px;background:radial-gradient(ellipse at 98% 0%,#431712 0%,transparent 66%),linear-gradient(120deg,#191414,#0a0a0a);margin:0 0 22px}
    .market-category-grid {display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}
    .market-category-card {appearance:none;display:flex;flex-direction:column;min-width:0;overflow:hidden;width:100%;padding:0;border:1px solid #323232;border-radius:16px;color:#fff;background:#111;text-align:left;font:inherit;cursor:pointer}
    .market-category-card:hover,.market-category-card:focus-visible {border-color:#e26760;background:#191414}
    .market-category-photo {aspect-ratio:2/1;width:100%;position:relative;display:grid;place-items:center;background:radial-gradient(ellipse,#201d1d,#090909);overflow:hidden}
    .market-category-photo img {width:100%;height:100%;position:absolute;inset:0;object-fit:contain}
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
    #catalog .product h3 {line-height:1.22}
    #catalog .market-unpriced-flag :is(.optrow,.stockline,[data-help],.addBtn,.soldout) {display:none!important}
    #productModal:has(.market-unpriced-flag) :is(.product-modal-options,.stockline,#modalHelp,#modalAddBtn) {display:none!important}
    .market-flag-placeholder {display:grid;align-content:center;justify-items:center;text-align:center;padding:24px;min-height:240px;border-style:dashed}
    .market-flag-placeholder p {color:#ccc;margin:0}
    @media(max-width:700px){.market-category-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.market-category-caption{padding:12px}.market-category-sub{font-size:.78rem}}
    @media(max-width:360px){.market-category-grid{grid-template-columns:1fr}}
    @media(prefers-reduced-motion:reduce){.market-categories *{scroll-behavior:auto!important}}
  `);
  document.head.append(style);
  const root = newElement("section", "market-categories");
  root.setAttribute("aria-label", "Shop Marketplace categories");
  const landing = newElement("div");
  const intro = newElement("div", "market-shop-intro");
  intro.append(newElement("h1", "", "Shop BoneShakers"), newElement("p", "", "Official apparel, riding gear and collectibles. Local pickup in Virginia Beach."));
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

  const accessoryOrder = ["big-lick-pin", "bssc-logo-sticker", "bssc-motorcycle-flag", "bft-motorcycle-flag", "flag-3x5", "bssc-ring", "anniv-20-patch", "challenge-coin"];
  const isUnpricedFlag = product => Boolean(product && flagImages[product.id] &&
    priceFor(product, product.sizes[0]) <= 0);
  function arrangeAccessories() {
    const cards = new Map([...catalog.querySelectorAll("article [data-open-product]")]
      .map(element => [element.dataset.openProduct, element.closest("article")]));
    if (!cards.has("flag-3x5")) {
      const placeholder = newElement("article", "card product market-flag-placeholder");
      placeholder.dataset.category = "Accessories";
      placeholder.append(newElement("h3", "", "BoneShakers 3 × 5 ft Flag"),
        newElement("p", "", "A full-size BoneShakers Social Club flag for the garage, clubhouse, or club events."),
        newElement("p", "", "Coming soon"));
      cards.set("flag-3x5", placeholder);
    }
    for (const id of accessoryOrder) {
      const card = cards.get(id);
      if (!card) continue;
      const product = INVENTORY.find(product => product.id === id);
      if (isUnpricedFlag(product)) {
        card.classList.add("market-unpriced-flag");
        card.querySelector(".price").textContent = "Price coming soon";
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
  introActions.append(button("View All Products", () => navigate(all)));
  actions.append(button("← All Categories", () => navigate(null)), button("View All Products", () => navigate(all)));
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
    const representative = INVENTORY.find(product => product.visible && product.id === group.picture)
      || INVENTORY.find(product => product.visible && group.categories.includes(product.category));
    const photo = newElement("span", "market-category-photo");
    if (representative?.img) {
      const img = newElement("img");
      img.src = representative.img;
      img.alt = "";
      img.decoding = "async";
      photo.append(img);
    }
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

  const existingRender = renderCatalog;
  renderCatalog = function () {
    refreshAccessoryProducts();
    existingRender();
    arrangeAccessories();
    updateVisibility();
  };
  const existingModalStock = updateModalStock;
  updateModalStock = function () {
    existingModalStock();
    const product = INVENTORY.find(product => product.id === MODAL_PRODUCT_ID);
    const unpriced = isUnpricedFlag(product);
    document.querySelector("#modalProductImage").parentElement.classList.toggle("market-unpriced-flag", unpriced);
    if (unpriced) {
      document.querySelector("#modalProductPrice").textContent = "Price coming soon";
      document.querySelector("#modalAddBtn").disabled = true;
    }
  };
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
