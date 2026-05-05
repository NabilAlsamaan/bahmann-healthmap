# Use Case Katalog: Bahmann HealthMap

Dieses Dokument liefert eine professionelle und strukturierte Übersicht aller Anwendungsfälle (Use Cases), die im Rahmen des HealthMap-Projekts implementiert wurden. Die Use Cases unterteilen sich in zwei primäre Akteure: den **Endnutzer** (potenzieller Kunde von Bahmann Coaching) und den **Administrator** (interner Mitarbeiter).

---

## 1. Akteur: Endnutzer (Kunde)

Das primäre Ziel des Endnutzers ist es, möglichst reibungslos und schnell ein passendes Labor oder eine Praxis für diagnostische Leistungen in seiner Nähe zu finden.

### UC-1.1: Region auswählen und Karte fokussieren
- **Auslöser**: Der Nutzer öffnet die Anwendung und wählt über das Dropdown-Menü (Header) seine gewünschte Region (z. B. "Region Hannover").
- **Systemverhalten**: Das System fragt asynchron alle verifizierten und aktiven Praxen dieser spezifischen Region ab. Die Karte berechnet die optimalen Bounding-Box-Koordinaten (`FitBounds`) und zoomt mit einer weichen Animation exakt so herein, dass alle relevanten Praxen optimal sichtbar sind.
- **Mehrwert**: Der Nutzer muss nicht manuell auf der DACH-Karte nach seiner Region suchen.

### UC-1.2: Praxen nach diagnostischer Kategorie filtern
- **Auslöser**: Der Nutzer sucht spezifisch nach einer bestimmten Leistung (z. B. nur "Bluttest" oder "DXA"). Er klickt auf die Filter-Pillen oberhalb der Karte.
- **Systemverhalten**: Die angezeigten Marker auf der Karte werden in Echtzeit aktualisiert. Marker, die nicht der Kategorie entsprechen, werden sofort ausgeblendet.
- **Mehrwert**: Extreme Reduzierung des visuellen Rauschens bei hoher Praxisdichte; schnellere Entscheidungsfindung.

### UC-1.3: Nächstgelegene Praxis via Geolocation finden
- **Auslöser**: Der Nutzer klickt auf den Standort-Button (`⌖`) auf der Karte.
- **Systemverhalten**: Das System fordert die Browser-Berechtigung zur Standortermittlung an. Bei Freigabe springt die Karte zum Standort des Nutzers (violetter Marker). Gleichzeitig berechnet der Client über die Haversine-Formel die exakte Luftlinienentfernung zu allen aktuell gefilterten Praxen. Die nächstgelegene Praxis wird mit einem speziellen gelben Stern-Icon hervorgehoben und ein Benachrichtigungs-Popup zeigt die Distanz in Kilometern an.
- **Mehrwert**: Maximaler Komfort. Der Nutzer sieht sofort, wo er am schnellsten einen Termin vereinbaren kann.

### UC-1.4: Praxis-Details und Kontaktinformationen abrufen
- **Auslöser**: Der Nutzer klickt auf einen Praxis-Marker auf der Karte.
- **Systemverhalten**: Ein Popup (Detailkarte) öffnet sich. Es präsentiert übersichtlich alle wichtigen Meta-Daten: Praxisname, Verifizierungs-Badge (schafft Vertrauen), genaue Leistungsbeschreibung, Adresse, Telefonnummer, Preis für Selbstzahler sowie einen direkten Link zur Website.
- **Mehrwert**: Alle handlungsrelevanten Informationen sind auf einen Blick verfügbar, ohne die Seite verlassen zu müssen.

### UC-1.5: Fachbegriffe im Lexikon nachschlagen
- **Auslöser**: Ein neuer Nutzer versteht die Abkürzungen wie "DXA" oder "BIA" nicht und klickt auf den Info-Button (Sidebar).
- **Systemverhalten**: Ein Overlay öffnet sich, in dem die verschiedenen Messmethoden verständlich und laienhaft erklärt werden.
- **Mehrwert**: Reduzierung von Support-Anfragen; Aufklärung des Kunden direkt am Point-of-Sale.

---

##  2. Akteur: Administrator (Bahmann Team)

Das primäre Ziel des Administrators ist die fehlerfreie, sichere und effiziente Pflege des Praxis-Bestands sowie die Verwaltung des Systemzugangs.

