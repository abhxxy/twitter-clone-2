import { appRouter } from "@/server/api/root";
import SuperJSON from "superjson";
import { createServerSideHelpers } from "@trpc/react-query/server";
import { createInnerTRPCContext } from "@/server/api/trpc";

export function ssgHelper() {
  return createServerSideHelpers({
    router: appRouter,
    transformer: SuperJSON,
    ctx: createInnerTRPCContext({ session: null }),
  });
}
