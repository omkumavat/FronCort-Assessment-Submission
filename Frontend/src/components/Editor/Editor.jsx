import { useEditor, EditorContent } from '@tiptap/react'
import { useEffect, useRef, useState } from 'react'
import Toolbar from './Toolbar'
import './editor.css'
import axios from 'axios'
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import Color from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import Placeholder from "@tiptap/extension-placeholder";
import { Table, TableRow, TableHeader, TableCell } from "@tiptap/extension-table";
import { toast } from "sonner";
import { initUser } from '../../lib/auth'

const user = initUser()

const Editor = ({ documentId, authName, initialContent, access: initialAccess, onChange }) => {
  const [access, setAccess] = useState(initialAccess)
  const [isSaving, setIsSaving] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const typingTimeoutRef = useRef(null)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: true }),
      Highlight.configure({ multicolor: true }),
      TextStyle,
      Color,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder: "Start typing..." }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: initialContent || { type: "doc", content: [{ type: "paragraph" }] },
    editable: initialAccess === "write" || authName === user.name,
    autofocus: "end",
    onUpdate: ({ editor }) => {
      setIsTyping(true) // user is typing
      clearTimeout(typingTimeoutRef.current)
      typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 1000) // stop typing after 1s of inactivity

      const newContent = editor.getJSON()
      onChange?.(newContent)
      saveContent(newContent)
    },
  })

  // Fetch latest access from backend
  useEffect(() => {
    const fetchAccess = async () => {
      try {
        const res = await axios.get(`https://froncort-assessment-submission.onrender.com/server/pages/getpagebyid/${documentId}`)
        const pageAccess = res.data.page?.access === "write" ? "write" : "read"
        setAccess(pageAccess)
        const canEdit = pageAccess === "write" || authName === user.name
        if (editor) editor.setEditable(canEdit)
      } catch (err) {
        console.error("Failed to fetch access:", err)
      }
    }
    fetchAccess()
  }, [documentId, authName, editor])

  // Polling for latest content every 2 seconds
  useEffect(() => {
    if (!editor) return
    const interval = setInterval(async () => {
      try {
        const res = await axios.get(`https://froncort-assessment-submission.onrender.com/server/pages/getpagebyid/${documentId}`)
        const page = res.data.page
        if (!page) return

        // Update access dynamically
        const pageAccess = page.access === "write" ? "write" : "read"
        setAccess(pageAccess)
        const canEdit = pageAccess === "write" || authName === user.name
        editor.setEditable(canEdit)

        // Update content only if user is not typing
        if (!isTyping) {
          const latestContent = page.content
          const current = editor.getJSON()
          if (JSON.stringify(current) !== JSON.stringify(latestContent)) {
            editor.commands.setContent(latestContent, false)
            toast.info("Content updated from server")
          }
        }
      } catch (err) {
        console.error("Failed to fetch latest content:", err)
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [editor, documentId, isTyping])


  const saveContent = async (content) => {
    if (!content) return
    try {
      setIsSaving(true)
      await axios.put(`https://froncort-assessment-submission.onrender.com/server/pages/update/${documentId}`, {
        content,
        name: user.name,
        avatar: user.avatar,
      })
      setIsSaving(false)
    } catch (err) {
      console.error("Auto-save failed:", err.message)
      setIsSaving(false)
    }
  }

  if (!editor) return <div className="text-center py-4 text-gray-500">Loading editor...</div>

  return (
    <div className="relative flex flex-col border rounded-lg bg-white shadow-sm max-w-full mx-auto">

      {/* Toolbar */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <Toolbar editor={editor} />
      </div>

      {/* Saving indicator */}
      {isSaving && (
        <div className="absolute top-12 left-2 flex items-center gap-2 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium shadow-md animate-pulse">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></span>
          💾 Saving...
        </div>
      )}

      {/* Editor container */}
      <div className="editor-container px-2 sm:px-4 md:px-6 py-4 min-h-[300px] sm:min-h-[400px] md:min-h-[500px] overflow-auto">
        <EditorContent editor={editor} className="editor-content min-h-[200px] sm:min-h-[300px] md:min-h-[400px]" />
      </div>

    </div>
  )
}

export default Editor
