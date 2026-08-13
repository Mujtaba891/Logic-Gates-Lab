import React from 'react';
import { GateType } from '../types';

interface GateSymbolProps {
  type: GateType;
  width?: number;
  height?: number;
  active?: boolean;
  color?: string;
  className?: string;
}

export const GateSymbolSvg: React.FC<GateSymbolProps> = ({
  type,
  width = 80,
  height = 50,
  active = false,
  color,
  className = '',
}) => {
  const strokeColor = active ? '#22c55e' : color || '#e2e8f0';
  const fillColor = active ? 'rgba(34, 197, 94, 0.15)' : 'rgba(30, 41, 59, 0.7)';

  const renderSymbol = () => {
    switch (type) {
      case 'AND':
        return (
          <g>
            {/* Standard IEEE AND D-Shape */}
            <path
              d="M 15 10 L 40 10 C 55 10, 55 40, 40 40 L 15 40 Z"
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth="2.5"
            />
            {/* Input pins */}
            <line x1="0" y1="18" x2="15" y2="18" stroke={strokeColor} strokeWidth="2" />
            <line x1="0" y1="32" x2="15" y2="32" stroke={strokeColor} strokeWidth="2" />
            {/* Output pin */}
            <line x1="52" y1="25" x2="75" y2="25" stroke={strokeColor} strokeWidth="2" />
          </g>
        );

      case 'NAND':
        return (
          <g>
            <path
              d="M 15 10 L 38 10 C 52 10, 52 40, 38 40 L 15 40 Z"
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth="2.5"
            />
            {/* Inversion Bubble */}
            <circle cx="53" cy="25" r="4" fill="#0f172a" stroke={strokeColor} strokeWidth="2" />
            {/* Input pins */}
            <line x1="0" y1="18" x2="15" y2="18" stroke={strokeColor} strokeWidth="2" />
            <line x1="0" y1="32" x2="15" y2="32" stroke={strokeColor} strokeWidth="2" />
            {/* Output pin */}
            <line x1="57" y1="25" x2="75" y2="25" stroke={strokeColor} strokeWidth="2" />
          </g>
        );

      case 'OR':
        return (
          <g>
            {/* Curved Shield OR Symbol */}
            <path
              d="M 15 10 Q 30 10 50 25 Q 30 40 15 40 Q 25 25 15 10 Z"
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth="2.5"
            />
            {/* Input pins */}
            <line x1="0" y1="18" x2="20" y2="18" stroke={strokeColor} strokeWidth="2" />
            <line x1="0" y1="32" x2="20" y2="32" stroke={strokeColor} strokeWidth="2" />
            {/* Output pin */}
            <line x1="50" y1="25" x2="75" y2="25" stroke={strokeColor} strokeWidth="2" />
          </g>
        );

      case 'NOR':
        return (
          <g>
            <path
              d="M 15 10 Q 28 10 46 25 Q 28 40 15 40 Q 24 25 15 10 Z"
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth="2.5"
            />
            <circle cx="50" cy="25" r="4" fill="#0f172a" stroke={strokeColor} strokeWidth="2" />
            {/* Input pins */}
            <line x1="0" y1="18" x2="20" y2="18" stroke={strokeColor} strokeWidth="2" />
            <line x1="0" y1="32" x2="20" y2="32" stroke={strokeColor} strokeWidth="2" />
            {/* Output pin */}
            <line x1="54" y1="25" x2="75" y2="25" stroke={strokeColor} strokeWidth="2" />
          </g>
        );

      case 'NOT':
        return (
          <g>
            {/* Triangle for inverter */}
            <path d="M 15 10 L 45 25 L 15 40 Z" fill={fillColor} stroke={strokeColor} strokeWidth="2.5" />
            {/* Inversion Bubble */}
            <circle cx="49" cy="25" r="4" fill="#0f172a" stroke={strokeColor} strokeWidth="2" />
            <line x1="0" y1="25" x2="15" y2="25" stroke={strokeColor} strokeWidth="2" />
            <line x1="53" y1="25" x2="75" y2="25" stroke={strokeColor} strokeWidth="2" />
          </g>
        );

      case 'BUFFER':
        return (
          <g>
            <path d="M 15 10 L 50 25 L 15 40 Z" fill={fillColor} stroke={strokeColor} strokeWidth="2.5" />
            <line x1="0" y1="25" x2="15" y2="25" stroke={strokeColor} strokeWidth="2" />
            <line x1="50" y1="25" x2="75" y2="25" stroke={strokeColor} strokeWidth="2" />
          </g>
        );

      case 'XOR':
        return (
          <g>
            {/* Back additional arc for XOR */}
            <path d="M 10 10 Q 20 25 10 40" fill="none" stroke={strokeColor} strokeWidth="2.5" />
            <path
              d="M 18 10 Q 33 10 52 25 Q 33 40 18 40 Q 28 25 18 10 Z"
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth="2.5"
            />
            <line x1="0" y1="18" x2="23" y2="18" stroke={strokeColor} strokeWidth="2" />
            <line x1="0" y1="32" x2="23" y2="32" stroke={strokeColor} strokeWidth="2" />
            <line x1="52" y1="25" x2="75" y2="25" stroke={strokeColor} strokeWidth="2" />
          </g>
        );

      case 'XNOR':
        return (
          <g>
            <path d="M 8 10 Q 18 25 8 40" fill="none" stroke={strokeColor} strokeWidth="2.5" />
            <path
              d="M 16 10 Q 29 10 47 25 Q 29 40 16 40 Q 26 25 16 10 Z"
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth="2.5"
            />
            <circle cx="51" cy="25" r="4" fill="#0f172a" stroke={strokeColor} strokeWidth="2" />
            <line x1="0" y1="18" x2="21" y2="18" stroke={strokeColor} strokeWidth="2" />
            <line x1="0" y1="32" x2="21" y2="32" stroke={strokeColor} strokeWidth="2" />
            <line x1="55" y1="25" x2="75" y2="25" stroke={strokeColor} strokeWidth="2" />
          </g>
        );

      case 'INPUT':
      case 'CLOCK':
      case 'HIGH':
      case 'LOW':
        return (
          <g>
            <rect
              x="10"
              y="10"
              width="40"
              height="30"
              rx="6"
              fill={active ? 'rgba(34, 197, 94, 0.3)' : '#1e293b'}
              stroke={strokeColor}
              strokeWidth="2"
            />
            <text
              x="30"
              y="29"
              fill={active ? '#22c55e' : '#cbd5e1'}
              fontSize="12"
              fontWeight="bold"
              textAnchor="middle"
            >
              {type === 'INPUT' ? (active ? '1' : '0') : type === 'CLOCK' ? 'CLK' : type === 'HIGH' ? '1' : '0'}
            </text>
            <line x1="50" y1="25" x2="70" y2="25" stroke={strokeColor} strokeWidth="2" />
          </g>
        );

      case 'OUTPUT':
        return (
          <g>
            <line x1="0" y1="25" x2="20" y2="25" stroke={strokeColor} strokeWidth="2" />
            {/* LED Glow Bulb */}
            <circle
              cx="40"
              cy="25"
              r="16"
              fill={active ? '#22c55e' : '#334155'}
              stroke={strokeColor}
              strokeWidth="2.5"
              filter={active ? 'drop-shadow(0px 0px 8px #22c55e)' : undefined}
            />
            <circle cx="40" cy="25" r="8" fill={active ? '#86efac' : '#475569'} opacity="0.8" />
          </g>
        );

      case 'HALF_ADDER':
      case 'FULL_ADDER':
      case 'MUX_21':
        return (
          <g>
            <rect
              x="10"
              y="5"
              width="50"
              height="40"
              rx="6"
              fill="#1e293b"
              stroke={strokeColor}
              strokeWidth="2"
            />
            <text x="35" y="28" fill="#e2e8f0" fontSize="10" fontWeight="bold" textAnchor="middle">
              {type === 'HALF_ADDER' ? 'H-ADD' : type === 'FULL_ADDER' ? 'F-ADD' : 'MUX'}
            </text>
          </g>
        );

      default:
        return null;
    }
  };

  return (
    <svg width={width} height={height} viewBox="0 0 80 50" className={className}>
      {renderSymbol()}
    </svg>
  );
};
