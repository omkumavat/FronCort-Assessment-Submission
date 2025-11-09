// import { useParams } from 'react-router-dom';
// import Board from '../components/Kanban/Board';
// import { Button } from '@/components/ui/button';
// import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
// import { Badge } from '@/components/ui/badge';
// import { Share2, Filter, MoreHorizontal, Users } from 'lucide-react';
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from '@/components/ui/dropdown-menu';
// import usePresence from '../hooks/usePresence';
// import useUserStore from '../store/useUserStore';

// /**
//  * KanbanPage
//  * Kanban board page with filters and collaboration
//  */
// const KanbanPage = () => {
//   const { id } = useParams();
//   const { currentUser } = useUserStore();
//   const { activeUsers } = usePresence(`board-${id}`, currentUser);

//   const board = {
//     id,
//     title: 'Sprint Planning',
//     description: 'Q4 2025 Sprint Tasks',
//   };

//   return (
//     <div className="flex h-full flex-col">
//       {/* Board header */}
//       <div className="mb-6 space-y-4">
//         <div className="flex items-start justify-between">
//           <div>
//             <h1 className="text-3xl font-bold">{board.title}</h1>
//             <p className="text-muted-foreground mt-1">{board.description}</p>
//           </div>

//           <div className="flex items-center gap-2">
//             <Button variant="outline">
//               <Filter className="mr-2 h-4 w-4" />
//               Filter
//             </Button>
//             <Button variant="outline">
//               <Share2 className="mr-2 h-4 w-4" />
//               Share
//             </Button>
//             <DropdownMenu>
//               <DropdownMenuTrigger asChild>
//                 <Button variant="outline" size="icon">
//                   <MoreHorizontal className="h-4 w-4" />
//                 </Button>
//               </DropdownMenuTrigger>
//               <DropdownMenuContent align="end">
//                 <DropdownMenuItem>Export board</DropdownMenuItem>
//                 <DropdownMenuItem>Board settings</DropdownMenuItem>
//                 <DropdownMenuItem>Archive board</DropdownMenuItem>
//               </DropdownMenuContent>
//             </DropdownMenu>
//           </div>
//         </div>

//         {/* Active users and filters */}
//         <div className="flex items-center justify-between">
//           {/* Active collaborators */}
//           {activeUsers.length > 0 && (
//             <div className="flex items-center gap-3">
//               <Users className="h-4 w-4 text-muted-foreground" />
//               <span className="text-sm text-muted-foreground">
//                 {activeUsers.length} active
//               </span>
//               <div className="flex -space-x-2">
//                 {activeUsers.slice(0, 5).map((user) => (
//                   <Avatar key={user.id} className="h-8 w-8 border-2 border-background">
//                     <AvatarImage src={user.avatar} />
//                     <AvatarFallback className="text-xs">
//                       {user.name.charAt(0)}
//                     </AvatarFallback>
//                   </Avatar>
//                 ))}
//                 {activeUsers.length > 5 && (
//                   <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-muted text-xs font-medium">
//                     +{activeUsers.length - 5}
//                   </div>
//                 )}
//               </div>
//             </div>
//           )}

//           {/* Active filters */}
//           <div className="flex items-center gap-2">
//             <Badge variant="secondary">All tasks</Badge>
//           </div>
//         </div>
//       </div>

//       {/* Kanban board */}
//       <Board boardId={id} />
//     </div>
//   );
// };

// export default KanbanPage;
