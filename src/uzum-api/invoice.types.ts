interface TimeSlot {
    timeFrom: number;
    timeTo: number;
}

interface TimeSlotReservation {
    id: number;
    timeSlots: TimeSlot[];
    status: string;
    timeFrom: number;
    timeTo: number;
}

interface DimensionalGroup {
    group: string;
    title: string;
}

interface Stock {
    id: number;
    externalId: string;
    title: string;
    address: string;
    timeFrom: string;
    timeTo: string;
    poolSource: string;
    dimensionalGroups: DimensionalGroup[];
}

interface InvoiceStatus {
    text: string;
    color: string;
    value: string;
}

export interface Invoice {
    id: number;
    invoiceNumber: number;
    deliveryCertificate: null | string;
    dateCreated: string;
    status: string;
    invoiceStatus: InvoiceStatus;
    fullPrice: number;
    timeSlotReservation: TimeSlotReservation | null;
    totalAccepted: number;
    totalToStock: number;
    remainingAmountOfUpdates: number;
    dateAccepted: null | number;
    expressAcceptanceDate: null | number;
    stock: Stock | null;
}

export interface InvoicesResponse extends Array<Invoice> {
}