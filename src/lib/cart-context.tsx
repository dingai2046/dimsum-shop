"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  price: number; // 分
  image: string;
  quantity: number;
}

export type DeliveryType = "delivery" | "pickup";
export type BuyerType = "retail" | "wholesale";

interface CartContextType {
  items: CartItem[];
  totalItems: number;
  totalPrice: number; // 分
  subtotal: number; // 分（不含配送费）
  deliveryType: DeliveryType;
  buyerType: BuyerType;
  deliveryFee: number; // 分
  setDeliveryType: (type: DeliveryType) => void;
  setBuyerType: (type: BuyerType) => void;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getItemQuantity: (productId: string) => number;
}

const CartContext = createContext<CartContextType | null>(null);

const CART_STORAGE_KEY = "dongfang-cart";
const PREFS_STORAGE_KEY = "dongfang-prefs";

// 配送费规则（分）
const DELIVERY_FEE = 500; // $5
export const FREE_DELIVERY_THRESHOLD = 5000; // 满$50免运费
export const MIN_ORDER_AMOUNT = 2000; // 外送满$20起送

function loadCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(CART_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function loadPrefs(): { deliveryType: DeliveryType; buyerType: BuyerType } {
  if (typeof window === "undefined") return { deliveryType: "delivery", buyerType: "retail" };
  try {
    const data = localStorage.getItem(PREFS_STORAGE_KEY);
    return data ? JSON.parse(data) : { deliveryType: "delivery", buyerType: "retail" };
  } catch {
    return { deliveryType: "delivery", buyerType: "retail" };
  }
}

function saveCart(items: CartItem[]) {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch {}
}

function savePrefs(prefs: { deliveryType: DeliveryType; buyerType: BuyerType }) {
  try {
    localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(prefs));
  } catch {}
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [deliveryType, setDeliveryTypeState] = useState<DeliveryType>("delivery");
  const [buyerType, setBuyerTypeState] = useState<BuyerType>("retail");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setItems(loadCart());
    const prefs = loadPrefs();
    setDeliveryTypeState(prefs.deliveryType);
    setBuyerTypeState(prefs.buyerType);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) saveCart(items);
  }, [items, mounted]);

  useEffect(() => {
    if (mounted) savePrefs({ deliveryType, buyerType });
  }, [deliveryType, buyerType, mounted]);

  const setDeliveryType = useCallback((type: DeliveryType) => {
    setDeliveryTypeState(type);
  }, []);

  const setBuyerType = useCallback((type: BuyerType) => {
    setBuyerTypeState(type);
  }, []);

  const addItem = useCallback(
    (item: Omit<CartItem, "quantity">, quantity = 1) => {
      setItems((prev) => {
        const existing = prev.find((i) => i.productId === item.productId);
        if (existing) {
          return prev.map((i) =>
            i.productId === item.productId
              ? { ...i, quantity: i.quantity + quantity }
              : i
          );
        }
        return [...prev, { ...item, quantity }];
      });
    },
    []
  );

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.productId !== productId));
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.productId === productId ? { ...i, quantity } : i))
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const getItemQuantity = useCallback(
    (productId: string) => {
      return items.find((i) => i.productId === productId)?.quantity || 0;
    },
    [items]
  );

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const deliveryFee =
    deliveryType === "pickup" ? 0 : subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  const totalPrice = subtotal + deliveryFee;

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        totalPrice,
        subtotal,
        deliveryType,
        buyerType,
        deliveryFee,
        setDeliveryType,
        setBuyerType,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        getItemQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart 必须在 CartProvider 内使用");
  }
  return context;
}
