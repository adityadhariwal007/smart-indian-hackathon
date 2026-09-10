import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, Stethoscope, Shield, Sliders, ChevronUp, ChevronDown } from 'lucide-react';

export default function DemoControls() {
  const { user, switchRole } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(true);

  if (!user) return null;

  const roles = [
    { id: 'patient', label: 'Patient', icon: User, path: '/patient' },
    { id: 'doctor', label: 'Doctor', icon: Stethoscope, path: '/doctor' },
    { id: 'admin', label: 'Hospital Admin', icon: Shield, path: '/admin' }
  ];

  return (
    <aside 
      aria-label="Demo Role Controls"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9990,
        fontFamily: 'var(--font-heading, sans-serif)'
      }}
    >
      <div
        style={{
          background: '#0F172A',
          color: '#FFFFFF',
          borderRadius: '16px',
          boxShadow: '0 12px 32px rgba(0, 0, 0, 0.28), 0 0 0 1px rgba(255, 255, 255, 0.1)',
          overflow: 'hidden',
          transition: 'all 0.2s ease',
          minWidth: collapsed ? 'auto' : '220px'
        }}
      >
        {/* Toggle Bar */}
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 14px',
            width: '100%',
            background: 'transparent',
            color: '#FFFFFF',
            border: 'none',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 600
          }}
          title="Toggle Demo Role Switcher"
        >
          <Sliders size={13} style={{ color: '#F59E0B' }} />
          <span style={{ letterSpacing: '0.02em', opacity: 0.9 }}>Demo Controls</span>
          <span 
            style={{
              fontSize: '10px',
              padding: '1px 6px',
              borderRadius: '6px',
              background: '#334155',
              color: '#94A3B8',
              fontWeight: 700,
              textTransform: 'capitalize'
            }}
          >
            {user.role}
          </span>
          {collapsed ? <ChevronUp size={13} style={{ marginLeft: 'auto', opacity: 0.6 }} /> : <ChevronDown size={13} style={{ marginLeft: 'auto', opacity: 0.6 }} />}
        </button>

        {/* Expanded Role Selection Buttons */}
        {!collapsed && (
          <div 
            style={{ 
              padding: '8px 10px 10px', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '6px',
              borderTop: '1px solid #1E293B'
            }}
          >
            <div style={{ fontSize: '11px', color: '#94A3B8', padding: '2px 6px', fontWeight: 500 }}>
              Simulate Active Clinical Role:
            </div>
            {roles.map(r => {
              const Icon = r.icon;
              const isActive = user.role === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => {
                    switchRole(r.id);
                    navigate(r.path);
                    setCollapsed(true);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 10px',
                    borderRadius: '10px',
                    fontSize: '12px',
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    background: isActive ? '#059669' : '#1E293B',
                    color: '#FFFFFF',
                    textAlign: 'left'
                  }}
                >
                  <Icon size={14} style={{ color: isActive ? '#FFFFFF' : '#94A3B8' }} />
                  <span>{r.label}</span>
                  {isActive && (
                    <span style={{ marginLeft: 'auto', fontSize: '10px', opacity: 0.85, fontWeight: 700 }}>
                      Active
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
}
