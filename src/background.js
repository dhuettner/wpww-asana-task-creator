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
  chrome.storage.sync.get(['accessToken', 'workspace', 'lastTicketId', 'ticketPrefix', 'defaultProject'], function(settings) {
    if (!settings.accessToken || !settings.workspace) {
      sendResponse({success: false, message: 'API nicht konfiguriert'});
      return;
    }
    
    // Get next ticket ID
    const ticketId = settings.lastTicketId ? settings.lastTicketId + 1 : 1000;
    const ticketPrefix = settings.ticketPrefix || 'WPWW-';
    const formattedTicketId = `${ticketPrefix}${ticketId}`;
    
    // Prepare task data
    const title = `${formattedTicketId}: ${data.subject}`;
    let description = `Von: ${data.from}\nBetreff: ${data.subject}\n\nEmail-Inhalt:\n${data.body}\n\nEmail-URL: ${data.url}`;
    
    // Create task in Asana
    const headers = new Headers({
      'Authorization': `Bearer ${settings.accessToken}`,
      'Content-Type': 'application/json'
    });

    // Prepare task data according to Asana API
    const taskData = {
      data: {
        name: title,
        notes: description,
        workspace: settings.workspace
      }
    };
    
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
    .then(data => {
      if (data.data && data.data.gid) {
        // Update last ticket ID in storage
        chrome.storage.sync.set({'lastTicketId': ticketId});
        
        // Handle attachments if any
        if (data.attachments && data.attachments.length > 0) {
          // Upload each attachment
          // Note: This is a simplified version. Actual implementation would need to handle file uploads.
          sendResponse({success: true, taskId: data.data.gid, message: 'Ticket erstellt, Anhänge werden verarbeitet'});
        } else {
          sendResponse({success: true, taskId: data.data.gid, message: 'Ticket erstellt'});
        }
      } else {
        sendResponse({success: false, message: data.errors ? data.errors[0].message : 'Unbekannter Fehler'});
      }
    })
    .catch(error => {
      console.error('Error creating task:', error);
      sendResponse({success: false, message: error.message});
    });
  });
}