import { Markup, Telegraf } from "telegraf";
import { BotContext } from "../../domain/context";
import { UzumApi } from "../../../uzum-api/api";
import { BotScenes } from "../../domain/scenes";
import { SetInvoiceSceneSession, SetInvoiceSceneSteps } from "./context/context";
import { InvoiceScheduler } from "./setInvoice.scheduller";
import moment from "moment-timezone";

export class SetInvoiceSceneHandler {
    private bot: Telegraf<BotContext>;
    private uzumApi: UzumApi;
    private sceneToken: Symbol;

    constructor(bot: Telegraf<BotContext>, uzumApi: UzumApi) {
        this.bot = bot;
        this.uzumApi = uzumApi;
        this.sceneToken = BotScenes.SetInvoiceScene;
        this.initializeListeners();
    }

    public static async enterAndSendShops
    (ctx: BotContext, uzumApi: UzumApi): Promise<void> {
        try {
            const shopsList = await uzumApi.getShops();
            if (!shopsList) {
                await ctx.reply("Failed to get shops");
                return;
            }

            const shops = shopsList.map(shopId => {
                let name = `Shop ${shopId}`;
                if (shopId === "31285") name = "bookhouse_uz";
                else if (shopId === "31321") name = "TrendiShop";
                return { name, id: shopId };
            });

            const message = "Please select a shop 🛒";
            const keyboard = Markup.inlineKeyboard(
                shops.map(shop => Markup.button.callback(shop.name, `selectShop:${shop.id}`))
            );

            const session = ctx.session.find(scene => scene.sceneToken === BotScenes.SetInvoiceScene && scene.userId === ctx.from?.id);
            if (session) {
                session.cache.currentStep = SetInvoiceSceneSteps.selectShop;
                await ctx.reply(message, keyboard);
            } else {
                console.log("Session not found for the user");
                await ctx.reply("Error: Session not found.");
            }
        } catch (error) {
            console.error("Error entering and sending shops:", error);
            await ctx.reply("An error occurred while processing your request.");
        }
    }

    private initializeListeners(): void {
        this.bot.action(new RegExp(`^(${Object.keys(SetInvoiceSceneSteps).join("|")}):(.+)$`), async (ctx, next) => {
            const action = ctx.match[1];
            const itemId = ctx.match[2];

            if (action === SetInvoiceSceneSteps.selectShop) {
                await this.handleShopsAndSendInvoices(ctx, itemId);
            } else if (action === SetInvoiceSceneSteps.selectStock) {
                await this.handleStocksAskTime(ctx, itemId);
            } else {
                await next();
            }
        });
        this.bot.on("text", async (ctx, next) => {
            await this.handleStepBasedAction(ctx, next);
        });

    }

    private async handleStepBasedAction(ctx: BotContext, next: () => Promise<void>): Promise<void> {
        const sceneContext = this.getSetInvoiceScene(ctx);
        if (!sceneContext || sceneContext?.cache?.currentStep === undefined) {
            await next();
            return;
        }
        if (ctx.message === undefined) return next();
        if (!("text" in ctx.message)) return next();

        switch (sceneContext.cache.currentStep) {
            case SetInvoiceSceneSteps.selectInvocie:
                await this.handleInvoicesAndSendStocks(ctx, ctx.message.text);
                break;
            case SetInvoiceSceneSteps.selectTime:
                await this.handleTimeAndSetInvoice(ctx, ctx.message.text);
                break;
            default:
                await next();
        }
    }


