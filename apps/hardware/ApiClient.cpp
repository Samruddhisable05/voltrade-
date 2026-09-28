#include "ApiClient.h"
#include <WiFiClient.h>

ApiClient::ApiClient(const String& baseUrl, const String& deviceId)
  : baseUrl(baseUrl), deviceId(deviceId) {}

bool ApiClient::sendTelemetry(const SensorReadings& data) {
  if (WiFi.status() != WL_CONNECTED) {
    return false;
  }

  WiFiClient client;
  String url = baseUrl + "/devices/telemetry";
  http.begin(client, url);
  http.addHeader("Content-Type", "application/json");

  // Construct JSON payload
  char payload[256];
  snprintf(payload, sizeof(payload),
    "{\"deviceId\":\"%s\",\"voltage\":%.2f,\"current\":%.4f,\"power\":%.2f,\"energy\":%.4f,\"timestamp\":\"%lu\"}",
    deviceId.c_str(),
    data.voltage,
    data.current,
    data.power,
    data.energy_kWh,
    millis()
  );

  int httpCode = http.POST(payload);
  bool success = (httpCode >= 200 && httpCode < 300);

  if (!success && httpCode > 0) {
    Serial.printf("[HTTP] Telemetry POST failed, code: %d\n", httpCode);
  }

  http.end();
  return success;
}

PendingCommand ApiClient::pollPendingCommands() {
  PendingCommand cmd;
  cmd.hasCommand = false;
  cmd.durationMs = 5000;

  if (WiFi.status() != WL_CONNECTED) {
    return cmd;
  }

  WiFiClient client;
  String url = baseUrl + "/devices/" + deviceId + "/commands/pending";
  http.begin(client, url);
  
  int httpCode = http.GET();
  if (httpCode == HTTP_CODE_OK) {
    String payload = http.getString();
    
    // Check if command is ACTIVATE_LOAD
    if (payload.indexOf("ACTIVATE_LOAD") >= 0) {
      cmd.hasCommand = true;
      cmd.command = "ACTIVATE_LOAD";
      
      // Extract command ID
      int idIdx = payload.indexOf("\"id\":\"");
      if (idIdx >= 0) {
        int endIdx = payload.indexOf("\"", idIdx + 6);
        if (endIdx > idIdx) {
          cmd.commandId = payload.substring(idIdx + 6, endIdx);
        }
      }
      
      // Extract duration if present
      int durIdx = payload.indexOf("\"duration\":");
      if (durIdx >= 0) {
        int durEnd = payload.indexOf(",", durIdx);
        if (durEnd < 0) durEnd = payload.indexOf("}", durIdx);
        if (durEnd > durIdx) {
          String durStr = payload.substring(durIdx + 11, durEnd);
          cmd.durationMs = durStr.toInt();
          if (cmd.durationMs == 0) cmd.durationMs = 5000;
        }
      }
      Serial.printf("[HTTP] Pending command detected: %s (id: %s, duration: %lu ms)\n",
        cmd.command.c_str(), cmd.commandId.c_str(), cmd.durationMs);
    }
  }

  http.end();
  return cmd;
}

bool ApiClient::acknowledgeCommand(const String& commandId, const String& status) {
  if (WiFi.status() != WL_CONNECTED || commandId.length() == 0) {
    return false;
  }

  WiFiClient client;
  String url = baseUrl + "/devices/" + deviceId + "/commands/" + commandId + "/ack";
  http.begin(client, url);
  http.addHeader("Content-Type", "application/json");

  String payload = "{\"status\":\"" + status + "\"}";
  int httpCode = http.POST(payload);
  http.end();

  return (httpCode >= 200 && httpCode < 300);
}
