import { UzumApi } from "../../../uzum-api/api";
import { Telegraf } from "telegraf";
import { BotContext } from "../../domain/context";
import cron from "node-cron";
import fs from "fs/promises";
import { Invoice } from "../../../uzum-api/invoice.types";
import { Stock } from "../../../uzum-api/stock.types";

type InvoiceDetail = {
    id?: number;
    shopId: string;
    invoiceIds: number[];
    stock: Stock;
    targetTimeFrom: number;
};

export class InvoiceScheduler {
    private static invoiceDetailsFile = "./invoiceDetails.json";

    constructor(private uzumApi: UzumApi, private adminIds: string[], private bot: Telegraf<BotContext>) {
        this.startScheduler();
    }

    private async startScheduler() {
        cron.schedule("*/30 * * * * *", async () => {
            console.log("Scheduler is running...");
            try {
                const invoiceDetailsArray = await InvoiceScheduler.readInvoiceDetails();

                if (!invoiceDetailsArray || invoiceDetailsArray.length === 0) {
                    console.log("No invoice details found to process.");
                    return;
                }

                for (const invoiceDetail of invoiceDetailsArray) {
                    try {
                        const timeSlots = await this.uzumApi.getTimeslots(invoiceDetail.shopId, invoiceDetail.invoiceIds, invoiceDetail.stock.poolSource);

                        if (timeSlots && timeSlots.length > 0) {
                            const matchingSlot = timeSlots.find(slot => slot.timeFrom === invoiceDetail.targetTimeFrom);

                            if (matchingSlot) {
                                const setResult = await this.uzumApi.setInvoice(invoiceDetail.invoiceIds, matchingSlot.timeFrom, invoiceDetail.shopId, invoiceDetail.stock.id);

                                if (setResult && setResult.length > 0) {
                                    if (invoiceDetail.id) {
                                        await InvoiceScheduler.deleteInvoiceDetail(invoiceDetail.id);
                                    }

                                    // Notify admins
                                    const message = this.createNotificationMessage(setResult);
                                    for (const adminId of this.adminIds) {
                                        await this.bot.telegram.sendMessage(adminId, message, { parse_mode: "HTML" });
                                    }
                                } else {
                                    console.error("Failed to set invoice");
                                }
                            } else {
                                console.log("No matching time slot found for invoice:", invoiceDetail);
                            }
                        } else {
                            console.log("Failed to fetch time slots or no slots available for invoice:", invoiceDetail);
                        }
                    } catch (error) {
                        console.error("Error processing an invoice detail:", error);
                    }
                }
            } catch (error) {
                console.error("Error in scheduler:", error);
            }
        });
    }

    private createNotificationMessage(invoiceResults: Invoice[]): string {
        let message = "✅ Invoice(s) set successfully! Details:\n\n";

        invoiceResults.forEach((invoice, index) => {
            message += `--------------------------------------------------------\n`;
            message += `<b>🆔 Invoice ID:</b> <code>${invoice.id}</code>\n`;
            message += `<b>📅 Date Created:</b> ${invoice.dateCreated}\n`;
            message += `<b>💶 Full Price:</b> ${invoice.fullPrice.toLocaleString()} UZS\n`;
            message += `<b>🏢 Stock:</b> ${invoice.stock ? invoice.stock.title : "Not specified"}\n`;
            message += `<b>🕔 Timeslot:</b> ${invoice.stock ? new Date(invoice.timeSlotReservation?.timeFrom as number).toISOString().split("T")[0] : "Not specified"}\n`;
            message += `--------------------------------------------------------\n\n`;
        });

        return message;
    }


    static async saveInvoiceDetails(invoiceDetail: InvoiceDetail): Promise<void> {
        try {
            const existingData: InvoiceDetail[] = await this.readInvoiceDetails() || [];

            let newId = 1;
            if (existingData.length > 0) {
                const maxId = Math.max(...existingData.map(detail => detail.id || 0));
                newId = maxId + 1;
            }
            invoiceDetail.id = newId;

            existingData.push(invoiceDetail);

            await fs.writeFile(this.invoiceDetailsFile, JSON.stringify(existingData, null, 2), "utf8");
        } catch (error) {
            console.error("Failed to save invoice details:", error);
        }
    }


    static async readInvoiceDetails(): Promise<InvoiceDetail[] | null> {
        try {
            const fileContent = await fs.readFile(this.invoiceDetailsFile, "utf8");
            return JSON.parse(fileContent);
        } catch (error) {
            return null;
        }
    }

    static async deleteInvoiceDetail(id: number): Promise<void> {
        try {
            const data = await this.readInvoiceDetails() || [];
            const newData = data.filter(detail => detail.id !== id);

            await fs.writeFile(this.invoiceDetailsFile, JSON.stringify(newData, null, 2), "utf8");
            console.log(`Invoice detail with ID ${id} deleted successfully.`);
        } catch (error) {
            console.error(`Failed to delete invoice detail with ID ${id}:`, error);
        }
    }


    static async deleteAllInvoiceDetails(): Promise<boolean> {
        try {
            await fs.writeFile(this.invoiceDetailsFile, "[]", "utf8");
            return true;
        } catch (error) {
            console.error("Failed to delete all invoice details:", error);
            return false;
        }
    }
}
