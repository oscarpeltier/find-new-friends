"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";

type AddressSuggestion = { label: string; lat: number; lon: number };

type Registration = { firstName?: string };
type Personal = { firstName?: string; city?: string };
type Weather = { temperature: number; code: number };
type HourlyWeather = { time: string; temperature: number; code: number };
type Activity = { id: string; name: string; date: string; time: string; location: string; latitude?: number; longitude?: number; description?: string; category?: string };

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
  { href: "/amis", icon: "▦", title: "Mon QR code", description: "Ajouter des amis" },
  { href: "/parametres", icon: "⚙", title: "Paramètres", description: "Gérer mon compte" },
];

const eventCategories = [
  { name: "Sport", emoji: "⚽" },
  { name: "Jeux vidéo", emoji: "🎮" },
  { name: "Cinéma", emoji: "🎬" },
  { name: "Musique", emoji: "🎵" },
  { name: "Restaurant", emoji: "🍽️" },
  { name: "Sorties et soirées", emoji: "🎉" },
  { name: "Culture", emoji: "🎨" },
  { name: "Nature et randonnée", emoji: "🌿" },
  { name: "Voyages", emoji: "✈️" },
  { name: "Jeux de société", emoji: "🎲" },
  { name: "Lecture", emoji: "📚" },
  { name: "Autres activités", emoji: "✨" },
];

const navigation = [
  { href: "/accueil", icon: "⌂", label: "Accueil" },
  { href: "/evenements", icon: "⌖", label: "Carte" },
  { href: "/messages", icon: "☏", label: "Messages" },
  { href: "/amis", icon: "♧", label: "Mes amis" },
  { href: "/profil/creer/rencontres", icon: "◉", label: "Profil" },
  { href: "/parametres", icon: "⚙", label: "Réglages" },
];

