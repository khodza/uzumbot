import moment from "moment-timezone";

export function getCurrentTimeInUzbekistanMS(): number {
    const uzbekistanTime = moment.tz("Asia/Tashkent").valueOf();
    return uzbekistanTime;
}