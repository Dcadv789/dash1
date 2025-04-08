import React from 'react';
import { 
  Home,
  LayoutDashboard, 
  ShoppingCart, 
  LineChart,
  Wallet,
  Receipt,
  Menu,
  CircuitBoard,
} from 'lucide-react';
import { NavLink } from './NavLink';

export const Sidebar = () => {
  return (
    <aside className="flex flex-col w-64 bg-zinc-900 m-2 rounded-xl">
      <div className="flex-1 flex flex-col p-6">
        {/* Logo */}
        <div className="flex items-center gap-3 px-1 pb-6">
          <CircuitBoard className="h-8 w-8 text-blue-500" />
          <span className="font-semibold text-xl">Sistema</span>
        </div>

        {/* Menu Toggle (Mobile) */}
        <button className="lg:hidden flex items-center gap-2 text-zinc-400 hover:text-zinc-100">
          <Menu size={20} />
          <span>Menu</span>
        </button>

        {/* Navigation */}
        <nav className="space-y-0.5 mt-6">
          <NavLink icon={Home} text="Início" active />
          <NavLink icon={LayoutDashboard} text="Dashboard" />
          <NavLink icon={ShoppingCart} text="Vendas" />
          <NavLink icon={LineChart} text="Análise" />
          <NavLink icon={Wallet} text="Caixa" />
          <NavLink icon={Receipt} text="DRE" />
        </nav>
      </div>
    </aside>
  );
};