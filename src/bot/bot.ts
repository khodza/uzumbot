import { session, Telegraf } from "telegraf";
import { CommandHandler } from "./commands/setup";
import { KeyboardButtonHandler } from "./keyboard-messages-handler/setuper";
import { InlineMessageHandler } from "./inline-keyboard-handler/setuper";
import { UzumApi } from "../uzum-api/api";
import cron from "node-cron";
import { BotContext } from "./domain/context";
import { SetInvoiceSceneHandler } from "./scenes/set-invoice/scene";
import { InvoiceScheduler } from "./scenes/set-invoice/setInvoice.scheduller";

export class UzumBot {
    private readonly bot: Telegraf<BotContext>;
    private commandHandler = new CommandHandler();
    private keyboardButtonHandler = new KeyboardButtonHandler();
    private inlineKeyboardHandler = new InlineMessageHandler();

    constructor(token: string, private admins: string[], private readonly uzumapi: UzumApi) {
        this.bot = new Telegraf<BotContext>(token);
        this.bot.use(session());
        this.initScenes();
        this.setupCommands();
        this.setupKeyboardButtonHandlers();
        this.setupCallBackHandlers();
        this.setupRefreshScheduler();
        this.setSetInvoiceScheduller();
    }

    private initScenes() {
        new SetInvoiceSceneHandler(this.bot, this.uzumapi);
    }

    private setupCommands(): void {
        this.commandHandler.handle(this.bot);
    }

    private setupKeyboardButtonHandlers(): void {
        this.bot.on("message", (ctx) => {
            this.keyboardButtonHandler.handle(ctx, this.uzumapi);
        });
    }

    private setupCallBackHandlers(): void {
        this.bot.on("callback_query", (ctx) => {
            this.inlineKeyboardHandler.handle(ctx, this.uzumapi);
        });
    }


    public launch(): void {
        this.bot.launch();
        console.log("Bot started");
    }

    private setupRefreshScheduler(): void {
        // Schedule the task to run once every day at 00:00 (midnight)
        cron.schedule("0 0 * * *", async () => {
            console.log("Running scheduled task to get Uzum token");
            try {
                const token = await this.uzumapi.signIn();

                const message = `Your Uzum 🍇 auth Token 🗝 has been updated automatically ✅:\n\`\`\`${token}\`\`\``;

                await Promise.all(this.admins.map(adminId =>
                    this.bot.telegram.sendMessage(adminId, message, { parse_mode: "Markdown" })
                        .then(() => console.log(`Message sent to admin: ${adminId}`))
                        .catch(err => console.error(`Failed to send message to admin ${adminId}:`, err))
                ));

            } catch (error) {
                try {
                    const message = `Failed to get Uzum token: ${error}`;
                    await Promise.all(this.admins.map(adminId =>
                        this.bot.telegram.sendMessage(adminId, message, { parse_mode: "Markdown" })
                            .then(() => console.log(`Message sent to admin: ${adminId}`))
                            .catch(err => console.error(`Failed to send message to admin ${adminId}:`, err))
                    ));
                } catch (e) {
                    console.error(`Failed to get Uzum token:`, e);
                }
            }
        });
    }

    private setSetInvoiceScheduller() {
        new InvoiceScheduler(this.uzumapi, this.admins, this.bot);
    }
}
