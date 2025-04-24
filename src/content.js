// Gmail integration
if (window.location.href.includes('mail.google.com')) {
  setupGmailIntegration();
}

// Function to setup Gmail integration
function setupGmailIntegration() {
  // Check if we're already set up to avoid duplicate buttons
  if (document.querySelector('.wpww-asana-button')) return;
  
  // Wait for Gmail to be fully loaded
  const checkLoaded = setInterval(() => {
    // Check for Gmail's main view
    if (document.querySelector('.aeH')) {
      clearInterval(checkLoaded);
      addGmailButtons();
      observeGmailChanges();
    }
  }, 1000);
}

// Function to add Asana buttons to Gmail
function addGmailButtons() {
  // Nur in Detailansicht anzeigen, nicht in der E-Mail-Übersicht
  if (!document.querySelector('.h7') || !document.querySelector('.a3s.aiL')) {
    return; // Kein E-Mail-Inhalt sichtbar -> wir sind in der Übersicht
  }
  
  // Prüfen ob Button bereits existiert
  if (document.querySelector('.wpww-asana-button')) return;
  
  // Zuerst versuchen, den Button neben den Druck-/Popup-Buttons einzufügen
  const detailToolbar = document.querySelector('div[jscontroller="kLffjf"]');
  if (detailToolbar) {
    // Prüfen ob Button in diesem Toolbar bereits existiert
    if (detailToolbar.querySelector('.wpww-asana-button')) return;
    
    // Erstelle Tooltip-Wrapper und Button im Gmail-Stil
    const tooltipWrapper = document.createElement('span');
    tooltipWrapper.setAttribute('data-is-tooltip-wrapper', 'true');
    
    // Eindeutige Tooltip-ID generieren
    const tooltipId = 'asana-tooltip-' + Math.floor(Math.random() * 1000);
    
    // Create button im Gmail-Stil
    const button = document.createElement('button');
    button.className = 'pYTkkf-JX-I pYTkkf-JX-I-ql-ay5-ays bHI wpww-asana-button';
    button.setAttribute('aria-label', 'In Asana erstellen');
    button.setAttribute('data-tooltip-enabled', 'true');
    button.setAttribute('data-tooltip-id', tooltipId);
    button.setAttribute('data-tooltip-y-position', '3');
    button.setAttribute('data-tooltip-classes', 'bHK');
    
    // Icon-Span erstellen
    const iconSpan = document.createElement('span');
    iconSpan.setAttribute('aria-hidden', 'true');
    iconSpan.className = 'pYTkkf-JX-ank-Rtc0Jf';
    
    // SVG für Asana-ähnliches Icon (vereinfachtes "A" Icon)
    const iconInnerSpan = document.createElement('span');
    iconInnerSpan.className = 'notranslate bzc-ank';
    iconInnerSpan.setAttribute('aria-hidden', 'true');
    iconInnerSpan.innerHTML = `
      <svg focusable="false" viewBox="0 0 24 24" height="20" width="20" class="aoH">
        <path d="M5,12 a7,7 0 1,0 14,0 a7,7 0 1,0 -14,0 M12,7 L16,15 L8,15 Z" fill="currentColor"/>
      </svg>
    `;
    iconSpan.appendChild(iconInnerSpan);
    
    // Div für Animation
    const anoDiv = document.createElement('div');
    anoDiv.className = 'pYTkkf-JX-ano';
    
    // Zusammenbauen des Buttons
    button.appendChild(document.createElement('span')).className = 'OiePBf-zPjgPe pYTkkf-JX-UHGRz';
    button.appendChild(document.createElement('span')).className = 'bHC-Q';
    button.appendChild(iconSpan);
    button.appendChild(anoDiv);
    
    // Tooltip div erstellen
    const tooltipDiv = document.createElement('div');
    tooltipDiv.className = 'ne2Ple-oshW8e-J9';
    tooltipDiv.setAttribute('role', 'tooltip');
    tooltipDiv.setAttribute('aria-hidden', 'true');
    tooltipDiv.id = tooltipId;
    tooltipDiv.textContent = 'In Asana erstellen';
    
    // Event-Listener hinzufügen
    button.addEventListener('click', createAsanaTaskFromGmail);
    
    // Alles zusammenfügen
    tooltipWrapper.appendChild(button);
    tooltipWrapper.appendChild(tooltipDiv);
    
    // Span für Tooltip-ID erstellen
    const tooltipIdSpan = document.createElement('span');
    tooltipIdSpan.setAttribute('data-unique-tt-id', tooltipId);
    
    // In den Toolbar einfügen, vor dem ersten vorhandenen Button-Element
    detailToolbar.insertBefore(tooltipIdSpan, detailToolbar.firstChild);
    detailToolbar.insertBefore(tooltipWrapper, detailToolbar.firstChild);
    
    return; // Button wurde erfolgreich eingefügt
  }
  
  // Fallback: Falls obiger Ansatz nicht funktioniert, fügen wir den Button zum regulären Toolbar hinzu
  const toolbar = document.querySelector('.aqK, .iN');
  if (!toolbar) return;
  
  // Prüfen ob Button bereits existiert
  if (toolbar.querySelector('.wpww-asana-button')) return;
  
  // Create button
  const button = document.createElement('div');
  button.className = 'wpww-asana-button T-I J-J5-Ji T-I-KE L3';
  button.innerHTML = 'In Asana erstellen';
  button.title = 'Ticket in Asana erstellen';
  button.style.marginRight = '10px';
  
  // Add event listener
  button.addEventListener('click', createAsanaTaskFromGmail);
  
  // Add button to toolbar
  toolbar.appendChild(button);
}

