import { StoneMaterial } from './stone-material.model';

export interface Monument {
  id: number;
  name: string;
  previewImageUrl?: string;
  description?: string;
  defaultMaterial?: StoneMaterial;
  createdAt: Date;
}
