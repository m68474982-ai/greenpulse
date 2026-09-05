"""
EcoShield AI — Standalone Environmental IoT Sensor Simulator
Simulates multi-parameter sensor nodes sending real-time HTTP/REST telemetry.
Includes interactive CLI menu to trigger Flood, Wildfire, Pollution, and Extreme Heat scenarios.
"""
import time
import random
import sys
from datetime import datetime
import httpx

BACKEND_API_URL = "http://localhost:8000/api/sensors/data"
SIMULATION_SCENARIOS_URL = "http://localhost:8000/api/system/simulate"

# Deployed sensor nodes
SIMULATED_NODES = [
    {"sensor_id": "SN-AP-TPT-01", "name": "Tirupati Basin", "type": "flood"},
    {"sensor_id": "SN-AP-VJA-02", "name": "Vijayawada Barrage", "type": "flood"},
    {"sensor_id": "SN-TS-HYD-01", "name": "Hyderabad Lake Front", "type": "urban"},
    {"sensor_id": "SN-KL-WYD-01", "name": "Wayanad Landslide Node", "type": "rain_soil"},
    {"sensor_id": "SN-MH-WGH-02", "name": "Sahyadri Forest Fire IR", "type": "fire"},
    {"sensor_id": "SN-DL-NCR-01", "name": "Delhi Smog Array", "type": "pollution"},
    {"sensor_id": "SN-KA-BLR-02", "name": "Bengaluru Urban Heat", "type": "heat"},
]


def generate_baseline_reading(node):
    s_id = node["sensor_id"]
    n_type = node["type"]

    payload = {
        "sensor_id": s_id,
        "temperature": round(28.0 + random.uniform(-2, 3), 1),
        "humidity": round(65.0 + random.uniform(-5, 5), 1),
        "wind_speed": round(12.0 + random.uniform(-3, 3), 1),
        "pressure": round(1012.0 + random.uniform(-2, 2), 1),
        "timestamp": datetime.utcnow().isoformat()
    }

    if n_type == "flood":
        payload["water_level"] = round(1.35 + random.uniform(-0.05, 0.05), 2)
        payload["rainfall"] = round(random.uniform(0.0, 5.0), 1)
        payload["water_flow"] = round(24.0 + random.uniform(-2, 2), 1)
    elif n_type == "fire":
        payload["smoke"] = round(45.0 + random.uniform(-5, 5), 1)
        payload["co"] = round(1.2 + random.uniform(-0.1, 0.1), 2)
        payload["flame_detected"] = False
    elif n_type == "pollution":
        payload["pm25"] = round(38.0 + random.uniform(-4, 6), 1)
        payload["pm10"] = round(68.0 + random.uniform(-6, 8), 1)
        payload["no2"] = round(24.0 + random.uniform(-2, 2), 1)
        payload["co"] = round(1.4 + random.uniform(-0.2, 0.2), 1)
    elif n_type == "rain_soil":
        payload["rainfall"] = round(random.uniform(0.0, 8.0), 1)
        payload["soil_moisture"] = round(45.0 + random.uniform(-2, 2), 1)
        payload["soil_temperature"] = round(23.5 + random.uniform(-1, 1), 1)

    return payload


def trigger_scenario(scenario_name: str, intensity: float = 1.0):
    print(f"\n🚨 Triggering scenario: '{scenario_name.upper()}' (Intensity: {intensity}x)...")
    try:
        with httpx.Client(timeout=10.0) as client:
            resp = client.post(
                SIMULATION_SCENARIOS_URL,
                json={"scenario": scenario_name, "intensity": intensity}
            )
            if resp.status_code == 200:
                print(f"✅ Success: {resp.json().get('message')}")
            else:
                print(f"❌ Error ({resp.status_code}): {resp.text}")
    except Exception as e:
        print(f"❌ Connection error to backend at {SIMULATION_SCENARIOS_URL}: {e}")


def run_continuous_stream():
    print("\n🌐 Starting Continuous IoT Sensor Telemetry Stream (Press Ctrl+C to stop)...")
    with httpx.Client(timeout=5.0) as client:
        while True:
            for node in SIMULATED_NODES:
                payload = generate_baseline_reading(node)
                try:
                    res = client.post(BACKEND_API_URL, json=payload)
                    status_emoji = "🟢" if res.status_code == 200 else "🔴"
                    print(f"{status_emoji} [{node['sensor_id']}] {node['name']}: Ingested reading")
                except Exception as e:
                    print(f"⚠️ Failed to send reading for {node['sensor_id']}: {e}")
                time.sleep(0.5)
            time.sleep(3)


def print_menu():
    print("""
=====================================================
   ECOSHIELD AI — IOT ENVIRONMENTAL SIMULATOR
=====================================================
1. Run Continuous Telemetry Stream
2. Simulate Critical Flood (Tirupati Region)
3. Simulate Severe Forest Fire (Sahyadri Western Ghats)
4. Simulate Hazardous Smog/AQI Spike (Delhi NCR)
5. Simulate Extreme Heatwave (Bengaluru)
6. Restore All Conditions to Normal Baseline
7. Exit
=====================================================
    """)


def main():
    if len(sys.argv) > 1:
        arg = sys.argv[1].lower()
        if arg in ["flood", "fire", "forest_fire", "pollution", "heat", "normal"]:
            sc = "forest_fire" if arg == "fire" else arg
            sc = "air_pollution" if arg == "pollution" else sc
            sc = "extreme_heat" if arg == "heat" else sc
            trigger_scenario(sc)
            return
        elif arg == "stream":
            run_continuous_stream()
            return

    while True:
        print_menu()
        choice = input("Select option (1-7): ").strip()
        if choice == "1":
            try:
                run_continuous_stream()
            except KeyboardInterrupt:
                print("\nStream paused.")
        elif choice == "2":
            trigger_scenario("flood", 1.0)
        elif choice == "3":
            trigger_scenario("forest_fire", 1.0)
        elif choice == "4":
            trigger_scenario("air_pollution", 1.0)
        elif choice == "5":
            trigger_scenario("extreme_heat", 1.0)
        elif choice == "6":
            trigger_scenario("normal", 1.0)
        elif choice == "7":
            print("Exiting simulator. Bye!")
            break
        else:
            print("Invalid option. Please try again.")


if __name__ == "__main__":
    main()
