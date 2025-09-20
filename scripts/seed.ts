import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User, Person, Vehicle, Transaction, Expense, ActivityLog } from '../src/models';
import connectDB from '../src/lib/mongodb';

async function createUsers() {
  console.log('Creating users...');
  
  const users = [
    {
      name: 'John Admin',
      email: 'admin@example.com',
      passwordHash: await bcrypt.hash('password123', 12),
      role: 'Admin',
      isActive: true,
    },
    {
      name: 'Jane Manager',
      email: 'manager@example.com',
      passwordHash: await bcrypt.hash('password123', 12),
      role: 'Manager',
      isActive: true,
    },
    {
      name: 'Bob Clerk',
      email: 'clerk@example.com',
      passwordHash: await bcrypt.hash('password123', 12),
      role: 'Clerk',
      isActive: true,
    },
  ];

  const createdUsers = await User.insertMany(users);
  console.log(`Created ${createdUsers.length} users`);
  return createdUsers;
}

async function createPersons(userId: mongoose.Types.ObjectId) {
  console.log('Creating persons...');
  
  const individualNames = [
    'Michael Johnson', 'Sarah Williams', 'David Brown', 'Emily Davis', 'James Wilson',
    'Jennifer Garcia', 'Robert Martinez', 'Lisa Anderson', 'William Taylor', 'Mary Thomas',
    'Richard Jackson', 'Patricia White', 'Christopher Harris', 'Linda Martin', 'Daniel Thompson',
    'Barbara Garcia', 'Matthew Rodriguez', 'Susan Lewis', 'Anthony Lee', 'Nancy Walker',
    'Mark Hall', 'Betty Allen', 'Steven Young', 'Helen King', 'Paul Wright'
  ];
  
  const businessNames = [
    'Premium Auto Dealers', 'City Transport Solutions', 'Elite Motors Inc', 'Metro Car Sales',
    'Highway Automotive Group', 'Urban Fleet Services', 'Sunrise Auto Trading', 'Pacific Motors Ltd',
    'Continental Car Company', 'Victory Auto Sales', 'Royal Motors International', 'Golden State Auto',
    'Diamond Auto Group', 'Silver Line Motors', 'Platinum Car Center', 'Crystal Auto Sales',
    'Phoenix Auto Trading', 'Thunder Motors LLC', 'Lightning Auto Group', 'Storm Car Sales',
    'Eagle Auto Services', 'Falcon Motors Inc', 'Hawk Auto Trading', 'Raven Car Sales', 'Wolf Motors Group'
  ];
  
  const addresses = [
    '123 Main St, Springfield, USA', '456 Business Ave, Commerce City, USA', '789 Oak St, Riverside, USA',
    '321 Industrial Blvd, Metro City, USA', '654 Pine St, Hillview, USA', '987 Elm Ave, Downtown, USA',
    '147 Maple Dr, Suburbia, USA', '258 Cedar Ln, Greenville, USA', '369 Birch St, Lakeside, USA',
    '741 Ash Ave, Riverside, USA', '852 Willow Way, Parkview, USA', '963 Poplar Rd, Hillcrest, USA',
    '159 Spruce St, Valley View, USA', '357 Fir Ave, Mountain View, USA', '468 Redwood Dr, Forest Hill, USA',
    '579 Cherry Ln, Orchard Park, USA', '681 Magnolia St, Garden City, USA', '792 Dogwood Ave, Bloom Town, USA',
    '834 Hickory Rd, Timber Creek, USA', '945 Sycamore St, Shade Valley, USA'
  ];
  
  const persons = [];
  
  // Create 15 Individual persons
  for (let i = 0; i < 15; i++) {
    persons.push({
      type: 'Individual',
      fullName: individualNames[i],
      nicOrPassport: `${String(i + 100000000).padStart(9, '0')}V`,
      phone: [`+1-555-${String(i + 1000).padStart(4, '0')}`],
      email: `${individualNames[i].toLowerCase().replace(' ', '.')}@email.com`,
      address: addresses[i % addresses.length],
      notes: i % 3 === 0 ? 'Regular customer' : i % 3 === 1 ? 'First-time buyer' : 'Repeat customer',
      isBlacklisted: i === 14 ? true : false, // Last one blacklisted for variety
      createdBy: userId,
      updatedBy: userId,
    });
  }
  
  // Create 8 Dealer persons
  for (let i = 0; i < 8; i++) {
    persons.push({
      type: 'Dealer',
      businessName: businessNames[i],
      companyRegNo: `DLR${String(i + 10000).padStart(5, '0')}`,
      phone: [`+1-555-${String(i + 2000).padStart(4, '0')}`],
      email: `contact@${businessNames[i].toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
      address: addresses[(i + 5) % addresses.length],
      notes: i % 2 === 0 ? 'Wholesale dealer, good payment history' : 'Retail dealer, reliable partner',
      isBlacklisted: false,
      createdBy: userId,
      updatedBy: userId,
    });
  }
  
  // Create 7 Company persons
  for (let i = 0; i < 7; i++) {
    persons.push({
      type: 'Company',
      businessName: businessNames[i + 8],
      companyRegNo: `CMP${String(i + 30000).padStart(5, '0')}`,
      phone: [`+1-555-${String(i + 3000).padStart(4, '0')}`, `+1-555-${String(i + 3100).padStart(4, '0')}`],
      email: `info@${businessNames[i + 8].toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
      address: addresses[(i + 10) % addresses.length],
      notes: i % 2 === 0 ? 'Fleet buyer, bulk purchases' : 'Corporate client, special rates',
      isBlacklisted: false,
      createdBy: userId,
      updatedBy: userId,
    });
  }

  const createdPersons = await Person.insertMany(persons);
  console.log(`Created ${createdPersons.length} persons`);
  return createdPersons;
}

async function createVehicles(userId: mongoose.Types.ObjectId) {
  console.log('Creating vehicles...');
  
  const makes = ['Toyota', 'Honda', 'Ford', 'Volkswagen', 'Hyundai', 'Nissan', 'Mazda', 'Subaru', 'Kia', 'Chevrolet'];
  const models: { [key: string]: string[] } = {
    'Toyota': ['Camry', 'Corolla', 'RAV4', 'Prius', 'Highlander'],
    'Honda': ['Civic', 'Accord', 'CR-V', 'Pilot', 'Insight'],
    'Ford': ['Escape', 'Focus', 'Fusion', 'Explorer', 'F-150'],
    'Volkswagen': ['Jetta', 'Passat', 'Tiguan', 'Atlas', 'Golf'],
    'Hyundai': ['Elantra', 'Sonata', 'Tucson', 'Santa Fe', 'Veloster'],
    'Nissan': ['Altima', 'Sentra', 'Rogue', 'Pathfinder', 'Maxima'],
    'Mazda': ['Mazda3', 'Mazda6', 'CX-5', 'CX-9', 'MX-5'],
    'Subaru': ['Impreza', 'Legacy', 'Outback', 'Forester', 'Crosstrek'],
    'Kia': ['Optima', 'Forte', 'Sportage', 'Sorento', 'Stinger'],
    'Chevrolet': ['Malibu', 'Cruze', 'Equinox', 'Tahoe', 'Silverado']
  };
  const colors = ['Silver', 'Blue', 'Red', 'White', 'Black', 'Gray', 'Green', 'Gold', 'Brown', 'Orange'];
  const bodyTypes = ['Sedan', 'SUV', 'Hatchback', 'Coupe', 'Wagon', 'Pickup', 'Convertible'];
  const transmissions = ['Automatic', 'Manual', 'CVT'];
  const fuelTypes = ['Petrol', 'Diesel', 'Hybrid', 'Electric'];
  const ownershipStatuses = ['InStock', 'Sold', 'NotOwned'];
  
  const vehicles = [];
  
  for (let i = 0; i < 25; i++) {
    const make = makes[i % makes.length];
    const model = models[make][i % models[make].length];
    const year = 2015 + (i % 9); // Years from 2015 to 2023
    const regNumber = `${String.fromCharCode(65 + (i % 26))}${String.fromCharCode(65 + ((i + 1) % 26))}${String.fromCharCode(65 + ((i + 2) % 26))}-${String(1000 + i).padStart(4, '0')}`;
    const vin = `${String(i + 1).padStart(2, '0')}${String.fromCharCode(65 + (i % 26))}${String(Math.floor(Math.random() * 1000000)).padStart(6, '0')}${String(i + 100000).padStart(6, '0')}`;
    
    vehicles.push({
      registrationNumber: regNumber,
      vin: vin,
      make: make,
      vehicleModel: model,
      year: year,
      engineCapacity: 1400 + (i * 100) % 2600, // Engine capacity between 1400cc and 4000cc
      color: colors[i % colors.length],
      mileage: 5000 + (i * 3000) % 150000, // Mileage between 5000 and 155000
      transmission: transmissions[i % transmissions.length],
      fuelType: fuelTypes[i % fuelTypes.length],
      bodyType: bodyTypes[i % bodyTypes.length],
      ownershipStatus: ownershipStatuses[i % ownershipStatuses.length],
      tags: [
        bodyTypes[i % bodyTypes.length].toLowerCase(),
        i % 3 === 0 ? 'reliable' : i % 3 === 1 ? 'fuel-efficient' : 'sporty',
        i % 4 === 0 ? 'family' : i % 4 === 1 ? 'compact' : i % 4 === 2 ? 'luxury' : 'economy'
      ],
      createdBy: userId,
      updatedBy: userId,
    });
  }

  const createdVehicles = await Vehicle.insertMany(vehicles);
  console.log(`Created ${createdVehicles.length} vehicles`);
  return createdVehicles;
}

async function createTransactions(
  vehicles: any[],
  persons: any[],
  userId: mongoose.Types.ObjectId
) {
  console.log('Creating transactions...');
  
  const transactions = [];
  const paymentMethods = ['Bank Transfer', 'Cash', 'Check', 'Card', 'Other'];
  const directions = ['IN', 'OUT'];
  
  // Create varied transactions for different vehicles
  for (let i = 0; i < 30; i++) {
    const vehicle = vehicles[i % vehicles.length];
    const person = persons[i % persons.length];
    const direction = directions[i % directions.length];
    const basePrice = 10000 + (i * 1000) + Math.floor(Math.random() * 20000);
    const vatAmount = Math.floor(basePrice * 0.1);
    const feeAmount = Math.floor(Math.random() * 500) + 100;
    const discountAmount = i % 5 === 0 ? Math.floor(Math.random() * 2000) : 0;
    const totalPrice = basePrice + vatAmount + feeAmount - discountAmount;
    
    // Generate date within last 12 months
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 12);
    const randomDate = new Date(startDate.getTime() + Math.random() * (new Date().getTime() - startDate.getTime()));
    
    const transaction: any = {
      vehicleId: vehicle._id,
      direction: direction,
      counterpartyId: person._id,
      date: randomDate,
      basePrice: basePrice,
      taxes: [{ name: 'VAT', amount: vatAmount }],
      fees: i % 3 === 0 ? [{ name: Math.random() > 0.5 ? 'Registration' : 'Inspection', amount: feeAmount }] : [],
      discount: discountAmount,
      totalPrice: totalPrice,
      payments: [],
      documents: [],
      notes: [
        'Excellent condition vehicle',
        'Minor cosmetic issues noted',
        'Fleet vehicle with service history',
        'Private sale, well maintained',
        'Dealer auction purchase',
        'Quick sale needed',
        'Regular customer transaction',
        'First-time buyer',
        'Trade-in deal',
        'Wholesale purchase'
      ][i % 10],
      createdBy: userId,
      updatedBy: userId,
    };
    
    // Generate payments (1-3 payments per transaction)
    const numPayments = Math.floor(Math.random() * 3) + 1;
    let remainingAmount = totalPrice;
    
    for (let j = 0; j < numPayments; j++) {
      const isLastPayment = j === numPayments - 1;
      const paymentAmount = isLastPayment ? remainingAmount : Math.floor(remainingAmount * (0.2 + Math.random() * 0.6));
      const paymentDate = new Date(randomDate);
      paymentDate.setDate(paymentDate.getDate() + j * 2); // Spread payments over a few days
      
      transaction.payments.push({
        method: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
        amount: paymentAmount,
        date: paymentDate,
        reference: `TXN${String(i * 10 + j + 1000).padStart(6, '0')}`,
      });
      
      remainingAmount -= paymentAmount;
    }
    
    transactions.push(transaction);
  }

  const createdTransactions = await Transaction.insertMany(transactions);
  console.log(`Created ${createdTransactions.length} transactions`);
  return createdTransactions;
}

