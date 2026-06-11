const { seedDemoData } = require('./seed/demoData');

let simulatorInterval;

const startSimulator = (io, prisma) => {
  console.log('🎮 Data simulator started');

  simulatorInterval = setInterval(async () => {
    try {
      // 1. Generate machine telemetry
      const machines = await prisma.machine.findMany();
      for (const machine of machines) {
        const statuses = ['running', 'idle', 'stopped'];
        const status = statuses[Math.floor(Math.random() * statuses.length)];

        await prisma.machineTelemetry.create({
          data: {
            machineId: machine.id,
            status,
            cycleCount: Math.floor(Math.random() * 100),
            outputQuantity: status === 'running' ? Math.floor(Math.random() * 50) : 0,
            temperature: parseFloat((20 + Math.random() * 60).toFixed(1)),
            vibration: parseFloat((Math.random() * 10).toFixed(2)),
            powerConsumption: parseFloat((50 + Math.random() * 200).toFixed(1))
          }
        });
      }

      // 2. Generate sensor readings
      const sensors = await prisma.sensor.findMany();
      for (const sensor of sensors) {
        let value;
        switch (sensor.sensorType) {
          case 'temperature':
            value = parseFloat((25 + Math.random() * 15).toFixed(1));
            break;
          case 'humidity':
            value = parseFloat((40 + Math.random() * 40).toFixed(1));
            break;
          case 'air_quality':
            value = parseFloat((Math.random() * 100).toFixed(1));
            break;
          case 'noise':
            value = parseFloat((30 + Math.random() * 50).toFixed(1));
            break;
          default:
            value = parseFloat((Math.random() * 100).toFixed(1));
        }

        const isAlert = sensor.maxThreshold && value > parseFloat(sensor.maxThreshold);

        await prisma.sensorReading.create({
          data: {
            sensorId: sensor.id,
            value,
            unit: sensor.unit,
            isAlert
          }
        });

        // Create alert if threshold breached
        if (isAlert) {
          await prisma.alert.create({
            data: {
              title: `${sensor.name} Alert`,
              message: `${sensor.sensorType} exceeded threshold: ${value}${sensor.unit}`,
              severity: 'warning',
              module: 'environmental',
              context: { sensorId: sensor.id, value, threshold: sensor.maxThreshold }
            }
          });

          io.emit('alert', {
            title: `${sensor.name} Alert`,
            message: `${sensor.sensorType} exceeded threshold: ${value}${sensor.unit}`,
            severity: 'warning',
            timestamp: new Date().toISOString()
          });
        }
      }

      // 3. Simulate access logs
      const accessPoints = await prisma.accessPoint.findMany();
      if (Math.random() > 0.7 && accessPoints.length > 0) {
        const point = accessPoints[Math.floor(Math.random() * accessPoints.length)];
        const users = await prisma.user.findMany({ where: { isActive: true } });
        const user = users[Math.floor(Math.random() * users.length)];

        await prisma.accessLog.create({
          data: {
            accessPointId: point.id,
            userId: user.id,
            direction: Math.random() > 0.5 ? 'entry' : 'exit',
            method: ['rfid', 'biometric', 'mobile'][Math.floor(Math.random() * 3)],
            result: 'granted'
          }
        });
      }

      // 4. Emit real-time updates
      const latestTelemetry = await prisma.machineTelemetry.findMany({
        orderBy: { timestamp: 'desc' },
        take: 10,
        include: { machine: { select: { name: true } } }
      });

      const latestReadings = await prisma.sensorReading.findMany({
        orderBy: { timestamp: 'desc' },
        take: 10,
        include: { sensor: { select: { name: true, sensorType: true } } }
      });

      io.emit('telemetry-update', { machines: latestTelemetry, sensors: latestReadings });

    } catch (error) {
      console.error('Simulator error:', error.message);
    }
  }, 5000); // Every 5 seconds

  seedDemoData(prisma);
};

module.exports = { startSimulator };