export default function UserDashboard() {
  const [profile, setProfile] = useState<{ firstName: string; city: string; photo: string }>({ firstName: "ami·e", city: "", photo: "" });
  const { firstName, city, photo } = profile;
  const [weather, setWeather] = useState<Weather | null>(null);
  const [hourlyWeather, setHourlyWeather] = useState<HourlyWeather[]>([]);
  const [showHourlyWeather, setShowHourlyWeather] = useState(false);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherUnavailable, setWeatherUnavailable] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [activityError, setActivityError] = useState("");
  const [addressQuery, setAddressQuery] = useState("");
  const [addressSuggestions, setAddressSuggestions] = useState<AddressSuggestion[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<AddressSuggestion | null>(null);
  const [addressLoading, setAddressLoading] = useState(false);
  const [addressError, setAddressError] = useState("");
  const [unreadMessages, setUnreadMessages] = useState(0);

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
      setActivities(readJson<Activity[]>("findfriends-profile-activities", []));
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const refreshUnreadMessages = () => {
      try {
        const settings = readJson<{ notifications?: boolean; messageAlerts?: boolean }>("findfriends-settings-v1", {});
        const conversations = readJson<Array<{ messages?: Array<{ fromMe?: boolean; read?: boolean }> }>>("findfriends-local-messages-v1", []);
        setUnreadMessages(settings.notifications !== false && settings.messageAlerts !== false
          ? conversations.reduce((total, conversation) => total + (conversation.messages ?? []).filter((message) => !message.fromMe && !message.read).length, 0)
          : 0);
      } catch { setUnreadMessages(0); }
    };
    const timer = window.setTimeout(refreshUnreadMessages, 0);
    window.addEventListener("storage", refreshUnreadMessages);
    window.addEventListener("findfriends-messages-updated", refreshUnreadMessages);
    window.addEventListener("findfriends-settings-updated", refreshUnreadMessages);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("storage", refreshUnreadMessages);
      window.removeEventListener("findfriends-messages-updated", refreshUnreadMessages);
      window.removeEventListener("findfriends-settings-updated", refreshUnreadMessages);
    };
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
        const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,weather_code&hourly=temperature_2m,weather_code&forecast_hours=24&timezone=auto`, { signal: controller.signal });
        if (!weatherResponse.ok) throw new Error("Météo indisponible");
        const data = await weatherResponse.json() as {
          current?: { temperature_2m: number; weather_code: number };
          hourly?: { time: string[]; temperature_2m: number[]; weather_code: number[] };
        };
        if (!data.current) throw new Error("Météo indisponible");
        setWeather({ temperature: data.current.temperature_2m, code: data.current.weather_code });
        const hours = data.hourly;
        if (!hours || hours.time.length === 0) throw new Error("Prévisions horaires indisponibles");
        setHourlyWeather(hours.time.map((time, index) => ({
          time,
          temperature: hours.temperature_2m[index],
          code: hours.weather_code[index],
        })).filter((hour) => Number.isFinite(hour.temperature) && Number.isFinite(hour.code)));
      } catch {
        if (!controller.signal.aborted) setWeatherUnavailable(true);
      } finally {
        if (!controller.signal.aborted) setWeatherLoading(false);
      }
    };
    void loadWeather();
    return () => controller.abort();
  }, [city]);

  useEffect(() => {
    const query = addressQuery.trim();
    if (query.length < 3 || selectedAddress?.label === query) return;

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setAddressLoading(true);
      setAddressError("");
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=5&accept-language=fr&q=${encodeURIComponent(query)}`, { signal: controller.signal });
        if (!response.ok) throw new Error("La recherche d’adresses est indisponible.");
        const results = await response.json() as Array<{ display_name: string; lat: string; lon: string }>;
        setAddressSuggestions(results.map((result) => ({ label: result.display_name, lat: Number(result.lat), lon: Number(result.lon) })));
        if (results.length === 0) setAddressError("Aucune adresse trouvée. Essaie avec une ville ou une adresse plus précise.");
      } catch {
        if (!controller.signal.aborted) setAddressError("Impossible de rechercher cette adresse pour le moment.");
      } finally {
        if (!controller.signal.aborted) setAddressLoading(false);
      }
    }, 600);

    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [addressQuery, selectedAddress]);

  const upcomingActivities = activities;
  const conditions = weather ? weatherLabel(weather.code) : null;
  const unavailableDestinations = new Set(["/evenements"]);

  function openActivityEditor(activity: Activity) {
    setEditingActivity(activity);
    setAddressQuery(activity.location);
    setSelectedAddress(activity.latitude !== undefined && activity.longitude !== undefined
      ? { label: activity.location, lat: activity.latitude, lon: activity.longitude }
      : null);
    setAddressSuggestions([]);
    setAddressError("");
    setActivityError("");
    setShowActivityForm(true);
  }

  function createActivity(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const activity: Activity = {
      id: editingActivity?.id ?? `${Date.now()}`,
      name: String(formData.get("activityName") ?? "").trim(),
      date: String(formData.get("activityDate") ?? ""),
      time: String(formData.get("activityTime") ?? ""),
      location: selectedAddress?.label ?? "",
      latitude: selectedAddress?.lat,
      longitude: selectedAddress?.lon,
      description: String(formData.get("activityDescription") ?? "").trim(),
      category: String(formData.get("activityCategory") ?? ""),
    };
    if (!selectedAddress || !Number.isFinite(selectedAddress.lat) || !Number.isFinite(selectedAddress.lon)) {
      setActivityError("Choisis une adresse dans les suggestions avant d’enregistrer l’événement.");
      return;
    }
    try {
      const updated = (editingActivity
        ? activities.map((existing) => existing.id === editingActivity.id ? activity : existing)
        : [...activities, activity]
      ).sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`));
      window.localStorage.setItem("findfriends-profile-activities", JSON.stringify(updated));
      window.dispatchEvent(new Event("findfriends-activities-updated"));
      event.currentTarget.reset();
      setActivities(updated);
      setActivityError("");
      setShowActivityForm(false);
      setEditingActivity(null);
      setAddressQuery("");
      setAddressSuggestions([]);
      setSelectedAddress(null);
      setAddressError("");
    } catch {
      setActivityError("Impossible d’enregistrer l’événement sur cet appareil.");
    }
  }

  function deleteActivity(activity: Activity) {
    if (!window.confirm(`Supprimer l’événement « ${activity.name} » ? Cette action est définitive.`)) return;
    const updated = activities.filter((existing) => existing.id !== activity.id);
    try {
      window.localStorage.setItem("findfriends-profile-activities", JSON.stringify(updated));
      window.dispatchEvent(new Event("findfriends-activities-updated"));
      setActivities(updated);
      if (editingActivity?.id === activity.id) {
        setEditingActivity(null);
        setShowActivityForm(false);
        setAddressQuery("");
        setSelectedAddress(null);
      }
      setActivityError("");
    } catch {
      setActivityError("Impossible de supprimer l’événement sur cet appareil.");
    }
  }

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
          <div className="dashboard-weather-block">
            <button className="dashboard-weather" type="button" aria-live="polite" aria-expanded={showHourlyWeather} aria-controls="dashboard-hourly-weather" disabled={!weather || hourlyWeather.length === 0} onClick={() => setShowHourlyWeather((visible) => !visible)}>
              <span className="dashboard-weather-icon" aria-hidden="true">{conditions?.[1] ?? (weatherLoading ? "…" : "🌤️")}</span>
              <span className="dashboard-weather-copy">
                {weatherLoading ? <strong>Chargement de la météo…</strong> : weather && conditions ? <><strong>{Math.round(weather.temperature)}°C · {conditions[0]}</strong><span>{city} · Voir les prochaines 24 h</span></> : weatherUnavailable ? <><strong>Météo indisponible</strong><span>{city || "Vérifie ta ville dans ton profil"}</span></> : <><strong>Ajoute ta ville</strong><span>pour afficher la météo locale</span></>}
              </span>
            </button>
            {showHourlyWeather && hourlyWeather.length > 0 && (
              <div className="dashboard-hourly-weather" id="dashboard-hourly-weather" aria-label="Prévisions météo heure par heure">
                {hourlyWeather.map((hour) => {
                  const [label, icon] = weatherLabel(hour.code);
                  const date = new Date(hour.time);
                  return <div className="dashboard-hourly-item" key={hour.time}><time dateTime={hour.time}>{date.toLocaleString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</time><span aria-hidden="true">{icon}</span><strong>{Math.round(hour.temperature)}°</strong><small>{label}</small></div>;
                })}
              </div>
            )}
          </div>
        </section>

        <section className="dashboard-section" aria-labelledby="activities-title">
          <div className="dashboard-section-heading"><div><span className="dashboard-eyebrow">TES RENDEZ-VOUS</span><h2 id="activities-title">Mes prochains événements</h2><Link className="dashboard-activities-map-link" href="/evenements">Voir la carte des événements <span aria-hidden="true">→</span></Link></div><button className="dashboard-create-button" type="button" onClick={() => { if (showActivityForm) { setShowActivityForm(false); setEditingActivity(null); setAddressQuery(""); setSelectedAddress(null); } else { setShowActivityForm(true); setEditingActivity(null); } setActivityError(""); }}>{showActivityForm ? "Fermer" : "+ Créer un événement"}</button></div>
          {showActivityForm && (
            <form className="dashboard-event-form" onSubmit={createActivity}>
              <h3>{editingActivity ? "Modifier l’événement" : "Organiser un événement"}</h3>
              {activityError && <p className="registration-error" role="alert">{activityError}</p>}
              <label>Nom de l’événement<input name="activityName" required maxLength={80} defaultValue={editingActivity?.name ?? ""} placeholder="Ex. : Café entre amis" /></label>
              <div className="dashboard-event-fields"><label>Date<input name="activityDate" type="date" required min={new Date().toISOString().slice(0, 10)} defaultValue={editingActivity?.date ?? ""} /></label><label>Heure<input name="activityTime" type="time" required defaultValue={editingActivity?.time ?? ""} /></label></div>
              <label>Description<textarea className="dashboard-event-description" name="activityDescription" rows={4} maxLength={1000} defaultValue={editingActivity?.description ?? ""} placeholder="Décris ton événement et donne envie aux autres de participer…" /></label>
              <fieldset className="dashboard-category-fieldset">
                <legend>Type d’événement</legend>
                <div className="dashboard-category-grid">
                  {eventCategories.map(({ name, emoji }) => (
                    <label className="dashboard-category-option" key={name}>
                      <input type="radio" name="activityCategory" value={name} required defaultChecked={editingActivity?.category === name} />
                      <span className="dashboard-category-emoji" aria-hidden="true">{emoji}</span>
                      <span>{name}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <div className="dashboard-address-field">
                <label htmlFor="activityLocation">Lieu de l’événement</label>
                <input
                  id="activityLocation"
                  name="activityLocation"
                  type="search"
                  autoComplete="off"
                  required
                  maxLength={160}
                  value={addressQuery}
                  aria-describedby="activity-address-help"
                  aria-controls="activity-address-suggestions"
                  placeholder="Saisis une adresse ou un lieu"
                  onChange={(change) => {
                    setAddressQuery(change.target.value);
                    setAddressSuggestions([]);
                    setSelectedAddress(null);
                    setAddressError("");
                    setActivityError("");
                  }}
                />
                <small id="activity-address-help">Choisis une adresse dans les suggestions pour placer l’épingle.</small>
                {addressLoading && <small role="status">Recherche des adresses…</small>}
                {addressError && <small className="dashboard-address-error" role="status">{addressError}</small>}
                {addressSuggestions.length > 0 && (
                  <ul className="dashboard-address-suggestions" id="activity-address-suggestions" role="listbox" aria-label="Adresses proposées">
                    {addressSuggestions.map((suggestion) => (
                      <li key={`${suggestion.lat}-${suggestion.lon}`}>
                        <button type="button" role="option" aria-selected={selectedAddress?.label === suggestion.label} onClick={() => {
                          setSelectedAddress(suggestion);
                          setAddressQuery(suggestion.label);
                          setAddressSuggestions([]);
                          setAddressError("");
                        }}>{suggestion.label}</button>
                      </li>
                    ))}
                  </ul>
                )}
                {selectedAddress && <small className="dashboard-address-selected">Adresse sélectionnée ; l’épingle sera placée sur la carte.</small>}
              </div>
              <button className="submit-button" type="submit">{editingActivity ? "Enregistrer les modifications" : "Enregistrer l’événement"} <span aria-hidden="true">→</span></button>
              {editingActivity && <button className="dashboard-delete-event" type="button" onClick={() => deleteActivity(editingActivity)}>Supprimer cet événement</button>}
              <p>Événement enregistré uniquement sur cet appareil, pas encore partagé avec d’autres utilisateurs.</p>
            </form>
          )}
          {upcomingActivities.length ? <div className="dashboard-activity-list">{upcomingActivities.map((activity) => <article className="dashboard-activity-card" key={activity.id}><span className="dashboard-empty-icon" aria-hidden="true">✦</span><div><strong>{activity.name}</strong><p>{activity.date} · {activity.time} · {activity.location}</p>{activity.category && <small className="dashboard-activity-category">{eventCategories.find((category) => category.name === activity.category)?.emoji} {activity.category}</small>}{activity.description && <p className="dashboard-activity-description">{activity.description}</p>}</div><button className="dashboard-quick-arrow dashboard-activity-edit" type="button" aria-label={`Modifier ${activity.name}`} onClick={() => openActivityEditor(activity)}>→</button></article>)}</div> : (
            <div className="dashboard-empty-state">
              <span className="dashboard-empty-icon" aria-hidden="true">✦</span>
              <div><strong>Tu n’es inscrit·e à aucun événement pour le moment.</strong><p>Explore les sorties près de chez toi et trouve ton prochain événement.</p></div>
              <Link className="submit-button dashboard-discover-button" href="/evenements">Découvrir les événements <span aria-hidden="true">→</span></Link>
            </div>
          )}
        </section>

        <section className="dashboard-section" aria-labelledby="quick-access-title">
          <div className="dashboard-section-heading"><div><span className="dashboard-eyebrow">TOUT À PORTÉE DE MAIN</span><h2 id="quick-access-title">Accès rapide</h2></div></div>
          <div className="dashboard-quick-grid">
            {quickLinks.map(({ href, icon, title, description }) => <Link className="dashboard-quick-card" href={href} key={title} aria-label={unavailableDestinations.has(href) ? `${title} (destination provisoire)` : title}><span className="dashboard-quick-icon" aria-hidden="true">{icon}{href === "/messages" && unreadMessages > 0 && <i className="dashboard-unread-badge">{unreadMessages}</i>}</span><span className="dashboard-quick-copy"><strong>{title}{href === "/messages" && unreadMessages > 0 && <span className="dashboard-inline-unread"> · {unreadMessages} non lu{unreadMessages > 1 ? "s" : ""}</span>}</strong><span>{description}</span>{unavailableDestinations.has(href) && <small className="dashboard-provisional">Page à venir</small>}</span><span className="dashboard-quick-arrow" aria-hidden="true">→</span></Link>)}
          </div>
        </section>
      </div>

      <nav className="dashboard-nav" aria-label="Navigation principale">
        {navigation.map(({ href, icon, label }) => <Link href={href} key={label} className={`dashboard-nav-item ${label === "Accueil" ? "is-active" : ""}`} aria-current={label === "Accueil" ? "page" : undefined} aria-label={unavailableDestinations.has(href) ? `${label} — page à venir` : label}><span aria-hidden="true">{icon}</span><small>{label}</small></Link>)}
      </nav>
    </main>
  );
}
