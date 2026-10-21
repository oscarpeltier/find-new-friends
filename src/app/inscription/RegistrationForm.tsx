"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export default function RegistrationForm() {
  const [error, setError] = useState("");
  const router = useRouter();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const password = String(data.get("password") ?? "");
    const confirmation = String(data.get("confirmPassword") ?? "");

    if (password !== confirmation) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setError("");
    const firstName = String(data.get("firstName") ?? "").trim();
    const birthDate = String(data.get("birthDate") ?? "");
    window.localStorage.setItem("findfriends-registration", JSON.stringify({ firstName, birthDate }));
    router.push("/profil/creer");
  }

  return (
    <main className="registration-page">
      <section className="registration-card">
        <Link className="registration-brand" href="/" aria-label="Retour à Find New Friends">
          <span className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 32 32" fill="none">
              <circle cx="12" cy="11" r="4" />
              <circle cx="22" cy="13" r="3" />
              <path d="M4.5 25c.7-4.1 3.2-6.2 7.5-6.2s6.8 2.1 7.5 6.2M19 19.4c3.8-.5 6.6 1.4 7.5 4.6M24 4v6M21 7h6" />
            </svg>
          </span>
          Find New Friends
        </Link>
        <div className="registration-heading">
          <span className="welcome-small">FAIS DE NOUVELLES RENCONTRES</span>
          <h1>Créer un compte</h1>
          <p>Rejoins-nous et fais de belles rencontres.</p>
        </div>

        {error ? <p className="registration-error" role="alert">{error}</p> : null}

        <form className="registration-form" onSubmit={handleSubmit}>
          <div className="registration-fields">
            <div className="registration-field">
              <label htmlFor="lastName">Nom</label>
              <input id="lastName" name="lastName" type="text" autoComplete="family-name" required />
            </div>
            <div className="registration-field">
              <label htmlFor="firstName">Prénom</label>
              <input id="firstName" name="firstName" type="text" autoComplete="given-name" required />
            </div>
            <div className="registration-field">
              <label htmlFor="birthDate">Date de naissance</label>
              <input id="birthDate" name="birthDate" type="date" autoComplete="bday" required />
            </div>
            <div className="registration-field">
              <label htmlFor="phone">Numéro de téléphone</label>
              <input id="phone" name="phone" type="tel" autoComplete="tel" pattern="[+0-9() .-]{8,20}" title="Saisis un numéro de téléphone valide." required />
            </div>
            <div className="registration-field registration-field-full">
              <label htmlFor="email">Adresse e-mail</label>
              <input id="email" name="email" type="email" autoComplete="email" placeholder="toi@exemple.com" required />
            </div>
            <div className="registration-field">
              <label htmlFor="password">Mot de passe</label>
              <input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required />
            </div>
            <div className="registration-field">
              <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
              <input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" minLength={8} required />
            </div>
          </div>
          <button className="submit-button registration-submit" type="submit">Créer mon compte <span aria-hidden="true">→</span></button>
        </form>
        <Link className="registration-back" href="/">← Retour</Link>
      </section>
    </main>
  );
}
