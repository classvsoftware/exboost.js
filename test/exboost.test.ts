// exboost.test.ts

function setProtocol(protocol: string) {
  Object.defineProperty(window, "location", {
    value: {
      protocol,
      assign: jest.fn((protocol) => {
        window.location.protocol = protocol;
      }),
    },
    writable: true,
  });
}

describe("ExBoostEngine", () => {
  let ExBoost: any;

  // // Mock global objects
  beforeAll(() => {
    // Mock for `chrome.runtime.id` and `chrome.runtime.sendMessage`
    global.chrome = {
      runtime: {
        id: "dummy_extension_id",
        sendMessage: jest.fn((message, callback) =>
          callback({ html: "<p>Mock response</p>" })
        ),
        onMessage: {
          addListener: jest.fn(),
        },
      },
    } as any;
  });

  beforeEach(() => {
    jest.resetModules(); // Resets the module registry - the cache of all required modules.
  });

  test("constructor initializes correctly without window", () => {
    const _window = window;
    // @ts-ignore
    delete global.window;

    ExBoost = require("../src/exboost").default;

    expect(ExBoost.windowIsDefined).toBe(false);
    expect(ExBoost.chromeGlobalIsDefined).toBe(true);
    expect(ExBoost.usesExtensionProtocol).toBe(false);
    expect(ExBoost.extensionId).toBe("dummy_extension_id");

    global.window = _window;
  });

  test("constructor initializes correctly with window and HTTPS protocol", () => {
    setProtocol("https:");

    ExBoost = require("../src/exboost").default;

    expect(ExBoost.windowIsDefined).toBe(true);
    expect(ExBoost.chromeGlobalIsDefined).toBe(true);
    expect(ExBoost.usesExtensionProtocol).toBe(false);
    expect(ExBoost.extensionId).toBe("dummy_extension_id");
  });

  test("constructor initializes correctly with window and chrome-extension protocol", () => {
    setProtocol("chrome-extension:");

    ExBoost = require("../src/exboost").default;

    expect(ExBoost.windowIsDefined).toBe(true);
    expect(ExBoost.chromeGlobalIsDefined).toBe(true);
    expect(ExBoost.usesExtensionProtocol).toBe(true);
    expect(ExBoost.extensionId).toBe("dummy_extension_id");
  });
});
