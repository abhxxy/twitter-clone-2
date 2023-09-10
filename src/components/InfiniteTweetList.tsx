import { useSession } from "next-auth/react";
import Link from "next/link";
import InfiniteScroll from "react-infinite-scroll-component";
import { ProfileImage } from "./profile-image";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { VscHeart, VscHeartFilled } from "react-icons/vsc";
import { IconEffectsHover } from "./iconeffects-hover";
import { RouterOutputs, api } from "@/utils/api";

type Tweet = RouterOutputs["tweet"]["infinitefeed"]["tweets"][number];

type InfiniteTweetListProps = {
  isError: boolean;
  isLoading: boolean;
  hasMore: boolean | undefined;
  fetchNewTweets: () => Promise<unknown>;
  tweets?: RouterOutputs["tweet"]["infinitefeed"]["tweets"][number][];
};

export function InfiniteTweetList({
  tweets,
  isError,
  isLoading,
  fetchNewTweets,
  hasMore,
}: InfiniteTweetListProps) {
  if (isError) {
    return <h1>Error</h1>;
  }
  if (isLoading) {
    return <h1>Loading</h1>;
  }
  if (hasMore) {
    return <h1>Has More</h1>;
  }
  if (tweets == null || tweets.length == 0) {
    return <h1>No Tweets</h1>;
  }

  return (
    <ul>
      <InfiniteScroll
        dataLength={tweets.length}
        next={fetchNewTweets}
        hasMore={hasMore ?? false}
        loader={"isLoading.."}
      >
        {tweets.map((tweet) => {
          return <TweetCard key={tweet.id} {...tweet} />;
        })}
      </InfiniteScroll>
    </ul>
  );
}

function TweetCard({
  user,
  id,
  content,
  createdAt,
  likeCount,
  likedByMe,
}: Tweet) {
  const trpcUtils = api.useContext();
  const toggleLike = api.tweet.toggleLike.useMutation({
    onMutate: ({ tweetId }) => {
      trpcUtils.tweet.infinitefeed.setInfiniteData({}, (oldData) => {
        if (!oldData) return;

        const addedLike = !likedByMe;

        const countModifier = addedLike ? 1 : -1;

        return {
          ...oldData,
          pages: oldData.pages.map((page) => {
            return {
              ...page,
              tweets: page.tweets.map((tweet) => {
                if (tweet.id === tweetId) {
                  return {
                    ...tweet,
                    likeCount: tweet.likeCount + countModifier,
                    likedByMe: addedLike,
                  };
                }

                return tweet;
              }),
            };
          }),
        };
      });
    },
  });

  function handleToggleLike() {
    toggleLike.mutate({ tweetId: id });
  }

  dayjs.extend(relativeTime);

  return (
    <li className="flex gap-4 border-b px-4 py-4">
      <Link href={`/profiles/${user.id}`}>
        <ProfileImage src={user.image} />
      </Link>
      <div className="flex flex-grow flex-col">
        <div className="flex gap-1">
          <Link
            href={`/profiles/${user.id}`}
            className="font-bold hover:underline"
          >
            {user.name}
          </Link>
          <span className="">{dayjs(new Date(createdAt)).fromNow()}</span>
        </div>
        <p>{content}</p>
        <HeartButton
          onclick={handleToggleLike}
          isLoading={toggleLike.isLoading}
          likedByMe={likedByMe}
          LikeCount={likeCount}
        />
      </div>
    </li>
  );
}
type HeartButtonProps = {
  onclick: () => void;
  isLoading: boolean;
  likedByMe: boolean;
  LikeCount: number;
};

function HeartButton({
  isLoading,
  onclick,
  likedByMe,
  LikeCount,
}: HeartButtonProps) {
  const session = useSession();
  const HeartIcon = likedByMe ? VscHeartFilled : VscHeart;
  if (session.status === "authenticated") {
    return (
      <div className="flex items-center gap-x-1">
        <IconEffectsHover red>
          <button
            disabled={isLoading}
            onClick={onclick}
            className={`self-satrt trasition-colors duration:200 group flex items-center gap-1 ${
              likedByMe ? "text-red-500" : "text-gray-500 hover:text-red-500"
            }`}
          >
            <HeartIcon
              className={`transition-colors duration-200 ${
                likedByMe
                  ? "fill-red-500"
                  : "fill-gray-500 group-hover:fill-red-500 group-focus-visible:fill-red-500"
              }`}
            />
          </button>
        </IconEffectsHover>
        <span>{LikeCount}</span>
      </div>
    );
  }
}
