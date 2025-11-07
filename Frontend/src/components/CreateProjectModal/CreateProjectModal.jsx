import { useState } from 'react';
import axios from 'axios';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { initUser } from '../../lib/auth';
import { useNavigate } from 'react-router-dom';

const user = initUser();

const CreateProjectModal = ({ open, onClose, onSuccess }) => {
  const navigate = useNavigate();
  const [newProject, setNewProject] = useState({ name: '', description: '', creator: user.name });
  const [loading, setLoading] = useState(false);

  const handleCreateProject = async () => {
    // Field validation
    if (!newProject.name.trim()) {
      toast.error('Project name is required');
      return;
    }
    if (!newProject.description.trim()) {
      toast.error('Project description is required');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post('http://localhost:4000/server/projects/create', newProject);
      const createdProject = res.data.project || res.data;

      toast.success('Project created successfully!');

      // Reset form
      setNewProject({ name: '', description: '', creator: user.name });
      onClose();
      if (onSuccess) onSuccess(); // refresh parent list

      // Navigate to project page
      if (createdProject && createdProject._id) {
        navigate(`/project/${createdProject._id}`);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px] bg-white rounded-2xl shadow-xl p-6 border border-gray-200 overflow-hidden">
        <DialogHeader className="mb-4 text-center">
          <DialogTitle className="text-2xl font-bold text-gray-800">
            ✨ Create New Project
          </DialogTitle>
          <p className="text-sm text-gray-500 mt-1">Fill in the details below</p>
        </DialogHeader>

        <div className="space-y-4">
          {/* Project Name */}
          <div className="flex flex-col space-y-1">
            <label className="text-sm font-medium text-gray-700">Project Name</label>
            <Input
              placeholder="Enter project name"
              value={newProject.name}
              onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
              className="border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 rounded-lg"
            />
          </div>

          {/* Project Description */}
          <div className="flex flex-col space-y-1">
            <label className="text-sm font-medium text-gray-700">Project Description</label>
            <Input
              placeholder="Enter description"
              value={newProject.description}
              onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
              className="border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 rounded-lg"
            />
          </div>
        </div>

        <DialogFooter className="mt-6 flex justify-end">
          <Button
            onClick={handleCreateProject}
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow-md transition-transform active:scale-95"
          >
            {loading ? 'Creating...' : 'Create Project'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProjectModal;
