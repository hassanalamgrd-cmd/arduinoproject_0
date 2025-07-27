import time
import random
import json

def calculate_moisture_percentage(raw_value):
    """Calculate moisture percentage using the formula: P = 100 * (1 - v / 1023)"""
    return 100 * (1 - raw_value / 1023)

def simulate_arduino_serial():
    """Simulate Arduino serial output at 9600 baud rate"""
    print("🌍 Arduino Environmental Monitor Simulator")
    print("Serial Communication: 9600 baud")
    print("=" * 50)
    print()
    
    try:
        while True:
            # Generate realistic sensor readings
            vibration_value = random.randint(0, 1024)
            soil_moisture_raw = random.randint(200, 900)  # More realistic range
            distance = round(15 + random.random() * 35, 1)  # 15-50 cm
            temperature = round(20 + random.random() * 15, 1)  # 20-35°C
            
            # Calculate moisture percentage using the provided formula
            soil_moisture = calculate_moisture_percentage(soil_moisture_raw)
            
            # Determine pump status based on moisture
            pump_status = soil_moisture < 30
            
            # Determine vibration alert
            vibration_alert = vibration_value > 300
            
            # Print formatted serial output (simulating Arduino Serial.println)
            print("📊 SENSOR STATUS")
            print("--------------------------------")
            print(f"📏 Water Level Distance: {distance} cm")
            print(f"💧 Soil Moisture Raw: {soil_moisture_raw} (0-1023) | Moisture: {soil_moisture:.1f}%")
            print(f"🌍 Vibration Raw Value: {vibration_value} (0-1024) | Alert: {'⚠️ Detected' if vibration_alert else '✅ Stable'}")
            print(f"🔄 Pump Status: {'ON' if pump_status else 'OFF'} | Moisture: {soil_moisture:.1f}%")
            print(f"🌡️ Temperature: {temperature}°C")
            
            # Summary data line (like Arduino would send)
            print(f"📋 SUMMARY DATA:")
            print(f"   Distance: {distance}cm | Soil: {soil_moisture_raw}/1023 | Moisture: {soil_moisture:.1f}% | Vibration: {vibration_value}/1024 | Pump: {'ON' if pump_status else 'OFF'} | Temp: {temperature}°C")
            
            print("================================")
            print()
            
            # Simulate JSON data that would be sent to API
            json_data = {
                "timestamp": int(time.time() * 1000),
                "distance": distance,
                "soilMoistureRaw": soil_moisture_raw,
                "soilMoisture": round(soil_moisture, 1),
                "vibrationValue": vibration_value,
                "temperature": temperature,
                "pumpStatus": pump_status,
                "deviceId": "arduino_simulator"
            }
            
            print("📡 JSON Data (API Format):")
            print(json.dumps(json_data, indent=2))
            print()
            print("⏳ Waiting 3 seconds for next reading...")
            print("-" * 50)
            print()
            
            # Wait 3 seconds (simulating Arduino delay)
            time.sleep(3)
            
    except KeyboardInterrupt:
        print("\n🛑 Simulation stopped by user")
        print("Thank you for testing the Arduino Environmental Monitor!")

if __name__ == "__main__":
    simulate_arduino_serial()
