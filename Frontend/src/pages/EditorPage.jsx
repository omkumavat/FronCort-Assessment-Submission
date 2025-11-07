import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Editor from '../components/Editor/Editor';
import {
  connectSocket,
  joinDocument,
  sendDocumentUpdate
} from '../services/socket';
import { toast } from "sonner";
import axios from 'axios';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Copy, Share2, Users, CheckCircle2, AlertTriangle, List, Link2 } from 'lucide-react';
import { initUser } from '../lib/auth';

const user = initUser();

const EditorPage = () => {
  const { pageId } = useParams();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);

  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [accessModalOpen, setAccessModalOpen] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [accessList, setAccessList] = useState([]);
  const [newAccess, setNewAccess] = useState('read');
  const [versionsModalOpen, setVersionsModalOpen] = useState(false);
  const [versions, setVersions] = useState([]);

  // -------------------- INITIAL LOAD --------------------
  useEffect(() => {
    const socket = connectSocket();
    const currentUser = user;

    axios
      .get(`https://froncort-assessment-submission.onrender.com/server/pages/getpagebyid/${pageId}`)
      .then((res) => {
        const fetchedPage = res.data.page;
        setPage(fetchedPage);
        setAccessList(fetchedPage.accessList || []);

        socket.emit("join-document", { pageId, user: currentUser });

        socket.on("document-update", (update) => {
          setPage((prev) => ({ ...prev, content: update }));
        });

        socket.on("user-joined", ({ user }) => {
          if (user.id !== currentUser.id) {
            toast.info(`${user.name} joined the page`, {
              icon: <Users className="text-blue-500" />,
            });
          }
        });

        socket.on("user-left", ({ user }) => {
          if (user.id !== currentUser.id) {
            toast(`${user.name} left the page`, {
              icon: <Users className="text-gray-400" />,
            });
          }
        });
      })
      .catch((err) => {
        toast.error(err.response?.data?.error || err.message, {
          icon: <AlertTriangle className="text-red-500" />,
        });
      })
      .finally(() => setLoading(false));

    return () => {
      socket.emit("user-left", { pageId, user: currentUser });
      socket.off("document-update");
      socket.off("user-joined");
      socket.off("user-left");
      socket.disconnect();
    };
  }, [pageId]);

  // -------------------- HANDLE CONTENT CHANGES --------------------
  const handleContentChange = (content) => {
    if (!page || page.access !== 'write') return;
    setPage((prev) => ({ ...prev, content }));
    sendDocumentUpdate(pageId, content);
  };

  // -------------------- SHARE MODAL --------------------
  const handleShare = () => {
    const link = `${window.location.origin}/editor/${pageId}`;
    setShareLink(link);
    setShareModalOpen(true);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink);
    toast.success('Link copied to clipboard', {
      icon: <Link2 className="text-green-500" />,
    });
  };

  // -------------------- ACCESS MANAGEMENT --------------------
  const handleOpenAccessModal = () => {
    setAccessModalOpen(true);
  };

  // Fetch versions
  const handleFetchVersions = async () => {
    try {
      const res = await axios.get(`https://froncort-assessment-submission.onrender.com/server/pages/fetch/versions/${pageId}`);
      setVersions(res.data.versions);
      setVersionsModalOpen(true);
    } catch (err) {
      toast.error("Failed to fetch versions");
    }
  };

  const handleAddUserAccess = async () => {
    setAccessModalOpen(false);
    try {
      await axios.put(
        `https://froncort-assessment-submission.onrender.com/server/pages/manage-access/${pageId}`,
        { access: newAccess }
      );
      toast.success('Access updated successfully', {
        icon: <CheckCircle2 className="text-green-500" />,
      });
    } catch (err) {
      toast.error('Failed to update access', {
        icon: <AlertTriangle className="text-red-500" />,
      });
    }
  };

  // -------------------- RENDER --------------------
  if (loading) return <div>Loading...</div>;
  if (!page) return <div>Page not found or access denied</div>;

  return (
    <div className="max-w-6xl mx-auto mt-4 px-2 sm:px-4 md:px-6 space-y-4">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold truncate">{page.title}</h1>

        <div className="flex flex-wrap sm:flex-row gap-2">
          {/* <Button
        onClick={handleFetchVersions}
        variant="outline"
        className="hover:bg-muted hover:text-foreground flex items-center gap-1 sm:gap-2 text-sm sm:text-base"
      >
        <List className="h-4 w-4 sm:h-5 sm:w-5" /> Versions
      </Button> */}
          <Button
            onClick={handleShare}
            variant="outline"
            className="hover:bg-muted hover:text-foreground flex items-center gap-1 sm:gap-2 text-sm sm:text-base"
          >
            <Share2 className="h-4 w-4 sm:h-5 sm:w-5" /> Share
          </Button>

          {page.authorId === user.name && (
            <Button
              onClick={handleOpenAccessModal}
              variant="outline"
              className="hover:bg-muted hover:text-foreground flex items-center gap-1 sm:gap-2 text-sm sm:text-base"
            >
              <Users className="h-4 w-4 sm:h-5 sm:w-5" /> Manage Access
            </Button>
          )}
        </div>
      </div>

      {/* Editor */}
      <Editor
        authName={page.authorId}
        documentId={pageId}
        initialContent={page.content}
        onChange={handleContentChange}
        access={page.access === 'write' ? 'write' : 'read'}
      />

      {/* Share Modal */}
      <Dialog open={shareModalOpen} onOpenChange={setShareModalOpen}>
        <DialogContent className="w-full max-w-md sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl font-semibold">Share Page Link</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col sm:flex-row gap-2 mt-3">
            <Input value={shareLink} readOnly className="flex-1" />
            <Button
              variant="outline"
              onClick={copyToClipboard}
              className="hover:bg-muted hover:text-foreground flex items-center justify-center"
            >
              <Copy className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>

          <DialogFooter>
            <Button
              onClick={() => setShareModalOpen(false)}
              className="hover:bg-muted hover:text-foreground mt-2 sm:mt-0"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Access Modal */}
      <Dialog open={accessModalOpen} onOpenChange={setAccessModalOpen}>
        <DialogContent className="w-full max-w-md sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl font-semibold">Manage Access</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mt-3">
            <Select value={newAccess} onValueChange={setNewAccess}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Access" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="read">Read</SelectItem>
                <SelectItem value="write">Write</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={handleAddUserAccess}
              className="hover:bg-muted hover:text-foreground flex-1 sm:flex-none"
            >
              Add
            </Button>
          </div>

          <DialogFooter>
            <Button onClick={() => setAccessModalOpen(false)} className="hover:bg-muted hover:text-foreground mt-2 sm:mt-0">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Versions Modal */}
      <Dialog open={versionsModalOpen} onOpenChange={setVersionsModalOpen}>
        <DialogContent className="w-full max-w-md sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl font-semibold">Page Versions</DialogTitle>
          </DialogHeader>

          <div className="space-y-3 mt-3 max-h-96 overflow-y-auto">
            {versions.length === 0 ? (
              <div className="text-gray-500 text-sm sm:text-base">No versions found</div>
            ) : (
              versions.map((v) => {
                // Extract first paragraph text from TipTap JSON content
                const firstParagraph = v.content?.content?.[0]?.content?.[0]?.text || "No content preview";

                return (
                  <div
                    key={v._id}
                    className="border p-3 rounded flex flex-col sm:flex-row gap-2 sm:gap-4 bg-gray-50 items-start sm:items-center"
                  >
                    {/* Avatar + editor info */}
                    <div className="flex items-center gap-2">
                      {v.avatarUrl && (
                        <img
                          src={v.avatarUrl}
                          alt={v.editedBy}
                          className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover"
                        />
                      )}
                      <div className="text-xs sm:text-sm text-gray-500">
                        Edited by <span className="font-medium">{v.editedBy}</span> on {new Date(v.createdAt).toLocaleString()}
                      </div>
                    </div>

                    {/* Version preview */}
                    <div className="text-sm sm:text-base text-gray-700 truncate sm:truncate-none flex-1">
                      {firstParagraph}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <DialogFooter>
            <Button onClick={() => setVersionsModalOpen(false)} className="mt-2 sm:mt-0">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


    </div>

  );
};

export default EditorPage;
