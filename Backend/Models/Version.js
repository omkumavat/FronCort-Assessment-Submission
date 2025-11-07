import mongoose from 'mongoose';
import Page from './Page.js';

const pageVersionSchema = new mongoose.Schema({
  pageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Page',
    required: true,
  },
  content: {
    type: Object,
    required: true,
  },
  editedBy: {
    type: String, // store username or userId
    required: true,
  },
  avatarUrl: {
    type: String,
    required: false,
  },
},{ timestamps: true });

export default mongoose.model('PageVersion', pageVersionSchema);
