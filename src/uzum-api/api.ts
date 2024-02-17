import axios from "axios";
import { UzumApiCredentials } from "./types";
import { Invoice, InvoicesResponse } from "./invoice.types";
import { Stock, StocksResponse } from "./stock.types";
import { TimeSlot, TimeSlotsResponse } from "./typeslot.types";
import moment from "moment-timezone";

export class UzumApi {
    private readonly uzumEmail: string;
    private readonly uzumPassword: string;
    private frontToken = "";
    private authToken = "";

    constructor(credentials: UzumApiCredentials) {
        this.uzumEmail = credentials.email;
        this.uzumPassword = credentials.password;
        this.frontToken = "Basic " + credentials.frontAuthToken;
        this.signIn();
    }

    public async signIn(): Promise<string | null> {
        const url = "https://api-seller.uzum.uz/api/oauth/token";
        try {
            const response = await axios.post(url, new URLSearchParams({
                grant_type: "password",
                username: this.uzumEmail,
                password: this.uzumPassword
            }), {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Authorization": this.frontToken
                }
            });

            const { access_token } = response.data;
            this.authToken = `Bearer ${access_token}`;
            return access_token;
        } catch (error) {
            console.log("ERROR WITH SIGN IN");
            console.error(error);
            return null;
        }
    }

    public async getOpenInvoices(shopId: string): Promise<InvoicesResponse | null> {
        const url = `https://api-seller.uzum.uz/api/seller/shop/${shopId}/invoice?page=0&size=20`;
        try {
            const response = await axios.get(url, {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Authorization": this.frontToken, // Assuming this.frontToken has the correct basic auth header value
                    "Accept": "application/json",
                    "Accept-Encoding": "gzip, deflate, br",
                    "Accept-Language": "ru-RU",
                    "Access-Content-Allow-Origin": "*",
                    "Origin": "https://seller.uzum.uz",
                    "Referer": "https://seller.uzum.uz/",
                    "Sec-Ch-Ua": `"Not A Brand";v="99", "Google Chrome";v="121", "Chromium";v="121"`,
                    "Sec-Ch-Ua-Mobile": "?0",
                    "Sec-Ch-Ua-Platform": `"Windows"`,
                    "Sec-Fetch-Dest": "empty",
                    "Sec-Fetch-Mode": "cors",
                    "Sec-Fetch-Site": "same-site",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36"
                }
            });

            const filteredInvoices = response.data.filter((invoice: Invoice) => invoice.status === "Yaratilgan" && invoice.timeSlotReservation === null && invoice.stock === null);
            return filteredInvoices;
        } catch (error) {
            console.error("Failed to get open invoices:", error);
            return null;
        }
    }

    public async getShops(): Promise<string[] | null> {
        const url = "https://api-seller.uzum.uz/api/auth/seller/check_token";
        try {
            const response = await axios.post(url, new URLSearchParams({
                token: this.authToken.split(" ")[1]
            }), {
                headers: {
                    "Authorization": this.frontToken,
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            });

            const shops = Object.keys(response.data.organizations);
            return shops;
        } catch (error) {
            console.error("Failed to get shops:", error);
            return null;
        }
    }

    public async getStocks(shopId: string, invoiceIds: number[]): Promise<Stock[] | null> {
        const url = `https://api-seller.uzum.uz/api/seller/shop/${shopId}/v2/invoice/stocks`;
        try {
            const response = await axios.post<StocksResponse>(url, {
                invoiceIds: invoiceIds
            }, {
                headers: {
                    "Authorization": this.authToken,
                    "Content-Type": "application/json"
                }
            });


            return response.data.payload.stocks;
        } catch (error) {
            // console.error('Failed to get stocks:', error);
            return null;
        }
    }

    public async getTimeslots(shopId: string, invoiceIds: number[], poolSource: string): Promise<TimeSlot[] | null> {
        const url = `https://api-seller.uzum.uz/api/seller/shop/${shopId}/v2/invoice/time-slot/get`;
        try {
            const tomorrowInMs = moment.tz("Asia/Tashkent").add(1, "days").valueOf();
            const body = {
                invoiceIds: invoiceIds,
                timeFrom: tomorrowInMs,
                poolSource: poolSource
            };

            const response = await axios.post<TimeSlotsResponse>(url, body, {
                headers: {
                    "Authorization": this.authToken,
                    "Content-Type": "application/json"
                }
            });
            return response.data.payload.timeSlots;
        } catch (error) {
            console.error("Failed to get time slots:", error);
            return null;
        }
    }

    public async setInvoice(invoiceIds: number[], timeFrom: number, shopId: string, stockId: number): Promise<Invoice[] | null> {
        const url = `https://api-seller.uzum.uz/api/seller/shop/${shopId}/v2/invoice/time-slot/set`;
        const requestBody = {
            invoiceIds: invoiceIds,
            poolSource: "STOCK",
            stockId: stockId,
            timeFrom: timeFrom
        };

        try {
            const response = await axios.post(url, requestBody, {
                headers: {
                    "Authorization": this.authToken,
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                }
            });

            return response.data.payload;
        } catch (error) {
            console.error("Failed to set invoice:", error);
            return null;
        }
    }

}
