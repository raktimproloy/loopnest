const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setupEmailConfiguration() {
  console.log('🔧 LoopNest Email Setup Tool\n');
  console.log('This tool will help you configure email settings for LoopNest.\n');
  
  // Check if .env file exists
  const envPath = path.join(process.cwd(), '.env');
  let envExists = fs.existsSync(envPath);
  
  if (envExists) {
    console.log('📁 Found existing .env file');
    const overwrite = await question('Do you want to update the email configuration? (y/n): ');
    if (overwrite.toLowerCase() !== 'y') {
      console.log('Setup cancelled.');
      rl.close();
      return;
    }
  }
  
  console.log('\n📧 Email Provider Selection:');
  console.log('1. Gmail (Recommended for development)');
  console.log('2. Outlook/Hotmail');
  console.log('3. Yahoo');
  console.log('4. Custom SMTP Server');
  
  const provider = await question('\nSelect your email provider (1-4): ');
  
  let smtpConfig = {};
  
  switch (provider) {
    case '1':
      smtpConfig = {
        host: 'smtp.gmail.com',
        port: '587',
        instructions: [
          '1. Go to your Google Account settings',
          '2. Enable 2-Factor Authentication',
          '3. Generate an App Password',
          '4. Use your Gmail address and the App Password below'
        ]
      };
      break;
    case '2':
      smtpConfig = {
        host: 'smtp-mail.outlook.com',
        port: '587',
        instructions: [
          '1. Use your Outlook/Hotmail email address',
          '2. Use your regular Outlook password',
          '3. Make sure to use your full email address'
        ]
      };
      break;
    case '3':
      smtpConfig = {
        host: 'smtp.mail.yahoo.com',
        port: '587',
        instructions: [
          '1. Go to Yahoo Account Security settings',
          '2. Generate an App Password',
          '3. Use your Yahoo email address and the App Password below'
        ]
      };
      break;
    case '4':
      smtpConfig.host = await question('Enter SMTP host: ');
      smtpConfig.port = await question('Enter SMTP port (587 for TLS, 465 for SSL): ');
      smtpConfig.instructions = ['Use your custom SMTP server credentials'];
      break;
    default:
      console.log('Invalid selection. Please run the setup again.');
      rl.close();
      return;
  }
  
  console.log('\n📋 Setup Instructions:');
  smtpConfig.instructions.forEach(instruction => {
    console.log(`   ${instruction}`);
  });
  
  console.log('\n📝 Please provide the following information:');
  
  const smtpUser = await question(`Email address: `);
  const smtpPass = await question(`Password/App Password: `);
  
  // Read existing .env content or create new
  let envContent = '';
  if (envExists) {
    envContent = fs.readFileSync(envPath, 'utf8');
    
    // Remove existing SMTP settings
    envContent = envContent.replace(/SMTP_HOST=.*\n/g, '');
    envContent = envContent.replace(/SMTP_PORT=.*\n/g, '');
    envContent = envContent.replace(/SMTP_USER=.*\n/g, '');
    envContent = envContent.replace(/SMTP_PASS=.*\n/g, '');
  } else {
    // Create basic .env template
    envContent = `# LoopNest Backend Environment Variables
NODE_ENV=development
PORT=5000
BASE_URL=http://localhost:5000

# Database Configuration
DATABASE_URL=your_mongodb_connection_string_here

# JWT Secrets (Generate strong random strings)
JWT_SECRET=your_jwt_secret_key_here_minimum_32_characters
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_here_minimum_32_characters

`;
  }
  
  // Add SMTP configuration
  envContent += `
# SMTP Configuration
SMTP_HOST=${smtpConfig.host}
SMTP_PORT=${smtpConfig.port}
SMTP_USER=${smtpUser}
SMTP_PASS=${smtpPass}

# SMS Configuration (Optional)
SMS_API_KEY=your_sms_api_key_here
SMS_SENDER_ID=LoopNest
SMS_API_URL=http://bulksmsbd.net/api/smsapi
`;
  
  // Write .env file
  fs.writeFileSync(envPath, envContent);
  
  console.log('\n✅ Email configuration saved to .env file');
  console.log('\n🧪 Testing email configuration...');
  
  // Test the configuration
  try {
    const nodemailer = require('nodemailer');
    const dotenv = require('dotenv');
    
    // Reload environment variables
    dotenv.config();
    
    const testTransporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    
    console.log('🔌 Verifying SMTP connection...');
    await testTransporter.verify();
    console.log('✅ SMTP connection verified successfully!');
    
    console.log('\n🎉 Email setup completed successfully!');
    console.log('📧 You can now restart your server to use the new email configuration.');
    
  } catch (error) {
    console.log('\n❌ Email configuration test failed:');
    console.log(`   Error: ${error.message}`);
    console.log('\n🔧 Please check your credentials and try again.');
    console.log('   You can run this setup tool again to fix the configuration.');
  }
  
  rl.close();
}

setupEmailConfiguration().catch(console.error);
