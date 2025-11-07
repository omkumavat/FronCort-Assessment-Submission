import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Ban, FileText, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import axios from 'axios';
import { initUser } from '../../lib/auth';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from '@/components/ui/use-toast';
import dayjs from 'dayjs';
import CreatePageModal from '../CreatePageModal/CreatePageModal';
import { useEditorStore } from '@/store/useEditorStore';
import { useNavigate } from 'react-router-dom';
const user = initUser();

const DocumentsTab = ({ projectId, pages, fetchProject, creator, accessList }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen]=useState(false);
  const {createPage} = useEditorStore();
  const navigate = useNavigate();

  // const { toast } = useToast();

  const handleCreatePage = async (title) => {
    const id = await createPage(title)
    navigate(`/editor/${id}`)
  }

  const canCreatePage = accessList.page_create !== "deny" || creator === user.name;

  return (
    <>
      <div className="flex justify-end mb-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <Button
                  onClick={() => { if (!canCreatePage) return; setIsModalOpen(true); }}
                  disabled={!canCreatePage || loading}
                  className={`${!canCreatePage ? "cursor-not-allowed opacity-50" : "hover:bg-primary/90"}`}
                >
                  {canCreatePage ? (
                    <Plus className="mr-2 h-4 w-4" />
                  ) : (
                    <Ban className="mr-2 h-4 w-4 text-red-500" />
                  )}
                  {loading ? "Creating..." : "New Page"}
                </Button>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              {canCreatePage ? <p>Create a new page</p> : <p>You don’t have permission to create a new page.</p>}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {pages?.length > 0 ? pages.map((page) => (
          <Card key={page._id} className="group hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="flex justify-between items-start">
              <div className='flex flex-row gap-2'>
               <div> <CardTitle className="text-base font-semibold">{page.title}</CardTitle></div>
               <div> <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link to={`/editor/${page._id}`} className="text-blue-600 hover:text-blue-800">
                        <ExternalLink className="h-5 w-5" />
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent><p>Open page</p></TooltipContent>
                  </Tooltip>
                </TooltipProvider></div>
              </div>
            </CardHeader>
            <CardContent className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                {/* <img src={page.avatarUrl || '/default-avatar.png'} alt={page.author} className="w-6 h-6 rounded-full" /> */}
                <span className="text-xs text-muted-foreground truncate max-w-[120px]">Created by {page.authorId || "Unknown"}</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {page.updatedAt ? dayjs(page.updatedAt).format("MMM D, YYYY") : ""}
              </span>
            </CardContent>
          </Card>
        )) : (
          <p className="text-center col-span-full text-muted-foreground mt-6">No pages yet</p>
        )}
      </div>

       <CreatePageModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreatePage}
      />
    </>
  );
};

export default DocumentsTab;