async function createExpenses(
  vehicles: any[],
  persons: any[],
  userId: mongoose.Types.ObjectId
) {
  console.log('Creating expenses...');
  
  const categories = ['Service', 'Repair', 'Transport', 'Commission', 'Other'];
  const serviceDescriptions = [
    'Oil change and tune-up', 'Brake inspection and service', 'Tire rotation and balancing',
    'Engine diagnostic check', 'Air filter replacement', 'Transmission service',
    'Cooling system flush', 'Battery replacement', 'Spark plug replacement'
  ];
  const repairDescriptions = [
    'Brake pad replacement', 'Engine repair work', 'Transmission repair',
    'AC system repair', 'Electrical system fix', 'Suspension repair',
    'Paint touch-up work', 'Interior cleaning and repair', 'Windshield replacement'
  ];
  const otherDescriptions = [
    'Office supplies and stationery', 'Marketing materials', 'Insurance premium',
    'Facility rent payment', 'Utility bills', 'Professional services',
    'Equipment maintenance', 'Software subscription', 'Training and certification'
  ];
  
  const expenses = [];
  
  for (let i = 0; i < 25; i++) {
    const category = categories[i % categories.length];
    const vehicle = i % 3 === 0 ? vehicles[i % vehicles.length] : null; // Some expenses are not vehicle-specific
    const person = Math.random() > 0.5 ? persons[i % persons.length] : null; // Some expenses don't have payees
    
    // Generate date within last 12 months
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 12);
    const randomDate = new Date(startDate.getTime() + Math.random() * (new Date().getTime() - startDate.getTime()));
    
    let description;
    let amount;
    
    switch (category) {
      case 'Service':
        description = serviceDescriptions[i % serviceDescriptions.length];
        amount = 100 + Math.floor(Math.random() * 400); // $100-$500
        break;
      case 'Repair':
        description = repairDescriptions[i % repairDescriptions.length];
        amount = 200 + Math.floor(Math.random() * 800); // $200-$1000
        break;
      case 'Transport':
        description = 'Vehicle pickup and delivery';
        amount = 50 + Math.floor(Math.random() * 200); // $50-$250
        break;
      case 'Commission':
        description = `Sales commission for ${randomDate.toLocaleString('default', { month: 'long' })}`;
        amount = 300 + Math.floor(Math.random() * 1200); // $300-$1500
        break;
      default:
        description = otherDescriptions[i % otherDescriptions.length];
        amount = 50 + Math.floor(Math.random() * 300); // $50-$350
    }
    
    const expense = {
      category: category,
      description: description,
      amount: amount,
      date: randomDate,
      attachments: [],
      createdBy: userId,
      updatedBy: userId,
    };
    
    // Add vehicleId if it's a vehicle-specific expense
    if (vehicle && ['Service', 'Repair', 'Transport'].includes(category)) {
      (expense as any).vehicleId = vehicle._id;
    }
    
    // Add payeeId if there's a payee
    if (person && Math.random() > 0.3) {
      (expense as any).payeeId = person._id;
    }
    
    expenses.push(expense);
  }

  const createdExpenses = await Expense.insertMany(expenses);
  console.log(`Created ${createdExpenses.length} expenses`);
  return createdExpenses;
}

