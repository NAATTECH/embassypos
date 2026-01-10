"use client";

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, Database, CheckCircle, AlertCircle } from 'lucide-react';
import Sidebar from '@/components/Sidebar';

export default function SeedPage() {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const seedData = async () => {
        setLoading(true);
        setStatus('idle');
        try {
            // 1. Create a category
            const { data: category, error: catError } = await supabase
                .from('categories')
                .insert([{ name: 'General', color: '#0071e3' }])
                .select()
                .single();

            if (catError) throw catError;

            // 2. Create some items
            const { data: items, error: itemError } = await supabase
                .from('items')
                .insert([
                    { name: 'King\'s Crest Salt', price: 32169.04, cost: 15000, category_id: category.id },
                    { name: 'Drifter Salts', price: 25539.75, cost: 12000, category_id: category.id },
                    { name: 'Desechable 25k', price: 16620.00, cost: 8000, category_id: category.id }
                ])
                .select();

            if (itemError) throw itemError;

            // 3. Create payment type
            const { data: payType, error: payError } = await supabase
                .from('payment_types')
                .insert([{ name: 'Efectivo' }])
                .select()
                .single();

            if (payError && !payError.message.includes('unique constraint')) throw payError;

            // 4. Create dummy sales
            const salesData = items.map(item => ({
                total_amount: item.price,
                net_sales: item.price,
                gross_profit: item.price - item.cost,
                payment_type_id: payType?.id || null,
                created_at: new Date().toISOString()
            }));

            const { error: salesError } = await supabase
                .from('sales')
                .insert(salesData);

            if (salesError) throw salesError;

            setStatus('success');
            setMessage('¡Base de datos poblada con éxito!');
        } catch (err: any) {
            console.error(err);
            setStatus('error');
            setMessage(`Error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main>
            <Sidebar />
            <div className="main-content">
                <header className="header">
                    <h1>Configuración de Datos</h1>
                </header>

                <div className="card" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', padding: '48px' }}>
                    <Database size={48} color="var(--accent)" style={{ marginBottom: '24px' }} />
                    <h2 style={{ marginBottom: '16px' }}>Poblar Base de Datos</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
                        Esta herramienta insertará datos de prueba (artículos, categorías y ventas) en tu instancia de Supabase para que puedas ver el tablero en funcionamiento.
                    </p>

                    <button
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '16px', fontSize: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px' }}
                        onClick={seedData}
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : <Database size={20} />}
                        {loading ? 'Poblando...' : 'Generar Datos de Prueba'}
                    </button>

                    {status === 'success' && (
                        <div style={{ marginTop: '24px', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            <CheckCircle size={20} />
                            <span>{message}</span>
                        </div>
                    )}

                    {status === 'error' && (
                        <div style={{ marginTop: '24px', color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            <AlertCircle size={20} />
                            <span>{message}</span>
                        </div>
                    )}

                    {status === 'success' && (
                        <button
                            className="btn btn-secondary"
                            style={{ marginTop: '16px', width: '100%' }}
                            onClick={() => window.location.href = '/'}
                        >
                            Ir al Tablero
                        </button>
                    )}
                </div>
            </div>
        </main>
    );
}
