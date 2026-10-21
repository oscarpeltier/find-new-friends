"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

const passions = [
  { name: "Sport", icon: "⚽" },
  { name: "Sorties et soirées", icon: "🎉" },
  { name: "Art et photographie", icon: "🎨" },
  { name: "Jeux vidéo", icon: "🎮" },
  { name: "Musique", icon: "🎵" },
  { name: "Cinéma et séries", icon: "🎬" },
  { name: "Voyages", icon: "✈️" },
  { name: "Lecture", icon: "📚" },
  { name: "Cuisine", icon: "🍳" },
  { name: "Animaux", icon: "🐾" },
  { name: "Technologie", icon: "💻" },
  { name: "Mode", icon: "👗" },
  { name: "Nature et randonnée", icon: "🌿" },
  { name: "Bénévolat", icon: "🤝" },
  { name: "Jardinage", icon: "🪴" },
  { name: "Danse", icon: "💃" },
  { name: "Jeux de société", icon: "🎲" },
  { name: "Astronomie", icon: "🔭" },
  { name: "Pâtisserie", icon: "🧁" },
  { name: "Podcasts", icon: "🎧" },
  { name: "Escalade", icon: "🧗" },
  { name: "Écriture", icon: "✍️" },
  { name: "Écologie", icon: "♻️" },
  { name: "Voitures et mécanique", icon: "🚗" },
  { name: "Maquillage et beauté", icon: "💄" },
  { name: "Sports de glisse", icon: "🏄" },
  { name: "Collection", icon: "🪙" },
  { name: "Histoire et patrimoine", icon: "🏛️" },
  { name: "Méditation et bien-être", icon: "🧘" },
  { name: "Stand-up et humour", icon: "🎤" },
];

function getSavedPassions() {
  if (typeof window === "undefined") return [];
  try {
    const saved = JSON.parse(window.localStorage.getItem("findfriends-profile-passions") ?? "[]") as unknown;
    return Array.isArray(saved) ? saved.filter((item): item is string => typeof item === "string" && passions.some((passion) => passion.name === item)).slice(0, 10) : [];
  } catch {
    return [];
  }
}

export default function PassionsForm() {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>(getSavedPassions);
  const [showAll, setShowAll] = useState(false);
  const [error, setError] = useState("");

  function togglePassion(name: string) {
    setSelected((current) => {
      if (current.includes(name)) return current.filter((item) => item !== name);
      if (current.length >= 10) {
        setError("Tu as atteint la limite de 10 passions.");
        return current;
      }
      setError("");
      return [...current, name];
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      window.localStorage.setItem("findfriends-profile-passions", JSON.stringify(selected));
      setError("");
      router.push("/profil/creer/rencontres");
    } catch {
      setError("Impossible d’enregistrer tes passions sur cet appareil. Réessaie.");
    }
  }

  return (
    <main className="profile-page">
      <section className="profile-card photo-step-card passions-card">
        <Link className="registration-brand" href="/profil/creer/description">← Retour à la description</Link>
        <header className="profile-heading">
          <div className="profile-step-label"><span>ÉTAPE 4 SUR 5</span><span>Passions et centres d’intérêt</span></div>
          <div className="profile-progress" aria-label="Étape 4 sur 5"><span className="progress-step-four" /></div>
          <h1>Mes passions</h1>
          <p>Choisis ce qui te plaît pour rencontrer des personnes qui partagent tes centres d’intérêt.</p>
        </header>

        {error && <p className="registration-error" role="alert">{error}</p>}
        <form onSubmit={handleSubmit}>
          <section className="profile-section passions-step-section">
            <div className="passions-selection-heading">
              <div><h2>Qu’est-ce que tu aimes ?</h2><p>Sélectionne jusqu’à 10 passions.</p></div>
              <span className={`passions-counter ${selected.length === 10 ? "is-full" : ""}`}>{selected.length}<span> / 10</span></span>
            </div>
            <div className="passions-grid">
              {(showAll ? passions : passions.slice(0, 3)).map(({ name, icon }) => {
                const isSelected = selected.includes(name);
                return (
                  <button
                    className={`passion-option ${isSelected ? "is-selected" : ""}`}
                    type="button"
                    key={name}
                    aria-pressed={isSelected}
                    onClick={() => togglePassion(name)}
                  >
                    <span className="passion-icon" aria-hidden="true">{icon}</span>
                    <span>{name}</span>
                    {isSelected && <span className="passion-check" aria-hidden="true">✓</span>}
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              className="passions-show-more"
              aria-expanded={showAll}
              onClick={() => setShowAll((current) => !current)}
            >
              <span aria-hidden="true">{showAll ? "−" : "+"}</span>{showAll ? "Voir moins" : "Voir plus"}
            </button>
            <p className="passions-feedback" aria-live="polite">
              {selected.length ? `Tes passions sélectionnées : ${selected.join(", ")}` : "Aucune passion sélectionnée pour le moment."}
            </p>
          </section>
          <div className="profile-step-actions">
            <Link className="registration-back" href="/profil/creer/description">← Retour</Link>
            <button className="submit-button profile-next-button" type="submit">Continuer <span aria-hidden="true">→</span></button>
          </div>
        </form>
      </section>
    </main>
  );
}
