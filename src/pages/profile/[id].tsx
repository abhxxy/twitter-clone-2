import type { InferGetStaticPropsType, NextPage } from "next";
import { ssgHelper } from "../api/ssg-helper";
import type { GetStaticPropsContext } from "next";
import { api } from "@/utils/api";
import Head from "next/head";
import Link from "next/link";
import { IconEffectsHover } from "@/components/iconeffects-hover";
import { VscArrowLeft } from "react-icons/vsc";
import { ProfileImage } from "@/components/profile-image";
import { InfiniteTweetList } from "@/components/InfiniteTweetList";
import { use, useContext } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/custom-button";

const ProfilePage: NextPage<InferGetStaticPropsType<typeof getStaticProps>> = ({
  id,
}) => {
  const pluralRules = new Intl.PluralRules();
  function getPlural(number: number, singular: string, plural: string) {
    return pluralRules.select(number) === "one" ? singular : plural;
  }

  const { data: profile } = api.profile.getById.useQuery({ id });
  const trpcUtils = api.useContext();
  const tweets = api.tweet.infiniteProfileFeed.useInfiniteQuery(
    { userId: id },
    { getNextPageParam: (lastPage) => lastPage.nextCursor },
  );

  const { mutateAsync: toggleFollow } = api.profile.toggleFollow.useMutation({
    onSuccess: (addedFollow) => {
      trpcUtils.profile.getById.setData({ id }, (oldData) => {
        if (!oldData) return;

        const countModifier = addedFollow ? 1 : -1;

        return {
          ...oldData,
          isFollowing: addedFollow ?? false,
          followCount: oldData.followCount + countModifier,
        };
      });
    },
  });

  if (!profile) return null;

  return (
    <>
      <div className="sticky top-0 flex items-center border-b bg-white px-4 py-4">
        <Link href="..">
          <IconEffectsHover red>
            <VscArrowLeft size={30} />
          </IconEffectsHover>
        </Link>
        <div className="flex flex-col items-center gap-2 text-sm text-gray-400">
          <ProfileImage src={profile.image} className="ml-4" />

          <div className=" text-gray-500">
            {profile.tweetCount}{" "}
            {getPlural(profile.tweetCount, "tweet", "tweets")}-{" "}
            {profile.followersCount}
            {getPlural(profile.followersCount, "followers", "followers")}-{" "}
            {profile.followersCount}{" "}
          </div>
        </div>

        <div className="mx-auto" />

        <FollowButton
          isFollowing={profile.isFollowing}
          userId={id}
          onClick={() => void toggleFollow({ id })}
        />
      </div>
      <main>
        <InfiniteTweetList
          tweets={tweets.data?.pages.flatMap((page) => page.tweets).flat()}
          isError={tweets.isError}
          isLoading={tweets.isLoading}
          hasMore={tweets.hasNextPage}
          fetchNewTweets={tweets.fetchNextPage}
        />
      </main>
    </>
  );

  function FollowButton({
    userId,
    isFollowing,
    onClick,
  }: {
    userId: string;
    isFollowing: boolean;
    onClick: () => void;
  }) {
    const session = useSession();

    if (
      session.status === "authenticated" &&
      session.data.user?.id === userId
    ) {
      return null;
    }

    return (
      <Button onClick={onClick} small grey={isFollowing}>
        {isFollowing ? "UnFollow" : "Follow"}
      </Button>
    );
  }
};

export async function getStaticProps(
  context: GetStaticPropsContext & { params: { id: string } },
) {
  const id = context.params.id;

  if (id == null) {
    return {
      redirect: {
        destination: "/",
      },
    };
  }

  const ssg = ssgHelper();

  await ssg.profile.getById.prefetch({ id });

  return {
    props: {
      trpcStart: ssg.dehydrate(),
      id,
    },
  };
}

export const getStaticPaths = () => {
  return {
    paths: [],
    fallback: true,
  };
};

export default ProfilePage;
