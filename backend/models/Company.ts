import mongoose, { Schema } from 'mongoose';

// Company Schema
const companySchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  website: { type: String, required: true },
  logo: { type: String, default: '' },
  industry: { type: String, required: true },
  location: { type: String, required: true },
  scholarshipsPosted: { type: Number, default: 0 },
  totalFunding: { type: Number, default: 0 },
  walletAddress: { type: String, required: true },
  createdAt: { type: String, default: new Date().toISOString() }
});

// Create model
export const CompanyModel = mongoose.models.Company || mongoose.model('Company', companySchema);