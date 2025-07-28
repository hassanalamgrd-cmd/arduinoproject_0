#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// WiFi credentials - UPDATE THESE
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// API endpoint - UPDATE THIS
const char* serverURL = "http://your-nextjs-app.vercel.app/api/sensors";

// Pin definitions
const int TRIG_PIN = 5;
const int ECHO_PIN = 18;
const int SOIL_MOISTURE_PIN = A0;
const int VIBRATION_PIN = A1;
const int PUMP_PIN = 2;
const int TEMP_PIN = A2; // Optional temperature sensor

// Timing variables
unsigned long lastSensorRead = 0;
unsigned long lastAPICall = 0;
const unsigned long SENSOR_INTERVAL = 1000; // Read sensors every 1 second
const unsigned long API_INTERVAL = 5000;    // Send to API every 5 seconds

// Sensor variables
float currentDistance = 0;
int currentSoilMoistureRaw = 0;
float currentSoilMoisture = 0;
int currentVibrationValue = 0;
float currentTemperature = 25.0;
bool currentPumpStatus = false;

void setup() {
  // Initialize serial communication at 9600 baud
  Serial.begin(9600);
  
  // Initialize pins
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(PUMP_PIN, OUTPUT);
  digitalWrite(PUMP_PIN, LOW);
  
  // Connect to WiFi
  Serial.println("🌐 Connecting to WiFi...");
  WiFi.begin(ssid, password);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println();
    Serial.println("✅ WiFi connected!");
    Serial.print("📡 IP address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println();
    Serial.println("❌ WiFi connection failed - continuing in offline mode");
  }
  
  Serial.println();
  Serial.println("🌍 Environmental Monitoring System Started");
  Serial.println("Serial Monitor: 9600 baud");
  Serial.println("==========================================");
  Serial.println();
}

void loop() {
  unsigned long currentTime = millis();
  
  // Read sensors every second
  if (currentTime - lastSensorRead >= SENSOR_INTERVAL) {
    readSensors();
    displaySensorData();
    controlPump();
    lastSensorRead = currentTime;
  }
  
  // Send to API every 5 seconds (if WiFi connected)
  if (WiFi.status() == WL_CONNECTED && currentTime - lastAPICall >= API_INTERVAL) {
    sendDataToAPI();
    lastAPICall = currentTime;
  }
  
  delay(100);
}

void readSensors() {
  // Read ultrasonic sensor (water level)
  currentDistance = readUltrasonicDistance();
  
  // Read soil moisture sensor
  currentSoilMoistureRaw = analogRead(SOIL_MOISTURE_PIN);
  // Apply your formula: P = 100 * (1 - v / 1023)
  currentSoilMoisture = 100.0 * (1.0 - (float)currentSoilMoistureRaw / 1023.0);
  
  // Read vibration sensor
  currentVibrationValue = analogRead(VIBRATION_PIN);
  
  // Read temperature (if sensor connected)
  int tempReading = analogRead(TEMP_PIN);
  currentTemperature = (tempReading * 5.0 / 1024.0 - 0.5) * 100.0; // LM35 formula
  if (currentTemperature < 0 || currentTemperature > 50) {
    currentTemperature = 25.0; // Default if no sensor
  }
}

void displaySensorData() {
  // Display formatted data on serial monitor (9600 baud)
  Serial.println("📊 SENSOR STATUS");
  Serial.println("--------------------------------");
  
  Serial.print("📏 Water Level Distance: ");
  Serial.print(currentDistance, 1);
  Serial.println(" cm");
  
  Serial.print("💧 Soil Moisture Raw: ");
  Serial.print(currentSoilMoistureRaw);
  Serial.print(" (0-1023) | Moisture: ");
  Serial.print(currentSoilMoisture, 1);
  Serial.println("%");
  
  Serial.print("🌍 Vibration Raw Value: ");
  Serial.print(currentVibrationValue);
  Serial.print(" (0-1024) | Alert: ");
  Serial.println(currentVibrationValue > 300 ? "⚠️ Detected" : "✅ Stable");
  
  Serial.print("🌡️ Temperature: ");
  Serial.print(currentTemperature, 1);
  Serial.println("°C");
  
  Serial.print("🔄 Pump Status: ");
  Serial.print(currentPumpStatus ? "ON" : "OFF");
  Serial.print(" | Moisture: ");
  Serial.print(currentSoilMoisture, 1);
  Serial.println("%");
  
  // Summary data line
  Serial.print("📋 SUMMARY DATA: ");
  Serial.print("Distance: ");
  Serial.print(currentDistance, 1);
  Serial.print("cm | Soil: ");
  Serial.print(currentSoilMoistureRaw);
  Serial.print("/1023 | Moisture: ");
  Serial.print(currentSoilMoisture, 1);
  Serial.print("% | Vibration: ");
  Serial.print(currentVibrationValue);
  Serial.print("/1024 | Pump: ");
  Serial.print(currentPumpStatus ? "ON" : "OFF");
  Serial.print(" | Temp: ");
  Serial.print(currentTemperature, 1);
  Serial.println("°C");
  
  Serial.println("================================");
  Serial.println();
}

void controlPump() {
  // Pump control logic based on moisture percentage
  if (currentSoilMoisture < 30.0 && !currentPumpStatus) {
    digitalWrite(PUMP_PIN, HIGH);
    currentPumpStatus = true;
    Serial.println("💧 PUMP ACTIVATED - Soil moisture low!");
  } else if (currentSoilMoisture > 50.0 && currentPumpStatus) {
    digitalWrite(PUMP_PIN, LOW);
    currentPumpStatus = false;
    Serial.println("🛑 PUMP DEACTIVATED - Soil moisture adequate");
  }
}

float readUltrasonicDistance() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  
  long duration = pulseIn(ECHO_PIN, HIGH, 30000); // 30ms timeout
  if (duration == 0) {
    return 999.0; // Error reading
  }
  
  float distance = duration * 0.034 / 2;
  return distance;
}

void sendDataToAPI() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("❌ WiFi not connected - skipping API call");
    return;
  }
  
  HTTPClient http;
  http.begin(serverURL);
  http.addHeader("Content-Type", "application/json");
  http.setTimeout(5000); // 5 second timeout
  
  // Create JSON payload
  DynamicJsonDocument doc(1024);
  doc["timestamp"] = millis();
  doc["distance"] = currentDistance;
  doc["soilMoistureRaw"] = currentSoilMoistureRaw;
  doc["soilMoisture"] = currentSoilMoisture;
  doc["vibrationValue"] = currentVibrationValue;
  doc["temperature"] = currentTemperature;
  doc["pumpStatus"] = currentPumpStatus;
  doc["deviceId"] = "arduino_env_monitor";
  
  String jsonString;
  serializeJson(doc, jsonString);
  
  Serial.println("📡 Sending data to API...");
  int httpResponseCode = http.POST(jsonString);
  
  if (httpResponseCode > 0) {
    String response = http.getString();
    Serial.println("✅ Data sent to API successfully");
    Serial.print("📥 Response Code: ");
    Serial.println(httpResponseCode);
  } else {
    Serial.print("❌ Error sending data - HTTP Code: ");
    Serial.println(httpResponseCode);
  }
  
  http.end();
}
