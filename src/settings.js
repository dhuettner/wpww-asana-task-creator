document.addEventListener('DOMContentLoaded', function() {
  // DOM Elements
  const accessTokenInput = document.getElementById('access-token');
  const authorizeButton = document.getElementById('authorize');
  const authStatusEl = document.getElementById('auth-status');
  const workspaceSelect = document.getElementById('workspace');
  const ticketPrefixInput = document.getElementById('ticket-prefix');
  const lastTicketIdInput = document.getElementById('last-ticket-id');
  const priorityFieldSelect = document.getElementById('priority-field');
  const aiProviderSelect = document.getElementById('ai-provider');
  const aiApiKeyInput = document.getElementById('ai-api-key');
  const includeImagesSelect = document.getElementById('include-images');
  const debugModeCheckbox = document.getElementById('debug-mode');
  const saveButton = document.getElementById('save-settings');
  const statusEl = document.getElementById('status');

  // OAuth state
  let accessToken = null;
  let isAuthenticated = false;

  // Load saved settings
  chrome.storage.sync.get([
    'accessToken',
    'tokenExpiry',
    'workspace', 
    'ticketPrefix', 
    'lastTicketId',
    'priorityFieldId',
    'customFields',
    'aiProvider',
    'aiApiKey',
    'includeImages',
    'debugMode'
  ], function(data) {
    if (data.accessToken) {
      accessTokenInput.value = data.accessToken;
      accessToken = data.accessToken;
      
      // Verify if token is still valid
      testToken(data.accessToken);
    }

    if (data.workspace && isAuthenticated) {
      workspaceSelect.value = data.workspace;
      fetchCustomFields(accessToken, data.workspace);
    }

    if (data.ticketPrefix) {
      ticketPrefixInput.value = data.ticketPrefix;
    }

    if (data.lastTicketId) {
      lastTicketIdInput.value = data.lastTicketId;
    }

    if (data.priorityFieldId && data.customFields) {
      priorityFieldSelect.value = data.priorityFieldId;
    }
    
    // Load AI provider settings
    if (data.aiProvider) {
      aiProviderSelect.value = data.aiProvider;
    }
    
    if (data.aiApiKey) {
      aiApiKeyInput.value = data.aiApiKey;
    }
    
    if (data.includeImages) {
      includeImagesSelect.value = data.includeImages;
    } else {
      includeImagesSelect.value = 'never'; // Default-Wert
    }
    
    // Debug-Modus laden
    if (data.debugMode) {
      debugModeCheckbox.checked = data.debugMode;
    }
  });

  // Auth button click handler
  authorizeButton.addEventListener('click', function() {
    const token = accessTokenInput.value.trim();
    
    if (!token) {
      showStatus('Bitte geben Sie Ihren Persönlichen Zugriffstoken ein', 'error');
      return;
    }

    // Test token and save if valid
    testToken(token);
  });

  // Workspace select change handler
  workspaceSelect.addEventListener('change', function() {
    const workspaceId = workspaceSelect.value;
    
    if (accessToken && workspaceId) {
      fetchCustomFields(accessToken, workspaceId);
    }
  });

  // Save settings button click handler
  saveButton.addEventListener('click', function() {
    const workspaceId = workspaceSelect.value;
    const ticketPrefix = ticketPrefixInput.value.trim();
    const lastTicketId = parseInt(lastTicketIdInput.value, 10) || 999;
    const priorityFieldId = priorityFieldSelect.value;
    const aiProvider = aiProviderSelect.value;
    const aiApiKey = aiApiKeyInput.value.trim();
    const includeImages = includeImagesSelect.value;
    const debugMode = debugModeCheckbox.checked;

    if (!isAuthenticated) {
      showStatus('Bitte überprüfen Sie zuerst Ihren Token', 'error');
      return;
    }

    if (!workspaceId) {
      showStatus('Bitte wählen Sie einen Workspace', 'error');
      return;
    }
    
    // Validiere API-Key, wenn ein Provider ausgewählt wurde
    if (aiProvider && !aiApiKey) {
      showStatus('Bitte geben Sie einen API-Schlüssel für den ausgewählten KI-Anbieter ein', 'error');
      return;
    }

    // Save settings to chrome.storage
    chrome.storage.sync.set({
      'workspace': workspaceId,
      'ticketPrefix': ticketPrefix,
      'lastTicketId': lastTicketId,
      'priorityFieldId': priorityFieldId,
      'aiProvider': aiProvider,
      'aiApiKey': aiApiKey,
      'includeImages': includeImages,
      'debugMode': debugMode
    }, function() {
      showStatus('Einstellungen wurden erfolgreich gespeichert', 'success');
    });
  });

  // Test if token is valid
  function testToken(token) {
    updateAuthUI('pending');
    
    const headers = new Headers({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    fetch('https://app.asana.com/api/1.0/users/me', {
      method: 'GET',
      headers: headers
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP Fehler: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      if (data.data) {
        // Token is valid, save it
        chrome.storage.sync.set({
          'accessToken': token,
          'tokenExpiry': new Date().getTime() + (365 * 24 * 60 * 60 * 1000) // Set expiry to 1 year (tokens don't expire unless revoked)
        }, function() {
          accessToken = token;
          isAuthenticated = true;
          updateAuthUI(true);
          showStatus('Token erfolgreich überprüft', 'success');
          
          // Fetch workspaces with valid token
          fetchWorkspaces(token);
        });
      } else {
        throw new Error('Ungültige Antwort von Asana');
      }
    })
    .catch(error => {
      updateAuthUI(false);
      showStatus('Fehler: ' + error.message, 'error');
    });
  }

  // Function to fetch workspaces from Asana
  function fetchWorkspaces(token) {
    const headers = new Headers({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    fetch('https://app.asana.com/api/1.0/workspaces', {
      method: 'GET',
      headers: headers
    })
    .then(response => response.json())
    .then(data => {
      // Enable workspace selector
      workspaceSelect.disabled = false;
      
      // Clear existing options
      workspaceSelect.innerHTML = '<option value="">-- Wählen Sie einen Workspace --</option>';

      if (data.data) {
        // Add workspaces to select
        data.data.forEach(workspace => {
          const option = document.createElement('option');
          option.value = workspace.gid;
          option.textContent = workspace.name;
          workspaceSelect.appendChild(option);
        });

        // Restore previously selected workspace if any
        chrome.storage.sync.get(['workspace'], function(data) {
          if (data.workspace) {
            workspaceSelect.value = data.workspace;
            fetchCustomFields(accessToken, data.workspace);
          }
        });
      }
    })
    .catch(error => {
      console.error('Error fetching workspaces:', error);
      showStatus('Fehler beim Laden der Workspaces: ' + error.message, 'error');
    });
  }

  // Function to fetch custom fields from a workspace
  function fetchCustomFields(token, workspaceId) {
    const headers = new Headers({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    // First fetch a project to get its custom fields
    fetch(`https://app.asana.com/api/1.0/workspaces/${workspaceId}/projects?limit=1`, {
      method: 'GET',
      headers: headers
    })
    .then(response => response.json())
    .then(data => {
      if (data.data && data.data.length > 0) {
        const projectId = data.data[0].gid;
        
        // Now fetch the custom fields for this project
        return fetch(`https://app.asana.com/api/1.0/projects/${projectId}/custom_field_settings`, {
          method: 'GET',
          headers: headers
        });
      } else {
        throw new Error('Keine Projekte im Workspace gefunden');
      }
    })
    .then(response => response.json())
    .then(data => {
      // Clear existing options
      priorityFieldSelect.innerHTML = '<option value="">-- Wählen Sie ein Feld --</option>';

      if (data.data) {
        const customFields = {};
        
        // Add custom fields to select
        data.data.forEach(fieldSetting => {
          const field = fieldSetting.custom_field;
          
          // Only add enum-type fields that could be used for priority
          if (field.resource_subtype === 'enum') {
            const option = document.createElement('option');
            option.value = field.gid;
            option.textContent = field.name;
            priorityFieldSelect.appendChild(option);
            
            // Store the field options if this is an enum type
            if (field.enum_options) {
              customFields[field.gid] = {
                name: field.name,
                options: field.enum_options.map(opt => ({
                  id: opt.gid,
                  name: opt.name
                }))
              };
            }
          }
        });

        // Save custom fields to storage
        chrome.storage.sync.set({'customFields': customFields});

        // Restore previously selected priority field if any
        chrome.storage.sync.get(['priorityFieldId'], function(data) {
          if (data.priorityFieldId) {
            priorityFieldSelect.value = data.priorityFieldId;
          }
        });
      }
    })
    .catch(error => {
      console.error('Error fetching custom fields:', error);
      showStatus('Fehler beim Laden der benutzerdefinierten Felder: ' + error.message, 'error');
    });
  }

  // Function to update auth UI
  function updateAuthUI(state) {
    if (state === 'pending') {
      authorizeButton.disabled = true;
      authorizeButton.textContent = 'Bitte warten...';
      authStatusEl.textContent = 'Überprüfung läuft...';
      authStatusEl.style.color = '#666';
    } else if (state === true) {
      authorizeButton.disabled = false;
      authorizeButton.textContent = 'Token erneut überprüfen';
      authStatusEl.textContent = 'Token ist gültig ✓';
      authStatusEl.style.color = '#155724';
    } else {
      authorizeButton.disabled = false;
      authorizeButton.textContent = 'Token überprüfen';
      authStatusEl.textContent = 'Nicht authentifiziert ✗';
      authStatusEl.style.color = '#721c24';
      workspaceSelect.disabled = true;
    }
  }

  // Einfache Funktion zur Anzeige von Statusmeldungen
  function showStatus(message, type) {
    // Einfache String-Konvertierung, keine komplexe Fehlerbehandlung
    let displayMessage = String(message);
    
    // Setze die Nachricht im UI
    statusEl.textContent = displayMessage;
    statusEl.className = 'status ' + type;
    
    // Auto-hide success messages after 3 seconds
    if (type === 'success') {
      setTimeout(function() {
        statusEl.className = 'status';
      }, 3000);
    }
  }
});