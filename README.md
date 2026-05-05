# HealthMap – Plattform zur Suche von DEXA- und Bluttest-Anbietern

## Schnellstart

### Voraussetzungen

- Docker Desktop muss installiert und gestartet sein  
  <https://www.docker.com/products/docker-desktop/>

Falls der Befehl `docker` nicht erkannt wird:

- Docker Desktop starten
- Terminal neu öffnen

---

### Anwendung starten

1. Repository klonen

```bash
git clone https://github.com/NabilAlsamaan/bahmann-healthmap.git
cd bahmann-healthmap
```

1. Projekt starten:

```bash
docker compose up --build
```

Danach im Browser öffnen:

- <http://localhost:3000>
- <http://localhost:5000>

---

Eine professionelle, interaktive Web-Anwendung zur Suche von Anbietern für DEXA Body Composition Scans und Blutuntersuchungen für Selbstzahler. Entwickelt als umfassende Lösung im Rahmen der Coding Challenge der **Bahmann Coaching GmbH**.

Die HealthMap ermöglicht es Kunden, schnell und intuitiv die nächstgelegenen, verifizierten Partner-Praxen zu finden. Gleichzeitig bietet sie dem internen Team ein leistungsstarkes und abgesichertes Admin-Dashboard zur effizienten Verwaltung der Praxisdaten, inklusive Massenimport-Funktionen.

---

## Hauptfunktionen

### Für den Endnutzer (Kunden)

- **Interaktive Karte**: Schnelle und reaktionsfähige Visualisierung von Standorten mittels `React-Leaflet`.
- **Intelligente Standort-Erkennung**: Ermittlung der Nutzerkoordinaten und automatische Berechnung der Luftlinien-Distanz (Haversine-Formel) zur nächstgelegenen Praxis.
- **Kategorie-Filter**: Gezielte Suche nach spezifischen Leistungen (z. B. DXA, BIA, Bluttest, DEXA Premium).
- **Regionen-Fokus**: Schneller Wechsel zwischen vordefinierten Regionen (z. B. "Region Hannover") mit automatischem Map-Re-Centering.
- **Detaillierte Informationskarten**: Darstellung aller relevanten Praxisinformationen (Leistungen, Preise, Kontaktdaten) mit klaren Verifizierungs-Badges.

### Für Administratoren (Bahmann Coaching)

- **Sicheres Dashboard**: Geschützter Admin-Bereich mit JWT-Session-Management und rollenbasiertem Zugriff.
- **Umfassendes Praxis-Management (CRUD)**: Intuitive Formulare zum Anlegen, Bearbeiten und Deaktivieren (Soft-Delete) von Praxen.
- **Automatisierter CSV-Massenimport**: Blitzschnelles Onboarding hunderter neuer Praxen per Datei-Upload, inklusive automatischer Spalten-Validierung und Fehlerbehandlung.
- **Regionen-Management**: Möglichkeit, komplette Regionen per One-Click zu deaktivieren (ideal für Datenaktualisierungen).
- **Admin-Verwaltung & Audit-Logs**: Anlage neuer Mitarbeiter-Accounts, Passwort-Management und lückenlose Protokollierung aller Systemeingriffe im Audit-Log zur maximalen Transparenz.

---

## Datenbeschaffung & Qualität

Einer der wichtigsten Aspekte dieser Anwendung ist die hohe Datenqualität und die Erfüllung der fachlichen Anforderungen des Bahmann Coaching Teams:

- **DEXA vs. Body Composition**: Bei der Datenerfassung wurde penibel darauf geachtet, reine Orthopäden (die ausschließlich Knochendichtemessungen zur Osteoporose-Diagnostik anbieten) von Praxen zu unterscheiden, die tatsächliche **DEXA Body Composition Scans** (Fett-/Muskel-/Knochenanalyse) durchführen. In der Benutzeroberfläche und Datenbank wird dies über die `angebotene_leistungen` sowie dedizierte Kategorien ("DXA" vs. "DEXA Premium") differenziert.

