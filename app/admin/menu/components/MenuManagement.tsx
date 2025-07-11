// yumzy/app/admin/menu/components/MenuManagement.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FoodItem } from '@/lib/db/schema';
import { MenuTable } from './MenuTable';
import { MenuItemForm } from './MenuItemForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

export function MenuManagement() {
  const [menuItems, setMenuItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FoodItem | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });
  const { toast } = useToast();

  const fetchMenuItems = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        search: searchTerm,
      });
      
      const response = await fetch(`/api/admin/menu?${params}`);
      const data = await response.json();
      if (data.success) {
        setMenuItems(data.items);
        if (data.pagination) {
          setPagination(data.pagination);
        }
      } else {
        toast({ title: 'Error', description: data.error, variant: 'destructive' });
      }
    } catch (error) {
      console.error("Failed to fetch menu items:", error);
      toast({ title: 'Error', description: 'Could not fetch menu items.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(fetchMenuItems, 300);
    return () => clearTimeout(debounceTimer);
  }, [pagination.page, pagination.limit, searchTerm]);

  const handleEdit = (item: FoodItem) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      try {
        const response = await fetch(`/api/admin/menu/${id}`, { method: 'DELETE' });
        if (response.ok) {
          toast({ title: 'Success', description: 'Menu item deleted.' });
          fetchMenuItems();
        } else {
          toast({ title: 'Error', description: 'Failed to delete menu item.', variant: 'destructive' });
        }
      } catch (error) {
        console.error('Failed to delete menu item:', error);
        toast({ title: 'Error', description: 'Failed to delete menu item.', variant: 'destructive' });
      }
    }
  };

  const handleFormSubmit = async (data: any) => {
    const url = editingItem ? `/api/admin/menu/${editingItem.id}` : '/api/admin/menu';
    const method = editingItem ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast({ title: 'Success', description: `Menu item ${editingItem ? 'updated' : 'created'}.` });
        setIsFormOpen(false);
        fetchMenuItems();
      } else {
        toast({ title: 'Error', description: 'Failed to save menu item.', variant: 'destructive' });
      }
    } catch (error) {
      console.error('Failed to save menu item:', error);
      toast({ title: 'Error', description: 'Failed to save menu item.', variant: 'destructive' });
    }
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleLimitChange = (newLimit: number) => {
    setPagination(prev => ({ ...prev, limit: newLimit, page: 1 }));
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Search and Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search menu items..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Items per page:</span>
            <Select value={pagination.limit.toString()} onValueChange={(value) => handleLimitChange(parseInt(value))}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button onClick={() => { setEditingItem(undefined); setIsFormOpen(true); }}>
          Add New Item
        </Button>
      </div>

      {/* Results Summary */}
      {pagination.total > 0 && (
        <div className="flex items-center justify-between bg-muted/50 rounded-lg p-4">
          <span className="text-sm text-muted-foreground">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} items
          </span>
          <span className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages}
          </span>
        </div>
      )}

      {/* Menu Table */}
      <MenuTable items={menuItems} onEdit={handleEdit} onDelete={handleDelete} />

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center">
          <div className="flex items-center gap-2">
            {/* Previous Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={!pagination.hasPrev}
              className="flex items-center gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1">
              {/* First page */}
              {pagination.page > 3 && (
                <>
                  <Button
                    variant={1 === pagination.page ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(1)}
                  >
                    1
                  </Button>
                  {pagination.page > 4 && (
                    <span className="px-2 text-muted-foreground">...</span>
                  )}
                </>
              )}

              {/* Previous pages */}
              {pagination.page > 2 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                >
                  {pagination.page - 1}
                </Button>
              )}

              {/* Current page */}
              <Button
                variant="default"
                size="sm"
                className="cursor-default"
              >
                {pagination.page}
              </Button>

              {/* Next pages */}
              {pagination.page < pagination.totalPages - 1 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                >
                  {pagination.page + 1}
                </Button>
              )}

              {/* Last page */}
              {pagination.page < pagination.totalPages - 2 && (
                <>
                  {pagination.page < pagination.totalPages - 3 && (
                    <span className="px-2 text-muted-foreground">...</span>
                  )}
                  <Button
                    variant={pagination.totalPages === pagination.page ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(pagination.totalPages)}
                  >
                    {pagination.totalPages}
                  </Button>
                </>
              )}
            </div>

            {/* Next Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={!pagination.hasNext}
              className="flex items-center gap-1"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}</DialogTitle>
          </DialogHeader>
          <MenuItemForm
            item={editingItem}
            onSubmit={handleFormSubmit}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
