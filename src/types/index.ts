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


export type CustomerStatus = 'active' | 'warming' | 'inactive';

export interface Customer {
    id: string;
    full_name: string;
    phone: string;
    status: CustomerStatus;
    total_spent: number;
    orders_count: number;
    created_at: string;
    last_order_at: string | null;
    notes?: string;
}

export type FollowupType = 'reventa_pack' | 'recompra';
export type FollowupStatus = 'pending' | 'sent';

export interface Followup {
    id: string;
    customer_name: string;
    customer_phone: string;
    order_id?: string;
    type: FollowupType;
    status: FollowupStatus;
    due_date: string;
    created_at: string;
}

export interface Order {
    id: string;
    cliente: string;
    phone?: string;
    customer_id?: string; // New
    channel?: string;    // New
    pack: OrderType;
    other_label?: string;
    delivery: boolean;
    status: OrderStatus;
    subtotal: number;
    delivery_fee: number;
    monto_total: number;
    observaciones?: string;
    cantidad_viandas: number;
    fecha_pedido: string;
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
    single: 9800,
    pack5: 49000,
    pack10: 92000,
    delivery: 3300,
};
