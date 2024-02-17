import {InlineKeyboardButton} from "@telegraf/types/markup";
import {GET_MY_TOKEN} from "./keyboard.options";

export class UzumTokenKeyboardButton {

    public  static get():InlineKeyboardButton[][] {
        return  [
            [
                {
                    text: GET_MY_TOKEN.TEXT,
                    callback_data: GET_MY_TOKEN.CALLBACK_DATA
                },
            ]
        ]
    }
}