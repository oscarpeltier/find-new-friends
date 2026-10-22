"use client";

import dynamic from "next/dynamic";
import Link from "next/link";

const InteractiveMap = dynamic(() => import("./InteractiveMap"), {
  ssr: false,
  loading: () => <div className="events-map-loading" role="status">Chargement de la carte…</div>,
});

const navigation = [
  { href: "/accueil", icon: "⌂", label: "Accueil" },
  { href: "/evenements", icon: "⌖", label: "Carte" },
  { href: "/messages", icon: "☏", label: "Messages" },
  { href: "/amis", icon: "♧", label: "Mes amis" },
  { href: "/profil/creer/rencontres", icon: "◉", label: "Profil" },
  { href: "/parametres", icon: "⚙", label: "Réglages" },
];

export default function EventsMap() {
  return (
    <main className="events-page">
      <header className="events-header">
        <Link className="events-brand" href="/accueil">
          <span className="events-brand-mark" aria-hidden="true">⌖</span>
          Find New Friends
        </Link>
        <Link className="events-header-profile" href="/accueil">Retour à l’accueil</Link>
      </header>

      <section className="events-content" aria-labelledby="events-title">
        <div className="events-heading">
          <div>
            <span className="events-eyebrow">À TOI LES NOUVELLES RENCONTRES</span>
            <h1 id="events-title">Découvre les événements</h1>
            <p>Explore la carte et découvre les environs.</p>
          </div>
          <button className="events-create-button" type="button">＋ Créer un événement</button>
        </div>
        <div className="events-map-frame" aria-label="Carte OpenStreetMap interactive">
          <InteractiveMap />
          <div className="events-map-note"><span aria-hidden="true">⌖</span><div><strong>Explore la carte</strong><small>Déplace-la et zoome pour parcourir les environs</small></div></div>
        </div>
      </section>

      <nav className="events-nav" aria-label="Navigation principale">
        {navigation.map(({ href, icon, label }) => (
          <Link href={href} key={label} className={`events-nav-item ${label === "Carte" ? "is-active" : ""}`} aria-current={label === "Carte" ? "page" : undefined}>
            <span aria-hidden="true">{icon}</span><small>{label}</small>
          </Link>
        ))}
      </nav>
    </main>
  );
}
