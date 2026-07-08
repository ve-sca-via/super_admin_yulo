import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';
import { hashPassword } from '../services/auth.service.js';

const [, , email, password] = process.argv;

if (!email || !password) {
  console.log('Usage: node scripts/seedSuperAdmin.js <email> <password>');
  process.exit(1);
}

await mongoose.connect(process.env.MONGODB_URI);
console.log('✓ Connected');

const passwordHash = await hashPassword(password);

let admin = await User.findOne({ email });
if (admin) {
  admin.role = 'admin';
  await admin.save();
  console.log(`\n✓ Updated existing user to admin: ${admin.email} (${admin._id})`);
} else {
  admin = await User.create({
    name: 'Super Admin',
    email,
    passwordHash,
    role: 'admin',
    isActive: true,
  });
  console.log(`\n✓ Created admin: ${admin.email} (${admin._id})`);
}

await mongoose.disconnect();
