document.addEventListener('DOMContentLoaded', function() {
  // DOM Elements
  const projectSelect = document.getElementById('project');
  const titleInput = document.getElementById('title');
  const descriptionInput = document.getElementById('description');
  const prioritySelect = document.getElementById('priority');
  const createTaskButton = document.getElementById('create-task');
  const statusEl = document.getElementById('status');
  const settingsLink = document.getElementById('settings-link');

  // Load settings and populate projects dropdown
  chrome.storage.sync.get(['accessToken', 'workspace', 'projects', 'lastTicketId'], function(data) {
    console.log('Popup: Gespeicherte Einstellungen geladen', {
      hasAccessToken: !!data.accessToken,
      hasWorkspace: !!data.workspace
    });
    
    if (!data.accessToken || !data.workspace) {
      console.log('Popup: Token oder Workspace fehlt, Weiterleitung zu Einstellungen');
      // Redirect to settings if access token or workspace is not set
      window.location.href = 'settings.html';
      return;
    }

    // Immer Projekte neu laden, um sicherzustellen, dass wir aktuelle Daten haben
    // Vorhandene Projekte löschen
    projectSelect.innerHTML = '';
    
    // Projekte neu laden
    fetchProjects(data.accessToken, data.workspace);


    // Pre-fill description with current URL and Ticket ID
    chrome.storage.sync.get(['lastTicketId', 'ticketPrefix'], function(idData) {
      const ticketId = idData.lastTicketId ? idData.lastTicketId + 1 : 1000;
      const ticketPrefix = idData.ticketPrefix || 'WPWW-';
      const formattedTicketId = `${ticketPrefix}${ticketId}`;
      
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (tabs[0] && tabs[0].url) {
          descriptionInput.value = `URL: ${tabs[0].url}\n\nTicket-ID: ${formattedTicketId}\n\n`;
          
          // Try to use page title as task title
          if (tabs[0].title) {
            titleInput.value = tabs[0].title;
          }
        }
      });
    });
  });

  // Create task button click handler
  createTaskButton.addEventListener('click', function() {
    // Get ticket ID and increment for next use
    chrome.storage.sync.get(['accessToken', 'workspace', 'lastTicketId', 'ticketPrefix'], function(data) {
      if (!data.accessToken) {
        showStatus('Fehlende API-Einstellungen. Bitte überprüfen Sie die Einstellungen.', 'error');
        return;
      }

      const ticketId = data.lastTicketId ? data.lastTicketId + 1 : 1000;
      const ticketPrefix = data.ticketPrefix || 'WPWW-';
      const formattedTicketId = `${ticketPrefix}${ticketId}`;

      // Prepare task data
      const projectId = projectSelect.value;
      const title = `${titleInput.value} | ${formattedTicketId}`;
      const description = descriptionInput.value;
      const priority = prioritySelect.value;

      // Create task in Asana
      createAsanaTask(data.accessToken, projectId, title, description, priority, function(success, response) {
        if (success) {
          // Update last ticket ID in storage
          chrome.storage.sync.set({'lastTicketId': ticketId}, function() {
            showStatus(`Ticket ${formattedTicketId} wurde erfolgreich erstellt!`, 'success');
            
            // Reset form fields
            titleInput.value = '';
            descriptionInput.value = '';
            
            // Close popup after short delay
            setTimeout(function() { window.close(); }, 2000);
          });
        } else {
          showStatus('Fehler beim Erstellen des Tickets: ' + response, 'error');
        }
      });
    });
  });

  // Settings link click handler
  settingsLink.addEventListener('click', function(e) {
    e.preventDefault();
    chrome.tabs.create({url: "settings.html"});
  });

  // Function to fetch projects from Asana
  function fetchProjects(token, workspaceId) {
    const headers = new Headers({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    showStatus('Lade Projekte...', 'info');
    
    // Fetch user info to get user ID
    fetch('https://app.asana.com/api/1.0/users/me', {
      method: 'GET',
      headers: headers
    })
    .then(response => response.json())
    .then(userData => {
      if (userData.data && userData.data.gid) {
        const userId = userData.data.gid;
        chrome.storage.sync.set({'userId': userId});
        
        // Direkt die regulären Projekte laden, ohne user_task_list abzufragen
        return fetch(`https://app.asana.com/api/1.0/workspaces/${workspaceId}/projects?limit=100&opt_fields=name,archived&archived=false`, {
          method: 'GET',
          headers: headers
        });
      } else {
        throw new Error('Benutzer-ID konnte nicht abgerufen werden');
      }
    })
    .then(response => response.json())
    .then(data => {
      if (data.data) {
        // Leere Option für "Meine Aufgaben" hinzufügen
        const emptyOption = document.createElement('option');
        emptyOption.value = '';
        emptyOption.textContent = '-- Meine Aufgaben --';
        projectSelect.appendChild(emptyOption);
        
        // Nur reguläre Projekte behalten (keine "Zuvor zugewiesene Aufgaben")
        const projects = data.data
          .filter(project => !project.archived && !project.name.startsWith('Zuvor zugewiesene Aufgaben')) 
          .map(project => ({
            id: project.gid,
            name: project.name
          }));

        // Save projects to storage
        chrome.storage.sync.set({'projects': projects});

        // Populate dropdown
        projects.forEach(project => {
          const option = document.createElement('option');
          option.value = project.id;
          option.textContent = project.name;
          projectSelect.appendChild(option);
        });
        
        showStatus('Projekte erfolgreich geladen', 'success');
        setTimeout(() => statusEl.className = 'status', 1000);
      }
    })
    .catch(error => {
      console.error('Error fetching projects:', error);
      showStatus('Fehler beim Laden der Projekte: ' + error.message, 'error');
    });
  }

  // Function to create a task in Asana
  function createAsanaTask(token, projectId, title, description, priority, callback) {
    const headers = new Headers({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    // Prepare task data according to Asana API
    chrome.storage.sync.get(['userId', 'workspace'], function(storageData) {
      const taskData = {
        data: {
          name: title,
          notes: description,
          workspace: storageData.workspace,
          custom_fields: {}
        }
      };

      // Eigentümer (sich selbst) hinzufügen, wenn User-ID vorhanden
      if (storageData.userId) {
        taskData.data.assignee = storageData.userId;
      }
      
      // Projekt hinzufügen, falls ausgewählt
      if (projectId) {
        taskData.data.projects = [projectId];
      }

      // Add priority if available as a custom field
      chrome.storage.sync.get(['priorityFieldId', 'priorityValues'], function(data) {
        if (data.priorityFieldId && data.priorityValues && data.priorityValues[priority]) {
          taskData.data.custom_fields[data.priorityFieldId] = data.priorityValues[priority];
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
            callback(true, data.data.gid);
          } else {
            callback(false, data.errors ? data.errors[0].message : 'Unbekannter Fehler');
          }
        })
        .catch(error => {
          console.error('Error creating task:', error);
          callback(false, error.message);
        });
      });
    });
  }

  // Function to show status messages
  function showStatus(message, type) {
    statusEl.textContent = message;
    statusEl.className = 'status ' + type;
    
    // Auto-hide success messages after 3 seconds
    if (type === 'success') {
      setTimeout(function() {
        statusEl.className = 'status';
      }, 3000);
    }
  }
});