    private async handleShopsAndSendInvoices(ctx: BotContext, shopId: string): Promise<void> {
        try {
            const sceneContext = this.getSetInvoiceScene(ctx);
            if (!sceneContext) {
                await ctx.reply("Scene context not found 😢");
                return;
            }

            const openInvoices = await this.uzumApi.getOpenInvoices(shopId);
            if (!openInvoices || openInvoices.length === 0) {
                await ctx.reply("No open invoices found or an error occurred 😢");
                return;
            }

            const message = openInvoices.map(invoice => {
                return `--------------------------------------------------------\n\n` +
                    `<b>🆔 Invoice ID:</b> <code>${invoice.id}</code> 📃\n\n` +
                    `<b>🏢 Stock:</b> <code>${invoice.stock ? invoice.stock.title : "NOT SET 🚫"}</code> 📃\n\n` +
                    `<b>📦 Invoice Number:</b> <code>${invoice.invoiceNumber}</code> 📃\n` +
                    `<b>📅 Date Created:</b> ${invoice.dateCreated} 🗓\n` +
                    `<b>📊 Status:</b> ${invoice.status} 🚦\n` +
                    `<b>💶 Full Price:</b> ${invoice.fullPrice.toLocaleString()} UZS 💰\n` +
                    `--------------------------------------------------------\n\n`;
            }).join("\n\n");

            sceneContext.cache.selectedShop = { id: shopId, name: `Shop ${shopId}` };
            sceneContext.cache.currentStep = SetInvoiceSceneSteps.selectInvocie;
            sceneContext.cache.availableInvoices = openInvoices;
            await ctx.replyWithHTML(message);

            const message2 = "Please copy and send invoice ids as a comma separated list,example: 123,124,125";
            await ctx.reply(message2);
        } catch (err) {
            this.clearSceneCahe(ctx);
            await ctx.reply("An error occurred while processing your request.");
        }

    }


    private async handleInvoicesAndSendStocks(ctx: BotContext, invoiceIdsList: string): Promise<void> {
        try {
            const sceneContext = this.getSetInvoiceScene(ctx);
            if (!sceneContext) {
                await ctx.reply("Scene context not found 😢");
                return;
            }
            const invoices = invoiceIdsList.split(",").map(id => id.trim());
            if (!sceneContext.cache.availableInvoices) {
                await ctx.reply("No invoices found 😢");
                return;
            }
            const selectedInvoices = sceneContext.cache.availableInvoices.filter(invoice => invoices.includes(String(invoice.id)));
            if (selectedInvoices.length === 0) {
                await ctx.reply("No invoices found with the given ids 😢,or you send wrong ids");
                this.clearSceneCahe(ctx);
                return;
            }
            const selectedShop = sceneContext.cache.selectedShop;
            if (!selectedShop) {
                await ctx.reply("No shop selected 😢");
                return;
            }
            const stocks = await this.uzumApi.getStocks(selectedShop.id, selectedInvoices.map(invoice => invoice.id));
            if (!stocks || stocks.length === 0) {
                await ctx.reply("No stocks found or an error occurred 😢");
                return;
            }
            const message = "Please select a stock";
            sceneContext.cache.availableStocks = stocks;
            const keyboard = Markup.inlineKeyboard(
                stocks.map(stock => Markup.button.callback(stock.title, `${SetInvoiceSceneSteps.selectStock}:${stock.id}`))
            );
            sceneContext.cache.selectedInvoices = selectedInvoices;
            sceneContext.cache.currentStep = SetInvoiceSceneSteps.selectStock;
            await ctx.reply(message, keyboard);
        } catch (err) {
            console.error("Error handling invoices and sending stocks:", err);
            this.clearSceneCahe(ctx);
            await ctx.reply("An error occurred while processing your request.");
        }
    }

    private async handleStocksAskTime(ctx: BotContext, stockid: string): Promise<void> {
        try {
            const sceneContext = this.getSetInvoiceScene(ctx);
            if (!sceneContext) {
                await ctx.reply("Scene context not found 😢");
                return;
            }
            if (!sceneContext.cache.availableStocks) {
                await ctx.reply("No stock found 😢");
                return;
            }
            const selectedStock = sceneContext.cache.availableStocks.find(stock => stock.id === +stockid);
            if (!selectedStock) {
                await ctx.reply("No stock found 😢");
                return;
            }
            const selectedShop = sceneContext.cache.selectedShop;
            if (!selectedShop) {
                await ctx.reply("No shop selected 😢");
                return;
            }
            const selectedInvoices = sceneContext.cache.selectedInvoices;
            if (!selectedInvoices || selectedInvoices.length === 0) {
                await ctx.reply("No invoices selected 😢");
                return;
            }
            const timeSlots = await this.uzumApi.getTimeslots(selectedShop.id, selectedInvoices.map(invoice => invoice.id), selectedStock.poolSource);
            if (!timeSlots || timeSlots.length === 0) {
                await ctx.reply("No time slots found or an error occurred 😢");
                return;
            }
            let availableTimeSlots = "Available time slots:\n";
            timeSlots?.forEach(slot => {
                const formattedDate = new Date(slot.timeFrom).toISOString().split("T")[0];
                availableTimeSlots += `${formattedDate}\n`;
            });

            const message = "Please give a time slot, and send the date in the format \"YYYY-MM-DD\",Note you can not send date less than 24 hours from now";

            sceneContext.cache.selectedStock = selectedStock;
            sceneContext.cache.currentStep = SetInvoiceSceneSteps.selectTime;

            await ctx.reply(availableTimeSlots?.toString() || "No time slots found or an error occurred 😢");
            await ctx.reply(message);
        } catch (err) {
            this.clearSceneCahe(ctx);
            await ctx.reply("An error occurred while processing your request.");
        }
    }

