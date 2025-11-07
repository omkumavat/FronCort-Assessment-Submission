import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Ban, Edit2, Link as LinkIcon, Trash2, ExternalLinkIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import LinkPage from '../LinkPage/LinkPage.jsx';
import { initUser } from '../../lib/auth';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import CardModal from '../Modals/CardModal.jsx';
import EditCardModal from '../Modals/EditCardModal.jsx';
import BoardModal from '../Modals/BoardModal.jsx';
import { DeleteCardModal, DeleteBoardModal } from '../Modals/DeleteModals.jsx';

// Board gradient colors
const boardColors = [
  'bg-gradient-to-br from-pink-500 to-rose-400',
  'bg-gradient-to-br from-blue-500 to-indigo-400',
  'bg-gradient-to-br from-green-500 to-emerald-400',
  'bg-gradient-to-br from-orange-500 to-amber-400',
  'bg-gradient-to-br from-purple-500 to-fuchsia-400',
  'bg-gradient-to-br from-teal-500 to-cyan-400',
  'bg-gradient-to-br from-red-500 to-orange-400',
  'bg-gradient-to-br from-yellow-500 to-lime-400',
  'bg-gradient-to-br from-sky-500 to-blue-400',
  'bg-gradient-to-br from-violet-500 to-purple-400',
];

// Card background colors
const cardColors = [
  'bg-pink-100 border-pink-300',
  'bg-blue-100 border-blue-300',
  'bg-green-100 border-green-300',
  'bg-orange-100 border-orange-300',
  'bg-purple-100 border-purple-300',
  'bg-teal-100 border-teal-300',
  'bg-red-100 border-red-300',
  'bg-yellow-100 border-yellow-300',
  'bg-sky-100 border-sky-300',
  'bg-violet-100 border-violet-300',
];

