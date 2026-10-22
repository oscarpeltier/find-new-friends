"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent, type TouchEvent } from "react";

type Registration = { firstName?: string; birthDate?: string };
type PersonalInfo = { firstName?: string; age?: number; city?: string; gender?: string; occupation?: string; languages?: string[] };
type Description = { description?: string };
const passionOptions = [
  ["Sport", "⚽"], ["Sorties et soirées", "🎉"], ["Art et photographie", "🎨"], ["Jeux vidéo", "🎮"], ["Musique", "🎵"], ["Cinéma et séries", "🎬"], ["Voyages", "✈️"], ["Lecture", "📚"], ["Cuisine", "🍳"], ["Animaux", "🐾"], ["Technologie", "💻"], ["Mode", "👗"], ["Nature et randonnée", "🌿"], ["Bénévolat", "🤝"], ["Jardinage", "🪴"], ["Danse", "💃"], ["Jeux de société", "🎲"], ["Astronomie", "🔭"], ["Pâtisserie", "🧁"], ["Podcasts", "🎧"], ["Escalade", "🧗"], ["Écriture", "✍️"], ["Écologie", "♻️"], ["Voitures et mécanique", "🚗"], ["Maquillage et beauté", "💄"], ["Sports de glisse", "🏄"], ["Collection", "🪙"], ["Histoire et patrimoine", "🏛️"], ["Méditation et bien-être", "🧘"], ["Stand-up et humour", "🎤"],
];
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
  try { const saved = window.localStorage.getItem(key); return saved ? JSON.parse(saved) as T : fallback; } catch { return fallback; }
}

