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
    apparel: [storefrontImages + "1CEDB8B3-830C-4023-9605-C01F62DF837D.png", storefrontImages + "AF058131-4096-486E-91A4-92477D96CD71.png", storefrontImages + "D0090C89-D2FA-447A-AEBC-F3605E4776DA.png", storefrontImages + "ChatGPT%20Image%20Aug%203%2C%202026%2C%2007_13_56%20PM.png"],
    headwear: [storefrontImages + "Fitted%20Hat.png", storefrontImages + "ChatGPT%20Image%20Sep%201%2C%202026%2C%2007_37_52%20AM.png", new URL("../assets/marketplace/beanie-red-20261027-black.jpg", imageBase).href],
    drinkware: [storefrontImages + "1DB94A6C-F5C0-49D3-9256-1E1224D00D5C.png", storefrontImages + "2944D826-64EC-4459-826F-D9275E7A0BAB.png", storefrontImages + "D8ABCD70-4A0A-469A-9E76-5998298E665E.png"],
    accessories: [new URL("bssc-motorcycle-flag-12x18.svg", imageBase).href, new URL("bikes-for-tykes-motorcycle-flag-12x18.svg", imageBase).href, storefrontImages + "36933589-8FBA-44B9-A645-57A4FF6E4040.png/:/rs=w:480", storefrontImages + "BigLick%20Lapel%20Pin.png"],
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
    .market-category-photo[data-group="apparel"] img:first-child {width:41%;left:23%;top:45%;clip-path:polygon(0.957% 82.536%, 2.392% 79.426%, 2.073% 75.120%, 1.515% 66.507%, 1.914% 55.742%, 2.951% 44.338%, 3.828% 35.965%, 5.502% 32.376%, 8.772% 29.107%, 12.919% 26.555%, 13.876% 22.488%, 15.710% 18.740%, 19.139% 16.906%, 23.764% 15.869%, 29.904% 15.152%, 35.486% 15.550%, 39.394% 16.348%, 41.308% 19.059%, 42.663% 23.684%, 44.577% 26.236%, 48.644% 28.628%, 51.834% 32.456%, 54.306% 29.266%, 59.091% 26.954%, 60.447% 22.648%, 62.281% 18.581%, 65.470% 16.906%, 70.415% 15.949%, 74.960% 15.152%, 79.904% 15.470%, 83.971% 16.826%, 87.161% 18.740%, 87.799% 23.764%, 90.271% 26.236%, 93.301% 28.150%, 96.252% 32.057%, 97.448% 37.321%, 97.528% 43.301%, 98.246% 51.435%, 98.724% 60.207%, 99.203% 70.415%, 99.282% 78.070%, 98.246% 82.536%, 98.006% 87.400%, 96.411% 88.836%, 93.062% 89.633%, 90.750% 89.075%, 90.590% 85.407%, 88.676% 85.407%, 88.278% 87.799%, 84.450% 89.234%, 76.236% 90.351%, 68.102% 89.793%, 61.324% 88.836%, 56.380% 88.118%, 55.742% 85.885%, 52.233% 86.124%, 51.754% 91.627%, 50.239% 92.903%, 47.049% 92.663%, 43.939% 91.786%, 43.301% 89.234%, 41.148% 88.676%, 40.431% 90.351%, 36.683% 91.148%, 27.671% 91.707%, 17.065% 91.148%, 10.766% 90.032%, 9.330% 87.719%, 7.895% 87.959%, 7.656% 90.191%, 5.502% 90.112%, 3.190% 89.474%, 2.073% 88.278%, 2.392% 85.167%)}
    .market-category-photo[data-group="headwear"] img:first-child {width:45%;left:25%;top:43%;clip-path:polygon(0.6868% 75.8333%, 3.2967% 68.0556%, 7.4176% 60.0000%, 7.9670% 45.0926%, 9.2720% 36.0185%, 11.6071% 31.2963%, 15.3159% 27.2222%, 22.4588% 23.4259%, 28.1593% 20.8333%, 28.7775% 19.3519%, 30.3571% 18.7963%, 32.0055% 18.9815%, 32.6923% 20.7407%, 38.3242% 22.4074%, 44.7115% 26.3889%, 48.4203% 30.8333%, 51.0989% 37.7778%, 52.3352% 46.8519%, 52.4725% 53.1481%, 54.8764% 53.1481%, 55.7005% 44.6296%, 57.4863% 37.4074%, 60.5082% 31.7593%, 65.7967% 26.8519%, 74.2445% 23.4259%, 74.8626% 22.1296%, 76.7857% 21.6667%, 78.7088% 22.0370%, 79.2582% 23.3333%, 84.4780% 25.3704%, 88.4615% 27.7778%, 92.1703% 31.8519%, 94.7802% 37.6852%, 96.4286% 44.0741%, 97.8022% 53.9815%, 98.6264% 64.1667%, 98.3516% 68.6111%, 96.0852% 71.6667%, 90.6593% 74.7222%, 82.1429% 76.7593%, 73.6264% 77.3148%, 64.9038% 75.9259%, 59.5467% 73.7963%, 55.4945% 70.0926%, 54.5330% 67.5000%, 54.7390% 53.2407%, 52.4725% 53.2407%, 52.2665% 62.4074%, 49.1758% 65.4630%, 45.3984% 66.6667%, 43.4066% 71.9444%, 39.3544% 78.0556%, 33.5165% 83.2407%, 28.1593% 86.0185%, 21.9780% 86.6667%, 13.6676% 84.2593%, 6.3187% 80.9259%, 2.0604% 79.1667%)}
    .market-category-photo[data-group="drinkware"] img:first-child {width:32%;left:25%;top:43%;clip-path:polygon(29.0055% 21.8232%, 29.8343% 20.7873%, 35.6354% 19.5442%, 47.6059% 19.0608%, 60.6814% 19.3370%, 67.7716% 20.3039%, 70.5341% 21.5470%, 70.9945% 22.9972%, 69.3370% 24.5166%, 72.9282% 28.0387%, 75.8748% 28.4530%, 77.9006% 29.9724%, 77.8085% 87.5691%, 77.3481% 90.5387%, 76.4273% 92.2652%, 75.3223% 94.8895%, 72.4678% 96.7541%, 67.0350% 98.0663%, 32.9650% 98.2735%, 28.3610% 97.1685%, 25.0460% 95.1657%, 23.7569% 92.7486%, 22.2836% 90.7459%, 21.9153% 31.9751%, 21.6390% 29.8343%, 23.0203% 28.7293%, 25.9669% 27.9006%, 30.1105% 24.3785%, 29.0055% 23.2044%)}
    .market-category-photo[data-group="accessories"] img:first-child {width:54%;left:29%;top:40%;clip-path:polygon(8.5% 7.8%,14% 7.8%,15.5% 11.8%,89% 11.8%,89% 79%,15.5% 79%,15% 92.5%,11% 92.5%,11% 12%)}
    .market-category-photo[data-group="apparel"] img:nth-child(2) {width:57%;left:36%;top:45%;clip-path:polygon(50.572% 37.866%, 52.121% 29.839%, 55.219% 22.474%, 62.155% 16.431%, 64.108% 13.503%, 75.017% 13.314%, 77.306% 15.770%, 83.906% 19.736%, 87.003% 23.607%, 89.024% 29.745%, 92.256% 42.115%, 87.879% 45.420%, 84.983% 46.270%, 82.896% 44.193%, 82.155% 57.035%, 82.020% 76.393%, 83.973% 90.274%, 83.165% 91.879%, 78.047% 93.201%, 67.879% 93.862%, 60.539% 93.296%, 55.354% 91.313%, 55.421% 88.952%, 56.768% 77.904%, 57.374% 59.585%, 57.037% 46.270%, 55.152% 46.931%, 52.054% 45.798%, 49.966% 44.098%)}
    .market-category-photo[data-group="headwear"] img:nth-child(2) {width:58%;left:35%;top:63%;clip-path:polygon(51.515% 56.858%, 52.233% 45.136%, 53.270% 42.982%, 55.662% 40.670%, 60.526% 37.879%, 66.188% 36.124%, 71.611% 35.327%, 76.794% 35.247%, 81.340% 35.885%, 85.327% 37.321%, 88.995% 39.155%, 92.026% 41.467%, 94.019% 43.461%, 97.289% 45.056%, 99.203% 47.368%, 99.123% 55.502%, 98.325% 57.895%, 96.252% 59.569%, 93.301% 60.207%, 93.062% 62.679%, 89.234% 64.274%, 83.014% 65.630%, 75.040% 66.348%, 66.667% 65.789%, 60.367% 64.593%, 56.220% 63.078%, 53.110% 60.686%)}
    .market-category-photo[data-group="drinkware"] img:nth-child(2) {width:37%;left:50%;top:41%;clip-path:polygon(31.308% 20.856%, 31.492% 20.028%, 35.543% 19.613%, 49.632% 19.268%, 62.431% 19.613%, 67.311% 20.166%, 67.495% 21.202%, 66.575% 21.823%, 69.429% 25.898%, 72.376% 26.588%, 72.836% 27.486%, 72.836% 88.536%, 72.007% 90.677%, 68.048% 93.508%, 61.142% 95.580%, 37.293% 95.649%, 30.939% 94.061%, 27.164% 91.436%, 25.967% 89.088%, 25.875% 27.762%, 26.427% 26.588%, 29.098% 25.898%, 31.768% 21.754%)}
    .market-category-photo[data-group="drinkware"] img:nth-child(3) {width:38%;left:72%;top:41%;clip-path:polygon(42.081% 19.199%, 42.541% 18.370%, 44.107% 17.749%, 52.670% 17.541%, 54.512% 18.025%, 55.341% 19.199%, 55.433% 19.959%, 54.420% 20.235%, 55.525% 23.135%, 54.696% 24.102%, 56.906% 36.878%, 58.840% 37.017%, 59.576% 37.845%, 59.484% 40.055%, 60.773% 43.094%, 64.917% 47.652%, 66.575% 50.898%, 66.943% 89.572%, 66.483% 93.094%, 65.930% 94.751%, 62.063% 96.340%, 56.446% 97.169%, 40.792% 97.238%, 34.254% 95.856%, 32.228% 94.544%, 31.400% 91.160%, 31.123% 52.003%, 31.676% 49.240%, 34.070% 45.925%, 36.556% 42.472%, 38.214% 39.365%, 38.122% 38.191%, 39.227% 37.155%, 40.424% 36.948%, 42.726% 24.171%, 41.897% 23.204%, 43.186% 20.166%, 42.081% 19.959%)}
    .market-category-photo[data-group="accessories"] img:nth-child(2) {width:56%;left:68%;top:48%;clip-path:polygon(9% 5%,13% 5%,14% 10.5%,91% 10.5%,91% 81%,13% 81%,12.5% 94%,9.5% 94%,9.5% 12%)}
    .market-category-photo[data-group="apparel"] {background:radial-gradient(ellipse at 74% 52%,#70232b,transparent 78%),#111}
    .market-category-photo[data-group="headwear"] {background:radial-gradient(ellipse at 69% 58%,#652746,transparent 78%),#111}
    .market-category-photo[data-group="drinkware"] {background:radial-gradient(ellipse at 58% 60%,#24435c,transparent 76%),#111}
    .market-category-photo[data-group="accessories"] {background:radial-gradient(ellipse at 64% 55%,#614120,transparent 77%),#111}
    @media(max-width:520px){.market-category-photo {aspect-ratio:1.6}.market-category-photo img {scale:.95}}
    .market-category-photo[data-group="apparel"] img:nth-child(3) {width:51%;left:50%;top:56%;clip-path:polygon(50.372% 33.803%, 52.404% 26.854%, 55.112% 20.845%, 61.137% 15.962%, 63.846% 13.803%, 65.403% 12.300%, 77.116% 12.394%, 79.485% 14.366%, 85.917% 18.122%, 89.844% 21.878%, 92.146% 29.953%, 95.125% 42.723%, 92.552% 45.070%, 88.287% 47.042%, 85.308% 47.512%, 84.699% 44.789%, 83.886% 64.601%, 84.089% 77.371%, 86.256% 92.300%, 85.647% 93.521%, 82.058% 94.836%, 74.001% 95.962%, 65.877% 95.869%, 59.580% 94.648%, 55.586% 92.676%, 56.669% 81.596%, 57.549% 62.629%, 57.143% 47.230%, 54.096% 47.512%, 50.508% 45.822%, 49.086% 42.723%)}
    .market-category-photo[data-group="apparel"] img:nth-child(4) {width:43%;left:78%;top:51%;clip-path:polygon(11.019% 13.825%, 14.168% 12.468%, 16.342% 11.281%, 17.691% 11.535%, 20.765% 13.740%, 24.963% 15.098%, 29.460% 14.928%, 33.883% 13.232%, 36.882% 11.366%, 38.456% 11.366%, 43.103% 13.486%, 42.429% 19.678%, 42.804% 26.039%, 44.378% 31.298%, 46.777% 38.677%, 46.177% 40.628%, 45.352% 51.824%, 45.727% 70.568%, 47.301% 90.670%, 45.427% 92.112%, 39.580% 93.215%, 29.235% 94.063%, 19.415% 93.893%, 10.720% 92.791%, 6.297% 91.009%, 7.346% 82.019%, 8.321% 64.122%, 8.171% 50.382%, 7.196% 40.204%, 7.046% 39.101%, 8.621% 33.927%, 10.795% 26.293%, 11.469% 19.763%)}
    .market-category-photo[data-group="headwear"] img:nth-child(3) {width:31%;left:80%;top:49%;clip-path:polygon(4.800% 85.600%, 5.500% 60.300%, 5.800% 57.900%, 8.800% 57.000%, 9.400% 46.100%, 11.700% 35.000%, 14.900% 27.500%, 18.400% 21.400%, 23.500% 16.200%, 30.100% 11.400%, 36.800% 8.100%, 43.600% 6.100%, 48.600% 5.400%, 54.500% 5.800%, 62.800% 7.600%, 70.700% 10.500%, 78.200% 15.600%, 84.000% 22.300%, 87.500% 29.900%, 89.600% 39.400%, 90.500% 57.100%, 93.100% 57.800%, 93.900% 60.000%, 95.000% 85.200%, 94.700% 87.800%, 92.900% 89.500%, 85.200% 90.100%, 49.800% 90.800%, 8.700% 90.000%, 6.000% 89.100%)}
    .market-category-photo[data-group="accessories"] img:nth-child(3) {width:18%;left:23%;top:78%;clip-path:polygon(1% 21%,16% 9%,37% 1%,61% 0,83% 11%,98% 22%,92% 35%,95% 82%,87% 89%,85% 98%,16% 98%,13% 92%,4% 83%,8% 36%)}
    .market-category-photo[data-group="accessories"] img:nth-child(4) {width:20%;left:43%;top:79%;clip-path:polygon(17.279% 28.552%, 23.070% 24.414%, 32.261% 20.621%, 41.452% 18.621%, 51.746% 17.310%, 62.224% 18.138%, 72.794% 20.759%, 82.353% 24.552%, 91.636% 30.621%, 82.169% 38.069%, 84.099% 42.138%, 83.732% 43.862%, 88.419% 46.414%, 90.441% 50.276%, 91.912% 54.828%, 89.522% 58.897%, 81.801% 63.172%, 79.779% 76.138%, 73.529% 76.552%, 71.967% 86.759%, 18.015% 82.897%, 19.393% 72.828%, 14.062% 72.207%, 15.625% 60.552%, 18.107% 60.483%, 15.993% 55.103%, 16.452% 52.759%, 19.301% 50.897%, 19.118% 45.310%, 21.691% 39.517%, 21.875% 35.793%)}
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
    for (const source of categoryPhotos[group.id]) {
      const img = newElement("img");
      img.src = source;
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

  const existingAvailableFor = availableFor;
  availableFor = function (product, size) {
    return flagImages[product?.id] ? 999 : existingAvailableFor(product, size);
  };

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
