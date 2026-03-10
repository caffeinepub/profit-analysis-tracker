import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Entry {
    id: EntryId;
    date: DateString;
    createdAt: bigint;
    receivedAmount: number;
    investAmount: number;
}
export type EntryId = bigint;
export type YearMonthString = string;
export type DateString = string;
export interface MonthlySummary {
    totalReceived: number;
    totalInvested: number;
    entryCount: bigint;
    yearMonth: YearMonthString;
    totalProfit: number;
    avgDailyProfit: number;
    profitPercent: number;
}
export interface DashboardStats {
    totalReceived: number;
    totalInvested: number;
    totalProfit: number;
    avgDailyProfit: number;
    profitPercent: number;
}
export interface UserProfile {
    username: string;
    lastLoginAt?: bigint;
    createdAt: bigint;
    email?: string;
    passwordHash?: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addEntry(date: DateString, investAmount: number, receivedAmount: number): Promise<Entry>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteEntry(id: EntryId): Promise<boolean>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDashboardStats(): Promise<DashboardStats>;
    getEntries(): Promise<Array<Entry>>;
    getMonthlySummaries(): Promise<Array<MonthlySummary>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    registerUser(username: string): Promise<void>;
    registerUserWithEmailPassword(username: string, email: string, passwordHash: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    verifyEmailPassword(email: string, passwordHash: string): Promise<boolean>;
}
