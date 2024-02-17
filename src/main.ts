import { config } from "dotenv";
import { UzumBot } from "./bot/bot";
import { UzumApi } from "./uzum-api/api";

config();

function getEnvVariable(name: string): any {
    const value = process.env[name];
    if (value === undefined) {
        console.error(`The ${name} environment variable is not set`);
        process.exit(1);
    }
    return value;
}

const token = getEnvVariable("BOT_TOKEN");
const uzumEmail = getEnvVariable("UZUM_EMAIL");
const uzumPassword = getEnvVariable("UZUM_PASSWORD");
const uzumFrontAuthToken = getEnvVariable("UZUM_FRONT_AUTH_TOKEN");
const admins = getEnvVariable("ADMINS");

const adminIds = admins.split(",");

const uzumApi = new UzumApi({ email: uzumEmail, password: uzumPassword, frontAuthToken: uzumFrontAuthToken });
const uzumBot = new UzumBot(token, adminIds, uzumApi);

uzumBot.launch();
