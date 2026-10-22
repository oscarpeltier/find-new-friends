import type { Metadata } from "next";
import Messages from "./Messages";

export const metadata: Metadata = {
  title: "Messages — Find New Friends",
  description: "Retrouve tes conversations avec tes amis.",
};

export default function MessagesPage() {
  return <Messages />;
}
