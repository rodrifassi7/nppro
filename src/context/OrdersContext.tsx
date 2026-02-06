import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import type { Order } from '../types';
import { useAuth } from '../hooks/useAuth';

interface OrdersContextType {
    orders: Order[];
    loading: boolean;
    refreshOrders: () => Promise<void>;
}

const OrdersContext = createContext<OrdersContextType>({
    orders: [],
    loading: true,
    refreshOrders: async () => { },
});

export const OrdersProvider = ({ children }: { children: React.ReactNode }) => {
    const { user } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        if (!user) return;
        setLoading(true);
        const { data, error } = await supabase
            .from('orders')
            .select('*, items:order_items(*, meal:meals(*))')
            .order('created_at', { ascending: false });

        if (!error && data) {
            setOrders(data as Order[]);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchOrders();
    }, [user]);

    return (
        <OrdersContext.Provider value={{ orders, loading, refreshOrders: fetchOrders }}>
            {children}
        </OrdersContext.Provider>
    );
};

export const useOrders = () => useContext(OrdersContext);
