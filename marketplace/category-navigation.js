(() => {
  const groups = [
    { id: "apparel", title: "Apparel", categories: ["Men's Apparel", "Women's Apparel", "Unisex Apparel"], subtitle: "T-shirts, tanks and hoodies" },
    { id: "headwear", title: "Headwear", categories: ["Headwear"], subtitle: "Hats, visors and beanies" },
    { id: "drinkware", title: "Drinkware & Coozies", categories: ["Drinkware"], subtitle: "Can and bottle coozies" },
    { id: "accessories", title: "Accessories & Collectibles", categories: ["Accessories", "Patches & Pins", "Coins"], subtitle: "Patches, pins, challenge coins, flags and more" },
  ];
  const storefrontImages = "https://img1.wsimg.com/isteam/ip/6b7b89b2-dd4f-422d-8d29-7971f64bd923/";
  const categoryPhotos = {
    apparel: storefrontImages + "1CEDB8B3-830C-4023-9605-C01F62DF837D.png",
    headwear: storefrontImages + "Fitted%20Hat.png",
    drinkware: storefrontImages + "1DB94A6C-F5C0-49D3-9256-1E1224D00D5C.png",
    accessories: "https://img1.wsimg.com/isteam/ip/a61a7501-5b4e-4a14-8b09-6b6b40dc23cf/BSSC%2020th%20Year%20Logo.jpg",
  };
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
  const imageBase = new URL(".", document.currentScript.src);
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
    .market-shop-intro {padding:clamp(24px,5vw,60px);border:1px solid #353030;border-radius:20px;background:radial-gradient(ellipse at 98% 0%,#431712 0%,transparent 66%),linear-gradient(120deg,#191414,#0a0a0a);margin:0 0 22px}
    .market-category-grid {display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}
    .market-category-card {appearance:none;display:flex;flex-direction:column;min-width:0;overflow:hidden;width:100%;padding:0;border:1px solid #323232;border-radius:16px;color:#fff;background:#111;text-align:left;font:inherit;cursor:pointer}
    .market-category-card:hover,.market-category-card:focus-visible {border-color:#e26760;background:#191414}
    .market-category-photo {aspect-ratio:2/1;width:100%;position:relative;display:grid;place-items:center;background:radial-gradient(ellipse,#201d1d,#090909);overflow:hidden}
    .market-category-photo img {position:absolute;height:auto;max-width:none;transform:translate(-50%,-50%)}
    /* Crop the original photo backgrounds to the product silhouettes. */
    .market-category-photo[data-group="apparel"] img {width:55%;left:50%;top:45.5%;clip-path:polygon(0.957% 82.536%, 2.392% 79.426%, 2.073% 75.120%, 1.515% 66.507%, 1.914% 55.742%, 2.951% 44.338%, 3.828% 35.965%, 5.502% 32.376%, 8.772% 29.107%, 12.919% 26.555%, 13.876% 22.488%, 15.710% 18.740%, 19.139% 16.906%, 23.764% 15.869%, 29.904% 15.152%, 35.486% 15.550%, 39.394% 16.348%, 41.308% 19.059%, 42.663% 23.684%, 44.577% 26.236%, 48.644% 28.628%, 51.834% 32.456%, 54.306% 29.266%, 59.091% 26.954%, 60.447% 22.648%, 62.281% 18.581%, 65.470% 16.906%, 70.415% 15.949%, 74.960% 15.152%, 79.904% 15.470%, 83.971% 16.826%, 87.161% 18.740%, 87.799% 23.764%, 90.271% 26.236%, 93.301% 28.150%, 96.252% 32.057%, 97.448% 37.321%, 97.528% 43.301%, 98.246% 51.435%, 98.724% 60.207%, 99.203% 70.415%, 99.282% 78.070%, 98.246% 82.536%, 98.006% 87.400%, 96.411% 88.836%, 93.062% 89.633%, 90.750% 89.075%, 90.590% 85.407%, 88.676% 85.407%, 88.278% 87.799%, 84.450% 89.234%, 76.236% 90.351%, 68.102% 89.793%, 61.324% 88.836%, 56.380% 88.118%, 55.742% 85.885%, 52.233% 86.124%, 51.754% 91.627%, 50.239% 92.903%, 47.049% 92.663%, 43.939% 91.786%, 43.301% 89.234%, 41.148% 88.676%, 40.431% 90.351%, 36.683% 91.148%, 27.671% 91.707%, 17.065% 91.148%, 10.766% 90.032%, 9.330% 87.719%, 7.895% 87.959%, 7.656% 90.191%, 5.502% 90.112%, 3.190% 89.474%, 2.073% 88.278%, 2.392% 85.167%)}
    .market-category-photo[data-group="headwear"] img {width:76%;left:50%;top:45%;clip-path:polygon(0.6868% 75.8333%, 3.2967% 68.0556%, 7.4176% 60.0000%, 7.9670% 45.0926%, 9.2720% 36.0185%, 11.6071% 31.2963%, 15.3159% 27.2222%, 22.4588% 23.4259%, 28.1593% 20.8333%, 28.7775% 19.3519%, 30.3571% 18.7963%, 32.0055% 18.9815%, 32.6923% 20.7407%, 38.3242% 22.4074%, 44.7115% 26.3889%, 48.4203% 30.8333%, 51.0989% 37.7778%, 52.3352% 46.8519%, 52.4725% 53.1481%, 54.8764% 53.1481%, 55.7005% 44.6296%, 57.4863% 37.4074%, 60.5082% 31.7593%, 65.7967% 26.8519%, 74.2445% 23.4259%, 74.8626% 22.1296%, 76.7857% 21.6667%, 78.7088% 22.0370%, 79.2582% 23.3333%, 84.4780% 25.3704%, 88.4615% 27.7778%, 92.1703% 31.8519%, 94.7802% 37.6852%, 96.4286% 44.0741%, 97.8022% 53.9815%, 98.6264% 64.1667%, 98.3516% 68.6111%, 96.0852% 71.6667%, 90.6593% 74.7222%, 82.1429% 76.7593%, 73.6264% 77.3148%, 64.9038% 75.9259%, 59.5467% 73.7963%, 55.4945% 70.0926%, 54.5330% 67.5000%, 54.7390% 53.2407%, 52.4725% 53.2407%, 52.2665% 62.4074%, 49.1758% 65.4630%, 45.3984% 66.6667%, 43.4066% 71.9444%, 39.3544% 78.0556%, 33.5165% 83.2407%, 28.1593% 86.0185%, 21.9780% 86.6667%, 13.6676% 84.2593%, 6.3187% 80.9259%, 2.0604% 79.1667%)}
    .market-category-photo[data-group="drinkware"] img {width:38%;left:50%;top:41%;clip-path:polygon(29.0055% 21.8232%, 29.8343% 20.7873%, 35.6354% 19.5442%, 47.6059% 19.0608%, 60.6814% 19.3370%, 67.7716% 20.3039%, 70.5341% 21.5470%, 70.9945% 22.9972%, 69.3370% 24.5166%, 72.9282% 28.0387%, 75.8748% 28.4530%, 77.9006% 29.9724%, 77.8085% 87.5691%, 77.3481% 90.5387%, 76.4273% 92.2652%, 75.3223% 94.8895%, 72.4678% 96.7541%, 67.0350% 98.0663%, 32.9650% 98.2735%, 28.3610% 97.1685%, 25.0460% 95.1657%, 23.7569% 92.7486%, 22.2836% 90.7459%, 21.9153% 31.9751%, 21.6390% 29.8343%, 23.0203% 28.7293%, 25.9669% 27.9006%, 30.1105% 24.3785%, 29.0055% 23.2044%)}
    .market-category-photo[data-group="accessories"] img {width:43%;left:50%;top:50%;clip-path:polygon(21.6981% 3.6223%, 23.5849% 3.7516%, 22.1024% 6.0802%, 16.9811% 12.5485%, 13.7466% 19.6636%, 11.5903% 27.1669%, 11.1860% 33.6352%, 13.2075% 39.5860%, 16.1725% 41.2678%, 23.1806% 39.9741%, 23.9892% 33.3765%, 24.6631% 27.4256%, 27.7628% 21.0867%, 34.2318% 16.0414%, 38.5445% 13.3247%, 47.1698% 10.4787%, 50.2695% 9.1850%, 58.2210% 10.6080%, 66.4420% 13.0660%, 68.7332% 15.1358%, 69.0027% 10.7374%, 70.0809% 9.3144%, 70.6199% 10.4787%, 69.9461% 15.1358%, 74.6631% 8.9263%, 75.7412% 8.9263%, 75.3369% 10.2199%, 71.8329% 16.0414%, 76.9542% 12.2898%, 79.1105% 12.2898%, 78.7062% 13.5834%, 73.5849% 17.4644%, 79.9191% 15.3946%, 82.0755% 15.6533%, 81.8059% 16.5589%, 75.2022% 19.9224%, 78.7062% 21.4748%, 83.8275% 23.0272%, 87.7358% 26.7788%, 89.0836% 30.9185%, 87.8706% 35.5757%, 84.3666% 39.0686%, 87.6011% 40.6210%, 89.2183% 43.5964%, 87.7358% 46.9599%, 84.9057% 48.6417%, 89.0836% 53.1695%, 89.6226% 57.5679%, 87.8706% 61.0608%, 88.8140% 68.1759%, 87.1968% 73.4799%, 82.3450% 79.3014%, 74.1240% 84.8642%, 63.6119% 89.5213%, 50.8086% 93.6611%, 38.8140% 95.9897%, 42.4528% 91.3325%, 46.7655% 87.8396%, 47.8437% 84.6054%, 43.5310% 83.1824%, 33.1536% 79.9483%, 38.6792% 76.7141%, 31.6712% 78.0078%, 22.9111% 76.8435%, 19.1375% 74.5149%, 16.4420% 71.0220%, 15.2291% 67.0116%, 15.6334% 62.0957%, 12.5337% 59.3790%, 11.3208% 56.0155%, 12.5337% 52.3933%, 14.0162% 47.0893%, 12.2642% 44.2432%, 10.1078% 38.9392%, 8.7601% 32.6003%, 9.4340% 25.2264%, 11.1860% 18.4994%, 14.6900% 11.7723%, 18.4636% 6.9858%)}
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
    #catalog .product-description {min-height:0}
    :is(#catalog .product .imgwrap,#productModal .picture-preview)::after {content:""!important;padding:0}
    :is(#catalog .product .imgwrap,#productModal .picture-preview)[data-clean-picture="yes"]::after {display:none!important}
    :is(#catalog .product .imgwrap,#productModal .picture-preview)[data-clean-picture="yes"] :is(.productImg,.product-modal-image) {height:100%;align-self:center}
    :is(#catalog .product .imgwrap,#productModal .picture-preview):is([data-open-product="flexfit-hat"],[data-open-product="beanie"],[data-open-product="visor"])::after {display:none!important}
    :is(#catalog .product .imgwrap,#productModal .picture-preview):is([data-open-product="flexfit-hat"],[data-open-product="beanie"]) :is(.productImg,.product-modal-image) {height:100%;align-self:center}
    #catalog .market-unpriced-flag :is(.optrow,.stockline,[data-help],.addBtn,.soldout) {display:none!important}
    #productModal:has(.market-unpriced-flag) :is(.product-modal-options,.stockline,#modalHelp,#modalAddBtn) {display:none!important}
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

  const accessoryOrder = ["big-lick-pin", "bssc-logo-sticker", "bssc-motorcycle-flag", "bft-motorcycle-flag", "bssc-wall-flag", "bft-wall-flag", "bssc-ring", "anniv-20-patch", "challenge-coin"];
  const isUnpricedFlag = product => Boolean(product && flagImages[product.id] &&
    priceFor(product, product.sizes[0]) <= 0);
  function arrangeAccessories() {
    const cards = new Map([...catalog.querySelectorAll("article [data-open-product]")]
      .map(element => [element.dataset.openProduct, element.closest("article")]));
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
    const photo = newElement("span", "market-category-photo");
    photo.dataset.group = group.id;
    const img = newElement("img");
    img.src = categoryPhotos[group.id];
    img.alt = "";
    img.decoding = "async";
    photo.append(img);
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