### UC-2.1: Sicherer Login in das Admin-Dashboard
- **Auslöser**: Der Admin klickt auf "Anmelden" und gibt seine Zugangsdaten ein.
- **Systemverhalten**: Das Backend verifiziert die Anmeldedaten kryptografisch (bcrypt). Bei Erfolg wird ein zeitlich begrenztes JSON Web Token (JWT) ausgestellt. Der Client speichert dieses Token und schaltet das Admin-Panel frei. Nach Ablauf der Session wird der Admin automatisch sicher ausgeloggt.
- **Mehrwert**: Sensible Praxis- und Systemdaten sind vor unbefugtem Zugriff geschützt.

### UC-2.2: Einzelne Praxis verwalten (CRUD-Operationen)
- **Auslöser**: Ein Admin erhält die Meldung, dass eine neue Praxis Partner geworden ist oder eine alte Praxis umgezogen ist.
- **Systemverhalten**:
  - **Erstellen/Bearbeiten**: Der Admin füllt ein Formular aus (inkl. GPS-Koordinaten). Das System speichert die Daten und loggt die Aktion.
  - **Deaktivieren**: Klickt der Admin auf "Deaktivieren", wird der Datensatz nicht gelöscht (Soft-Delete), sondern erhält den Status "inaktiv". Die Praxis verschwindet sofort von der Kunden-Karte.
- **Mehrwert**: Hohe Datenqualität und schnelle Reaktionsfähigkeit bei Änderungen.

### UC-2.3: Automatisierter CSV-Massenimport
- **Auslöser**: Das Team hat recherchiert und eine Excel-Liste mit 200 neuen Praxen für eine neue Region (z.B. "Berlin") erstellt. Der Admin lädt diese als `.csv`-Datei hoch.
- **Systemverhalten**: Das Backend validiert den Spaltenaufbau der CSV. Fehlt eine Pflichtspalte, wird der Import mit einer präzisen Fehlermeldung abgebrochen. Bei Validität werden alle Zeilen asynchron in die Datenbank geschrieben. Das Audit-Log verzeichnet den erfolgreichen Import von X Einträgen.
- **Mehrwert**: Einsparung von unzähligen Stunden manueller Dateneingabe. Extreme Skalierbarkeit für das Rollout in neuen Städten.

### UC-2.4: Regionale Bestände massenhaft deaktivieren
- **Auslöser**: Eine Regionaldatenbank ist veraltet und soll komplett durch einen neuen CSV-Datensatz ersetzt werden.
- **Systemverhalten**: Der Admin wählt die Region und klickt "Region deaktivieren". Das Backend setzt mit einem einzigen SQL-Befehl alle Praxen dieser Region auf "inaktiv".
- **Mehrwert**: Vermeidung fehleranfälliger und zeitaufwendiger manueller Klickarbeit.

### UC-2.5: Datensicherung via CSV-Export
- **Auslöser**: Der Admin möchte ein Backup der Daten erstellen oder die Daten in Excel weiterverarbeiten.
- **Systemverhalten**: Der Client generiert "on-the-fly" aus dem aktuellen Datenbank-Status eine saubere CSV-Datei und startet den Download im Browser des Admins.
- **Mehrwert**: Datenhoheit bleibt beim Team; einfache Integration in andere BI-Tools (Business Intelligence).

### UC-2.6: Mitarbeiter-Zugänge verwalten (Account Management)
- **Auslöser**: Ein neuer Mitarbeiter im Support-Team benötigt Zugriff auf das Dashboard.
- **Systemverhalten**: Der Admin erstellt einen neuen Account mit Initialpasswort. Später kann jeder Mitarbeiter sein eigenes Passwort sicher im System ändern. Das System verhindert die Löschung des eigenen aktiven Accounts (Fail-Safe).
- **Mehrwert**: Professionelles Identity Management ohne externe Tools.

### UC-2.7: Audit-Log für volle Transparenz überprüfen
- **Auslöser**: Ein Admin bemerkt, dass eine wichtige Praxis fehlt und möchte wissen, wer sie deaktiviert hat.
- **Systemverhalten**: Im Reiter "Admin-Log" sieht er eine chronologische Liste aller sicherheitsrelevanten Aktionen (Wer, Was, Wann).
- **Mehrwert**: Lückenlose Nachverfolgbarkeit aller Änderungen (Accountability), was besonders in wachsenden Teams essenziell ist.
