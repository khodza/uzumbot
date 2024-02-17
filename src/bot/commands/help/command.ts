import {Context} from "telegraf";

export class HelpCommand {
    public static async handle(ctx: Context): Promise<void> {
        await ctx.reply('Send me a command!');
    }
}
