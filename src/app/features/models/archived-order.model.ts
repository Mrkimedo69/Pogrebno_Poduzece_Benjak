export interface ArchivedOrderModel {
    id: number;
    fullName: string;
    email: string;
    totalPrice: number;
    items: any[];
    originalOrderId: number;
    resolvedBy: string;
    archivedAt: string;
  }
  