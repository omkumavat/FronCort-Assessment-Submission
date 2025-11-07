import { useEditor, EditorContent } from '@tiptap/react'
import { useEffect, useRef, useState } from 'react'
import Toolbar from './Toolbar'
import './editor.css'
import axios from 'axios'
import io from 'socket.io-client'
import { toast } from 'sonner'
import { getAuthName } from '../../lib/auth'
import StarterKit from "@tiptap/starter-kit"
import Underline from "@tiptap/extension-underline"
import Link from "@tiptap/extension-link"
import TextAlign from "@tiptap/extension-text-align"
import Highlight from "@tiptap/extension-highlight"
import Color from "@tiptap/extension-color"
import { TextStyle } from "@tiptap/extension-text-style"
import Placeholder from "@tiptap/extension-placeholder"
import { Table, TableRow, TableHeader, TableCell } from "@tiptap/extension-table"
import Mention from "@tiptap/extension-mention"
import { initUser } from '../../lib/auth'
import { connectSocket } from '../../services/socket'

const user = initUser()

// ✅ Socket setup
// const socket = io('https://froncort-assessment-submission.onrender.com', {
//   transports: ['websocket'],
// })

const Editor = ({ documentId, authName, initialContent, access: initialAccess, onChange }) => {
  const [access, setAccess] = useState(initialAccess)
  const [isSaving, setIsSaving] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const typingTimeoutRef = useRef(null)
  const socket=connectSocket();

  // ✅ Initialize TipTap Editor
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

      // ✅ Mention extension with highlight
      Mention.configure({
        HTMLAttributes: {
          class: 'mention text-blue-600 font-semibold bg-blue-50 px-1 rounded',
        },
        suggestion: {
          char: '@',
          items: (query) => {
            return getAuthName.filter(name =>
              name.toLowerCase().includes(query.toLowerCase())
            )
          },
          command: ({ editor, range, props }) => {
            editor
              .chain()
              .focus()
              .insertContentAt(range, [
                {
                  type: 'mention',
                  attrs: { label: props.label },
                },
                { type: 'text', text: ' ' },
              ])
              .run()

            toast.success(`You mentioned ${props.label}! 🎉`)
            socket.emit('mention', {
              by: user.name,
              mentionedUser: props.label,
              documentId,
            })
          },
        },
      }),
    ],
    content: initialContent || { type: "doc", content: [{ type: "paragraph" }] },
    editable: initialAccess === "write" || authName === user.name,
    autofocus: "end",

    // ✅ Detect manual mentions (space or newline)
    onUpdate: ({ editor }) => {
      setIsTyping(true)
      clearTimeout(typingTimeoutRef.current)
      typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 1000)

      const text = editor.getText()
      const mentionMatch = text.match(/@([A-Za-z0-9_-]+)[\s\n]/g)
      if (mentionMatch) {
        const lastMention = mentionMatch.at(-1).trim().replace('@', '')
        if (getAuthName.includes(`User-${lastMention}`) || getAuthName.includes(lastMention)) {
          // toast.info(`🔔 You mentioned ${lastMention}`)
          socket.emit('mention', {
            by: user.name,
            mentionedUser: lastMention,
            documentId,
          })
        }
      }

      const newContent = editor.getJSON()
      onChange?.(newContent)
      saveContent(newContent)
    },
  })

  // ✅ Handle receiving mentions
  useEffect(() => {
    socket.on('mention', ({ by, mentionedUser, documentId: docId }) => {
      if (mentionedUser === user.name && docId === documentId) {
        toast.info(`You were mentioned by ${by}`)
      }
    })
    return () => {
      socket.off('mention')
    }
  }, [documentId])

  // ✅ Fetch access level
  useEffect(() => {
    const fetchAccess = async () => {
      try {
        const res = await axios.get(
          `https://froncort-assessment-submission.onrender.com/server/pages/getpagebyid/${documentId}`
        )
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

  // ✅ Poll for external changes
  useEffect(() => {
    if (!editor) return
    const interval = setInterval(async () => {
      if (isTyping) return
      try {
        const res = await axios.get(
          `https://froncort-assessment-submission.onrender.com/server/pages/getpagebyid/${documentId}`
        )
        const latestContent = res.data.page?.content
        if (!latestContent) return

        const current = editor.getJSON()
        if (JSON.stringify(current) !== JSON.stringify(latestContent)) {
          editor.commands.setContent(latestContent, false)
        }
      } catch (err) {
        console.error("Failed to fetch latest content:", err)
      }
    }, 2000)
    return () => clearInterval(interval)
  }, [editor, documentId, isTyping])

  // ✅ Auto-save
  const saveContent = async (content) => {
    if (!content) return
    try {
      setIsSaving(true)
      await axios.put(
        `https://froncort-assessment-submission.onrender.com/server/pages/update/${documentId}`,
        {
          content,
          name: user.name,
          avatar: user.avatar,
        }
      )
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

      {/* Editor content */}
      <div className="editor-container px-2 sm:px-4 md:px-6 py-4 min-h-[300px] sm:min-h-[400px] md:min-h-[500px] overflow-auto">
        <EditorContent editor={editor} className="editor-content min-h-[200px]" />
      </div>

    </div>
  )
}

export default Editor
