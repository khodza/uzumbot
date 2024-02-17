import { BaseSceneCache, BaseSceneContext } from "../../../domain/context";
import { Invoice } from "../../../../uzum-api/invoice.types";
import { BotScenes } from "../../../domain/scenes";
import { Stock } from "../../../../uzum-api/stock.types";

interface Shop {
    id: string;
    name: string;
}

export enum SetInvoiceSceneSteps {
    selectShop = "selectShop",
    selectInvocie = "selectInvoice",
    selectStock = "selectStock",
    selectTime = "selectDate",
}

export class SetInvoiceSessionCache implements BaseSceneCache {
    currentStep: SetInvoiceSceneSteps;
    selectedShop?: Shop;
    availableInvoices?: Invoice[];
    selectedInvoices?: Invoice[];
    availableStocks?: Stock[];
    selectedStock?: Stock;
}

export class SetInvoiceSceneSession implements BaseSceneContext {
    sceneToken: Symbol;
    userId: number;
    cache: SetInvoiceSessionCache;

    constructor(userId: number) {
        this.userId = userId;
        this.sceneToken = BotScenes.SetInvoiceScene;
        this.cache = new SetInvoiceSessionCache();
    }
}