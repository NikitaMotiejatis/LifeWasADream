import { createContext, useContext, useMemo, useState, ReactNode } from 'react';
import { Currency, useCurrency } from '@/global/contexts/currencyContext';

// Monetary values are kept in cents to avoid floating point drift.
export type Cents = number;

export type Variation = {
  id: number;
  name: string;
  nameKey?: string;
  priceModifier: Cents;
};

export type Product = {
  id: string;
  name: string;
  nameKey?: string;
  basePrice: Cents;
  categories?: string[];
  variations?: Variation[];
};

export type CartItem = {
  id: number;
  product: Product;
  selectedVariations: Variation[];
  quantity: number;
  instanceId?: string; // Added for split bill tracking
};

export type Promotion =
  | { type: 'percent'; value: number }
  | { type: 'fixed'; value: Cents }
  | { type: 'price'; value: Cents };

export type Promotions = Record<string, Promotion>;

export type CartDiscount =
  | { type: 'percent'; value: number }
  | { type: 'fixed'; value: Cents };

export type CartKey = string;

type CartContextType = {
  // Cart Items
  items: Record<CartKey, CartItem>;
  itemsList: CartItem[];
  addToCart: (product: Product, variations?: Variation[]) => void;
  updateQuantity: (key: CartKey, delta: number) => void;
  removeItem: (key: CartKey) => void;
  clearCart: () => void;

  // Promotions & Discounts
  promotions: Promotions;
  setPromotions: (p: Promotions) => void;
  cartDiscount: CartDiscount | null;
  setCartDiscount: (discount: CartDiscount | null) => void;

  // Pricing Calculations
  subtotal: number;
  discountTotal: number;
  cartDiscountAmount: number;
  totalWithoutTip: number;
  
  // Tip Management
  tipAmount: number;
  setTipAmount: (amount: number) => void;
  
  // Individual tips for split payments
  individualTips: number[];
  setIndividualTip: (index: number, amount: number) => void;
  clearIndividualTips: () => void;
  getIndividualTipsTotal: () => number;
  
  // Final Totals
  total: number;
  splitModeTotal: (payerIndex?: number) => number;

  // Currency
  currency: Currency;
  setCurrency: (c: Currency) => void;
  formatPrice: (price: Cents) => string;

  getFinalPrice: (product: Product, variations: Variation[]) => Cents;
  getDiscountFor: (
    productId: string,
  ) => { amount: Cents; formatted: string } | null;

  generateKey: (product: Product, variations: Variation[]) => CartKey;

  // Payment State
  isPaymentStarted: boolean;
  setIsPaymentStarted: (isPaymentStarted: boolean) => void;
  
  // Split Bill State
  isSplitMode: boolean;
  setIsSplitMode: (enabled: boolean) => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const generateKey = (
  product: Product,
  variations: Variation[],
): CartKey => {
  const variationKey = variations
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(v => v.name)
    .join('|||');

  return `${product.id}___${variationKey || 'default'}`;
};

const clampToCents = (value: number): Cents =>
  Math.max(0, Math.round(value));

const MAX_PAYERS = 50;
const MAX_QUANTITY = 9999;

export const CartProvider = ({ initItems = [], children }: { initItems?: CartItem[], children: ReactNode }) => {
  const { currency, setCurrency, formatPrice } = useCurrency();
  
  // Cart Items State
  const [items, setItems] = useState<Record<CartKey, CartItem>>(initItems.reduce((acc, item) => {
    return { 
      ...acc,
      [generateKey(item.product, item.selectedVariations)]: item,
    };
  }, {} as Record<CartKey, CartItem>));
  
  // Promotions & Discounts
  const [promotions, setPromotions] = useState<Promotions>({
    'iced-latte': { type: 'percent', value: 50 },
  });
  
  const [cartDiscount, setCartDiscount] = useState<CartDiscount | null>(null);
  const [isPaymentStarted, setIsPaymentStarted] = useState<boolean>(false);
  const [isSplitMode, setIsSplitMode] = useState<boolean>(false);
  
  // Tip Management
  const [tipAmount, setTipAmount] = useState<number>(0);
  const [individualTips, setIndividualTips] = useState<number[]>(Array(MAX_PAYERS).fill(0));

  // Cart Operations
  const addToCart = (
    product: Product,
    selectedVariations: Variation[] = [],
  ) => {
    const key = generateKey(product, selectedVariations);
    setItems(prev => ({
      ...prev,
      [key]: prev[key]
        ? { ...prev[key], quantity: prev[key].quantity + 1 }
        : { id: 0, product, selectedVariations, quantity: 1 },
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

      if (newQty > MAX_QUANTITY) {
        return {
          ...prev,
          [key]: { ...item, quantity: MAX_QUANTITY },
        };
      }

      return {
        ...prev,
        [key]: { ...item, quantity: newQty },
      };
    });
  };

  const removeItem = (key: CartKey) => {
    setItems(prev => {
      const { [key]: _, ...rest } = prev;
      return rest;
    });
  };

  const clearCart = () => {
    setItems({});
    setTipAmount(0);
    setIndividualTips(Array(MAX_PAYERS).fill(0));
    setIsSplitMode(false);
  };

  // Individual Tip Management
  const setIndividualTip = (index: number, amount: number) => {
    if (index < 0 || index >= MAX_PAYERS) return;
    
    setIndividualTips(prev => {
      const newTips = [...prev];
      newTips[index] = amount;
      return newTips;
    });
  };

  const clearIndividualTips = () => {
    setIndividualTips(Array(MAX_PAYERS).fill(0));
  };

  const getIndividualTipsTotal = () => {
    return individualTips.reduce((sum, tip) => sum + tip, 0);
  };

  // Price Calculations
  const getFinalPrice = (product: Product, variations: Variation[]): number => {
    const extra = variations.reduce((sum, v) => sum + v.priceModifier, 0);
    return Math.max(0, product.basePrice + extra);
  };

  // Calculate totals
  const { subtotal, itemDiscountsTotal, cartDiscountAmount, totalWithoutTip } =
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
            priceAfterPromo = clampToCents(
              basePrice * (1 - promo.value / 100),
            );
          } else if (promo.type === 'fixed') {
            priceAfterPromo = clampToCents(priceAfterPromo - promo.value);
          } else if (promo.type === 'price') {
            priceAfterPromo = clampToCents(promo.value);
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
          cartDiscountAmount = clampToCents(
            afterItemsTotal * (cartDiscount.value / 100),
          );
        } else if (cartDiscount.type === 'fixed') {
          cartDiscountAmount = Math.min(afterItemsTotal, cartDiscount.value);
        }
      }

      const totalWithoutTip = Math.max(0, afterItemsTotal - cartDiscountAmount);

      return {
        subtotal,
        itemDiscountsTotal,
        cartDiscountAmount,
        totalWithoutTip,
      };
    }, [items, promotions, cartDiscount]);

  // Calculate appropriate total based on mode
  const total = useMemo(() => {
    if (isSplitMode) {
      return totalWithoutTip + getIndividualTipsTotal();
    }
    return totalWithoutTip + tipAmount;
  }, [isSplitMode, totalWithoutTip, tipAmount, getIndividualTipsTotal]);

  // Helper for split mode to get individual payer total
  const splitModeTotal = (payerIndex?: number) => {
    if (!isSplitMode || payerIndex === undefined) {
      return totalWithoutTip;
    }
    
    const individualTip = individualTips[payerIndex] || 0;
    return totalWithoutTip + individualTip;
  };

  const discountTotal = itemDiscountsTotal + cartDiscountAmount;
  const itemsList = Object.values(items);

  const getDiscountFor = (productId: string) => {
    const promo = promotions[productId];
    if (!promo) return null;

    const item = itemsList.find(i => i.product.id === productId);
    if (!item) return null;

    const base = getFinalPrice(item.product, item.selectedVariations);
    let discount = 0;

    if (promo.type === 'percent')
      discount = clampToCents(base * (promo.value / 100));
    else if (promo.type === 'fixed') discount = Math.min(base, promo.value);
    else if (promo.type === 'price') discount = clampToCents(base - promo.value);

    return discount > 0
      ? { amount: discount, formatted: formatPrice(discount) }
      : null;
  };

  return (
    <CartContext.Provider
      value={{
        // Cart Items
        items,
        itemsList,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,

        // Promotions & Discounts
        promotions,
        setPromotions,
        cartDiscount,
        setCartDiscount,

        // Pricing
        subtotal,
        discountTotal,
        cartDiscountAmount,
        totalWithoutTip,

        // Tip Management
        tipAmount,
        setTipAmount,
        individualTips,
        setIndividualTip,
        clearIndividualTips,
        getIndividualTipsTotal,

        // Totals
        total,
        splitModeTotal,

        // Currency
        currency,
        setCurrency,
        formatPrice,

        // Utilities
        getFinalPrice,
        getDiscountFor,
        generateKey,

        // Payment State
        isPaymentStarted,
        setIsPaymentStarted,
        
        // Split Bill State
        isSplitMode,
        setIsSplitMode,
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
