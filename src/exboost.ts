const version = '1.0.0';

console.log(`Version: ${version}`);

class ExBoostEngine {
  windowIsDefined: boolean;
  chromeGlobalIsDefined: boolean;
  usesExtensionProtocol: boolean;

  constructor() {
    this.windowIsDefined = typeof window !== "undefined";
    this.chromeGlobalIsDefined = typeof chrome !== "undefined";
    this.usesExtensionProtocol = this.windowIsDefined
      ? window.location.protocol === "chrome-extension:"
      : false;
    this.init();
  }

  init() {
    console.log(this.getEnvironment());
  }

  getEnvironment() {
    if (!this.windowIsDefined && this.chromeGlobalIsDefined) {
      return "Running in background";
    } else if (
      this.windowIsDefined &&
      this.chromeGlobalIsDefined &&
      this.usesExtensionProtocol
    ) {
      return "Running in extension page";
    } else if (
      this.windowIsDefined &&
      this.chromeGlobalIsDefined &&
      !this.usesExtensionProtocol
    ) {
      return "Running in content script";
    } else {
      return "Running in undefined context";
    }
  }
}

const ExBoost = new ExBoostEngine();

export default ExBoost;
