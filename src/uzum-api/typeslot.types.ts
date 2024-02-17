export type TimeSlot = {
    timeFrom: number;
    timeTo: number;
}

export type TimeSlotsResponse = {
    payload: {
        timeSlots: TimeSlot[];
    };
    timestamp: string;
}