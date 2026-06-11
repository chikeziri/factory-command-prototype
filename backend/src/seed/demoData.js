const bcrypt = require('bcryptjs');

const DEMO_PASSWORD_HASH = bcrypt.hashSync('demo123', 10);

async function seedDemoData(prisma) {
  const userCount = await prisma.user.count();
  if (userCount > 0) {
    console.log('Demo data already present — skipping seed');
    return false;
  }

  console.log('Seeding demo data...');

  await prisma.user.createMany({
    data: [
      { email: 'owner@factory.ng', password: DEMO_PASSWORD_HASH, firstName: 'James', lastName: 'Okonkwo', role: 'TENANT_ADMIN', department: 'Management', phone: '+2348012345678' },
      { email: 'manager@factory.ng', password: DEMO_PASSWORD_HASH, firstName: 'Chioma', lastName: 'Adeyemi', role: 'FACTORY_MANAGER', department: 'Operations', phone: '+2348023456789' },
      { email: 'production@factory.ng', password: DEMO_PASSWORD_HASH, firstName: 'Emeka', lastName: 'Nnamdi', role: 'DEPARTMENT_HEAD', department: 'Production', phone: '+2348034567890' },
      { email: 'security@factory.ng', password: DEMO_PASSWORD_HASH, firstName: 'Ibrahim', lastName: 'Musa', role: 'SECURITY', department: 'Security', phone: '+2348045678901' },
      { email: 'operator@factory.ng', password: DEMO_PASSWORD_HASH, firstName: 'Amina', lastName: 'Bello', role: 'OPERATOR', department: 'Production', phone: '+2348056789012' },
      { email: 'accountant@factory.ng', password: DEMO_PASSWORD_HASH, firstName: 'Fatima', lastName: 'Osei', role: 'OPERATOR', department: 'Finance', phone: '+2348067890123' }
    ]
  });

  await prisma.employee.createMany({
    data: [
      { employeeCode: 'EMP-2024-0001', name: 'James Okonkwo', department: 'Management', jobTitle: 'Factory Owner', baseSalary: 500000 },
      { employeeCode: 'EMP-2024-0002', name: 'Chioma Adeyemi', department: 'Operations', jobTitle: 'Factory Manager', baseSalary: 350000 },
      { employeeCode: 'EMP-2024-0003', name: 'Emeka Nnamdi', department: 'Production', jobTitle: 'Production Supervisor', baseSalary: 250000 },
      { employeeCode: 'EMP-2024-0004', name: 'Ibrahim Musa', department: 'Security', jobTitle: 'Security Chief', baseSalary: 180000 },
      { employeeCode: 'EMP-2024-0005', name: 'Amina Bello', department: 'Production', jobTitle: 'Machine Operator', baseSalary: 150000 },
      { employeeCode: 'EMP-2024-0006', name: 'Fatima Osei', department: 'Finance', jobTitle: 'Accountant', baseSalary: 200000 },
      { employeeCode: 'EMP-2024-0007', name: 'Oluwaseun Adeleke', department: 'Production', jobTitle: 'Assembly Worker', baseSalary: 120000 },
      { employeeCode: 'EMP-2024-0008', name: 'Ngozi Eze', department: 'Warehouse', jobTitle: 'Inventory Clerk', baseSalary: 140000 },
      { employeeCode: 'EMP-2024-0009', name: 'Yusuf Abdullahi', department: 'Maintenance', jobTitle: 'Technician', baseSalary: 160000 },
      { employeeCode: 'EMP-2024-0010', name: 'Blessing Obi', department: 'Quality', jobTitle: 'QA Inspector', baseSalary: 170000 }
    ]
  });

  await prisma.machine.createMany({
    data: [
      { name: 'Injection Molding Unit A', model: 'JM-5000', manufacturer: 'Haitian', serialNumber: 'HT2024A001', location: 'Production Hall A, Line 1', status: 'RUNNING', specifications: { power: '50kW', capacity: '500 units/hr' } },
      { name: 'Injection Molding Unit B', model: 'JM-5000', manufacturer: 'Haitian', serialNumber: 'HT2024A002', location: 'Production Hall A, Line 2', status: 'RUNNING', specifications: { power: '50kW', capacity: '500 units/hr' } },
      { name: 'CNC Lathe Alpha', model: 'CL-2000', manufacturer: 'DMG Mori', serialNumber: 'DM2024B001', location: 'Production Hall B, Line 1', status: 'OPERATIONAL', specifications: { power: '35kW', capacity: '200 units/hr' } },
      { name: 'CNC Lathe Beta', model: 'CL-2000', manufacturer: 'DMG Mori', serialNumber: 'DM2024B002', location: 'Production Hall B, Line 2', status: 'MAINTENANCE', specifications: { power: '35kW', capacity: '200 units/hr' } },
      { name: 'Packaging Robot 1', model: 'PR-100', manufacturer: 'ABB', serialNumber: 'ABB2024C001', location: 'Packaging Area', status: 'RUNNING', specifications: { power: '15kW', capacity: '1000 units/hr' } },
      { name: 'Quality Scanner X1', model: 'QS-500', manufacturer: 'Keyence', serialNumber: 'KY2024D001', location: 'Quality Lab', status: 'OPERATIONAL', specifications: { power: '5kW', resolution: '0.01mm' } }
    ]
  });

  const machineA = await prisma.machine.findFirst({ where: { name: 'Injection Molding Unit A' } });
  const machineB = await prisma.machine.findFirst({ where: { name: 'Injection Molding Unit B' } });
  const latheAlpha = await prisma.machine.findFirst({ where: { name: 'CNC Lathe Alpha' } });
  const latheBeta = await prisma.machine.findFirst({ where: { name: 'CNC Lathe Beta' } });

  await prisma.productionOrder.createMany({
    data: [
      { orderNumber: 'PO-2024-0001', productName: 'Plastic Container 5L', quantityTarget: 5000, quantityActual: 4870, machineId: machineA.id, startTime: new Date(Date.now() - 86400000 * 2), endTime: new Date(Date.now() - 86400000), status: 'COMPLETED', priority: 'high' },
      { orderNumber: 'PO-2024-0002', productName: 'Metal Bracket Type X', quantityTarget: 2000, quantityActual: 1250, machineId: latheAlpha.id, startTime: new Date(Date.now() - 43200000), status: 'IN_PROGRESS', priority: 'normal' },
      { orderNumber: 'PO-2024-0003', productName: 'Plastic Container 2L', quantityTarget: 8000, quantityActual: 0, machineId: machineB.id, status: 'PLANNED', priority: 'normal' }
    ]
  });

  await prisma.maintenanceRecord.createMany({
    data: [
      { machineId: latheBeta.id, maintenanceType: 'preventive', scheduledDate: new Date(Date.now() + 86400000 * 2), description: 'Scheduled spindle bearing replacement', cost: 150000, status: 'scheduled' },
      { machineId: machineA.id, maintenanceType: 'preventive', scheduledDate: new Date(Date.now() + 86400000 * 7), description: 'Hydraulic system check', cost: 75000, status: 'scheduled' }
    ]
  });

  await prisma.warehouse.createMany({
    data: [
      { name: 'Raw Materials Store', location: 'Building A, Ground Floor', type: 'raw_materials' },
      { name: 'Finished Goods Warehouse', location: 'Building B, First Floor', type: 'finished_goods' },
      { name: 'Spare Parts Store', location: 'Building C, Ground Floor', type: 'spare_parts' }
    ]
  });

  const warehouses = await prisma.warehouse.findMany();
  await prisma.inventoryItem.createMany({
    data: [
      { sku: 'RM-001', name: 'HDPE Resin Grade A', category: 'Raw Materials', unitOfMeasure: 'kg', warehouseId: warehouses[0].id, binLocation: 'A-01-01', quantityOnHand: 5000, reorderPoint: 1000, reorderQuantity: 2000, unitCost: 850 },
      { sku: 'RM-002', name: 'Steel Sheet 2mm', category: 'Raw Materials', unitOfMeasure: 'sheet', warehouseId: warehouses[0].id, binLocation: 'A-02-03', quantityOnHand: 250, reorderPoint: 50, reorderQuantity: 100, unitCost: 12500 },
      { sku: 'RM-003', name: 'Colorant Blue', category: 'Raw Materials', unitOfMeasure: 'kg', warehouseId: warehouses[0].id, binLocation: 'A-03-01', quantityOnHand: 150, reorderPoint: 30, reorderQuantity: 100, unitCost: 3500 },
      { sku: 'FG-001', name: 'Plastic Container 5L', category: 'Finished Goods', unitOfMeasure: 'piece', warehouseId: warehouses[1].id, binLocation: 'B-01-01', quantityOnHand: 3500, reorderPoint: 500, reorderQuantity: 1000, unitCost: 1200 },
      { sku: 'FG-002', name: 'Metal Bracket Type X', category: 'Finished Goods', unitOfMeasure: 'piece', warehouseId: warehouses[1].id, binLocation: 'B-02-01', quantityOnHand: 1800, reorderPoint: 300, reorderQuantity: 500, unitCost: 4500 },
      { sku: 'SP-001', name: 'Hydraulic Seal Kit', category: 'Spare Parts', unitOfMeasure: 'kit', warehouseId: warehouses[2].id, binLocation: 'C-01-01', quantityOnHand: 12, reorderPoint: 5, reorderQuantity: 10, unitCost: 45000 },
      { sku: 'SP-002', name: 'CNC Cutting Tool Set', category: 'Spare Parts', unitOfMeasure: 'set', warehouseId: warehouses[2].id, binLocation: 'C-02-01', quantityOnHand: 8, reorderPoint: 3, reorderQuantity: 5, unitCost: 85000 }
    ]
  });

  await prisma.purchaseOrder.createMany({
    data: [
      { poNumber: 'PO-SUP-2024-001', supplierName: 'Nigerian Petrochemicals Ltd', status: 'received', totalAmount: 4250000, currency: 'NGN', expectedDelivery: new Date(Date.now() - 86400000 * 5), actualDelivery: new Date(Date.now() - 86400000 * 4) },
      { poNumber: 'PO-SUP-2024-002', supplierName: 'Lagos Steel Works', status: 'partial', totalAmount: 1250000, currency: 'NGN', expectedDelivery: new Date(Date.now() + 86400000 * 3) },
      { poNumber: 'PO-SUP-2024-003', supplierName: 'Global Colorants Nigeria', status: 'sent', totalAmount: 350000, currency: 'NGN', expectedDelivery: new Date(Date.now() + 86400000 * 7) }
    ]
  });

  await prisma.sensor.createMany({
    data: [
      { name: 'Production Hall A Temp', sensorType: 'temperature', location: 'Production Hall A, Center', unit: '°C', minThreshold: 20, maxThreshold: 35, criticalThreshold: 40 },
      { name: 'Production Hall A Humidity', sensorType: 'humidity', location: 'Production Hall A, Center', unit: '%', minThreshold: 30, maxThreshold: 70 },
      { name: 'Production Hall B Temp', sensorType: 'temperature', location: 'Production Hall B, Center', unit: '°C', minThreshold: 20, maxThreshold: 35, criticalThreshold: 40 },
      { name: 'Warehouse Air Quality', sensorType: 'air_quality', location: 'Raw Materials Store', unit: 'AQI', maxThreshold: 100, criticalThreshold: 150 },
      { name: 'Packaging Area Noise', sensorType: 'noise', location: 'Packaging Area', unit: 'dB', maxThreshold: 85, criticalThreshold: 95 }
    ]
  });

  await prisma.accessPoint.createMany({
    data: [
      { name: 'Main Factory Gate', location: 'Factory Perimeter', deviceType: 'turnstile', direction: 'bidirectional' },
      { name: 'Production Hall A Entry', location: 'Production Hall A', deviceType: 'door_lock', direction: 'entry' },
      { name: 'Warehouse Entry', location: 'Raw Materials Store', deviceType: 'door_lock', direction: 'entry' },
      { name: 'Admin Office', location: 'Admin Building', deviceType: 'door_lock', direction: 'bidirectional' },
      { name: 'Quality Lab', location: 'Quality Lab Entrance', deviceType: 'door_lock', direction: 'entry' }
    ]
  });

  const owner = await prisma.user.findFirst({ where: { email: 'owner@factory.ng' } });
  const manager = await prisma.user.findFirst({ where: { email: 'manager@factory.ng' } });

  await prisma.asset.createMany({
    data: [
      { assetTag: 'LAP-001', name: 'Dell Latitude 5520', category: 'laptop', brand: 'Dell', model: 'Latitude 5520', serialNumber: 'SN123456789', purchaseCost: 450000, currentValue: 360000, assignedTo: owner.id, location: 'Admin Office', status: 'assigned', specifications: { ram: '16GB', storage: '512GB SSD', os: 'Windows 11 Pro' } },
      { assetTag: 'LAP-002', name: 'HP EliteBook 840', category: 'laptop', brand: 'HP', model: 'EliteBook 840 G8', serialNumber: 'SN987654321', purchaseCost: 520000, currentValue: 416000, assignedTo: manager.id, location: 'Operations Office', status: 'assigned', specifications: { ram: '16GB', storage: '512GB SSD', os: 'Windows 11 Pro' } },
      { assetTag: 'LAP-003', name: 'Lenovo ThinkPad T14', category: 'laptop', brand: 'Lenovo', model: 'ThinkPad T14', serialNumber: 'SN456789123', purchaseCost: 480000, currentValue: 384000, location: 'IT Store', status: 'available', specifications: { ram: '16GB', storage: '256GB SSD', os: 'Windows 11 Pro' } },
      { assetTag: 'VEH-001', name: 'Toyota Hilux', category: 'vehicle', brand: 'Toyota', model: 'Hilux 2023', serialNumber: 'CH123456', purchaseCost: 35000000, currentValue: 28000000, location: 'Parking Lot', status: 'available', specifications: { type: 'Pickup', capacity: '1 ton', fuel: 'Diesel' } }
    ]
  });

  await prisma.account.createMany({
    data: [
      { accountCode: '1101', accountName: 'Cash and Bank', accountType: 'asset', isBankAccount: true, bankName: 'First Bank of Nigeria', bankAccountNumber: '1234567890', openingBalance: 25000000, currentBalance: 25000000 },
      { accountCode: '1102', accountName: 'Accounts Receivable', accountType: 'asset', openingBalance: 8500000, currentBalance: 8500000 },
      { accountCode: '1103', accountName: 'Inventory - Raw Materials', accountType: 'asset', openingBalance: 12500000, currentBalance: 12500000 },
      { accountCode: '1104', accountName: 'Inventory - Finished Goods', accountType: 'asset', openingBalance: 8750000, currentBalance: 8750000 },
      { accountCode: '1201', accountName: 'Plant and Machinery', accountType: 'asset', openingBalance: 125000000, currentBalance: 125000000 },
      { accountCode: '1299', accountName: 'Accumulated Depreciation', accountType: 'asset', openingBalance: 25000000, currentBalance: 25000000 },
      { accountCode: '2101', accountName: 'Accounts Payable', accountType: 'liability', openingBalance: 6500000, currentBalance: 6500000 },
      { accountCode: '2102', accountName: 'VAT Payable', accountType: 'liability', openingBalance: 1250000, currentBalance: 1250000 },
      { accountCode: '3101', accountName: 'Share Capital', accountType: 'equity', openingBalance: 50000000, currentBalance: 50000000 },
      { accountCode: '3201', accountName: 'Retained Earnings', accountType: 'equity', openingBalance: 35000000, currentBalance: 35000000 },
      { accountCode: '4101', accountName: 'Sales Revenue', accountType: 'revenue', openingBalance: 0, currentBalance: 0 },
      { accountCode: '4201', accountName: 'Other Income', accountType: 'revenue', openingBalance: 0, currentBalance: 0 },
      { accountCode: '5101', accountName: 'Cost of Raw Materials', accountType: 'expense', openingBalance: 0, currentBalance: 0 },
      { accountCode: '5201', accountName: 'Direct Labor', accountType: 'expense', openingBalance: 0, currentBalance: 0 },
      { accountCode: '6101', accountName: 'Salaries and Wages', accountType: 'expense', openingBalance: 0, currentBalance: 0 },
      { accountCode: '6201', accountName: 'Rent and Rates', accountType: 'expense', openingBalance: 0, currentBalance: 0 },
      { accountCode: '6301', accountName: 'Utilities', accountType: 'expense', openingBalance: 0, currentBalance: 0 },
      { accountCode: '6401', accountName: 'Repairs and Maintenance', accountType: 'expense', openingBalance: 0, currentBalance: 0 },
      { accountCode: '6501', accountName: 'Depreciation', accountType: 'expense', openingBalance: 0, currentBalance: 0 },
      { accountCode: '6601', accountName: 'Professional Fees', accountType: 'expense', openingBalance: 0, currentBalance: 0 }
    ]
  });

  const accounts = await prisma.account.findMany();
  const cashAccount = accounts.find((a) => a.accountCode === '1101');
  const salesAccount = accounts.find((a) => a.accountCode === '4101');
  const salariesAccount = accounts.find((a) => a.accountCode === '6101');
  const accountant = await prisma.user.findFirst({ where: { email: 'accountant@factory.ng' } });

  await prisma.journalEntry.create({
    data: {
      entryNumber: 'JE-2024-00001',
      date: new Date(Date.now() - 86400000 * 5),
      reference: 'Sales Invoice #001 - Lagos Distributors',
      sourceModule: 'sales',
      totalDebit: 2500000,
      totalCredit: 2500000,
      isPosted: true,
      postedAt: new Date(Date.now() - 86400000 * 5),
      createdBy: accountant.id,
      lines: {
        create: [
          { accountId: cashAccount.id, description: 'Cash received from sales', debit: 2500000, credit: 0 },
          { accountId: salesAccount.id, description: 'Sales revenue', debit: 0, credit: 2500000 }
        ]
      }
    }
  });

  await prisma.journalEntry.create({
    data: {
      entryNumber: 'JE-2024-00002',
      date: new Date(Date.now() - 86400000 * 3),
      reference: 'Monthly Salary Payment',
      sourceModule: 'payroll',
      totalDebit: 1850000,
      totalCredit: 1850000,
      isPosted: true,
      postedAt: new Date(Date.now() - 86400000 * 3),
      createdBy: accountant.id,
      lines: {
        create: [
          { accountId: salariesAccount.id, description: 'Salaries and wages', debit: 1850000, credit: 0 },
          { accountId: cashAccount.id, description: 'Bank transfer to employees', debit: 0, credit: 1850000 }
        ]
      }
    }
  });

  await prisma.payrollPeriod.create({
    data: {
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
      status: 'paid',
      totalBasicSalary: 1850000,
      totalAllowances: 370000,
      totalDeductions: 185000,
      totalTax: 277500,
      totalNetPay: 1757500
    }
  });

  await prisma.bankAccount.createMany({
    data: [
      { name: 'First Bank Current', bankName: 'First Bank of Nigeria', accountNumber: '1234567890', currency: 'NGN', currentBalance: 25000000 },
      { name: 'GTBank Dollar Account', bankName: 'Guaranty Trust Bank', accountNumber: '0987654321', currency: 'USD', currentBalance: 45000 }
    ]
  });

  await prisma.alert.createMany({
    data: [
      { title: 'System Initialization', message: 'Factory Command platform initialized successfully', severity: 'info', module: 'system', status: 'resolved', resolvedAt: new Date() },
      { title: 'Low Stock Alert', message: 'Hydraulic Seal Kit is below reorder point (12 kits remaining)', severity: 'warning', module: 'inventory', status: 'sent' },
      { title: 'Machine Maintenance Due', message: 'CNC Lathe Beta scheduled maintenance in 2 days', severity: 'info', module: 'production', status: 'sent' }
    ]
  });

  const employees = await prisma.employee.findMany({ take: 7 });
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await prisma.attendanceRecord.createMany({
    data: employees.map((employee, index) => ({
      employeeId: employee.id,
      date: today,
      clockIn: new Date(today.getTime() + (7 + index) * 60 * 60 * 1000),
      status: index === 6 ? 'LATE' : 'PRESENT',
      method: index % 2 === 0 ? 'mobile' : 'biometric'
    }))
  });

  const accessPoints = await prisma.accessPoint.findMany({ take: 3 });
  const users = await prisma.user.findMany({ where: { isActive: true }, take: 5 });

  for (let i = 0; i < 8; i += 1) {
    await prisma.accessLog.create({
      data: {
        accessPointId: accessPoints[i % accessPoints.length].id,
        userId: users[i % users.length].id,
        direction: i % 2 === 0 ? 'entry' : 'exit',
        method: ['rfid', 'biometric', 'mobile'][i % 3],
        result: 'granted',
        timestamp: new Date(Date.now() - i * 15 * 60 * 1000)
      }
    });
  }

  console.log('Demo data seeded successfully');
  console.log('Demo login: owner@factory.ng / demo123');
  console.log('Demo login: manager@factory.ng / demo123');
  console.log('Demo login: operator@factory.ng / demo123');

  return true;
}

module.exports = { seedDemoData, DEMO_PASSWORD_HASH };
