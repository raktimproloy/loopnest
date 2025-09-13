const nodemailer = require('nodemailer').default || require('nodemailer');
require('dotenv').config();

// Email Diagnostic Tool for LoopNest
console.log('🔍 LoopNest Email Diagnostic Tool\n');

// Check environment variables
console.log('📋 Environment Variables Check:');
console.log('SMTP_HOST:', process.env.SMTP_HOST || '❌ NOT SET');
console.log('SMTP_PORT:', process.env.SMTP_PORT || '❌ NOT SET');
console.log('SMTP_USER:', process.env.SMTP_USER || '❌ NOT SET');
console.log('SMTP_PASS:', process.env.SMTP_PASS ? '✅ SET' : '❌ NOT SET');

// Test different SMTP configurations
const testConfigs = [
  {
    name: 'Gmail Configuration',
    config: {
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    }
  },
  {
    name: 'Gmail SSL Configuration',
    config: {
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    }
  },
  {
    name: 'Outlook Configuration',
    config: {
      host: 'smtp-mail.outlook.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    }
  },
  {
    name: 'Yahoo Configuration',
    config: {
      host: 'smtp.mail.yahoo.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    }
  }
];

async function testSMTPConfig(config, configName) {
  console.log(`\n🧪 Testing ${configName}:`);
  
  try {
    const transporter = nodemailer.createTransport(config);
    
    // Verify connection
    console.log('  🔌 Verifying SMTP connection...');
    await transporter.verify();
    console.log('  ✅ Connection verified successfully!');
    
    // Test sending email
    console.log('  📧 Testing email send...');
    const testEmail = {
      from: `"LoopNest Test" <${config.auth.user}>`,
      to: config.auth.user, // Send to self for testing
      subject: 'LoopNest Email Test',
      text: 'This is a test email from LoopNest diagnostic tool.',
      html: `
        <h2>LoopNest Email Test</h2>
        <p>This is a test email from LoopNest diagnostic tool.</p>
        <p><strong>Configuration:</strong> ${configName}</p>
        <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
      `
    };
    
    const result = await transporter.sendMail(testEmail);
    console.log('  ✅ Test email sent successfully!');
    console.log('  📧 Message ID:', result.messageId);
    console.log('  📬 Response:', result.response);
    
    return { success: true, configName, messageId: result.messageId };
    
  } catch (error) {
    console.log('  ❌ Failed:', error.message);
    console.log('  🔍 Error Code:', error.code || 'N/A');
    console.log('  📋 Error Response:', error.response || 'N/A');
    
    return { success: false, configName, error: error.message };
  }
}

async function runDiagnostics() {
  console.log('\n🚀 Starting SMTP Configuration Tests...\n');
  
  const results = [];
  
  for (const testConfig of testConfigs) {
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      const result = await testSMTPConfig(testConfig.config, testConfig.name);
      results.push(result);
      
      // Wait 2 seconds between tests
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  // Summary
  console.log('\n📊 Test Results Summary:');
  console.log('='.repeat(50));
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  if (successful.length > 0) {
    console.log('\n✅ Working Configurations:');
    successful.forEach(result => {
      console.log(`  • ${result.configName}`);
      console.log(`    Message ID: ${result.messageId}`);
    });
  }
  
  if (failed.length > 0) {
    console.log('\n❌ Failed Configurations:');
    failed.forEach(result => {
      console.log(`  • ${result.configName}: ${result.error}`);
    });
  }
  
  // Recommendations
  console.log('\n💡 Recommendations:');
  
  if (successful.length === 0) {
    console.log('  🔧 No working configurations found. Please check:');
    console.log('     • Your email credentials are correct');
    console.log('     • You have enabled "Less secure app access" for Gmail');
    console.log('     • You are using App Password for Gmail (not regular password)');
    console.log('     • Your ISP is not blocking SMTP ports');
    console.log('     • Your firewall allows outbound SMTP connections');
  } else {
    console.log('  ✅ Use one of the working configurations in your .env file');
    console.log('  📧 Check your email inbox for test messages');
  }
  
  console.log('\n📚 Common Solutions:');
  console.log('  • Gmail: Enable 2FA and use App Password');
  console.log('  • Outlook: Use your regular password');
  console.log('  • Yahoo: Generate App Password in account settings');
  console.log('  • Custom SMTP: Contact your hosting provider');
  
  console.log('\n🔗 Helpful Links:');
  console.log('  • Gmail App Passwords: https://support.google.com/accounts/answer/185833');
  console.log('  • Outlook SMTP: https://support.microsoft.com/en-us/office/pop-imap-and-smtp-settings-for-outlook-com-d088b986-291d-42b8-9564-9c414e2aa040');
  console.log('  • Yahoo SMTP: https://help.yahoo.com/kb/SLN4075.html');
}

// Run diagnostics
runDiagnostics().catch(console.error);
