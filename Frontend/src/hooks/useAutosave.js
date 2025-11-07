import { useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';

/**
 * useAutosave - Hook for auto-saving content
 * 
 * @param {*} content - Content to save
 * @param {Function} saveFn - Save function (async)
 * @param {number} delay - Delay in ms (default: 2000)
 * 
 * Usage:
 * useAutosave(editorContent, async (content) => {
 *   await saveDocument(docId, content);
 * }, 2000);
 */
const useAutosave = (content, saveFn, delay = 2000) => {
  const timeoutRef = useRef(null);
  const previousContentRef = useRef(content);

  useEffect(() => {
    // Don't save if content hasn't changed
    if (content === previousContentRef.current) {
      return;
    }

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(async () => {
      try {
        await saveFn(content);
        previousContentRef.current = content;
        toast.success('Saved', { duration: 1000 });
      } catch (error) {
        console.error('Autosave failed:', error);
        toast.error('Failed to save');
      }
    }, delay);

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [content, saveFn, delay]);

  return null;
};

export default useAutosave;
