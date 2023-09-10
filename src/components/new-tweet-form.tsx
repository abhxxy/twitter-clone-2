import { useSession } from "next-auth/react";
import { Button } from "./custom-button";
import { ProfileImage } from "./profile-image";
import {
  FormEvent,
  use,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { api } from "@/utils/api";

function updateTextAreaSize(textArea?: HTMLTextAreaElement) {
  if (textArea == null) return null;
  textArea.style.height = "0";
  textArea.style.height = `${textArea.scrollHeight}px`;
}

export function Form() {
  const session = useSession();
  const [inputValue, setInputValue] = useState("");
  const textAreaRef = useRef<HTMLTextAreaElement>();
  const inputRef = useCallback((textArea: HTMLTextAreaElement) => {
    updateTextAreaSize(textArea);
    textAreaRef.current = textArea;
  }, []);

  useLayoutEffect(() => {
    updateTextAreaSize(textAreaRef.current);
  }, [inputValue]);

  const createTweet = api.tweet.create.useMutation({
    onSuccess: (newTweet) => {
      console.log(newTweet);
      setInputValue("");
    },
  });
  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    createTweet.mutate({ content: inputValue });
  }
  if (session.status !== "authenticated") return null;
  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 border-b py-2">
      <div className="flex gap-4">
        <ProfileImage src={session.data.user.image} />
        <textarea
          ref={inputRef}
          style={{ height: 0 }}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="overflowhidden flex-grow resize-none p-4 text-lg outline-none"
          placeholder="what's happening?"
        />
      </div>
      <Button className="self-end text-white">Tweet </Button>
    </form>
  );
}

export function NewTweetForm() {
  const session = useSession();
  if (session.status !== "authenticated") return null;
  return <Form />;
}
