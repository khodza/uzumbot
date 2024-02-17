import {SetInvoiceSceneInitializer} from "../../scenes/set-invoice/context/context-init";
import {BotContext} from "../../domain/context";
import {UzumApi} from "../../../uzum-api/api";

export class SetInvoiceHadnler {
    private initializer = new SetInvoiceSceneInitializer()

    public handle(ctx: BotContext, uzumApi: UzumApi): any {
        this.initializer.initializeAndEnterSetInvoiceScene(ctx, uzumApi)
    }
}