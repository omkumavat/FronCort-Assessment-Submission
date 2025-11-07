import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import axios from 'axios';
import { initUser } from '../lib/auth';
import CreateProjectModal from '../components/CreateProjectModal/CreateProjectModal';

const user = initUser();

const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:4000/server/projects/getallmy/${user.name}`);
      if (res) setProjects(res.data);
    } catch (err) {
      console.error(err);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Projects</h1>
        <Button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>

      {/* Projects Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading
          ? Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="border rounded-lg p-4 animate-pulse bg-gray-100 dark:bg-slate-800 h-32"
              >
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-full"></div>
              </div>
            ))
          : projects.length > 0
          ? projects.map((project) => (
              <Card
                key={project._id}
                className="cursor-pointer hover:shadow-lg hover:border-primary transition-all"
                onClick={() => navigate(`/project/${project._id}`)}
              >
                <CardHeader>
                  <CardTitle>{project.title}</CardTitle>
                  <CardDescription>{project.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  {/* You can add progress bars, members, or stats here if available */}
                </CardContent>
              </Card>
            ))
          : (
            <p className="text-center col-span-full text-muted-foreground">
              No projects found. Create one to get started!
            </p>
          )
        }
      </div>

      {/* Create Project Modal */}
      <CreateProjectModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={fetchProjects} 
      />
    </div>
  );
};

export default ProjectsPage;
