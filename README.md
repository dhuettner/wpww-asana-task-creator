# WPWW Asana Task Creator

Eine Chrome-Erweiterung zur Erstellung von Asana-Tickets mit fortlaufenden IDs direkt aus dem Browser heraus.

## Funktionen

- Erstellung von Asana-Tickets mit automatischer fortlaufender ID (z.B. WPWW-1000)
- Automatisches Erfassen der aktuellen Webseite als URL im Ticket
- Gmail-Integration zum direkten Erstellen von Tickets aus E-Mails
- Tastenkombination (Cmd+Shift+A auf Mac, Ctrl+Shift+A auf Windows/Linux)
- Kontextmenü für einfachen Zugriff auf jeder Webseite
- Einstellungsseite zur Konfiguration (Asana Personal Access Token, Workspace, Ticket-Präfix)

## Installation

1. Laden Sie den Quellcode herunter und entpacken Sie ihn
2. Öffnen Sie Chrome und navigieren Sie zu `chrome://extensions/`
3. Aktivieren Sie den "Entwicklermodus" oben rechts
4. Klicken Sie auf "Entpackte Erweiterung laden"
5. Wählen Sie den Ordner `/src` im Projektverzeichnis

## Erste Einrichtung

Nach der Installation müssen Sie die Erweiterung konfigurieren:

1. Klicken Sie auf das Erweiterungssymbol in der Chrome-Toolbar
2. Klicken Sie auf "Einstellungen"
3. Erstellen Sie einen Persönlichen Zugriffstoken auf der [Asana Access Token Seite](https://app.asana.com/0/my-access-tokens)
4. Geben Sie den Token im dafür vorgesehenen Feld ein
5. Klicken Sie auf "Token überprüfen", um sich zu authentifizieren
6. Wählen Sie Ihren Asana Workspace aus
7. Konfigurieren Sie optional das Ticket-Präfix und die letzte Ticket-ID
8. Speichern Sie die Einstellungen

## Verwendung

### Ticket aus aktueller Webseite erstellen

1. Auf einer beliebigen Webseite können Sie:
   - Auf das Erweiterungssymbol in der Toolbar klicken
   - Die Tastenkombination Cmd+Shift+A (Mac) oder Ctrl+Shift+A (Windows/Linux) verwenden
   - Rechtsklick > "Als Asana Ticket erstellen" wählen

2. Im Popup können Sie:
   - Den Titel bearbeiten (wird automatisch mit der aktuellen Seite vorausgefüllt)
   - Eine Beschreibung hinzufügen (enthält bereits die URL der aktuellen Seite)
   - Ein Projekt auswählen
   - Eine Priorität festlegen
   - Auf "Ticket erstellen" klicken

### Ticket aus Gmail-E-Mail erstellen

1. Öffnen Sie eine E-Mail in Gmail
2. Klicken Sie auf die Schaltfläche "In Asana erstellen" in der Toolbar
3. Die E-Mail-Informationen (Betreff, Absender, Inhalt, Anhänge) werden automatisch in ein neues Asana-Ticket übertragen

## Hinweise

- Die Erweiterung speichert Ihren Asana Personal Access Token lokal in Ihrem Browser
- Die fortlaufenden Ticket-IDs werden ebenfalls lokal gespeichert
- Für die Gmail-Integration müssen Sie die Erweiterung berechtigen, auf mail.google.com zuzugreifen

## Fehlerbehebung

Falls Probleme auftreten:
1. Überprüfen Sie, ob Ihr Persönlicher Zugriffstoken noch gültig ist
2. Stellen Sie sicher, dass Sie Zugriff auf den ausgewählten Workspace haben
3. Versuchen Sie, die Einstellungen zurückzusetzen und neu zu konfigurieren
4. Prüfen Sie die Konsolenausgabe auf Fehler (Rechtsklick → Untersuchen → Konsole)

## Erforderliche Berechtigungen

- `activeTab`: Zugriff auf die aktive Registerkarte, um URL und Titel zu lesen
- `storage`: Lokale Speicherung von Einstellungen und Ticket-IDs
- `contextMenus`: Zum Hinzufügen des Kontextmenüs
- `host_permissions` für `https://app.asana.com/*`: Für API-Aufrufe an Asana

## Technische Details

Diese Chrome-Erweiterung nutzt:
- Chrome Extension Manifest V3
- Asana REST API
- JavaScript (ES6+)
- Chrome Storage API

## Support

Bei Fragen oder Problemen haben Sie folgende Möglichkeiten:
- Erstellen Sie ein Issue auf [GitHub](https://github.com/dhuettner/wpww-asana-task-creator/)
- Kontaktieren Sie uns per E-Mail unter [dev@waterproof.agency](mailto:dev@waterproof.agency)
- Besuchen Sie die [Waterproof Web Wizard GmbH](https://waterproof-web-wizard.de/) Website

## Beitragen

Verbesserungsvorschläge und Pull-Requests sind willkommen! Wenn Sie zum Projekt beitragen möchten:

1. Forken Sie das Repository
2. Erstellen Sie einen Feature-Branch (`git checkout -b feature/amazing-feature`)
3. Commiten Sie Ihre Änderungen (`git commit -m 'Add amazing feature'`)
4. Pushen Sie den Branch (`git push origin feature/amazing-feature`)
5. Öffnen Sie einen Pull Request

## Lizenz & Copyright

© 2025 [Waterproof Web Wizard GmbH](https://waterproof-web-wizard.de/) | Alle Rechte vorbehalten

Entwickelt von Dennis Hüttner, Waterproof Web Wizard.

Diese Software wird unter den Bedingungen der MIT-Lizenz veröffentlicht.

## Kontakt

Dennis Hüttner - [dev@waterproof.agency](mailto:dev@waterproof.agency)

Website: [https://waterproof-web-wizard.de/](https://waterproof-web-wizard.de/)

Projektlink: [https://github.com/dhuettner/wpww-asana-task-creator](https://github.com/dhuettner/wpww-asana-task-creator)

---

Tags: #asana-task-creator #chrome-extension #project-management #browser-tool #asana-api #task-management #productivity-tool #ticketing-system #wpww