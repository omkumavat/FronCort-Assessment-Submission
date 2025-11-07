import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const BoardModal = ({ boardModalOpen, setBoardModalOpen, newBoardName, setNewBoardName, handleCreateBoard }) => {

    const handleSubmit = () => {
        if (!newBoardName.trim()) {
            toast.error('Board title cannot be empty');
            return;
        }
        handleCreateBoard();
        toast.success(`Board "${newBoardName}" created successfully!`);
        setNewBoardName('');
        setBoardModalOpen(false);
    };

    return (
        <Dialog open={boardModalOpen} onOpenChange={setBoardModalOpen}>
            <DialogContent
                className="sm:max-w-[450px] rounded-2xl p-6 bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 shadow-2xl overflow-hidden"
            >
                <DialogHeader className="text-center space-y-1">
                    <DialogTitle className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                        🚀 Create New Board
                    </DialogTitle>
                    <p className="text-sm text-gray-500 dark:text-gray-300">
                        Give your board a descriptive title
                    </p>
                </DialogHeader>

                <motion.div
                    className="mt-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Board Title
                    </label>
                    <Input
                        placeholder="Enter board title"
                        value={newBoardName}
                        onChange={(e) => setNewBoardName(e.target.value)}
                        className="border-gray-200 focus:ring-2 focus:ring-indigo-400 rounded-lg"
                    />
                </motion.div>

                <DialogFooter className="mt-6 flex justify-end">
                    <Button
                        onClick={handleSubmit}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg shadow-md transition-transform active:scale-95"
                    >
                        Create Board
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default BoardModal;
