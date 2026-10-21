"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Registration = { firstName?: string };
type Personal = { firstName?: string; city?: string };
type Weather = { temperature: number; code: number };

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function weatherLabel(code: number) {
  if (code === 0) return ["Ensoleillé", "☀️"];
  if (code <= 3) return ["Partiellement nuageux", "⛅"];
  if (code <= 48) return ["Nuageux", "☁️"];
  if (code <= 67 || (code >= 80 && code <= 82)) return ["Pluie", "🌧️"];
  if (code >= 71 && code <= 77) return ["Neige", "❄️"];
  if (code >= 95) return ["Orage", "⛈️"];
  return ["Conditions variables", "🌤️"];
}

const quickLinks = [
  { href: "/evenements", icon: "⌖", title: "Carte des événements", description: "Découvrir des sorties" },
  { href: "/messages", icon: "☏", title: "Messages", description: "Discuter avec mes amis" },
  { href: "/profil/qr-code", icon: "▦", title: "Mon QR code", description: "Ajouter des amis" },
  { href: "/parametres", icon: "⚙", title: "Paramètres", description: "Gérer mon compte" },
];

const navigation = [
  { href: "/accueil", icon: "⌂", label: "Accueil" },
  { href: "/evenements", icon: "⌖", label: "Carte" },
  { href: "/messages", icon: "☏", label: "Messages" },
  { href: "/profil/creer/rencontres", icon: "◉", label: "Profil" },
  { href: "/parametres", icon: "⚙", label: "Réglages" },
];

