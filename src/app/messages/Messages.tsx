"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";

type ChatMessage = { id: string; text: string; fromMe: boolean; sentAt: string; read: boolean };
type Conversation = { id: string; name: string; photo: string; messages: ChatMessage[] };
const STORAGE_KEY = "findfriends-local-messages-v1";
const FRIENDS_KEY = "findfriends-local-friends-v1";
const navItems = [
  { href: "/accueil", icon: "⌂", label: "Accueil" },
  { href: "/evenements", icon: "⌖", label: "Carte" },
  { href: "/messages", icon: "☏", label: "Messages" },
  { href: "/amis", icon: "♧", label: "Mes amis" },
  { href: "/profil/creer/rencontres", icon: "◉", label: "Profil" },
];

function loadConversations(): Conversation[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Conversation[];
  } catch { /* Récupération des données locales illisibles. */ }
  return [];
}

function getFriendList(): Array<{ id: string; name: string }> {
  try {
    const saved = JSON.parse(window.localStorage.getItem(FRIENDS_KEY) ?? "{}") as { friends?: Array<{ id: string; name: string; code?: string }> };
    return (saved.friends ?? []).map((friend) => ({ id: friend.id || friend.code || friend.name, name: friend.name }));
  } catch { return []; }
}

function formatTime(value?: string) {
  if (!value) return "";
  return new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

export default function Messages() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [friends, setFriends] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState("");
  const [ready, setReady] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const saved = loadConversations();
      const friendList = getFriendList();
      setFriends(friendList);
      const merged = [...saved];
      friendList.forEach((friend) => {
        if (!merged.some((conversation) => conversation.id === friend.id)) {
          merged.push({ id: friend.id, name: friend.name, photo: "", messages: [] });
        }
      });
      setConversations(merged);
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (ready) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
      window.dispatchEvent(new Event("findfriends-messages-updated"));
    }
  }, [conversations, ready]);

  const selected = conversations.find((conversation) => conversation.id === selectedId) ?? null;
  const sorted = useMemo(() => [...conversations].sort((a, b) => {
    const aTime = a.messages.at(-1)?.sentAt ?? "";
    const bTime = b.messages.at(-1)?.sentAt ?? "";
    return bTime.localeCompare(aTime);
  }), [conversations]);
  const filtered = sorted.filter((conversation) => conversation.name.toLowerCase().includes(search.trim().toLowerCase()));
  const unreadTotal = conversations.reduce((sum, conversation) => sum + conversation.messages.filter((message) => !message.fromMe && !message.read).length, 0);

  function openConversation(conversationId: string) {
    setSelectedId(conversationId);
    setConversations((current) => current.map((conversation) => conversation.id === conversationId
      ? { ...conversation, messages: conversation.messages.map((message) => message.fromMe ? message : { ...message, read: true }) }
      : conversation));
    window.setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 0);
  }

  function startConversation(friendId: string) {
    const friend = friends.find((item) => item.id === friendId);
    if (!friend) return;
    setConversations((current) => current.some((conversation) => conversation.id === friend.id) ? current : [...current, { id: friend.id, name: friend.name, photo: "", messages: [] }]);
    openConversation(friend.id);
  }

  function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = draft.trim();
    if (!text || !selected || !friends.some((friend) => friend.id === selected.id)) return;
    const message: ChatMessage = { id: crypto.randomUUID(), text, fromMe: true, sentAt: new Date().toISOString(), read: true };
    setConversations((current) => current.map((conversation) => conversation.id === selected.id ? { ...conversation, messages: [...conversation.messages, message] } : conversation));
    setDraft("");
    window.setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 0);
  }

  return (
    <main className="messages-page">
      <header className="messages-header">
        <Link className="messages-brand" href="/accueil"><span className="events-brand-mark" aria-hidden="true">♧</span>Find New Friends</Link>
        <Link className="messages-back-home" href="/accueil">Retour à l’accueil</Link>
      </header>
      <section className={`messages-layout ${selected ? "has-selection" : ""}`} aria-label="Messagerie">
        <aside className="messages-sidebar">
          <div className="messages-list-heading"><div><span className="events-eyebrow">TON CERCLE</span><h1>Mes messages {unreadTotal > 0 && <span className="messages-unread-total">{unreadTotal}</span>}</h1></div><Link className="messages-new-button" href="/amis" aria-label="Ajouter un ami">＋</Link></div>
          <label className="messages-search"><span aria-hidden="true">⌕</span><span className="sr-only">Rechercher une conversation</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher une conversation" /></label>
          <div className="messages-conversation-list" aria-label="Conversations">
            {!ready ? <p className="messages-empty">Chargement des conversations…</p> : filtered.length ? filtered.map((conversation) => {
              const last = conversation.messages.at(-1);
              const unread = conversation.messages.some((message) => !message.fromMe && !message.read);
              return <button className={`messages-conversation ${selectedId === conversation.id ? "is-selected" : ""}`} type="button" key={conversation.id} onClick={() => openConversation(conversation.id)}>
                <span className="messages-avatar">{conversation.photo ? <img src={conversation.photo} alt="" /> : conversation.name.slice(0, 1).toUpperCase()}</span>
                <span className="messages-conversation-copy"><strong>{conversation.name}</strong><span>{last ? `${last.fromMe ? "Toi : " : ""}${last.text}` : "Commencez à discuter"}</span></span>
                <span className="messages-conversation-meta">{last && <time>{formatTime(last.sentAt)}</time>}{unread && <i aria-label="Message non lu" />}</span>
              </button>;
            }) : <p className="messages-empty">{friends.length ? "Aucune conversation ne correspond à ta recherche." : "Tu n’as pas encore d’ami à qui écrire. Ajoute des amis pour démarrer une conversation."}</p>}
          </div>
          {!friends.length && <Link className="submit-button messages-add-friends" href="/amis">Ajouter des amis <span aria-hidden="true">→</span></Link>}
        </aside>
        <section className="messages-chat" aria-label={selected ? `Conversation avec ${selected.name}` : "Discussion"}>
          {selected ? <>
            <header className="messages-chat-header"><button type="button" className="messages-mobile-back" onClick={() => setSelectedId(null)} aria-label="Retour aux conversations">←</button><span className="messages-avatar messages-chat-avatar">{selected.photo ? <img src={selected.photo} alt="" /> : selected.name.slice(0, 1).toUpperCase()}<i aria-label="Ami" /></span><div><strong>{selected.name}</strong><small><i /> Ami dans ton cercle</small></div><span className="messages-chat-header-mark" aria-hidden="true">✦</span></header>
            <div className="messages-history">
              <div className="messages-chat-intro"><span>✦</span><strong>Votre espace à deux</strong><small>Une conversation avec {selected.name}</small></div>
              {selected.messages.length ? <>{selected.messages.map((message, index) => <div className={`messages-bubble-row ${message.fromMe ? "from-me" : "from-friend"}`} key={message.id}><div className="messages-bubble"><p>{message.text}</p><time>{formatTime(message.sentAt)}{message.fromMe && index === selected.messages.length - 1 ? " · Envoyé" : ""}</time></div></div>)}<div ref={bottomRef} /></> : <div className="messages-welcome"><span>✦</span><strong>Les belles amitiés commencent par un bonjour</strong><p>Envoie un petit message à {selected.name} pour commencer votre conversation.</p></div>}
            </div>
            <form className="messages-compose" onSubmit={sendMessage}><label className="sr-only" htmlFor="message-draft">Écrire un message</label><span className="messages-compose-sparkle" aria-hidden="true">✦</span><input id="message-draft" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder={`Écrire à ${selected.name}…`} maxLength={2000} /><button className="submit-button" type="submit" disabled={!draft.trim()} aria-label="Envoyer le message"><span>Envoyer</span><span aria-hidden="true">➤</span></button></form>
          </> : <div className="messages-chat-placeholder"><span>✉</span><h2>Choisis une conversation</h2><p>Sélectionne un ami dans la liste pour afficher vos messages.</p>{friends.length > 0 && <div className="messages-friend-shortcuts"><strong>Commencer une conversation</strong>{friends.map((friend) => <button type="button" key={friend.id} onClick={() => startConversation(friend.id)}><span className="messages-avatar">{friend.name.slice(0, 1).toUpperCase()}</span>{friend.name}<span aria-hidden="true">→</span></button>)}</div>}</div>}
        </section>
      </section>
      <nav className="events-nav" aria-label="Navigation principale">{navItems.map(({ href, icon, label }) => <Link href={href} key={label} className={`events-nav-item ${label === "Messages" ? "is-active" : ""}`} aria-current={label === "Messages" ? "page" : undefined}><span aria-hidden="true">{icon}</span><small>{label}{label === "Messages" && unreadTotal > 0 ? ` · ${unreadTotal}` : ""}</small></Link>)}</nav>
      <p className="messages-demo-note">Mode démo : messages et conversations enregistrés dans ce navigateur uniquement. Ils ne sont pas transmis à tes amis. La messagerie réelle nécessitera un serveur avec authentification et stockage sécurisé.</p>
    </main>
  );
}
