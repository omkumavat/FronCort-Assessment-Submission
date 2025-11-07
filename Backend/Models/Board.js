// models/Board.js
import mongoose from 'mongoose'

const boardSchema = new mongoose.Schema({
  creator:{type: String, required: true},
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  name: { type: String, default: 'Default Board' },
  cards: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Card' }],
}, { timestamps: true })

export default mongoose.model('Board', boardSchema)
