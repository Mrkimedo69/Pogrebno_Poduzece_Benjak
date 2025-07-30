export interface StoneMaterial {
  id: number;
  name: string;
  textureUrl: string;
  color: string;
  pricePerM2: number;
  isAvailable: boolean;
  createdAt: Date;
}
