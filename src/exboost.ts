const EXBOOST_ATTRIBUTE = "data-exboost-slot";

const API_VERSION = `v1`;
const API_ORIGIN = `https://api.extensionboost.com`;

interface IServeMessage {
  exboostSlotId: string;
  engineContext: EngineContext;
  slotStyle: {
    initialSlotWidth: string;
    initialSlotHeight: string;
    slotBackgroundColor: string;
    slotFontColor: string;
    slotFontSize: string;
    slotFontFamily: string;
  };
  options: IExBoostOptions;
}

interface IExBoostOptions {
  debug?: boolean;
}

enum EngineContext {
  BACKGROUND = "BACKGROUND",
  CONTENT_SCRIPT = "CONTENT_SCRIPT",
  EXTENSION_PAGE = "EXTENSION_PAGE",
  POPUP = "POPUP",
  OPTIONS = "OPTIONS",
  SIDEBAR = "SIDEBAR",
  DEVELOPER_TOOLS = "DEVELOPER_TOOLS",
  UNIDENTIFIED_CONTEXT = "UNIDENTIFIED_CONTEXT",
}

class ExBoostEngine {
  version: string;
  windowIsDefined: boolean;
  chromeGlobalIsDefined: boolean;
  usesExtensionProtocol: boolean;
  extensionId: string | null;
  sessionId: string | null;
  isManifestV2: boolean;
  engineContext: EngineContext;
  installSignature: string | null;

  constructor() {
    this.version = "VERSION_PLACEHOLDER";
    this.sessionId = null;
    this.installSignature = null;
    this.windowIsDefined = typeof window !== "undefined";
    this.chromeGlobalIsDefined = typeof chrome !== "undefined";
    this.isManifestV2 = chrome.runtime.getManifest().version === "2";
    this.usesExtensionProtocol = this.windowIsDefined
      ? window.location.protocol === "chrome-extension:"
      : false;

    this.extensionId = null;

    if (this.chromeGlobalIsDefined) {
      this.extensionId = chrome.runtime.id;
    }

    if (
      (!this.isManifestV2 &&
        !this.windowIsDefined &&
        this.chromeGlobalIsDefined) ||
      (this.isManifestV2 &&
        this.windowIsDefined &&
        window === chrome.extension.getBackgroundPage())
    ) {
      this.engineContext = EngineContext.BACKGROUND;
    } else if (
      this.windowIsDefined &&
      this.chromeGlobalIsDefined &&
      this.usesExtensionProtocol
    ) {
      this.engineContext = EngineContext.EXTENSION_PAGE;
    } else if (
      this.windowIsDefined &&
      this.chromeGlobalIsDefined &&
      !this.usesExtensionProtocol
    ) {
      this.engineContext = EngineContext.CONTENT_SCRIPT;
    } else {
      this.engineContext = EngineContext.UNIDENTIFIED_CONTEXT;
    }

    this.engineInit();
  }

  private engineInit() {
    switch (this.engineContext) {
      case EngineContext.BACKGROUND:
        this.initBackground();
        break;
      case EngineContext.CONTENT_SCRIPT:
      case EngineContext.DEVELOPER_TOOLS:
      case EngineContext.EXTENSION_PAGE:
      case EngineContext.OPTIONS:
      case EngineContext.POPUP:
      default:
        break;
    }
  }

  private isSlotFilled(element: HTMLIFrameElement): boolean {
    return element!.contentDocument!.body.innerHTML.length > 0;
  }

