import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ActivityFeed from '../components/ActivityFeed/ActivityFeed';
import { FileText, Kanban, Users, TrendingUp, Plus, ArrowRight, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import CreateProjectModal from '../components/CreateProjectModal/CreateProjectModal';
import CreatePageModal from '../components/CreatePageModal/CreatePageModal';
import { initUser } from '../lib/auth';
import { useEditorStore } from '@/store/useEditorStore';
import axios from 'axios';

const user = initUser();

const Dashboard = () => {
  const navigate = useNavigate();
  const { getAllPages, fetchAllPages } = useEditorStore()
  const [modalOpen, setModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const pages = getAllPages()
  const { createPage } = useEditorStore();

  const fetchProjects = async () => {
    try {
      setLoadingProjects(true);
      const res = await axios.get(`http://localhost:4000/server/projects/getallmy/${user.name}`);
      if (res && Array.isArray(res.data)) {
        // Sort by updated date (optional)
        const sorted = res.data.sort(
          (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
        );
        console.log('sorted projects:', sorted);

        setProjects(sorted);
      }
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    } finally {
      setLoadingProjects(false);
    }
  };


  useEffect(() => {
    fetchAllPages();
    fetchProjects();
  }, []);

  const handleCreatePage = async (title) => {
    const id = await createPage(title);
    navigate(`/editor/${id}`);
  };

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-3xl font-bold">Welcome back, {user?.name || 'User'} 👋</h1>
        <p className="text-muted-foreground mt-2">
          Here's what's happening with your projects today.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card key="Your Projects" className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {"Your Projects"}
            </CardTitle>
            <Kanban className={`h-4 w-4 text-blue-500`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projects.length}</div>
          </CardContent>
        </Card>
        <Card key="Your Documents" className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {"Your Documents"}
            </CardTitle>
            <FileText className={`h-4 w-4 text-purple-500`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pages.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main content grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Projects */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Projects</CardTitle>
                  <CardDescription>Projects you’ve worked on recently</CardDescription>
                </div>
                <Button onClick={() => setModalOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  New Project
                </Button>
              </div>
            </CardHeader>

            <CardContent>
              {loadingProjects ? (
                <div className="flex justify-center items-center h-32 text-muted-foreground">
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" /> Loading projects...
                </div>
              ) : projects.length === 0 ? (
                <div className="text-center text-sm text-muted-foreground py-8">
                  No projects found. Start by creating one!
                </div>
              ) : (
                <div className="space-y-4">
                  {projects.slice(0, 5).map((project) => (
                    <Link
                      key={project._id}
                      to={`/project/${project._id}`}
                      className="block"
                    >
                      <div className="rounded-lg border p-4 hover:border-primary transition-colors cursor-pointer">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold">{project.title}</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              {project.description || 'No description provided.'}
                            </p>
                          </div>
                          <ArrowRight className="h-5 w-5 text-muted-foreground" />
                        </div>

                        {/* Progress bar */}

                        <div className="space-y-2">
                          <div className="flex gap-3 text-xs text-muted-foreground">
                            <span>{project.boards?.length || 0} boards</span>
                            <span>{project.pages?.length || 0} documents</span>
                          </div>
                          {/* <div className="h-2 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full transition-all"
                              style={{ width: `${project.progress}%` }}
                            />
                          </div> */}
                        </div>
                        <div className="text-xs text-muted-foreground mt-3">
                          Updated at {new Date(project.updatedAt).toLocaleString()}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Activity Feed */}
        <div className="lg:col-span-1">
          <ActivityFeed projectId={null} refreshKey={1} />
        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Start something new</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Button
              variant="outline"
               className="hover:bg-muted hover:text-foreground  h-auto py-4"
              onClick={() => setIsModalOpen(true)}
            >
              <FileText className="mr-2 h-5 w-5" />
              New Document
            </Button>

            <Button
              variant="outline"
              className="hover:bg-muted hover:text-foreground h-auto py-4"
              onClick={() => setModalOpen(true)}
            >
              <Plus className="mr-2 h-5 w-5" />
              New Project
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <CreateProjectModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={fetchProjects}
      />

      <CreatePageModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreatePage}
      />
    </div>
  );
};

export default Dashboard;
