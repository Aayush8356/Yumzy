// yumzy/app/admin/menu/components/MenuManagement.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { FoodItem } from '@/lib/db/schema';
import { MenuTable } from './MenuTable';
import { MenuItemForm } from './MenuItemForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

export function MenuManagement() {
  const [menuItems, setMenuItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FoodItem | undefined>(undefined);
  const { toast } = useToast();

  const fetchMenuItems = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/menu');
      const data = await response.json();
      if (data.success) {
        setMenuItems(data.items);
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
    fetchMenuItems();
  }, []);

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

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={() => { setEditingItem(undefined); setIsFormOpen(true); }}>Add New Item</Button>
      </div>
      <MenuTable items={menuItems} onEdit={handleEdit} onDelete={handleDelete} />
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
