// models/User.js
import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  avatar: { type: String },
  role: {
    type: String,
    enum: ['Owner', 'Admin', 'Editor', 'Viewer'],
    default: 'Viewer'
  },
  projects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }],
//   versions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Version', required: true }],
}, { timestamps: true })

export default mongoose.model('User', userSchema)
