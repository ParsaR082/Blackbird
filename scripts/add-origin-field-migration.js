/**
 * Migration script to add origin field to existing Event and CalendarEvent documents
 */

const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB connection string - use environment variable
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/blackbird';

// Simple schemas for migration purposes
const EventSchema = new mongoose.Schema({
  title: String,
  description: String,
  date: Date,
  time: String,
  duration: Number,
  location: String,
  category: String,
  origin: {
    type: String,
    default: 'manual',
    trim: true,
    maxlength: 50
  }
});

const CalendarEventSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  title: String,
  description: String,
  date: Date,
  time: String,
  origin: {
    type: String,
    default: 'manual',
    trim: true,
    maxlength: 50
  }
});

async function migrate() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected successfully to MongoDB');

    // Get models
    const Event = mongoose.models.Event || mongoose.model('Event', EventSchema);
    const CalendarEvent = mongoose.models.CalendarEvent || mongoose.model('CalendarEvent', CalendarEventSchema);

    // Get counts before migration
    const eventCount = await Event.countDocuments({});
    const calendarEventCount = await CalendarEvent.countDocuments({});
    console.log(`Found ${eventCount} events and ${calendarEventCount} calendar events`);

    // Count documents without origin field
    const eventsWithoutOrigin = await Event.countDocuments({ origin: { $exists: false } });
    const calendarEventsWithoutOrigin = await CalendarEvent.countDocuments({ origin: { $exists: false } });
    console.log(`Found ${eventsWithoutOrigin} events and ${calendarEventsWithoutOrigin} calendar events without origin field`);

    // Update events without origin field
    if (eventsWithoutOrigin > 0) {
      console.log('Updating events...');
      const eventResult = await Event.updateMany(
        { origin: { $exists: false } },
        { $set: { origin: 'manual' } }
      );
      console.log(`Updated ${eventResult.modifiedCount} events`);
    }

    // Update calendar events without origin field
    if (calendarEventsWithoutOrigin > 0) {
      console.log('Updating calendar events...');
      const calendarEventResult = await CalendarEvent.updateMany(
        { origin: { $exists: false } },
        { $set: { origin: 'manual' } }
      );
      console.log(`Updated ${calendarEventResult.modifiedCount} calendar events`);
    }

    // Create indexes if needed
    console.log('Ensuring indexes...');
    await Event.collection.createIndex({ origin: 1 });
    await CalendarEvent.collection.createIndex({ origin: 1 });
    await CalendarEvent.collection.createIndex({ userId: 1, origin: 1 });
    console.log('Indexes created');

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

migrate(); 