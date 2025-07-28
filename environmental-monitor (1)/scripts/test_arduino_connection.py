import requests
import json
import time
import random

# Test script to simulate Arduino data and verify the dual data source system
API_URL = "http://localhost:3000/api/sensors"

def calculate_moisture_percentage(raw_value):
    """Calculate moisture percentage using the formula: P = 100 * (1 - v / 1023)"""
    return max(0, min(100, 100 * (1 - raw_value / 1023)))

def generate_realistic_arduino_data():
    """Generate realistic Arduino sensor data"""
    # Simulate raw analog values with realistic ranges
    vibration_value = random.randint(0, 1024)
    soil_moisture_raw = random.randint(200, 900)  # Typical soil sensor range
    distance = round(15 + random.random() * 35, 1)  # 15-50 cm range
    temperature = round(20 + random.random() * 15, 1)  # 20-35°C
    
    # Calculate moisture percentage using the provided formula
    soil_moisture = calculate_moisture_percentage(soil_moisture_raw)
    
    # Determine pump status based on moisture
    pump_status = soil_moisture < 30
    
    return {
        "timestamp": int(time.time() * 1000),
        "distance": distance,
        "soilMoistureRaw": soil_moisture_raw,
        "vibrationValue": vibration_value,
        "temperature": temperature,
        "pumpStatus": pump_status,
        "moisturePercent": round(soil_moisture, 1),
        "deviceId": "arduino_env_monitor"
    }

def test_arduino_connection():
    """Test the Arduino connection and data processing"""
    print("🧪 Testing Arduino Connection & Data Processing")
    print("=" * 50)
    print("This script simulates Arduino data to test the dual data source system")
    print("- When Arduino data is sent: System uses live Arduino data")
    print("- When no Arduino data: System falls back to simulated data")
    print("=" * 50)
    
    # Test 1: Send Arduino data
    print("\n📡 TEST 1: Sending Arduino Data")
    print("-" * 30)
    
    for i in range(5):
        try:
            arduino_data = generate_realistic_arduino_data()
            
            print(f"\n🔄 Sending Arduino data #{i+1}:")
            print(f"   📏 Distance: {arduino_data['distance']}cm")
            print(f"   💧 Soil Moisture: {arduino_data['moisturePercent']}% (Raw: {arduino_data['soilMoistureRaw']}/1023)")
            print(f"   🌍 Vibration: {arduino_data['vibrationValue']}/1024")
            print(f"   🔄 Pump: {'ON' if arduino_data['pumpStatus'] else 'OFF'}")
            print(f"   🌡️ Temperature: {arduino_data['temperature']}°C")
            
            # Send POST request (simulating Arduino)
            response = requests.post(
                API_URL,
                json=arduino_data,
                headers={"Content-Type": "application/json"},
                timeout=5
            )
            
            if response.status_code == 200:
                result = response.json()
                print(f"   ✅ Arduino data processed successfully")
                print(f"   📊 Data source: {result.get('dataSource', 'unknown')}")
            else:
                print(f"   ❌ Error: {response.status_code}")
                
        except requests.exceptions.RequestException as e:
            print(f"   ❌ Connection Error: {e}")
        
        time.sleep(2)  # Wait 2 seconds between sends
    
    # Test 2: Stop sending data and check fallback
    print(f"\n🔄 TEST 2: Testing Fallback to Simulated Data")
    print("-" * 40)
    print("Stopping Arduino data transmission...")
    print("The system should automatically switch to simulated data after 10 seconds")
    
    # Test GET requests to see data source changes
    for i in range(8):
        try:
            response = requests.get(API_URL, timeout=5)
            if response.status_code == 200:
                result = response.json()
                data_source = result.get('dataSource', 'unknown')
                arduino_connected = result.get('arduinoConnected', False)
                last_arduino = result.get('lastArduinoUpdate')
                
                print(f"\n📊 GET Request #{i+1}:")
                print(f"   🔌 Data Source: {data_source.upper()}")
                print(f"   📡 Arduino Connected: {'YES' if arduino_connected else 'NO'}")
                if last_arduino:
                    print(f"   ⏰ Last Arduino Update: {last_arduino}")
                
                # Show some sensor data
                if result.get('success') and result.get('data'):
                    data = result['data']
                    print(f"   📈 Current Data:")
                    print(f"      Earthquake: {data['earthquake']['magnitude']} magnitude")
                    print(f"      Irrigation: {data['irrigation']['soilMoisture']}% moisture")
                    print(f"      Flood: {data['flood']['distance']}cm distance")
                
            else:
                print(f"   ❌ GET Error: {response.status_code}")
                
        except requests.exceptions.RequestException as e:
            print(f"   ❌ Connection Error: {e}")
        
        time.sleep(3)  # Wait 3 seconds between requests
    
    print(f"\n🏁 Testing Complete!")
    print("=" * 50)
    print("Summary:")
    print("- Arduino data should be used when actively sending")
    print("- System should fallback to simulated data after 10 seconds of no Arduino data")
    print("- Check the web dashboard to see the data source indicator")
    print("- History should log data source changes")

if __name__ == "__main__":
    test_arduino_connection()
