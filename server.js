const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const port = 3000;

// MongoDB connection
mongoose.connect('mongodb+srv://wesleyvillasin:twentyonepilots@cluster0.iovyxh9.mongodb.net/?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.error('MongoDB Connection Error:', err));

// Middleware
app.use(bodyParser.json());

// Models and Schemas
const { User, ServiceListing, Booking } = require('./models');

// Set your JWT secret key as an environment variable
const secretKey = process.env.JWT_SECRET || 'mySecretKey123';

// User Registration
app.post('/api/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error registering user' });
  }
});

// User Login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, secretKey, { expiresIn: '1h' });

    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Error logging in' });
  }
});

// Middleware for protecting routes
function verifyToken(req, res, next) {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  jwt.verify(token, secretKey, (err, decodedToken) => {
    if (err) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.userId = decodedToken.userId;
    next();
  });
}

// Create a Service Listing
app.post('/api/service-listing', verifyToken, async (req, res) => {
  try {
    const { title, description, price, location } = req.body;
    const serviceProvider = req.userId;
    const serviceListing = new ServiceListing({
      title,
      description,
      price,
      location,
      serviceProvider,
    });
    await serviceListing.save();
    res.status(201).json({ message: 'Service listing created successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error creating service listing' });
  }
});

// Book a Service Listing
app.post('/api/book/:serviceListingId', verifyToken, async (req, res) => {
  try {
    const { serviceListingId } = req.params;
    const { startDate, endDate } = req.body;
    const user = req.userId;

    const serviceListing = await ServiceListing.findById(serviceListingId);
    if (!serviceListing) {
      return res.status(404).json({ error: 'Service Listing not found' });
    }

    // Check if the service listing is available for booking (you can implement more complex availability logic here)
    if (!serviceListing.available) {
      return res.status(400).json({ error: 'Service Listing not available for booking' });
    }

    // Create a new booking
    const booking = new Booking({
      serviceListing: serviceListingId,
      user,
      startDate,
      endDate,
    });

    await booking.save();

    // Update service listing availability to false since it's now booked
    serviceListing.available = false;
    await serviceListing.save();

    res.status(201).json({ message: 'Service listing booked successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error booking service listing' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
