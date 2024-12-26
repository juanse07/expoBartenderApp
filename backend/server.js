const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 8888;

// Enable CORS with more specific options
app.use(cors({
  origin: '*', // Be more specific in production
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// MongoDB Connection
if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI is not defined in environment variables');
  process.exit(1);
}

console.log('Attempting to connect to MongoDB...');
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Successfully connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

const connection = mongoose.connection;
connection.once('open', () => {
  console.log('MongoDB connection established successfully');
});

// Add error handler
connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

// Define Schema
const quotationSchema = new mongoose.Schema({
  clientName: String,
  email: String,
  phone: String,
  address: String,
  serviceType: String,
  startTime: String,
  endTime: String,
  numberOfRooms: Number,
  squareFootage: Number,
  notes: String,
}, {
  timestamps: true,
  collection: 'barservicequotations'
});

const Quotation = mongoose.model('barservicequotations', quotationSchema, 'barservicequotations');

// Test endpoint
app.get('/test', (req, res) => {
  res.json({ message: 'Server is running!' });
});

// Route to get all quotations
app.get('/api/quotations', async (req, res) => {
  console.log('Received request for quotations');
  try {
    const quotations = await Quotation.find().lean();
    console.log('Found quotations:', quotations.length);
    console.log('Sample quotation:', quotations[0]);
    res.json(quotations);
  } catch (error) {
    console.error('Error fetching quotations:', error);
    res.status(500).json({ message: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});