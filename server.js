app.use(express.static('public'));
const express = require('express');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const USERS_FILE = path.join(__dirname, 'users.json');

// Utility to read users file
function readUsers() {
  try {
    const data = fs.readFileSync(USERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return {};
  }
}

// Utility to write users file
function writeUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
}

// Registration endpoint
app.post('/api/register', async (req, res) => {
  const { name, email, password, interests } = req.body;
  if (!name || !email || !password || !Array.isArray(interests)) {
    return res.status(400).json({ message: 'Missing required fields or invalid interests.' });
  }

  let users = readUsers();

  if (users[email]) {
    return res.status(409).json({ message: 'User with this email already exists.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    users[email] = {
      name,
      email,
      password: hashedPassword,
      interests,
      createdAt: new Date().toISOString()
    };
    writeUsers(users);
    return res.status(201).json({ message: 'User registered successfully.' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error during registration.' });
  }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Missing email or password.' });
  }
  let users = readUsers();

  const user = users[email];
  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  try {
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }
    // Return basic user data except password
    const { password: pw, ...userInfo } = user;
    return res.json({ message: 'Login successful', user: userInfo });
  } catch (err) {
    return res.status(500).json({ message: 'Server error during login.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

