"use client";

import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { Download, Calendar, Filter, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface SalesMetric {
  fecha: string;
  brutas: string;
  reembolsos: string;
  descuentos: string;
  netas: string;
  costo: string;
  beneficio: string;
  margen: string;
  impuestos: string;
}

interface ChartData {
  name: string;
  ventas: number;
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    brutas: 0,
    reembolsos: 0,
    descuentos: 0,
    netas: 0,
    beneficio: 0,
    tendenciaBrutas: 0,
    tendenciaReembolsos: 0,
    tendenciaDescuentos: 0,
    tendenciaNetas: 0,
    tendenciaBeneficio: 0
  });
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [tableData, setTableData] = useState<SalesMetric[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch sales from Supabase
      const { data: sales, error } = await supabase
        .from('sales')
        .select(`
          *,
          sale_items(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!sales || sales.length === 0) {
        // Fallback to mock data if empty
        setMetrics({
          brutas: 167500,
          reembolsos: 450,
          descuentos: 1692.75,
          netas: 165357.25,
          beneficio: 82221.15,
          tendenciaBrutas: -0.39,
          tendenciaReembolsos: -70,
          tendenciaDescuentos: 35.85,
          tendenciaNetas: -0.03,
          tendenciaBeneficio: 5.52
        });

        // Mock chart data
        setChartData([
          { name: '11-dic', ventas: 12000 }, { name: '12-dic', ventas: 6500 },
          { name: '13-dic', ventas: 6000 }, { name: '15-dic', ventas: 12500 },
          { name: '20-dic', ventas: 8200 }, { name: '29-dic', ventas: 19500 },
          { name: '06-ene', ventas: 10000 }, { name: '09-ene', ventas: 0 }
        ]);

        setTableData([
          { fecha: '09 ene 2026', brutas: '$0.00', reembolsos: '$0.00', descuentos: '$0.00', netas: '$0.00', costo: '$0.00', beneficio: '$0.00', margen: '0%', impuestos: '$0.00' },
          { fecha: '08 ene 2026', brutas: '$5,570.00', reembolsos: '$0.00', descuentos: '$0.00', netas: '$5,570.00', costo: '$3,056.62', beneficio: '$2,513.38', margen: '45.12%', impuestos: '$0.00' },
        ]);
      } else {
        // Calculate real metrics from sales
        let totalBrutas = 0;
        let totalReembolsos = 0;
        let totalDescuentos = 0;
        let totalNetas = 0;
        let totalBeneficio = 0;

        sales.forEach(sale => {
          totalBrutas += Number(sale.total_amount) + Number(sale.discount_amount);
          totalDescuentos += Number(sale.discount_amount);
          totalNetas += Number(sale.total_amount);
          totalBeneficio += Number(sale.gross_profit);
        });

        setMetrics({
          brutas: totalBrutas,
          reembolsos: totalReembolsos,
          descuentos: totalDescuentos,
          netas: totalNetas,
          beneficio: totalBeneficio,
          tendenciaBrutas: 0,
          tendenciaReembolsos: 0,
          tendenciaDescuentos: 0,
          tendenciaNetas: 0,
          tendenciaBeneficio: 0
        });

        // Group by day for chart
        const chartMap = new Map();
        sales.forEach(sale => {
          const date = new Date(sale.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
          chartMap.set(date, (chartMap.get(date) || 0) + Number(sale.total_amount));
        });

        const sortedChartData = Array.from(chartMap.entries()).map(([name, ventas]) => ({ name, ventas }));
        setChartData(sortedChartData);

        // Map table data
        const mappedTable = sales.map(sale => ({
          fecha: new Date(sale.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }),
          brutas: `$${(Number(sale.total_amount) + Number(sale.discount_amount)).toLocaleString()}`,
          reembolsos: '$0.00',
          descuentos: `$${Number(sale.discount_amount).toLocaleString()}`,
          netas: `$${Number(sale.total_amount).toLocaleString()}`,
          costo: `$${(Number(sale.total_amount) - Number(sale.gross_profit)).toLocaleString()}`,
          beneficio: `$${Number(sale.gross_profit).toLocaleString()}`,
          margen: `${((Number(sale.gross_profit) / Number(sale.total_amount)) * 100 || 0).toFixed(2)}%`,
          impuestos: `$${Number(sale.tax_amount).toLocaleString()}`
        }));
        setTableData(mappedTable);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val: number) => `$${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <main>
      <Sidebar />
      <div className="main-content">
        <header className="header">
          <h1>Resumen de ventas</h1>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={16} /> 11 dic 2025 - 9 ene 2026
            </button>
            <button className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Filter size={16} /> Todos los colaboradores
            </button>
          </div>
        </header>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
            <Loader2 className="animate-spin" size={32} color="var(--accent)" />
          </div>
        ) : (
          <>
            <section className="stats-grid">
              <div className="card stat-card">
                <span className="stat-label">Ventas brutas</span>
                <span className="stat-value">{formatCurrency(metrics.brutas)}</span>
                <span className={`stat-change ${metrics.tendenciaBrutas >= 0 ? 'up' : 'down'}`}>
                  {metrics.tendenciaBrutas >= 0 ? '+' : ''}{metrics.tendenciaBrutas}%
                </span>
              </div>
              <div className="card stat-card">
                <span className="stat-label">Reembolsos</span>
                <span className="stat-value">{formatCurrency(metrics.reembolsos)}</span>
                <span className={`stat-change ${metrics.tendenciaReembolsos >= 0 ? 'up' : 'down'}`}>
                  {metrics.tendenciaReembolsos}%
                </span>
              </div>
              <div className="card stat-card">
                <span className="stat-label">Descuentos</span>
                <span className="stat-value">{formatCurrency(metrics.descuentos)}</span>
                <span className={`stat-change ${metrics.tendenciaDescuentos >= 0 ? 'up' : 'down'}`}>
                  +{metrics.tendenciaDescuentos}%
                </span>
              </div>
              <div className="card stat-card">
                <span className="stat-label">Ventas netas</span>
                <span className="stat-value">{formatCurrency(metrics.netas)}</span>
                <span className={`stat-change ${metrics.tendenciaNetas >= 0 ? 'up' : 'down'}`}>
                  {metrics.tendenciaNetas}%
                </span>
              </div>
              <div className="card stat-card">
                <span className="stat-label">Beneficio bruto</span>
                <span className="stat-value">{formatCurrency(metrics.beneficio)}</span>
                <span className={`stat-change ${metrics.tendenciaBeneficio >= 0 ? 'up' : 'down'}`}>
                  +{metrics.tendenciaBeneficio}%
                </span>
              </div>
            </section>

            <section className="card" style={{ marginBottom: '32px' }}>
              <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Ventas brutas</h3>
              </div>
              <div style={{ width: '100%', height: 350 }}>
                <ResponsiveContainer>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#34c759" stopOpacity={0.1} />
                        <stop offset="95%" stopColor="#34c759" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: '#86868b' }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: '#86868b' }}
                      tickFormatter={(value) => `$${value >= 1000 ? (value / 1000).toFixed(1) + 'k' : value}`}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '12px',
                        border: 'none',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        fontSize: '12px'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="ventas"
                      stroke="#34c759"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorVentas)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600' }}>EXPORTAR</h3>
                <button
                  className="btn btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                  onClick={() => console.log("Exporting to Excel soon...")}
                >
                  <Download size={16} /> Excel (.xls)
                </button>
              </div>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Ventas brutas</th>
                      <th>Reembolsos</th>
                      <th>Descuentos</th>
                      <th>Ventas netas</th>
                      <th>Costo de bienes</th>
                      <th>Beneficio bruto</th>
                      <th>Margen</th>
                      <th>Impuestos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.map((row, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: '500' }}>{row.fecha}</td>
                        <td>{row.brutas}</td>
                        <td>{row.reembolsos}</td>
                        <td>{row.descuentos}</td>
                        <td>{row.netas}</td>
                        <td>{row.costo}</td>
                        <td>{row.beneficio}</td>
                        <td>{row.margen}</td>
                        <td>{row.impuestos}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
