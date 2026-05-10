import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UsersService } from '../users/users.service';
import { CreateUserDto, UserRole } from '../users/dto/create-user.dto';
import * as readline from 'readline';
import * as crypto from 'crypto';

interface AdminUser {
  email: string;
  name: string;
  password: string;
  role: UserRole;
}

class AdminGenerator {
  private app: any;
  private usersService: UsersService;
  private rl: readline.Interface;

  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  private question(query: string): Promise<string> {
    return new Promise((resolve) => {
      this.rl.question(query, resolve);
    });
  }

  private async initialize() {
    this.app = await NestFactory.createApplicationContext(AppModule);
    this.usersService = this.app.get(UsersService);
  }

  private generateRandomPassword(length: number = 12): string {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  }

  private validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private async showMenu(): Promise<string> {
    console.log('\n🔧 Admin Generator Menu');
    console.log('======================');
    console.log('1. Create admin with custom details');
    console.log('2. Create admin with auto-generated password');
    console.log('3. Create multiple admins');
    console.log('4. List all admin users');
    console.log('5. Delete admin user');
    console.log('6. Exit');
    console.log('======================');
    
    return this.question('Select an option (1-6): ');
  }

  private async createCustomAdmin(): Promise<void> {
    console.log('\n👤 Create Custom Admin');
    console.log('=====================');

    const email = await this.question('Enter admin email: ');
    const name = await this.question('Enter admin name: ');
    const password = await this.question('Enter admin password (min 6 characters): ');
    const confirmPassword = await this.question('Confirm admin password: ');

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

    if (!this.validateEmail(email)) {
      console.log('❌ Please enter a valid email address!');
      return;
    }

    await this.createAdmin({ email, name, password, role: UserRole.ADMIN });
  }

  private async createAutoAdmin(): Promise<void> {
    console.log('\n🤖 Create Admin with Auto-Generated Password');
    console.log('==========================================');

    const email = await this.question('Enter admin email: ');
    const name = await this.question('Enter admin name: ');

    if (!email || !name) {
      console.log('❌ Email and name are required!');
      return;
    }

    if (!this.validateEmail(email)) {
      console.log('❌ Please enter a valid email address!');
      return;
    }

    const password = this.generateRandomPassword();
    console.log(`\n🔐 Generated password: ${password}`);
    console.log('⚠️  Please save this password securely!');

    await this.createAdmin({ email, name, password, role: UserRole.ADMIN });
  }

  private async createMultipleAdmins(): Promise<void> {
    console.log('\n👥 Create Multiple Admins');
    console.log('========================');

    const countStr = await this.question('How many admins to create? ');
    const count = parseInt(countStr);

    if (isNaN(count) || count < 1 || count > 10) {
      console.log('❌ Please enter a valid number between 1 and 10!');
      return;
    }

    const admins: AdminUser[] = [];

    for (let i = 1; i <= count; i++) {
      console.log(`\n--- Admin ${i} ---`);
      const email = await this.question(`Enter email for admin ${i}: `);
      const name = await this.question(`Enter name for admin ${i}: `);
      
      if (!email || !name) {
        console.log('❌ Email and name are required!');
        continue;
      }

      if (!this.validateEmail(email)) {
        console.log('❌ Please enter a valid email address!');
        continue;
      }

      const password = this.generateRandomPassword();
      admins.push({ email, name, password, role: UserRole.ADMIN });
    }

    console.log('\n⏳ Creating admin users...');
    let successCount = 0;

    for (const admin of admins) {
      try {
        await this.createAdmin(admin);
        successCount++;
      } catch (error) {
        console.log(`❌ Failed to create admin ${admin.email}: ${error.message}`);
      }
    }

    console.log(`\n✅ Successfully created ${successCount} out of ${admins.length} admin users.`);
  }

