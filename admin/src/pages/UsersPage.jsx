import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, ShieldCheck, Ban } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import DataTable from '../components/common/DataTable.jsx';
import Pagination from '../components/common/Pagination.jsx';
import { userService } from '../services/index.js';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import useAuthStore from '../store/authStore.js';

export default function UsersPage() {
  const [page, setPage]     = useState(1);
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((s) => s.user);

  const { data, isLoading } = useQuery({
  queryKey: ['admin-users', page, search],
  queryFn:  () => userService.getAll({ page, limit: 15, search: search || undefined }),
  select:   (d) => ({
    data:       d.data?.data       ?? [],
    pagination: d.data?.pagination ?? {},
  }),
  keepPreviousData: true,
});

  const blockMutation = useMutation({
    mutationFn: (id) => userService.blockUser(id),
    onSuccess:  (res) => {
      queryClient.invalidateQueries(['admin-users']);
      toast.success(res.data.message);
    },
    onError: () => toast.error('Action failed'),
  });

  const roleMutation = useMutation({
    mutationFn: ({ id, role }) => userService.updateRole(id, role),
    onSuccess:  () => { queryClient.invalidateQueries(['admin-users']); toast.success('Role updated'); },
    onError:    () => toast.error('Role update failed'),
  });

  const columns = [
    {
      key: 'name', label: 'User',
      render: (name, row) => (
        <div className="flex items-center gap-3">
          <Avatar className="w-8 h-8">
            <AvatarImage src={row.avatar?.url} />
            <AvatarFallback className="bg-brand-100 text-brand-700 text-xs font-bold">
              {name?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-gray-800 text-sm">{name}</p>
            <p className="text-xs text-gray-400">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'phone', label: 'Phone',
      render: (v) => <span className="text-sm text-gray-600">{v || '—'}</span>,
    },
    {
      key: 'role', label: 'Role',
      render: (role, row) => (
        <Badge className={role === 'admin' ? 'bg-brand-100 text-brand-700 border-0' : 'bg-gray-100 text-gray-600 border-0'}>
          {role}
        </Badge>
      ),
    },
    {
      key: 'isBlocked', label: 'Status',
      render: (blocked) => (
        <Badge className={blocked ? 'bg-red-100 text-red-600 border-0' : 'bg-green-100 text-green-700 border-0'}>
          {blocked ? 'Blocked' : 'Active'}
        </Badge>
      ),
    },
    {
      key: 'createdAt', label: 'Joined',
      render: (v) => <span className="text-xs text-gray-400">{format(new Date(v), 'd MMM yyyy')}</span>,
    },
    {
      key: '_id', label: 'Actions',
      render: (id, row) => {
        const isSelf = id === currentUser?._id;
        return (
          <div className="flex items-center gap-1">
            {!isSelf && (
              <>
                <Button size="sm" variant="ghost" className="h-8 px-2 text-xs hover:bg-brand-50 text-brand-600"
                  onClick={() => roleMutation.mutate({ id, role: row.role === 'admin' ? 'user' : 'admin' })}>
                  <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                  {row.role === 'admin' ? 'Demote' : 'Make Admin'}
                </Button>
                <Button size="sm" variant="ghost"
                  className={`h-8 px-2 text-xs ${row.isBlocked ? 'hover:bg-green-50 text-green-600' : 'hover:bg-red-50 text-red-500'}`}
                  onClick={() => blockMutation.mutate(id)}>
                  <Ban className="w-3.5 h-3.5 mr-1" />
                  {row.isBlocked ? 'Unblock' : 'Block'}
                </Button>
              </>
            )}
            {isSelf && <span className="text-xs text-gray-400 px-2">You</span>}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl text-gray-900">Users</h1>
        <p className="text-gray-400 text-sm mt-0.5">{data?.pagination?.total || 0} total users</p>
      </div>
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search by name or email..."
          className="pl-9 border-gray-200 h-9" />
      </div>
      <DataTable columns={columns} data={data?.data || []} isLoading={isLoading} />
      <Pagination page={page} totalPages={data?.pagination?.pages || 1} onPageChange={setPage} />
    </div>
  );
}