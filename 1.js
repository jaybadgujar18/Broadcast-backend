const mongoose = require('mongoose');

const uri = 'mongodb+srv://jaybadgujar:jaybadgujar@cluster0.ir0nuus.mongodb.net/';

mongoose.connect(uri);

const db = mongoose.connection;
db.on('connecting', () => console.log('Connecting to MongoDB...'));
db.on('connected', () => console.log('Connected to MongoDB'));
db.on('error', (err) => console.error('Connection error:', err));
db.on('disconnected', () => console.log('Disconnected from MongoDB'));

// Keep the script running
process.on('SIGINT', () => {
    mongoose.connection.close(() => {
        console.log('MongoDB connection closed');
        process.exit(0);
    });
});