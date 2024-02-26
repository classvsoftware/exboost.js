import { EngineContext } from "./consts";
export interface IExBoostExtensionMessageMessage {
    exboostSlotId: string;
    engineContext: EngineContext;
    options: IExBoostOptions;
}
export interface IExBoostExtensionMessageResponse {
    exboostSlotData: IExBoostSlotData;
    success: boolean;
}
export interface IExBoostOptions {
    debug?: boolean;
}
export interface IExBoostSlotData {
    anchorData: {
        href: string;
        text: string;
    }[];
}
