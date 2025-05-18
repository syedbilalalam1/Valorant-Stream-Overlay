// Background controller for game monitoring and data transmission

class BackgroundController {
  constructor() {
    // Connection properties
    this.serverUrl = '';
    this.playerToken = '';
    this.isConnected = false;
    this.inGame = false;
    this.transmissionActive = false;
    this.transmissionInterval = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    
    // Windows
    this.mainWindowId = null;
    this.inGameWindowId = null;
    
    // Player data default structure
    this.playerData = {
      token: '',
      username: '',
      agent: '',
      health: 100,
      shield: 0,
      ult_points_needed: 7,
      ult_points_gained: 0,
      weapon: '',
      c_util: true,
      q_util: true,
      e_util: true,
      x_util: false,
      credits: 0,
      has_spike: false,
      is_dead: false
    };
    
    // Initialize app
    this.init();
  }
  
  init() {
    console.log("Initializing background controller");
    
    // Store window IDs for messaging
    this.getWindowIds();
    
    // Set up game event listeners
    this.registerGameEvents();
    
    // Register for game launch events
    this.registerGameListeners();
    
    // Load saved connection info if exists
    this.loadSavedConnectionInfo();
  }
  
  getWindowIds() {
    overwolf.windows.getMainWindow((result) => {
      if (result.status === "success") {
        this.mainWindowId = result.window.id;
      }
    });
    
    overwolf.windows.obtainDeclaredWindow("in_game", (result) => {
      if (result.status === "success") {
        this.inGameWindowId = result.window.id;
      }
    });
  }
  
  registerGameEvents() {
    // Register for VALORANT game events
    overwolf.games.events.setRequiredFeatures(
      ["kill", "death", "match_info", "match_state", "me", "team", "game_info"],
      (status) => {
        if (status === "success") {
          console.log("Registered to game events");
          overwolf.games.events.onInfoUpdates2.addListener(this.handleGameEvent.bind(this));
          overwolf.games.events.onNewEvents.addListener(this.handleGameEvent.bind(this));
        } else {
          console.error("Failed to register for game events:", status);
          this.sendStatusToMain(`Failed to register game events: ${status}`, true);
        }
      }
    );
  }
  
  registerGameListeners() {
    // Listen for game info updates (running state, etc.)
    overwolf.games.onGameInfoUpdated.addListener(this.handleGameInfoUpdate.bind(this));
  }
  
  loadSavedConnectionInfo() {
    try {
      const serverUrl = localStorage.getItem('serverUrl');
      const playerToken = localStorage.getItem('playerToken');
      
      if (serverUrl && playerToken) {
        this.serverUrl = serverUrl;
        this.playerToken = playerToken;
        this.playerData.token = playerToken;
        
        // Auto-connect if we have saved credentials
        this.connect(serverUrl, playerToken);
      }
    } catch (error) {
      console.error('Error loading saved connection info:', error);
    }
  }
  
