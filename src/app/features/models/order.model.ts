import { CartItem } from "./cart.model";

export interface OrderModel {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  totalPrice: number;
  items: CartItem[];
  status: 'pending' | 'resolved' | 'rejected';
  createdAt?: string;
  archivedAt?: string;
  resolvedBy?: string; 
}
