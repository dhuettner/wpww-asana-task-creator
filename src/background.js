// Listen for keyboard shortcuts
chrome.commands.onCommand.addListener((command) => {
  if (command === 'create-task') {
    // Get current tab URL and title
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (tabs[0]) {
        createTaskWithCurrentPage(tabs[0].url, tabs[0].title);
      }
    });
  }
});

// Setup context menu on installation
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'create-asana-task',
    title: 'Als Asana Ticket erstellen',
    contexts: ['page', 'selection', 'link', 'image']
  });
});

// Context menu click handler
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'create-asana-task') {
    let contextText = '';
    let url = tab.url;
    
    // Handle different contexts
    if (info.selectionText) {
      contextText = `Ausgewählter Text: ${info.selectionText}\n\n`;
    }
    
    if (info.linkUrl) {
      url = info.linkUrl;
    }
    
    createTaskWithCurrentPage(url, tab.title, contextText);
  }
});

// Handle messages from content script (e.g., Gmail integration)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'createTaskFromGmail') {
    createTaskFromGmail(request.data, sendResponse);
    return true; // Keep the message channel open for async response
  }
});

// Function to create a task with current page info
function createTaskWithCurrentPage(url, title, additionalText = '') {
  // Check if settings are configured
  chrome.storage.sync.get(['accessToken', 'workspace', 'lastTicketId'], function(data) {
    if (!data.accessToken || !data.workspace) {
      // Open settings page if not configured
      chrome.tabs.create({url: "settings.html"});
      return;
    }
    
    // Open popup or create task directly
    if (additionalText) {
      // If we have additional context, open the popup with pre-filled info
      chrome.storage.sync.set({
        'tempTaskData': {
          title: title,
          description: `${additionalText}URL: ${url}\n\n`,
          url: url
        }
      }, function() {
        chrome.action.openPopup();
      });
    } else {
      chrome.action.openPopup();
    }
  });
}

// Function to create a task from Gmail
function createTaskFromGmail(data, sendResponse) {
  chrome.storage.sync.get([
    'accessToken', 
    'workspace', 
    'lastTicketId', 
    'ticketPrefix', 
    'defaultProject',
    'aiProvider',
    'aiApiKey'
  ], function(settings) {
    if (!settings.accessToken || !settings.workspace) {
      sendResponse({success: false, message: 'API nicht konfiguriert'});
      return;
    }
    
    // Get next ticket ID
    const ticketId = settings.lastTicketId ? settings.lastTicketId + 1 : 1000;
    const ticketPrefix = settings.ticketPrefix || 'WPWW-';
    const formattedTicketId = `${ticketPrefix}${ticketId}`;
    
    // Überprüfen, ob KI-Integration verwendet werden soll
    if (data.useAI && settings.aiProvider && settings.aiApiKey) {
      // Generiere eine Zusammenfassung mit KI, bevor der Task erstellt wird
      generateAISummary(data, settings)
        .then(summary => {
          createTicketWithDescription(data, settings, ticketId, formattedTicketId, summary, sendResponse);
        })
        .catch(error => {
          console.error('Fehler bei der KI-Zusammenfassung:', error);
          // Erstelle Ticket ohne KI-Zusammenfassung, wenn ein Fehler aufgetreten ist
          const fallbackDescription = `Von: ${data.from}\nBetreff: ${data.subject}\n\nEmail-Inhalt:\n${data.body}\n\nEmail-URL: ${data.url}`;
          createTicketWithDescription(data, settings, ticketId, formattedTicketId, fallbackDescription, sendResponse);
        });
    } else {
      // Ohne KI-Integration: Standard-Beschreibung verwenden
      const description = `Von: ${data.from}\nBetreff: ${data.subject}\n\nEmail-Inhalt:\n${data.body}\n\nEmail-URL: ${data.url}`;
      createTicketWithDescription(data, settings, ticketId, formattedTicketId, description, sendResponse);
    }
  });
}

