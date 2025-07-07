export interface PogrebniArtikl {
    id: number;
    name: string;
    description?: string;
    price: number;
    stock: number;
    imageUrl?: string;
    category?: string;
    createdAt: Date;
    updatedAt: Date;
  }
  