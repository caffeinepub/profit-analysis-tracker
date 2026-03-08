import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Summary {
    totalReceived: number;
    averageDailyProfitPercentage: number;
    totalInvest: number;
    totalProfit: number;
    profitPercentage: number;
}
export interface Entry {
    id: bigint;
    date: string;
    createdAt: bigint;
    receivedAmount: number;
    investAmount: number;
}
export interface backendInterface {
    addEntry(date: string, investAmount: number, receivedAmount: number): Promise<Entry>;
    deleteEntry(id: bigint): Promise<boolean>;
    getEntries(): Promise<Array<Entry>>;
    getSummary(): Promise<Summary>;
}
