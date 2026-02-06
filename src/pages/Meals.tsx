import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import type { Meal } from '../types';
import { Plus, Trash2, Loader2, Utensils } from 'lucide-react';

export const Meals = () => {
    const [meals, setMeals] = useState<Meal[]>([]);
    const [loading, setLoading] = useState(true);
    const [newName, setNewName] = useState('');
    const [adding, setAdding] = useState(false);

    useEffect(() => {
        fetchMeals();
    }, []);

    const fetchMeals = async () => {
        setLoading(true);
        const { data } = await supabase.from('meals').select('*').order('name');
        if (data) setMeals(data);
        setLoading(false);
    };

    const addMeal = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName.trim()) return;
        setAdding(true);
        const { data } = await supabase.from('meals').insert({ name: newName }).select().single();
        if (data) {
            setMeals([...meals, data].sort((a, b) => a.name.localeCompare(b.name)));
            setNewName('');
        }
        setAdding(false);
    };

    const deleteMeal = async (id: string) => {
        if (!confirm('¿Eliminar esta comida?')) return;
        const { error } = await supabase.from('meals').delete().eq('id', id);
        if (!error) {
            setMeals(meals.filter(m => m.id !== id));
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-800">Catálogo de Comidas</h1>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <form onSubmit={addMeal} className="flex gap-4 mb-6">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            placeholder="Nombre de la comida (ej. Pollo Teriyaki)..."
                            value={newName}
                            onChange={e => setNewName(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 outline-none"
                        />
                        <Utensils className="absolute left-3 top-3.5 text-slate-400" size={18} />
                    </div>
                    <button
                        type="submit"
                        disabled={adding || !newName.trim()}
                        className="bg-slate-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-slate-800 disabled:opacity-50 transition-colors flex items-center gap-2"
                    >
                        {adding ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
                        Agregar
                    </button>
                </form>

                <div className="space-y-2">
                    {loading ? (
                        <div className="text-center p-4 text-slate-500">Cargando comidas...</div>
                    ) : meals.length === 0 ? (
                        <div className="text-center p-4 text-slate-500 text-sm">No se encontraron comidas. Agregá una arriba.</div>
                    ) : (
                        meals.map(meal => (
                            <div key={meal.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg group hover:bg-slate-100 transition-colors">
                                <span className="font-medium text-slate-700">{meal.name}</span>
                                <button
                                    onClick={() => deleteMeal(meal.id)}
                                    className="p-2 text-slate-300 hover:text-red-600 transition-colors"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
