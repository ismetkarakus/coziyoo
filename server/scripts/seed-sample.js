const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });
dotenv.config();

console.log('DB-only mode enabled: JSON seed files were removed.');
console.log('Use your API/database migration flow to create sample data.');
