const EXBOOST_ATTRIBUTE = "data-exboost-slot";

const API_VERSION = `v1`;
const API_ORIGIN = `https://api.extensionboost.com`;

interface IServeMessage {
  exboostSlotId: string;
  engineContext: EngineContext;
  options: IExBoostOptions;
}

interface IServeResponse {
  exboostSlotData: IExboostSlotData;
  success: boolean;
}

interface IExBoostOptions {
  debug?: boolean;
}

export interface IExboostSlotData {
  anchor_data: {
    href: string,
    text: string
  }[]
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

  async loadSlotDataOrError({exboostSlotId}: {exboostSlotId: string}, options: IExBoostOptions = {}): Promise<IExboostSlotData>{
    const message: IServeMessage = {
      exboostSlotId,
      engineContext: this.engineContext,
      options
    }

    const response: IServeResponse = await chrome.runtime.sendMessage(message);

    if (!response.success) {
      throw new Error('Failed to load ExBoost slot data');
    }

    return response.exboostSlotData;
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
          "links",
          this.extensionId,
          this.sessionId,
          message.engineContext,
          message.exboostSlotId,
        ].join("/");

        const params = new URLSearchParams({
          version: this.version,
          publisherExtensionName: chrome.runtime.getManifest().name,
        });

        fetch(`${API_ORIGIN}/${path}?nonce=${Date.now()}&${params.toString()}`)
          .then((response) => {
            if (response.status !== 200) {
              // Don't fill the slot with an error response
              return {
                success: false,
                slotData: []
              };
            }

            return response.json().then((slotData) => ({
              success: true,
              slotData
            }));
          })
          .then(({success, slotData}) =>
            sendResponse({
              success, 
              slotData
            })
          );


        // Indicate that a response is coming
        return true;
      }
    );
  }
}

const ExBoost = new ExBoostEngine();

export default ExBoost;
