# exboost.js

## What Is ExBoost?

ExBoost is a collaborative network of browser extensions looking for more users. Learn more [here](https://extensionboost.com).

## How does ExBoost work?

ExBoost extensions add promotional banners inside their extensions. These banners will show promotions for similar extensions available in the Chrome Web Store. Extensions in the ExBoost network promote each other.

## Installation

You have two options for installation:

- Add the npm package
- Add the .mjs file to your extension manually

### Option A: Using the NPM package (recommended)

1. Install the [exboost-js](https://www.npmjs.com/package/exboost-js) npm package:

`npm install exboost-js`

2. Import `exboost-js` in your background script

```
import "exboost-js";
```

_background.js_

### Option B: Include the .mjs file manually

1. Download [exboost.mjs](https://raw.githubusercontent.com/classvsoftware/exboost.js/master/dist/exboost.mjs) and add it to your extension.

```
app/
├── manifest.json
├── popup.html
├── options.html
└── scripts/
    ├── background.js
    └── exboost.mjs
```

2. Import `exboost.mjs` in your background script

```
import "scripts/exboost.mjs";
```

_background.js_

## Signup for ExBoost

By default, ExBoost will just show recommendations from the Chrome Web Store. Sign up at [https://extensionboost.com/signup](https://extensionboost.com/signup) (Currently limited to beta users).

After signing up, you will be able to register new ExBoost slot IDs.

## Show ExBoost Slots

You have two options for adding ExBoost links:

- Let ExBoost render the links for you
- Load ExBoost slot data and render them manually

**NOTE: For both options, you are responsible for styling the links manually**

### Option A: ExBoost auto rendering

1. Include ExBoost wherever you need to render slots (Popup, Options page, Content Script, etc)

`import ExBoost from "exboost-js";`

2. Specify a target where ExBoost should render the links

`<div class="slot"></div>`

3. Render the slot:

```
ExBoost.renderSlotDataOrError({
  exboostSlotId: 'demo-popup-id',
  target: document.querySelector('.slot')
});
```

### Option B: ExBoost manual render

1. Include ExBoost wherever you need to render slots (Popup, Options page, Content Script, etc)

`import ExBoost from "exboost-js";`

2. Load the slot data:

```
const slotData = ExBoost.loadSlotDataOrError({
  exboostSlotId: 'demo-popup-id'
});
```

3. Render the links however you want:

```
document.querySelector('.slot').innerHTML = slotData.anchorData
  .map(
    (data) =>
      `<a href="${data.href
      }" target="_blank">${data.text}</a>`
  )
  .join("");
```

## Examples

For an example of how to install ExBoost, refer to the [Example Chrome Extension](https://github.com/msfrisbie/demo-browser-extension)
