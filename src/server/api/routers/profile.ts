import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";

export const profileRouter = createTRPCRouter({
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input: { id }, ctx }) => {
      const currentUserId = ctx.session?.user.id;
      const profile = await ctx.prisma.user.findUnique({
        where: { id },
        select: {
          name: true,
          _count: {
            select: {
              followers: true,
              tweets: true,
              likes: true,
              follows: true,
            },
          },
          image: true,
          followers:
            currentUserId == null
              ? undefined
              : { where: { id: currentUserId } },
        },
      });

      return {
        name: profile?.name,
        image: profile?.image,
        followersCount: profile?._count.followers ?? 0,
        tweetCount: profile?._count.tweets ?? 0,
        followCount: profile?._count.follows ?? 0,
        isFollowing: profile?.followers.length === 1 ?? false,
      };
    }),

  toggleFollow: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input: { id }, ctx }) => {
      const currentUserId = ctx.session?.user.id;

      if (currentUserId == null) {
        throw new Error("Not logged in");
      }

      const isFollowing = await ctx.prisma.user.findUnique({
        where: { id },
        select: {
          followers: {
            where: { id: currentUserId },
          },
        },
      });

      if (isFollowing?.followers.length === 1) {
        await ctx.prisma.user.update({
          where: { id },
          data: {
            followers: {
              disconnect: { id: currentUserId },
            },
          },
        });

        return false;
      }

      if (isFollowing?.followers.length === 0) {
        await ctx.prisma.user.update({
          where: { id },
          data: {
            followers: {
              connect: { id: currentUserId },
            },
          },
        });

        return true;
      }
    }),
});
