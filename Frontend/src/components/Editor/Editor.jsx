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
import { connectSocket, getSocket, joinDocument, sendDocumentUpdate } from '../../services/socket'
import { initUser } from '../../lib/auth'

const user = initUser()

const Editor = ({ documentId, authName, initialContent, access: initialAccess, onChange }) => {
  const socketRef = useRef(null)
  const [access, setAccess] = useState(initialAccess)
  const [activeCursors, setActiveCursors] = useState([])
  const [isSaving, setIsSaving] = useState(false)

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
      if (access !== "write" && authName !== user.name) {
        toast.error("You don’t have write access!")
        return
      }
      const newContent = editor.getJSON()
      onChange?.(newContent)
      sendDocumentUpdate(documentId, newContent)
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

  // Socket.io collaboration
  useEffect(() => {
    if (!editor) return
    const socket = getSocket() || connectSocket()
    socketRef.current = socket
    joinDocument(documentId, user.name)

    socket.on('document-update', ({ documentId: id, update }) => {
      if (id !== documentId) return
      const current = editor.getJSON()
      if (JSON.stringify(current) !== JSON.stringify(update)) {
        editor.commands.setContent(update, false)
      }
    })

    socket.on('cursor-update', ({ documentId: id, user: u }) => {
      if (id !== documentId || u.name === user.name) return
      setActiveCursors(prev => [...prev.filter(c => c.name !== u.name), u])
    })

    return () => {
      socket.off('document-update')
      socket.off('cursor-update')
    }
  }, [editor, documentId])

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

      {/* Active cursors */}
      <div className="absolute top-16 right-2 flex flex-col gap-1 z-20">
        {activeCursors.map(c => (
          <div key={c.name} className="flex items-center gap-2 bg-white/90 rounded-full shadow px-2 py-1 border text-xs sm:text-sm md:text-base">
            {c.avatar && <img src={c.avatar} className="w-4 h-4 sm:w-5 sm:h-5 rounded-full" />}
            <span>{c.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Editor
