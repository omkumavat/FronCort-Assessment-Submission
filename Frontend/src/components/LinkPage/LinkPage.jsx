import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { initUser } from "../../lib/auth";

const user=initUser();
const LinkPage = ({
  linkPageModalOpen,
  setLinkPageModalOpen,
  cardData,
  projectId,
  fetchProject, // optional callback to refresh data
}) => {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🔍 Debounce search input (to avoid API spam)
  useEffect(() => {
    const delay = setTimeout(() => {
      if (search.trim().length > 0) handleSearch(search);
      else setResults([]);
    }, 400);

    return () => clearTimeout(delay);
  }, [search]);

  // 📡 Fetch matching pages
  const handleSearch = async (query) => {
    try {
      setLoading(true);
      const res = await axios.get(`https://froncort-assessment-submission.onrender.com/server/projects/page/search?query=${query}`);
      setResults(res.data.pages || []);
    } catch (err) {
      console.error("Error fetching pages:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔗 Handle link/unlink page
  const handleLinkPage = async (pageId,title) => {
    try {
      await axios.put(`https://froncort-assessment-submission.onrender.com/server/projects/card/page/link-page/${cardData._id}`, {
        pageId,
        pageName:title,
        projectId,
        creator: user.name,
        avatarUrl: user.avatar
      });
      if (fetchProject) fetchProject();
      setLinkPageModalOpen(false);
    } catch (err) {
      console.error("Error linking page:", err);
    }
  };

  return (
    <Dialog open={linkPageModalOpen} onOpenChange={setLinkPageModalOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Link a Page</DialogTitle>
        </DialogHeader>

        {/* 🔎 Search Bar */}
        <div className="mt-4 space-y-3">
          <Input
            placeholder="Search page by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {/* ⏳ Loading state */}
          {loading && <p className="text-sm text-gray-500">Searching...</p>}

          {/* 📄 Search Results */}
          {results.length > 0 && (
            <div className="border rounded-md divide-y max-h-60 overflow-y-auto">
              {results.map((page) => (
                <div
                  key={page._id}
                  className="flex justify-between items-center p-2 hover:bg-gray-100"
                >
                  <span className="truncate">{page.title}</span>
                  {cardData?.linkedPage?._id === page._id ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleLinkPage(null)}
                    >
                      Remove
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleLinkPage(page._id,page.title)}
                    >
                      Link
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* 🕳 No results */}
          {!loading && search && results.length === 0 && (
            <p className="text-sm text-gray-500">No pages found</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LinkPage;
