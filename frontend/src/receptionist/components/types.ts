import { Variation, Product, type Cents } from '@/receptionist/contexts/cartContext';

export type OrderItem = {
  id: string;
  product: ExtendedProduct;
  quantity: number;
  selectedVariations: Variation[];
  finalPrice: Cents;
};

export type ExtendedProduct = Product & {
  categories?: string[];
  variations?: Variation[];
};

export type EditOrderPanelProps = {
  mode: 'edit';
  orderId: string;
  onSave?: (items: OrderItem[]) => void;
  onCancel?: () => void;
  onAddMoreItems?: (items: OrderItem[]) => void;
};

export type PaymentMethod = 'Cash' | 'Card' | 'Gift card';