// Funktion zum Generieren einer KI-Zusammenfassung
async function generateAISummary(data, settings) {
  // Je nach ausgewähltem KI-Anbieter unterschiedliche API-Endpunkte verwenden
  const apiKey = settings.aiApiKey;
  const provider = settings.aiProvider;
  
  // Prompt für die KI-Anfrage
  const prompt = `
    Fasse die folgende E-Mail für ein Asana-Ticket zusammen.
    Identifiziere die Hauptpunkte und wichtigsten Anforderungen.
    Behalte relevante Details bei, während du unwichtige Informationen weglässt.
    Formatiere die Zusammenfassung klar und übersichtlich in Markdown.
    
    E-MAIL:
    Betreff: ${data.subject}
    Von: ${data.from}
    
    ${data.body}
  `;
  
  try {
    let summary = '';
    
    if (provider === 'openai') {
      // OpenAI (ChatGPT) API-Aufruf
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o', // oder anderes OpenAI-Modell
          messages: [
            {
              role: 'system',
              content: 'Du bist ein Assistent, der E-Mails für Asana-Tickets zusammenfasst.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1000
        })
      });
      
      if (!response.ok) throw new Error('OpenAI API-Fehler');
      
      const responseData = await response.json();
      summary = responseData.choices[0].message.content;
    } 
    else if (provider === 'claude') {
      // Anthropic (Claude) API-Aufruf
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-sonnet-20240229', // oder anderes Claude-Modell
          max_tokens: 1000,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        })
      });
      
      if (!response.ok) throw new Error('Anthropic API-Fehler');
      
      const responseData = await response.json();
      summary = responseData.content[0].text;
    } 
    else if (provider === 'gemini') {
      // Google (Gemini) API-Aufruf
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + apiKey, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ],
          generationConfig: {
            maxOutputTokens: 1000
          }
        })
      });
      
      if (!response.ok) throw new Error('Google API-Fehler');
      
      const responseData = await response.json();
      summary = responseData.candidates[0].content.parts[0].text;
    }
    
    // Format die Antwort für Asana
    return `# KI-generierte Zusammenfassung\n${summary}\n\n---\n\n# Original-Email\nVon: ${data.from}\nBetreff: ${data.subject}\n\nEmail-Inhalt:\n${data.body}\n\nEmail-URL: ${data.url}`;
  } catch (error) {
    console.error('Fehler bei KI-API:', error);
    throw error;
  }
}

// Funktion zum Erstellen des Tickets mit gegebener Beschreibung
function createTicketWithDescription(data, settings, ticketId, formattedTicketId, description, sendResponse) {
  // Prepare task data
  const title = `${formattedTicketId}: ${data.subject}`;
  
  // Create task in Asana
  const headers = new Headers({
    'Authorization': `Bearer ${settings.accessToken}`,
    'Content-Type': 'application/json'
  });

  // Holen der User-ID für die Zuweisung
  chrome.storage.sync.get(['userId'], function(userData) {
    // Prepare task data according to Asana API
    const taskData = {
      data: {
        name: title,
        notes: description,
        workspace: settings.workspace
      }
    };
    
    // Automatische Zuweisung an den aktuellen Benutzer
    if (userData.userId) {
      taskData.data.assignee = userData.userId;
    }
    
    // Add to default project if configured
    if (settings.defaultProject) {
      taskData.data.projects = [settings.defaultProject];
    }

  // Send request to Asana API
  fetch('https://app.asana.com/api/1.0/tasks', {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(taskData)
  })
  .then(response => response.json())
  .then(responseData => {
    if (responseData.data && responseData.data.gid) {
      // Update last ticket ID in storage
      chrome.storage.sync.set({'lastTicketId': ticketId});
      
      // Speichere die Task-ID für weitere Verarbeitung
      const taskId = responseData.data.gid;
      
      // Bilder hochladen, falls verfügbar und ausgewählt
      let imagesMessage = '';
      if (data.imageAttachments && data.imageAttachments.length > 0) {
        imagesMessage = `, ${data.imageAttachments.length} Bilder werden hinzugefügt`;
        uploadImageAttachments(taskId, data.imageAttachments, settings.accessToken);
      }
      
      // Handle reguläre Anhänge, falls vorhanden
      if (data.attachments && data.attachments.length > 0) {
        sendResponse({
          success: true, 
          taskId: taskId, 
          message: `Ticket erstellt${imagesMessage}, Anhänge werden verarbeitet`
        });
      } else {
        sendResponse({
          success: true, 
          taskId: taskId, 
          message: `Ticket erstellt${imagesMessage}`
        });
      }
    } else {
      sendResponse({
        success: false, 
        message: responseData.errors ? responseData.errors[0].message : 'Unbekannter Fehler'
      });
    }
  })
  .catch(error => {
    console.error('Error creating task:', error);
    sendResponse({success: false, message: error.message});
  });
  }); // Schließende Klammer für chrome.storage.sync.get
}

