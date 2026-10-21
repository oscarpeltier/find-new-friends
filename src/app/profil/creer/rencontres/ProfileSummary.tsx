"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Registration = { firstName?: string; birthDate?: string };
type PersonalInfo = {
  firstName?: string;
  age?: number;
  city?: string;
  gender?: string;
  occupation?: string;
  languages?: string[];
};
type Description = { description?: string };

const passionEmojis: Record<string, string> = {
  Sport: "⚽", "Sorties et soirées": "🎉", "Art et photographie": "🎨", "Jeux vidéo": "🎮",
  Musique: "🎵", "Cinéma et séries": "🎬", Voyages: "✈️", Lecture: "📚", Cuisine: "🍳",
  Animaux: "🐾", Technologie: "💻", Mode: "👗", "Nature et randonnée": "🌿", Bénévolat: "🤝",
  Jardinage: "🪴", Danse: "💃", "Jeux de société": "🎲", Astronomie: "🔭", Pâtisserie: "🧁",
  Podcasts: "🎧", Escalade: "🧗", Écriture: "✍️", Écologie: "♻️", "Voitures et mécanique": "🚗",
  "Maquillage et beauté": "💄", "Sports de glisse": "🏄", Collection: "🪙", "Histoire et patrimoine": "🏛️",
  "Méditation et bien-être": "🧘", "Stand-up et humour": "🎤",
};

function calculateAge(birthDate?: string) {
  if (!birthDate) return undefined;
  const birth = new Date(`${birthDate}T00:00:00`);
  if (Number.isNaN(birth.getTime()) || birth.getTime() > Date.now()) return undefined;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  if (today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) age--;
  return age;
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const saved = window.localStorage.getItem(key);
    return saved ? (JSON.parse(saved) as T) : fallback;
  } catch {
    return fallback;
  }
}

export default function ProfileSummary() {
  const [loaded, setLoaded] = useState(false);
  const [registration, setRegistration] = useState<Registration>({});
  const [personal, setPersonal] = useState<PersonalInfo>({});
  const [description, setDescription] = useState("");
  const [passions, setPassions] = useState<string[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [currentPhoto, setCurrentPhoto] = useState(0);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setRegistration(readJson<Registration>("findfriends-registration", {}));
      setPersonal(readJson<PersonalInfo>("findfriends-profile-personal", {}));
      setDescription(readJson<Description>("findfriends-profile-description", {}).description ?? "");
      setPassions(readJson<string[]>("findfriends-profile-passions", []));
      setPhotos(readJson<string[]>("findfriends-profile-photo-previews", []));
      setLoaded(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const firstName = personal.firstName || registration.firstName || "Non renseigné";
  const age = personal.age ?? calculateAge(registration.birthDate);
  const languages = personal.languages ?? [];

  return (
    <main className="profile-page">
      <section className="profile-card photo-step-card summary-card">
        <Link className="registration-brand" href="/profil/creer/passions">← Retour aux passions</Link>
        <header className="profile-heading">
          <div className="profile-step-label"><span>ÉTAPE 5 SUR 5</span><span>Récapitulatif du profil</span></div>
          <div className="profile-progress" aria-label="Étape 5 sur 5"><span className="progress-step-five" /></div>
          <h1>Ton profil est prêt</h1>
          <p>Voici les informations que tu as ajoutées, dans l’ordre de création.</p>
        </header>

        {!loaded ? <p className="profile-help">Chargement de ton récapitulatif…</p> : (
          <div className="summary-content">
            <section className="summary-section">
              <h2>1. Photos de profil</h2>
              {photos.length ? (
                <div className="photo-book" aria-label="Album photo du profil">
                  <div className="photo-book-page">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img key={photos[currentPhoto]} className="photo-book-image" src={photos[currentPhoto]} alt={`Photo de profil ${currentPhoto + 1} sur ${photos.length}`} />
                    <span className="photo-book-page-number">{currentPhoto + 1} / {photos.length}</span>
                  </div>
                  <div className="photo-book-controls">
                    <button type="button" onClick={() => setCurrentPhoto((index) => (index - 1 + photos.length) % photos.length)} disabled={photos.length < 2} aria-label="Voir la photo précédente">← Précédente</button>
                    <span>Tourne la page pour découvrir la suite</span>
                    <button type="button" onClick={() => setCurrentPhoto((index) => (index + 1) % photos.length)} disabled={photos.length < 2} aria-label="Voir la photo suivante">Suivante →</button>
                  </div>
                </div>
              ) : <p className="summary-value">Aucune photo enregistrée</p>}
            </section>

            <section className="summary-section">
              <h2>2. Informations personnelles</h2>
              <dl className="summary-details">
                <div><dt>Prénom</dt><dd>{firstName}</dd></div>
                <div><dt>Âge</dt><dd>{age ? `${age} ans` : "Non renseigné"}</dd></div>
                <div><dt>Ville</dt><dd>{personal.city || "Non renseignée"}</dd></div>
                <div><dt>Genre</dt><dd>{personal.gender || "Non précisé"}</dd></div>
                <div><dt>Profession ou études</dt><dd>{personal.occupation || "Non renseignée"}</dd></div>
                <div><dt>Langues</dt><dd>{languages.length ? languages.join(", ") : "Non renseignées"}</dd></div>
              </dl>
            </section>

            <section className="summary-section">
              <h2>3. Biographie</h2>
              <p className="summary-biography">{description || "Aucune biographie enregistrée"}</p>
            </section>

            <section className="summary-section">
              <h2>4. Passions et centres d’intérêt</h2>
              {passions.length ? <ul className="summary-passions">{passions.map((passion) => <li key={passion}><span aria-hidden="true">{passionEmojis[passion] ?? "✨"}</span> {passion}</li>)}</ul> : <p className="summary-value">Aucune passion enregistrée</p>}
            </section>
          </div>
        )}

        <div className="profile-step-actions">
          <Link className="registration-back" href="/profil/creer/passions">← Modifier mes passions</Link>
          <Link className="submit-button profile-next-button summary-finish-button" href="/">Terminer <span aria-hidden="true">→</span></Link>
        </div>
      </section>
    </main>
  );
}
