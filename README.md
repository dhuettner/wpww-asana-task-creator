# WPWW Asana Task Creator

<div align="center">
  <a href="#deutsch">Deutsch</a> | <a href="#english">English</a>
</div>

---

<div id="deutsch"></div>

## 🇩🇪 Dokumentation (Deutsch)

Eine Chrome-Erweiterung zur Erstellung von Asana-Tickets mit fortlaufenden IDs direkt aus dem Browser heraus.

### Funktionen

- Erstellung von Asana-Tickets mit automatischer fortlaufender ID (z.B. WPWW-1000)
- Automatisches Erfassen der aktuellen Webseite als URL im Ticket
- Gmail-Integration zum direkten Erstellen von Tickets aus E-Mails
- Tastenkombination (Cmd+Shift+A auf Mac, Ctrl+Shift+A auf Windows/Linux)
- Kontextmenü für einfachen Zugriff auf jeder Webseite
- Einstellungsseite zur Konfiguration (Asana Personal Access Token, Workspace, Ticket-Präfix)

### Installation

1. Laden Sie den Quellcode herunter und entpacken Sie ihn
2. Öffnen Sie Chrome und navigieren Sie zu `chrome://extensions/`
3. Aktivieren Sie den "Entwicklermodus" oben rechts
4. Klicken Sie auf "Entpackte Erweiterung laden"
5. Wählen Sie den Ordner `/src` im Projektverzeichnis

### Erste Einrichtung

Nach der Installation müssen Sie die Erweiterung konfigurieren:

1. Klicken Sie auf das Erweiterungssymbol in der Chrome-Toolbar
2. Klicken Sie auf "Einstellungen"
3. Erstellen Sie einen Persönlichen Zugriffstoken auf der [Asana Access Token Seite](https://app.asana.com/0/my-access-tokens)
4. Geben Sie den Token im dafür vorgesehenen Feld ein
5. Klicken Sie auf "Token überprüfen", um sich zu authentifizieren
6. Wählen Sie Ihren Asana Workspace aus
7. Konfigurieren Sie optional das Ticket-Präfix und die letzte Ticket-ID
8. Speichern Sie die Einstellungen

### Verwendung

**Ticket aus aktueller Webseite erstellen**

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

**Ticket aus Gmail-E-Mail erstellen**

1. Öffnen Sie eine E-Mail in Gmail
2. Klicken Sie auf die Schaltfläche "In Asana erstellen" in der Toolbar
3. Die E-Mail-Informationen (Betreff, Absender, Inhalt, Anhänge) werden automatisch in ein neues Asana-Ticket übertragen

### Hinweise

- Die Erweiterung speichert Ihren Asana Personal Access Token lokal in Ihrem Browser
- Die fortlaufenden Ticket-IDs werden ebenfalls lokal gespeichert
- Für die Gmail-Integration müssen Sie die Erweiterung berechtigen, auf mail.google.com zuzugreifen

### Fehlerbehebung

1. Überprüfen Sie, ob Ihr Persönlicher Zugriffstoken noch gültig ist
2. Stellen Sie sicher, dass Sie Zugriff auf den ausgewählten Workspace haben
3. Versuchen Sie, die Einstellungen zurückzusetzen und neu zu konfigurieren
4. Prüfen Sie die Konsolenausgabe auf Fehler (Rechtsklick, Untersuchen, Konsole)

### Erforderliche Berechtigungen

- `activeTab`: Zugriff auf die aktive Registerkarte, um URL und Titel zu lesen
- `storage`: Lokale Speicherung von Einstellungen und Ticket-IDs
- `contextMenus`: Zum Hinzufügen des Kontextmenüs
- `host_permissions` für `https://app.asana.com/*`: Für API-Aufrufe an Asana

### Technische Details

- Chrome Extension Manifest V3
- Asana REST API
- JavaScript (ES6+)
- Chrome Storage API

### Support

- Issue auf [GitHub](https://github.com/dhuettner/wpww-asana-task-creator/) erstellen
- E-Mail an [hallo@waterproof.agency](mailto:hallo@waterproof.agency)
- Website: [waterproof.agency](https://waterproof.agency/)

### Beitragen

Verbesserungsvorschläge und Pull Requests sind willkommen:

1. Repository forken
2. Feature-Branch erstellen (`git checkout -b feature/amazing-feature`)
3. Änderungen committen (`git commit -m 'Add amazing feature'`)
4. Branch pushen (`git push origin feature/amazing-feature`)
5. Pull Request öffnen

<div align="center">
  <a href="#english">Read this in English 🇬🇧</a>
</div>

---

<div id="english"></div>

## 🇬🇧 Documentation (English)

A Chrome extension that creates Asana tasks with sequential IDs straight from the browser.

### Features

- Asana tasks with an automatic sequential ID (for example WPWW-1000)
- The current page is captured as a URL inside the task
- Gmail integration to turn an email into a task
- Keyboard shortcut (Cmd+Shift+A on Mac, Ctrl+Shift+A on Windows and Linux)
- Context menu on every page
- Options page for Asana personal access token, workspace and task prefix

### Installation

1. Download the source code and unpack it
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked"
5. Select the `/src` folder of the project

### First setup

1. Click the extension icon in the Chrome toolbar
2. Click "Settings"
3. Create a personal access token on the [Asana access token page](https://app.asana.com/0/my-access-tokens)
4. Paste the token into the field
5. Click "Verify token" to authenticate
6. Pick your Asana workspace
7. Optionally set the task prefix and the last task ID
8. Save

### Usage

**Create a task from the current page**

1. On any page you can:
   - Click the extension icon in the toolbar
   - Use Cmd+Shift+A (Mac) or Ctrl+Shift+A (Windows and Linux)
   - Right click and choose "Als Asana Ticket erstellen"

2. In the popup you can edit the title, add a description that already carries
   the page URL, pick a project, set a priority and create the task.

**Create a task from a Gmail message**

1. Open a message in Gmail
2. Click "In Asana erstellen" in the toolbar
3. Subject, sender, body and attachments are carried into the new task

### Notes

- The personal access token is stored locally in your browser
- The sequential task IDs are stored locally as well
- Gmail integration needs permission for mail.google.com

### Troubleshooting

1. Check whether the personal access token is still valid
2. Make sure you have access to the selected workspace
3. Reset the settings and configure them again
4. Check the console output for errors (right click, Inspect, Console)

### Permissions

- `activeTab`: read URL and title of the active tab
- `storage`: local storage of settings and task IDs
- `contextMenus`: adds the context menu entry
- `host_permissions` for `https://app.asana.com/*`: API calls to Asana

### Support

- Open an issue on [GitHub](https://github.com/dhuettner/wpww-asana-task-creator/)
- Email [hallo@waterproof.agency](mailto:hallo@waterproof.agency)
- Website: [waterproof.agency](https://waterproof.agency/)

### Contributing

Suggestions and pull requests are welcome. Fork the repository, create a feature
branch, commit your changes, push the branch and open a pull request.

<div align="center">
  <a href="#deutsch">Zur deutschen Version 🇩🇪</a>
</div>

---

## Lizenz

MIT. Der vollständige Lizenztext steht in [LICENSE](LICENSE).

© 2025 [Waterproof Web Wizard GmbH](https://waterproof.agency/)

<div align="center">
  <br>
  <p>
    Developed with ❤️ by <a href="https://waterproof.agency" target="_blank">Waterproof Web Wizard GmbH</a><br>
    Built by <b>Dennis Hüttner</b>
  </p>
</div>
