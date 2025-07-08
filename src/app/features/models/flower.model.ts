export interface FlowerModel {
    id: number;
    name: string;
    description?: string;
    price: number;
    stock: number;
    imageUrl?: string;
    createdAt: Date;
    updatedAt: Date;
  }
  