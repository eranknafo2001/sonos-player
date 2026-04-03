# Sonos Player Home Assistant add-on

Home Assistant add-on for the Sonos Player headless service.

## What it does

- Runs the Sonos Player backend on Home Assistant OS
- Connects to Sonos and MQTT
- Exposes an HTTP API on port `8099` for the custom integration

## Notes

- The add-on runs the service
- The Home Assistant UI/media browser part is provided by the separate custom integration in `packages/ha-integration`
- Home Assistant add-ons and custom integrations are packaged separately, so the custom integration should be installed through HACS or manual copy
