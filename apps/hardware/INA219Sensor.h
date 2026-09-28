#ifndef INA219_SENSOR_H
#define INA219_SENSOR_H

#include <Arduino.h>
#include <Wire.h>
#include <Adafruit_INA219.h>

struct SensorReadings {
  float voltage;      // Volts (V)
  float current;      // Amperes (A)
  float current_mA;   // Milliamperes (mA)
  float power;        // Watts (W)
  float energy_kWh;   // Cumulative Energy (kWh)
  bool isHardwareLive;
};

class INA219Sensor {
public:
  INA219Sensor();
  bool begin();
  SensorReadings read();
  void resetEnergy();

private:
  Adafruit_INA219 ina219;
  bool isInitialized;
  float cumulativeEnergyKWh;
  unsigned long lastMeasurementTime;
  
  // Safe simulated renewable generator fallback if INA219 sensor is unplugged
  float simulatedAngle;
};

#endif // INA219_SENSOR_H
