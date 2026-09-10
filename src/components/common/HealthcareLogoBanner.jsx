import LogoLoop from './LogoLoop';
import { Syringe, Cross, Ambulance } from 'lucide-react';

// Pure healthcare icons: Syringe, Medical Cross, and Ambulance (Large, pure solid white, no text)
const healthcareIcons = [
  { node: <Syringe size={42} color="#FFFFFF" stroke="#FFFFFF" strokeWidth={2.2} className="text-white" />, title: 'Syringe' },
  { node: <Cross size={42} color="#FFFFFF" stroke="#FFFFFF" strokeWidth={2.2} className="text-white" />, title: 'Medical Cross' },
  { node: <Ambulance size={42} color="#FFFFFF" stroke="#FFFFFF" strokeWidth={2.2} className="text-white" />, title: 'Ambulance' },
  { node: <Syringe size={42} color="#FFFFFF" stroke="#FFFFFF" strokeWidth={2.2} className="text-white" />, title: 'Syringe' },
  { node: <Cross size={42} color="#FFFFFF" stroke="#FFFFFF" strokeWidth={2.2} className="text-white" />, title: 'Medical Cross' },
  { node: <Ambulance size={42} color="#FFFFFF" stroke="#FFFFFF" strokeWidth={2.2} className="text-white" />, title: 'Ambulance' },
  { node: <Syringe size={42} color="#FFFFFF" stroke="#FFFFFF" strokeWidth={2.2} className="text-white" />, title: 'Syringe' },
  { node: <Cross size={42} color="#FFFFFF" stroke="#FFFFFF" strokeWidth={2.2} className="text-white" />, title: 'Medical Cross' },
  { node: <Ambulance size={42} color="#FFFFFF" stroke="#FFFFFF" strokeWidth={2.2} className="text-white" />, title: 'Ambulance' },
];

export default function HealthcareLogoBanner({ className = '', style = {} }) {
  return (
    <div
      className={`w-full overflow-hidden relative flex items-center ${className}`}
      style={{
        backgroundColor: '#0a0a0c',
        height: '70px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        ...style
      }}
    >
      <LogoLoop
        logos={healthcareIcons}
        speed={55}
        direction="left"
        logoHeight={42}
        gap={60}
        hoverSpeed={15}
        scaleOnHover
        fadeOut
        fadeOutColor="#0a0a0c"
        ariaLabel="Healthcare icons loop"
      />
    </div>
  );
}

