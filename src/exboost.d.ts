export interface IExBoostOptions {
  debug?: boolean;
}

export interface IExboostSlotData {
  anchor_data: {
    href: string;
    text: string;
  }[];
}

declare class ExBoostEngine {
  loadSlotDataOrError({exboostSlotId}: {exboostSlotId: string}, options?: IExBoostOptions): Promise<IExboostSlotData>;
}

declare const ExBoost: ExBoostEngine;
export default ExBoost;