  async connect(serverUrl, playerToken) {
    this.serverUrl = serverUrl;
    this.playerToken = playerToken;
    this.playerData.token = playerToken;
    
    // Notify UI that we're connecting
    this.sendStatusToMain("Connecting to server...");
    
    try {
      const formData = new FormData();
      formData.append('playerToken', playerToken);
      
      const response = await fetch(`${serverUrl}/register_external_user`, {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (data.status) {
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.sendStatusToMain("Connected successfully!");
        this.sendStatusToInGame("Connected to server", "connected");
        
        // If game is running, start data transmission
        if (this.inGame) {
          this.startDataTransmission();
        }
      } else {
        this.isConnected = false;
        this.sendStatusToMain(`Connection failed: ${data.message}`, true);
        this.sendStatusToInGame("Connection error", "error");
      }
    } catch (error) {
      this.isConnected = false;
      this.sendStatusToMain(`Connection error: ${error.message}`, true);
      this.sendStatusToInGame("Connection error", "error");
    }
  }
  
  async disconnect() {
    if (!this.isConnected) return;
    
    try {
      // Stop data transmission
      this.stopDataTransmission();
      
      // Deregister from server
      const formData = new FormData();
      formData.append('playerToken', this.playerToken);
      
      await fetch(`${this.serverUrl}/clear_external_user`, {
        method: 'POST',
        body: formData
      });
      
      this.isConnected = false;
      this.sendStatusToMain("Disconnected from server");
      this.sendStatusToInGame("Disconnected", "error");
      
    } catch (error) {
      console.error('Error disconnecting:', error);
    }
  }
  
  handleGameInfoUpdate(gameInfo) {
    if (!gameInfo || !gameInfo.gameInfo) return;
    
    // Check if VALORANT is running
    if (gameInfo.gameInfo.isRunning) {
      if (gameInfo.gameInfo.classId === 21640) { // VALORANT class ID
        console.log("VALORANT is running");
        this.inGame = true;
        
        // Show in-game window
        this.showInGameWindow();
        
        // Start data transmission if connected
        if (this.isConnected) {
          this.startDataTransmission();
        }
      }
    } else {
      console.log("VALORANT is not running");
      this.inGame = false;
      this.stopDataTransmission();
    }
  }
  
  handleGameEvent(event) {
    try {
      // Process game events to update player data
      if (!event) return;
      
      // Handle info updates
      if (event.feature) {
        switch (event.feature) {
          case "me":
            if (event.info && event.info.me) {
              // Update player stats from game data
              const playerInfo = event.info.me;
              
              if (playerInfo.name) {
                this.playerData.username = playerInfo.name;
              }
              
              if (playerInfo.agent) {
                this.playerData.agent = playerInfo.agent.toLowerCase();
              }
              
              // Health and shield
              if (playerInfo.health !== undefined) {
                this.playerData.health = parseInt(playerInfo.health) || 0;
              }
              
              if (playerInfo.shield !== undefined) {
                this.playerData.shield = parseInt(playerInfo.shield) || 0;
              }
              
              // Ultimate status
              if (playerInfo.ultimate) {
                const ultimate = playerInfo.ultimate;
                this.playerData.ult_points_gained = parseInt(ultimate.progress) || 0;
                this.playerData.ult_points_needed = parseInt(ultimate.cost) || 7;
                this.playerData.x_util = ultimate.ready === "true";
              }
              
              // Abilities
              if (playerInfo.abilities) {
                const abilities = playerInfo.abilities;
                this.playerData.c_util = abilities.ability1.state !== "unavailable";
                this.playerData.q_util = abilities.ability2.state !== "unavailable";
                this.playerData.e_util = abilities.grenade.state !== "unavailable";
              }
              
              // Credits
              if (playerInfo.money !== undefined) {
                this.playerData.credits = parseInt(playerInfo.money) || 0;
              }
              
              // Current weapon
              if (playerInfo.weapons && playerInfo.weapons.activeWeapon) {
                this.playerData.weapon = playerInfo.weapons.activeWeapon.name.toLowerCase();
              }
              
              // Dead state
              this.playerData.is_dead = playerInfo.state === "dead";
            }
            break;
            
          case "match_info":
            // Update match info
            if (event.info && event.info.match_info && event.info.match_info.hasSpike) {
              this.playerData.has_spike = event.info.match_info.hasSpike === "true";
            }
            break;
        }
      }
      
      // Handle new events
      if (event.events) {
        event.events.forEach(gameEvent => {
          if (gameEvent.name === "kill" && gameEvent.data) {
            // Handle kills
          } else if (gameEvent.name === "death" && gameEvent.data) {
            // Handle deaths
            if (gameEvent.data.victim && gameEvent.data.victim.isLocalPlayer) {
              this.playerData.is_dead = true;
              this.playerData.health = 0;
            }
          }
        });
      }
    } catch (error) {
      console.error("Error processing game event:", error);
    }
  }
  
  startDataTransmission() {
    if (this.transmissionActive) return;
    
    console.log("Starting data transmission");
    this.transmissionActive = true;
    
    // Send data every second
    this.transmissionInterval = setInterval(() => {
      this.sendPlayerData();
    }, 1000);
    
    this.sendStatusToInGame("Transmitting data", "connected");
  }
  
  stopDataTransmission() {
    if (!this.transmissionActive) return;
    
    console.log("Stopping data transmission");
    this.transmissionActive = false;
    
    if (this.transmissionInterval) {
      clearInterval(this.transmissionInterval);
      this.transmissionInterval = null;
    }
    
    this.sendStatusToInGame("Data transmission stopped", "error");
  }
  
  async sendPlayerData() {
    if (!this.isConnected || !this.transmissionActive) return;
    
    try {
      const formData = new FormData();
      formData.append('playerData', JSON.stringify(this.playerData));
      
      const response = await fetch(`${this.serverUrl}/update_player_state`, {
        method: 'POST',
        body: formData
      });
      
      if (response.status !== 200) {
        console.error("Error sending player data, status:", response.status);
        
        // Try to reconnect if server connection is lost
        this.reconnectAttempts++;
        
        if (this.reconnectAttempts <= this.maxReconnectAttempts) {
          this.sendStatusToInGame(`Connection error, retrying... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`, "error");
          
          // Try to reconnect
          setTimeout(() => {
            this.connect(this.serverUrl, this.playerToken);
          }, 2000);
        } else {
          this.stopDataTransmission();
          this.isConnected = false;
          this.sendStatusToMain("Connection lost after multiple attempts", true);
          this.sendStatusToInGame("Connection lost", "error");
        }
      } else {
        // Reset reconnect counter on successful transmission
        this.reconnectAttempts = 0;
      }
    } catch (error) {
      console.error("Error sending player data:", error);
      this.sendStatusToInGame("Error sending data", "error");
    }
  }
  
  showInGameWindow() {
    overwolf.windows.obtainDeclaredWindow("in_game", (result) => {
      if (result.status === "success") {
        overwolf.windows.restore(result.window.id, (restoreResult) => {
          console.log("In-game window shown");
        });
      }
    });
  }
  
  sendStatusToMain(message, isError = false) {
    overwolf.windows.sendMessage(this.mainWindowId, "status_update", message, (result) => {});
  }
  
  sendStatusToInGame(message, status) {
    if (this.inGameWindowId) {
      overwolf.windows.sendMessage(this.inGameWindowId, "game_status_update", message, status, (result) => {});
    }
  }
}

// Initialize and make available to other windows
window.backgroundController = new BackgroundController();

// Handle app shutdown
overwolf.windows.onMainWindowClosed.addListener(() => {
  if (window.backgroundController) {
    window.backgroundController.disconnect();
  }
}); 