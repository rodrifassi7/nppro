
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import type { Customer } from '../types';
import { useAuth } from '../hooks/useAuth';

interface CustomersContextType {
    customers: Customer[];
    loading: boolean;
    refreshCustomers: () => Promise<void>;
    createCustomer: (data: Partial<Customer>) => Promise<Customer | null>;
}

const CustomersContext = createContext<CustomersContextType | undefined>(undefined);

export const CustomersProvider = ({ children }: { children: React.ReactNode }) => {
    const { user } = useAuth();
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchCustomers = async () => {
        if (!user) return;
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('customers')
                .select('*')
                .order('last_order_at', { ascending: false, nullsFirst: false });

            if (error) throw error;
            setCustomers(data || []);
        } catch (err) {
            console.error('Error fetching customers:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, [user]);

    const createCustomer = async (data: Partial<Customer>): Promise<Customer | null> => {
        try {
            const { data: newCust, error } = await supabase
                .from('customers')
                .insert(data)
                .select()
                .single();

            if (error) throw error;
            setCustomers(prev => [newCust, ...prev]);
            return newCust;
        } catch (err) {
            console.error('Error creating customer:', err);
            return null;
        }
    };

    return (
        <CustomersContext.Provider value={{ customers, loading, refreshCustomers: fetchCustomers, createCustomer }}>
            {children}
        </CustomersContext.Provider>
    );
};

export const useCustomers = () => {
    const context = useContext(CustomersContext);
    if (context === undefined) {
        throw new Error('useCustomers must be used within a CustomersProvider');
    }
    return context;
};
