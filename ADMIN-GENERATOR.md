# Admin Generator Tools

This project includes multiple admin generation tools to help you create and manage admin users easily.

## 🚀 Available Tools

### 1. **Interactive Admin Generator** (Recommended)
The most comprehensive tool with a full menu system.

```bash
npm run admin:generator
```

**Features:**
- Interactive menu system
- Create admin with custom details
- Create admin with auto-generated password
- Create multiple admins at once
- List all admin users
- Delete admin users
- Full validation and error handling

### 2. **Simple Admin Creator**
Basic interactive tool for creating a single admin.

```bash
npm run admin:create
```

**Features:**
- Simple step-by-step process
- Password confirmation
- Email validation
- Duplicate user checking

### 3. **Quick Admin Creator**
Fast command-line tool for quick admin creation.

```bash
npm run admin:quick <email> <name> [password]
```

**Examples:**
```bash
# Create admin with auto-generated password
npm run admin:quick admin@example.com "John Doe"

# Create admin with custom password
npm run admin:quick admin@example.com "John Doe" mypassword123
```

## 📋 Usage Examples

### Interactive Generator Menu
```
🔧 Admin Generator Menu
======================
1. Create admin with custom details
2. Create admin with auto-generated password
3. Create multiple admins
4. List all admin users
5. Delete admin user
6. Exit
======================
Select an option (1-6):
```

### Quick Admin Creation
```bash
# Generate admin with random password
npm run admin:quick admin@travel.com "Travel Admin"

# Output:
🚀 Creating admin user...
📧 Email: admin@travel.com
👤 Name: Travel Admin
🔐 Generated password: K8m#nP9$vL2q
⚠️  Please save this password securely!

✅ Admin user created successfully!
📋 Admin Details:
   ID: 123e4567-e89b-12d3-a456-426614174000
   Name: Travel Admin
   Email: admin@travel.com
   Role: ADMIN
   Created: 2024-01-15T10:30:00.000Z

🔐 You can now login with these credentials at /auth/login
```

## 🔐 Security Features

### Password Generation
- **Auto-generated passwords** are 12 characters long
- Include uppercase, lowercase, numbers, and special characters
- Generated using cryptographically secure random selection

### Validation
- **Email validation** using regex pattern
- **Password strength** requirements (minimum 6 characters)
- **Duplicate user checking** to prevent conflicts
- **Input sanitization** and validation

### Password Security
- All passwords are **hashed using bcrypt** with salt rounds of 10
- Passwords are never stored in plain text
- Auto-generated passwords are displayed only once

## 🛠️ Technical Details

### Scripts Location
- `src/scripts/admin-generator.ts` - Full interactive generator
- `src/scripts/create-admin.ts` - Simple admin creator
- `src/scripts/quick-admin.ts` - Quick command-line tool

### Dependencies
- Uses NestJS application context for database access
- Integrates with existing UsersService
- Leverages existing validation and security features

### Database Integration
- Uses Prisma for database operations
- Integrates with existing User model
- Maintains data consistency with the rest of the application

## 🚨 Important Notes

### Environment Setup
Make sure your database is properly configured and the application can connect to it before running the admin generators.

### Password Management
- **Auto-generated passwords** are shown only once
- **Save passwords securely** - they cannot be retrieved later
- **Change passwords** after first login for security

### Admin Role
All generated users have the `ADMIN` role, which provides full access to the system.

## 🔧 Troubleshooting

### Common Issues

1. **Database Connection Error**
   ```
   ❌ Error: connect ECONNREFUSED
   ```
   **Solution:** Ensure your database is running and DATABASE_URL is correct

2. **User Already Exists**
   ```
   ❌ User with this email already exists!
   ```
   **Solution:** Use a different email or delete the existing user first

3. **Invalid Email Format**
   ```
   ❌ Please enter a valid email address!
   ```
   **Solution:** Use a proper email format (e.g., user@domain.com)

4. **Password Too Short**
   ```
   ❌ Password must be at least 6 characters long!
   ```
   **Solution:** Use a password with at least 6 characters

### Getting Help
If you encounter issues:
1. Check that all dependencies are installed
2. Verify database connection
3. Ensure environment variables are set correctly
4. Check the application logs for detailed error messages

## 📝 Best Practices

1. **Use Interactive Generator** for first-time setup
2. **Use Quick Generator** for subsequent admin creation
3. **Save generated passwords** immediately
4. **Change passwords** after first login
5. **Use strong passwords** for production environments
6. **Limit admin access** to trusted personnel only 