async function createActivityLogs(
  users: any[],
  persons: any[],
  vehicles: any[],
  transactions: any[],
  expenses: any[]
) {
  console.log('Creating activity logs...');
  
  const actions = ['CREATE', 'UPDATE', 'DELETE', 'RESTORE', 'LOGIN', 'LOGOUT'];
  const entityTypes = ['Person', 'Vehicle', 'Transaction', 'Expense'];
  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  ];
  const ips = ['192.168.1.100', '192.168.1.101', '192.168.1.102', '10.0.0.50', '10.0.0.51'];
  
  const activityLogs = [];
  const allEntities: { [key: string]: any[] } = {
    'Person': persons,
    'Vehicle': vehicles,
    'Transaction': transactions,
    'Expense': expenses
  };
  
  for (let i = 0; i < 30; i++) {
    const actor = users[i % users.length];
    const action = actions[i % actions.length];
    const entityType = entityTypes[i % entityTypes.length];
    const entities = allEntities[entityType];
    const entity = entities[i % entities.length];
    
    // Generate date within last 6 months
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 6);
    const randomDate = new Date(startDate.getTime() + Math.random() * (new Date().getTime() - startDate.getTime()));
    
    const activityLog: any = {
      actorId: actor._id,
      action: action,
      entity: {
        type: entityType,
        id: entity._id,
      },
      ip: ips[i % ips.length],
      userAgent: userAgents[i % userAgents.length],
      at: randomDate,
    };
    
    // Add diff for UPDATE actions
    if (action === 'UPDATE') {
      activityLog.diff = {
        before: { field: 'oldValue' },
        after: { field: 'newValue' }
      };
    }
    
    activityLogs.push(activityLog);
  }
  
  // Add some LOGIN/LOGOUT logs
  for (let i = 0; i < 20; i++) {
    const actor = users[i % users.length];
    const action = i % 2 === 0 ? 'LOGIN' : 'LOGOUT';
    
    // Generate date within last 30 days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    const randomDate = new Date(startDate.getTime() + Math.random() * (new Date().getTime() - startDate.getTime()));
    
    activityLogs.push({
      actorId: actor._id,
      action: action,
      entity: {
        type: 'User',
        id: actor._id,
      },
      ip: ips[i % ips.length],
      userAgent: userAgents[i % userAgents.length],
      at: randomDate,
    });
  }
  
  const createdActivityLogs = await ActivityLog.insertMany(activityLogs);
  console.log(`Created ${createdActivityLogs.length} activity logs`);
  return createdActivityLogs;
}

