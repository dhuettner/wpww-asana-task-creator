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
  // Look for the Gmail toolbar
  const toolbar = document.querySelector('.aqK, .iN');
  if (!toolbar) return;
  
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
  // Extract email data
  const subject = document.querySelector('.hP')?.textContent || 'Kein Betreff';
  const from = document.querySelector('.gD')?.textContent || 'Unbekannter Absender';
  
  // Get email body
  let body = 'Email-Inhalt konnte nicht extrahiert werden';
  const bodyElement = document.querySelector('.a3s.aiL');
  if (bodyElement) {
    // Get plain text version of email body
    body = bodyElement.innerText.substring(0, 1000) + '...';
  }
  
  // Get attachments
  const attachments = [];
  const attachmentElements = document.querySelectorAll('.aZo, .aQy');
  attachmentElements.forEach(el => {
    const fileName = el.getAttribute('download_url');
    if (fileName) {
      attachments.push(fileName);
    }
  });
  
  // Get current email URL
  const url = window.location.href;
  
  // Send message to background script
  chrome.runtime.sendMessage({
    action: 'createTaskFromGmail',
    data: {
      subject,
      from,
      body,
      attachments,
      url
    }
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