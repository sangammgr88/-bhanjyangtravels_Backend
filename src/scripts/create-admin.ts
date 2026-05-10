import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UsersService } from '../users/users.service';
import { CreateUserDto, UserRole } from '../users/dto/create-user.dto';
import * as readline from 'readline';

async function createAdmin() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const question = (query: string): Promise<string> => {
    return new Promise((resolve) => {
      rl.question(query, resolve);
    });
  };

  try {
    console.log('🚀 Admin User Generator');
    console.log('=======================\n');

    // Get admin details
    const email = await question('Enter admin email: ');
    const name = await question('Enter admin name: ');
    const password = await question('Enter admin password (min 6 characters): ');
    const confirmPassword = await question('Confirm admin password: ');

    // Validation
    if (!email || !name || !password) {
      console.log('❌ All fields are required!');
      return;
    }

    if (password.length < 6) {
      console.log('❌ Password must be at least 6 characters long!');
      return;
    }

    if (password !== confirmPassword) {
      console.log('❌ Passwords do not match!');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('❌ Please enter a valid email address!');
      return;
    }

    // Check if user already exists
    const existingUser = await usersService.findByEmail(email);
    if (existingUser) {
      console.log('❌ User with this email already exists!');
      return;
    }

    // Create admin user
    const adminData: CreateUserDto = {
      email,
      name,
      password,
      role: UserRole.ADMIN,
    };

    console.log('\n⏳ Creating admin user...');
    const admin = await usersService.create(adminData);

    console.log('\n✅ Admin user created successfully!');
    console.log('📋 Admin Details:');
    console.log(`   ID: ${admin.id}`);
    console.log(`   Name: ${admin.name}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Role: ${admin.role}`);
    console.log(`   Created: ${admin.createdAt}`);
    console.log('\n🔐 You can now login with these credentials at /auth/login');

  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
  } finally {
    rl.close();
    await app.close();
  }
}

// Run the script
createAdmin().catch(console.error); 