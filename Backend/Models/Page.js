// models/Page.js
import mongoose from 'mongoose'

const pageSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: false },
  title: { type: String, required: true },
  content: { type: Object, required: true }, // Tiptap JSON content
  authorId: { type:String, required: true },
  // parentPage: { type: mongoose.Schema.Types.ObjectId, ref: 'Page' }, // for nested pages
  breadcrumbs: [{ type: String }], // e.g. ["Docs", "Sprint 1"]
  tags: [{ type: String }],
  accessList: [
      {userName: { type: String, required: true },
      avatarUrl: { type: String }}
    ],
  isPublished: { type: Boolean, default: true },
  isStandalone: { type: Boolean, default: false },
  access: { type: String, enum: ['read', 'write'], default: 'write' }, // global page access
  // pageId: { type: String, unique: true }, // unique identifier for the shareable link
}, { timestamps: true })

export default mongoose.model('Page', pageSchema)
