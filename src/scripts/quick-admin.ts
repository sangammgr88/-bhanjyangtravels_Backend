import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UsersService } from '../users/users.service';
import { CreateUserDto, UserRole } from '../users/dto/create-user.dto';

async function createQuickAdmin() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log('🚀 Quick Admin Creator');
    console.log('======================');
    console.log('Usage: npm run admin:quick <email> <name> [password]');
    console.log('');
    console.log('Examples:');
    console.log('  npm run admin:quick admin@example.com "John Doe"');
    console.log('  npm run admin:quick admin@example.com "John Doe" mypassword123');
    console.log('');
    console.log('If password is not provided, a random one will be generated.');
    return;
  }

  const [email, name, password] = args;
  
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);

  try {
    console.log('🚀 Creating admin user...');
    console.log(`📧 Email: ${email}`);
    console.log(`👤 Name: ${name}`);

    // Generate random password if not provided
    const finalPassword = password || generateRandomPassword();
    
    if (!password) {
      console.log(`🔐 Generated password: ${finalPassword}`);
      console.log('⚠️  Please save this password securely!');
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('❌ Invalid email address!');
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
      password: finalPassword,
      role: UserRole.ADMIN,
    };

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
    await app.close();
  }
}

function generateRandomPassword(length: number = 12): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

// Run the script
createQuickAdmin().catch(console.error); 