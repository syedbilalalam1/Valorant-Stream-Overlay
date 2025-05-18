# Valorant Overlay

A comprehensive tournament overlay system for Valorant esports broadcasts, featuring real-time game data integration, customizable overlays, and an admin control panel.

## Overview

The Valorant Overlay is a complete solution for tournament organizers and broadcasters to create professional Valorant esports streams. The system consists of:

1. **Overwolf Client** - A desktop application that captures real-time game data from players' Valorant clients
2. **Admin Panel** - A web interface for tournament organizers to control overlays and manage match information
3. **Overlay System** - Customizable browser-source overlays for OBS or other streaming software

## Features

- Real-time player statistics (health, shields, weapons, abilities)
- Map pick/ban visualization
- Team information display
- Match score tracking
- Customizable timers for breaks and pauses
- Admin control panel for tournament operators
- Seamless integration with OBS Studio

## Installation

### Prerequisites

- Node.js (v14 or higher)
- Overwolf client (for players)
- OBS Studio or similar streaming software (for broadcasters)

### Setup

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure your server settings in `config/appConfig.json`
4. Start the server:
   ```bash
   node server.js
   ```

## Usage

### For Tournament Organizers

1. Access the admin panel at `http://your-server-address/panel/admin_pre_live.html`
2. Log in with the credentials set in `config/appConfig.json`
3. Configure team information, map picks, and match settings
4. Share player tokens with participating teams

### For Players

1. Install the Overwolf client provided by the tournament organizer
2. Enter the tournament server URL and your player token
3. Launch Valorant and join your match
4. The client will automatically send game data to the overlay server

### For Broadcasters

1. Add browser sources to your OBS scene pointing to the overlay URLs
2. Customize the appearance using CSS if needed
3. The overlays will automatically update based on game state and admin panel inputs

## Configuration

### Team Setup

Edit team information in the admin panel, including:
- Team names and abbreviations
- Team logos (via URL)
- Player information

### Map Pool

Configure the map pool and pick/ban process in the admin panel:
- Set available maps
- Track map picks, bans and results
- Display current, upcoming, and completed maps

### Timers

Create custom timers for:
- Technical pauses
- Tactical timeouts
- Breaks between maps
- Pre-match countdowns

## Development

### Client Development

The Overwolf client can be loaded as an unpacked extension for development:
1. Enable Developer Mode in Overwolf settings
2. Load the `valorant-overlay-client` folder as an unpacked extension
3. Make changes to the client code as needed

#### Client HTML Components

1. **Main Window** (`windows/main.html`)
   - Connection interface with fields for server URL and player token
   - Styled with Valorant's color scheme (dark blue background, red accents)
   - Status indicator showing connection state

2. **In-Game Window** (`windows/in_game.html`)
   - Compact, semi-transparent overlay visible during gameplay
   - Shows connection status with color indicators (green/red)
   - Can be hidden with a "Hide" button

3. **Background Process** (`windows/background.html`)
   - Invisible component that handles game data crawling
   - Manages server communication and reconnection logic

#### Game Data Crawling

The client automatically crawls the following data from Valorant:
- Player health and shield values
- Selected agent and abilities status
- Ultimate charge progress
- Current weapon and credits
- Spike possession status
- Player death state

After crawling, the data is:
1. Formatted according to the server's expected structure
2. Sent to the server via HTTP POST requests
3. Transmitted at regular intervals while the game is running
4. Used to update the broadcast overlays in real-time

### Overlay Development

Customize overlays by editing the HTML, CSS, and JavaScript files in the `overlays` directory.

## Troubleshooting

- If players cannot connect, verify server URL and token validity
- Check server logs for connection issues
- Ensure Valorant is running before attempting to connect
- Verify network connectivity between players and the overlay server

## License

This project is proprietary software. All rights reserved.

## Credits

HelValorant