- **Datenqualität über Quantität**: Jeder Eintrag besitzt ein `verifiziert`-Flag. Dies signalisiert dem Kunden durch ein Badge in der App sofort, dass die Angaben (Preise, Selbstzahler-Status, konkrete Leistungen) vom Team manuell oder systemisch geprüft wurden.

- **Skalierbarer Ansatz (Erweiterbarkeit & Scraping)**: Anstatt nur einen statischen, einmaligen Datensatz auszuliefern, wurde das System auf echtes Unternehmenswachstum ausgelegt. Über den **CSV-Massenimport im Admin-Dashboard** können Datensätze, die extern gesammelt wurden (z.B. durch Python Web-Scraping von Arztportalen oder manuelle VA-Recherche), in Sekundenschnelle hochgeladen werden. Das Backend validiert diese Daten automatisch und spielt sie live aus.

---

## Tech Stack

Die Architektur ist auf Skalierbarkeit, Sicherheit und Entwicklerfreundlichkeit ausgelegt.

- **Frontend**: React 19, Vite, Vanilla CSS (Custom Design System), React-Leaflet, PapaParse (für CSV-Verarbeitung)
- **Backend**: Node.js, Express.js
- **Datenbank**: MySQL 8.0
- **Sicherheit**: JWT (JSON Web Tokens), bcryptjs (Passwort-Hashing), Prepared Statements (SQL-Injection Schutz)
- **Infrastruktur**: Docker & Docker Compose

---

## Hinweise zum Setup

Die Anwendung ist vollständig containerisiert. Es sind keine lokalen Installationen von Node.js oder MySQL erforderlich.

Die Datenbank wird beim ersten Start automatisch initialisiert.  
Bei erneutem Ausführen von `docker compose up --build` können Daten zurückgesetzt werden.

---

## Standard-Login (Admin)

- **Benutzername**: admin  
- **Passwort**: admin123  

---

## Architektur & Sicherheitskonzept

1. **Secure Error Handling**: Das Backend fängt alle Datenbank-Fehler sauber ab. Dem Frontend werden nur generische Fehlermeldungen gesendet, um Schema-Leaks und Aufschlüsse über die Datenbankstruktur zu verhindern.

2. **Soft-Deletes**: Praxen werden niemals physisch aus der Datenbank gelöscht. Sie erhalten den Status `inaktiv`, um die Datenintegrität für Analysen und Audit-Logs zu wahren.

3. **Flaches Datenmodell**: Die `praxen`-Tabelle ist bewusst flach gehalten, um schnelle Read-Queries für die Kartenansicht zu gewährleisten und komplexe JOINs zu vermeiden.

4. **Environment Variables**: Strikt getrennte Konfigurationen für lokale Entwicklung und Docker-Deployments (z. B. `VITE_API_URL`, `DB_HOST`).

---

## Roadmap / Potenzielle Erweiterungen

Sollte das Projekt weiter skaliert werden, bieten sich folgende Optimierungen an:

- **React-Router Integration**: Auflösung des aktuellen Single-File-Component-Ansatzes (`App.jsx`) durch ein echtes Routing (z.B. `/`, `/admin`, `/login`) zur besseren Code-Wartbarkeit.
- **Geocoding API**: Anbindung von Nominatim oder Mapbox, um Adressdaten automatisch in Koordinaten umzuwandeln.
- **Marker-Clustering**: Implementierung von `react-leaflet-cluster` für bessere Performance bei vielen Einträgen.
- **Automatisierte Health-Checks (Cron Jobs)**: Regelmäßige Überprüfung von Webseiten (HTTP Status 200).
- **Erweiterung der Datenbasis**
- **Datenvalidierung & Qualitätssicherung**
- **Rollen- und Rechtemanagement**
- **Erweiterte Such- und Filterfunktionen**

---

## Lizenz / Nutzung

Dieses Projekt wurde im Rahmen einer Bewerbungsaufgabe für die Bahmann Coaching GmbH entwickelt.

Die Nutzung, Vervielfältigung oder Weitergabe des Codes ist ohne ausdrückliche Zustimmung nicht gestattet.

© 2026 Nabil Alsamaan
