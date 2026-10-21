"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

type Registration = { firstName?: string; birthDate?: string };
const languages = [
  { name: "Français", flag: "🇫🇷" },
  { name: "Anglais", flag: "🇬🇧" },
  { name: "Espagnol", flag: "🇪🇸" },
  { name: "Allemand", flag: "🇩🇪" },
  { name: "Italien", flag: "🇮🇹" },
  { name: "Arabe", flag: "🇸🇦" },
  { name: "Portugais", flag: "🇵🇹" },
  { name: "Chinois", flag: "🇨🇳" },
  { name: "Autre", flag: "🌍" },
];

function getRegistration(): Registration {
  if (typeof window === "undefined") return {};
  try {
    const saved = window.localStorage.getItem("findfriends-registration");
    return saved ? JSON.parse(saved) as Registration : {};
  } catch {
    return {};
  }
}

function calculateAge(birthDate?: string) {
  if (!birthDate) return null;
  const birth = new Date(`${birthDate}T00:00:00`);
  if (Number.isNaN(birth.getTime()) || birth.getTime() > Date.now()) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  if (today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) age--;
  return age;
}

export default function PersonalInfoForm() {
  const router = useRouter();
  const [registration] = useState<Registration>(getRegistration);
  const [profilePhoto] = useState(() => {
    if (typeof window === "undefined") return "";
    try {
      return window.localStorage.getItem("findfriends-profile-main-photo") ?? "";
    } catch {
      return "";
    }
  });
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [error, setError] = useState("");
  const age = calculateAge(registration.birthDate);

  function toggleLanguage(language: string) {
    setSelectedLanguages((current) => current.includes(language) ? current.filter((item) => item !== language) : [...current, language]);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    if (!selectedLanguages.length) {
      setError("Choisis au moins une langue parlée pour continuer.");
      return;
    }
    if (!registration.firstName?.trim() || age === null) {
      setError("Le prénom et la date de naissance doivent être renseignés à l’inscription.");
      return;
    }
    setError("");
    const personalInfo = {
      firstName: registration.firstName ?? "",
      age,
      city: String(form.get("city") ?? "").trim(),
      gender: String(form.get("gender") ?? ""),
      occupation: String(form.get("occupation") ?? "").trim(),
      languages: selectedLanguages,
    };
    try {
      window.localStorage.setItem("findfriends-profile-personal", JSON.stringify(personalInfo));
      window.localStorage.setItem("findfriends-profile-personal-draft", JSON.stringify({
        city: personalInfo.city,
        gender: personalInfo.gender,
        occupation: personalInfo.occupation,
        languages: personalInfo.languages,
      }));
      setError("");
      router.push("/profil/creer/description");
    } catch {
      setError("Impossible d’enregistrer tes informations sur cet appareil. Réessaie.");
    }
  }

  return (
    <main className="profile-page">
      <section className="profile-card photo-step-card">
        <Link className="registration-brand" href="/profil/creer">← Retour aux photos</Link>
        <header className="profile-heading">
          <div className="profile-step-label"><span>ÉTAPE 2 SUR 5</span><span>Informations personnelles</span></div>
          <div className="profile-progress" aria-label="Étape 2 sur 5"><span className="progress-step-two" /></div>
          <h1>À propos de toi</h1>
          <p>Quelques informations pour aider les autres à faire ta connaissance.</p>
        </header>

        <div className="personal-identity">
          <span className="personal-avatar">
            {profilePhoto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profilePhoto} alt="" />
            ) : null}
          </span>
          <div className="personal-name-block"><strong>{registration.firstName?.trim() || "Prénom non renseigné"}</strong>{age !== null && <span>{age} ans</span>}</div>
        </div>

        {error && <p className="registration-error" role="alert">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="profile-form-grid personal-info-grid">
            <div className="registration-field">
              <label htmlFor="city">Ta ville <span className="required-mark">*</span></label>
              <input id="city" name="city" autoComplete="address-level2" placeholder="Ex. : Lyon" required />
            </div>
            <div className="registration-field">
              <label htmlFor="gender">Ton genre <span className="optional">(facultatif)</span></label>
              <select id="gender" name="gender" defaultValue=""><option value="">Je préfère ne pas préciser</option><option value="Femme">Femme</option><option value="Homme">Homme</option><option value="Non-binaire">Non-binaire</option><option value="Autre">Autre</option></select>
            </div>
            <div className="registration-field profile-field-full">
              <label htmlFor="occupation">Profession ou études <span className="optional">(facultatif)</span></label>
              <input id="occupation" name="occupation" placeholder="Ex. : Étudiant·e en design" />
            </div>
          </div>

          <fieldset className="personal-language-group">
            <legend>Quelles langues parles-tu ? <span className="optional">(facultatif)</span></legend>
            <p className="profile-help">Sélectionne toutes les langues qui te correspondent.</p>
            <div className="profile-chips">
              {languages.map(({ name, flag }) => (
                <label className={`profile-chip ${selectedLanguages.includes(name) ? "is-selected" : ""}`} key={name}>
                  <input type="checkbox" checked={selectedLanguages.includes(name)} onChange={() => toggleLanguage(name)} />
                  <span>{name}</span><span className="language-flag" aria-hidden="true">{flag}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <p className="personal-privacy-note">À savoir : ta date de naissance complète restera privée. Seul ton âge peut apparaître sur ton profil.</p>
          <div className="profile-step-actions">
            <Link className="registration-back" href="/profil/creer">← Retour</Link>
            <button className="submit-button profile-next-button" type="submit">Continuer <span aria-hidden="true">→</span></button>
          </div>
        </form>
      </section>
    </main>
  );
}
