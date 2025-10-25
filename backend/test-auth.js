require('dotenv').config();
const jwt = require('jsonwebtoken');

console.log('\n🔍 Testing JWT Configuration...\n');

// Check if JWT_SECRET is set
if (!process.env.JWT_SECRET) {
    console.log('❌ JWT_SECRET is NOT set in .env file!');
    console.log('');
    console.log('Add this to your backend/.env file:');
    console.log('JWT_SECRET=your_secret_jwt_key_change_this_in_production_12345');
    process.exit(1);
}

console.log('✅ JWT_SECRET is set');
console.log('   Value:', process.env.JWT_SECRET);
console.log('');

// Create a test token
const testPayload = {
    adminId: 1,
    username: 'admin',
    role: 'SUPER_ADMIN'
};

try {
    const token = jwt.sign(testPayload, process.env.JWT_SECRET, { expiresIn: '7d' });
    console.log('✅ Test token generated successfully');
    console.log('   Token:', token.substring(0, 50) + '...');
    console.log('');
    
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token verification successful');
    console.log('   Decoded payload:', decoded);
    console.log('');
    
    console.log('✅ JWT configuration is working correctly!');
    console.log('');
    console.log('If you\'re still having auth issues:');
    console.log('1. Clear browser localStorage');
    console.log('2. Login again');
    console.log('3. Check browser console for errors');
    
} catch (error) {
    console.log('❌ JWT Error:', error.message);
}

process.exit(0);


