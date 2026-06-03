require('dotenv').config({ path: '.env.local' });
console.log('EMAIL:', `'${process.env.TEST_EMAIL}'`);
console.log('PASSWORD:', `'${process.env.TEST_PASSWORD}'`);
