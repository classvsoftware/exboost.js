const EXBOOST_ATTRIBUTE = "data-exboost-slot";

const API_VERSION = `v1`;
const API_ORIGIN = `https://api.extensionboost.com/`;

interface IServeMessage {
  exboostSlotId: string;
  engineContext: EngineContext;
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

  constructor() {
    this.version = "VERSION_PLACEHOLDER";
    this.sessionId = null;
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

  engineInit() {
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

  fillAllExboostIframes() {
    const exboostFrames = document.querySelectorAll(
      `iframe[${EXBOOST_ATTRIBUTE}]`
    ) as NodeListOf<HTMLIFrameElement>;

    for (const exboostFrame of exboostFrames) {
      // Slot ID is to identify the traffic on the server
      const exboostSlotId = exboostFrame.getAttribute(EXBOOST_ATTRIBUTE);

      if (!exboostSlotId) {
        console.error("ExBoost slot is missing a slot ID");
        return;
      }

      const message: IServeMessage = {
        exboostSlotId,
        engineContext: this.engineContext,
      };

      chrome.runtime.sendMessage(message, (response) => {
        exboostFrame!.contentDocument!.body.innerHTML = response.html;
      });
    }
  }

  initBackground() {
    this.sessionId = crypto.randomUUID();

    chrome.runtime.onMessage.addListener(
      (message: IServeMessage, sender, sendResponse) => {
        const path = [
          API_VERSION,
          "serve",
          this.extensionId,
          this.sessionId,
          message.engineContext,
          message.exboostSlotId,
        ].join("/");

        fetch(`${API_ORIGIN}/${path}?nonce=${Date.now()}`)
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
        return true;
      }
    );
  }
  init() {
    this.fillAllExboostIframes();
  }
}

const ExBoost = new ExBoostEngine();

export default ExBoost;
