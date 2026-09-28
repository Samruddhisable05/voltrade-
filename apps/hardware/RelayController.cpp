#include "RelayController.h"

RelayController::RelayController(uint8_t relayPin, bool activeLow)
  : pin(relayPin),
    activeLow(activeLow),
    isActive(false),
    activationStartTime(0),
    targetDuration(0) {}

void RelayController::begin() {
  pinMode(pin, OUTPUT);
  deactivateLoad();
}

void RelayController::activateLoad(unsigned long durationMs) {
  isActive = true;
  activationStartTime = millis();
  targetDuration = durationMs;
  
  // Set relay state
  digitalWrite(pin, activeLow ? LOW : HIGH);
  Serial.printf("[RELAY] LOAD ACTIVATED! Energized for %lu ms\n", durationMs);
}

void RelayController::deactivateLoad() {
  isActive = false;
  targetDuration = 0;
  digitalWrite(pin, activeLow ? HIGH : LOW);
  Serial.println("[RELAY] LOAD DEACTIVATED / Relay Released.");
}

void RelayController::update() {
  if (isActive && targetDuration > 0) {
    if (millis() - activationStartTime >= targetDuration) {
      deactivateLoad();
    }
  }
}

bool RelayController::isLoadActive() const {
  return isActive;
}

unsigned long RelayController::getRemainingTimeMs() const {
  if (!isActive) return 0;
  unsigned long elapsed = millis() - activationStartTime;
  if (elapsed >= targetDuration) return 0;
  return targetDuration - elapsed;
}
