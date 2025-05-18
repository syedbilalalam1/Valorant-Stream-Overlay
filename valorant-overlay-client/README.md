# HelValorant Overlay Client

This is the Overwolf client application for the HelValorant Tournament Overlay system. This app captures real-time game data from VALORANT and sends it to the overlay server, enabling dynamic tournament overlays for broadcasters.

## Setup for Development

1. Install the Overwolf client from [overwolf.com](https://www.overwolf.com)
2. Enable Developer Mode in Overwolf settings
3. Load this app as an "unpacked extension"
4. Create an `icons` folder and add two icon files:
   - `iconMouseNormal.png` - Icon in normal state
   - `iconMouseOver.png` - Icon in hover state

## Usage Instructions for Players

1. Install the app from the tournament organizer
2. Get your tournament token from the organizer
3. Enter the server URL and your token when prompted
4. Start VALORANT and join your match
5. The app will automatically connect and send game data

## Directory Structure

```
valorant-overlay-client/
├── icons/                  # App icons
│   ├── iconMouseNormal.png # Normal state icon (16x16)
│   └── iconMouseOver.png   # Hover state icon (16x16)
├── js/                     # JavaScript files
│   ├── background.js       # Core app logic
│   ├── in_game.js          # In-game overlay controller
│   └── main.js             # Main window controller
├── windows/                # HTML files for app windows
│   ├── background.html     # Background process
│   ├── in_game.html        # In-game status window
│   └── main.html           # Main configuration window
└── manifest.json           # App configuration
```

## For Developers

The app works by:
1. Capturing VALORANT game events through Overwolf's API
2. Formatting the data to match the server's expected structure
3. Sending updates to the server over HTTP POST requests
4. Maintaining connection state and handling reconnection

## Troubleshooting

- If the app fails to connect, ensure the server URL is correct and the token is valid
- Check the Overwolf console for error messages (accessible through the developer tools)
- Make sure VALORANT is running before attempting to connect
- Verify that your server is accessible from the player's network 