
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import type { Followup } from '../types';
import { useAuth } from '../hooks/useAuth';

interface FollowupsContextType {
    followups: Followup[];
    loading: boolean;
    refreshFollowups: () => Promise<void>;
    updateFollowup: (id: string, updates: Partial<Followup>) => Promise<void>;
}

const FollowupsContext = createContext<FollowupsContextType | undefined>(undefined);

export const FollowupsProvider = ({ children }: { children: React.ReactNode }) => {
    const { user } = useAuth();
    const [followups, setFollowups] = useState<Followup[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchFollowups = async () => {
        if (!user) return;
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('followups')
                .select('*')
                .order('due_date', { ascending: true });

            if (error) throw error;
            setFollowups(data || []);
        } catch (err) {
            console.error('Error fetching followups:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFollowups();
    }, [user]);

    const updateFollowup = async (id: string, updates: Partial<Followup>) => {
        try {
            const { error } = await supabase
                .from('followups')
                .update(updates)
                .eq('id', id);

            if (error) throw error;
            await fetchFollowups();
        } catch (err) {
            console.error('Error updating followup:', err);
        }
    };

    return (
        <FollowupsContext.Provider value={{ followups, loading, refreshFollowups: fetchFollowups, updateFollowup }}>
            {children}
        </FollowupsContext.Provider>
    );
};

export const useFollowups = () => {
    const context = useContext(FollowupsContext);
    if (context === undefined) {
        throw new Error('useFollowups must be used within a FollowupsProvider');
    }
    return context;
};
