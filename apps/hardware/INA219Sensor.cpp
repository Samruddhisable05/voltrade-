#include "INA219Sensor.h"
#include "config.h"

INA219Sensor::INA219Sensor()
  : ina219(INA219_I2C_ADDRESS),
    isInitialized(false),
    cumulativeEnergyKWh(0.0),
    lastMeasurementTime(0),
    simulatedAngle(0.0) {}

bool INA219Sensor::begin() {
  Wire.begin(PIN_I2C_SDA, PIN_I2C_SCL);
  if (ina219.begin()) {
    isInitialized = true;
    lastMeasurementTime = millis();
    Serial.println("[INA219] Hardware sensor detected and initialized successfully.");
    return true;
  } else {
    isInitialized = false;
    lastMeasurementTime = millis();
    Serial.println("[INA219] WARNING: Sensor not detected on I2C bus. Fallback simulator will be used if needed.");
    return false;
  }
}

SensorReadings INA219Sensor::read() {
  SensorReadings data;
  unsigned long now = millis();
  float deltaSeconds = (now - lastMeasurementTime) / 1000.0f;
  if (deltaSeconds <= 0.0f) deltaSeconds = 0.001f;
  lastMeasurementTime = now;

  if (isInitialized) {
    float shuntVoltage_mV = ina219.getShuntVoltage_mV();
    float busVoltage_V = ina219.getBusVoltage_V();
    float current_mA = ina219.getCurrent_mA();
    float loadVoltage_V = busVoltage_V + (shuntVoltage_mV / 1000.0f);
    
    // Protect against small negative noise
    if (current_mA < 0) current_mA = 0;
    if (loadVoltage_V < 0) loadVoltage_V = 0;

    data.voltage = loadVoltage_V;
    data.current_mA = current_mA;
    data.current = current_mA / 1000.0f; // in Amperes
    data.power = data.voltage * data.current; // P = V * I in Watts
    data.isHardwareLive = true;
  } else {
    // Hardware is offline or unplugged, safe simulated solar curve
    simulatedAngle += 0.05f;
    float baseV = 12.2f + 0.4f * sin(simulatedAngle);
    float baseA = 0.85f + 0.25f * cos(simulatedAngle * 0.7f);
    if (baseA < 0.05f) baseA = 0.05f;
    
    data.voltage = baseV;
    data.current = baseA;
    data.current_mA = baseA * 1000.0f;
    data.power = data.voltage * data.current;
    data.isHardwareLive = false;
  }

  // Cumulative energy calculation: (Power in Watts * time in hours) / 1000 = kWh
  float hours = deltaSeconds / 3600.0f;
  cumulativeEnergyKWh += (data.power * hours) / 1000.0f;
  data.energy_kWh = cumulativeEnergyKWh;

  return data;
}

void INA219Sensor::resetEnergy() {
  cumulativeEnergyKWh = 0.0f;
}
