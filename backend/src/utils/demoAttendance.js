function startOfDay(dateInput) {
  const date = new Date(dateInput);
  date.setHours(0, 0, 0, 0);
  return date;
}

function endOfDay(dateInput) {
  const date = startOfDay(dateInput);
  return new Date(date.getTime() + 24 * 60 * 60 * 1000);
}

async function ensureDemoAttendanceForDate(prisma, dateInput) {
  if (process.env.DEMO_MODE !== 'true') {
    return;
  }

  const date = startOfDay(dateInput);
  const nextDay = endOfDay(dateInput);

  const existingCount = await prisma.attendanceRecord.count({
    where: {
      date: { gte: date, lt: nextDay },
    },
  });

  if (existingCount > 0) {
    return;
  }

  const employees = await prisma.employee.findMany({
    orderBy: { employeeCode: 'asc' },
  });

  if (employees.length === 0) {
    return;
  }

  const statusPlan = [
    'PRESENT',
    'PRESENT',
    'PRESENT',
    'PRESENT',
    'PRESENT',
    'PRESENT',
    'LATE',
    'LATE',
    'ON_LEAVE',
    'ABSENT',
  ];

  const records = employees.map((employee, index) => {
    const status = statusPlan[index % statusPlan.length];
    const record = {
      employeeId: employee.id,
      date,
      status,
      method: index % 2 === 0 ? 'mobile' : 'biometric',
    };

    if (status === 'PRESENT' || status === 'LATE') {
      const startHour = status === 'LATE' ? 9 : 7;
      const clockIn = new Date(date.getTime() + (startHour + (index % 2)) * 60 * 60 * 1000 + 15 * 60 * 1000);
      record.clockIn = clockIn;

      if (index < 4) {
        record.clockOut = new Date(clockIn.getTime() + 8 * 60 * 60 * 1000);
        record.workHours = 8;
      } else if (index < 8) {
        const hoursWorked = Math.max(1, (Date.now() - clockIn.getTime()) / (1000 * 60 * 60));
        record.workHours = parseFloat(Math.min(hoursWorked, 8).toFixed(2));
      }
    }

    return record;
  });

  await prisma.attendanceRecord.createMany({ data: records });
}

module.exports = {
  ensureDemoAttendanceForDate,
  startOfDay,
  endOfDay,
};
