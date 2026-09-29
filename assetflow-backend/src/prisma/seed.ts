import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import {
  PrismaClient,
  type AssetCondition,
  type AssetStatus,
  type EmployeeStatus,
} from '../generated/prisma/client';

// ---------- Connection ----------

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not set. Check assetflow-backend/.env');
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

// ---------- Seed data ----------

const ROLES = [
  { name: 'ADMIN', description: 'Full access to inventory, employees and system users' },
  { name: 'ASSET_MANAGER', description: 'Assigns, receives, repairs and retires assets' },
  { name: 'EMPLOYEE', description: 'Views assets currently assigned to them' },
];

const CATEGORIES = [
  { name: 'Laptop', description: 'Portable computers issued to staff' },
  { name: 'Monitor', description: 'External displays' },
  { name: 'Phone', description: 'Company mobile phones' },
  { name: 'Accessory', description: 'Keyboards, mice, headsets and other peripherals' },
];

interface SeedEmployee {
  employeeCode: string;
  firstName: string;
  lastName: string;
  department: string;
  designation: string;
  status?: EmployeeStatus;
}

const EMPLOYEES: SeedEmployee[] = [
  { employeeCode: 'EMP-001', firstName: 'Nimal', lastName: 'Perera', department: 'Engineering', designation: 'Software Engineer' },
  { employeeCode: 'EMP-002', firstName: 'Ayesha', lastName: 'Fernando', department: 'Engineering', designation: 'QA Engineer' },
  { employeeCode: 'EMP-003', firstName: 'Kasun', lastName: 'Silva', department: 'Finance', designation: 'Accountant' },
  { employeeCode: 'EMP-004', firstName: 'Tharushi', lastName: 'Jayawardena', department: 'Human Resources', designation: 'HR Executive' },
  { employeeCode: 'EMP-005', firstName: 'Ravindu', lastName: 'Bandara', department: 'Sales', designation: 'Sales Executive' },
  { employeeCode: 'EMP-006', firstName: 'Sachini', lastName: 'Gunawardena', department: 'Operations', designation: 'Operations Coordinator', status: 'INACTIVE' },
];

interface SeedAsset {
  assetCode: string;
  name: string;
  serialNumber?: string;
  brand: string;
  model: string;
  category: string;
  condition: AssetCondition;
  status: AssetStatus;
  purchaseDate: string;
  purchasePrice: string;
  warrantyExpiryDate?: string;
  notes?: string;
  assignTo?: { employeeCode: string; assignedAt: string; notes?: string };
}

const ASSETS: SeedAsset[] = [
  { assetCode: 'LAP-0001', name: 'Dell Latitude 5450', serialNumber: 'SN-DL5450-0001', brand: 'Dell', model: 'Latitude 5450', category: 'Laptop', condition: 'NEW', status: 'AVAILABLE', purchaseDate: '2026-09-01', purchasePrice: '1250.00', warrantyExpiryDate: '2029-09-01', notes: 'September procurement batch' },
  { assetCode: 'LAP-0002', name: 'Dell Latitude 5450', serialNumber: 'SN-DL5450-0002', brand: 'Dell', model: 'Latitude 5450', category: 'Laptop', condition: 'GOOD', status: 'ASSIGNED', purchaseDate: '2026-03-10', purchasePrice: '1250.00', warrantyExpiryDate: '2029-03-10', assignTo: { employeeCode: 'EMP-001', assignedAt: '2026-03-12T09:00:00.000Z', notes: 'Primary work laptop' } },
  { assetCode: 'LAP-0003', name: 'Lenovo ThinkPad T14 Gen 5', serialNumber: 'SN-LNT14-0003', brand: 'Lenovo', model: 'ThinkPad T14 Gen 5', category: 'Laptop', condition: 'GOOD', status: 'ASSIGNED', purchaseDate: '2026-02-20', purchasePrice: '1380.00', warrantyExpiryDate: '2029-02-20', assignTo: { employeeCode: 'EMP-002', assignedAt: '2026-02-24T08:30:00.000Z' } },
  { assetCode: 'LAP-0004', name: 'Apple MacBook Air 13 M3', serialNumber: 'SN-MBA13-0004', brand: 'Apple', model: 'MacBook Air 13 M3', category: 'Laptop', condition: 'GOOD', status: 'AVAILABLE', purchaseDate: '2025-11-05', purchasePrice: '1499.00', warrantyExpiryDate: '2026-11-05' },
  { assetCode: 'LAP-0005', name: 'HP EliteBook 840 G10', serialNumber: 'SN-HP840-0005', brand: 'HP', model: 'EliteBook 840 G10', category: 'Laptop', condition: 'DAMAGED', status: 'DAMAGED', purchaseDate: '2025-06-18', purchasePrice: '1320.00', warrantyExpiryDate: '2028-06-18', notes: 'Cracked screen hinge' },
  { assetCode: 'MON-0001', name: 'Dell UltraSharp 27 U2724D', serialNumber: 'SN-U2724D-0001', brand: 'Dell', model: 'U2724D', category: 'Monitor', condition: 'NEW', status: 'AVAILABLE', purchaseDate: '2026-09-01', purchasePrice: '420.00', warrantyExpiryDate: '2029-09-01' },
  { assetCode: 'MON-0002', name: 'Dell UltraSharp 27 U2724D', serialNumber: 'SN-U2724D-0002', brand: 'Dell', model: 'U2724D', category: 'Monitor', condition: 'GOOD', status: 'ASSIGNED', purchaseDate: '2026-03-10', purchasePrice: '420.00', warrantyExpiryDate: '2029-03-10', assignTo: { employeeCode: 'EMP-001', assignedAt: '2026-03-12T09:05:00.000Z' } },
  { assetCode: 'MON-0003', name: 'LG 27UP850 4K', serialNumber: 'SN-LG27-0003', brand: 'LG', model: '27UP850', category: 'Monitor', condition: 'FAIR', status: 'UNDER_REPAIR', purchaseDate: '2024-08-14', purchasePrice: '380.00', warrantyExpiryDate: '2027-08-14', notes: 'Flickering backlight, sent to vendor' },
  { assetCode: 'PHN-0001', name: 'Samsung Galaxy S24', serialNumber: 'SN-SGS24-0001', brand: 'Samsung', model: 'Galaxy S24', category: 'Phone', condition: 'GOOD', status: 'ASSIGNED', purchaseDate: '2026-01-08', purchasePrice: '799.00', warrantyExpiryDate: '2028-01-08', assignTo: { employeeCode: 'EMP-005', assignedAt: '2026-01-10T10:00:00.000Z', notes: 'Field sales phone' } },
  { assetCode: 'PHN-0002', name: 'Apple iPhone 15', serialNumber: 'SN-IP15-0002', brand: 'Apple', model: 'iPhone 15', category: 'Phone', condition: 'GOOD', status: 'LOST', purchaseDate: '2025-04-02', purchasePrice: '829.00', warrantyExpiryDate: '2027-04-02', notes: 'Reported lost during travel' },
  { assetCode: 'ACC-0001', name: 'Logitech MX Keys S', brand: 'Logitech', model: 'MX Keys S', category: 'Accessory', condition: 'GOOD', status: 'AVAILABLE', purchaseDate: '2026-02-01', purchasePrice: '109.00' },
  { assetCode: 'ACC-0002', name: 'Logitech MX Master 3S', brand: 'Logitech', model: 'MX Master 3S', category: 'Accessory', condition: 'NEW', status: 'AVAILABLE', purchaseDate: '2026-09-01', purchasePrice: '99.00' },
  { assetCode: 'ACC-0003', name: 'Jabra Evolve2 55 Headset', serialNumber: 'SN-JE255-0003', brand: 'Jabra', model: 'Evolve2 55', category: 'Accessory', condition: 'FAIR', status: 'RETIRED', purchaseDate: '2022-05-20', purchasePrice: '310.00', notes: 'End of life, battery no longer holds charge' },
];

