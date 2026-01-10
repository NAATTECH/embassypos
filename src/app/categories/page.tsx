"use client";

import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { supabase } from '@/lib/supabase';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';
import {
    Tags,
    Download,
    Loader2,
    TrendingUp
} from 'lucide-react';

interface CategoryMetric {
    name: string;
    ventas: number;
    articulos: number;
    color: string;
}

const COLORS = ['#007AFF', '#34C759', '#FF9500', '#FF2D55', '#AF52DE', '#5856D6', '#FFCC00'];

export default function CategoriesSales() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<CategoryMetric[]>([]);

    useEffect(() => {
        fetchCategorySales();
    }, []);

    const fetchCategorySales = async () => {
        setLoading(true);
        try {
            const { data: sales, error } = await supabase
                .from('sale_items')
                .select(`
          total_price,
          items (
            categories (
              name
            )
          )
        `);

            if (error) throw error;

            const aggregated = sales.reduce((acc: any, curr: any) => {
                const catName = curr.items?.categories?.name || 'Sin Categoría';
                if (!acc[catName]) {
                    acc[catName] = { name: catName, ventas: 0, articulos: 0 };
                }
                acc[catName].ventas += Number(curr.total_price);
                acc[catName].articulos += 1;
                return acc;
            }, {});

            const processed = Object.values(aggregated).map((cat: any, index: number) => ({
                ...cat,
                color: COLORS[index % COLORS.length]
            })).sort((a: any, b: any) => b.ventas - a.ventas);

            setData(processed as CategoryMetric[]);
        } catch (err) {
            console.error("Error fetching category sales:", err);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (val: number) => `$${val.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

    return (
        <main>
            <Sidebar />
            <div className="main-content">
                <header className="header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div className="icon-container" style={{ background: 'rgba(255, 149, 0, 0.1)', color: '#FF9500', padding: '8px', borderRadius: '10px' }}>
                            <Tags size={24} />
                        </div>
                        <h1>Ventas por Categoría</h1>
                    </div>
                    <button className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Download size={16} /> Exportar
                    </button>
                </header>

                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                        <Loader2 className="animate-spin" size={40} color="var(--accent)" />
                    </div>
                ) : (
                    <div className="grid-container" style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '24px' }}>
                        <section className="card">
                            <h3 style={{ marginBottom: '24px', fontSize: '16px', fontWeight: '600' }}>Rendimiento por Categoría</h3>
                            <div style={{ width: '100%', height: 400 }}>
                                <ResponsiveContainer>
                                    <BarChart data={data} layout="vertical" margin={{ left: 40, right: 40 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(0,0,0,0.05)" />
                                        <XAxis type="number" hide />
                                        <YAxis
                                            dataKey="name"
                                            type="category"
                                            axisLine={false}
                                            tickLine={false}
                                            width={100}
                                        />
                                        <Tooltip
                                            cursor={{ fill: 'transparent' }}
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                            formatter={(value: any) => [formatCurrency(Number(value)), 'Ventas']}
                                        />
                                        <Bar dataKey="ventas" radius={[0, 4, 4, 0]} barSize={24}>
                                            {data.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </section>

                        <section className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Resumen</h3>
                            {data.map((cat, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: cat.color }} />
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontSize: '14px', fontWeight: '500' }}>{cat.name}</span>
                                            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{cat.articulos} artículos</span>
                                        </div>
                                    </div>
                                    <span style={{ fontSize: '14px', fontWeight: '600' }}>{formatCurrency(cat.ventas)}</span>
                                </div>
                            ))}

                            <div style={{ marginTop: 'auto', padding: '16px', borderRadius: '12px', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <TrendingUp size={20} color="var(--accent)" />
                                <div>
                                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '2px' }}>Categoría Top</p>
                                    <p style={{ fontSize: '14px', fontWeight: '600' }}>{data[0]?.name || 'N/A'}</p>
                                </div>
                            </div>
                        </section>
                    </div>
                )}
            </div>

            <style jsx>{`
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
        </main>
    );
}
