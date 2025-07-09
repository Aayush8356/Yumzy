// yumzy/app/admin/menu/components/MenuTable.tsx
import { FoodItem } from '@/lib/db/schema';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface MenuTableProps {
  items: FoodItem[];
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
          <TableHead>Category ID</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={item.id}>
            <TableCell>
              <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-md" />
            </TableCell>
            <TableCell>{item.name}</TableCell>
            <TableCell>{item.categoryId}</TableCell>
            <TableCell>{item.price}</TableCell>
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
