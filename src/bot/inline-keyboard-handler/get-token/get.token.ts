import { Context } from "telegraf";
import { UzumApi } from "../../../uzum-api/api";

export class GetTokenCLBHandler {

    public static async handle(ctx: Context, uzumApi: UzumApi): Promise<void> {
        const uzumToken = await uzumApi.signIn();
        if (uzumToken === null) {
            await ctx.reply("Error occurred while getting the token. 🚫");
            return;
        }
        await ctx.replyWithHTML(`Your Uzum 🍇  Auth TOKEN 🗝 is: \n\n<code>${uzumToken}</code>\n\nIts has been updated ✅`);
    }

}