import type { Metadata } from "next";
import Settings from "./Settings";

export const metadata: Metadata = {
  title: "Réglages — Find New Friends",
  description: "Gère les préférences de ton compte Find New Friends.",
};

export default function SettingsPage() {
  return <Settings />;
}
