import {Context, Telegraf} from "telegraf";
import {StartCommand} from "./start/start.command";
import {HelpCommand} from "./help/command";
import {BotContext} from "../domain/context";

export class CommandHandler {
    public handle(bot: Telegraf<BotContext>): any {
        bot.command('start', (ctx: Context) => StartCommand.handle(ctx));
        bot.command('help', (ctx: Context) => HelpCommand.handle(ctx));
    }
}