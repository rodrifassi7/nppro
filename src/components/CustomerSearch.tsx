
import { useState, useEffect, useRef } from 'react';
import { Search, UserPlus } from 'lucide-react';
import { useCustomers } from '../context/CustomersContext';
import type { Customer } from '../types';

interface CustomerSearchProps {
    onSelect: (customer: Customer) => void;
    onNewName: (name: string) => void;
    // Optional initial value
    initialValue?: string;
}

export const CustomerSearch: React.FC<CustomerSearchProps> = ({ onSelect, onNewName, initialValue = '' }) => {
    const { customers } = useCustomers();
    const [query, setQuery] = useState(initialValue);
    const [isOpen, setIsOpen] = useState(false);
    const [filtered, setFiltered] = useState<Customer[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const searchTerm = query.toLowerCase();
        if (!searchTerm) {
            setFiltered([]);
            return;
        }

        const matches = customers.filter(c =>
            c.full_name.toLowerCase().includes(searchTerm) ||
            c.phone.includes(searchTerm)
        ).slice(0, 5); // Limit to 5 results

        setFiltered(matches);
    }, [query, customers]);

    // Handle outside click to close dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (customer: Customer) => {
        setQuery(customer.full_name);
        setIsOpen(false);
        onSelect(customer);
    };

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setQuery(val);
        setIsOpen(true);
        onNewName(val); // Propagate text changes for "new customer" logic
    };

    return (
        <div className="relative" ref={containerRef}>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-slate-500 focus:border-slate-500 sm:text-sm"
                    placeholder="Buscar por nombre o teléfono..."
                    value={query}
                    onChange={handleInput}
                    onFocus={() => setIsOpen(true)}
                />
            </div>

            {isOpen && query.length > 0 && (
                <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                    {filtered.map((customer) => (
                        <div
                            key={customer.id}
                            className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-slate-100 text-slate-900"
                            onClick={() => handleSelect(customer)}
                        >
                            <div className="flex flex-col">
                                <span className="font-medium">{customer.full_name}</span>
                                <span className="text-xs text-gray-500">{customer.phone} • {customer.status === 'active' ? '🟢 Activo' : '⚪ Inactivo'}</span>
                            </div>
                        </div>
                    ))}

                    {filtered.length === 0 && (
                        <div className="cursor-default select-none relative py-2 pl-3 pr-9 text-gray-700">
                            <div className="flex items-center space-x-2">
                                <UserPlus className="h-4 w-4" />
                                <span>Nuevo cliente: "{query}"</span>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