  private async listAdmins(): Promise<void> {
    console.log('\n📋 Admin Users List');
    console.log('==================');

    try {
      const users = await this.usersService.findAll();
      const admins = users.filter(user => user.role === UserRole.ADMIN);

      if (admins.length === 0) {
        console.log('No admin users found.');
        return;
      }

      admins.forEach((admin, index) => {
        console.log(`\n${index + 1}. Admin Details:`);
        console.log(`   ID: ${admin.id}`);
        console.log(`   Name: ${admin.name}`);
        console.log(`   Email: ${admin.email}`);
        console.log(`   Role: ${admin.role}`);
        console.log(`   Created: ${admin.createdAt}`);
      });
    } catch (error) {
      console.log('❌ Error fetching admin users:', error.message);
    }
  }

  private async deleteAdmin(): Promise<void> {
    console.log('\n🗑️  Delete Admin User');
    console.log('===================');

    try {
      const users = await this.usersService.findAll();
      const admins = users.filter(user => user.role === UserRole.ADMIN);

      if (admins.length === 0) {
        console.log('No admin users found to delete.');
        return;
      }

      console.log('\nAvailable admin users:');
      admins.forEach((admin, index) => {
        console.log(`${index + 1}. ${admin.name} (${admin.email})`);
      });

      const choiceStr = await this.question('\nSelect admin to delete (number): ');
      const choice = parseInt(choiceStr) - 1;

      if (isNaN(choice) || choice < 0 || choice >= admins.length) {
        console.log('❌ Invalid selection!');
        return;
      }

      const adminToDelete = admins[choice];
      const confirm = await this.question(`\nAre you sure you want to delete ${adminToDelete.name} (${adminToDelete.email})? (yes/no): `);

      if (confirm.toLowerCase() === 'yes' || confirm.toLowerCase() === 'y') {
        await this.usersService.delete(adminToDelete.id);
        console.log('✅ Admin user deleted successfully!');
      } else {
        console.log('❌ Deletion cancelled.');
      }
    } catch (error) {
      console.log('❌ Error deleting admin user:', error.message);
    }
  }

  private async createAdmin(adminData: AdminUser): Promise<void> {
    try {
      // Check if user already exists
      const existingUser = await this.usersService.findByEmail(adminData.email);
      if (existingUser) {
        console.log('❌ User with this email already exists!');
        return;
      }

      const admin = await this.usersService.create(adminData);

      console.log('\n✅ Admin user created successfully!');
      console.log('📋 Admin Details:');
      console.log(`   ID: ${admin.id}`);
      console.log(`   Name: ${admin.name}`);
      console.log(`   Email: ${admin.email}`);
      console.log(`   Role: ${admin.role}`);
      console.log(`   Created: ${admin.createdAt}`);
      
      if (adminData.password) {
        console.log(`   Password: ${adminData.password}`);
        console.log('⚠️  Please save this password securely!');
      }
      
      console.log('\n🔐 You can now login with these credentials at /auth/login');
    } catch (error) {
      console.log('❌ Error creating admin user:', error.message);
    }
  }

  async run(): Promise<void> {
    try {
      await this.initialize();
      
      console.log('🚀 Welcome to Admin Generator!');
      console.log('==============================');

      while (true) {
        const choice = await this.showMenu();

        switch (choice) {
          case '1':
            await this.createCustomAdmin();
            break;
          case '2':
            await this.createAutoAdmin();
            break;
          case '3':
            await this.createMultipleAdmins();
            break;
          case '4':
            await this.listAdmins();
            break;
          case '5':
            await this.deleteAdmin();
            break;
          case '6':
            console.log('\n👋 Goodbye!');
            return;
          default:
            console.log('❌ Invalid option! Please select 1-6.');
        }
      }
    } catch (error) {
      console.error('❌ Error:', error.message);
    } finally {
      this.rl.close();
      if (this.app) {
        await this.app.close();
      }
    }
  }
}

// Run the admin generator
const generator = new AdminGenerator();
generator.run().catch(console.error); 