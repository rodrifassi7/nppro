import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import type { Order, OrderStatus } from '../types';
import { format, isToday, isThisWeek, isThisMonth, parseISO } from 'date-fns';
import { Search, Filter, CheckCircle, Truck, DollarSign, Trash2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const OrdersList = () => {
    const { isAdmin } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all');
    const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('today');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('orders')
            .select('*, items:order_items(*, meal:meals(*))')
            .order('created_at', { ascending: false });

        if (!error && data) {
            setOrders(data);
        }
        setLoading(false);
    };

    const updateStatus = async (id: string, newStatus: OrderStatus) => {
        const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', id);
        if (!error) {
            setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
        }
    };

    const deleteOrder = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar este pedido?')) return;
        const { error } = await supabase.from('orders').delete().eq('id', id);
        if (!error) {
            setOrders(orders.filter(o => o.id !== id));
        } else {
            alert('Error al eliminar (Verificá si sos Admin)');
        }
    };

    const filteredOrders = orders.filter(order => {
        // 1. Search
        const searchMatch =
            order.customer_name.toLowerCase().includes(search.toLowerCase()) ||
            (order.phone && order.phone.includes(search));

        // 2. Status
        const statusMatch = statusFilter === 'all' || order.status === statusFilter;

        // 3. Date
        const date = parseISO(order.created_at);
        let dateMatch = true;
        if (dateFilter === 'today') dateMatch = isToday(date);
        else if (dateFilter === 'week') dateMatch = isThisWeek(date, { weekStartsOn: 1 });
        else if (dateFilter === 'month') dateMatch = isThisMonth(date);

        return searchMatch && statusMatch && dateMatch;
    });

    const StatusBadge = ({ status }: { status: OrderStatus }) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800',
            paid: 'bg-blue-100 text-blue-800',
            delivered: 'bg-green-100 text-green-800',
        };
        const labels = {
            pending: 'Pendiente',
            paid: 'Pagado',
            delivered: 'Entregado'
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-semibold uppercase ${colors[status]}`}>
                {labels[status]}
            </span>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-slate-800">Pedidos</h1>

                <div className="flex gap-2 bg-white p-1 rounded-lg border border-slate-200">
                    {(['all', 'today', 'week', 'month'] as const).map(f => {
                        const label = { all: 'Todos', today: 'Hoy', week: 'Semana', month: 'Mes' }[f];
                        return (
                            <button
                                key={f}
                                onClick={() => setDateFilter(f)}
                                className={`px-3 py-1.5 text-sm rounded-md font-medium transition-colors ${dateFilter === f ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'
                                    }`}
                            >
                                {label}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <input
                        type="text"
                        placeholder="Buscar cliente o teléfono..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 outline-none"
                    />
                    <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                </div>

                <div className="relative w-full md:w-48">
                    <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value as any)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 outline-none appearance-none bg-white"
                    >
                        <option value="all">Todos</option>
                        <option value="pending">Pendiente</option>
                        <option value="paid">Pagado</option>
                        <option value="delivered">Entregado</option>
                    </select>
                    <Filter className="absolute left-3 top-2.5 text-slate-400" size={18} />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-slate-600 font-medium text-sm">
                            <tr>
                                <th className="p-4">Cliente</th>
                                <th className="p-4">Tipo</th>
                                <th className="p-4">Total</th>
                                <th className="p-4">Estado</th>
                                <th className="p-4">Fecha</th>
                                <th className="p-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan={6} className="p-8 text-center text-slate-500">Cargando pedidos...</td></tr>
                            ) : filteredOrders.length === 0 ? (
                                <tr><td colSpan={6} className="p-8 text-center text-slate-500">No se encontraron pedidos.</td></tr>
                            ) : (
                                filteredOrders.map(order => {
                                    const typeLabel = {
                                        single: 'Suelto',
                                        pack5: 'Pack 5',
                                        pack10: 'Pack 10',
                                        other: 'Otro'
                                    }[order.order_type] || order.order_type;

                                    return (
                                        <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="p-4">
                                                <div className="font-medium text-slate-900">{order.customer_name}</div>
                                                <div className="text-sm text-slate-500">{order.phone}</div>
                                            </td>
                                            <td className="p-4">
                                                <div className="capitalize text-slate-700">{typeLabel}</div>
                                                {order.other_label && <div className="text-xs text-slate-500">{order.other_label}</div>}
                                                {order.delivery && <div className="text-xs text-green-600 flex items-center gap-1"><Truck size={10} /> Con envío</div>}
                                            </td>
                                            <td className="p-4 font-medium text-slate-900">
                                                $ {order.total.toLocaleString('es-AR')}
                                            </td>
                                            <td className="p-4">
                                                <StatusBadge status={order.status} />
                                            </td>
                                            <td className="p-4 text-sm text-slate-500">
                                                {format(parseISO(order.created_at), 'd MMM, H:mm')}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex justify-end gap-2">
                                                    {order.status === 'pending' && (
                                                        <button
                                                            onClick={() => updateStatus(order.id, 'paid')}
                                                            title="Marcar Pagado"
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                                        >
                                                            <DollarSign size={18} />
                                                        </button>
                                                    )}
                                                    {order.status !== 'delivered' && (
                                                        <button
                                                            onClick={() => updateStatus(order.id, 'delivered')}
                                                            title="Marcar Entregado"
                                                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                                                        >
                                                            <CheckCircle size={18} />
                                                        </button>
                                                    )}
                                                    {isAdmin && (
                                                        <button
                                                            onClick={() => deleteOrder(order.id)}
                                                            title="Eliminar"
                                                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
