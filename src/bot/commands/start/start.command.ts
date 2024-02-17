import { Context } from "telegraf";
import { AvailableOptionsInlineKeyboard } from "../../keyboards/available-option/keyboard";

export class StartCommand {
    public static async handle(ctx: Context): Promise<void> {
        await ctx.reply("Choose an option ⚙️:", {
            reply_markup: {
                keyboard: AvailableOptionsInlineKeyboard.get(),
                resize_keyboard: true,
                one_time_keyboard: true
            }
        });
    }
}