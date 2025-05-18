// Main window controller for Overwolf app

class MainController {
  constructor() {
    this.serverUrlInput = document.getElementById('server-url');
    this.playerTokenInput = document.getElementById('player-token');
    this.connectButton = document.getElementById('connect-btn');
    this.statusElement = document.getElementById('status');
    
    // Check for stored values
    this.loadSavedSettings();
    
    // Set up event listeners
    this.setupEventListeners();
  }
  
  loadSavedSettings() {
    try {
      const serverUrl = localStorage.getItem('serverUrl');
      const playerToken = localStorage.getItem('playerToken');
      
      if (serverUrl) {
        this.serverUrlInput.value = serverUrl;
      }
      
      if (playerToken) {
        this.playerTokenInput.value = playerToken;
      }
    } catch (error) {
      console.error('Error loading saved settings:', error);
    }
  }
  
  setupEventListeners() {
    // Handle connect button
    this.connectButton.addEventListener('click', () => {
      this.connectToServer();
    });
    
    // Listen for messages from background
    overwolf.windows.onMessageReceived.addListener((message) => {
      if (message.id === 'status_update') {
        this.updateStatus(message.content);
      }
    });
  }
  
  updateStatus(message, isError = false) {
    this.statusElement.textContent = message;
    this.statusElement.className = isError ? 'error' : '';
    
    if (!isError && message.includes('Connected')) {
      this.statusElement.classList.add('connected');
    }
  }
  
  async connectToServer() {
    const serverUrl = this.serverUrlInput.value.trim();
    const playerToken = this.playerTokenInput.value.trim();
    
    if (!serverUrl || !playerToken) {
      this.updateStatus('Please enter both server URL and token', true);
      return;
    }
    
    // Save to local storage
    localStorage.setItem('serverUrl', serverUrl);
    localStorage.setItem('playerToken', playerToken);
    
    this.updateStatus('Connecting...');
    
    // Get background window to handle connection
    const backgroundWindow = overwolf.windows.getMainWindow();
    if (backgroundWindow && backgroundWindow.backgroundController) {
      backgroundWindow.backgroundController.connect(serverUrl, playerToken);
    } else {
      this.updateStatus('Error accessing background process', true);
    }
  }
}

// Initialize controller when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const controller = new MainController();
}); 