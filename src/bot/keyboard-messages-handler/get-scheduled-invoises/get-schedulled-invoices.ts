import { BotContext } from "../../domain/context";
import { InvoiceScheduler } from "../../scenes/set-invoice/setInvoice.scheduller";

export class GetSchedulledInvoicesHandler {

    public static async handle(ctx: BotContext): Promise<any> {
        const scheduledInvoices = await InvoiceScheduler.readInvoiceDetails();
        if (!scheduledInvoices || scheduledInvoices.length === 0) {
            await ctx.reply("No scheduled invoices found. 🙃");
            return;
        }
        let message = "Scheduled invoices:\n";
        for (const invoice of scheduledInvoices) {
            message += `----------------\nID: ${invoice.id}\n🛒 Shop: ${invoice.shopId},\n📦 Invoice(s): ${invoice.invoiceIds.join(",")},\n🕔 Scheduled Time: ${new Date(invoice.targetTimeFrom).toISOString().split("T")[0]},\n🏢 Stock : ${invoice.stock.title}\n----------------\n`;
        }
        await ctx.reply(message);
    }

}