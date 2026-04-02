const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Certification = require('./models/Certification');

dotenv.config();

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Certification.deleteMany({});
    console.log('Cleared existing users and certifications.');

    // Create demo users
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@certapp.com',
      password: 'password123',
      role: 'admin',
    });
    console.log(`Created admin user: ${adminUser.email}`);

    const studentUser = await User.create({
      name: 'Student User',
      email: 'student@certapp.com',
      password: 'password123',
      role: 'user',
    });
    console.log(`Created student user: ${studentUser.email}`);

    // Create demo certifications for the student user
    const certifications = [
      {
        certName: 'AWS Certified Developer',
        issuer: 'Amazon Web Services',
        issueDate: new Date('2024-01-15'),
        expiryDate: new Date('2027-01-15'),
        userId: studentUser._id,
      },
      {
        certName: 'Google Cloud Associate',
        issuer: 'Google',
        issueDate: new Date('2024-03-20'),
        expiryDate: new Date('2026-03-20'),
        userId: studentUser._id,
      },
      {
        certName: 'Azure Fundamentals',
        issuer: 'Microsoft',
        issueDate: new Date('2023-06-10'),
        expiryDate: new Date('2025-06-10'),
        userId: studentUser._id,
      },
      {
        certName: 'Certified Kubernetes Admin',
        issuer: 'CNCF',
        issueDate: new Date('2024-08-01'),
        expiryDate: new Date('2027-08-01'),
        userId: studentUser._id,
      },
    ];

    await Certification.insertMany(certifications);
    console.log(`Created ${certifications.length} demo certifications.`);

    console.log('\nSeed completed successfully!');
    console.log('---');
    console.log('Demo Credentials:');
    console.log('  Admin  → admin@certapp.com / password123');
    console.log('  Student → student@certapp.com / password123');
    console.log('---');

    process.exit(0);
  } catch (error) {
    console.error(`Seed error: ${error.message}`);
    process.exit(1);
  }
};

seedDB();
