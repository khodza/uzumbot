import { BotContext } from "../../../domain/context";
import { SetInvoiceSceneSession, SetInvoiceSceneSteps } from "./context";
import { UzumApi } from "../../../../uzum-api/api";
import { SetInvoiceSceneHandler } from "../scene";

export class SetInvoiceSceneInitializer {

    public async initializeAndEnterSetInvoiceScene(ctx: BotContext, uzumApi: UzumApi): Promise<void> {
        if (!ctx.from) {
            return;
        }

        const sceneContext = new SetInvoiceSceneSession(ctx.from.id);
        sceneContext.cache.currentStep = SetInvoiceSceneSteps.selectShop;
        if (ctx.session?.length === 0) {
            ctx.session = [sceneContext];
        } else {
            ctx.session = [];
            ctx.session.push(sceneContext);
        }

        await SetInvoiceSceneHandler.enterAndSendShops(ctx, uzumApi);
    }

}
