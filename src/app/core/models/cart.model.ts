export interface CartItem {
  id: string;
  originalProductId: string;
  name: string;
  price: number;
  quantity: number;
  image_url: string | null;
  selectedEntry?: {
    qty: number;
    price: number;
    bonus: string | null;
  };
}
