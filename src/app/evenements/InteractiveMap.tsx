"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useRef } from "react";

type ActivityPin = {
  id: string;
  name: string;
  date: string;
  time: string;
  location: string;
  latitude?: number;
  longitude?: number;
  description?: string;
  category?: string;
};

const pinIcon = L.divIcon({
  className: "events-map-marker",
  html: '<span class="events-map-marker-shape" aria-hidden="true"></span>',
  iconSize: [38, 46],
  iconAnchor: [19, 42],
  popupAnchor: [0, -40],
});

function readActivities(): ActivityPin[] {
  try {
    const raw = window.localStorage.getItem("findfriends-profile-activities");
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((activity): activity is ActivityPin =>
      typeof activity === "object" && activity !== null &&
      typeof activity.id === "string" && typeof activity.name === "string" &&
      typeof activity.location === "string",
    );
  } catch {
    return [];
  }
}

export default function InteractiveMap() {
  const mapElement = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapElement.current) return;

    const map = L.map(mapElement.current, { zoomControl: false, scrollWheelZoom: true }).setView([48.8566, 2.3522], 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);
    L.control.zoom({ position: "bottomright" }).addTo(map);

    const markers = L.featureGroup().addTo(map);
    const refreshActivities = () => {
      markers.clearLayers();
      const activities = readActivities();
      for (const activity of activities) {
        if (!Number.isFinite(activity.latitude) || !Number.isFinite(activity.longitude)) continue;
        const lat = activity.latitude as number;
        const lon = activity.longitude as number;
        if (Math.abs(lat) > 90 || Math.abs(lon) > 180) continue;
        const safeName = document.createElement("span");
        safeName.textContent = activity.name;
        const safeLocation = document.createElement("span");
        safeLocation.textContent = activity.location;
        const marker = L.marker([lat, lon], { icon: pinIcon });
        const popup = document.createElement("div");
        const heading = document.createElement("strong");
        heading.textContent = activity.name;
        popup.append(heading, document.createElement("br"));
        const category = document.createElement("span");
        category.textContent = activity.category ? `${activity.category} · ` : "";
        popup.append(category, document.createTextNode(`${activity.date} · ${activity.time}`), document.createElement("br"));
        popup.append(safeLocation);
        if (activity.description) {
          const description = document.createElement("p");
          description.textContent = activity.description;
          description.style.margin = "6px 0 0";
          popup.append(description);
        }
        marker.bindPopup(popup);
        marker.addTo(markers);
      }

      const markerBounds = markers.getBounds();
      if (markerBounds.isValid()) {
        if (markers.getLayers().length === 1) map.setView(markerBounds.getCenter(), 15);
        else map.fitBounds(markerBounds, { padding: [48, 48], maxZoom: 15 });
      }
      window.requestAnimationFrame(() => map.invalidateSize());
    };

    refreshActivities();
    window.addEventListener("storage", refreshActivities);
    window.addEventListener("focus", refreshActivities);
    window.addEventListener("findfriends-activities-updated", refreshActivities);
    const resizeObserver = new ResizeObserver(() => map.invalidateSize());
    resizeObserver.observe(mapElement.current);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("storage", refreshActivities);
      window.removeEventListener("focus", refreshActivities);
      window.removeEventListener("findfriends-activities-updated", refreshActivities);
      map.remove();
    };
  }, []);

  return <div ref={mapElement} className="events-leaflet-map" role="application" aria-label="Carte interactive OpenStreetMap" />;
}
