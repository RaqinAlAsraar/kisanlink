import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Home, 
  TrendingUp, 
  Camera, 
  Store, 
  Snowflake, 
  UserCheck, 
  Settings, 
  Leaf, 
  UserCircle,
  X 
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar({ onClose }) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { name: t('dashboard'), path: '/', icon: Home },
    { name: t('mandiPrices'), path: '/mandi', icon: TrendingUp },
    { name: t('cropScanner'), path: '/scanner', icon: Camera },
    { name: t('directMarket'), path: '/marketplace', icon: Store },
    { name: t('coldStorage'), path: '/storage', icon: Snowflake },
    { name: t('expertConnect'), path: '/experts', icon: UserCheck },
    { name: t('profileSettings'), path: '/profile', icon: Settings },
  ];

  const handleNavClick = (path) => {
    navigate(path);
    if (onClose) onClose();
  };

  return (
    <aside className="w-64 bg-white border-r border-[#44615815] h-full min-h-screen flex flex-col justify-between shrink-0 select-none">
      <div>
        {/* Brand Header */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-[#44615810] lg:border-none">
          <div 
            onClick={() => handleNavClick('/')} 
            className="flex items-center gap-3 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-2xl bg-[#272c1a] flex items-center justify-center shadow-md">
              <Leaf className="w-5 h-5 text-[#9fd700] fill-[#9fd700]" />
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-black text-[#272c1a] tracking-tight">Kisan<span className="text-[#446158]">Link</span></span>
              <p className="text-[10px] uppercase font-bold text-[#44615880] tracking-wider -mt-1">Fair Trade & Diagnostics</p>
            </div>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-xl border border-[#44615820] text-[#446158] hover:text-[#272c1a]"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="px-3 space-y-1.5 mt-3">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              onClick={() => {
                if (onClose) onClose();
              }}
              className={({ isActive }) =>
                `flex items-center gap-3.5 px-4 py-3 rounded-2xl font-semibold text-sm transition-all duration-150 interactive-tap ${
                  isActive
                    ? 'bg-[#ecfccb] text-[#272c1a] font-bold shadow-sm border border-[#9fd70050]'
                    : 'text-[#446158] hover:bg-[#fffeef] hover:text-[#272c1a]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-[#3d5500] stroke-[2.5]' : 'text-[#446158]'}`} />
                  <span>{item.name}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Farmer Profile Footer (Wireframe Match) */}
      <div className="p-4 border-t border-[#44615815] bg-[#fffeef]/50">
        <button
          onClick={() => handleNavClick('/profile')}
          className="w-full flex items-center gap-3 p-2 rounded-2xl hover:bg-white transition-all text-left group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-full bg-[#446158] text-white flex items-center justify-center shadow-sm shrink-0 group-hover:bg-[#272c1a] transition-colors">
            <UserCircle className="w-6 h-6 text-[#9fd700]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-[#272c1a] truncate leading-tight">
              {user?.name || "Ram Singh"}
            </p>
            <p className="text-xs text-[#44615880] truncate font-medium">
              {user?.displayPhone || "+91 98*** **321"}
            </p>
          </div>
        </button>
      </div>
    </aside>
  );
}
