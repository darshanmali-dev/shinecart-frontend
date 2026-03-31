import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Search,
  Loader2,
  Users,
  UserCheck,
  UserX,
  Shield,
  Eye,
  RefreshCw,
  ShoppingBag,
  DollarSign,
  Phone,
  Mail,
  User,
} from 'lucide-react';

const BASE_URL = 'http://localhost:8080';

interface UserDTO {
  id: number;
  username: string;
  email: string;
  phone: string;
  roles: string[];
  enabled: boolean;
  totalOrders: number;
  totalSpent: number;
}

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  adminUsers: number;
  regularUsers: number;
}

const AdminCustomers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserDTO[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<UserStats>({
    totalUsers: 0,
    activeUsers: 0,
    adminUsers: 0,
    regularUsers: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedUser, setSelectedUser] = useState<UserDTO | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [toggling, setToggling] = useState<number | null>(null);

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [users, searchQuery, roleFilter, statusFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/admin/users`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        toast.error('Failed to load users');
      }
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/admin/users/stats`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...users];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (user) =>
          user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (user.phone && user.phone.includes(searchQuery))
      );
    }

    // Role filter
    if (roleFilter !== 'ALL') {
      filtered = filtered.filter((user) => user.roles.includes(roleFilter));
    }

    // Status filter
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter((user) =>
        statusFilter === 'ACTIVE' ? user.enabled : !user.enabled
      );
    }

    setFilteredUsers(filtered);
  };

  const handleToggleStatus = async (user: UserDTO) => {
    setToggling(user.id);
    try {
      const response = await fetch(
        `${BASE_URL}/api/admin/users/${user.id}/toggle-status`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
          },
        }
      );

      if (response.ok) {
        const updatedUser = await response.json();
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? updatedUser : u))
        );
        if (selectedUser?.id === user.id) {
          setSelectedUser(updatedUser);
        }
        toast.success(
          `${user.username} has been ${updatedUser.enabled ? 'enabled' : 'disabled'}`
        );
        fetchStats();
      } else {
        toast.error('Failed to update user status');
      }
    } catch (error) {
      toast.error('Failed to update user status');
    } finally {
      setToggling(null);
    }
  };

  const getRoleBadge = (roles: string[]) => {
    if (roles.includes('ROLE_ADMIN')) {
      return <Badge className="bg-purple-500 text-white">Admin</Badge>;
    }
    return <Badge className="bg-blue-500 text-white">Customer</Badge>;
  };

  const getStatusBadge = (enabled: boolean) => {
    return enabled ? (
      <Badge className="bg-green-500 text-white">Active</Badge>
    ) : (
      <Badge className="bg-red-500 text-white">Disabled</Badge>
    );
  };

  const statsCards = [
    {
      title: 'Total Users',
      value: statsLoading ? '...' : (stats.totalUsers || 0).toString(),
      icon: Users,
      color: 'text-blue-600',
    },
    {
      title: 'Active Users',
      value: statsLoading ? '...' : (stats.activeUsers || 0).toString(),
      icon: UserCheck,
      color: 'text-green-600',
    },
    {
      title: 'Admins',
      value: statsLoading ? '...' : (stats.adminUsers || 0).toString(),
      icon: Shield,
      color: 'text-purple-600',
    },
    {
      title: 'Customers',
      value: statsLoading ? '...' : (stats.regularUsers || 0).toString(),
      icon: User,
      color: 'text-orange-600',
    },
  ];

  return (
    <div className="container mx-auto px-4 py-4 sm:py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
        <div>
          <EnhancedButton
            variant="ghost"
            onClick={() => navigate('/admin')}
            className="mb-2 -ml-2"
            size="sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </EnhancedButton>
          <h1 className="font-luxury text-3xl sm:text-4xl font-bold">
            Customer Management
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Manage and monitor all registered users
          </p>
        </div>
        <EnhancedButton
          variant="outline"
          onClick={() => { fetchUsers(); fetchStats(); }}
          className="w-full sm:w-auto"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </EnhancedButton>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {statsCards.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{stat.title}</p>
                  <p className="text-lg sm:text-2xl font-bold">{stat.value}</p>
                </div>
                <stat.icon className={`h-5 w-5 sm:h-7 sm:w-7 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="mb-4 sm:mb-6">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label className="text-sm">Search Users</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full sm:w-40">
              <Label className="text-sm">Filter by Role</Label>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Roles</SelectItem>
                  <SelectItem value="ROLE_USER">Customers</SelectItem>
                  <SelectItem value="ROLE_ADMIN">Admins</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-40">
              <Label className="text-sm">Filter by Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="DISABLED">Disabled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-lg sm:text-xl">
            All Users ({filteredUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 sm:pt-0">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12 px-4">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-semibold text-muted-foreground">
                No users found
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[150px]">User</TableHead>
                    <TableHead className="min-w-[100px]">Role</TableHead>
                    <TableHead className="min-w-[100px]">Status</TableHead>
                    <TableHead className="min-w-[80px]">Orders</TableHead>
                    <TableHead className="min-w-[120px]">Total Spent</TableHead>
                    <TableHead className="min-w-[120px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {/* Avatar */}
                          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-bold text-primary">
                              {user.username.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-sm truncate">
                              {user.username}
                            </p>
                            <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getRoleBadge(user.roles)}</TableCell>
                      <TableCell>{getStatusBadge(user.enabled)}</TableCell>
                      <TableCell>
                        {!(user.roles[0] == "ROLE_ADMIN") &&
                        <Badge variant="secondary">{user.totalOrders}</Badge>
}
                      </TableCell>
                      <TableCell className="font-semibold text-sm whitespace-nowrap">
                        {!(user.roles[0] == "ROLE_ADMIN") && (
                          <>₹{(user.totalSpent || 0).toLocaleString()}</>
                        )}
                      </TableCell>
                      <TableCell>
                        {!(user.roles[0] == "ROLE_ADMIN") &&
                        <div className="flex gap-1">
                          <EnhancedButton
                            variant="ghost"
                            size="sm"
                            title="View Details"
                            onClick={() => {
                              setSelectedUser(user);
                              setIsDetailDialogOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </EnhancedButton>
                          <EnhancedButton
                            variant="ghost"
                            size="sm"
                            title={user.enabled ? 'Disable User' : 'Enable User'}
                            disabled={toggling === user.id}
                            onClick={() => handleToggleStatus(user)}
                          >
                            {toggling === user.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : user.enabled ? (
                              <UserX className="h-4 w-4 text-red-600" />
                            ) : (
                              <UserCheck className="h-4 w-4 text-green-600" />
                            )}
                          </EnhancedButton>
                        </div>
}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              Full profile information for this user
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-4 py-2">
              {/* Avatar & Name */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">
                    {selectedUser.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-bold">{selectedUser.username}</h3>
                  <div className="flex gap-2 mt-1">
                    {getRoleBadge(selectedUser.roles)}
                    {getStatusBadge(selectedUser.enabled)}
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-2">
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  Contact Information
                </h4>
                <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedUser.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedUser.phone || 'Not provided'}</span>
                  </div>
                </div>
              </div>

              {/* Order Stats */}
              <div className="space-y-2">
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  Order Statistics
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-muted/50 rounded-lg p-3 text-center">
                    <ShoppingBag className="h-5 w-5 text-blue-500 mx-auto mb-1" />
                    <p className="text-2xl font-bold">{selectedUser.totalOrders}</p>
                    <p className="text-xs text-muted-foreground">Total Orders</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3 text-center">
                    <DollarSign className="h-5 w-5 text-green-500 mx-auto mb-1" />
                    <p className="text-2xl font-bold">
                      ₹{((selectedUser.totalSpent || 0) / 1000).toFixed(1)}K
                    </p>
                    <p className="text-xs text-muted-foreground">Total Spent</p>
                  </div>
                </div>
              </div>

              {/* Roles */}
              <div className="space-y-2">
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  Roles
                </h4>
                <div className="flex gap-2 flex-wrap">
                  {selectedUser.roles.map((role) => (
                    <Badge key={role} variant="outline">
                      {role.replace('ROLE_', '')}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <EnhancedButton
              variant="outline"
              onClick={() => setIsDetailDialogOpen(false)}
            >
              Close
            </EnhancedButton>
            {selectedUser && (
              <EnhancedButton
                variant={selectedUser.enabled ? 'destructive' : 'default'}
                disabled={toggling === selectedUser.id}
                onClick={() => handleToggleStatus(selectedUser)}
              >
                {toggling === selectedUser.id ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : selectedUser.enabled ? (
                  <>
                    <UserX className="mr-2 h-4 w-4" />
                    Disable User
                  </>
                ) : (
                  <>
                    <UserCheck className="mr-2 h-4 w-4" />
                    Enable User
                  </>
                )}
              </EnhancedButton>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCustomers;