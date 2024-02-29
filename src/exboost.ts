import { API_ORIGIN, API_VERSION, EngineContext } from "./consts";
import {
  IExBoostExtensionMessageMessage,
  IExBoostExtensionMessageResponse,
  IExBoostOptions,
  IExBoostSlotData,
} from "./interfaces";

class ExBoostEngine {
  // Allow these properties to be externally controlled
  apiOrigin: string;

  private version: string;
  private windowIsDefined: boolean;
  private chromeGlobalIsDefined: boolean;
  private usesExtensionProtocol: boolean;
  private extensionId: string | null;
  private extensionName: string | null;
  private sessionId: string | null;
  private isManifestV2: boolean | null;
  private engineContext: EngineContext;

  constructor() {
    this.version = "VERSION_PLACEHOLDER";
    this.apiOrigin = API_ORIGIN;
    this.sessionId = null;
    this.windowIsDefined = typeof window !== "undefined";
    this.chromeGlobalIsDefined = typeof chrome !== "undefined";
    this.isManifestV2 = null;
    this.usesExtensionProtocol = this.windowIsDefined
      ? window.location.protocol === "chrome-extension:"
      : false;

    this.extensionId = null;
    this.extensionName = null;

    if (this.chromeGlobalIsDefined) {
      this.extensionId = chrome.runtime.id;
      this.extensionName = chrome.runtime.getManifest().name;
      this.isManifestV2 = chrome.runtime.getManifest().version === "2";
    }

    if (
      (this.isManifestV2 === false &&
        !this.windowIsDefined &&
        this.chromeGlobalIsDefined) ||
      (this.isManifestV2 === true &&
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

  async renderSlotDataOrError(
    {
      exboostSlotId,
      target,
      containerClass,
      linkClass,
    }: {
      exboostSlotId: string;
      target: HTMLElement;
      containerClass?: string;
      linkClass?: string;
    },
    options: IExBoostOptions = {}
  ): Promise<void> {
    const slotData = await this.loadSlotDataOrError({ exboostSlotId });

    target.innerHTML = `<div class="exboost-container ${containerClass ?? ""}">
      ${slotData.anchorData
        .map(
          (data) =>
            `<a class="exboost-link ${linkClass ?? ""}" href="${
              data.href
            }" target="_blank">${data.text}</a>`
        )
        .join("")}
    </div>`;
  }

  async loadSlotDataOrError(
    { exboostSlotId }: { exboostSlotId: string },
    options: IExBoostOptions = {}
  ): Promise<IExBoostSlotData> {
    if (!exboostSlotId) {
      throw new Error("Must provide exboostSlotId");
    }

    const outboundMessage: IExBoostExtensionMessageMessage = {
      exboostSlotId,
      engineContext: this.engineContext,
      options,
    };

    const inboundMessage: IExBoostExtensionMessageResponse =
      await chrome.runtime.sendMessage(outboundMessage);

    if (!inboundMessage.success) {
      throw new Error("Failed to load ExBoost slot data");
    }

    return inboundMessage.exboostSlotData;
  }

  private initBackground() {
    this.sessionId = crypto.randomUUID();

    chrome.runtime.onMessage.addListener(
      (message: IExBoostExtensionMessageMessage, sender, sendResponse) => {
        if (!Object.keys(message).includes("exboostSlotId")) {
          // This is not an exboost message
          return;
        }

        const path = [API_VERSION, "links"].join("/");

        const params = new URLSearchParams({
          // This executes in the background, so these values will be defined
          sessionId: this.sessionId!,
          engineContext: message.engineContext,
          slotId: message.exboostSlotId,
          version: this.version,
          publisherExtensionId: this.extensionId!,
          publisherExtensionName: this.extensionName!,
        });

        fetch(
          `${this.apiOrigin}/${path}?nonce=${Date.now()}&${params.toString()}`
        )
          .then((response): Promise<IExBoostExtensionMessageResponse> => {
            if (response.status !== 200) {
              const payload: IExBoostExtensionMessageResponse = {
                success: false,
                exboostSlotData: {
                  anchorData: [],
                },
              };
              // Don't fill the slot with an error response
              return Promise.resolve(payload);
            }

            return response.json().then((data: IExBoostSlotData) => ({
              success: true,
              exboostSlotData: data,
            }));
          })
          .then((payload) => sendResponse(payload));

        // Indicate that a response is coming
        return true;
      }
    );
  }
}

const ExBoost = new ExBoostEngine();

export default ExBoost;
