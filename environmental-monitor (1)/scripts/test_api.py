import requests
import json
import time
import random

# API endpoint
API_URL = "http://localhost:3000/api/sensors"

def generate_sensor_data():
    """Generate realistic sensor data using the correct moisture formula"""
    # Simulate raw analog values
    vibration_value = random.randint(0, 1024)
    soil_moisture_raw = random.randint(0, 1023)
    distance = 15 + random.random() * 35  # 15-50 cm range
    
    # Apply moisture formula: P = 100 * (1 - v / 1023)
    soil_moisture = 100 * (1 - soil_moisture_raw / 1023)
    
    # Determine pump status based on moisture
    pump_status = soil_moisture < 30
    
    return {
        "timestamp": int(time.time() * 1000),
        "distance": round(distance, 1),
        "soilMoistureRaw": soil_moisture_raw,
        "soilMoisture": round(soil_moisture, 1),
        "vibrationValue": vibration_value,
        "pumpStatus": pump_status,
        "deviceId": "arduino_simulator"
    }

def test_api():
    """Test the API endpoints with simulated Arduino data"""
    print("🧪 Testing Environmental Monitor API")
    print("=" * 40)
    
    for i in range(10):
        try:
            # Generate sensor data
            sensor_data = generate_sensor_data()
            
            print(f"\n📊 Test {i+1}/10:")
            print(f"Distance: {sensor_data['distance']}cm")
            print(f"Soil Moisture: {sensor_data['soilMoisture']}% (Raw: {sensor_data['soilMoistureRaw']}/1023)")
            print(f"Vibration: {sensor_data['vibrationValue']}/1024")
            print(f"Pump: {'ON' if sensor_data['pumpStatus'] else 'OFF'}")
            
            # Send POST request
            response = requests.post(
                API_URL,
                json=sensor_data,
                headers={"Content-Type": "application/json"},
                timeout=5
            )
            
            if response.status_code == 200:
                result = response.json()
                print(f"✅ API Response: {result.get('message', 'Success')}")
            else:
                print(f"❌ API Error: {response.status_code}")
                
        except requests.exceptions.RequestException as e:
            print(f"❌ Connection Error: {e}")
        except Exception as e:
            print(f"❌ Unexpected Error: {e}")
        
        # Wait 3 seconds between requests
        if i < 9:  # Don't wait after the last request
            print("⏳ Waiting 3 seconds...")
            time.sleep(3)
    
    print("\n🏁 API Testing Complete!")

if __name__ == "__main__":
    test_api()
