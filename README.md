# exboost.js

## What Is ExBoost?

ExBoost is a collaborative network of browser extensions looking for more users. Learn more [here](https://extensionboost.com).

## How does ExBoost work?

ExBoost extensions add promotional banners inside their extensions. These banners will show promotions for similar extensions available in the Chrome Web Store. Extensions in the ExBoost network promote each other.

## Getting started

### Option 1: Using the NPM package (recommended)

1. Install the `exboost-js` npm package.

2. Import `exboost-js` in your background script

```
import "exboost-js";
```

_background.js_

3. Define an ExBoost slot by adding `<iframe data-exboost-slot="SLOT_ID"></iframe>` to your extension's HTML. `SLOT_ID` should be unique to each slot.

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

_popup.html_

4. Import `exboost-js` anywhere you want to show an ExBoost banner: in your popup, in an options page, or in a content script UI. Call `init()` to fill the slots.

```
import ExBoost from "exboost-js";

ExBoost.init();
```

_popup.js_

### Option 2: Include the JS file directly

1. Download [exboost.js](https://raw.githubusercontent.com/classvsoftware/exboost.js/master/dist/exboost.js) and add it to your extension.

```
app/
├── manifest.json
├── popup.html
├── options.html
└── scripts/
    ├── background.js
    └── exboost.js
```

2. Import `exboost.js` in your background script

```
import "scripts/exboost.js";
```

_background.js_

3. Define an ExBoost slot by adding `<iframe data-exboost-slot="SLOT_ID"></iframe>` to your extension's HTML. `SLOT_ID` should be unique to each slot.

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

_popup.html_

4. Import `exboost.js` anywhere you want to show an ExBoost banner: in your popup, in an options page, or in a content script UI. Call `init()` to fill the slots.

```
import ExBoost from "scripts/exboost.js";

ExBoost.init();
```

_popup.js_

## Using ExBoost with React

`ExBoost.init()` should be called after the `<iframe>` exists. Example:

```
const MyComponent = () => {
  useEffect(() => {
    ExBoost.init();
  }, []);

  return (
    <div>
      <iframe data-exboost-slot="popup-header-slot"></iframe>
    </div>
  );
};
```

## Examples

For an example of how to install ExBoost, refer to the [Example Chrome Extension](https://github.com/msfrisbie/demo-browser-extension)