async function seed() {
  try {
    console.log('🌱 Starting database seeding...');
    
    await connectDB();
    
    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Person.deleteMany({});
    await Vehicle.deleteMany({});
    await Transaction.deleteMany({});
    await Expense.deleteMany({});
    await ActivityLog.deleteMany({});
    
    // Create seed data
    const users = await createUsers();
    const adminUser = users[0];
    
    const persons = await createPersons(adminUser._id as any);
    const vehicles = await createVehicles(adminUser._id as any);
    const transactions = await createTransactions(vehicles, persons, adminUser._id as any);
    const expenses = await createExpenses(vehicles, persons, adminUser._id as any);
    const activityLogs = await createActivityLogs(users, persons, vehicles, transactions, expenses);
    
    console.log('✅ Database seeding completed successfully!');
    console.log('📊 Summary:');
    console.log(`   - ${users.length} users created`);
    console.log(`   - ${persons.length} persons created`);
    console.log(`   - ${vehicles.length} vehicles created`);
    console.log(`   - ${transactions.length} transactions created`);
    console.log(`   - ${expenses.length} expenses created`);
    console.log(`   - ${activityLogs.length} activity logs created`);
    console.log('');
    console.log('🔑 Login credentials:');
    console.log('   Admin: admin@example.com / password123');
    console.log('   Manager: manager@example.com / password123');
    console.log('   Clerk: clerk@example.com / password123');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

seed();