// ---------- Seed logic ----------

async function main() {
  const existingAssets = await prisma.asset.count();
  if (existingAssets > 0) {
    console.log(`Seed skipped: ${existingAssets} assets already exist.`);
    return;
  }

  await prisma.$transaction(
    async (tx) => {
      for (const role of ROLES) {
        await tx.role.upsert({ where: { name: role.name }, update: {}, create: role });
      }

      const categoryIds = new Map<string, string>();
      for (const category of CATEGORIES) {
        const saved = await tx.assetCategory.upsert({
          where: { name: category.name },
          update: {},
          create: category,
        });
        categoryIds.set(saved.name, saved.id);
      }

      const employeeIds = new Map<string, string>();
      for (const employee of EMPLOYEES) {
        const email = `${employee.firstName}.${employee.lastName}@assetflow.local`.toLowerCase();
        const saved = await tx.employee.upsert({
          where: { employeeCode: employee.employeeCode },
          update: {},
          create: { ...employee, email },
        });
        employeeIds.set(saved.employeeCode, saved.id);
      }

      for (const item of ASSETS) {
        const { category, assignTo, purchaseDate, warrantyExpiryDate, ...fields } = item;

        const asset = await tx.asset.create({
          data: {
            ...fields,
            categoryId: categoryIds.get(category)!,
            purchaseDate: new Date(purchaseDate),
            warrantyExpiryDate: warrantyExpiryDate ? new Date(warrantyExpiryDate) : null,
          },
        });

        // Every asset starts its life with a CREATED event
        await tx.assetHistory.create({
          data: {
            assetId: asset.id,
            action: 'CREATED',
            newStatus: 'AVAILABLE',
            description: `Asset ${asset.assetCode} registered`,
          },
        });

        if (assignTo) {
          const assignment = await tx.assetAssignment.create({
            data: {
              assetId: asset.id,
              employeeId: employeeIds.get(assignTo.employeeCode)!,
              assignedAt: new Date(assignTo.assignedAt),
              notes: assignTo.notes,
            },
          });
          await tx.assetHistory.create({
            data: {
              assetId: asset.id,
              assignmentId: assignment.id,
              action: 'ASSIGNED',
              previousStatus: 'AVAILABLE',
              newStatus: 'ASSIGNED',
              description: `Assigned to employee ${assignTo.employeeCode}`,
            },
          });
        } else if (asset.status !== 'AVAILABLE') {
          await tx.assetHistory.create({
            data: {
              assetId: asset.id,
              action: 'STATUS_CHANGED',
              previousStatus: 'AVAILABLE',
              newStatus: asset.status,
              description: `Status changed to ${asset.status}`,
            },
          });
        }
      }
    },
    { timeout: 30_000 },
  );

  console.log(
    `Seeded ${ROLES.length} roles, ${CATEGORIES.length} categories, ${EMPLOYEES.length} employees, ${ASSETS.length} assets.`,
  );
}

void main()
  .catch((error: unknown) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
