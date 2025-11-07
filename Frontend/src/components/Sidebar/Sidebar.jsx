import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  FileText,
  Kanban,
  Users,
  Settings,
  Plus,
  ChevronRight,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { useEditorStore } from '@/store/useEditorStore'
import CreatePageModal from '../CreatePageModal/CreatePageModal'
import { initUser } from '../../lib/auth'

const user = initUser();
const Sidebar = ({ isOpen }) => {
  const navigate = useNavigate()
  const { getAllPages, createPage, fetchAllPages } = useEditorStore()
  const pages = getAllPages()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [projects] = useState([
    { id: 1, name: 'Product Roadmap', icon: '🚀', color: 'bg-blue-500' },
    { id: 2, name: 'Marketing Campaign', icon: '📢', color: 'bg-purple-500' },
    { id: 3, name: 'Engineering Tasks', icon: '⚙️', color: 'bg-green-500' },
  ])

  useEffect(() => {
    fetchAllPages()
  }, [])

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Projects', icon: Kanban, path: '/projects' },
    // { name: 'Team', icon: Users, path: '/team' },
  ]

  const handleCreatePage = async (title) => {
    const id = await createPage(title)
    navigate(`/editor/${id}`)
  }

  return (
    <>
      <aside
        className={cn(
          'flex h-full flex-col border-r bg-sidebar transition-all duration-300',
          isOpen ? 'w-64' : 'w-20'
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center border-b px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg text-primary-foreground font-bold">
              <img src={user.avatar}></img>
            </div>
            {isOpen && <span className="font-semibold text-lg">COLLAB</span>}
          </div>
        </div>

        <ScrollArea className="flex-1 px-3 py-4">
          {/* Main nav */}
          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn('sidebar-item', isActive && 'sidebar-item-active')
                }
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {isOpen && <span>{item.name}</span>}
              </NavLink>
            ))}
          </nav>

          <div className="my-4 border-t" />

          {/* Pages */}
          {isOpen && (
            <div className="mt-4">
              <div className="flex items-center justify-between px-3 mb-2">
                <h3 className="text-xs font-semibold uppercase text-muted-foreground">
                  Pages
                </h3>
                <Button
                 variant="ghost"
                  size="icon"
                   className="hover:bg-muted hover:text-foreground h-7 w-7"
                  onClick={() => setIsModalOpen(true)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {pages.length === 0 ? (
                <p className="px-3 text-xs text-muted-foreground">
                  No pages yet
                </p>
              ) : (
                <div className="space-y-1">
                  {pages.map((page) => (
                    <NavLink
                      key={page._id}
                      to={`/editor/${page._id}`}
                      className={({ isActive }) =>
                        cn(
                          'sidebar-item group',
                          isActive && 'sidebar-item-active'
                        )
                      }
                    >
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="flex-1 truncate">{page.title}</span>
                      <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          )}

        </ScrollArea>


      </aside>

      {/* ✅ Modal imported here */}
      <CreatePageModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreatePage}
      />
    </>
  )
}

export default Sidebar
