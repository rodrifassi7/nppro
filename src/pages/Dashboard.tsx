import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { startOfToday, startOfWeek, startOfMonth } from 'date-fns';
import { DollarSign, ShoppingBag, TrendingUp, Utensils } from 'lucide-react';
import type { Order } from '../types';

export const Dashboard = () => {
    const [period, setPeriod] = useState<'today' | 'week' | 'month'>('today');
    const [stats, setStats] = useState({
        revenue: 0,
        count: 0,
        avgTicket: 0,
        byType: {} as Record<string, number>,
        topMeals: [] as { name: string; qty: number }[]
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        calculateStats();
    }, [period]);

    const calculateStats = async () => {
        setLoading(true);

        // Determine start date
        const now = new Date();
        let startDate = startOfToday();
        if (period === 'week') startDate = startOfWeek(now, { weekStartsOn: 1 });
        if (period === 'month') startDate = startOfMonth(now);

        const { data: ordersData, error } = await supabase
            .from('orders')
            .select('*, items:order_items(*, meal:meals(*))')
            .gte('created_at', startDate.toISOString());

        if (error || !ordersData) {
            setLoading(false);
            return;
        }

        const orders = ordersData as Order[];

        // 1. Basic Stats
        const count = orders.length;
        const revenue = orders.reduce((sum, o) => sum + (o.monto_total || 0), 0); // Using total value of all orders
        const avgTicket = count > 0 ? revenue / count : 0;

        // 2. By Type
        const byType = orders.reduce((acc, o) => {
            acc[o.pack] = (acc[o.pack] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        // 3. Top Meals
        const mealCounts: Record<string, number> = {};
        orders.forEach(o => {
            o.items?.forEach(item => {
                if (item.meal) {
                    mealCounts[item.meal.name] = (mealCounts[item.meal.name] || 0) + item.qty;
                }
            });
        });

        const topMeals = Object.entries(mealCounts)
            .map(([name, qty]) => ({ name, qty }))
            .sort((a, b) => b.qty - a.qty)
            .slice(0, 5);

        setStats({ revenue, count, avgTicket, byType, topMeals });
        setLoading(false);
    };

    const StatCard = ({ label, value, icon: Icon, color }: any) => (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
            <div className={`p-3 rounded-full ${color} bg-opacity-10 text-opacity-100`}>
                <Icon size={24} className={color.replace('bg-', 'text-')} />
            </div>
            <div>
                <p className="text-sm text-slate-500 font-medium">{label}</p>
                <p className="text-2xl font-bold text-slate-900">{value}</p>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-800">Panel</h1>

                <div className="flex gap-2 bg-white p-1 rounded-lg border border-slate-200">
                    {(['today', 'week', 'month'] as const).map(p => {
                        const label = { today: 'Hoy', week: 'Semana', month: 'Mes' }[p];
                        return (
                            <button
                                key={p}
                                onClick={() => setPeriod(p)}
                                className={`px-4 py-2 text-sm rounded-md font-medium transition-colors ${period === p ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'
                                    }`}
                            >
                                {label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {loading ? (
                <div className="p-12 text-center text-slate-400 animate-pulse">Cargando estadísticas...</div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <StatCard
                            label="Ventas"
                            value={`$ ${stats.revenue.toLocaleString('es-AR')}`}
                            icon={DollarSign}
                            color="bg-green-600"
                        />
                        <StatCard
                            label="Cantidad de pedidos"
                            value={stats.count}
                            icon={ShoppingBag}
                            color="bg-blue-600"
                        />
                        <StatCard
                            label="Ticket promedio"
                            value={`$ ${Math.round(stats.avgTicket).toLocaleString('es-AR')}`}
                            icon={TrendingUp}
                            color="bg-purple-600"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                            <h3 className="text-lg font-bold text-slate-800 mb-4">Pedidos por tipo</h3>
                            <div className="space-y-3">
                                {Object.keys(stats.byType).length === 0 && <p className="text-slate-400 text-sm">Sin datos</p>}
                                {Object.entries(stats.byType).map(([type, count]) => {
                                    const typeLabel = {
                                        single: 'Suelto',
                                        pack5: 'Pack 5',
                                        pack10: 'Pack 10',
                                        other: 'Otro'
                                    }[type] || type;

                                    return (
                                        <div key={type} className="flex justify-between items-center">
                                            <span className="capitalize text-slate-600">{typeLabel}</span>
                                            <div className="flex items-center gap-2">
                                                <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-slate-900 rounded-full"
                                                        style={{ width: `${(count / stats.count) * 100}%` }}
                                                    />
                                                </div>
                                                <span className="font-mono text-sm w-8 text-right">{count}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <Utensils size={18} /> Top comidas
                            </h3>
                            <div className="space-y-3">
                                {stats.topMeals.length === 0 && <p className="text-slate-400 text-sm">Sin datos de comidas</p>}
                                {stats.topMeals.map((meal, idx) => (
                                    <div key={idx} className="flex justify-between items-center p-2 hover:bg-slate-50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <span className="w-6 h-6 flex items-center justify-center bg-slate-100 text-slate-500 rounded-full text-xs font-bold">
                                                {idx + 1}
                                            </span>
                                            <span className="font-medium text-slate-700">{meal.name}</span>
                                        </div>
                                        <span className="font-bold text-slate-900">{meal.qty} <span className="text-xs text-slate-400 font-normal">vendidos</span></span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
