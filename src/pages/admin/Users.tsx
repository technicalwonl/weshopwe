import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Users as UsersIcon, Shield, UserCheck, Crown } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useUserRoles, useCreateUserRole, useUpdateUserRole, useDeleteUserRole, UserWithRole, AppRole } from '@/hooks/useUserRoles';

const roleConfig: { value: AppRole; label: string; icon: React.ElementType; color: string; description: string }[] = [
  { value: 'super_admin', label: 'Super Admin', icon: Crown, color: 'bg-purple-500', description: 'Full access to all features' },
  { value: 'admin', label: 'Admin', icon: Shield, color: 'bg-blue-500', description: 'Can manage products, orders, and users' },
  { value: 'moderator', label: 'Moderator', icon: UserCheck, color: 'bg-green-500', description: 'Can manage products and orders' },
  { value: 'user', label: 'User', icon: UsersIcon, color: 'bg-gray-500', description: 'Regular user access' },
];

const AdminUsers: React.FC = () => {
  const { loading: authLoading, isAuthenticated, checkRole } = useAuth();
  const { data: users = [], isLoading } = useUserRoles();
  const createUserRole = useCreateUserRole();
  const updateUserRole = useUpdateUserRole();
  const deleteUserRole = useDeleteUserRole();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!checkRole('super_admin')) {
    return <Navigate to="/" replace />;
  }

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);
  
  const [newUserData, setNewUserData] = useState({
    email: '',
    role: 'moderator' as AppRole,
  });

  const [editRole, setEditRole] = useState<AppRole>('user');

  const resetForm = () => {
    setNewUserData({
      email: '',
      role: 'moderator',
    });
  };

  const openEditDialog = (user: UserWithRole) => {
    setSelectedUser(user);
    setEditRole(user.role as AppRole);
    setEditDialogOpen(true);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    await createUserRole.mutateAsync({ email: newUserData.email, role: newUserData.role });
    setDialogOpen(false);
    resetForm();
  };

  const handleUpdateRole = async () => {
    if (selectedUser) {
      const targetEmail = selectedUser.profile?.email;
      if (!targetEmail) {
        return;
      }
      await updateUserRole.mutateAsync({ email: targetEmail, role: editRole });
      setEditDialogOpen(false);
      setSelectedUser(null);
    }
  };

  const handleDelete = async () => {
    if (selectedUser) {
      const targetEmail = selectedUser.profile?.email;
      if (!targetEmail) {
        return;
      }
      await deleteUserRole.mutateAsync(targetEmail);
      setDeleteDialogOpen(false);
      setSelectedUser(null);
    }
  };

  const getRoleConfig = (role: string) => {
    return roleConfig.find(r => r.value === role) || roleConfig[3];
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-heading text-3xl font-bold">Users & Roles</h1>
            <p className="text-muted-foreground mt-1">Manage team members and their access levels</p>
          </div>
          <Button onClick={() => setDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Team Member
          </Button>
        </div>

        {/* Role Legend */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {roleConfig.map((role) => (
            <div key={role.value} className="bg-card rounded-xl p-4 shadow-card">
              <div className={`w-10 h-10 rounded-lg ${role.color} flex items-center justify-center mb-3`}>
                <role.icon className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-medium">{role.label}</h3>
              <p className="text-sm text-muted-foreground">{role.description}</p>
            </div>
          ))}
        </div>

        {/* Users Table */}
        <div className="bg-card rounded-2xl shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">User</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Role</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Added</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  [...Array(3)].map((_, i) => (
                    <tr key={i}>
                      <td colSpan={5} className="px-6 py-4">
                        <div className="h-8 bg-muted rounded animate-pulse" />
                      </td>
                    </tr>
                  ))
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <UsersIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">No team members yet</p>
                      <Button onClick={() => setDialogOpen(true)} className="mt-4">
                        Add Your First Team Member
                      </Button>
                    </td>
                  </tr>
                ) : (
                  users.map((user) => {
                    const config = getRoleConfig(user.role);
                    return (
                      <tr key={user.id} className="hover:bg-muted/50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full ${config.color} flex items-center justify-center`}>
                              <config.icon className="h-5 w-5 text-white" />
                            </div>
                            <span className="font-medium">
                              {user.profile?.full_name || 'Unknown User'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {user.profile?.email || 'No email'}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${config.color}`}>
                            {config.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(user)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => {
                                setSelectedUser(user);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create User Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-heading text-2xl">Assign Team Role</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div>
              <Label>Email *</Label>
              <Input
                type="email"
                value={newUserData.email}
                onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                required
              />
            </div>

            <div>
              <Label>Role *</Label>
              <Select
                value={newUserData.role}
                onValueChange={(value) => setNewUserData({ ...newUserData, role: value as AppRole })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roleConfig.map(role => (
                    <SelectItem key={role.value} value={role.value}>
                      <div className="flex items-center gap-2">
                        <role.icon className="h-4 w-4" />
                        {role.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createUserRole.isPending}>
                {createUserRole.isPending ? 'Assigning...' : 'Assign Role'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Role Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-heading text-2xl">Edit Role</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Change role for <span className="font-medium text-foreground">{selectedUser?.profile?.email}</span>
            </p>

            <div>
              <Label>Role</Label>
              <Select value={editRole} onValueChange={(value) => setEditRole(value as AppRole)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roleConfig.map(role => (
                    <SelectItem key={role.value} value={role.value}>
                      <div className="flex items-center gap-2">
                        <role.icon className="h-4 w-4" />
                        {role.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateRole} disabled={updateUserRole.isPending}>
                {updateUserRole.isPending ? 'Updating...' : 'Update Role'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Team Member?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove "{selectedUser?.profile?.email}" from your team. They will lose access to admin features.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default AdminUsers;