  private fillAllExboostIframes(options: IExBoostOptions = {}) {
    const exboostFrames = document.querySelectorAll(
      `iframe[${EXBOOST_ATTRIBUTE}]`
    ) as NodeListOf<HTMLIFrameElement>;

    if (options.debug) {
      console.log(`Detected ${exboostFrames.length} ExBoost frames`);
    }

    const slotIds = new Set<string>();
    for (const exboostFrame of exboostFrames) {
      // Slot ID is to identify the traffic on the server
      const exboostSlotId = exboostFrame.getAttribute(EXBOOST_ATTRIBUTE);

      if (!exboostSlotId) {
        if (options.debug) {
          console.error("ExBoost slot is missing a slot ID");
        }
        continue;
      }

      if (slotIds.has(exboostSlotId)) {
        console.error(`Detected duplicate ExBoost slot id: ${exboostSlotId}`);
      }

      slotIds.add(exboostSlotId);

      const frameWidth = exboostFrame.offsetWidth;
      const frameHeight = exboostFrame.offsetHeight;
      const computedStyle = window.getComputedStyle(exboostFrame);

      if (options.debug) {
        if (frameWidth < 50 || frameHeight < 50) {
          `Frame ${exboostSlotId} is too small and will not render: ${frameWidth}x${frameHeight}`;
        }
      }

      // Frame has already been filled
      if (this.isSlotFilled(exboostFrame)) {
        if (options.debug) {
          console.log(`Frame ${exboostSlotId} is already filled, skipping`);
        }
        continue;
      }

      const message: IServeMessage = {
        exboostSlotId,
        engineContext: this.engineContext,
        slotStyle: {
          initialSlotWidth: frameWidth.toString(),
          initialSlotHeight: frameHeight.toString(),
          slotBackgroundColor: computedStyle.backgroundColor,
          slotFontColor: computedStyle.color,
          slotFontSize: computedStyle.fontSize,
          slotFontFamily: computedStyle.fontFamily,
        },
        options: {},
      };

      chrome.runtime.sendMessage(message, (response) => {
        exboostFrame!.contentDocument!.body.innerHTML = response.html;

        if (options.debug) {
          if (response.html.length > 0) {
            console.log(`Successfully filled ${exboostSlotId}`);
          } else {
            console.log(`Declined to fill ${exboostSlotId}`);
          }
        }
      });
    }
  }

  private async generateInstallSignature() {
    if (!OffscreenCanvas) {
      return "NOOFFSCREENCANVAS";
    }

    const canvas = new OffscreenCanvas(300, 300);
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      return "NOCONTEXT";
    }

    ctx.font = "14px 'Arial'";
    ctx.fillStyle = "#f60";
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = "#069";
    ctx.fillText("exboost.65@345876", 2, 15);
    ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
    ctx.fillText("exboost.65@345876", 4, 17);

    const blob = await (canvas.convertToBlob
      ? canvas.convertToBlob()
      : // @ts-ignore
        canvas.toBlob());
    const dataURL = await blob.text();
    const data = new TextEncoder().encode(dataURL);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    this.installSignature = hashHex;

    console.log(hashHex);
  }

  private initBackground() {
    this.sessionId = crypto.randomUUID();

    chrome.runtime.onMessage.addListener(
      (message: IServeMessage, sender, sendResponse) => {
        if (!Object.keys(message).includes("exboostSlotId")) {
          // This is not an exboost message
          return;
        }

        const path = [
          API_VERSION,
          "serve",
          this.extensionId,
          this.sessionId,
          message.engineContext,
          message.exboostSlotId,
        ].join("/");

        const params = new URLSearchParams({
          version: this.version,
          publisherExtensionName: chrome.runtime.getManifest().name,
          ...message.slotStyle,
        });

        fetch(`${API_ORIGIN}/${path}?nonce=${Date.now()}&${params.toString()}`)
          .then((response) => {
            if (response.status !== 200) {
              // Don't fill the slot with an error response
              return "";
            }

            return response.text();
          })
          .then((html) =>
            sendResponse({
              html,
            })
          );

        // Indicate that a response is coming
        return true;
      }
    );

    this.generateInstallSignature();
  }

  init(options: IExBoostOptions = {}) {
    if (options.debug) {
      console.log(`Engine context: ${this.engineContext}`);
    }

    this.fillAllExboostIframes(options);
  }
}

const ExBoost = new ExBoostEngine();

export default ExBoost;
