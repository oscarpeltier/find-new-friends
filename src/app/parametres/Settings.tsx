"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Preferences = { notifications: boolean; friendRequests: boolean; messageAlerts: boolean; privateProfile: boolean; emailUpdates: boolean; theme: "light" | "dark" };
const STORAGE_KEY = "findfriends-settings-v1";
const defaults: Preferences = { notifications: true, friendRequests: true, messageAlerts: true, privateProfile: false, emailUpdates: false, theme: "light" };
const navigation = [
  { href: "/accueil", icon: "⌂", label: "Accueil" },
  { href: "/evenements", icon: "⌖", label: "Carte" },
  { href: "/messages", icon: "☏", label: "Messages" },
  { href: "/amis", icon: "♧", label: "Mes amis" },
  { href: "/profil/creer/rencontres", icon: "◉", label: "Profil" },
  { href: "/parametres", icon: "⚙", label: "Réglages" },
];

function Switch({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return <button className={`settings-switch ${checked ? "is-on" : ""}`} type="button" role="switch" aria-checked={checked} aria-label={label} onClick={onChange}><span /></button>;
}

export default function Settings() {
  const [preferences, setPreferences] = useState<Preferences>(defaults);
  const [name, setName] = useState("ami·e");
  const [email, setEmail] = useState("");
  const [saved, setSaved] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | "unsupported">("default");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const profile = JSON.parse(window.localStorage.getItem("findfriends-profile-personal") ?? "{}") as { firstName?: string; email?: string };
        const registration = JSON.parse(window.localStorage.getItem("findfriends-registration") ?? "{}") as { firstName?: string; email?: string };
        setName(profile.firstName || registration.firstName || "ami·e");
        setEmail(profile.email || registration.email || "");
        setNotificationPermission(typeof Notification === "undefined" ? "unsupported" : Notification.permission);
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored) setPreferences({ ...defaults, ...JSON.parse(stored) as Partial<Preferences> });
        document.documentElement.dataset.theme = stored && (JSON.parse(stored) as Partial<Preferences>).theme === "dark" ? "dark" : "light";
      } catch { /* Les réglages par défaut restent actifs si les données locales sont illisibles. */ }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  function update<K extends keyof Preferences>(key: K, value: Preferences[K]) {
    const next = { ...preferences, [key]: value };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event("findfriends-settings-updated"));
    setPreferences(next);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  }

  async function requestNotificationPermission() {
    if (typeof Notification === "undefined") {
      setNotificationPermission("unsupported");
      return;
    }
    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);
    if (permission === "granted") {
      try { new Notification("Notifications activées", { body: "Tu recevras les alertes Find New Friends sur cet appareil.", icon: "/favicon.ico" }); }
      catch { /* Les notifications de test peuvent être bloquées par le navigateur. */ }
    }
  }

  function clearLocalData() {
    const confirmed = window.confirm("Effacer les préférences enregistrées sur cet appareil ? Cette action ne peut pas être annulée.");
    if (!confirmed) return;
    window.localStorage.removeItem(STORAGE_KEY);
    document.documentElement.dataset.theme = "light";
    window.dispatchEvent(new Event("findfriends-settings-updated"));
    setPreferences(defaults);
    setSaved(false);
  }

  return (
    <main className="settings-page">
      <header className="settings-header"><Link className="settings-brand" href="/accueil"><span className="events-brand-mark" aria-hidden="true">♧</span>Find New Friends</Link><Link className="settings-home-link" href="/accueil">Retour à l’accueil</Link></header>
      <div className="settings-content">
        <div className="settings-hero"><div><span className="events-eyebrow">TON ESPACE, TES RÈGLES</span><h1>Réglages</h1><p>Tout ce qu’il faut pour que ton espace te ressemble.</p></div><span className="settings-hero-art" aria-hidden="true">⚙</span></div>
        <div className="settings-body">
          <aside className="settings-side-nav" aria-label="Sections des réglages"><strong>PRÉFÉRENCES</strong><a href="#account-title"><span>♙</span>Mon compte</a><a href="#notifications-title"><span>♧</span>Notifications</a><a href="#privacy-title"><span>◉</span>Confidentialité</a><a href="#appearance-title"><span>☼</span>Apparence</a><a href="#data-title"><span>⌫</span>Données</a><div className="settings-side-tip"><span>✦</span><p>Besoin d’aide ?<br /><small>Ton espace est là pour toi.</small></p></div></aside>
          <div className="settings-main">
        {saved && <p className="settings-saved" role="status"><span aria-hidden="true">✓</span> Tes préférences ont été enregistrées sur cet appareil.</p>}
        <section className="settings-card" aria-labelledby="account-title">
          <div className="settings-section-title"><span className="settings-icon">♙</span><div><h2 id="account-title">Mon compte</h2><p>Les informations de ton profil</p></div></div>
          <div className="settings-account-row"><span className="settings-avatar">{name.slice(0, 1).toUpperCase()}</span><div><strong>{name}</strong><small>{email || "Adresse e-mail non renseignée"}</small></div><Link href="/profil/creer/rencontres">Modifier mon profil <span aria-hidden="true">→</span></Link></div>
        </section>
        <section className="settings-card" aria-labelledby="notifications-title">
          <div className="settings-section-title"><span className="settings-icon">♧</span><div><h2 id="notifications-title">Notifications</h2><p>Choisis ce que tu souhaites voir</p></div></div>
          <div className="settings-options">
            <div className="settings-option"><div><strong>Notifications sur cet appareil</strong><small>{notificationPermission === "granted" ? "Autorisées dans ton navigateur" : notificationPermission === "denied" ? "Bloquées par le navigateur ; modifie l’autorisation dans ses réglages" : notificationPermission === "unsupported" ? "Ce navigateur ne prend pas en charge les notifications" : "Autorise les alertes pour les demandes d’amis et messages reçus"}</small></div><button className="settings-notification-button" type="button" onClick={() => void requestNotificationPermission()} disabled={notificationPermission === "granted" || notificationPermission === "unsupported"}>{notificationPermission === "granted" ? "Activées" : notificationPermission === "denied" ? "Bloquées" : "Autoriser"}</button></div>
            <div className="settings-option"><div><strong>Alertes dans l’application</strong><small>Activer ou couper l’ensemble des notifications</small></div><Switch checked={preferences.notifications} onChange={() => update("notifications", !preferences.notifications)} label="Activer les notifications" /></div>
            <div className="settings-option"><div><strong>Demandes d’amis</strong><small>Être informé·e lorsqu’une demande est reçue</small></div><Switch checked={preferences.friendRequests} onChange={() => update("friendRequests", !preferences.friendRequests)} label="Notifications de demandes d’amis" /></div>
            <div className="settings-option"><div><strong>Nouveaux messages</strong><small>Être informé·e des nouveaux messages</small></div><Switch checked={preferences.messageAlerts} onChange={() => update("messageAlerts", !preferences.messageAlerts)} label="Notifications de messages" /></div>
            <div className="settings-option"><div><strong>Actualités par e-mail</strong><small>Recevoir des conseils et nouveautés par e-mail</small></div><Switch checked={preferences.emailUpdates} onChange={() => update("emailUpdates", !preferences.emailUpdates)} label="Actualités par e-mail" /></div>
          </div>
        </section>
        <section className="settings-card" aria-labelledby="privacy-title">
          <div className="settings-section-title"><span className="settings-icon">◉</span><div><h2 id="privacy-title">Confidentialité</h2><p>Gère la visibilité de ton profil</p></div></div>
          <div className="settings-option"><div><strong>Profil privé</strong><small>Garder cette préférence enregistrée pour ton compte</small></div><Switch checked={preferences.privateProfile} onChange={() => update("privateProfile", !preferences.privateProfile)} label="Profil privé" /></div>
          <div className="settings-privacy-note">Ce réglage est mémorisé sur cet appareil. La visibilité réelle du profil nécessite encore un compte et un serveur.</div>
        </section>
        <section className="settings-card" aria-labelledby="appearance-title">
          <div className="settings-section-title"><span className="settings-icon">☼</span><div><h2 id="appearance-title">Apparence</h2><p>Choisis le thème de l’application</p></div></div>
          <div className="settings-theme-options"><button type="button" className={`settings-theme ${preferences.theme === "light" ? "is-selected" : ""}`} onClick={() => update("theme", "light")}><span className="settings-theme-preview light-preview">☀</span><strong>Clair</strong></button><button type="button" className={`settings-theme ${preferences.theme === "dark" ? "is-selected" : ""}`} onClick={() => update("theme", "dark")}><span className="settings-theme-preview dark-preview">☾</span><strong>Sombre</strong></button></div><p className="settings-privacy-note">Le thème choisi est appliqué aux pages compatibles de l’application sur cet appareil.</p>
        </section>
        <section className="settings-card settings-danger-card" aria-labelledby="data-title">
          <div className="settings-section-title"><span className="settings-icon">⌫</span><div><h2 id="data-title">Données de démonstration</h2><p>Préférences conservées uniquement sur cet appareil</p></div></div>
          <button className="settings-reset-button" type="button" onClick={clearLocalData}>Réinitialiser mes préférences</button>
        </section>
        <p className="settings-demo-note">Mode démo : ces réglages sont stockés dans ce navigateur. Ils ne sont pas synchronisés avec un compte ou un serveur.</p>
          </div>
        </div>
      </div>
      <nav className="events-nav" aria-label="Navigation principale">{navigation.map(({ href, icon, label }) => <Link href={href} key={label} className={`events-nav-item ${label === "Réglages" ? "is-active" : ""}`} aria-current={label === "Réglages" ? "page" : undefined}><span aria-hidden="true">{icon}</span><small>{label}</small></Link>)}</nav>
    </main>
  );
}
