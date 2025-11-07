import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import axios from "axios";
import { toast } from "sonner";
import { Settings2 } from "lucide-react";

const ProjectSettings = ({ projectId, open, onOpenChange, fetchProject }) => {
  const [accessList, setAccessList] = useState({
    card_create: "deny",
    card_edit: "deny",
    card_delete: "deny",
    board_create: "deny",
    board_delete: "deny",
    page_create: "deny",
    page_delete: "deny",
    card_move: "deny",
    link_page: "deny",
  });
  const [loading, setLoading] = useState(false);

  // Fetch current project access list
  useEffect(() => {
    const fetchAccess = async () => {
      try {
        const res = await axios.get(
          `http://localhost:4000/server/projects/setting/fetch/${projectId}`
        );
        // console.log("Fetched access list:", res.data);
        
        if (res.data) {
          setAccessList(res.data);
        }
      } catch (err) {
        console.error("Error fetching access list:", err);
        toast.error("Failed to fetch project access settings.");
      }
    };

    if (open) fetchAccess();
  }, [open, projectId]);

  const handleAccessChange = (key, value) => {
    setAccessList((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await axios.put(
        `http://localhost:4000/server/projects/setting/update/${projectId}`,
        { accessList }
      );
      toast.success("Project access settings updated successfully!");
      if (fetchProject) fetchProject();
      onOpenChange(false);
    } catch (err) {
      console.error("Error updating access list:", err);
      toast.error("Failed to save access settings.");
    } finally {
      setLoading(false);
    }
  };

  const accessItems = [
    { key: "card_create", label: "Create Card" },
    { key: "card_edit", label: "Edit Card" },
    { key: "card_delete", label: "Delete Card" },
    { key: "card_move", label: "Move Card" },
    { key: "board_create", label: "Create Board" },
    { key: "board_delete", label: "Delete Board" },
    { key: "page_create", label: "Create Page" },
    { key: "link_page", label: "Link Page" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] rounded-2xl shadow-xl border border-gray-200 overflow-hidden bg-white">
        <DialogHeader className="text-center space-y-2">
          <DialogTitle className="text-xl font-bold text-gray-800">
            <div className="flex gap-3">
              <Settings2 className="h-6 w-6 text-indigo-600" />
            Project Access Settings
            </div>
          </DialogTitle>
          <p className="text-sm text-gray-500">
            Configure who can access and modify project elements
          </p>
        </DialogHeader>

        <div className="space-y-5 mt-4">
          {accessItems.map((item) => (
            <div key={item.key} className="flex justify-between items-center">
              <Label className="font-medium text-gray-700">{item.label}</Label>
              <RadioGroup
                value={accessList[item.key]}
                onValueChange={(value) => handleAccessChange(item.key, value)}
                className="flex gap-6"
              >
                <div className="flex items-center space-x-1">
                  <RadioGroupItem value="allow" id={`${item.key}-allow`} />
                  <Label htmlFor={`${item.key}-allow`} className="cursor-pointer">
                    Allow
                  </Label>
                </div>
                <div className="flex items-center space-x-1">
                  <RadioGroupItem value="deny" id={`${item.key}-deny`} />
                  <Label htmlFor={`${item.key}-deny`} className="cursor-pointer">
                    Deny
                  </Label>
                </div>
              </RadioGroup>
            </div>
          ))}
        </div>

        <div className="flex justify-end mt-6">
          <Button
            onClick={handleSave}
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow-md transition-transform active:scale-95"
          >
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectSettings;
