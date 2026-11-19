(() => {
  const groups = [
    { id: "apparel", title: "Apparel", categories: ["Men's Apparel", "Women's Apparel", "Unisex Apparel"], subtitle: "T-shirts, tanks and hoodies" },
    { id: "headwear", title: "Headwear", categories: ["Headwear"], subtitle: "Hats, visors and beanies" },
    { id: "drinkware", title: "Drinkware & Coozies", categories: ["Drinkware"], subtitle: "Can and bottle coozies" },
    { id: "accessories", title: "Accessories & Collectibles", categories: ["Accessories", "Patches & Pins", "Coins"], subtitle: "Patches, pins, challenge coins, flags and more" },
  ];
  const storefrontImages = "https://img1.wsimg.com/isteam/ip/6b7b89b2-dd4f-422d-8d29-7971f64bd923/";
  const imageBase = new URL(".", document.currentScript.src);
  const categoryPhotos = {
    apparel: [storefrontImages + "1CEDB8B3-830C-4023-9605-C01F62DF837D.png", storefrontImages + "AF058131-4096-486E-91A4-92477D96CD71.png", storefrontImages + "38F30EA0-EEF4-4715-A37D-3772CF6AAF23.png", storefrontImages + "8687855A-CF3D-4F45-9E37-B63BF396E78C.png", storefrontImages + "ChatGPT%20Image%20Aug%203%2C%202026%2C%2007_13_56%20PM.png"],
    drinkware: [storefrontImages + "1DB94A6C-F5C0-49D3-9256-1E1224D00D5C.png", storefrontImages + "2944D826-64EC-4459-826F-D9275E7A0BAB.png", storefrontImages + "D8ABCD70-4A0A-469A-9E76-5998298E665E.png"],
    accessories: [new URL("bft-wall-flag-3x5.svg", imageBase).href, new URL("bssc-motorcycle-flag-12x18.svg", imageBase).href],
  };
  const accessoryDetails = [
    { id: "sticker", alt: "BoneShakers logo sticker", source: storefrontImages + "36933589-8FBA-44B9-A645-57A4FF6E4040.png/:/rs=w:480" },
    { id: "pin", alt: "BoneShakers lapel pin", source: storefrontImages + "BigLick%20Lapel%20Pin.png" },
  ];
  const headwearGroups = [
    { id: "flexfit-hat", style: "cap", positions: [[15,23],[38,20],[62,24],[85,21]] },
    { id: "visor", style: "visor", positions: [[17,52],[50,49],[83,53],[35,78],[65,76]] },
    { id: "beanie", style: "beanie", positions: [[10,79],[90,81]] },
  ];
  // Use the two-view visor photos here because the catalog can supply front-only thumbnails.
  const visorPhotoTimes = { Black: "32_45", Red: "34_29", White: "35_46", Gray: "36_44", "Baby Pink": "37_52" };
  const flagLabels = ["3 × 5 ft Wall Flag", "12 × 18 in Motorcycle Flag"];
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
      background-position:center,center 20%;background-size:cover;
    }
    .market-shop-intro p {max-width:38ch;color:#fff}
    .market-shop-intro .market-category-actions button {background:#a92824;border-color:#e06a60;padding-inline:24px}
    .market-shop-intro .market-category-actions button:hover {background:#861d1a}
    .market-category-photo[style] {background-position:center;background-size:cover}
    @media(max-width:620px){
      .market-shop-intro {justify-content:flex-end;min-height:0;padding-top:52%;background-image:linear-gradient(0deg,#0b0a0a 36%,#0b0a0ac0 51%,transparent 78%),url("${new URL("campaign-hero.webp", imageBase).href}");background-position:center,center top;background-size:cover,100% auto;background-repeat:no-repeat}
    }
    .market-category-grid {display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}
    .market-category-card {appearance:none;display:flex;flex-direction:column;min-width:0;overflow:hidden;width:100%;padding:0;border:1px solid #323232;border-radius:16px;color:#fff;background:#111;text-align:left;font:inherit;cursor:pointer}
    .market-category-card:hover,.market-category-card:focus-visible {border-color:#e26760;background:#191414}
    .market-category-photo {aspect-ratio:2/1;width:100%;position:relative;display:grid;place-items:center;background:radial-gradient(ellipse,#201d1d,#090909);overflow:hidden}
    .market-category-photo img {position:absolute;height:auto;max-width:none;transform:translate(-50%,-50%)}
    /* Crop the original photo backgrounds to the product silhouettes. */
    .market-category-photo[data-group="apparel"] img:first-child {width:34%;left:19%;top:42%;clip-path:polygon(0.957% 82.536%, 2.392% 79.426%, 2.073% 75.120%, 1.515% 66.507%, 1.914% 55.742%, 2.951% 44.338%, 3.828% 35.965%, 5.502% 32.376%, 8.772% 29.107%, 12.919% 26.555%, 13.876% 22.488%, 15.710% 18.740%, 19.139% 16.906%, 23.764% 15.869%, 29.904% 15.152%, 35.486% 15.550%, 39.394% 16.348%, 41.308% 19.059%, 42.663% 23.684%, 44.577% 26.236%, 48.644% 28.628%, 50.797% 31.100%, 51.834% 33.573%, 52.632% 37.799%, 54.147% 45.136%, 54.944% 55.742%, 54.785% 66.427%, 53.907% 76.794%, 52.392% 82.137%, 52.472% 88.118%, 51.675% 91.627%, 50.239% 92.903%, 47.049% 92.663%, 43.939% 91.786%, 43.301% 89.234%, 41.148% 88.676%, 40.431% 90.351%, 36.683% 91.148%, 27.671% 91.707%, 17.065% 91.148%, 10.766% 90.032%, 9.330% 87.719%, 7.895% 87.959%, 7.656% 90.191%, 5.502% 90.112%, 3.190% 89.474%, 2.073% 88.278%, 2.392% 85.167%)}
    .market-category-photo[data-group="drinkware"] img:first-child {width:32%;left:25%;top:43%;clip-path:polygon(29.0055% 21.8232%, 29.8343% 20.7873%, 35.6354% 19.5442%, 47.6059% 19.0608%, 60.6814% 19.3370%, 67.7716% 20.3039%, 70.5341% 21.5470%, 70.9945% 22.9972%, 69.3370% 24.5166%, 72.9282% 28.0387%, 75.8748% 28.4530%, 77.9006% 29.9724%, 77.8085% 87.5691%, 77.3481% 90.5387%, 76.4273% 92.2652%, 75.3223% 94.8895%, 72.4678% 96.7541%, 67.0350% 98.0663%, 32.9650% 98.2735%, 28.3610% 97.1685%, 25.0460% 95.1657%, 23.7569% 92.7486%, 22.2836% 90.7459%, 21.9153% 31.9751%, 21.6390% 29.8343%, 23.0203% 28.7293%, 25.9669% 27.9006%, 30.1105% 24.3785%, 29.0055% 23.2044%)}
    .market-category-photo[data-group="apparel"] img:nth-child(2) {width:43%;left:41%;top:52%;clip-path:polygon(50.572% 37.866%, 52.121% 29.839%, 55.219% 22.474%, 62.155% 16.431%, 64.108% 13.503%, 75.017% 13.314%, 77.306% 15.770%, 83.906% 19.736%, 87.003% 23.607%, 89.024% 29.745%, 92.256% 42.115%, 87.879% 45.420%, 84.983% 46.270%, 82.896% 44.193%, 82.155% 57.035%, 82.020% 76.393%, 83.973% 90.274%, 83.165% 91.879%, 78.047% 93.201%, 67.879% 93.862%, 60.539% 93.296%, 55.354% 91.313%, 55.421% 88.952%, 56.768% 77.904%, 57.374% 59.585%, 57.037% 46.270%, 55.152% 46.931%, 52.054% 45.798%, 49.966% 44.098%)}
    .market-category-photo[data-group="drinkware"] img:nth-child(2) {width:37%;left:50%;top:41%;clip-path:polygon(31.308% 20.856%, 31.492% 20.028%, 35.543% 19.613%, 49.632% 19.268%, 62.431% 19.613%, 67.311% 20.166%, 67.495% 21.202%, 66.575% 21.823%, 69.429% 25.898%, 72.376% 26.588%, 72.836% 27.486%, 72.836% 88.536%, 72.007% 90.677%, 68.048% 93.508%, 61.142% 95.580%, 37.293% 95.649%, 30.939% 94.061%, 27.164% 91.436%, 25.967% 89.088%, 25.875% 27.762%, 26.427% 26.588%, 29.098% 25.898%, 31.768% 21.754%)}
    .market-category-photo[data-group="drinkware"] img:nth-child(3) {width:38%;left:72%;top:41%;clip-path:polygon(42.081% 19.199%, 42.541% 18.370%, 44.107% 17.749%, 52.670% 17.541%, 54.512% 18.025%, 55.341% 19.199%, 55.433% 19.959%, 54.420% 20.235%, 55.525% 23.135%, 54.696% 24.102%, 56.906% 36.878%, 58.840% 37.017%, 59.576% 37.845%, 59.484% 40.055%, 60.773% 43.094%, 64.917% 47.652%, 66.575% 50.898%, 66.943% 89.572%, 66.483% 93.094%, 65.930% 94.751%, 62.063% 96.340%, 56.446% 97.169%, 40.792% 97.238%, 34.254% 95.856%, 32.228% 94.544%, 31.400% 91.160%, 31.123% 52.003%, 31.676% 49.240%, 34.070% 45.925%, 36.556% 42.472%, 38.214% 39.365%, 38.122% 38.191%, 39.227% 37.155%, 40.424% 36.948%, 42.726% 24.171%, 41.897% 23.204%, 43.186% 20.166%, 42.081% 19.959%)}
    .market-category-photo[data-group="apparel"] {background:radial-gradient(ellipse at 74% 52%,#70232b,transparent 78%),#111}
    .market-category-photo[data-group="headwear"] {background:radial-gradient(ellipse at 69% 58%,#652746,transparent 78%),#111}
    .market-category-photo[data-group="drinkware"] {background:radial-gradient(ellipse at 58% 60%,#24435c,transparent 76%),#111}
    .market-category-photo[data-group="accessories"] {background:radial-gradient(ellipse at 64% 55%,#614120,transparent 77%),#111}
    @media(max-width:520px){.market-category-photo {aspect-ratio:1.6}.market-category-photo img {scale:.95}}
    .market-category-photo[data-group="apparel"] img:nth-child(3) {width:35%;left:39%;top:56%;clip-path:polygon(0.000% 74.456%, 0.766% 59.464%, 1.609% 41.290%, 2.912% 31.323%, 4.521% 24.372%, 6.513% 20.854%, 10.345% 18.760%, 17.701% 14.992%, 20.383% 12.563%, 23.142% 12.563%, 27.510% 12.982%, 33.640% 12.479%, 35.326% 14.238%, 39.004% 16.164%, 47.739% 20.352%, 49.502% 23.451%, 51.264% 28.141%, 52.414% 35.008%, 52.950% 44.556%, 53.487% 58.543%, 54.176% 79.146%, 53.027% 83.250%, 52.490% 89.447%, 48.812% 89.866%, 46.054% 89.447%, 46.437% 83.250%, 45.594% 79.983%, 44.368% 72.111%, 42.989% 47.069%, 43.295% 74.958%, 43.985% 85.595%, 44.368% 87.437%, 42.682% 88.526%, 37.471% 89.615%, 29.042% 90.452%, 18.927% 90.285%, 12.414% 89.531%, 9.119% 88.191%, 9.425% 84.171%, 10.115% 69.012%, 10.805% 50.670%, 8.889% 71.273%, 7.893% 81.072%, 7.126% 83.752%, 7.280% 88.945%, 5.594% 89.782%, 1.073% 89.615%, 0.996% 88.693%, 0.996% 83.166%, 0.000% 81.407%)}
    .market-category-photo[data-group="apparel"] img:nth-child(4) {width:35%;left:79%;top:43%;clip-path:polygon(0.000% 72.000%, 1.068% 56.250%, 1.754% 41.833%, 3.432% 32.500%, 4.882% 28.667%, 7.628% 26.250%, 10.831% 24.083%, 13.349% 22.083%, 13.272% 19.917%, 14.416% 16.833%, 15.408% 14.083%, 18.230% 12.500%, 22.731% 11.583%, 28.986% 11.417%, 34.477% 12.583%, 36.537% 14.583%, 37.300% 18.167%, 38.291% 20.667%, 38.291% 21.500%, 41.495% 23.167%, 44.928% 25.167%, 47.140% 27.833%, 48.436% 32.667%, 49.809% 40.750%, 50.572% 50.667%, 51.030% 68.750%, 50.420% 76.917%, 49.275% 80.667%, 48.207% 82.833%, 47.063% 89.083%, 43.555% 88.917%, 40.580% 88.000%, 41.114% 83.500%, 41.037% 81.333%, 39.893% 79.750%, 39.969% 86.250%, 38.520% 87.250%, 35.011% 88.333%, 28.604% 89.083%, 19.451% 88.833%, 13.501% 87.917%, 9.230% 86.667%, 8.391% 85.583%, 8.467% 81.000%, 7.933% 76.750%, 8.085% 79.500%, 7.170% 81.667%, 6.941% 87.083%, 4.500% 87.417%, 1.220% 87.250%, 1.297% 81.917%, 0.153% 79.500%, 0.000% 77.583%)}
    .market-category-photo[data-group="apparel"] img:nth-child(5) {width:36%;left:96%;top:56%;clip-path:polygon(11.019% 13.825%, 14.168% 12.468%, 16.342% 11.281%, 17.691% 11.535%, 20.765% 13.740%, 24.963% 15.098%, 29.460% 14.928%, 33.883% 13.232%, 36.882% 11.366%, 38.456% 11.366%, 43.103% 13.486%, 42.429% 19.678%, 42.804% 26.039%, 44.378% 31.298%, 46.777% 38.677%, 46.177% 40.628%, 45.352% 51.824%, 45.727% 70.568%, 47.301% 90.670%, 45.427% 92.112%, 39.580% 93.215%, 29.235% 94.063%, 19.415% 93.893%, 10.720% 92.791%, 6.297% 91.009%, 7.346% 82.019%, 8.321% 64.122%, 8.171% 50.382%, 7.196% 40.204%, 7.046% 39.101%, 8.621% 33.927%, 10.795% 26.293%, 11.469% 19.763%)}
    .market-headwear-piece {position:absolute;left:var(--x);top:var(--y);width:var(--width);aspect-ratio:1;transform:translate(-50%,-50%);pointer-events:none}
    .market-headwear-piece img {width:100%;height:auto;left:50%;top:50%;scale:1}
    .market-headwear-piece[data-style="cap"] {--width:35%}
    .market-headwear-piece[data-style="cap"] img {transform:translate(-26%,-48%);clip-path:polygon(2.300% 54.400%, 2.500% 47.700%, 3.700% 40.500%, 6.300% 35.300%, 10.000% 31.700%, 15.100% 28.900%, 20.600% 26.900%, 24.100% 25.800%, 24.400% 24.900%, 25.600% 24.400%, 27.400% 24.500%, 28.600% 25.200%, 28.800% 25.900%, 33.800% 27.000%, 39.300% 29.100%, 43.200% 31.800%, 46.600% 35.700%, 48.600% 40.900%, 49.700% 47.400%, 49.900% 55.000%, 49.500% 57.300%, 47.700% 58.300%, 48.200% 64.300%, 48.300% 67.100%, 47.400% 70.000%, 45.900% 71.500%, 43.800% 72.200%, 39.400% 71.800%, 34.500% 70.800%, 27.500% 69.700%, 20.300% 69.600%, 13.500% 70.300%, 7.300% 71.800%, 3.700% 71.800%, 2.300% 70.600%, 1.900% 68.800%, 1.900% 65.400%, 2.400% 61.800%, 3.100% 58.100%, 2.500% 57.100%)}
    .market-headwear-piece[data-style="visor"] {--width:27%}
    .market-headwear-piece[data-style="visor"] img {transform:translate(-50%,-52%);clip-path:polygon(1% 67.3%,1.8% 64.3%,4.8% 57.4%,6.2% 53%,6.6% 40.5%,8% 38.7%,11.6% 36.9%,18.3% 35.2%,24.7% 34.8%,31.7% 35.6%,38.3% 37.4%,45.5% 39.9%,49.9% 42%,50.5% 43.7%,49.7% 53.4%,49.1% 54.7%,44.5% 55.1%,42.9% 60.8%,40.8% 65.9%,38.1% 69%,34.8% 70.1%,31% 69.6%,24.5% 67.2%,17% 65.4%,10.6% 65%,5.5% 65.9%,1.8% 67.6%)}
    .market-headwear-piece[data-style="visor"] img + img {clip-path:polygon(51.4% 57%,52.3% 45.3%,53.3% 43%,55.7% 40.7%,60.5% 37.9%,66.2% 36.1%,71.6% 35.3%,76.8% 35.2%,81.3% 35.9%,85.3% 37.3%,89% 39.2%,92% 41.5%,94% 43.5%,97.3% 45.1%,99.2% 47.4%,99.1% 55.5%,98.3% 57.9%,96.3% 59.6%,93.3% 60.2%,93.1% 62.7%,89.2% 64.3%,83% 65.6%,75% 66.4%,66.7% 65.8%,60.4% 64.6%,56.2% 63.1%,53.1% 60.7%)}
    .market-headwear-piece[data-style="beanie"] {--width:14%}
    .market-headwear-piece[data-style="beanie"] img {transform:translate(-50%,-48%);clip-path:polygon(4.800% 85.600%, 5.500% 60.300%, 5.800% 57.900%, 8.800% 57.000%, 9.400% 46.100%, 11.700% 35.000%, 14.900% 27.500%, 18.400% 21.400%, 23.500% 16.200%, 30.100% 11.400%, 36.800% 8.100%, 43.600% 6.100%, 48.600% 5.400%, 54.500% 5.800%, 62.800% 7.600%, 70.700% 10.500%, 78.200% 15.600%, 84.000% 22.300%, 87.500% 29.900%, 89.600% 39.400%, 90.500% 57.100%, 93.100% 57.800%, 93.900% 60.000%, 95.000% 85.200%, 94.700% 87.800%, 92.900% 89.500%, 85.200% 90.100%, 49.800% 90.800%, 8.700% 90.000%, 6.000% 89.100%)}
    .market-flag-comparison {position:absolute;inset:0 0 auto;width:100%;height:72%;display:grid;grid-template-columns:1.27fr 1fr;align-items:stretch;gap:12px;padding:10px 16px 2px;box-sizing:border-box}
    .market-flag-example {min-width:0;display:grid;grid-template-rows:minmax(0,1fr) auto;align-items:center;text-align:center}
    .market-flag-picture {position:relative;width:100%;height:100%;display:block;container-type:size}
    .market-flag-picture img {width:min(100cqw,160cqh);left:50%;top:50%;scale:1;clip-path:inset(8% 6% 10% 6%)}
    .market-flag-example:nth-child(2) .market-flag-picture img {width:min(92cqw,130cqh);clip-path:polygon(8.5% 7.8%,14% 7.8%,15.5% 11.8%,89% 11.8%,89% 79%,15.5% 79%,15% 92.5%,11% 92.5%,11% 12%)}
    .market-accessory-detail {position:absolute;pointer-events:none}
    .market-category-photo .market-accessory-detail[data-item="sticker"] {width:13%;left:40%;top:85%;clip-path:polygon(1% 21%,16% 9%,37% 1%,61% 0,83% 11%,98% 22%,92% 35%,95% 82%,87% 89%,85% 98%,16% 98%,13% 92%,4% 83%,8% 36%)}
    .market-category-photo .market-accessory-detail[data-item="pin"] {width:15%;left:60%;top:83%;clip-path:polygon(17.279% 28.552%, 23.070% 24.414%, 32.261% 20.621%, 41.452% 18.621%, 51.746% 17.310%, 62.224% 18.138%, 72.794% 20.759%, 82.353% 24.552%, 91.636% 30.621%, 82.169% 38.069%, 84.099% 42.138%, 83.732% 43.862%, 88.419% 46.414%, 90.441% 50.276%, 91.912% 54.828%, 89.522% 58.897%, 81.801% 63.172%, 79.779% 76.138%, 73.529% 76.552%, 71.967% 86.759%, 18.015% 82.897%, 19.393% 72.828%, 14.062% 72.207%, 15.625% 60.552%, 18.107% 60.483%, 15.993% 55.103%, 16.452% 52.759%, 19.301% 50.897%, 19.118% 45.310%, 21.691% 39.517%, 21.875% 35.793%)}
    .market-flag-label {color:#fff;font-size:clamp(.7rem,1.2vw,.92rem);font-weight:750;line-height:1.25}
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

  function categoryImage(source, alt = "") {
    const img = newElement("img");
    img.src = source;
    img.alt = alt;
    img.decoding = "async";
    return img;
  }

  for (const group of groups) {
    const tile = button("", () => navigate(group));
    tile.className = "market-category-card";
    const photo = newElement("span", "market-category-photo");
    photo.dataset.group = group.id;
    if (group.id === "apparel" || group.id === "headwear") {
      const source = new URL("campaign-" + group.id + ".webp", imageBase);
      photo.style.backgroundImage = 'url("' + source.href + '")';
    } else if (group.id === "accessories") {
      const comparison = newElement("span", "market-flag-comparison");
      categoryPhotos.accessories.forEach((source, index) => {
        const example = newElement("span", "market-flag-example");
        const picture = newElement("span", "market-flag-picture");
        picture.append(categoryImage(source));
        example.append(picture, newElement("span", "market-flag-label", flagLabels[index]));
        comparison.append(example);
      });
      photo.append(comparison);
      for (const { id, alt, source } of accessoryDetails) {
        const item = categoryImage(source, alt);
        item.className = "market-accessory-detail";
        item.dataset.item = id;
        photo.append(item);
      }
    } else {
      for (const source of categoryPhotos[group.id]) photo.append(categoryImage(source));
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
