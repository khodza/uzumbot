import { Context } from "telegraf";
import { GetTokenCLBHandler } from "./get-token/get.token";
import { GET_MY_TOKEN } from "../inline-keyboards/uzum-token/keyboard.options";
import { UzumApi } from "../../uzum-api/api";

export class InlineMessageHandler {
    async handle(ctx: Context, uzumApi: UzumApi): Promise<void> {
        const callbackQuery = ctx.callbackQuery;
        if (callbackQuery === undefined) return;
        if ("data" in callbackQuery && callbackQuery.data !== undefined) {
            const data = callbackQuery.data;
            switch (data) {
                case GET_MY_TOKEN.CALLBACK_DATA:
                    await GetTokenCLBHandler.handle(ctx, uzumApi);
                    break;
                default:
                    console.dir(ctx);
                    await ctx.reply("Unknown option selected. 😬");
            }
        }
    }
}