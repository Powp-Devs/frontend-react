export interface Order {
  id: number;
  customerName: string;
  status: 'pending' | 'completed' | 'cancelled';
  amount: number;
  createdAt: string;
}
