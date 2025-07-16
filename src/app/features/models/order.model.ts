export interface OrderModel {
    id: number;
    fullName: string;
    email: string;
    status: 'pending' | 'resolved' | 'rejected';
    items: { name: string; price: number; quantity: number }[];
    totalPrice: number;
    createdAt: string;
  }
  