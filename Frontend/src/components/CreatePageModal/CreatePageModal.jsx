import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, FileText } from 'lucide-react';
import { toast } from 'sonner';

const CreatePageModal = ({ isOpen, onClose, onCreate }) => {
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error('Page title is required');
      return;
    }

    setLoading(true);
    try {
      await onCreate(title);
      toast.success('Page created successfully!');
      setTitle('');
      onClose();
    } catch (err) {
      console.error('Error creating page:', err);
      toast.error('❌ Failed to create page. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-2xl shadow-xl border border-gray-200 overflow-hidden bg-white">
        <DialogHeader className="text-center space-y-1">
          {/* <div className=""> */}
          {/* <FileText className="h-6 w-6 text-indigo-600" /> */}
          {/* </div> */}
          <DialogTitle className="text-xl font-bold text-gray-800">
           <div className='flex gap-2'>
             <FileText className="h-6 w-6 text-indigo-600" />
            Create a New Page
           </div>
          </DialogTitle>
          <p className="text-sm text-gray-500">Enter a title to start your page</p>
        </DialogHeader>

        <div className="space-y-4 py-3">
          <label className="text-sm font-medium text-gray-700">Page Title</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter page title..."
            className="w-full border-gray-300 focus:ring-2 focus:ring-indigo-400 rounded-lg"
          />
        </div>

        <DialogFooter className="flex justify-end space-x-2 mt-4">
          <Button variant="outline" className="hover:bg-muted hover:text-foreground" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !title.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Creating...
              </>
            ) : (
              'Create'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePageModal;
