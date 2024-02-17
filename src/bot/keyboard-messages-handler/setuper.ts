import { UzumTokenMessageHandler } from "./uzum-token/uzum.token-message";
import { AVAILABLE_OPTIONS } from "../keyboards/available-option/buttons";
import { UzumApi } from "../../uzum-api/api";
import { SetInvoiceHadnler } from "./set-invoice/set-invoice";
import { BotContext } from "../domain/context";
import { GetSchedulledInvoicesHandler } from "./get-scheduled-invoises/get-schedulled-invoices";
import { DeleteSchedullerInvoicesHandler } from "./delete-scheduled-invoices/delete-scheduller-invoices";

export class KeyboardButtonHandler {

    private setInvoiceHandler = new SetInvoiceHadnler();

    public async handle(ctx: BotContext, uzumapi: UzumApi): Promise<void> {
        const message = ctx.message;
        if (message === undefined) return;
        if ("text" in message && message.text !== undefined) {
            switch (message.text) {
                case AVAILABLE_OPTIONS.UZUM_TOKEN:
                    UzumTokenMessageHandler.handle(ctx);
                    break;
                case AVAILABLE_OPTIONS.SHEDULE_INVOICE:
                    this.setInvoiceHandler.handle(ctx, uzumapi);
                    break;
                case AVAILABLE_OPTIONS.GET_SCHEDLED_INVOICES:
                    await GetSchedulledInvoicesHandler.handle(ctx);
                    break;
                case AVAILABLE_OPTIONS.DElETE_SCHEDLED_INVOICES:
                    await DeleteSchedullerInvoicesHandler.handle(ctx);
                    break;
                default:
                    await ctx.reply("I do not understand this command 🥸");
            }
        }
    }
}