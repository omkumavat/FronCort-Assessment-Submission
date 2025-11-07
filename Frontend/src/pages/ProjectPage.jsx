import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Kanban, FileText, Copy, Share2, Settings, ProjectorIcon } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ActivityFeed from '../components/ActivityFeed/ActivityFeed';
import DocumentsTab from '../components/DocumentModal/DocumentsTab';
import BoardsTab from '../components/BoardModal/BoardsTab';
import ProjectSettings from '../components/ProjectSettings/ProjectSettings';
import { initUser } from '../lib/auth';
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import project from '/Image/project.png';
const user = initUser();

const ProjectPage = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [activityRefreshKey, setActivityRefreshKey] = useState(0);
  const [shareOpen, setShareOpen] = useState(false);

  const { toast } = useToast();

  const fetchProject = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:4000/server/projects/getbyid/${id}`);
      setProject(res.data);
      setActivityRefreshKey(prev => prev + 1);
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to fetch project data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [id]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/project/${project._id}`);
    toast({
      title: "Link copied!",
      description: "Project link has been copied to clipboard.",
      variant: "default",
    });
  };

  if (loading) {
    return (
      <div className="space-y-4 p-6">
        <div className="animate-pulse flex items-center gap-4">
          <div className="h-16 w-16 rounded-xl bg-gray-200 dark:bg-slate-700" />
          <div className="space-y-2">
            <div className="h-6 w-48 bg-gray-200 dark:bg-slate-700 rounded" />
            <div className="h-4 w-80 bg-gray-200 dark:bg-slate-700 rounded" />
          </div>
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, idx) => (
            <Card key={idx} className="animate-pulse">
              <CardHeader>
                <CardTitle className="h-4 w-32 bg-gray-200 dark:bg-slate-700 rounded"></CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-3 w-full bg-gray-200 dark:bg-slate-700 rounded mb-1"></div>
                <div className="h-3 w-3/4 bg-gray-200 dark:bg-slate-700 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <p className="text-center text-muted-foreground p-6">
        Project not found
      </p>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Project header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-xl text-4xl">
            <img src="/Image/project.png"></img>
          </div>
          <div>
            <h1 className="text-3xl font-bold">{project.title}</h1>
            <p className="text-muted-foreground mt-1">{project.description}</p>
          </div>
        </div>

        <div className="flex flex-col gap-2 items-end">
          {project.creator === user.name && (
            <Button onClick={() => setSettingsOpen(true)}>
              <Settings className="mr-2 h-4 w-4" />
              Project Settings
            </Button>
          )}
          <Button variant="outline"
           className="hover:bg-muted hover:text-foreground"
          onClick={() => setShareOpen(true)}>
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="boards">Boards</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Project Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {/* <p>Access: <span className="font-medium">{project.access}</span></p> */}
              <p>Pages: <span className="font-medium">{project.pages?.length || 0}</span></p>
              <p>Boards: <span className="font-medium">{project.boards?.length || 0}</span></p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <DocumentsTab
            projectId={project._id}
            pages={project.pages}
            accessList={project.accessList}
            creator={project.creator}
            fetchProject={fetchProject}
          />
        </TabsContent>

        <TabsContent value="boards">
          <BoardsTab
            projectId={project._id}
            boards={project.boards}
            accessList={project.accessList}
            creator={project.creator}
            fetchProject={fetchProject}
          />
        </TabsContent>
      </Tabs>

      <ProjectSettings
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        projectId={project._id}
        fetchProject={fetchProject}
      />

      <ActivityFeed
        fetchProject={fetchProject}
        projectId={project._id}
        refreshKey={activityRefreshKey}
      />

      {/* Share Dialog */}
      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Share Project</DialogTitle>
          </DialogHeader>

          <div className="flex items-center gap-2 mt-4">
            <Input
              value={`${window.location.origin}/project/${project._id}`}
              readOnly
              className="flex-1"
            />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" className="hover:bg-muted hover:text-foreground" size="icon" onClick={handleCopyLink}>
                    <Copy className="h-5 w-5 text-blue-600" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Copy link</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectPage;
