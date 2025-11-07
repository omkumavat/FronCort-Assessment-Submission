import { useState, useEffect } from "react";
import axios from "axios";
import { Bell, Search, Settings, User, Menu, FileText, Kanban, FolderKanban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useAuth } from "../../context/AuthContext";

const Navbar = ({ onToggleSidebar }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // 🔍 Fetch all searchable data
  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const res = await axios.get(`https://froncort-assessment-submission.onrender.com/server/pages/search?q=${query}`);
        console.log("Search results:", res.data);

        setResults(res.data || []);
      } catch (err) {
        console.error("Search error:", err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };
    const delay = setTimeout(fetchResults, 400);
    return () => clearTimeout(delay);
  }, [query]);

  // Helper for icons
  const getIcon = (type) => {
    switch (type) {
      case "project":
        return <FolderKanban className="h-4 w-4 text-blue-500" />;
      case "board":
        return <Kanban className="h-4 w-4 text-purple-500" />;
      case "card":
        return <FileText className="h-4 w-4 text-green-500" />;
      case "page":
        return <FileText className="h-4 w-4 text-orange-500" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <>
      <header className="flex h-16 items-center justify-between border-b bg-card px-6 shadow-sm relative">
        {/* Left */}
        <div className="flex items-center gap-4 relative">
          <Button variant="ghost" 
          className="hover:bg-muted hover:text-foreground"
          size="icon" onClick={onToggleSidebar}>
            <Menu className="h-5 w-5" />
          </Button>

          {/* 🔍 Search */}
          <div className="relative w-64 lg:w-96">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search projects, boards, cards, pages..."
              className="pl-9"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowResults(true);
              }}
              onFocus={() => query && setShowResults(true)}
              onBlur={() => setTimeout(() => setShowResults(false), 300)}
            />

            {/* Results */}
            {showResults && (
              <div className="absolute top-11 left-0 w-full bg-white dark:bg-slate-900 border rounded-md shadow-lg max-h-64 overflow-auto z-[9999] pointer-events-auto">

                {loading ? (
                  <p className="text-center py-3 text-sm text-muted-foreground">Searching...</p>
                ) : results.length > 0 ? (
                  results.map((item) => (
                    <div
                      key={item._id}
                      onClick={() => navigate(item.route)}
                      className="flex items-start gap-2 px-4 py-2 text-sm hover:bg-muted cursor-pointer transition-colors"
                    >
                      {getIcon(item.type)}
                      <div className="flex flex-col">
                        <span className="font-medium">{item.name}</span>
                        <span className="text-xs text-muted-foreground capitalize">
                          {item.type}
                          {item.parentProject && ` • from ${item.parentProject}`}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center py-3 text-sm text-muted-foreground">
                    No results found
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">


          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-muted hover:text-foreground">
                <Avatar>
                  <AvatarImage src={user?.avatar} alt={user?.name} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {user?.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user?.name || "Demo User"}</p>
                  <p className="text-xs text-muted-foreground">{user?.email || "demo@example.com"}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setOpen(true)} className="hover:bg-muted hover:text-foreground cursor-pointer">
                <User className="mr-2 h-4 w-4" />
              Profile
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Profile modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-center">User Profile</DialogTitle>
            <DialogDescription className="text-center">
              Your personal information
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center mt-4 space-y-3">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user?.avatar} alt={user?.name} />
              <AvatarFallback className="text-lg bg-primary text-primary-foreground">
                {user?.name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>

            <div className="text-center space-y-1">
              <p className="text-lg font-medium">{user?.name || "Demo User"}</p>
              <p className="text-sm text-muted-foreground">{user?.email || "demo@example.com"}</p>
              <p className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-md inline-block mt-1">
                Sec ID: #{user?._id?.slice(-6) || "000ABC"}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Navbar;
