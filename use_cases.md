# Use Case Katalog: HealthMap

Dieses Dokument bietet eine detaillierte und strukturierte Übersicht aller Anwendungsfälle (Use Cases), die im HealthMap-Projekt implementiert wurden. Die Use Cases sind unterteilt in die Perspektiven des **Endnutzers** (Kunden) und des **Administrators** (Mitarbeiter von Bahmann Coaching).

---

## 👤 1. Endnutzer (Kunde)

Der Endnutzer interagiert hauptsächlich mit der Kartenansicht, um nach geeigneten Laboren oder Praxen zu suchen.

### UC-1.1: Region auswählen & Karte zentrieren
- **Beschreibung**: Der Nutzer kann über ein Dropdown-Menü im Header seine gewünschte Region (z. B. "Region Hannover", "Braunschweig") auswählen.
- **Ergebnis**: Die Karte lädt die Praxen dieser Region und zentriert sich automatisch so, dass alle Marker der Region sichtbar sind (Auto-Zoom).

### UC-1.2: Praxen nach Kategorie filtern
- **Beschreibung**: Der Nutzer kann über das Filter-Menü auf der Karte gezielt nach bestimmten Praxis-Typen suchen.
- **Kategorien**: "Alle", "DXA", "BIA", "DEXA Premium", "Bluttest".
- **Ergebnis**: Es werden nur noch die Marker der ausgewählten Kategorie auf der Karte angezeigt.

### UC-1.3: Eigenen Standort ermitteln & nächste Praxis finden
- **Beschreibung**: Ein Klick auf den Standort-Button (`⌖`) fragt die Geolocation des Nutzers ab.
- **Ergebnis**: Die Karte springt zum Standort des Nutzers (violetter Marker). Das System berechnet per Haversine-Formel (Luftlinie) die Entfernung zu allen angezeigten Praxen und markiert die nächstgelegene Praxis mit einem gelben Stern-Icon. Ein Popup zeigt die exakte Entfernung in Kilometern an.

### UC-1.4: Praxis-Details einsehen
- **Beschreibung**: Ein Klick (oder Mouseover) auf einen Praxis-Marker öffnet eine Detailkarte.
- **Enthaltene Daten**: Name, Kategorie, Verifizierungs-Status, genaue Leistungen, Adresse, Telefonnummer, Preis (falls vorhanden) und ein anklickbarer Link zur Website.

### UC-1.5: Informationen & Hilfe abrufen
- **Beschreibung**: Über das Seitenmenü (Sidebar) kann der Nutzer Erklärungen zu den Fachbegriffen abrufen.
- **Ergebnis**: Info-Popups erklären verständlich, was "DXA / DEXA" oder "BIA" bedeutet, und bieten Support-Kontaktdaten.

---

## 🛡️ 2. Administrator (Bahmann Coaching Team)

Das Admin-Panel dient der dynamischen Datenpflege und der Verwaltung von Benutzerrechten.

### UC-2.1: Admin-Login & Session Management
- **Beschreibung**: Ein Klick auf "Anmelden" öffnet das Login-Popup.
- **Sicherheit**: Der Login erfordert Username und Passwort. Das Backend validiert das verschlüsselte Passwort (bcrypt) und stellt ein JWT (JSON Web Token) für die Session aus. Die Session läuft automatisch nach einer festgelegten Zeit ab.

### UC-2.2: Praxen manuell verwalten (CRUD)
- **Praxis anlegen**: Der Admin kann über ein Formular eine einzelne, neue Praxis mit allen Details (inklusive Koordinaten, Status und Verifizierung) hinzufügen.
- **Praxis bearbeiten**: Fehlerhafte Praxisdaten können direkt über die Listenansicht korrigiert werden.
- **Praxis deaktivieren**: Praxen, die geschlossen sind oder die Leistungen nicht mehr anbieten, können deaktiviert werden (Soft-Delete: Status wechselt auf "inaktiv", Praxis verschwindet von der Karte).

### UC-2.3: CSV-Import (Massenverarbeitung)
- **Beschreibung**: Um schnell hunderte Praxen hinzuzufügen, kann der Admin eine `.csv`-Datei hochladen.
- **Ablauf**: Der Admin wählt die Ziel-Region, lädt die CSV hoch und das Backend importiert die Daten automatisch in die Datenbank. Validierungsfehler (fehlende Spalten) werden dabei abgefangen.

### UC-2.4: Region deaktivieren (Massen-Deaktivierung)
- **Beschreibung**: Ein Admin kann per Knopfdruck *alle* Praxen einer bestimmten Region auf einmal deaktivieren.
- **Nutzen**: Sehr hilfreich, wenn z. B. eine Region durch einen neuen, besseren CSV-Datensatz komplett ersetzt werden soll, ohne hunderte Praxen einzeln löschen zu müssen.

### UC-2.5: CSV-Export (Datensicherung)
- **Beschreibung**: Der Admin kann per Knopfdruck alle in der Datenbank vorhandenen Praxen (aktiv und inaktiv) in eine saubere `.csv`-Datei exportieren und herunterladen.

### UC-2.6: Admin-Accounts verwalten
- **Neuen Admin erstellen**: Superadmins können weitere Admins (oder Superadmins) im System anlegen.
- **Passwort ändern**: Jeder Admin kann sein eigenes Passwort (unter Eingabe des alten Passworts) ändern. Superadmins können Passwörter von anderen Admins zurücksetzen.
- **Admin löschen**: Veraltete Accounts können gelöscht werden (der eigene Account ist vor versehentlicher Löschung geschützt).

### UC-2.7: Audit-Log (Admin-Log) einsehen
- **Beschreibung**: Das Backend protokolliert jede datenverändernde Aktion (Login, Praxis erstellt, Region gelöscht, CSV importiert).
- **Nutzen**: Im "Admin-Log" Reiter kann exakt nachvollzogen werden, welcher Admin zu welcher Uhrzeit welche Aktion durchgeführt hat. Gewährleistet volle Transparenz im Team.
