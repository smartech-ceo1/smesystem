const bcrypt = require('bcrypt');

const password = 'Admin123!';
const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) {
    console.error('Error generating hash:', err);
    return;
  }
  console.log('New hash:', hash);
});