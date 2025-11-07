import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import { initUser } from '../../lib/auth';
const user = initUser();

export const DeleteCardModal = ({ deleteCardModalOpen, setDeleteCardModalOpen, cardId, projectId, boardId, fetchProject }) => {
  const handleDeleteCard = async () => {
    try {
      await axios.delete(`http://localhost:4000/server/projects/card/delete/${cardId}/${boardId}`, {
        data: { creator: user.name, avatarUrl: user.avatar, projectId }
      });
      setDeleteCardModalOpen(false);
      fetchProject(); // Refresh the board or project after deletion
    } catch (error) {
      console.error('Error deleting card:', error);
    }
  };

  return (
    <Dialog open={deleteCardModalOpen} onOpenChange={setDeleteCardModalOpen}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-red-600">Confirm Deletion</DialogTitle>
        </DialogHeader>

        <div className="mt-4 text-gray-700">
          <p>Are you sure you want to delete this card? This action cannot be undone.</p>
        </div>

        <DialogFooter className="mt-6 flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => setDeleteCardModalOpen(false)}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDeleteCard}
          >
            OK
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const DeleteBoardModal = ({ deleteBoardModalOpen, setDeleteBoardModalOpen, boardId, projectId, fetchProject }) => {
  const handleDeleteBoard = async () => {
    try {
      await axios.delete(`http://localhost:4000/server/projects/board/delete/${boardId}/${projectId}`, {
        data: { creator: user.name, avatarUrl: user.avatar }
      });
      setDeleteBoardModalOpen(false);
      fetchProject(); // Refresh the board or project after deletion
    } catch (error) {
      console.error('Error deleting card:', error);
    }
  };

  return (
    <Dialog open={deleteBoardModalOpen} onOpenChange={setDeleteBoardModalOpen}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-red-600">Confirm Deletion</DialogTitle>
        </DialogHeader>

        <div className="mt-4 text-gray-700">
          <p>Are you sure you want to delete this board? This action cannot be undone.</p>
        </div>

        <DialogFooter className="mt-6 flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => setDeleteBoardModalOpen(false)}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDeleteBoard}
          >
            OK
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

