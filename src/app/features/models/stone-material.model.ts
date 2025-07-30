export interface StoneMaterial {
  id: number;
  name: string;
  textureUrl?: string;
  colorHex: string;
  pricePerM2: number;
  isAvailable: boolean;
  createdAt: Date;
}
