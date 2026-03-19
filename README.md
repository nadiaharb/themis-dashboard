# THeMIS Telemetry Dashboard

A real-time telemetry dashboard for the THeMIS 140 Unmanned Ground Vehicle, built as a proof of concept for ROS2 middleware interfacing.

The project simulates a `rosbridge_suite` WebSocket server and connects a React frontend to it using the rosbridge v2 protocol — the same protocol a real THeMIS would use.

## Architecture
```
React app  ←→  WebSocket (ws://localhost:9090)  ←→  Node.js bridge server
                                                          ↕
                                                    simulator.js
                                                  (fake sensor data)
```

The key design decision is that the React frontend has no idea whether it's talking to a simulator or a real robot. The `useRosBridge` hook speaks pure rosbridge protocol — to swap in a live THeMIS, you stop the Node.js server and point the client at a real `rosbridge_suite` instance running on the robot. One environment variable change.

## ROS2 Topics Implemented

| Topic | Message type | Hz |
|---|---|---|
| `/themis/imu/data_raw` | `sensor_msgs/Imu` | 100 |
| `/themis/odometry/filtered` | `nav_msgs/Odometry` | 20 |
| `/themis/drive/track_effort` | `themis_msgs/TrackEffort` | 10 |
| `/themis/sensor/engine_temp` | `std_msgs/Float32` | 10 |
| `/themis/battery/state` | `sensor_msgs/BatteryState` | 1 |
| `/rosout` | `rcl_interfaces/Log` | — |

## Running locally

You need Node.js 18+ and two terminals.

**Terminal 1 — bridge server:**
```bash
cd server
npm install
npm run dev
```

**Terminal 2 — React client:**
```bash
cd client
npm install
npm run dev
```

Open `http://localhost:5173`.

## Connecting to a real robot

The simulator speaks the rosbridge v2 protocol identically to `rosbridge_suite`. To connect to a real THeMIS:

1. Install `rosbridge_suite` on the robot: `sudo apt install ros-humble-rosbridge-suite`
2. Launch it: `ros2 launch rosbridge_server rosbridge_websocket_launch.xml`
3. Set the WebSocket URL to point at the robot IP:
   ```bash
   echo "VITE_WS_URL=ws://<robot-ip>:9090" > client/.env.local
   ```

No other changes needed.

## What's next

- Replace simulated IMU with live `/themis/imu/data_raw` from a real unit
- Add `/themis/lidar/points` visualisation using Three.js
- Implement `cmd_vel` publishing so the dashboard can send drive commands
- Add message schema definitions in C++ matching `themis_msgs/*`
- Explore Rust for the bridge server for lower latency on embedded hardware