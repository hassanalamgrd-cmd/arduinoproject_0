#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// WiFi credentials
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// API endpoint
const char* serverURL = "http://your-server.com/api/sensors";

// Pin definitions
const int TRIG_PIN = 5;
const int ECHO_PIN = 18;
const int SOIL_MOISTURE_PIN = A0;
const int VIBRATION_PIN = A1;
const int PUMP_PIN = 2;

// Timing variables
unsigned long lastSensorRead = 0;
unsigned long lastAPICall = 0;
const unsigned long SENSOR_INTERVAL = 1000; // Read sensors every 1 second
const unsigned long API_INTERVAL = 5000;    // Send to API every 5 seconds

void setup() {
  Serial.begin(9600);
  
  // Initialize pins
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(PUMP_PIN, OUTPUT);
  digitalWrite(PUMP_PIN, LOW);
  
  // Connect to WiFi
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();
  Serial.println("WiFi connected!");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());
  
  Serial.println("🌍 Environmental Monitoring System Started");
  Serial.println("==========================================");
}

void loop() {
  unsigned long currentTime = millis();
  
  // Read sensors every second
  if (currentTime - lastSensorRead >= SENSOR_INTERVAL) {
    readAndDisplaySensors();
    lastSensorRead = currentTime;
  }
  
  // Send to API every 5 seconds
  if (currentTime - lastAPICall >= API_INTERVAL) {
    sendDataToAPI();
    lastAPICall = currentTime;
  }
  
  delay(100);
}

void readAndDisplaySensors() {
  // Read ultrasonic sensor (water level)
  float distance = readUltrasonicDistance();
  
  // Read soil moisture sensor
  int soilMoistureRaw = analogRead(SOIL_MOISTURE_PIN);
  float soilMoisture = 100.0 * (1.0 - (float)soilMoistureRaw / 1023.0); // Your formula
  
  // Read vibration sensor
  int vibrationValue = analogRead(VIBRATION_PIN);
  
  // Control pump based on moisture
  bool pumpStatus = false;
  if (soilMoisture < 30.0) {
    digitalWrite(PUMP_PIN, HIGH);
    pumpStatus = true;
  } else if (soilMoisture > 50.0) {
    digitalWrite(PUMP_PIN, LOW);
    pumpStatus = false;
  } else {
    pumpStatus = digitalRead(PUMP_PIN);
  }
  
  // Display formatted data on serial monitor
  Serial.println("📊 SENSOR STATUS");
  Serial.println("--------------------------------");
  Serial.print("📏 Water Level Distance: ");
  Serial.print(distance);
  Serial.println(" cm");
  
  Serial.print("💧 Soil Moisture Raw: ");
  Serial.print(soilMoistureRaw);
  Serial.print(" (0-1023) | Moisture: ");
  Serial.print(soilMoisture, 1);
  Serial.println("%");
  
  Serial.print("🌍 Vibration Raw Value: ");
  Serial.print(vibrationValue);
  Serial.print(" (0-1024) | Alert: ");
  Serial.println(vibrationValue > 300 ? "⚠️ Detected" : "✅ Stable");
  
  Serial.print("🔄 Pump Status: ");
  Serial.print(pumpStatus ? "ON" : "OFF");
  Serial.print(" | Moisture: ");
  Serial.print(soilMoisture, 1);
  Serial.println("%");
  
  Serial.print("📋 SUMMARY DATA: ");
  Serial.print("Distance: ");
  Serial.print(distance, 1);
  Serial.print("cm | Soil: ");
  Serial.print(soilMoistureRaw);
  Serial.print("/1023 | Moisture: ");
  Serial.print(soilMoisture, 1);
  Serial.print("% | Vibration: ");
  Serial.print(vibrationValue);
  Serial.print("/1024 | Pump: ");
  Serial.println(pumpStatus ? "ON" : "OFF");
  
  Serial.println("================================");
  Serial.println();
}

float readUltrasonicDistance() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  
  long duration = pulseIn(ECHO_PIN, HIGH);
  float distance = duration * 0.034 / 2;
  
  return distance;
}

void sendDataToAPI() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverURL);
    http.addHeader("Content-Type", "application/json");
    
    // Read current sensor values
    float distance = readUltrasonicDistance();
    int soilMoistureRaw = analogRead(SOIL_MOISTURE_PIN);
    float soilMoisture = 100.0 * (1.0 - (float)soilMoistureRaw / 1023.0);
    int vibrationValue = analogRead(VIBRATION_PIN);
    bool pumpStatus = digitalRead(PUMP_PIN);
    
    // Create JSON payload
    DynamicJsonDocument doc(1024);
    doc["timestamp"] = millis();
    doc["distance"] = distance;
    doc["soilMoistureRaw"] = soilMoistureRaw;
    doc["soilMoisture"] = soilMoisture;
    doc["vibrationValue"] = vibrationValue;
    doc["pumpStatus"] = pumpStatus;
    doc["deviceId"] = "arduino_001";
    
    String jsonString;
    serializeJson(doc, jsonString);
    
    int httpResponseCode = http.POST(jsonString);
    
    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.println("✅ Data sent to API successfully");
      Serial.print("Response: ");
      Serial.println(response);
    } else {
      Serial.print("❌ Error sending data: ");
      Serial.println(httpResponseCode);
    }
    
    http.end();
  } else {
    Serial.println("❌ WiFi not connected");
  }
}
