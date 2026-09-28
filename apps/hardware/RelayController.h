#ifndef RELAY_CONTROLLER_H
#define RELAY_CONTROLLER_H

#include <Arduino.h>

class RelayController {
public:
  RelayController(uint8_t relayPin, bool activeLow = true);
  void begin();
  void activateLoad(unsigned long durationMs = 5000);
  void deactivateLoad();
  void update();
  bool isLoadActive() const;
  unsigned long getRemainingTimeMs() const;

private:
  uint8_t pin;
  bool activeLow;
  bool isActive;
  unsigned long activationStartTime;
  unsigned long targetDuration;
};

#endif // RELAY_CONTROLLER_H