    private async handleTimeAndSetInvoice(ctx: BotContext, time: string): Promise<void> {
        try {
            const sceneContext = this.getSetInvoiceScene(ctx);
            if (!sceneContext) {
                await ctx.reply("Scene context not found 😢");
                return;
            }
            const selectedShop = sceneContext.cache.selectedShop;
            if (!selectedShop) {
                await ctx.reply("No shop selected 😢");
                return;
            }
            const selectedInvoices = sceneContext.cache.selectedInvoices;
            if (!selectedInvoices || selectedInvoices.length === 0) {
                await ctx.reply("No invoices selected 😢");
                return;
            }
            const selectedStock = sceneContext.cache.selectedStock;
            if (!selectedStock) {
                await ctx.reply("No stock selected 😢");
                return;
            }
            const normalizedTime = this.normalizeTime(time);
            if (normalizedTime === null) {
                await ctx.reply("Invalid date or date is less than 24 hours from now 😢");
                await ctx.reply("Please give a time slot, and send the date in the format \"YYYY-MM-DD\"");
                return;
            }

            await InvoiceScheduler.saveInvoiceDetails({
                shopId: selectedShop.id,
                stock: selectedStock,
                invoiceIds: selectedInvoices.map(invoice => invoice.id),
                targetTimeFrom: normalizedTime
            });

            this.clearSceneCahe(ctx);
            await ctx.reply("Invoice schedule set successfully! 🎉");
        } catch (err) {
            this.clearSceneCahe(ctx);
            await ctx.reply("An error occurred while processing your request.");
        }
    }


    private normalizeTime(time: string): number | null {
        const inputDate = new Date(time + "T04:00:00.000Z");

        if (isNaN(inputDate.getTime())) {
            return null;
        }

        // Additional check to ensure the given date has not been auto-corrected
        const dateParts = time.split("-");
        if (dateParts.length === 3) {
            const year = parseInt(dateParts[0], 10);
            const month = parseInt(dateParts[1], 10) - 1; // Month is 0-indexed in JS Date
            const day = parseInt(dateParts[2], 10);

            if (inputDate.getUTCFullYear() !== year || inputDate.getUTCMonth() !== month || inputDate.getUTCDate() !== day) {
                return null; // Date was auto-corrected, so it's invalid
            }
        } else {
            return null; // Invalid date format
        }

        const currentDate = moment.tz("Asia/Tashkent").toDate();
        const utcCurrentDate = new Date(Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth(), currentDate.getUTCDate()));
        const utcCurrentDatePlusOneDay = new Date(utcCurrentDate.getTime() + 24 * 60 * 60 * 1000);

        if (inputDate <= utcCurrentDatePlusOneDay) {
            return null;
        }

        return inputDate.getTime();
    }


    private getSetInvoiceScene(ctx: BotContext): SetInvoiceSceneSession {
        if (ctx.from === undefined) {
            return {} as SetInvoiceSceneSession;
        } else {
            return ctx.session?.find(scene => scene.sceneToken === this.sceneToken && scene.userId === ctx.from?.id) as SetInvoiceSceneSession;
        }
    }


    private clearSceneCahe(ctx: BotContext): void {
        const index = ctx.session.findIndex(s => s.sceneToken === this.sceneToken && s.userId === ctx.from?.id);
        if (index > -1) {
            ctx.session = [];
        }
    }

}
