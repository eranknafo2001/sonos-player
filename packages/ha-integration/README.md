# Sonos Player Home Assistant integration

Custom Home Assistant integration for the Sonos Player headless service.

## Features

- One `media_player` entity for the managed Sonos group
- Transport controls: play, pause, next, previous
- Metadata: title, artist, album, coordinator
- Browse media: Sonos Favorites
- Play selected Sonos Favorite

## Installation

### HACS
Add this repository as a custom repository and install the `Sonos Player` integration.

### Manual
Copy `custom_components/sonos_player` into your Home Assistant `config/custom_components/` directory.

## Configuration

Add the integration via Home Assistant UI and provide:

- Base URL of the Sonos Player service, for example `http://homeassistant.local:8099`
- Optional API token if configured in the service
