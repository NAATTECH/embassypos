"use client";

import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { supabase } from '@/lib/supabase';
import {
    Package,
    Search,
    ArrowUpDown,
    Download,
    Loader2
} from 'lucide-react';

interface ItemMetric {
    item_name: string;
    category_name: string;
    quantity: number;
    brutas: number;
    descuentos: number;
    netas: number;
    costo: number;
    beneficio: number;
    margen: string;
}

export default function ItemsSales() {
    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState<ItemMetric[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: keyof ItemMetric, direction: 'asc' | 'desc' } | null>(null);

    useEffect(() => {
        fetchItemSales();
    }, []);

    const fetchItemSales = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('sale_items')
                .select(`
          quantity,
          unit_price,
          total_price,
          items (
            name,
            cost_price,
            categories (
              name
            )
          )
        `);

            if (error) throw error;

            // Aggregate data by item name
            const aggregated = data.reduce((acc: any, curr: any) => {
                const itemName = curr.items?.name || 'Varios';
                const categoryName = curr.items?.categories?.name || 'Sin Categoría';

                if (!acc[itemName]) {
                    acc[itemName] = {
                        item_name: itemName,
                        category_name: categoryName,
                        quantity: 0,
                        brutas: 0,
                        descuentos: 0,
                        netas: 0,
                        costo: 0,
                        beneficio: 0
                    };
                }

                const quantity = Number(curr.quantity);
                const total = Number(curr.total_price);
                const cost = (Number(curr.items?.cost_price) || 0) * quantity;

                acc[itemName].quantity += quantity;
                acc[itemName].brutas += total;
                acc[itemName].netas += total;
                acc[itemName].costo += cost;
                acc[itemName].beneficio += (total - cost);

                return acc;
            }, {});

            const processedData = Object.values(aggregated).map((item: any) => ({
                ...item,
                margen: `${((item.beneficio / item.netas) * 100 || 0).toFixed(2)}%`
            }));

            setItems(processedData as ItemMetric[]);
        } catch (err) {
            console.error("Error fetching item sales:", err);
        } finally {
            setLoading(false);
        }
    };

    const sortedItems = React.useMemo(() => {
        let sortableItems = [...items];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems.filter(item =>
            item.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.category_name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [items, sortConfig, searchTerm]);

    const requestSort = (key: keyof ItemMetric) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const formatCurrency = (val: number) => `$${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    return (
        <main>
            <Sidebar />
            <div className="main-content">
                <header className="header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div className="icon-container" style={{ background: 'var(--accent-light)', color: 'var(--accent)', padding: '8px', borderRadius: '10px' }}>
                            <Package size={24} />
                        </div>
                        <h1>Ventas por Artículo</h1>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <div className="search-bar">
                            <Search size={16} className="search-icon" />
                            <input
                                type="text"
                                placeholder="Buscar artículo o categoría..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Download size={16} /> Excel
                        </button>
                    </div>
                </header>

                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                        <Loader2 className="animate-spin" size={40} color="var(--accent)" />
                    </div>
                ) : (
                    <section className="card">
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th onClick={() => requestSort('item_name')} style={{ cursor: 'pointer' }}>
                                            Artículo <ArrowUpDown size={14} style={{ display: 'inline', marginLeft: '4px' }} />
                                        </th>
                                        <th onClick={() => requestSort('category_name')} style={{ cursor: 'pointer' }}>
                                            Categoría <ArrowUpDown size={14} style={{ display: 'inline', marginLeft: '4px' }} />
                                        </th>
                                        <th onClick={() => requestSort('quantity')} style={{ cursor: 'pointer' }}>
                                            Cantidad <ArrowUpDown size={14} style={{ display: 'inline', marginLeft: '4px' }} />
                                        </th>
                                        <th onClick={() => requestSort('brutas')} style={{ cursor: 'pointer' }}>
                                            Ventas brutas <ArrowUpDown size={14} style={{ display: 'inline', marginLeft: '4px' }} />
                                        </th>
                                        <th onClick={() => requestSort('descuentos')} style={{ cursor: 'pointer' }}>
                                            Descuentos <ArrowUpDown size={14} style={{ display: 'inline', marginLeft: '4px' }} />
                                        </th>
                                        <th onClick={() => requestSort('netas')} style={{ cursor: 'pointer' }}>
                                            Ventas netas <ArrowUpDown size={14} style={{ display: 'inline', marginLeft: '4px' }} />
                                        </th>
                                        <th onClick={() => requestSort('beneficio')} style={{ cursor: 'pointer' }}>
                                            Beneficio bruto <ArrowUpDown size={14} style={{ display: 'inline', marginLeft: '4px' }} />
                                        </th>
                                        <th onClick={() => requestSort('margen')} style={{ cursor: 'pointer' }}>
                                            Margen <ArrowUpDown size={14} style={{ display: 'inline', marginLeft: '4px' }} />
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedItems.map((item, i) => (
                                        <tr key={i}>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <Package size={16} color="var(--text-secondary)" />
                                                    </div>
                                                    <span style={{ fontWeight: '500' }}>{item.item_name}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="badge">
                                                    {item.category_name}
                                                </span>
                                            </td>
                                            <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                                            <td>{formatCurrency(item.brutas)}</td>
                                            <td style={{ color: 'var(--text-secondary)' }}>{formatCurrency(item.descuentos)}</td>
                                            <td style={{ fontWeight: '600' }}>{formatCurrency(item.netas)}</td>
                                            <td>{formatCurrency(item.beneficio)}</td>
                                            <td>
                                                <span style={{
                                                    color: parseFloat(item.margen) > 30 ? 'var(--accent)' : 'var(--text-secondary)',
                                                    fontWeight: '500'
                                                }}>
                                                    {item.margen}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}
            </div>

            <style jsx>{`
        .search-bar {
          position: relative;
          display: flex;
          align-items: center;
        }
        .search-icon {
          position: absolute;
          left: 12px;
          color: var(--text-secondary);
        }
        .search-bar input {
          background: var(--card-bg);
          border: 1px solid var(--sidebar-border);
          padding: 8px 12px 8px 36px;
          border-radius: 10px;
          width: 280px;
          font-size: 14px;
          transition: all 0.2s;
          outline: none;
        }
        .search-bar input:focus {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px var(--accent-light);
        }
        .badge {
          background: var(--bg-secondary);
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 12px;
          color: var(--text-secondary);
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }
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
