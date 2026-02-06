import { useState } from 'react';
import { useFollowups } from '../context/FollowupsContext';
import { Clock, Copy, CheckCircle, MessageCircle } from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';
import { es } from 'date-fns/locale';
import type { FollowupType } from '../types';

const TEMPLATES: Record<FollowupType, string> = {
    reventa_pack: `Hola! 🙌\nTe escribo porque muchos clientes están resolviendo la semana con el pack de 10 comidas, que es más práctico y conveniente que pedir suelto.\nSi querés, esta semana lo podemos armar así 💪`,
    recompra: `Hola! 👋\nTe aviso que ya estamos tomando pedidos para la próxima semana.\nSi querés repetir el pack, avisame y lo dejamos reservado.`
};

export const Followups = () => {
    const { followups, loading, updateFollowup } = useFollowups();
    const [filter, setFilter] = useState<'pending' | 'sent'>('pending');

    const visibleFollowups = followups.filter(f => f.status === filter);

    const handleCopyScript = (type: FollowupType) => {
        const text = TEMPLATES[type];
        if (text) {
            navigator.clipboard.writeText(text);
            alert('Mensaje copiado al portapapeles!');
        }
    };

    const handleMarkAsSent = async (id: string) => {
        if (!confirm('¿Marcar como enviado? Desaparecerá de la lista de pendientes.')) return;
        await updateFollowup(id, { status: 'sent' });
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Cargando seguimientos...</div>;

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <MessageCircle className="text-slate-900" /> Seguimientos
                    <span className="bg-red-100 text-red-700 text-sm px-2 py-0.5 rounded-full">
                        {followups.filter(f => f.status === 'pending' && (isToday(new Date(f.due_date)) || isPast(new Date(f.due_date)))).length} para hoy
                    </span>
                </h1>

                <div className="flex bg-slate-100 p-1 rounded-lg">
                    <button
                        onClick={() => setFilter('pending')}
                        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${filter === 'pending' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Pendientes
                    </button>
                    <button
                        onClick={() => setFilter('sent')}
                        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${filter === 'sent' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Enviados
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                {visibleFollowups.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                        <p className="text-slate-500">No hay seguimientos en esta vista.</p>
                    </div>
                ) : (
                    visibleFollowups.map(task => {
                        const isOverdue = isPast(new Date(task.due_date)) && !isToday(new Date(task.due_date));
                        const isTaskToday = isToday(new Date(task.due_date));

                        return (
                            <div key={task.id} className={`bg-white p-5 rounded-xl border shadow-sm flex flex-col md:flex-row gap-4 items-start md:items-center justify-between ${isOverdue ? 'border-red-200 bg-red-50/30' : 'border-slate-200'}`}>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider ${task.type === 'reventa_pack' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                                            {task.type === 'reventa_pack' ? 'Reventa Pack' : 'Recompra Semanal'}
                                        </span>
                                        <span className={`text-xs flex items-center gap-1 ${isOverdue ? 'text-red-600 font-medium' : isTaskToday ? 'text-green-600 font-medium' : 'text-slate-400'}`}>
                                            <Clock size={12} />
                                            {format(new Date(task.due_date), 'dd MMM', { locale: es })}
                                        </span>
                                    </div>
                                    <h3 className="font-semibold text-slate-900 text-lg">{task.customer_name}</h3>
                                    <div className="text-slate-500 text-sm flex gap-3 mt-1">
                                        <span className="font-mono bg-slate-100 px-1 rounded text-slate-600">{task.customer_phone}</span>
                                    </div>
                                </div>

                                {filter === 'pending' && (
                                    <div className="flex items-center gap-3 w-full md:w-auto">
                                        <button
                                            onClick={() => handleCopyScript(task.type)}
                                            className="flex-1 md:flex-none border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                                            title="Copiar script para WhatsApp"
                                        >
                                            <Copy size={16} /> Copiar mensaje
                                        </button>

                                        <button
                                            onClick={() => handleMarkAsSent(task.id)}
                                            className="flex-1 md:flex-none bg-slate-900 text-white hover:bg-slate-800 px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors flex items-center justify-center gap-2"
                                        >
                                            <CheckCircle size={16} /> Marcar enviado
                                        </button>
                                    </div>
                                )}

                                {filter === 'sent' && (
                                    <div className="text-sm text-slate-400 flex items-center gap-1">
                                        <CheckCircle size={14} /> Enviado
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};