export default function ProfileSummary() {
  const router = useRouter();
  const [loaded, setLoaded] = useState(false);
  const [registration, setRegistration] = useState<Registration>({});
  const [personal, setPersonal] = useState<PersonalInfo>({});
  const [description, setDescription] = useState("");
  const [passions, setPassions] = useState<string[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [photoError, setPhotoError] = useState("");
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [currentPhoto, setCurrentPhoto] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingBio, setEditingBio] = useState(false);
  const [bioDraft, setBioDraft] = useState("");
  const [bioError, setBioError] = useState("");
  const [bioSuccess, setBioSuccess] = useState("");
  const swipeStartX = useRef<number | null>(null);
  function handleTouchStart(event: TouchEvent<HTMLDivElement>) { swipeStartX.current = event.touches[0]?.clientX ?? null; }
  function handleTouchEnd(event: TouchEvent<HTMLDivElement>) {
    if (swipeStartX.current === null || photos.length < 2) return;
    const distance = event.changedTouches[0].clientX - swipeStartX.current;
    if (Math.abs(distance) > 45) setCurrentPhoto((index) => (index + (distance < 0 ? 1 : -1) + photos.length) % photos.length);
    swipeStartX.current = null;
  }
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
  async function addPhotos(files: FileList | null) {
    if (!files?.length) return;
    setPhotoError("");
    const available = 6 - photos.length;
    if (available <= 0) { setPhotoError("Tu peux ajouter jusqu’à 6 photos au total."); return; }
    const accepted: File[] = [];
    let message = "";
    for (const file of Array.from(files)) {
      if (accepted.length >= available) { message = "Tu peux ajouter jusqu’à 6 photos au total."; break; }
      if (!file.type.startsWith("image/")) { message = "Seules les images peuvent être ajoutées."; continue; }
      if (file.size > 5 * 1024 * 1024) { message = "Chaque photo doit peser 5 Mo maximum."; continue; }
      accepted.push(file);
    }
    try {
      const newPreviews = await Promise.all(accepted.map((file) => new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("Lecture impossible"));
        reader.onerror = () => reject(new Error("Lecture impossible"));
        reader.readAsDataURL(file);
      })));
      const updated = [...photos, ...newPreviews];
      window.localStorage.setItem("findfriends-profile-photo-previews", JSON.stringify(updated));
      window.localStorage.setItem("findfriends-profile-main-photo", updated[0]);
      setPhotos(updated);
    } catch { message = "Impossible d’enregistrer ces photos (stockage insuffisant ou fichier illisible). Réessaie."; }
    setPhotoError(message);
  }
  function removePhoto(index: number) {
    const updated = photos.filter((_, photoIndex) => photoIndex !== index);
    try {
      window.localStorage.setItem("findfriends-profile-photo-previews", JSON.stringify(updated));
      if (updated.length) window.localStorage.setItem("findfriends-profile-main-photo", updated[0]);
      else window.localStorage.removeItem("findfriends-profile-main-photo");
      setPhotos(updated);
      setCurrentPhoto((current) => Math.min(current, Math.max(0, updated.length - 1)));
      setPhotoError("");
    } catch { setPhotoError("Impossible d’enregistrer cette modification. Réessaie."); }
  }
  function togglePassion(name: string) {
    setSuccess(""); setError("");
    setPassions((current) => {
      if (current.includes(name)) return current.filter((item) => item !== name);
      if (current.length >= 10) { setError("Tu as atteint la limite de 10 passions."); return current; }
      return [...current, name];
    });
  }
  function saveBio(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBioError(""); setBioSuccess("");
    if (bioDraft.trim().length < 25) { setBioError("Ta biographie doit contenir au moins 25 caractères."); return; }
    try {
      window.localStorage.setItem("findfriends-profile-description", JSON.stringify({ description: bioDraft }));
      setDescription(bioDraft);
      setEditingBio(false);
      setBioSuccess("Biographie mise à jour !");
    } catch { setBioError("Impossible d’enregistrer ta biographie sur cet appareil. Réessaie."); }
  }
  function saveProfile() {
    setSuccess(""); setError("");
    if (description.trim().length < 25) { setError("Ta biographie doit contenir au moins 25 caractères."); return; }
    if (passions.length < 3) { setError("Sélectionne au moins 3 passions ou centres d’intérêt pour continuer."); return; }
    try {
      window.localStorage.setItem("findfriends-profile-description", JSON.stringify({ description }));
      window.localStorage.setItem("findfriends-profile-passions", JSON.stringify(passions));
      setSuccess("Ton profil a bien été mis à jour !");
      router.push("/accueil");
    } catch { setError("Impossible d’enregistrer tes modifications sur cet appareil. Réessaie."); }
  }
  return (
    <main className="profile-page">
      <section className="profile-card photo-step-card summary-card">
        <header className="profile-heading">
          <Link className="profile-home-link" href="/accueil">← Accueil</Link>
          <h1>Mon profil</h1>
          <p>Consulte et modifie tes informations personnelles.</p>
        </header>
        {!loaded ? <p className="profile-help">Chargement de ton profil…</p> : (
          <div>
            <div className="summary-content">
              <section className="summary-section">
                <h2>Photos de profil</h2>
                {photos.length ? <div className="profile-photo-gallery" aria-label="Galerie de photos du profil">
                  <div className="profile-photo-main" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd} aria-label="Glisse vers la gauche ou la droite pour parcourir les photos">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photos[currentPhoto]} alt={`Photo de profil ${currentPhoto + 1} sur ${photos.length}`} />
                  </div>
                  {photos.length > 1 && <><button type="button" className="profile-photo-nav profile-photo-prev" onClick={() => setCurrentPhoto((index) => (index - 1 + photos.length) % photos.length)} aria-label="Photo précédente">‹</button><button type="button" className="profile-photo-nav profile-photo-next" onClick={() => setCurrentPhoto((index) => (index + 1) % photos.length)} aria-label="Photo suivante">›</button><div className="profile-photo-dots" aria-label={`Photo ${currentPhoto + 1} sur ${photos.length}`}>{photos.map((photo, index) => <span key={`${photo}-${index}`} className={currentPhoto === index ? "is-active" : ""} />)}</div></>}
                  <span className="profile-photo-count">{currentPhoto + 1} / {photos.length}</span>
                </div> : <p className="summary-value">Aucune photo enregistrée</p>}
                <div className="profile-photo-actions">
                  <label className="profile-photo-add">Ajouter des photos<input ref={photoInputRef} type="file" accept="image/*" multiple onChange={(event) => { addPhotos(event.target.files); event.target.value = ""; }} disabled={photos.length >= 6} /></label>
                  {photos.length > 0 && <button type="button" className="profile-photo-remove" onClick={() => removePhoto(currentPhoto)}>Supprimer cette photo</button>}
                </div>
                <p className="photo-count">{photos.length} / 6 photos · 5 Mo maximum par photo</p>
                {photoError && <p className="registration-error" role="alert">{photoError}</p>}
              </section>
              <section className="summary-section"><h2>Informations personnelles</h2><dl className="summary-details">
                <div><dt>Prénom</dt><dd>{firstName}</dd></div><div><dt>Âge</dt><dd>{age ? `${age} ans` : "Non renseigné"}</dd></div><div><dt>Ville</dt><dd>{personal.city || "Non renseignée"}</dd></div><div><dt>Genre</dt><dd>{personal.gender || "Non précisé"}</dd></div><div><dt>Profession ou études</dt><dd>{personal.occupation || "Non renseignée"}</dd></div><div><dt>Langues</dt><dd>{languages.length ? languages.join(", ") : "Non renseignées"}</dd></div>
              </dl></section>
              <section className="summary-section"><h2>Ma biographie</h2>
                {!editingBio ? <><p className="summary-biography">{description || "Aucune biographie enregistrée"}</p><button type="button" className="bio-edit-button" onClick={() => { setBioDraft(description); setBioError(""); setBioSuccess(""); setEditingBio(true); }}>Modifier ma biographie</button>{bioSuccess && <p className="bio-success" role="status">{bioSuccess}</p>}</> : <form className="bio-edit-form" onSubmit={saveBio}><div className="description-field-heading"><label htmlFor="profile-description">Ta biographie</label><span>{bioDraft.length}/500</span></div><textarea id="profile-description" value={bioDraft} onChange={(event) => setBioDraft(event.target.value.slice(0, 500))} maxLength={500} minLength={25} rows={6} /><p className="description-local-note">25 caractères minimum.</p>{bioError && <p className="registration-error" role="alert">{bioError}</p>}<div className="bio-edit-actions"><button className="submit-button bio-save-button" type="submit">Enregistrer</button><button className="registration-back bio-cancel-button" type="button" onClick={() => { setEditingBio(false); setBioError(""); }}>Annuler</button></div></form>}
              </section>
              <section className="summary-section"><h2>Mes passions et centres d’intérêt</h2><div className="passions-selection-heading"><p>Sélectionne au moins 3 passions, jusqu’à 10.</p><span className={`passions-counter ${passions.length === 10 ? "is-full" : ""}`}>{passions.length}<span> / 10</span></span></div><div className="passions-grid">{(showAll ? passionOptions : passionOptions.slice(0, 3)).map(([name, icon]) => { const selected = passions.includes(name); return <button key={name} type="button" className={`passion-option ${selected ? "is-selected" : ""}`} aria-pressed={selected} onClick={() => togglePassion(name)}><span className="passion-icon" aria-hidden="true">{icon}</span><span>{name}</span>{selected && <span className="passion-check" aria-hidden="true">✓</span>}</button>; })}</div><button type="button" className="passions-show-more" aria-expanded={showAll} onClick={() => setShowAll((value) => !value)}><span aria-hidden="true">{showAll ? "−" : "+"}</span>{showAll ? "Voir moins" : "Voir toutes les passions"}</button></section>
            </div>
            {error && <p className="registration-error" role="alert">{error}</p>}{success && <p className="passions-feedback" role="status">{success}</p>}
            <div className="profile-save-actions"><button className="submit-button profile-save-button" type="button" onClick={saveProfile}>Enregistrer les modifications</button></div>
          </div>
        )}
      </section>
    </main>
  );
}