const user = initUser();
const BoardsTab = ({ projectId, boards: propBoards, fetchProject, creator, accessList }) => {
  const [boardModalOpen, setBoardModalOpen] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const [cardModalOpen, setCardModalOpen] = useState(false);
  const [editCardModalOpen, setEditCardModalOpen] = useState(false);
  const [linkPageModalOpen, setLinkPageModalOpen] = useState(false);
  const [boards, setBoards] = useState(propBoards);
  const [currentBoardId, setCurrentBoardId] = useState(null);
  const [deleteCardModalOpen, setDeleteCardModalOpen] = useState(false);
  const [deleteBoardModalOpen, setDeleteBoardModalOpen] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [selectedBoardId, setSelectedBoardId] = useState(null);
  const [cardData, setCardData] = useState({
    _id: null,
    title: '',
    description: '',
    status: 'To Do',
    labels: [],
    dueDate: null,
    linkedPage: null,
  });

  const canCreateBoard = accessList.board_create === "deny" && creator !== user.name ? false : true;
  const canCreateCard = accessList.card_create === "deny" && creator !== user.name ? false : true;
  const canLinkPage = accessList.link_page === "deny" && creator !== user.name ? false : true;
  const canEditCard = accessList.card_edit === "deny" && creator !== user.name ? false : true;
  const canDeleteCard = accessList.card_delete === "deny" && creator !== user.name ? false : true;
  const canDeleteBoard = accessList.board_delete === "deny" && creator !== user.name ? false : true;
  const canMoveCard = accessList.card_move === "deny" && creator !== user.name ? false : true;

  // --- CRUD Functions ---
  const handleCreateBoard = async () => {
    if (!newBoardName.trim()) return alert('Board title required');
    await axios.post('http://localhost:4000/server/projects/create/board', { name: newBoardName, projectId, creator: user.name, avatarUrl: user.avatar });
    setNewBoardName('');
    setBoardModalOpen(false);
    fetchProject();
  };

  const handleCreateCard = async () => {
    if (!cardData.title.trim()) return alert('Card title required');
    await axios.post('http://localhost:4000/server/projects/card/create', { ...cardData, boardId: currentBoardId, projectId, creator: user.name, avatarUrl: user.avatar });
    resetCard();
    setCardModalOpen(false);
    fetchProject();
  };

  const handleEditCard = async () => {
    console.log('Editing card:', cardData);
    await axios.put(`http://localhost:4000/server/projects/card/edit/${cardData._id}`, { ...cardData, creator: user.name, avatarUrl: user.avatar, projectId });
    resetCard();
    setEditCardModalOpen(false);
    fetchProject();
  };

  const resetCard = () =>
    setCardData({ _id: null, title: '', description: '', status: 'To Do', labels: [], dueDate: null, linkedPage: null });

  // --- Drag & Drop ---
  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;

    // Ignore drops outside or no movement
    if (!destination || (source.index === destination.index)) return;

    const boardId = source.droppableId;
    const updatedBoards = [...boards];
    const boardIndex = updatedBoards.findIndex((b) => b._id === boardId);
    if (boardIndex === -1) return;

    const board = updatedBoards[boardIndex];
    const updatedCards = Array.from(board.cards);

    // Reorder cards locally
    const [movedCard] = updatedCards.splice(source.index, 1);
    updatedCards.splice(destination.index, 0, movedCard);
    updatedBoards[boardIndex].cards = updatedCards;

    // ✅ Instant frontend update
    setBoards(updatedBoards);

    // 🔹 Call backend to persist new order
    try {
      await axios.put('http://localhost:4000/server/projects/card/reorder', {
        boardId,
        cardId: draggableId,
        sourceIndex: source.index,
        destinationIndex: destination.index,
        orderedCardIds: updatedCards.map((card) => card._id),
        creator: user.name,
        avatarUrl: user.avatar,
        projectId
      });
    } catch (error) {
      console.error('Failed to reorder cards:', error);
    }
  };


  useEffect(() => {
    setBoards(propBoards);
  }, [propBoards]);

  return (
    <>
      {/* Top bar */}
      <div className="flex justify-end mb-6">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <Button
                  onClick={() => {
                    if (!canCreateBoard) return;
                    setBoardModalOpen(true);
                  }}
                  disabled={!canCreateBoard}
                  className={`${!canCreateBoard
                    ? "cursor-not-allowed opacity-50"
                    : "hover:bg-primary/90"
                    }`}
                >
                  {canCreateBoard ? (
                    <Plus className="mr-2 h-4 w-4" />
                  ) : (
                    <Ban className="mr-2 h-4 w-4 text-red-500" />
                  )}
                  New Board
                </Button>
              </div>
            </TooltipTrigger>

            <TooltipContent>
              {canCreateBoard ? (
                <p>Create a new board</p>
              ) : (
                <p>You don’t have permission to create a new board.</p>
              )}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex flex-wrap gap-6 pb-4 justify-start">
          {boards?.length > 0 ? (
            boards.map((board, bIdx) => (
              <Droppable droppableId={board._id}  isDragDisabled={!canMoveCard}  key={board._id}>
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`min-w-[300px] flex-shrink-0 rounded-xl shadow-lg ${boardColors[bIdx % boardColors.length]} text-white p-4`}
                  >
                    <div className="flex flex-col mb-3">
                      <h2
                        className="font-bold text-xl text-white truncate max-w-full"
                        title={board.name} // Shows full name on hover
                      >
                        {board.name}
                      </h2>

                      <div className="flex justify-between items-center mt-2 gap-2">
                        {canCreateCard && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  onClick={() => {
                                    setCurrentBoardId(board._id);
                                    setCardModalOpen(true);
                                  }}
                                  className="bg-white/30 hover:bg-white/40 text-white flex items-center px-2 py-1 rounded-md"
                                >
                                  <Plus className="h-4 w-4 mr-1" />
                                  New Card
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Create a new card</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}

                        {/* Delete Board Button */}
                        {canDeleteBoard && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  onClick={() => {
                                    setSelectedBoardId(board._id);
                                    setDeleteBoardModalOpen(true);
                                  }}
                                  className="flex items-center px-2 py-1 rounded-md bg-transparent hover:bg-red-50 text-red-600"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  <span className="ml-1">Delete Board</span>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Delete this board</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </div>


                    {/* Card List */}
                    <div className="bg-white rounded-lg p-3 min-h-[150px] text-black shadow-inner">
                      {board.cards?.length > 0 ? (
                        board.cards.map((card, cIdx) => (
                          <Draggable draggableId={card._id} index={cIdx} key={card._id}>
                            {(provided) => (
                              <div
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                ref={provided.innerRef}
                                className={`border p-3 mb-3 rounded-lg ${cardColors[cIdx % cardColors.length]} hover:shadow transition-all`}
                              >
                                {/* Card content */}
                                <div className="flex justify-between items-start">
                                  <div>
                                    <p className="font-semibold text-gray-800">{card.title}</p>
                                    {card.description && (
                                      <CardDescription description={card.description} />
                                    )}
                                    <div className="mt-2 text-xs text-gray-500 space-y-1">
                                      <p>
                                        Status:{' '}
                                        <span className="font-medium text-gray-700">{card.status}</span>
                                      </p>
                                      {card.labels?.length > 0 && (
                                        <div className="flex flex-wrap gap-1">
                                          {card.labels.map((label, i) => (
                                            <span
                                              key={i}
                                              className="px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-700 rounded-full"
                                            >
                                              #{label}
                                            </span>
                                          ))}
                                        </div>
                                      )}
                                      {card.dueDate && (
                                        <p>
                                          Due:{' '}
                                          <span>{new Date(card.dueDate).toLocaleDateString()}</span>
                                        </p>
                                      )}

                                    </div>
                                  </div>

                                  {/* Card Actions */}
                                  <div className="flex flex-col gap-2 ml-2">


                                    {canEditCard && (
                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <Button
                                              onClick={() => {
                                                setCardData(card);
                                                setEditCardModalOpen(true);
                                              }}
                                              className="bg-transparent hover:bg-transparent active:bg-transparent"
                                            >
                                              <Edit2 className="h-4 w-4 text-indigo-600" />
                                            </Button>
                                          </TooltipTrigger>

                                          <TooltipContent>
                                            <p>Edit card</p>
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                    )}

                                    {canDeleteCard && (
                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <Button
                                              onClick={() => {
                                                setSelectedCardId(card._id);
                                                setSelectedBoardId(board._id);
                                                setDeleteCardModalOpen(true);
                                              }}
                                              className="bg-transparent hover:bg-transparent active:bg-transparent"
                                            >
                                              <Trash2 className="h-4 w-4 text-red-600" />
                                            </Button>
                                          </TooltipTrigger>

                                          <TooltipContent>
                                            <p>Delete card</p>
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                    )}



                                    {(card.linkedPage || canLinkPage) && (
                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              onClick={() => {
                                                if (card.linkedPage) {
                                                  // Always allow visiting linked page
                                                  window.open(`/editor/${card.linkedPage.pageId}`, "_blank");
                                                } else {
                                                  // Linking only allowed if permission
                                                  setCardData(card);
                                                  setLinkPageModalOpen(true);
                                                }
                                              }}
                                              className="bg-transparent hover:bg-transparent"
                                            >
                                              {card.linkedPage ? (
                                                <ExternalLinkIcon className="h-4 w-4 text-blue-600" />
                                              ) : (
                                                <LinkIcon className="h-4 w-4 text-green-600" />
                                              )}
                                            </Button>
                                          </TooltipTrigger>

                                          <TooltipContent>
                                            {card.linkedPage ? (
                                              <p>Visit: {card.linkedPage.pageName || card.linkedPage.pageId}</p>
                                            ) : (
                                              <p>Link a page</p>
                                            )}
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                    )}



                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">No cards yet</p>
                      )}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>
            ))
          ) : (
            <p>No boards yet</p>
          )}
        </div>
      </DragDropContext>

      {/* Board Modal */}
      <BoardModal
        boardModalOpen={boardModalOpen}
        setBoardModalOpen={setBoardModalOpen}
        newBoardName={newBoardName}
        setNewBoardName={setNewBoardName}
        handleCreateBoard={handleCreateBoard}
      />

      {/* Card Modal */}
      <CardModal
        cardModalOpen={cardModalOpen}
        setCardModalOpen={setCardModalOpen}
        cardData={cardData}
        setCardData={setCardData}
        handleCreateCard={handleCreateCard}
      />

      <EditCardModal
        editCardModalOpen={editCardModalOpen}
        setEditCardModalOpen={setEditCardModalOpen}
        cardData={cardData}
        setCardData={setCardData}
        handleEditCard={handleEditCard}
      />


      <DeleteCardModal
        deleteCardModalOpen={deleteCardModalOpen}
        setDeleteCardModalOpen={setDeleteCardModalOpen}
        cardId={selectedCardId}
        boardId={selectedBoardId}
        fetchProject={fetchProject}
        projectId={projectId}
      />

      <DeleteBoardModal
        deleteBoardModalOpen={deleteBoardModalOpen}
        setDeleteBoardModalOpen={setDeleteBoardModalOpen}
        boardId={selectedBoardId}
        projectId={projectId}
        fetchProject={fetchProject}
      />

      <LinkPage
        linkPageModalOpen={linkPageModalOpen}
        setLinkPageModalOpen={setLinkPageModalOpen}
        cardData={cardData}
        fetchProject={fetchProject}
        projectId={projectId}
      />
    </>
  );
};

export default BoardsTab;


const CardDescription = ({ description, maxLength = 30, lineLength = 28 }) => {
  const [expanded, setExpanded] = useState(false);

  if (!description) return null;

  const isLong = description.length > maxLength;

  // Slice text if not expanded
  const text = expanded ? description : description.slice(0, maxLength);

  // Insert newline after every `lineLength` characters
  const formattedText = text.replace(new RegExp(`(.{1,${lineLength}})`, "g"), "$1\n");

  return (
    <p className="text-sm text-gray-600 mt-1 whitespace-pre-line">
      {formattedText}
      {isLong && (
        <span
          onClick={() => setExpanded(!expanded)}
          className="text-blue-600 cursor-pointer ml-1"
        >
          {expanded ? "Read less" : "Read more"}
        </span>
      )}
    </p>
  );
};
