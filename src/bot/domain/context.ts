import { Context } from "telegraf";

export interface BotContext extends Context {
    session: BaseSceneContext[];
}

export interface BaseSceneContext {
    userId: number;
    sceneToken: Symbol;
    cache: BaseSceneCache;
}


export interface BaseSceneCache {
    [key: string]: any;
}