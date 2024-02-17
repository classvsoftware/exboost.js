interface IExBoostOptions {
    debug?: boolean;
}
export interface IExBoostSlotData {
    anchorData: {
        href: string;
        text: string;
    }[];
}
declare class ExBoostEngine {
    private version;
    private windowIsDefined;
    private chromeGlobalIsDefined;
    private usesExtensionProtocol;
    private extensionId;
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
