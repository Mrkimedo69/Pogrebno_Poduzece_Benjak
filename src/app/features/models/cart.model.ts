type ItemType = 'cvijet' | 'artikl';

export interface CartItem {
    id: number;
    name: string;
    quantity: number;
    imageUrl?: string;
    price: number;
    category: ItemType;
    stock: number;
  }