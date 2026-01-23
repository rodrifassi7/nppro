export type Role = 'admin' | 'staff';

export interface Profile {
    id: string;
    email: string;
    role: Role;
}

export interface Meal {
    id: string;
    name: string;
    created_at: string;
}

export type OrderType = 'single' | 'pack5' | 'pack10' | 'other';
export type OrderStatus = 'pending' | 'paid' | 'delivered';

export interface Order {
    id: string;
    customer_name: string;
    phone?: string;
    order_type: OrderType;
    other_label?: string;
    delivery: boolean;
    status: OrderStatus;
    subtotal: number;
    delivery_fee: number;
    total: number;
    notes?: string;
    created_at: string;
    created_by: string;
    items?: OrderItem[];
}

export interface OrderItem {
    id: string;
    order_id: string;
    meal_id: string;
    qty: number;
    meal?: Meal;
}

export const PRICES = {
    single: 9000,
    pack5: 42000,
    pack10: 82000,
    delivery: 3500,
};
