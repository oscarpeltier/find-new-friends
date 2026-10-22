"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useState, type FormEvent } from "react";

type AddressSuggestion = { label: string; lat: number; lon: number };
type StoredEvent = { id: string; name: string; date: string; time: string; location: string; latitude: number; longitude: number; description: string; category: string };

const InteractiveMap = dynamic(() => import("./InteractiveMap"), {
  ssr: false,
  loading: () => <div className="events-map-loading" role="status">Chargement de la carte…</div>,
});

const eventCategories = [
  { name: "Sport", emoji: "⚽" }, { name: "Jeux vidéo", emoji: "🎮" },
  { name: "Cinéma", emoji: "🎬" }, { name: "Musique", emoji: "🎵" },
  { name: "Restaurant", emoji: "🍽️" }, { name: "Sorties et soirées", emoji: "🎉" },
  { name: "Culture", emoji: "🎨" }, { name: "Nature et randonnée", emoji: "🌿" },
  { name: "Voyages", emoji: "✈️" }, { name: "Jeux de société", emoji: "🎲" },
  { name: "Lecture", emoji: "📚" }, { name: "Autres activités", emoji: "✨" },
];

const navigation = [
  { href: "/accueil", icon: "⌂", label: "Accueil" },
  { href: "/evenements", icon: "⌖", label: "Carte" },
  { href: "/messages", icon: "☏", label: "Messages" },
  { href: "/amis", icon: "♧", label: "Mes amis" },
  { href: "/profil/creer/rencontres", icon: "◉", label: "Profil" },
  { href: "/parametres", icon: "⚙", label: "Réglages" },
];

