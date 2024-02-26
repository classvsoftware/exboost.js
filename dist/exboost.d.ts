import { IExBoostOptions, IExBoostSlotData } from "./interfaces";
declare class ExBoostEngine {
    apiOrigin: string;
    private version;
    private windowIsDefined;
    private chromeGlobalIsDefined;
    private usesExtensionProtocol;
    private extensionId;
    private extensionName;
    private sessionId;
    private isManifestV2;
    private engineContext;
    constructor();
    private engineInit;
    renderSlotDataOrError({ exboostSlotId, target, containerClass, linkClass, }: {
        exboostSlotId: string;
        target: HTMLElement;
        containerClass?: string;
        linkClass?: string;
    }, options?: IExBoostOptions): Promise<void>;
    loadSlotDataOrError({ exboostSlotId }: {
        exboostSlotId: string;
    }, options?: IExBoostOptions): Promise<IExBoostSlotData>;
    private initBackground;
}
declare const ExBoost: ExBoostEngine;
export default ExBoost;
