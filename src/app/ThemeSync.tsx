"use client";

import { useEffect } from "react";

type Preferences = { theme?: string; notifications?: boolean; messageAlerts?: boolean; friendRequests?: boolean };
type StoredMessage = { id?: string; fromMe?: boolean; read?: boolean; text?: string };
type Conversation = { name?: string; messages?: StoredMessage[] };
type FriendData = { requests?: Array<{ id?: string; name?: string }> };

const SETTINGS_KEY = "findfriends-settings-v1";
const MESSAGES_KEY = "findfriends-local-messages-v1";
const FRIENDS_KEY = "findfriends-local-friends-v1";

function readSettings(): Preferences {
  try { return JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? "{}") as Preferences; }
  catch { return {}; }
}

export default function ThemeSync() {
  useEffect(() => {
    function applyTheme() {
      document.documentElement.dataset.theme = readSettings().theme === "dark" ? "dark" : "light";
    }
    function notify(title: string, body: string, tag: string) {
      if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
      try { new Notification(title, { body, tag, icon: "/favicon.ico" }); }
      catch { /* Notifications indisponibles dans ce navigateur. */ }
    }
    function onStorage(event: StorageEvent) {
      applyTheme();
      const settings = readSettings();
      if (!settings.notifications || typeof Notification === "undefined" || Notification.permission !== "granted") return;
      if (event.key === MESSAGES_KEY && settings.messageAlerts && event.newValue) {
        try {
          const conversations = JSON.parse(event.newValue) as Conversation[];
          for (const conversation of conversations) {
            const incoming = conversation.messages?.filter((message) => !message.fromMe && !message.read) ?? [];
            const last = incoming.at(-1);
            if (last) notify(`Message de ${conversation.name ?? "ton ami"}`, last.text ?? "Tu as reçu un nouveau message.", `message-${last.id ?? conversation.name}`);
          }
        } catch { /* Ignore les messages locaux mal formés. */ }
      }
      if (event.key === FRIENDS_KEY && settings.friendRequests && event.newValue) {
        try {
          const previous = JSON.parse(event.oldValue ?? "{}") as FriendData;
          const next = JSON.parse(event.newValue) as FriendData;
          const oldIds = new Set((previous.requests ?? []).map((request) => request.id));
          const request = (next.requests ?? []).find((item) => !oldIds.has(item.id));
          if (request) notify("Nouvelle demande d’ami", `${request.name ?? "Quelqu’un"} souhaite rejoindre ton cercle.`, `friend-${request.id ?? Date.now()}`);
        } catch { /* Ignore les demandes locales mal formées. */ }
      }
    }
    function onSettingsUpdated() { applyTheme(); }
    applyTheme();
    window.addEventListener("storage", onStorage);
    window.addEventListener("findfriends-settings-updated", onSettingsUpdated);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("findfriends-settings-updated", onSettingsUpdated);
    };
  }, []);

  return null;
}
