// models/Project.js
import mongoose from 'mongoose'

const projectSchema = new mongoose.Schema({
  creator: { type: String, required: true },
  // userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // role: { type: String, enum: ['Owner', 'Admin', 'Editor', 'Viewer'], default: 'Viewer' }
  title: { type: String, required: true },
  description: { type: String },
  // members: [memberSchema],
  access: { type: String, enum: ['read', 'write'], default: 'write' },
  pages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Page' }],
  boards: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Board' }],
  accessList: {
    type: Object, default: {
      card_create: "deny",
      card_edit: "deny",
      card_delete: "deny",
      board_create: "deny",
      board_delete: "deny",
      page_create: "deny",
      page_delete: "deny",
      link_page: "deny",
      card_move: "deny",
    }
  }
}, { timestamps: true })

export default mongoose.model('Project', projectSchema)
