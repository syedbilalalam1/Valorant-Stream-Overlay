// In-game status window controller

class InGameController {
  constructor() {
    this.statusIndicator = document.getElementById('status-indicator');
    this.statusText = document.getElementById('status-text');
    this.closeButton = document.getElementById('close-btn');
    
    this.setupEventListeners();
  }
  
  setupEventListeners() {
    // Handle close button
    this.closeButton.addEventListener('click', () => {
      overwolf.windows.getCurrentWindow((result) => {
        if (result.status === 'success') {
          overwolf.windows.minimize(result.window.id);
        }
      });
    });
    
    // Listen for status updates from background
    overwolf.windows.onMessageReceived.addListener((message) => {
      if (message.id === 'game_status_update') {
        this.updateStatus(message.content, message.status);
      }
    });
  }
  
  updateStatus(message, status) {
    this.statusText.textContent = message;
    
    // Clear existing classes
    this.statusText.classList.remove('status-connected', 'status-error');
    this.statusIndicator.classList.remove('indicator-connected', 'indicator-error');
    
    if (status === 'connected') {
      this.statusText.classList.add('status-connected');
      this.statusIndicator.classList.add('indicator-connected');
    } else if (status === 'error') {
      this.statusText.classList.add('status-error');
      this.statusIndicator.classList.add('indicator-error');
    }
  }
}

// Initialize controller when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const controller = new InGameController();
}); 