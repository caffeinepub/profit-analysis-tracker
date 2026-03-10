import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  DashboardStats,
  Entry,
  MonthlySummary,
  UserProfile,
} from "../backend.d";
import { useActor } from "./useActor";

export function useGetUserProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ["userProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useRegisterUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (username: string) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.registerUser(username);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
  });
}

export function useRegisterUserWithEmailPassword() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      username,
      email,
      passwordHash,
    }: {
      username: string;
      email: string;
      passwordHash: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.registerUserWithEmailPassword(username, email, passwordHash);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
  });
}

export function useVerifyEmailPassword() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      email,
      passwordHash,
    }: {
      email: string;
      passwordHash: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.verifyEmailPassword(email, passwordHash);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
  });
}

export function useGetDashboardStats() {
  const { actor, isFetching } = useActor();
  return useQuery<DashboardStats>({
    queryKey: ["dashboardStats"],
    queryFn: async () => {
      if (!actor)
        return {
          totalInvested: 0,
          totalReceived: 0,
          totalProfit: 0,
          profitPercent: 0,
          avgDailyProfit: 0,
        };
      return actor.getDashboardStats();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetEntries() {
  const { actor, isFetching } = useActor();
  return useQuery<Entry[]>({
    queryKey: ["entries"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getEntries();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetMonthlySummaries() {
  const { actor, isFetching } = useActor();
  return useQuery<MonthlySummary[]>({
    queryKey: ["monthlySummaries"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMonthlySummaries();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      date,
      investAmount,
      receivedAmount,
    }: {
      date: string;
      investAmount: number;
      receivedAmount: number;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.addEntry(date, investAmount, receivedAmount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entries"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
      queryClient.invalidateQueries({ queryKey: ["monthlySummaries"] });
    },
  });
}

export function useDeleteEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.deleteEntry(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entries"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
      queryClient.invalidateQueries({ queryKey: ["monthlySummaries"] });
    },
  });
}
