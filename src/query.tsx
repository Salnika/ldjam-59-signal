import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import type { ReactNode } from "react";

const LEADERBOARD_CACHE_KEY = "onebar_query_cache";
const QUERY_BUSTER = "onebar-query-v1";
const ONE_DAY_MS = 1000 * 60 * 60 * 24;

let browserQueryClient: QueryClient | undefined;
let browserPersister: ReturnType<typeof createSyncStoragePersister> | undefined;

function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: ONE_DAY_MS,
        retry: 1,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}

function getQueryClient(): QueryClient {
  if (typeof window === "undefined") {
    return createQueryClient();
  }

  browserQueryClient ??= createQueryClient();
  return browserQueryClient;
}

function getPersister() {
  if (typeof window === "undefined") {
    return null;
  }

  browserPersister ??= createSyncStoragePersister({
    key: LEADERBOARD_CACHE_KEY,
    storage: window.localStorage,
    throttleTime: 1_000,
  });

  return browserPersister;
}

export function leaderboardQueryKey(limit = 10) {
  return ["leaderboard", limit] as const;
}

export function AppQueryProvider({ children }: { children: ReactNode }): ReactNode {
  const queryClient = getQueryClient();
  const persister = getPersister();

  if (!persister) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        buster: QUERY_BUSTER,
        maxAge: ONE_DAY_MS,
        persister,
        dehydrateOptions: {
          shouldDehydrateQuery: (query) =>
            Array.isArray(query.queryKey) && query.queryKey[0] === "leaderboard",
        },
      }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}
