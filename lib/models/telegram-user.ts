import mongoose from 'mongoose';

/**
 * Interface for TelegramUser document
 */
export interface ITelegramUser {
  _id?: string;
  telegramId: string; // Telegram user ID
  chatId: string; // Telegram chat ID
  userId?: string; // Blackbird user ID (optional, may be linked later)
  username?: string; // Telegram username (optional)
  firstName?: string; // Telegram first name (optional)
  lastName?: string; // Telegram last name (optional)
  linkToken?: string; // Token for linking with Blackbird account (optional)
  linkTokenExpiresAt?: Date; // When the link token expires (optional)
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Schema for TelegramUser
 */
const TelegramUserSchema = new mongoose.Schema({
  telegramId: {
    type: String,
    required: true,
    unique: true
  },
  chatId: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  username: {
    type: String,
    trim: true
  },
  firstName: {
    type: String,
    trim: true
  },
  lastName: {
    type: String,
    trim: true
  },
  linkToken: {
    type: String
  },
  linkTokenExpiresAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Create indexes for better performance
TelegramUserSchema.index({ telegramId: 1 });
TelegramUserSchema.index({ userId: 1 });
TelegramUserSchema.index({ linkToken: 1 });

/**
 * Export the TelegramUser model
 */
export const TelegramUser = mongoose.models.TelegramUser || mongoose.model('TelegramUser', TelegramUserSchema); 