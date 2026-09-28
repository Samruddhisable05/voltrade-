#ifndef API_CLIENT_H
#define API_CLIENT_H

#include <Arduino.h>
#include <HTTPClient.h>
#include "INA219Sensor.h"

struct PendingCommand {
  bool hasCommand;
  String commandId;
  String command; // e.g. "ACTIVATE_LOAD"
  unsigned long durationMs;
};

class ApiClient {
public:
  ApiClient(const String& baseUrl, const String& deviceId);
  bool sendTelemetry(const SensorReadings& data);
  PendingCommand pollPendingCommands();
  bool acknowledgeCommand(const String& commandId, const String& status = "EXECUTED");

private:
  String baseUrl;
  String deviceId;
  HTTPClient http;
};

#endif // API_CLIENT_H
