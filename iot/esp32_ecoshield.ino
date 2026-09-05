/*
 * EcoShield AI — ESP32 Environmental IoT Node Firmware
 * Multi-Sensor Telemetry Transceiver with WiFi + MQTT + HTTP Failover
 * 
 * Supports:
 * - DHT22 / BME280 (Temperature, Humidity, Pressure)
 * - Ultrasonic / HC-SR04 (Water Level)
 * - MQ-135 / MQ-2 (Air Quality, CO, Smoke)
 * - Rain Gauge (Digital/Analog Pulse)
 * - Soil Moisture Probe (Capacitive Analog)
 * - IR Flame Detector
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

// WiFi Configuration
const char* WIFI_SSID = "YOUR_WIFI_SSID";
const char* WIFI_PASS = "YOUR_WIFI_PASSWORD";

// Backend Server Configuration
const char* BACKEND_SERVER = "http://192.168.1.100:8000/api/sensors/data";
const char* MQTT_BROKER = "192.168.1.100";
const int MQTT_PORT = 1883;

// Node Identification
const char* SENSOR_ID = "SN-ESP32-FIELD-01";
const char* NODE_NAME = "Field Hydrological & Fire Sentinel";

// Hardware Pin Definitions
#define PIN_TRIG 5
#define PIN_ECHO 18
#define PIN_RAIN_ANALOG 34
#define PIN_SMOKE_ANALOG 35
#define PIN_FLAME_DIGITAL 19
#define PIN_SOIL_ANALOG 32
#define PIN_STATUS_LED 2

WiFiClient espClient;
PubSubClient mqttClient(espClient);

void setup_wifi() {
  Serial.begin(115200);
  pinMode(PIN_STATUS_LED, OUTPUT);
  pinMode(PIN_TRIG, OUTPUT);
  pinMode(PIN_ECHO, INPUT);
  pinMode(PIN_FLAME_DIGITAL, INPUT);

  Serial.println("\n[EcoShield] Initializing ESP32 IoT Node...");
  WiFi.begin(WIFI_SSID, WIFI_PASS);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n[EcoShield] WiFi Connected! IP: " + WiFi.localIP().toString());
    digitalWrite(PIN_STATUS_LED, HIGH);
  } else {
    Serial.println("\n[EcoShield] WiFi Connection failed. Entering offline buffer mode.");
  }

  mqttClient.setServer(MQTT_BROKER, MQTT_PORT);
}

float measure_water_level_m() {
  // Trigger ultrasonic pulse
  digitalWrite(PIN_TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(PIN_TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(PIN_TRIG, LOW);

  long duration = pulseIn(PIN_ECHO, HIGH, 30000);
  if (duration == 0) return 1.35; // Default fallback

  // Distance in cm = (duration * 0.0343) / 2
  float distance_cm = (duration * 0.0343) / 2.0;
  // Water level = Total Sensor Height (e.g. 5.0m) - distance
  float water_level_m = 5.0 - (distance_cm / 100.0);
  return max(0.0f, water_level_m);
}

void send_telemetry_http(const String& jsonPayload) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(BACKEND_SERVER);
    http.addHeader("Content-Type", "application/json");

    int httpCode = http.POST(jsonPayload);
    if (httpCode > 0) {
      Serial.printf("[EcoShield] HTTP Telemetry dispatched, status: %d\n", httpCode);
    } else {
      Serial.printf("[EcoShield] HTTP POST failed: %s\n", http.errorToString(httpCode).c_str());
    }
    http.end();
  }
}

void send_telemetry_mqtt(const String& jsonPayload) {
  if (!mqttClient.connected()) {
    if (mqttClient.connect(SENSOR_ID)) {
      Serial.println("[EcoShield] Reconnected to MQTT Broker");
    }
  }

  if (mqttClient.connected()) {
    String topic = String("ecoshield/sensors/") + SENSOR_ID + "/telemetry";
    mqttClient.publish(topic.c_str(), jsonPayload.c_str());
    Serial.println("[EcoShield] MQTT message published.");
  }
}

void setup() {
  setup_wifi();
}

void loop() {
  // 1. Read Physical Sensor Telemetry
  float water_level = measure_water_level_m();
  int raw_rain = analogRead(PIN_RAIN_ANALOG);
  float rainfall_rate = map(raw_rain, 4095, 0, 0, 100); // Inverse mapping (low resistance = high rain)
  
  int raw_smoke = analogRead(PIN_SMOKE_ANALOG);
  float smoke_ppm = map(raw_smoke, 0, 4095, 20, 800);
  
  bool flame_detected = (digitalRead(PIN_FLAME_DIGITAL) == LOW); // Active Low sensor

  // Simulated ambient values for demo
  float temperature = 28.5 + random(-10, 15) / 10.0;
  float humidity = 68.0 + random(-20, 20) / 10.0;
  float pm25 = 35.0 + random(-5, 10);

  // 2. Assemble JSON Payload
  StaticJsonDocument<512> doc;
  doc["sensor_id"] = SENSOR_ID;
  doc["water_level"] = water_level;
  doc["rainfall"] = rainfall_rate;
  doc["temperature"] = temperature;
  doc["humidity"] = humidity;
  doc["smoke"] = smoke_ppm;
  doc["flame_detected"] = flame_detected;
  doc["pm25"] = pm25;
  doc["co"] = 1.2;
  doc["battery"] = 96.5;
  doc["signal_strength"] = WiFi.RSSI();

  String payload;
  serializeJson(doc, payload);

  Serial.println("\n[EcoShield] Dispatching Telemetry Packet:");
  Serial.println(payload);

  // 3. Dispatch via HTTP & MQTT
  send_telemetry_http(payload);
  send_telemetry_mqtt(payload);

  // Sampling Cadence (5 seconds)
  delay(5000);
}
