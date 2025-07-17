// yumzy/app/admin/menu/components/MenuTable.tsx
import { FoodItem } from '@/lib/db/schema';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';

interface MenuTableProps {
  items: (FoodItem & { category?: string })[];
  onEdit: (item: FoodItem) => void;
  onDelete: (id: string) => void;
}

export function MenuTable({ items, onEdit, onDelete }: MenuTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Image</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={item.id}>
            <TableCell>
              <div className="w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center">
                {item.image ? (
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-16 h-16 object-cover rounded-md"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.parentElement!.innerHTML = `<span class="text-gray-500 text-xs">No Image</span>`;
                    }}
                  />
                ) : (
                  <span className="text-gray-500 text-xs">No Image</span>
                )}
              </div>
            </TableCell>
            <TableCell>
              <div>
                <div className="font-medium">{item.name}</div>
                {item.description && (
                  <div className="text-sm text-gray-500 truncate max-w-xs">
                    {item.description}
                  </div>
                )}
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="outline">
                {item.category || 'No Category'}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="font-medium">₹{item.price}</div>
              {item.rating && (
                <div className="text-sm text-gray-500">
                  ★ {item.rating}
                </div>
              )}
            </TableCell>
            <TableCell>
              <Badge variant={item.isAvailable ? 'default' : 'secondary'}>
                {item.isAvailable ? 'Available' : 'Unavailable'}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => onEdit(item)}>
                  Edit
                </Button>
                <Button variant="destructive" size="sm" onClick={() => onDelete(item.id)}>
                  Delete
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
