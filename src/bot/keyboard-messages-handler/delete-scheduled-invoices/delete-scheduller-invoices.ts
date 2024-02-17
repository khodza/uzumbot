import { BotContext } from "../../domain/context";
import { InvoiceScheduler } from "../../scenes/set-invoice/setInvoice.scheduller";

export class DeleteSchedullerInvoicesHandler {

    public static async handle(ctx: BotContext): Promise<any> {
        const deleted = await InvoiceScheduler.deleteAllInvoiceDetails();
        if (!deleted) {
            await ctx.reply("Error deleting scheduled invoices. 🚫");
            return;
        }
        await ctx.reply("All scheduled invoices deleted.");
    }

}