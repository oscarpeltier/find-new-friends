"use client";

import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useMemo, useState, type FormEvent } from "react";

type FriendRequest = { id: string; name: string; code: string; createdAt: string };
type Friend = { id: string; name: string; code: string; addedAt: string };
type LocalFriendsData = { inviteCode: string; requests: FriendRequest[]; friends: Friend[]; usedCodes: string[] };

const STORAGE_KEY = "findfriends-local-friends-v1";
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const navItems = [
  { href: "/accueil", icon: "⌂", label: "Accueil" },
  { href: "/evenements", icon: "⌖", label: "Carte" },
  { href: "/messages", icon: "☏", label: "Messages" },
  { href: "/amis", icon: "♧", label: "Mes amis" },
  { href: "/profil/creer/rencontres", icon: "◉", label: "Profil" },
];

function generateInviteCode() {
  const bytes = new Uint8Array(7);
  if (typeof window !== "undefined" && window.crypto?.getRandomValues) window.crypto.getRandomValues(bytes);
  else bytes.forEach((_, index) => { bytes[index] = Math.floor(Math.random() * 256); });
  return Array.from(bytes, (byte) => CODE_ALPHABET[byte % CODE_ALPHABET.length]).join("");
}

function readProfileName() {
  try {
    const personal = JSON.parse(window.localStorage.getItem("findfriends-profile-personal") ?? "{}") as { firstName?: string };
    const registration = JSON.parse(window.localStorage.getItem("findfriends-registration") ?? "{}") as { firstName?: string };
    return personal.firstName || registration.firstName || "Mon profil";
  } catch {
    return "Mon profil";
  }
}

function loadData(): LocalFriendsData {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const value = JSON.parse(saved) as Partial<LocalFriendsData>;
      return {
        inviteCode: value.inviteCode || generateInviteCode(),
        requests: Array.isArray(value.requests) ? value.requests : [],
        friends: Array.isArray(value.friends) ? value.friends : [],
        usedCodes: Array.isArray(value.usedCodes) ? value.usedCodes : [],
      };
    }
  } catch {
    // Les données locales sont recréées si elles sont absentes ou illisibles.
  }
  const initial = { inviteCode: generateInviteCode(), requests: [], friends: [], usedCodes: [] };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  return initial;
}

