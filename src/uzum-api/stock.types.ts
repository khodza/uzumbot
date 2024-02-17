export type StockDimensionalGroup = {
    group: string;
    title: string;
}

export type Stock = {
    id: number;
    externalId: string;
    title: string;
    address: string;
    timeFrom: string;
    timeTo: string;
    poolSource: string;
    dimensionalGroups: StockDimensionalGroup[];
}

export type StocksResponse = {
    payload: {
        stocks: Stock[];
    };
    timestamp: string;
}