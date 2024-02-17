import { Context } from "telegraf";
import { AVAILABLE_OPTIONS } from "../../keyboards/available-option/buttons";
import { UzumTokenKeyboardButton } from "../../inline-keyboards/uzum-token/uzumTokenKeyboardButton";

export class UzumTokenMessageHandler {
    public static handle(ctx: Context): any {
        ctx.reply(AVAILABLE_OPTIONS.UZUM_TOKEN, {
            reply_markup: {
                inline_keyboard: UzumTokenKeyboardButton.get()
            }
        });
    }
}