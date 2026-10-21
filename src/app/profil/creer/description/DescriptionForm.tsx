"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ChangeEvent, type FormEvent } from "react";

type PersonalDraft = { city?: string; gender?: string; occupation?: string; languages?: string[] };
function getSavedDescription() {
  if (typeof window === "undefined") return "";
  try {
    const saved = window.localStorage.getItem("findfriends-profile-description");
    return saved ? (JSON.parse(saved) as { description?: string }).description ?? "" : "";
  } catch {
    return "";
  }
}

function getPersonalDraft(): PersonalDraft {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem("findfriends-profile-personal-draft") ?? "{}") as PersonalDraft;
  } catch {
    return {};
  }
}

export default function DescriptionForm() {
  const router = useRouter();
  const [description, setDescription] = useState(getSavedDescription);
  const [inspiration, setInspiration] = useState("");
  const [error, setError] = useState("");

  function handleChange(event: ChangeEvent<HTMLTextAreaElement>) {
    setDescription(event.target.value.slice(0, 500));
  }

  function handleInspirationChange(event: ChangeEvent<HTMLTextAreaElement>) {
    setInspiration(event.target.value.slice(0, 300));
  }

  function generateSuggestion() {
    const interests = inspiration.trim();
    if (!interests) {
      setError("Écris quelques mots sur tes goûts ou tes activités pour recevoir une suggestion personnalisée.");
      return;
    }
    const excerpt = interests.slice(0, 180).replace(/[.!?]+$/, "");
    const generated = `J’aime ${excerpt}. Je serais ravi·e de rencontrer des personnes avec qui partager de bons moments, discuter et découvrir de nouvelles activités ensemble.`;
    setDescription(generated.slice(0, 500));
    setError("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const personalDraft = getPersonalDraft();
    try {
      window.localStorage.setItem("findfriends-profile-description", JSON.stringify({ description }));
      window.localStorage.setItem("findfriends-profile-personal", JSON.stringify(personalDraft));
      setError("");
      router.push("/profil/creer/passions");
    } catch {
      setError("Impossible d’enregistrer ta description sur cet appareil. Réessaie.");
    }
  }

  return (
    <main className="profile-page">
      <section className="profile-card photo-step-card">
        <Link className="registration-brand" href="/profil/creer/informations">← Retour aux informations</Link>
        <header className="profile-heading">
          <div className="profile-step-label"><span>ÉTAPE 3 SUR 5</span><span>Description personnelle</span></div>
          <div className="profile-progress" aria-label="Étape 3 sur 5"><span className="progress-step-three" /></div>
          <h1>Parle-nous de toi</h1>
          <p>Quelques mots sur toi aideront les autres à découvrir ta personnalité.</p>
        </header>

        {error && <p className="registration-error" role="alert">{error}</p>}
        <form onSubmit={handleSubmit}>
          <section className="profile-section description-step-section">
            <div className="description-field-heading">
              <label htmlFor="description">Parle-nous de toi</label>
              <span>{description.length}/500</span>
            </div>
            <textarea
              id="description"
              name="description"
              value={description}
              onChange={handleChange}
              maxLength={500}
              rows={7}
              placeholder="Écris quelques lignes pour te présenter…"
              aria-describedby="description-count"
            />
            <div className="description-guidance" id="description-example">
              <span className="description-guidance-icon" aria-hidden="true">✦</span>
              <div className="description-helper-content">
                <label className="description-inspiration-label" htmlFor="inspiration">Besoin d’inspiration ? Écris quelques mots sur ce que tu aimes.</label>
                <textarea
                  id="inspiration"
                  className="description-inspiration-input"
                  value={inspiration}
                  onChange={handleInspirationChange}
                  maxLength={300}
                  rows={3}
                  placeholder="Ex. : randonnée, jeux vidéo, cuisine…"
                />
                <button type="button" className="description-example-button" onClick={generateSuggestion}>M’aider à rédiger</button>
                <span className="description-local-note">Aide automatique sur cet appareil : ton texte n’est pas envoyé à un service externe.</span>
              </div>
            </div>
            <span className="sr-only" id="description-count">{description.length} caractères sur 500</span>
          </section>
          <div className="profile-step-actions">
            <Link className="registration-back" href="/profil/creer/informations">← Retour</Link>
            <button className="submit-button profile-next-button" type="submit">Continuer <span aria-hidden="true">→</span></button>
          </div>
        </form>
      </section>
    </main>
  );
}