export default function AddFriends() {
  const [data, setData] = useState<LocalFriendsData>({ inviteCode: "------", requests: [], friends: [], usedCodes: [] });
  const [profileName, setProfileName] = useState("Mon profil");
  const [friendCode, setFriendCode] = useState("");
  const [message, setMessage] = useState("");
  const [messageError, setMessageError] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setProfileName(readProfileName());
      setData(loadData());
      const inviteFromQr = new URLSearchParams(window.location.search).get("invite");
      if (inviteFromQr) setFriendCode(inviteFromQr.toUpperCase().replace(/[^A-HJ-NP-Z2-9]/g, "").slice(0, 7));
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const qrUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/amis?invite=${encodeURIComponent(data.inviteCode)}`;
  }, [data.inviteCode]);

  function save(next: LocalFriendsData) {
    setData(next);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event("findfriends-friends-updated"));
  }

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(data.inviteCode);
      setCopied(true);
      setMessage("Ton code a été copié.");
      setMessageError(false);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setMessage("La copie automatique n’est pas disponible. Sélectionne le code pour le copier.");
      setMessageError(true);
    }
  }

  function regenerateCode() {
    let nextCode = generateInviteCode();
    while (nextCode === data.inviteCode || data.usedCodes.includes(nextCode)) nextCode = generateInviteCode();
    save({ ...data, inviteCode: nextCode });
    setMessage("Un nouveau code d’invitation est prêt.");
    setMessageError(false);
  }

  function sendRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const code = friendCode.trim().toUpperCase();
    setMessage("");
    if (!/^[A-HJ-NP-Z2-9]{7}$/.test(code)) {
      setMessage("Saisis un code d’invitation valide de 7 caractères.");
      setMessageError(true);
      return;
    }
    if (code === data.inviteCode) {
      setMessage("Tu ne peux pas t’ajouter toi-même.");
      setMessageError(true);
      return;
    }
    if (data.usedCodes.includes(code)) {
      setMessage("Ce code a déjà été utilisé.");
      setMessageError(true);
      return;
    }
    const nextRequest = { id: `${Date.now()}`, name: `Profil associé à ${code}`, code, createdAt: new Date().toISOString() };
    save({ ...data, requests: [...data.requests, nextRequest], usedCodes: [...data.usedCodes, code] });
    setFriendCode("");
    setMessage("Ta demande d’ami a bien été envoyée ! (Démo locale : elle est visible ici.)");
    setMessageError(false);
  }

  function acceptRequest(request: FriendRequest) {
    if (data.friends.some((friend) => friend.code === request.code)) {
      save({ ...data, requests: data.requests.filter((item) => item.id !== request.id) });
      return;
    }
    save({
      ...data,
      requests: data.requests.filter((item) => item.id !== request.id),
      friends: [...data.friends, { id: request.id, name: request.name, code: request.code, addedAt: new Date().toISOString() }],
    });
  }

  function declineRequest(request: FriendRequest) {
    save({ ...data, requests: data.requests.filter((item) => item.id !== request.id) });
  }

  const scanInvite = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("invite") : null;

  return (
    <main className="friends-page">
      <header className="friends-header">
        <Link className="friends-brand" href="/accueil"><span className="events-brand-mark" aria-hidden="true">♧</span>Find New Friends</Link>
        <span className="friends-profile-label">Bonjour, {profileName}</span>
      </header>

      <section className="friends-content" aria-labelledby="friends-title">
        <div className="friends-heading"><span className="events-eyebrow">FAIS GRANDIR TON CERCLE</span><h1 id="friends-title">Ajouter des amis</h1><p>Partage ton QR code ou ton code d’invitation pour retrouver tes amis !</p></div>

        {scanInvite && <div className="friends-notice">Code reçu par QR : <strong>{scanInvite}</strong>. Vérifie le code et sélectionne « Ajouter cet ami » pour simuler l’envoi d’une demande.</div>}

        <section className="friends-share-card" aria-label="Partager mon QR code et mon code d’invitation">
          <div className="friends-qr-panel">
            <div className="friends-qr-frame"><QRCodeSVG value={qrUrl || `https://findnewfriends.local/amis?invite=${data.inviteCode}`} size={208} level="H" includeMargin /></div>
            <strong>Ton QR code personnel</strong>
            <p>Un ami peut scanner ce code pour retrouver ton invitation.</p>
          </div>
          <div className="friends-invite-panel">
            <span className="events-eyebrow">TON CODE À PARTAGER</span>
            <strong className="friends-invite-code">{data.inviteCode}</strong>
            <button className="submit-button friends-copy-button" type="button" onClick={() => void copyCode()}>{copied ? "Code copié !" : "Copier mon code"}</button>
            <button className="friends-secondary-button" type="button" onClick={regenerateCode}>Générer un nouveau code</button>
            <small>Un code est marqué comme utilisé lorsqu’une demande est créée depuis cette démo locale.</small>
          </div>
        </section>

        <section className="friends-enter-card" aria-labelledby="friend-code-title">
          <div><span className="events-eyebrow">TU AS REÇU UN CODE ?</span><h2 id="friend-code-title">Ajouter avec un code</h2><p>Entre le code d’invitation de ton ami pour lui envoyer une demande.</p></div>
          <form className="friends-code-form" onSubmit={sendRequest}>
            <label className="sr-only" htmlFor="friend-invite-code">Entrer le code d’un ami</label>
            <input id="friend-invite-code" value={friendCode} onChange={(change) => setFriendCode(change.target.value.toUpperCase().replace(/[^A-HJ-NP-Z2-9]/g, "").slice(0, 7))} placeholder="Ex. AB7K92Q" autoComplete="off" maxLength={7} />
            <button className="submit-button" type="submit">Ajouter cet ami <span aria-hidden="true">→</span></button>
          </form>
          {message && <p className={messageError ? "friends-feedback is-error" : "friends-feedback"} role={messageError ? "alert" : "status"}>{message}</p>}
        </section>

        <section className="friends-requests-section" aria-labelledby="requests-title">
          <div className="friends-section-heading"><div><span className="events-eyebrow">À TRAITER</span><h2 id="requests-title">Demandes d’amis reçues</h2></div><span className="friends-count">{data.requests.length}</span></div>
          {data.requests.length ? <div className="friends-list">{data.requests.map((request) => <article className="friends-list-card" key={request.id}><span className="friends-avatar">{request.name.slice(0, 1).toUpperCase()}</span><div className="friends-list-copy"><strong>{request.name}</strong><small>Code {request.code}</small></div><button type="button" className="friends-accept-button" onClick={() => acceptRequest(request)}>Accepter</button><button type="button" className="friends-decline-button" onClick={() => declineRequest(request)}>Refuser</button></article>)}</div> : <p className="friends-empty">Aucune demande reçue pour le moment.</p>}
        </section>

        <section className="friends-requests-section" aria-labelledby="friends-list-title">
          <div className="friends-section-heading"><div><span className="events-eyebrow">TON CERCLE</span><h2 id="friends-list-title">Mes amis</h2></div><span className="friends-count">{data.friends.length}</span></div>
          {data.friends.length ? <div className="friends-list">{data.friends.map((friend) => <article className="friends-list-card" key={friend.id}><span className="friends-avatar">{friend.name.slice(0, 1).toUpperCase()}</span><div className="friends-list-copy"><strong>{friend.name}</strong><small>Code {friend.code}</small></div></article>)}</div> : <p className="friends-empty">Tes amis acceptés apparaîtront ici.</p>}
        </section>
      </section>

      <nav className="events-nav" aria-label="Navigation principale">{navItems.map(({ href, icon, label }) => <Link href={href} key={label} className={`events-nav-item ${label === "Mes amis" ? "is-active" : ""}`} aria-current={label === "Mes amis" ? "page" : undefined}><span aria-hidden="true">{icon}</span><small>{label}</small></Link>)}</nav>
      <p className="friends-demo-note">Mode démo : les invitations et demandes sont stockées uniquement dans ce navigateur. Les autres utilisateurs ne les reçoivent pas réellement.</p>
    </main>
  );
}
