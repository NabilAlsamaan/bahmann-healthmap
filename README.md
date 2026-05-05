# HealthMap – Plattform zur Suche von DEXA- und Bluttest-Anbietern

## Schnellstart

Projekt starten:

```bash
docker compose up --build
   ```

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

##  Datenbeschaffung & Qualität 

Einer der wichtigsten Aspekte dieser Anwendung ist die hohe Datenqualität und die Erfüllung der fachlichen Anforderungen des Bahmann Coaching Teams:

- **DEXA vs. Body Composition**: Bei der Datenerfassung wurde penibel darauf geachtet, reine Orthopäden (die ausschließlich Knochendichtemessungen zur Osteoporose-Diagnostik anbieten) von Praxen zu unterscheiden, die tatsächliche **DEXA Body Composition Scans** (Fett-/Muskel-/Knochenanalyse) durchführen. In der Benutzeroberfläche und Datenbank wird dies über die `angebotene_leistungen` sowie dedizierte Kategorien ("DXA" vs. "DEXA Premium") differenziert.

- **Datenqualität über Quantität**: Jeder Eintrag besitzt ein `verifiziert`-Flag. Dies signalisiert dem Kunden durch ein Badge in der App sofort, dass die Angaben (Preise, Selbstzahler-Status, konkrete Leistungen) vom Team manuell oder systemisch geprüft wurden.

- **Skalierbarer Ansatz (Erweiterbarkeit & Scraping)**: Anstatt nur einen statischen, einmaligen Datensatz auszuliefern, wurde das System auf echtes Unternehmenswachstum ausgelegt. Über den **CSV-Massenimport im Admin-Dashboard** können Datensätze, die extern gesammelt wurden (z.B. durch Python Web-Scraping von Arztportalen oder manuelle VA-Recherche), in Sekundenschnelle hochgeladen werden. Das Backend validiert diese Daten automatisch und spielt sie live aus.

---

##  Tech Stack

Die Architektur ist auf Skalierbarkeit, Sicherheit und Entwicklerfreundlichkeit ausgelegt.

- **Frontend**: React 19, Vite, Vanilla CSS (Custom Design System), React-Leaflet, PapaParse (für CSV-Verarbeitung)
- **Backend**: Node.js, Express.js
- **Datenbank**: MySQL 8.0
- **Sicherheit**: JWT (JSON Web Tokens), bcryptjs (Passwort-Hashing), Prepared Statements (SQL-Injection Schutz)
- **Infrastruktur**: Docker & Docker Compose

---

##  Lokales Setup (Docker)

Die Anwendung ist vollständig containerisiert. Es sind keine lokalen Installationen von Node.js oder MySQL erforderlich. Voraussetzung ist lediglich eine laufende **Docker**-Umgebung.

Hinweis:

Die Datenbank wird beim ersten Start automatisch initialisiert.
Bei erneutem Ausführen von "docker compose up --build" werden die Daten zurückgesetzt.

Für eine persistente Speicherung könnte ein Docker Volume verwendet werden.

1. **Repository klonen**
   ```bash
   git clone <repository-url>
   cd bahmann-healthmap
   ```

2. **Container starten** (baut die Images und startet die Services im Hintergrund)
   ```bash
   docker-compose up -d --build
   ```

3. **Anwendung aufrufen**
   - **Frontend (Kundenansicht & Admin-Panel)**: [http://localhost:3000](http://localhost:3000)

   - **Backend API**: [http://localhost:5000](http://localhost:5000)

>  **Hinweis zum ersten Start**: Der MySQL-Container initialisiert beim ersten Hochfahren automatisch die Datenbankstrukturen (`backend/database.sql`). Dabei werden alle benötigten   Tabellen generiert und ein initialer Super-Admin angelegt.

### Standard-Login (Admin)
- **Benutzername**: `admin`
- **Passwort**: `admin123`


---

##  Architektur & Sicherheitskonzept

1. **Secure Error Handling**: Das Backend fängt alle Datenbank-Fehler sauber ab. Dem Frontend werden nur generische Fehlermeldungen gesendet, um Schema-Leaks und Aufschlüsse über die Datenbankstruktur zu verhindern.

2. **Soft-Deletes**: Praxen werden niemals physisch aus der Datenbank gelöscht. Sie erhalten den Status `inaktiv`, um die Datenintegrität für Analysen und Audit-Logs zu wahren.

3. **Flaches Datenmodell**: Die `praxen`-Tabelle ist bewusst flach gehalten, um schnelle Read-Queries für die Kartenansicht zu gewährleisten und komplexe JOINs zu vermeiden.

4. **Environment Variables**: Strikt getrennte Konfigurationen für lokale Entwicklung und Docker-Deployments (z. B. `VITE_API_URL`, `DB_HOST`).

---

## Roadmap / Potenzielle Erweiterungen

Sollte das Projekt weiter skaliert werden, bieten sich folgende Optimierungen an:

- **React-Router Integration**: Auflösung des aktuellen Single-File-Component-Ansatzes (`App.jsx`) durch ein echtes Routing (z.B. `/`, `/admin`, `/login`) zur besseren Code-Wartbarkeit.

- **Geocoding API**: Anbindung von Nominatim oder Mapbox, um Adressdaten (Straße, PLZ, Ort) beim Speichern einer neuen Praxis automatisch in Längen- und Breitengrade umzuwandeln.

- **Marker-Clustering**: Implementierung von `react-leaflet-cluster`, um bei mehreren hundert Praxen auf einer Zoom-Stufe die Performance und Übersichtlichkeit zu wahren.

- **Automatisierte Health-Checks (Cron Jobs)**: Regelmäßige serverseitige Überprüfung, ob die hinterlegten Webseiten-URLs der Praxen noch erreichbar sind (HTTP Status 200).

- **Erweiterung der Datenbasis**: Die aktuell verwendeten Datensätze sind bewusst überschaubar gehalten, um den Fokus auf die Funktionalität und Systemarchitektur zu legen.  
  Bei weiterer Entwicklungszeit würde die Datenbasis signifikant erweitert werden (z.B. durch zusätzliche Quellen oder automatisierte Imports), um die Aussagekraft und Praxistauglichkeit des Systems zu erhöhen.

- **Datenvalidierung & Qualitätssicherung**: Einführung von serverseitigen Validierungsmechanismen (z.B. für Adressen, URLs und Pflichtfelder), um die Datenkonsistenz langfristig sicherzustellen.

- **Rollen- und Rechtemanagement**: Erweiterung des aktuellen Authentifizierungssystems um differenzierte Benutzerrollen (z.B. Admin, Editor), inklusive granularer Zugriffskontrolle.

- **Such- und Filterfunktionen**: Implementierung erweiterter Suchlogik (z.B. nach Fachrichtung, Standort, Verfügbarkeit), um die Benutzerfreundlichkeit deutlich zu steigern.
