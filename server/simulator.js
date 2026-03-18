let heading = 247
let speed = 2.1
let targetSpeed = 2.5
let roll = 1.2
let pitch = -0.8
let engineTemp = 61
let batteryVoltage = 24.3
let batteryPercent = 23

function rand(min, max) {
  return min + Math.random() * (max - min)
}

function smoothTo(current, target, rate) {
  return current + (target - current) * rate
}

function buildMessage(topic, type, data) {
  return JSON.stringify({
    op: 'publish',
    topic: topic,
    msg: { ...data, _type: type }
  })
}

export function startSimulation(broadcast) {
  let tick = 0

  setInterval(() => {
    tick++

    if (tick % 30 === 0) {
      targetSpeed = rand(0.5, 3.8)
    }

    speed = Math.max(0, smoothTo(speed, targetSpeed, 0.08) + rand(-0.05, 0.05))
    heading = (heading + rand(-0.4, 0.4) + 360) % 360
    roll = smoothTo(roll, rand(-4, 4), 0.04)
    pitch = smoothTo(pitch, rand(-3, 3), 0.04)
    engineTemp = smoothTo(engineTemp, rand(55, 80), 0.02)
    batteryVoltage = Math.max(22, batteryVoltage - 0.0002)
    batteryPercent = Math.max(0, batteryPercent - 0.00005)

    const trackEffort = Math.round((speed / 4) * 100)

    broadcast(buildMessage('/themis/imu/data_raw', 'sensor_msgs/Imu', {
      orientation: { x: roll, y: pitch, z: heading },
      angular_velocity: { x: rand(-0.01, 0.01), y: rand(-0.01, 0.01), z: rand(-0.005, 0.005) },
      linear_acceleration: { x: rand(-0.1, 0.1), y: rand(-0.1, 0.1), z: 9.81 }
    }))

    broadcast(buildMessage('/themis/odometry/filtered', 'nav_msgs/Odometry', {
      twist: {
        linear: { x: speed, y: 0, z: 0 },
        angular: { x: 0, y: 0, z: rand(-0.02, 0.02) }
      }
    }))

    broadcast(buildMessage('/themis/drive/track_effort', 'themis_msgs/TrackEffort', {
      left_forward: Math.min(100, trackEffort + Math.round(rand(-3, 3))),
      left_reverse: 0,
      right_forward: Math.min(100, trackEffort + Math.round(rand(-5, 3))),
      right_reverse: 0
    }))

    broadcast(buildMessage('/themis/sensor/engine_temp', 'std_msgs/Float32', {
      data: parseFloat(engineTemp.toFixed(1))
    }))

    if (tick % 50 === 0) {
      broadcast(buildMessage('/themis/battery/state', 'sensor_msgs/BatteryState', {
        voltage: parseFloat(batteryVoltage.toFixed(2)),
        percentage: parseFloat(batteryPercent.toFixed(1))
      }))
    }

    if (tick % 100 === 0) {
      broadcast(buildMessage('/rosout', 'rcl_interfaces/Log', {
        level: 20,
        name: 'themis_driver',
        msg: `Heartbeat OK — speed ${speed.toFixed(2)} m/s, heading ${Math.round(heading)}°`
      }))
    }

  }, 100)
}