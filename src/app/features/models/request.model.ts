export interface MonumentDesignRequest {
  userEmail: string;
  userPhone: string;
  userNote: string;
  material: string;
  monumentShape: string;
  graveType: 'jedno' | 'duplo';
  totalArea: number;
  totalPrice: number;
  designParts: {
    naziv: string;
    width: number;
    height?: number;
    height1?: number;
    height2?: number;
    boja: string;
  }[]
  materialWidth: number,
  image2DBase64: string;
}