// Function to observe Gmail for dynamic changes
function observeGmailChanges() {
  // Setup mutation observer to watch for view changes
  const observer = new MutationObserver(() => {
    // Check if we need to add buttons to a new view
    if (!document.querySelector('.wpww-asana-button')) {
      addGmailButtons();
    }
  });
  
  // Start observing
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// Function to create Asana task from Gmail
function createAsanaTaskFromGmail() {
  // Extract email data - verbesserte Selektoren
  let subject = 'Kein Betreff';
  let from = 'Unbekannter Absender';
  
  // Verschiedene mögliche Selektoren für den Betreff
  const subjectSelectors = ['.hP', '.ha h2', '.ha h2.hP', '.ha .hP'];
  for (const selector of subjectSelectors) {
    const subjectElement = document.querySelector(selector);
    if (subjectElement && subjectElement.textContent.trim()) {
      subject = subjectElement.textContent.trim();
      break;
    }
  }
  
  // Verschiedene mögliche Selektoren für den Absender
  const fromSelectors = [
    '.gD', 
    '.gE.iv.gt', 
    '.go', 
    '.g2', 
    '.adl[email]', 
    '.iw .g2 span[email]',
    '.iw .gD',
    '.if .gD'
  ];
  for (const selector of fromSelectors) {
    const fromElement = document.querySelector(selector);
    if (fromElement && fromElement.textContent.trim()) {
      from = fromElement.textContent.trim();
      if (fromElement.getAttribute('email')) {
        from = `${from} <${fromElement.getAttribute('email')}>`;
      }
      break;
    }
  }
  
  // Sammle alle Absender-Informationen
  const allFromInfo = document.querySelector('.ha .iw');
  if (allFromInfo && from === 'Unbekannter Absender') {
    from = allFromInfo.textContent.trim().replace(/\s+/g, ' ');
  }
  
  // Get email body - verbesserte Extraktion
  let body = '';
  
  // Verschiedene mögliche Selektoren für den E-Mail-Inhalt
  const bodySelectors = [
    '.a3s.aiL', 
    '.a3s.aXjCH', 
    '.a3s', 
    '.ii.gt .a3s', 
    '.a3s.aiL.msg', 
    '.gs .ii.gt div[dir="ltr"]',
    '.gs .ii.gt'
  ];
  
  let bodyElement = null;
  for (const selector of bodySelectors) {
    bodyElement = document.querySelector(selector);
    if (bodyElement && bodyElement.innerText.trim()) {
      break;
    }
  }
  
  if (bodyElement) {
    // Get plain text version of email body
    body = bodyElement.innerText.trim();
    
    if (body.length > 3000) {
      body = body.substring(0, 3000) + '...';
    }
  }
  
  // Prüfen, ob noch weitere Inhalte extrahiert werden sollten
  if (!body || body.length < 10) {
    // Erweiterte Extraktion: Versuche alle Elemente innerhalb der E-Mail zu erfassen
    const emailContainers = document.querySelectorAll('.ii.gt');
    const textParts = [];
    
    emailContainers.forEach(container => {
      // Text extrahieren und bereinigen
      const containerText = container.innerText.trim()
        .replace(/(\r\n|\n|\r)/gm, "\n") // Normalisiere Zeilenumbrüche
        .replace(/\n{3,}/g, "\n\n");     // Reduziere mehrfache Leerzeilen
      
      if (containerText) {
        textParts.push(containerText);
      }
    });
    
    if (textParts.length > 0) {
      body = textParts.join("\n\n").trim();
      if (body.length > 3000) {
        body = body.substring(0, 3000) + '...';
      }
    } else {
      body = 'Email-Inhalt konnte nicht extrahiert werden';
    }
  }
  
  // Get attachments and images
  const attachments = [];
  const imageAttachments = [];
  
  // Sammle reguläre Anhänge - erweiterte Selektoren
  const attachmentSelectors = [
    '.aZo', 
    '.aQy', 
    '.aVg', 
    '.aV3',
    '.brc > [download]', 
    '.brc [download_url]', 
    '.aQw [data-url]'
  ];
  
  for (const selector of attachmentSelectors) {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => {
      const fileName = el.getAttribute('download_url') || el.getAttribute('download') || el.getAttribute('data-url');
      if (fileName && !attachments.includes(fileName)) {
        attachments.push(fileName);
      }
    });
  }
  
  // Alle potenziellen E-Mail-Container durchsuchen
  const emailContainers = document.querySelectorAll('.gs, .ii.gt, .a3s, .gmail_quote');
  
  // Sammle Bilder aus der E-Mail - verbessert
  emailContainers.forEach(container => {
    if (!container) return;
    
    // Alle Bilder im Container finden
    const images = container.querySelectorAll('img');
    images.forEach(img => {
      // Nur wenn das Bild bereits geladen ist und dimensionen hat
      if (img.complete && img.naturalWidth > 0) {
        // Sichere Bild-Größe ermitteln (entweder aus width/height oder aus natural size)
        const imgWidth = img.width || img.naturalWidth;
        const imgHeight = img.height || img.naturalHeight;
        
        // Ignoriere kleine Icons und Tracker
        if (imgWidth > 50 && imgHeight > 50 && img.src) {
          // Prüfe ob das Bild eine valide URL hat und nicht bereits hinzugefügt wurde
          if ((img.src.startsWith('http') || img.src.startsWith('https')) && 
              !img.src.includes('tracking') && 
              !img.src.includes('pixel') &&
              !img.src.includes('beacon')) {
            
            // Prüfe, ob das Bild bereits hinzugefügt wurde (kein Duplikat)
            const isDuplicate = imageAttachments.some(attachment => attachment.url === img.src);
            
            if (!isDuplicate) {
              imageAttachments.push({
                url: img.src,
                alt: img.alt || 'Email-Bild',
                width: imgWidth,
                height: imgHeight
              });
            }
          }
        }
      }
    });
  });
  
  // Fallback: Wenn keine Bilder gefunden wurden, suche in der ganzen Seite
  if (imageAttachments.length === 0) {
    const allImages = document.querySelectorAll('img');
    allImages.forEach(img => {
      // Prüfen auf sinnvolle Bildgröße
      if (img.complete && img.naturalWidth > 0) {
        const imgWidth = img.width || img.naturalWidth;
        const imgHeight = img.height || img.naturalHeight;
        
        if (imgWidth > 100 && imgHeight > 100 && img.src) {
          if ((img.src.startsWith('http') || img.src.startsWith('https')) && 
              !img.src.includes('tracking') && 
              !img.src.includes('pixel') &&
              !img.src.includes('ui') &&
              !img.src.includes('icon') &&
              !img.src.includes('logo')) {
            
            const isDuplicate = imageAttachments.some(attachment => attachment.url === img.src);
            
            if (!isDuplicate) {
              imageAttachments.push({
                url: img.src,
                alt: img.alt || 'Email-Bild',
                width: imgWidth,
                height: imgHeight
              });
            }
          }
        }
      }
    });
  }
  
  // Get current email URL
  const url = window.location.href;
  
  // Debug-Ausgabe für die Entwicklung (in Produktionsversion auskommentieren oder entfernen)
  console.log('Gmail Daten extrahiert:', {
    subject,
    from,
    bodyLength: body ? body.length : 0,
    attachmentsCount: attachments.length,
    imagesCount: imageAttachments.length
  });

  // Prüfen ob wir KI-Summary generieren sollen
  chrome.storage.sync.get(['aiProvider', 'aiApiKey', 'includeImages', 'debugMode'], function(settings) {
    const useAI = settings.aiProvider && settings.aiApiKey;
    const includeImages = settings.includeImages || 'never';
    const debugMode = settings.debugMode || false;
    
    // Vorbereitung der Daten für die Nachricht
    const messageData = {
      subject,
      from,
      body,
      attachments,
      url,
      useAI: useAI,
      aiProvider: settings.aiProvider,
      includeImages: includeImages
    };
    
    // Debug-Modus: Zeige Dialog mit extrahierten Daten
    if (debugMode) {
      const debugInfo = `
        <h3>Extrahierte E-Mail-Daten</h3>
        <p><strong>Betreff:</strong> ${subject}</p>
        <p><strong>Von:</strong> ${from}</p>
        <p><strong>URL:</strong> ${url}</p>
        <p><strong>Inhaltslänge:</strong> ${body.length} Zeichen</p>
        <p><strong>Anhänge:</strong> ${attachments.length}</p>
        <p><strong>Bilder:</strong> ${imageAttachments.length}</p>
        <h4>Inhalt:</h4>
        <pre style="white-space: pre-wrap; max-height: 200px; overflow: auto; border: 1px solid #ccc; padding: 8px; margin-top: 8px;">${body.substring(0, 500)}${body.length > 500 ? '...' : ''}</pre>
      `;
      
      const debugOverlay = document.createElement('div');
      debugOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0,0,0,0.5);
        z-index: 10000;
        display: flex;
        justify-content: center;
        align-items: center;
      `;
      
      const debugModal = document.createElement('div');
      debugModal.style.cssText = `
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        width: 80%;
        max-width: 600px;
        max-height: 80vh;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        padding: 20px;
      `;
      
      debugModal.innerHTML = debugInfo;
      
      const closeButton = document.createElement('button');
      closeButton.textContent = 'Fortfahren';
      closeButton.style.cssText = `
        padding: 8px 16px;
        background-color: #4573D5;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-weight: bold;
        margin-top: 16px;
        align-self: flex-end;
      `;
      
      closeButton.onclick = () => {
        document.body.removeChild(debugOverlay);
        proceedWithTask();
      };
      
      debugModal.appendChild(closeButton);
      debugOverlay.appendChild(debugModal);
      document.body.appendChild(debugOverlay);
    } else {
      proceedWithTask();
    }
    
    // Funktion zum Fortfahren mit Ticket-Erstellung
    function proceedWithTask() {
      // Füge Bilder nur hinzu, wenn die Einstellung dafür konfiguriert ist
      if (includeImages !== 'never' && imageAttachments.length > 0) {
        if (includeImages === 'always') {
          messageData.imageAttachments = imageAttachments;
          createAsanaTask(messageData);
        } else {
          // Bei "Nachfragen" oder "Ask" zeigen wir eine Vorschau der Bilder an
          showImageSelectionDialog(imageAttachments, selectedImages => {
            if (selectedImages && selectedImages.length > 0) {
              messageData.imageAttachments = selectedImages;
            }
            createAsanaTask(messageData);
          });
        }
      } else {
        // Kein Bild zur Auswahl, direkt Task erstellen
        createAsanaTask(messageData);
      }
    }
  });
}

// Funktion zum Anzeigen des Bildauswahl-Dialogs
function showImageSelectionDialog(images, callback) {
  // Erstelle ein Modal-Overlay
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0,0,0,0.5);
    z-index: 9999;
    display: flex;
    justify-content: center;
    align-items: center;
  `;
  
  // Erstelle das Modal
  const modal = document.createElement('div');
  modal.style.cssText = `
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    width: 80%;
    max-width: 800px;
    max-height: 80vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  `;
  
  // Modal-Header
  const header = document.createElement('div');
  header.style.cssText = `
    padding: 16px;
    border-bottom: 1px solid #e0e0e0;
    display: flex;
    justify-content: space-between;
    align-items: center;
  `;
  
  const title = document.createElement('h3');
  title.textContent = 'Bilder auswählen';
  title.style.margin = '0';
  
  const closeButton = document.createElement('button');
  closeButton.innerHTML = '&times;';
  closeButton.style.cssText = `
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    padding: 0 8px;
  `;
  closeButton.onclick = () => {
    document.body.removeChild(overlay);
    callback([]); // Keine Bilder ausgewählt
  };
  
  header.appendChild(title);
  header.appendChild(closeButton);
  
  // Modal-Body mit Bild-Vorschau
  const body = document.createElement('div');
  body.style.cssText = `
    padding: 16px;
    overflow-y: auto;
    max-height: calc(80vh - 130px);
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
  `;
  
  // Bilder anzeigen mit Checkbox zur Auswahl
  const selectedImages = new Set();
  
  // Standarmäßig alle Bilder auswählen
  images.forEach(img => selectedImages.add(img));
  
  images.forEach(img => {
    const imageContainer = document.createElement('div');
    imageContainer.style.cssText = `
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      padding: 8px;
      display: flex;
      flex-direction: column;
      cursor: pointer;
    `;
    
    // Bild-Vorschau
    const imgPreview = document.createElement('img');
    imgPreview.src = img.url;
    imgPreview.alt = img.alt;
    imgPreview.style.cssText = `
      max-width: 100%;
      height: 150px;
      object-fit: contain;
      margin-bottom: 8px;
    `;
    
    // Checkbox für Auswahl
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = true;  // Standardmäßig ausgewählt
    checkbox.style.marginRight = '8px';
    
    // Label für Checkbox
    const label = document.createElement('label');
    label.style.cssText = `
      display: flex;
      align-items: center;
      font-size: 14px;
    `;
    
    // Bildinfo (Größe)
    const imageInfo = document.createElement('span');
    imageInfo.textContent = `${img.width}x${img.height}`;
    
    label.appendChild(checkbox);
    label.appendChild(imageInfo);
    
    // Event-Listener für Klick auf Container
    imageContainer.onclick = (e) => {
      if (e.target !== checkbox) {
        checkbox.checked = !checkbox.checked;
      }
      
      if (checkbox.checked) {
        selectedImages.add(img);
        imageContainer.style.backgroundColor = '#f0f7ff';
        imageContainer.style.borderColor = '#4573D5';
      } else {
        selectedImages.delete(img);
        imageContainer.style.backgroundColor = '';
        imageContainer.style.borderColor = '#e0e0e0';
      }
    };
    
    // Anfänglicher Auswahlstatus
    if (selectedImages.has(img)) {
      imageContainer.style.backgroundColor = '#f0f7ff';
      imageContainer.style.borderColor = '#4573D5';
    }
    
    imageContainer.appendChild(imgPreview);
    imageContainer.appendChild(label);
    body.appendChild(imageContainer);
  });
  
  // Modal-Footer mit Aktions-Buttons
  const footer = document.createElement('div');
  footer.style.cssText = `
    padding: 16px;
    border-top: 1px solid #e0e0e0;
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  `;
  
  // Auswahl-Buttons
  const selectAllButton = document.createElement('button');
  selectAllButton.textContent = 'Alle auswählen';
  selectAllButton.style.cssText = `
    padding: 8px 16px;
    background-color: #f1f3f4;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  `;
  selectAllButton.onclick = () => {
    const checkboxes = body.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach((cb, index) => {
      cb.checked = true;
      selectedImages.add(images[index]);
      cb.closest('div').style.backgroundColor = '#f0f7ff';
      cb.closest('div').style.borderColor = '#4573D5';
    });
  };
  
  const deselectAllButton = document.createElement('button');
  deselectAllButton.textContent = 'Alle abwählen';
  deselectAllButton.style.cssText = `
    padding: 8px 16px;
    background-color: #f1f3f4;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  `;
  deselectAllButton.onclick = () => {
    const checkboxes = body.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach((cb, index) => {
      cb.checked = false;
      selectedImages.delete(images[index]);
      cb.closest('div').style.backgroundColor = '';
      cb.closest('div').style.borderColor = '#e0e0e0';
    });
  };
  
  // Abbruch und Weiter-Buttons
  const cancelButton = document.createElement('button');
  cancelButton.textContent = 'Abbrechen';
  cancelButton.style.cssText = `
    padding: 8px 16px;
    background-color: #f1f3f4;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  `;
  cancelButton.onclick = () => {
    document.body.removeChild(overlay);
    callback([]); // Keine Bilder ausgewählt
  };
  
  const confirmButton = document.createElement('button');
  confirmButton.textContent = 'Weiter';
  confirmButton.style.cssText = `
    padding: 8px 16px;
    background-color: #4573D5;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
  `;
  confirmButton.onclick = () => {
    document.body.removeChild(overlay);
    callback(Array.from(selectedImages));
  };
  
  footer.appendChild(selectAllButton);
  footer.appendChild(deselectAllButton);
  footer.appendChild(document.createElement('div')).style.flexGrow = '1';
  footer.appendChild(cancelButton);
  footer.appendChild(confirmButton);
  
  // Alles zusammenfügen
  modal.appendChild(header);
  modal.appendChild(body);
  modal.appendChild(footer);
  overlay.appendChild(modal);
  
  document.body.appendChild(overlay);
}

// Funktion zum Senden der Daten und Erstellen des Asana-Tasks
function createAsanaTask(messageData) {
  // Send message to background script
  chrome.runtime.sendMessage({
    action: 'createTaskFromGmail',
    data: messageData
  }, response => {
    if (response && response.success) {
      alert(`Ticket wurde erstellt: ${response.message}`);
    } else {
      alert(`Fehler beim Erstellen des Tickets: ${response?.message || 'Unbekannter Fehler'}`);
    }
  });
}

// General webpage integration
document.addEventListener('keydown', function(event) {
  // Check for Control+Shift+A or Command+Shift+A (Mac)
  if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'A') {
    // Let background script handle it
    chrome.runtime.sendMessage({action: 'shortcutPressed'});
  }
});