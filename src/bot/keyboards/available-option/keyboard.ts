import { AVAILABLE_OPTIONS } from "./buttons";

export class AvailableOptionsInlineKeyboard {
    public static get() {
        return [
            [{ text: AVAILABLE_OPTIONS.UZUM_TOKEN }],
            [{ text: AVAILABLE_OPTIONS.GET_SCHEDLED_INVOICES }, { text: AVAILABLE_OPTIONS.SHEDULE_INVOICE }],
            [{ text: AVAILABLE_OPTIONS.DElETE_SCHEDLED_INVOICES }]
        ];
    }
}