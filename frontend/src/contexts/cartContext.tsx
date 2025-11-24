import { createContext, useContext, useMemo, useState, ReactNode } from 'react';
import { Currency, useCurrency } from './currencyContext';

export type Variation = {
  name: string;
  priceModifier: number;
};

export type Product = {
  id: string;
  name: string;
  basePrice: number;
  variations?: Variation[];
};

export type CartItem = {
  product: Product;
  selectedVariations: Variation[];
  quantity: number;
};

export type Promotion =
  | { type: 'percent'; value: number }
  | { type: 'fixed'; value: number }
  | { type: 'price'; value: number };

export type Promotions = Record<string, Promotion>;

export type CartDiscount =
  | { type: 'percent'; value: number }
  | { type: 'fixed'; value: number };

type CartKey = string;

type CartContextType = {
  items: Record<CartKey, CartItem>;
  itemsList: CartItem[];
  addToCart: (product: Product, variations?: Variation[]) => void;
  updateQuantity: (key: CartKey, delta: number) => void;
  removeItem: (key: CartKey) => void;
  clearCart: () => void;

  promotions: Promotions;
  setPromotions: (p: Promotions) => void;

  cartDiscount: CartDiscount | null;
  setCartDiscount: (discount: CartDiscount | null) => void;

  subtotal: number;
  discountTotal: number;
  cartDiscountAmount: number;
  total: number;

  currency: Currency;
  setCurrency: (c: Currency) => void;
  formatPrice: (price: number) => string;

  getFinalPrice: (product: Product, variations: Variation[]) => number;
  getDiscountFor: (
    productId: string,
  ) => { amount: number; formatted: string } | null;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { currency, setCurrency, formatPrice } = useCurrency();
  const [items, setItems] = useState<Record<CartKey, CartItem>>({});
  const [promotions, setPromotions] = useState<Promotions>({
    'iced-latte': { type: 'percent', value: 50 },
  });
  const [cartDiscount, setCartDiscount] = useState<CartDiscount | null>({
    type: 'fixed',
    value: 10,
  });

  const generateKey = (product: Product, variations: Variation[]): CartKey => {
    const vars =
      variations.length > 0
        ? variations
            .map(v => v.name)
            .sort()
            .join('|')
        : 'default';
    return `${product.id}__${vars}`;
  };

  const addToCart = (
    product: Product,
    selectedVariations: Variation[] = [],
  ) => {
    const key = generateKey(product, selectedVariations);
    setItems(prev => ({
      ...prev,
      [key]: prev[key]
        ? { ...prev[key], quantity: prev[key].quantity + 1 }
        : { product, selectedVariations, quantity: 1 },
    }));
  };

  const updateQuantity = (key: CartKey, delta: number) => {
    setItems(prev => {
      const item = prev[key];
      if (!item) return prev;
      const newQty = item.quantity + delta;
      if (newQty <= 0) {
        const { [key]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [key]: { ...item, quantity: newQty } };
    });
  };

  const removeItem = (key: CartKey) => {
    setItems(prev => {
      const { [key]: _, ...rest } = prev;
      return rest;
    });
  };

  const clearCart = () => setItems({});

  const getFinalPrice = (product: Product, variations: Variation[]): number => {
    const base = product.basePrice;
    const extra = variations.reduce((sum, v) => sum + v.priceModifier, 0);
    return Math.max(0, base + extra);
  };

  const { subtotal, itemDiscountsTotal, cartDiscountAmount, total } =
    useMemo(() => {
      let subtotal = 0;
      let itemDiscountsTotal = 0;
      let afterItemsTotal = 0;

      Object.values(items).forEach(item => {
        const { product, selectedVariations, quantity } = item;
        const basePrice = getFinalPrice(product, selectedVariations);
        const promo = promotions[product.id];

        let priceAfterPromo = basePrice;

        if (promo) {
          if (promo.type === 'percent') {
            priceAfterPromo *= 1 - promo.value / 100;
          } else if (promo.type === 'fixed') {
            priceAfterPromo = Math.max(0, priceAfterPromo - promo.value);
          } else if (promo.type === 'price') {
            priceAfterPromo = promo.value;
          }
        }

        const itemDiscount = basePrice - priceAfterPromo;

        subtotal += basePrice * quantity;
        itemDiscountsTotal += itemDiscount * quantity;
        afterItemsTotal += priceAfterPromo * quantity;
      });

      let cartDiscountAmount = 0;
      if (cartDiscount && afterItemsTotal > 0) {
        if (cartDiscount.type === 'percent') {
          cartDiscountAmount = afterItemsTotal * (cartDiscount.value / 100);
        } else if (cartDiscount.type === 'fixed') {
          cartDiscountAmount = Math.min(afterItemsTotal, cartDiscount.value);
        }
      }

      const total = Math.max(0, afterItemsTotal - cartDiscountAmount);

      return {
        subtotal,
        itemDiscountsTotal,
        afterItemsTotal,
        cartDiscountAmount,
        total,
      };
    }, [items, promotions, cartDiscount]);

  const discountTotal = itemDiscountsTotal + cartDiscountAmount;

  const itemsList = Object.values(items);

  const getDiscountFor = (productId: string) => {
    const promo = promotions[productId];
    if (!promo) return null;

    const item = Object.values(items).find(i => i.product.id === productId);
    if (!item) return null;

    const base = getFinalPrice(item.product, item.selectedVariations);
    let discount = 0;

    if (promo.type === 'percent') discount = base * (promo.value / 100);
    else if (promo.type === 'fixed') discount = promo.value;
    else if (promo.type === 'price') discount = Math.max(0, base - promo.value);

    return discount > 0
      ? { amount: discount, formatted: formatPrice(discount) }
      : null;
  };

  return (
    <CartContext.Provider
      value={{
        items,
        itemsList,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        promotions,
        setPromotions,
        cartDiscount,
        setCartDiscount,
        subtotal,
        discountTotal,
        cartDiscountAmount,
        total,
        currency,
        setCurrency,
        formatPrice,
        getFinalPrice,
        getDiscountFor,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
