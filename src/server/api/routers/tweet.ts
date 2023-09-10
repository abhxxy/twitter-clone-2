import { z } from "zod";

import {
  createTRPCContext,
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { Prisma } from "@prisma/client";
import { inferAsyncReturnType } from "@trpc/server";

export const tweetRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ content: z.string() }))
    .mutation(async ({ input: { content }, ctx }) => {
      const tweet = await ctx.prisma.tweet.create({
        data: { content, userId: ctx.session.user.id },
      });

      return tweet;
    }),

  infiniteProfileFeed: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        limit: z.number().optional(),
        cursor: z.object({ id: z.string(), createdAt: z.date() }).optional(),
      }),
    )
    .query(async ({ input: { userId, limit = 10, cursor }, ctx }) => {
      return getInfinitetweets({
        whereClause: { userId },
        ctx,
        limit,
        cursor,
      });
    }),
  infinitefeed: publicProcedure
    .input(
      z.object({
        onlyFollowing: z.boolean().optional(),
        limit: z.number().optional(),
        cursor: z.object({ id: z.string(), createdAt: z.date() }).optional(),
      }),
    )

    .query(
      async ({ input: { onlyFollowing = false, limit = 10, cursor }, ctx }) => {
        return getInfinitetweets({
          whereClause: onlyFollowing
            ? {
                user: {
                  followers: {
                    some: { followers: { some: { id: ctx.session?.user.id } } },
                  },
                },
              }
            : {},
          ctx,
          limit,
          cursor,
        });
      },
    ),

  toggleLike: protectedProcedure
    .input(z.object({ tweetId: z.string() }))
    .mutation(async ({ input: { tweetId }, ctx }) => {
      const userId = ctx.session.user.id;
      const like = await ctx.prisma.like.findUnique({
        where: { userId_tweetId: { userId, tweetId } },
      });
      if (like == null) {
        await ctx.prisma.like.create({ data: { tweetId, userId } });
        return true;
      } else {
        await ctx.prisma.like.delete({
          where: { userId_tweetId: { userId, tweetId } },
        });
        return false;
      }
    }),
});

async function getInfinitetweets({
  whereClause,
  ctx,
  limit,
  cursor,
}: {
  whereClause: Prisma.TweetWhereInput;
  limit: number;
  cursor?: { id: string; createdAt: Date };
  ctx: inferAsyncReturnType<typeof createTRPCContext>;
}) {
  const CurrentUser = ctx.session?.user.id;
  const data = await ctx.prisma.tweet.findMany({
    take: limit + 1,
    cursor: cursor ? { createdAt_id: cursor } : undefined,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    where: whereClause,
    select: {
      id: true,
      content: true,
      createdAt: true,
      _count: {
        select: { likes: true },
      },

      likes: CurrentUser == null ? false : { where: { userId: CurrentUser } },
      user: true,
    },
  });
  let nextCursor: typeof cursor | undefined;
  if (data.length > limit) {
    const nextItem = data.pop();
    if (nextItem != null) {
      nextCursor = { id: nextItem.id, createdAt: nextItem.createdAt };
    }
  }

  return {
    tweets: data.map((tweet) => {
      return {
        id: tweet.id,
        content: tweet.content,
        createdAt: tweet.createdAt,
        likeCount: tweet._count.likes,
        user: tweet.user,
        likedByMe: tweet.likes?.length > 0,
      };
    }),
    nextCursor,
  };
}
