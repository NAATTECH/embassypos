"use client";

import React from 'react';
import {
    BarChart3,
    Package,
    Tags,
    Users,
    CreditCard,
    Receipt,
    Scissors,
    Percent,
    Wallet,
    Settings,
    HelpCircle
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const menuItems = [
    { icon: BarChart3, label: 'Resumen de ventas', href: '/' },
    { icon: Package, label: 'Ventas por Artículo', href: '/items' },
    { icon: Tags, label: 'Ventas por Categoría', href: '/categories' },
    { icon: Users, label: 'Ventas por Empleado', href: '/employees' },
    { icon: CreditCard, label: 'Ventas por Tipo de Pago', href: '/payments' },
    { icon: Receipt, label: 'Recibos', href: '/receipts' },
    { icon: Scissors, label: 'Descuentos', href: '/discounts' },
    { icon: Percent, label: 'Impuestos', href: '/taxes' },
    { icon: Wallet, label: 'Caja', href: '/caja' },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="sidebar glass">
            <div style={{ padding: '0 12px 24px 12px', borderBottom: '1px solid var(--sidebar-border)', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '700', letterSpacing: '-0.5px' }}>Embassy POS</h2>
            </div>

            <nav style={{ flex: 1 }}>
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`sidebar-item ${isActive ? 'active' : ''}`}
                        >
                            <Icon size={18} />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div style={{ borderTop: '1px solid var(--sidebar-border)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <Link href="/settings" className="sidebar-item">
                    <Settings size={18} />
                    <span>Configuración</span>
                </Link>
                <Link href="/help" className="sidebar-item">
                    <HelpCircle size={18} />
                    <span>Ayuda</span>
                </Link>
            </div>
        </aside>
    );
}
