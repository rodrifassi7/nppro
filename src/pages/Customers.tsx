
import React, { useState } from 'react';
import { useCustomers } from '../context/CustomersContext';
import { Search, User, Phone, Calendar, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const Customers = () => {
    const { customers, loading } = useCustomers();
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'warming' | 'inactive'>('all');

    const filteredCustomers = customers.filter(c => {
        const matchesSearch = c.full_name.toLowerCase().includes(search.toLowerCase()) ||
            c.phone.includes(search);
        const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800';
            case 'warming': return 'bg-yellow-100 text-yellow-800';
            case 'inactive': return 'bg-slate-100 text-slate-600';
            default: return 'bg-slate-100 text-slate-800';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'active': return 'Activo';
            case 'warming': return 'Tibio';
            case 'inactive': return 'Inactivo';
            default: return status;
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Cargando clientes...</div>;

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <User className="text-slate-900" /> Clientes
                    <span className="text-slate-400 text-sm font-normal">({customers.length})</span>
                </h1>

                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar cliente..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none w-full sm:w-64"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e: any) => setStatusFilter(e.target.value)}
                        className="border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-slate-900 outline-none bg-white"
                    >
                        <option value="all">Todos los estados</option>
                        <option value="active">Activos (≤14 días)</option>
                        <option value="warming">Tibios (15-30 días)</option>
                        <option value="inactive">Inactivos (+30 días)</option>
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="p-4 font-semibold text-slate-600">Cliente</th>
                                <th className="p-4 font-semibold text-slate-600">Estado</th>
                                <th className="p-4 font-semibold text-slate-600">Última compra</th>
                                <th className="p-4 font-semibold text-slate-600">Total gastado</th>
                                <th className="p-4 font-semibold text-slate-600">Pedidos</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredCustomers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-slate-500">
                                        No se encontraron clientes.
                                    </td>
                                </tr>
                            ) : (
                                filteredCustomers.map(customer => (
                                    <tr key={customer.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-4">
                                            <div className="font-medium text-slate-900">{customer.full_name}</div>
                                            <div className="text-sm text-slate-500 flex items-center gap-1">
                                                <Phone size={12} /> {customer.phone}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(customer.status)}`}>
                                                {getStatusLabel(customer.status)}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm text-slate-600">
                                            {customer.last_order_at ? (
                                                <div className="flex items-center gap-1">
                                                    <Calendar size={14} className="text-slate-400" />
                                                    {format(new Date(customer.last_order_at), 'dd MMM yyyy', { locale: es })}
                                                </div>
                                            ) : '-'}
                                        </td>
                                        <td className="p-4 text-sm font-medium text-slate-900">
                                            <div className="flex items-center gap-1">
                                                <DollarSign size={14} className="text-slate-400" />
                                                {customer.total_spent?.toLocaleString('es-AR') || 0}
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm text-slate-600">
                                            {customer.orders_count}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
