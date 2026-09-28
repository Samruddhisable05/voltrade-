#ifndef CONFIG_H
#define CONFIG_H

// ==========================================
// VOLTTRADE ESP32 HARDWARE CONFIGURATION
// ==========================================

// Device Identification
#define DEVICE_ID "ESP32-HOUSE-A"
#define DEVICE_NAME "House A Solar Smart Meter"

// Wi-Fi Configuration
// Replace with your local WiFi credentials
#define WIFI_SSID "VoltTrade_WiFi"
#define WIFI_PASSWORD "renewable123"

// Fallback Access Point Mode (if WiFi connection fails)
#define AP_SSID "VoltTrade-ESP32-AP"
#define AP_PASSWORD "12345678"

// Backend Server API URL
// In local development, use your PC's LAN IP (e.g., http://192.168.1.100:4000/api)
#define BACKEND_BASE_URL "http://192.168.1.100:4000/api"

// Pin Assignments (Standard ESP32 WROOM-32)
#define PIN_I2C_SDA 21         // INA219 & SSD1306 OLED SDA
#define PIN_I2C_SCL 22         // INA219 & SSD1306 OLED SCL
#define PIN_RELAY 19           // Relay module control (triggers Consumer Load LED)
#define PIN_STATUS_LED 2       // Onboard blue LED indicator

// Relay Logic Configuration
// Most standard 5V relay modules are ACTIVE LOW (set LOW to energize). Set to 1 if ACTIVE HIGH.
#define RELAY_ACTIVE_LOW 1

// OLED Screen Configuration
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1
#define SCREEN_I2C_ADDRESS 0x3C

// INA219 Sensor I2C Address (default 0x40)
#define INA219_I2C_ADDRESS 0x40

// Timing Intervals (Milliseconds)
#define TELEMETRY_INTERVAL_MS 2000      // Send telemetry every 2s
#define COMMAND_POLL_INTERVAL_MS 1500   // Poll for incoming trade commands every 1.5s
#define OLED_REFRESH_INTERVAL_MS 500    // Refresh screen at 2 Hz

// Default relay activation time if none specified
#define DEFAULT_RELAY_DURATION_MS 5000

#endif // CONFIG_H