export default function EventsMap() {
  const [showForm, setShowForm] = useState(false);
  const [addressQuery, setAddressQuery] = useState("");
  const [selectedAddress, setSelectedAddress] = useState<AddressSuggestion | null>(null);
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function searchAddress() {
    if (addressQuery.trim().length < 3) {
      setSuggestions([]);
      return;
    }
    setSearching(true);
    setError("");
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=5&accept-language=fr&q=${encodeURIComponent(addressQuery.trim())}`);
      if (!response.ok) throw new Error();
      const results = await response.json() as Array<{ display_name: string; lat: string; lon: string }>;
      setSuggestions(results.map((item) => ({ label: item.display_name, lat: Number(item.lat), lon: Number(item.lon) })));
      if (!results.length) setError("Aucune adresse trouvée. Essaie avec une adresse plus précise.");
    } catch {
      setError("La recherche d’adresse est indisponible pour le moment.");
    } finally {
      setSearching(false);
    }
  }

  function publishEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedAddress) {
      setError("Choisis une adresse dans les suggestions pour placer l’épingle.");
      return;
    }
    const form = event.currentTarget;
    const data = new FormData(form);
    const newEvent: StoredEvent = {
      id: `${Date.now()}`,
      name: String(data.get("eventName") ?? "").trim(),
      date: String(data.get("eventDate") ?? ""),
      time: String(data.get("eventTime") ?? ""),
      location: selectedAddress.label,
      latitude: selectedAddress.lat,
      longitude: selectedAddress.lon,
      description: String(data.get("eventDescription") ?? "").trim(),
      category: String(data.get("eventCategory") ?? ""),
    };
    if (!newEvent.category) {
      setError("Choisis un type d’événement.");
      return;
    }
    setSaving(true);
    try {
      const previous = JSON.parse(window.localStorage.getItem("findfriends-profile-activities") ?? "[]") as StoredEvent[];
      const updated = [...previous, newEvent].sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`));
      window.localStorage.setItem("findfriends-profile-activities", JSON.stringify(updated));
      window.dispatchEvent(new Event("findfriends-activities-updated"));
      form.reset();
      setAddressQuery("");
      setSelectedAddress(null);
      setSuggestions([]);
      setError("");
      setShowForm(false);
    } catch {
      setError("Impossible d’enregistrer l’événement sur cet appareil.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="events-page">
      <header className="events-header">
        <Link className="events-brand" href="/accueil"><span className="events-brand-mark" aria-hidden="true">⌖</span>Find New Friends</Link>
        <Link className="events-header-profile" href="/accueil">Retour à l’accueil</Link>
      </header>

      <section className="events-content" aria-labelledby="events-title">
        <div className="events-heading">
          <div><span className="events-eyebrow">À TOI LES NOUVELLES RENCONTRES</span><h1 id="events-title">Découvre les événements</h1><p>Explore la carte et découvre les environs.</p></div>
          <button className="events-create-button" type="button" onClick={() => { setShowForm(true); setError(""); }}>＋ Créer un événement</button>
        </div>
        <div className="events-map-frame" aria-label="Carte OpenStreetMap interactive">
          <InteractiveMap />
          <div className="events-map-note"><span aria-hidden="true">⌖</span><div><strong>Explore la carte</strong><small>Déplace-la et zoome pour parcourir les environs</small></div></div>
        </div>
      </section>

      {showForm && <div className="events-modal-backdrop" role="presentation" onMouseDown={(click) => { if (click.target === click.currentTarget) setShowForm(false); }}>
        <section className="events-create-modal" role="dialog" aria-modal="true" aria-labelledby="events-form-title">
          <button className="events-modal-close" type="button" aria-label="Fermer" onClick={() => setShowForm(false)}>×</button>
          <span className="events-eyebrow">PARTAGE UNE SORTIE</span>
          <h2 id="events-form-title">Créer un événement</h2>
          <p className="events-modal-intro">Renseigne les détails, puis choisis une adresse pour placer son épingle sur la carte.</p>
          <form className="events-create-form" onSubmit={publishEvent}>
            {error && <p className="registration-error" role="alert">{error}</p>}
            <label>Nom de l’événement<input name="eventName" required maxLength={80} placeholder="Ex. : Café entre amis" /></label>
            <div className="events-form-row"><label>Date<input name="eventDate" type="date" required min={new Date().toISOString().slice(0, 10)} /></label><label>Heure<input name="eventTime" type="time" required /></label></div>
            <label>Description<textarea name="eventDescription" rows={3} maxLength={1000} placeholder="Décris ton événement…" /></label>
            <fieldset className="events-category-fieldset"><legend>Type d’événement</legend><div className="events-category-grid">{eventCategories.map(({ name, emoji }) => <label className="events-category-option" key={name}><input type="radio" name="eventCategory" value={name} required /><span aria-hidden="true">{emoji}</span><span>{name}</span></label>)}</div></fieldset>
            <div className="events-address-field"><label htmlFor="map-event-address">Lieu de l’événement</label><div className="events-address-search"><input id="map-event-address" value={addressQuery} required autoComplete="off" placeholder="Saisis une adresse ou un lieu" onChange={(change) => { setAddressQuery(change.target.value); setSelectedAddress(null); setSuggestions([]); }} /><button type="button" onClick={() => void searchAddress()} disabled={searching || addressQuery.trim().length < 3}>{searching ? "…" : "Rechercher"}</button></div>
              {suggestions.length > 0 && <ul className="events-address-results">{suggestions.map((item) => <li key={`${item.lat}-${item.lon}`}><button type="button" onClick={() => { setSelectedAddress(item); setAddressQuery(item.label); setSuggestions([]); setError(""); }}>{item.label}</button></li>)}</ul>}
              {selectedAddress && <small className="events-address-selected">Adresse sélectionnée : l’épingle sera placée ici.</small>}
            </div>
            <button className="submit-button" type="submit" disabled={saving}>{saving ? "Publication…" : "Publier mon événement"} <span aria-hidden="true">→</span></button>
            <small className="events-storage-note">Événement enregistré sur cet appareil.</small>
          </form>
        </section>
      </div>}

      <nav className="events-nav" aria-label="Navigation principale">{navigation.map(({ href, icon, label }) => <Link href={href} key={label} className={`events-nav-item ${label === "Carte" ? "is-active" : ""}`} aria-current={label === "Carte" ? "page" : undefined}><span aria-hidden="true">{icon}</span><small>{label}</small></Link>)}</nav>
    </main>
  );
}