export default function UserDashboard() {
  const [profile, setProfile] = useState<{ firstName: string; city: string; photo: string }>({ firstName: "ami·e", city: "", photo: "" });
  const { firstName, city, photo } = profile;
  const [weather, setWeather] = useState<Weather | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherUnavailable, setWeatherUnavailable] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const personal = readJson<Personal>("findfriends-profile-personal", {});
      const registration = readJson<Registration>("findfriends-registration", {});
      let profilePhoto = "";
      try {
        profilePhoto = window.localStorage.getItem("findfriends-profile-main-photo") ?? "";
      } catch {
        profilePhoto = "";
      }
      setProfile({ firstName: personal.firstName || registration.firstName || "ami·e", city: personal.city || "", photo: profilePhoto });
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!city) return;
    const controller = new AbortController();
    const loadWeather = async () => {
      setWeatherLoading(true);
      setWeatherUnavailable(false);
      try {
        const geoResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=fr&format=json`, { signal: controller.signal });
        if (!geoResponse.ok) throw new Error("Géolocalisation indisponible");
        const geo = await geoResponse.json() as { results?: Array<{ latitude: number; longitude: number }> };
        const place = geo.results?.[0];
        if (!place) throw new Error("Ville introuvable");
        const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,weather_code&timezone=auto`, { signal: controller.signal });
        if (!weatherResponse.ok) throw new Error("Météo indisponible");
        const data = await weatherResponse.json() as { current?: { temperature_2m: number; weather_code: number } };
        if (!data.current) throw new Error("Météo indisponible");
        setWeather({ temperature: data.current.temperature_2m, code: data.current.weather_code });
      } catch {
        if (!controller.signal.aborted) setWeatherUnavailable(true);
      } finally {
        if (!controller.signal.aborted) setWeatherLoading(false);
      }
    };
    void loadWeather();
    return () => controller.abort();
  }, [city]);

  const upcomingActivities: never[] = [];
  const conditions = weather ? weatherLabel(weather.code) : null;
  const unavailableDestinations = new Set(["/evenements", "/messages", "/profil/qr-code", "/parametres"]);

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <Link className="dashboard-brand" href="/accueil" aria-label="Find New Friends, accueil">
          <span className="dashboard-brand-mark" aria-hidden="true"><svg viewBox="0 0 32 32" fill="none"><circle cx="12" cy="11" r="4" /><circle cx="22" cy="13" r="3" /><path d="M4.5 25c.7-4.1 3.2-6.2 7.5-6.2s6.8 2.1 7.5 6.2M19 19.4c3.8-.5 6.6 1.4 7.5 4.6M24 4v6M21 7h6" /></svg></span>
          Find New Friends
        </Link>
        <Link className="dashboard-avatar" href="/profil/creer/rencontres" aria-label="Voir mon profil">
          {photo ? <img src={photo} alt="" /> : <span>{firstName.slice(0, 1).toUpperCase()}</span>}
        </Link>
      </header>

      <div className="dashboard-content">
        <section className="dashboard-welcome" aria-labelledby="dashboard-greeting">
          <div>
            <span className="dashboard-eyebrow">TON ESPACE PERSONNEL</span>
            <h1 id="dashboard-greeting">Bonjour, {firstName} !</h1>
            <p>Prêt·e à faire de nouvelles rencontres aujourd’hui ?</p>
          </div>
          <div className="dashboard-weather" aria-live="polite">
            <span className="dashboard-weather-icon" aria-hidden="true">{conditions?.[1] ?? (weatherLoading ? "…" : "🌤️")}</span>
            <div>
              {weatherLoading ? <strong>Chargement de la météo…</strong> : weather && conditions ? <><strong>{Math.round(weather.temperature)}°C · {conditions[0]}</strong><span>{city}</span></> : weatherUnavailable ? <><strong>Météo indisponible</strong><span>{city || "Vérifie ta ville dans ton profil"}</span></> : <><strong>Ajoute ta ville</strong><span>pour afficher la météo locale</span></>}
            </div>
          </div>
        </section>

        <section className="dashboard-section" aria-labelledby="activities-title">
          <div className="dashboard-section-heading"><div><span className="dashboard-eyebrow">TES RENDEZ-VOUS</span><h2 id="activities-title">Mes prochaines activités</h2></div></div>
          {upcomingActivities.length ? <div className="dashboard-activity-list">{upcomingActivities.map((activity) => <article key={activity} />)}</div> : (
            <div className="dashboard-empty-state">
              <span className="dashboard-empty-icon" aria-hidden="true">✦</span>
              <div><strong>Tu n’es inscrit·e à aucune activité pour le moment.</strong><p>Explore les sorties près de chez toi et trouve ta prochaine activité.</p></div>
              <Link className="submit-button dashboard-discover-button" href="/evenements">Découvrir des activités <span aria-hidden="true">→</span></Link>
            </div>
          )}
        </section>

        <section className="dashboard-section" aria-labelledby="quick-access-title">
          <div className="dashboard-section-heading"><div><span className="dashboard-eyebrow">TOUT À PORTÉE DE MAIN</span><h2 id="quick-access-title">Accès rapide</h2></div></div>
          <div className="dashboard-quick-grid">
            {quickLinks.map(({ href, icon, title, description }) => <Link className="dashboard-quick-card" href={href} key={title} aria-label={`${title} (destination provisoire)`}><span className="dashboard-quick-icon" aria-hidden="true">{icon}</span><span className="dashboard-quick-copy"><strong>{title}</strong><span>{description}</span>{unavailableDestinations.has(href) && <small className="dashboard-provisional">Page à venir</small>}</span><span className="dashboard-quick-arrow" aria-hidden="true">→</span></Link>)}
          </div>
        </section>
      </div>

      <nav className="dashboard-nav" aria-label="Navigation principale">
        {navigation.map(({ href, icon, label }) => <Link href={href} key={label} className={`dashboard-nav-item ${label === "Accueil" ? "is-active" : ""}`} aria-current={label === "Accueil" ? "page" : undefined} aria-label={unavailableDestinations.has(href) ? `${label} — page à venir` : label}><span aria-hidden="true">{icon}</span><small>{label}</small></Link>)}
      </nav>
    </main>
  );
}
