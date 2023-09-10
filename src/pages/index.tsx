import type { NextPage } from "next";

import { NewTweetForm } from "@/components/new-tweet-form";
import { InfiniteTweetList } from "@/components/InfiniteTweetList";
import { api } from "@/utils/api";
import { useSession } from "next-auth/react";
import { useState } from "react";

const Home: NextPage = () => {
  const TABS = ["Recent", "Following"] as const;
  const session = useSession();
  const [selectedTab, setSelectedTab] =
    useState<(typeof TABS)[number]>("Recent");
  return (
    <div>
      <header className="sticky top-0 z-10 border-b bg-white ">
        <h1 className="mb-2 px-4 text-lg font-bold">home</h1>
        {session.status === "authenticated" && (
          <div className="flex">
            {TABS.map((tab) => {
              return (
                <button
                  key={tab}
                  className={`flex-grow p-2 hover:bg-gray-200 ${
                    tab === selectedTab
                      ? "border-b-4 border-b-blue-500 font-bold"
                      : ""
                  }`}
                  onClick={() => setSelectedTab(tab)}
                >
                  {tab}
                </button>
              );
            })}
            )
          </div>
        )}
      </header>
      <NewTweetForm />
      {selectedTab === "Recent" ? <RecentTweets /> : <FollowingTweet />}
    </div>
  );
};
function RecentTweets() {
  const tweets = api.tweet.infinitefeed.useInfiniteQuery(
    {},
    { getNextPageParam: (lastPage) => lastPage.nextCursor },
  );

  return (
    <InfiniteTweetList
      tweets={tweets.data?.pages.flatMap((page) => page.tweets).flat()}
      isError={tweets.isError}
      isLoading={tweets.isLoading}
      hasMore={tweets.hasNextPage}
      fetchNewTweets={tweets.fetchNextPage}
    />
  );
}

function FollowingTweet() {
  const tweets = api.tweet.infinitefeed.useInfiniteQuery(
    { onlyFollowing: true },
    { getNextPageParam: (lastPage) => lastPage.nextCursor },
  );

  return (
    <InfiniteTweetList
      tweets={tweets.data?.pages.flatMap((page) => page.tweets).flat()}
      isError={tweets.isError}
      isLoading={tweets.isLoading}
      hasMore={tweets.hasNextPage}
      fetchNewTweets={tweets.fetchNextPage}
    />
  );
}

export default Home;
