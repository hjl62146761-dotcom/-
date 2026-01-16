
import React from 'react';

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, active, onClick, disabled }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
        active 
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
          : disabled 
            ? 'text-slate-600 cursor-not-allowed opacity-50' 
            : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
      }`}
    >
      <span className={active ? 'text-white' : 'text-slate-500'}>{icon}</span>
      {label}
    </button>
  );
};

export default SidebarItem;
