'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRealtime } from '@/contexts/RealtimeContext';
import { useAuth } from '@/contexts/AuthContext';
import { 
  CheckCircle, 
  Clock, 
  Truck, 
  Package, 
  MapPin,
  Bell,
  Phone,
  MessageSquare
} from 'lucide-react';
import { motion } from 'framer-motion';

interface OrderTrackerProps {
  orderId: string;
  initialStatus?: string;
}

interface OrderStatus {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  description: string;
}

const ORDER_STATUSES: OrderStatus[] = [
  {
    id: 'pending',
    label: 'Order Placed',
    icon: <Package className="w-5 h-5" />,
    color: 'bg-yellow-100 text-yellow-800',
    description: 'Your order has been received and is being processed'
  },
  {
    id: 'preparing',
    label: 'Preparing',
    icon: <Clock className="w-5 h-5" />,
    color: 'bg-blue-100 text-blue-800',
    description: 'Our chefs are preparing your delicious meal'
  },
  {
    id: 'on-the-way',
    label: 'On the Way',
    icon: <Truck className="w-5 h-5" />,
    color: 'bg-purple-100 text-purple-800',
    description: 'Your order is on its way to you!'
  },
  {
    id: 'delivered',
    label: 'Delivered',
    icon: <CheckCircle className="w-5 h-5" />,
    color: 'bg-green-100 text-green-800',
    description: 'Your order has been delivered. Enjoy your meal!'
  }
];

export function OrderTracker({ orderId, initialStatus = 'pending' }: OrderTrackerProps) {
  const [currentStatus, setCurrentStatus] = useState(initialStatus);
  const [estimatedTime, setEstimatedTime] = useState('25-35 minutes');
  const [driverInfo, setDriverInfo] = useState(null);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const { updates, isConnected } = useRealtime();
  const { user } = useAuth();

  useEffect(() => {
    // Listen for real-time updates for this order
    const orderUpdates = updates.filter(
      update => update.type === 'order_status' && update.orderId === orderId
    );

    if (orderUpdates.length > 0) {
      const latestUpdate = orderUpdates[orderUpdates.length - 1];
      setCurrentStatus(latestUpdate.data.status);
      setLastUpdate(latestUpdate.data.updatedAt);
      
      // Update estimated time based on status
      if (latestUpdate.data.status === 'preparing') {
        setEstimatedTime('15-25 minutes');
      } else if (latestUpdate.data.status === 'on-the-way') {
        setEstimatedTime('5-10 minutes');
      } else if (latestUpdate.data.status === 'delivered') {
        setEstimatedTime('Completed');
      }
    }
  }, [updates, orderId]);

  const getCurrentStatusIndex = () => {
    return ORDER_STATUSES.findIndex(status => status.id === currentStatus);
  };

  const isStatusComplete = (index: number) => {
    return index <= getCurrentStatusIndex();
  };

  const getStatusBadge = (status: string) => {
    const statusObj = ORDER_STATUSES.find(s => s.id === status);
    return statusObj ? statusObj.color : 'bg-gray-100 text-gray-800';
  };

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Order #{orderId.slice(0, 8)}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge 
              className={`${getStatusBadge(currentStatus)} flex items-center gap-1`}
            >
              <Bell className="w-3 h-3" />
              {ORDER_STATUSES.find(s => s.id === currentStatus)?.label}
            </Badge>
            {isConnected && (
              <div className="flex items-center gap-1 text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs">Live</span>
              </div>
            )}
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Estimated delivery: {estimatedTime}
        </p>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-6">
          {/* Progress Timeline */}
          <div className="relative">
            <div className="absolute left-6 top-0 h-full w-0.5 bg-gray-200"></div>
            
            {ORDER_STATUSES.map((status, index) => (
              <motion.div
                key={status.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative flex items-center gap-4 pb-6 ${
                  index === ORDER_STATUSES.length - 1 ? 'pb-0' : ''
                }`}
              >
                <div
                  className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-2 ${
                    isStatusComplete(index)
                      ? 'bg-green-500 border-green-500 text-white'
                      : currentStatus === status.id
                      ? 'bg-blue-500 border-blue-500 text-white animate-pulse'
                      : 'bg-gray-100 border-gray-300 text-gray-400'
                  }`}
                >
                  {status.icon}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={`font-medium ${
                      isStatusComplete(index) 
                        ? 'text-green-700' 
                        : currentStatus === status.id
                        ? 'text-blue-700'
                        : 'text-gray-500'
                    }`}>
                      {status.label}
                    </h3>
                    {currentStatus === status.id && (
                      <Badge variant="secondary" className="text-xs">
                        Current
                      </Badge>
                    )}
                  </div>
                  <p className={`text-sm ${
                    isStatusComplete(index) 
                      ? 'text-gray-700' 
                      : 'text-gray-500'
                  }`}>
                    {status.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Driver Info (when on the way) */}
          {currentStatus === 'on-the-way' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-blue-50 p-4 rounded-lg border border-blue-200"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <Truck className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-blue-900">Driver Assigned</h4>
                  <p className="text-sm text-blue-700">
                    Mike Johnson • Toyota Camry (ABC-123)
                  </p>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 bg-blue-100 hover:bg-blue-200 rounded-full">
                    <Phone className="w-4 h-4 text-blue-600" />
                  </button>
                  <button className="p-2 bg-blue-100 hover:bg-blue-200 rounded-full">
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Delivery Address */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gray-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Delivery Address</h4>
                <p className="text-sm text-gray-600">
                  123 Main Street, Apt 4B<br />
                  New York, NY 10001
                </p>
              </div>
            </div>
          </div>

          {/* Last Update */}
          {lastUpdate && (
            <div className="text-center">
              <p className="text-xs text-gray-500">
                Last updated: {formatTime(lastUpdate)}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}