// Funktion zum Hochladen von Bildern als Asana-Anhänge
async function uploadImageAttachments(taskId, imageAttachments, accessToken) {
  if (!imageAttachments || imageAttachments.length === 0) return;
  
  const headers = {
    'Authorization': `Bearer ${accessToken}`
  };
  
  for (const image of imageAttachments) {
    try {
      // 1. Zuerst versuchen, das Bild als Datei herunterzuladen
      const response = await fetch(image.url);
      
      if (!response.ok) {
        // Wenn Datei-Download fehlschlägt, einen Kommentar mit Link erstellen
        console.log('Bild konnte nicht heruntergeladen werden, füge Link hinzu:', image.url);
        
        await fetch(`https://app.asana.com/api/1.0/tasks/${taskId}/stories`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            data: {
              text: `Bild aus der E-Mail: [${image.alt}](${image.url})`,
            }
          })
        });
        
        continue; // Mit dem nächsten Bild fortfahren
      }
      
      // Blob aus der Antwort erstellen
      const blob = await response.blob();
      
      // Dateiname aus URL oder Alt-Text generieren
      let filename = image.url.split('/').pop() || 'email_image.jpg';
      if (!filename.includes('.')) {
        // Wenn keine Dateiendung gefunden wurde, .jpg anhängen
        filename += '.jpg';
      }
      
      // FormData-Objekt für den Upload erstellen
      const formData = new FormData();
      formData.append('file', blob, filename);
      
      // Bild zu Asana hochladen
      const uploadResponse = await fetch(`https://app.asana.com/api/1.0/tasks/${taskId}/attachments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`
          // WICHTIG: Bei FormData keinen Content-Type-Header angeben, damit die Boundary korrekt gesetzt wird
        },
        body: formData
      });
      
      if (!uploadResponse.ok) {
        // Wenn Upload fehlschlägt, versuche stattdessen einen Kommentar mit Link zu erstellen
        console.error('Fehler beim Hochladen des Bilds, füge Link hinzu:', await uploadResponse.text());
        
        await fetch(`https://app.asana.com/api/1.0/tasks/${taskId}/stories`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            data: {
              text: `Bild aus der E-Mail: [${image.alt}](${image.url})`,
            }
          })
        });
      } else {
        console.log('Bild erfolgreich hochgeladen:', filename);
      }
    } catch (error) {
      console.error('Fehler beim Verarbeiten des Bilds:', error);
      
      // Fallback: Bei Fehlern Link als Kommentar hinzufügen
      try {
        await fetch(`https://app.asana.com/api/1.0/tasks/${taskId}/stories`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            data: {
              text: `Bild aus der E-Mail (konnte nicht hochgeladen werden): [${image.alt}](${image.url})`,
            }
          })
        });
      } catch (commentError) {
        console.error('Auch Fallback-Kommentar fehlgeschlagen:', commentError);
      }
    }
  }
}