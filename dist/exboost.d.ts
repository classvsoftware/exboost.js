interface IExBoostOptions {
    debug?: boolean;
}
declare enum EngineContext {
    BACKGROUND = "BACKGROUND",
    CONTENT_SCRIPT = "CONTENT_SCRIPT",
    EXTENSION_PAGE = "EXTENSION_PAGE",
    POPUP = "POPUP",
    OPTIONS = "OPTIONS",
    SIDEBAR = "SIDEBAR",
    DEVELOPER_TOOLS = "DEVELOPER_TOOLS",
    UNIDENTIFIED_CONTEXT = "UNIDENTIFIED_CONTEXT"
}
declare class ExBoostEngine {
    version: string;
    windowIsDefined: boolean;
    chromeGlobalIsDefined: boolean;
    usesExtensionProtocol: boolean;
    extensionId: string | null;
    sessionId: string | null;
    isManifestV2: boolean;
    engineContext: EngineContext;
    constructor();
    private engineInit;
    private isSlotFilled;
    private fillAllExboostIframes;
    private initBackground;
    init(options?: IExBoostOptions): void;
}
declare const ExBoost: ExBoostEngine;
export default ExBoost;
