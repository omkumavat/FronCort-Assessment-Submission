import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Edit2 } from 'lucide-react';

const EditCardModal = ({ editCardModalOpen, setEditCardModalOpen, cardData, setCardData, handleEditCard }) => {

    const statusColors = {
        'To Do': 'bg-blue-100 text-blue-700',
        'In Progress': 'bg-yellow-100 text-yellow-700',
        'Done': 'bg-green-100 text-green-700',
    };

    const handleSave = () => {
        if (!cardData.title?.trim()) {
            toast.error("Title is required 📝");
            return;
        }

        if (!cardData.description?.trim()) {
            toast.error("Description cannot be empty 📄");
            return;
        }

        if (!cardData.status) {
            toast.error("Please select a status ⚡");
            return;
        }

        if (cardData.labels?.some((l) => l === "")) {
            toast.error("Labels cannot be empty #️⃣");
            return;
        }

        if (!cardData.dueDate) {
            toast.error("Due Date is required 📅");
            return;
        }

        handleEditCard();
        toast.success('Card updated successfully!');
        setEditCardModalOpen(false);
    };

    return (
        <Dialog open={editCardModalOpen} onOpenChange={setEditCardModalOpen}>
            <DialogContent
                className="sm:max-w-[450px] max-h-[85vh] overflow-y-auto bg-gradient-to-b from-white to-gray-50 shadow-2xl rounded-2xl p-6 border border-gray-100"
            >
                <DialogHeader className="space-y-1 text-center">
                    <DialogTitle className=" flex text-2xl font-semibold text-gray-800">
                        <Edit2 className="h-5 w-5 mr-3 mt-2" /> Edit Card</DialogTitle>
                    <p className="text-sm text-gray-500">Update the details below</p>
                </DialogHeader>

                <motion.div
                    className="mt-4 space-y-4"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {/* Title */}
                    <div className="space-y-1">
                        <Label className="text-sm font-medium text-gray-700">Title</Label>
                        <Input
                            placeholder="Enter card title"
                            value={cardData.title}
                            onChange={(e) => setCardData({ ...cardData, title: e.target.value })}
                            className="border-gray-200 focus:ring-2 focus:ring-indigo-400 rounded-lg"
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-1">
                        <Label className="text-sm font-medium text-gray-700">Description</Label>
                        <textarea
                            placeholder="Write a short description..."
                            value={cardData.description}
                            onChange={(e) => setCardData({ ...cardData, description: e.target.value })}
                            className="w-full border border-gray-200 focus:ring-2 focus:ring-indigo-400 rounded-lg p-2 min-h-[80px]"
                        />
                    </div>

                    {/* Status */}
                    <div className="space-y-1">
                        <Label className="text-sm font-medium text-gray-700">Status</Label>
                        <div className="flex gap-2">
                            {['To Do', 'In Progress', 'Done'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setCardData({ ...cardData, status })}
                                    className={`flex-1 py-2 text-sm rounded-lg font-medium border transition-all ${cardData.status === status
                                        ? `${statusColors[status]} border-transparent`
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Labels */}
                    <div className="space-y-1">
                        <Label className="text-sm font-medium text-gray-700">Labels (comma-separated)</Label>
                        <Input
                            placeholder="#Frontend, #Bugfix"
                            value={cardData.labels?.join(', ') || ''}
                            onChange={(e) =>
                                setCardData({
                                    ...cardData,
                                    labels: e.target.value.split(',').map((l) => l.trim()),
                                })
                            }
                            className="border-gray-200 focus:ring-2 focus:ring-indigo-400 rounded-lg"
                        />
                        <div className="flex flex-wrap gap-2 mt-1">
                            {cardData.labels?.map(
                                (label, i) =>
                                    label && (
                                        <span
                                            key={i}
                                            className="px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-700 rounded-full"
                                        >
                                            #{label}
                                        </span>
                                    )
                            )}
                        </div>
                    </div>

                    {/* Due Date */}
                    <div className="space-y-1">
                        <Label className="text-sm font-medium text-gray-700">Due Date</Label>
                        <DatePicker
                            selected={cardData.dueDate ? new Date(cardData.dueDate) : null}
                            onChange={(date) => setCardData({ ...cardData, dueDate: date })}
                            className="w-full border border-gray-200 rounded-lg p-2 focus:ring-2 focus:ring-indigo-400"
                        />
                    </div>
                </motion.div>

                <DialogFooter className="mt-6 flex justify-end">
                    <Button
                        onClick={handleSave}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow-md transition-transform active:scale-95"
                    >
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default EditCardModal;
