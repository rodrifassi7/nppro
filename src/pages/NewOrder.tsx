import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useNavigate } from 'react-router-dom';
import { PRICES } from '../types';
import type { OrderType, Meal } from '../types';
import { Plus, Trash2, Save, Loader2, DollarSign } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const NewOrder = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [saving, setSaving] = useState(false);

    // Order State
    const [customerName, setCustomerName] = useState('');
    const [phone, setPhone] = useState('');
    const [orderType, setOrderType] = useState<OrderType>('single');
    const [otherLabel, setOtherLabel] = useState('');
    const [delivery, setDelivery] = useState(false);
    const [manualSubtotal, setManualSubtotal] = useState<string>('');
    const [notes, setNotes] = useState('');
    const [status, setStatus] = useState('pending');

    // Meals State
    const [availableMeals, setAvailableMeals] = useState<Meal[]>([]);
    const [selectedMeals, setSelectedMeals] = useState<{ mealId: string, qty: number }[]>([]);

    useEffect(() => {
        fetchMeals();
    }, []);

    const fetchMeals = async () => {
        const { data } = await supabase.from('meals').select('*').order('name');
        if (data) setAvailableMeals(data);
    };

    // Calculations
    const deliveryFee = delivery ? PRICES.delivery : 0;

    let subtotal = 0;
    if (orderType === 'single') subtotal = PRICES.single;
    else if (orderType === 'pack5') subtotal = PRICES.pack5;
    else if (orderType === 'pack10') subtotal = PRICES.pack10;
    else subtotal = Number(manualSubtotal) || 0;

    const total = subtotal + deliveryFee;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setSaving(true);

        try {
            // 1. Create Order
            const { data: order, error: orderError } = await supabase
                .from('orders')
                .insert({
                    customer_name: customerName,
                    phone,
                    order_type: orderType,
                    other_label: orderType === 'other' ? otherLabel : null,
                    delivery,
                    status,
                    subtotal,
                    delivery_fee: deliveryFee,
                    total,
                    notes,
                    created_by: user.id
                })
                .select()
                .single();

            if (orderError) throw orderError;

            // 2. Create Order Items
            if (selectedMeals.length > 0 && order) {
                const items = selectedMeals.map(item => ({
                    order_id: order.id,
                    meal_id: item.mealId,
                    qty: item.qty
                }));

                const { error: itemsError } = await supabase
                    .from('order_items')
                    .insert(items);

                if (itemsError) throw itemsError;
            }

            navigate('/orders');
        } catch (err: any) {
            alert('Error al crear pedido: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    const addMealRow = () => {
        if (availableMeals.length > 0) {
            setSelectedMeals([...selectedMeals, { mealId: availableMeals[0].id, qty: 1 }]);
        }
    };

    const removeMealRow = (index: number) => {
        setSelectedMeals(selectedMeals.filter((_, i) => i !== index));
    };

    const updateMealRow = (index: number, field: 'mealId' | 'qty', value: any) => {
        const newMeals = [...selectedMeals];
        newMeals[index] = { ...newMeals[index], [field]: value };
        setSelectedMeals(newMeals);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-800">Nuevo pedido</h1>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main Details */}
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h2 className="text-lg font-semibold mb-4 text-slate-700">Detalles del cliente</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1">Nombre del cliente *</label>
                                <input
                                    autoFocus
                                    type="text"
                                    required
                                    value={customerName}
                                    onChange={e => setCustomerName(e.target.value)}
                                    className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1">Teléfono</label>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={e => setPhone(e.target.value)}
                                    className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h2 className="text-lg font-semibold mb-4 text-slate-700">Detalles del pedido</h2>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-1">Tipo de pedido</label>
                                    <select
                                        value={orderType}
                                        onChange={e => setOrderType(e.target.value as OrderType)}
                                        className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 outline-none bg-white"
                                    >
                                        <option value="single">Suelto ($ {PRICES.single.toLocaleString('es-AR')})</option>
                                        <option value="pack5">Pack 5 ($ {PRICES.pack5.toLocaleString('es-AR')})</option>
                                        <option value="pack10">Pack 10 ($ {PRICES.pack10.toLocaleString('es-AR')})</option>
                                        <option value="other">Otro / Personalizado</option>
                                    </select>
                                </div>

                                {orderType === 'other' && (
                                    <>
                                        <div className="col-span-2 sm:col-span-1">
                                            <label className="block text-sm font-medium text-slate-600 mb-1">Descripción</label>
                                            <input
                                                type="text"
                                                required
                                                value={otherLabel}
                                                onChange={e => setOtherLabel(e.target.value)}
                                                placeholder="ej. Catering"
                                                className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 outline-none"
                                            />
                                        </div>
                                        <div className="col-span-2 sm:col-span-1">
                                            <label className="block text-sm font-medium text-slate-600 mb-1">Precio personalizado</label>
                                            <input
                                                type="number"
                                                required
                                                value={manualSubtotal}
                                                onChange={e => setManualSubtotal(e.target.value)}
                                                className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 outline-none"
                                            />
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg">
                                <div className="flex items-center h-5">
                                    <input
                                        id="delivery"
                                        type="checkbox"
                                        checked={delivery}
                                        onChange={e => setDelivery(e.target.checked)}
                                        className="w-5 h-5 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                                    />
                                </div>
                                <label htmlFor="delivery" className="text-sm font-medium text-slate-700 select-none cursor-pointer">
                                    Con envío (+$ {PRICES.delivery.toLocaleString('es-AR')})
                                </label>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1">Estado</label>
                                <select
                                    value={status}
                                    onChange={e => setStatus(e.target.value)}
                                    className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 outline-none bg-white"
                                >
                                    <option value="pending">Pendiente</option>
                                    <option value="paid">Pagado</option>
                                    <option value="delivered">Entregado</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1">Notas</label>
                                <textarea
                                    rows={2}
                                    value={notes}
                                    onChange={e => setNotes(e.target.value)}
                                    className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-slate-700">Comidas (Opcional)</h2>
                            <button
                                type="button"
                                onClick={addMealRow}
                                disabled={availableMeals.length === 0}
                                className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                            >
                                <Plus size={16} /> Agregar comida
                            </button>
                        </div>

                        {availableMeals.length === 0 && (
                            <p className="text-sm text-slate-400 italic">No hay comidas en el catálogo. Agregá una en la página 'Comidas'.</p>
                        )}

                        <div className="space-y-2">
                            {selectedMeals.map((row, index) => (
                                <div key={index} className="flex gap-2 items-center">
                                    <select
                                        value={row.mealId}
                                        onChange={e => updateMealRow(index, 'mealId', e.target.value)}
                                        className="flex-1 p-2 rounded-lg border border-slate-300 text-sm"
                                    >
                                        {availableMeals.map(meal => (
                                            <option key={meal.id} value={meal.id}>{meal.name}</option>
                                        ))}
                                    </select>
                                    <input
                                        type="number"
                                        min="1"
                                        value={row.qty}
                                        onChange={e => updateMealRow(index, 'qty', parseInt(e.target.value) || 1)}
                                        className="w-20 p-2 rounded-lg border border-slate-300 text-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeMealRow(index)}
                                        className="p-2 text-slate-400 hover:text-red-600"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar Summary */}
                <div className="md:col-span-1">
                    <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg sticky top-6">
                        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                            <DollarSign size={20} /> Resumen
                        </h3>

                        <div className="space-y-4 text-sm opacity-90">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span>$ {subtotal.toLocaleString('es-AR')}</span>
                            </div>
                            <div className="flex justify-between text-green-300">
                                <span>Envío</span>
                                <span>{deliveryFee > 0 ? `+ $ ${deliveryFee.toLocaleString('es-AR')}` : '-'}</span>
                            </div>

                            <div className="border-t border-slate-700 pt-4 mt-4 flex justify-between text-xl font-bold">
                                <span>Total</span>
                                <span>$ {total.toLocaleString('es-AR')}</span>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full mt-8 bg-white text-slate-900 py-3 rounded-lg font-bold hover:bg-slate-100 transition-colors flex items-center justify-center gap-2"
                        >
                            {saving ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> Guardar pedido</>}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};
