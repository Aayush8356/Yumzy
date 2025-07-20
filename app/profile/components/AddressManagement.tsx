'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { MapPin, Plus, Edit, Trash2, Home, Building, Heart } from 'lucide-react';
import { toast } from 'sonner';

interface Address {
  id: string;
  userId: string;
  type: 'home' | 'work' | 'other';
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  landmark?: string;
  instructions?: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AddressFormData {
  type: 'home' | 'work' | 'other';
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  landmark: string;
  instructions: string;
  isDefault: boolean;
}

export function AddressManagement({ userId }: { userId: string }) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [formData, setFormData] = useState<AddressFormData>({
    type: 'home',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'United States',
    landmark: '',
    instructions: '',
    isDefault: false
  });

  const fetchAddresses = async () => {
    try {
      const response = await fetch(`/api/addresses?userId=${userId}`);
      const data = await response.json();
      if (data.success) {
        setAddresses(data.addresses);
      }
    } catch (error) {
      console.error('Failed to fetch addresses:', error);
      toast.error('Failed to load addresses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, [userId]);

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, userId })
      });

      const data = await response.json();
      if (data.success) {
        setAddresses([...addresses, data.address]);
        setIsAddingAddress(false);
        setFormData({
          type: 'home',
          street: '',
          city: '',
          state: '',
          postalCode: '',
          country: 'United States',
          landmark: '',
          instructions: '',
          isDefault: false
        });
        toast.success('Address added successfully');
      } else {
        toast.error(data.error || 'Failed to add address');
      }
    } catch (error) {
      console.error('Error adding address:', error);
      toast.error('Failed to add address');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAddress) return;
    
    setLoading(true);

    try {
      const response = await fetch(`/api/addresses/${editingAddress.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (data.success) {
        setAddresses(addresses.map(addr => 
          addr.id === editingAddress.id ? data.address : addr
        ));
        setEditingAddress(null);
        toast.success('Address updated successfully');
      } else {
        toast.error(data.error || 'Failed to update address');
      }
    } catch (error) {
      console.error('Error updating address:', error);
      toast.error('Failed to update address');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    
    setLoading(true);

    try {
      const response = await fetch(`/api/addresses/${addressId}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      if (data.success) {
        setAddresses(addresses.filter(addr => addr.id !== addressId));
        toast.success('Address deleted successfully');
      } else {
        toast.error(data.error || 'Failed to delete address');
      }
    } catch (error) {
      console.error('Error deleting address:', error);
      toast.error('Failed to delete address');
    } finally {
      setLoading(false);
    }
  };

  const getAddressIcon = (type: string) => {
    switch (type) {
      case 'home': return <Home className="h-4 w-4" />;
      case 'work': return <Building className="h-4 w-4" />;
      default: return <MapPin className="h-4 w-4" />;
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'home',
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'United States',
      landmark: '',
      instructions: '',
      isDefault: false
    });
  };

  const startEdit = (address: Address) => {
    setEditingAddress(address);
    setFormData({
      type: address.type,
      street: address.street,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
      landmark: address.landmark || '',
      instructions: address.instructions || '',
      isDefault: address.isDefault
    });
  };

  const AddressForm = ({ onSubmit, submitText }: { onSubmit: (e: React.FormEvent) => void; submitText: string }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <Label htmlFor="type">Address Type</Label>
        <Select value={formData.type} onValueChange={(value: any) => setFormData({...formData, type: value})}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="home">Home</SelectItem>
            <SelectItem value="work">Work</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="street">Street Address</Label>
        <Input
          id="street"
          value={formData.street}
          onChange={(e) => setFormData({...formData, street: e.target.value})}
          placeholder="123 Main St"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            value={formData.city}
            onChange={(e) => setFormData({...formData, city: e.target.value})}
            placeholder="New York"
            required
          />
        </div>
        <div>
          <Label htmlFor="state">State</Label>
          <Input
            id="state"
            value={formData.state}
            onChange={(e) => setFormData({...formData, state: e.target.value})}
            placeholder="NY"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="postalCode">Postal Code</Label>
          <Input
            id="postalCode"
            value={formData.postalCode}
            onChange={(e) => setFormData({...formData, postalCode: e.target.value})}
            placeholder="10001"
            required
          />
        </div>
        <div>
          <Label htmlFor="country">Country</Label>
          <Input
            id="country"
            value={formData.country}
            onChange={(e) => setFormData({...formData, country: e.target.value})}
            placeholder="United States"
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="landmark">Landmark (Optional)</Label>
        <Input
          id="landmark"
          value={formData.landmark}
          onChange={(e) => setFormData({...formData, landmark: e.target.value})}
          placeholder="Near Central Park"
        />
      </div>

      <div>
        <Label htmlFor="instructions">Delivery Instructions (Optional)</Label>
        <Textarea
          id="instructions"
          value={formData.instructions}
          onChange={(e) => setFormData({...formData, instructions: e.target.value})}
          placeholder="Leave at door, call when arrived, etc."
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="isDefault"
          checked={formData.isDefault}
          onCheckedChange={(checked) => setFormData({...formData, isDefault: checked})}
        />
        <Label htmlFor="isDefault">Set as default address</Label>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={() => {
          setIsAddingAddress(false);
          setEditingAddress(null);
          resetForm();
        }}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {submitText}
        </Button>
      </div>
    </form>
  );

  if (loading && addresses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Delivery Addresses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading addresses...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Delivery Addresses</span>
          <Dialog open={isAddingAddress} onOpenChange={setIsAddingAddress}>
            <DialogTrigger asChild>
              <Button onClick={() => { resetForm(); setIsAddingAddress(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Address
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-sm sm:max-w-md mx-2 sm:mx-0">
              <DialogHeader>
                <DialogTitle>Add New Address</DialogTitle>
              </DialogHeader>
              <AddressForm onSubmit={handleAddAddress} submitText="Add Address" />
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {addresses.length === 0 ? (
          <div className="text-center py-8">
            <MapPin className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">No addresses added yet</p>
            <p className="text-sm text-gray-400">Add your first delivery address to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {addresses.map((address) => (
              <div key={address.id} className="border rounded-lg p-4 relative">
                {address.isDefault && (
                  <Badge className="absolute top-2 right-2 bg-green-100 text-green-800">
                    Default
                  </Badge>
                )}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      {getAddressIcon(address.type)}
                      <span className="ml-2 font-medium capitalize">{address.type}</span>
                    </div>
                    <p className="text-gray-900">{address.street}</p>
                    <p className="text-gray-600">
                      {address.city}, {address.state} {address.postalCode}
                    </p>
                    <p className="text-gray-600">{address.country}</p>
                    {address.landmark && (
                      <p className="text-sm text-gray-500 mt-1">
                        Landmark: {address.landmark}
                      </p>
                    )}
                    {address.instructions && (
                      <p className="text-sm text-gray-500 mt-1">
                        Instructions: {address.instructions}
                      </p>
                    )}
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <Dialog open={editingAddress?.id === address.id} onOpenChange={(open) => {
                      if (!open) {
                        setEditingAddress(null);
                        resetForm();
                      }
                    }}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => startEdit(address)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="w-[95vw] max-w-sm sm:max-w-md mx-2 sm:mx-0">
                        <DialogHeader>
                          <DialogTitle>Edit Address</DialogTitle>
                        </DialogHeader>
                        <AddressForm onSubmit={handleUpdateAddress} submitText="Update Address" />
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteAddress(address.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}