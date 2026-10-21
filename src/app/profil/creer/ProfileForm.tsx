"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ChangeEvent, type DragEvent, type FormEvent } from "react";

type Photo = { id: string; url: string; file: File };

export default function ProfileForm() {
  const router = useRouter();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");

  function addPhotoFiles(files: FileList | File[]) {
    const chosenFiles = Array.from(files);
    const remaining = 6 - photos.length;
    if (remaining <= 0) {
      setError("Tu peux ajouter jusqu’à 6 photos au total.");
      return;
    }
    const accepted: Photo[] = [];
    let message = "";
    for (const file of chosenFiles) {
      if (accepted.length >= remaining) {
        message = "Tu peux ajouter jusqu’à 6 photos au total.";
        break;
      }
      if (!file.type.startsWith("image/")) message = "Seules les images peuvent être ajoutées.";
      else if (file.size > 5 * 1024 * 1024) message = "Chaque photo doit peser 5 Mo maximum.";
      else accepted.push({ id: `${file.name}-${file.lastModified}-${Math.random()}`, url: URL.createObjectURL(file), file });
    }
    setError(message);
    if (accepted.length) setPhotos((current) => [...current, ...accepted]);
  }

  function addPhotos(event: ChangeEvent<HTMLInputElement>) {
    addPhotoFiles(event.target.files ?? []);
    event.target.value = "";
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    addPhotoFiles(event.dataTransfer.files);
  }

  function removePhoto(id: string) {
    setPhotos((current) => {
      const removed = current.find((photo) => photo.id === id);
      if (removed) URL.revokeObjectURL(removed.url);
      return current.filter((photo) => photo.id !== id);
    });
  }

  function continueToNextStep(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (photos.length === 0) {
      setError("Ajoute au moins une photo pour continuer.");
      return;
    }
    setError("");
    const photoNames = photos.map(({ file }) => file.name);
    const photoPreviews = photos.map(({ url }) => url);
    window.localStorage.setItem("findfriends-profile-photos", JSON.stringify(photoNames));
    window.localStorage.setItem("findfriends-profile-photo-previews", JSON.stringify(photoPreviews));
    window.localStorage.setItem("findfriends-profile-main-photo", photoPreviews[0]);
    router.push("/profil/creer/informations");
  }

  return (
    <main className="profile-page photo-step-page">
      <section className="profile-card photo-step-card">
        <Link className="registration-brand" href="/" aria-label="Retour à Find New Friends">
          <span className="brand-mark" aria-hidden="true"><svg viewBox="0 0 32 32" fill="none"><circle cx="12" cy="11" r="4" /><circle cx="22" cy="13" r="3" /><path d="M4.5 25c.7-4.1 3.2-6.2 7.5-6.2s6.8 2.1 7.5 6.2M19 19.4c3.8-.5 6.6 1.4 7.5 4.6M24 4v6M21 7h6" /></svg></span>
          Find New Friends
        </Link>
        <header className="profile-heading">
          <div className="profile-step-label"><span>ÉTAPE 1 SUR 5</span><span>Photos de profil</span></div>
          <div className="profile-progress" aria-label="Étape 1 sur 5"><span /></div>
          <h1>Personnalise ton profil</h1>
          <p>Ajoute quelques détails pour rencontrer des personnes qui partagent tes centres d’intérêt.</p>
        </header>

        {error && <p className="registration-error" role="alert">{error}</p>}

        <form onSubmit={continueToNextStep}>
          <section className="profile-section photo-step-section">
            <h2>Photos de profil</h2>
            <p className="profile-help">Ajoute au moins une photo (6 maximum, 5 Mo chacune).</p>
            <div
              className={`photo-dropzone ${isDragging ? "is-dragging" : ""}`}
              onDragOver={(event) => { event.preventDefault(); setIsDragging(true); }}
              onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setIsDragging(false); }}
              onDrop={handleDrop}
            >
              <label className="photo-drop-content">
                <input type="file" accept="image/*" multiple onChange={addPhotos} />
                <span className="upload-icon" aria-hidden="true"><svg viewBox="0 0 48 48" fill="none"><path d="M24 31V8m0 0-8 8m8-8 8 8" /><path d="M10 27v11a3 3 0 0 0 3 3h22a3 3 0 0 0 3-3V27" /></svg></span>
                <strong>Glisse tes photos ici</strong>
                <span className="photo-drop-hint">ou <span className="photo-browse">parcourir tes fichiers</span></span>
                <span className="photo-drop-limit">JPG, PNG ou WEBP · 5 Mo maximum par photo</span>
              </label>
            </div>
            <div className="photo-grid">
              {photos.map((photo, index) => (
                <div className="photo-preview" key={photo.id}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo.url} alt={index === 0 ? "Photo de profil principale" : `Photo ${index + 1}`} />
                  {index === 0 && <span className="main-photo-badge">Photo principale</span>}
                  <button type="button" className="photo-remove" aria-label={`Supprimer la photo ${index + 1}`} onClick={() => removePhoto(photo.id)}>×</button>
                </div>
              ))}
              {Array.from({ length: Math.max(0, 6 - photos.length) }, (_, index) => (
                <div className="photo-empty-slot" key={`empty-${index}`} aria-hidden="true"><span>＋</span></div>
              ))}
            </div>
            <p className="photo-count">{photos.length} / 6 photos ajoutées <span>• Au moins 1 requise</span></p>
          </section>
          <div className="profile-step-actions">
            <Link className="registration-back" href="/">← Retour</Link>
            <button className="submit-button profile-next-button" type="submit">Continuer <span aria-hidden="true">→</span></button>
          </div>
          {photos.length === 0 && <p className="photo-step-note">Tu pourras ajouter d’autres photos plus tard.</p>}
        </form>
      </section>
    </main>
  );
}
