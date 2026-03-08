import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Entry, Summary } from "../backend.d";
import { useActor } from "./useActor";

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

export function useGetSummary() {
  const { actor, isFetching } = useActor();
  return useQuery<Summary>({
    queryKey: ["summary"],
    queryFn: async () => {
      if (!actor) {
        return {
          totalInvest: 0,
          totalReceived: 0,
          totalProfit: 0,
          profitPercentage: 0,
          averageDailyProfitPercentage: 0,
        };
      }
      return actor.getSummary();
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
      queryClient.invalidateQueries({ queryKey: ["summary"] });
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
      queryClient.invalidateQueries({ queryKey: ["summary"] });
    },
  });
}
