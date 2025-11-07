// models/Card.js
import mongoose from 'mongoose'

const cardSchema = new mongoose.Schema({
  creator:{type: String, required: true},
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  title: { type: String, required: true },
  description: { type: Object }, // rich-text / markdown content
  labels: [{ type: String }],
  // assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  dueDate: { type: Date },
  linkedPage: {
    pageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Page' },
    pageName: { type: String, require: true }
  }, // connects Kanban <-> Doc
  position: { type: Number, default: 0 },
  status: { type: String, enum: ['To Do', 'In Progress', 'Done'], default: 'To Do' }
}, { timestamps: true })

export default mongoose.model('Card', cardSchema)
