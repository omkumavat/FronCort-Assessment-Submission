// models/Activity.js
import mongoose from 'mongoose'

const activitySchema = new mongoose.Schema({
  userName: { type: String, required: true },
  avatarUrl: { type: String, required: true },
  target: { type: String ,required: true},
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  // userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  actionType: {
    type: String,
    // enum: ['page_edit', 'page_create', 'card_move', 'card_update', 'mention', 'assign'],
    required: true
  },
}, { timestamps: true })

export default mongoose.model('Activity', activitySchema)
