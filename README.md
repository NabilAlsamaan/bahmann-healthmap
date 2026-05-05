# HealthMap (Laborsuche DACH)

Eine interaktive Karte zur Suche von Anbietern für DEXA Body Composition Scans und Blutuntersuchungen für Selbstzahler. Entwickelt im Rahmen der Coding Challenge der Bahmann Coaching GmbH.

## Features

- **Interaktive Karte**: Visualisierung aller verifizierten Standorte via React-Leaflet.
- **Filter-System**: Filterung nach Kategorie (DXA, BIA, Bluttest, DEXA Premium).
- **Standort-Feature**: Berechnung der nächstgelegenen Praxis zum aktuellen Standort des Nutzers.
- **Admin Dashboard**: Verwaltung der Praxen (Erstellen, Bearbeiten, Deaktivieren).
- **CSV-Import**: Upload von weiteren Praxen über eine CSV-Datei direkt im Browser.
- **Sicherheit**: JWT-basiertes Login-System, bcrypt für Passwörter, Audit-Logs im Backend, SQL-Injection Schutz (Prepared Statements).

## Tech Stack

- **Frontend**: React (Vite), React-Leaflet, CSS (Vanilla)
- **Backend**: Node.js, Express, MySQL2, JWT, bcryptjs
- **Database**: MySQL 8
- **Deployment**: Docker & Docker Compose

## Lokales Setup (Docker)

Dieses Projekt ist für Docker Compose vorbereitet. Es wird kein lokales Node oder MySQL benötigt.

1. **Repository klonen**
2. **Container starten**:
   ```bash
   docker-compose up -d --build
   ```
3. **Anwendung öffnen**:
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:5000`

> **Hinweis**: Beim ersten Start führt der MySQL-Container automatisch die Datei `backend/database.sql` aus. Dadurch werden alle benötigten Tabellen (`praxen`, `users`, `admin_logs`) erstellt und ein initialer Admin-Benutzer angelegt.

### Admin Login (Standard)
- **Benutzername**: `admin`
- **Passwort**: `admin123`

## Architektur & Entscheidungen

1. **Backend-Sicherheit**: Sensible Datenbank-Fehler werden nicht an das Frontend weitergegeben, um Schema-Leaks zu verhindern (`Secure Error Handling`).
2. **Datenmodell**: Ein flaches, aber erweiterbares MySQL-Schema, das sich leicht um neue Felder oder Regionen erweitern lässt.
3. **CSV-Import (Bonus)**: Ermöglicht eine extrem schnelle Skalierung der Datenpflege, ohne dass Admins technisches Vorwissen benötigen.
4. **Environment Variables**: Dynamische `VITE_API_URL` anstelle hardcodierter Localhost-Verlinkungen, um Produktion und lokales Development sauber zu trennen.

## Was ich bei mehr Zeit noch machen würde

- **React-Router & Component Split**: Die `App.jsx` in mehrere Routen (`/`, `/admin`, `/login`) und separierte Komponenten (z.B. `Map.jsx`, `AdminPanel.jsx`) aufteilen, um das Single-File-Pattern aufzulösen.
- **Geocoding API**: Anstatt Latitude und Longitude manuell einzutragen, könnte das Backend über Mapbox oder Nominatim die Adresse automatisch in Koordinaten umwandeln.
- **Clustering**: Einsatz von `react-leaflet-cluster`, um Marker bei hunderten Einträgen in der Rauszoomen-Ansicht zusammenzufassen.
- **Cron Jobs**: Ein automatisierter Check, der monatlich prüft, ob die URLs der Praxen noch erreichbar sind (HTTP 200).
