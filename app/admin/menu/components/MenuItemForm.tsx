// yumzy/app/admin/menu/components/MenuItemForm.tsx
import { FoodItem } from '@/lib/db/schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.string().min(1, 'Price is required'),
  image: z.string().url('Must be a valid URL'),
  categoryId: z.string().uuid('Must be a valid UUID'),
  isAvailable: z.boolean(),
  isPopular: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

interface MenuItemFormProps {
  item?: FoodItem;
  onSubmit: (data: FormValues) => void;
  onCancel: () => void;
}

export function MenuItemForm({ item, onSubmit, onCancel }: MenuItemFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: item?.name || '',
      description: item?.description || '',
      price: item?.price || '',
      image: item?.image || '',
      categoryId: item?.categoryId || '',
      isAvailable: item?.isAvailable || true,
      isPopular: item?.isPopular || false,
    },
  });

  const submitHandler: SubmitHandler<FormValues> = (data) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(submitHandler)} className="space-y-4">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input id="name" {...register('name')} />
        {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" {...register('description')} />
        {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
      </div>
      <div>
        <Label htmlFor="price">Price</Label>
        <Input id="price" {...register('price')} />
        {errors.price && <p className="text-red-500 text-sm">{errors.price.message}</p>}
      </div>
      <div>
        <Label htmlFor="image">Image URL</Label>
        <Input id="image" {...register('image')} />
        {errors.image && <p className="text-red-500 text-sm">{errors.image.message}</p>}
      </div>
      <div>
        <Label htmlFor="categoryId">Category ID</Label>
        <Input id="categoryId" {...register('categoryId')} />
        {errors.categoryId && <p className="text-red-500 text-sm">{errors.categoryId.message}</p>}
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="isAvailable" {...register('isAvailable')} />
        <Label htmlFor="isAvailable">Available</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="isPopular" {...register('isPopular')} />
        <Label htmlFor="isPopular">Popular</Label>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save</Button>
      </div>
    </form>
  );
}
