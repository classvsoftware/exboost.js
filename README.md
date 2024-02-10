# exboost.js

## What Is ExBoost?

ExBoost is a collaborative network of browser extensions looking for more users. Learn more [here](https://extensionboost.com).

## How does ExBoost work?

ExBoost extensions add promotional banners inside their extensions. These banners will show promotions for similar extensions available in the Chrome Web Store. Extensions in the ExBoost network promote each other.

## Getting started

1. Download [exboost.js](https://raw.githubusercontent.com/classvsoftware/exboost.js/master/dist/exboost.js)
2. Add the `exboost.js` script to your extension.

```
app/
├── manifest.json
├── assets/
│   ├── logo.png
│   └── style.css
├── lib/
│   └── helper.js
└── exboost.js
```

3. Import `exboost.js` in your background script

```
import "exboost.js";
```

4. Create any number of ExBoost slots by adding `<iframe data-exboost-slot="SLOT_ID"></iframe>` to your extension's HTML. `SLOT_ID` should be unique to each slot. Slots are responsive, resize the dimensions however you want.

```
<body>
  <head>
    iframe {
      width: 600px;
      height: 180px;
    }
  </head>
  <section>
    <h1>My extension!</h1>
    <div>Extension content
  </section>

  <iframe data-exboost-slot="popup-slot-1"></iframe>
</body>
```

5. Import `exboost.js` anywhere you want to show an ExBoost banner: in your popup, in an options page, or in a content script UI. Call `init()` to fill the slots.

```
import ExBoost from "exboost.js";

ExBoost.init();
```

## Examples

For an example of how to install ExBoost, refer to the [Example Chrome Extension](https://github.com/msfrisbie/demo-browser-extension)
