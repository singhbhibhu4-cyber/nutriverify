import React from 'react';
import { Product } from '../data/catalog';

export function GoogleIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.55-.2-2.27H12v4.3h6.44a5.5 5.5 0 0 1-2.39 3.61v3h3.87c2.26-2.08 3.57-5.15 3.57-8.64Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.07 7.93-2.91l-3.87-3c-1.07.72-2.45 1.15-4.06 1.15-3.12 0-5.77-2.11-6.72-4.95H1.28v3.1A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.29A7.19 7.19 0 0 1 4.9 12c0-.8.14-1.57.38-2.29V6.61H1.28A12 12 0 0 0 0 12c0 1.94.46 3.77 1.28 5.39l4-3.1Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.76c1.76 0 3.34.61 4.58 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.28 6.61l4 3.1c.95-2.84 3.6-4.95 6.72-4.95Z"
      />
    </svg>
  );
}

/**
 * Deterministic 21x21 QR-like verification matrix rendered crisply in SVG
 * based on the NABL batch code string.
 */
export function BatchQrSvg({
  code,
  size = 96,
  className = '',
}: {
  code: string;
  size?: number;
  className?: string;
}) {
  const gridSize = 21;
  let hash = 2166136261;
  for (let i = 0; i < code.length; i += 1) {
    hash ^= code.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  const isFinder = (r: number, c: number) => {
    const inBox = (br: number, bc: number) => r >= br && r < br + 7 && c >= bc && c < bc + 7;
    return inBox(0, 0) || inBox(0, gridSize - 7) || inBox(gridSize - 7, 0);
  };

  const finderCellFilled = (r: number, c: number) => {
    const lr = r >= gridSize - 7 ? r - (gridSize - 7) : r;
    const lc = c >= gridSize - 7 ? c - (gridSize - 7) : c;
    if (lr === 0 || lr === 6 || lc === 0 || lc === 6) return true;
    if (lr >= 2 && lr <= 4 && lc >= 2 && lc <= 4) return true;
    return false;
  };

  const cells: React.ReactElement[] = [];
  for (let r = 0; r < gridSize; r += 1) {
    for (let c = 0; c < gridSize; c += 1) {
      let filled = false;
      if (isFinder(r, c)) {
        filled = finderCellFilled(r, c);
      } else if (
        (r === 7 && c < 8) ||
        (c === 7 && r < 8) ||
        (r === 7 && c >= gridSize - 8) ||
        (c === gridSize - 8 && r < 8) ||
        (r === gridSize - 8 && c < 8) ||
        (c === 7 && r >= gridSize - 8)
      ) {
        filled = false;
      } else {
        const seed = Math.imul(hash ^ (r * 31 + c * 17), 2654435761) >>> 0;
        filled = (seed & 3) === 0 || (seed & 7) === 3;
      }
      if (filled) {
        cells.push(<rect key={`${r}-${c}`} x={c + 1} y={r + 1} width={1} height={1} />);
      }
    }
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${gridSize + 2} ${gridSize + 2}`}
      className={className}
      role="img"
      aria-label={`Batch verification QR code for ${code}`}
    >
      <rect width={gridSize + 2} height={gridSize + 2} fill="#FFFFFF" rx="1.2" />
      <g fill="#111312">{cells}</g>
    </svg>
  );
}

/**
 * Clean architectural studio-packaging artwork for NutriVerify supplements.
 * Uniform 4:3 frame on neutral mineral studio plinth with clinical label specs.
 */
export function ProductTubArtwork({
  product,
  compact = false,
}: {
  product: Product;
  compact?: boolean;
}) {
  const paletteMap = {
    'tub-dark': {
      bg: '#F2F3F0',
      body: '#1A1E1C',
      lid: '#2D3330',
      label: '#FAFAF9',
      accent: '#0F5E43',
      ink: '#111312',
    },
    'tub-stone': {
      bg: '#F2F3F0',
      body: '#2C302E',
      lid: '#181B1A',
      label: '#F5F6F3',
      accent: '#0F5E43',
      ink: '#111312',
    },
    'tub-forest': {
      bg: '#F2F3F0',
      body: '#13382B',
      lid: '#0D261D',
      label: '#FAFAF9',
      accent: '#0F5E43',
      ink: '#111312',
    },
    canister: {
      bg: '#F2F3F0',
      body: '#222624',
      lid: '#3A403D',
      label: '#FFFFFF',
      accent: '#0F5E43',
      ink: '#111312',
    },
    bottle: {
      bg: '#F2F3F0',
      body: '#1E2522',
      lid: '#0F5E43',
      label: '#FAFAF9',
      accent: '#0F5E43',
      ink: '#111312',
    },
    bundle: {
      bg: '#F2F3F0',
      body: '#1A1E1C',
      lid: '#2D3330',
      label: '#FAFAF9',
      accent: '#0F5E43',
      ink: '#111312',
    },
  };

  const colors = paletteMap[product.packagingStyle];
  const metricText =
    product.category === 'creatine'
      ? `${product.testedProteinG}g PURE`
      : product.category === 'essentials'
      ? '24 VIT/MIN'
      : `${product.testedProteinG}g PROTEIN`;

  return (
    <div
      className="relative w-full aspect-[4/3] bg-[#F2F3F0] overflow-hidden select-none flex items-center justify-center"
      aria-label={`${product.brand} ${product.name} studio packaging`}
    >
      <svg
        viewBox="0 0 400 300"
        className="w-full h-full"
        role="img"
        aria-label={`${product.brand} ${product.name}`}
      >
        {/* Subtle studio surface plane */}
        <rect x="0" y="0" width="400" height="300" fill={colors.bg} />
        <line x1="0" y1="242" x2="400" y2="242" stroke="#E2E5DF" strokeWidth="1" />
        <rect x="0" y="242" width="400" height="58" fill="#EAECE8" />

        {/* Soft studio contact shadow */}
        {product.packagingStyle === 'bundle' ? (
          <>
            <ellipse cx="172" cy="244" rx="74" ry="11" fill="#111312" opacity="0.11" />
            <ellipse cx="278" cy="246" rx="46" ry="8" fill="#111312" opacity="0.10" />
          </>
        ) : (
          <ellipse cx="200" cy="244" rx="82" ry="12" fill="#111312" opacity="0.11" />
        )}

        {/* Packaging Silhouettes */}
        {product.packagingStyle === 'canister' ? (
          <g>
            {/* Compact Creatine Canister */}
            <rect x="142" y="88" width="116" height="22" rx="5" fill={colors.lid} />
            <line x1="154" y1="93" x2="154" y2="105" stroke="#535B57" strokeWidth="2" />
            <line x1="166" y1="93" x2="166" y2="105" stroke="#535B57" strokeWidth="2" />
            <line x1="234" y1="93" x2="234" y2="105" stroke="#535B57" strokeWidth="2" />
            <line x1="246" y1="93" x2="246" y2="105" stroke="#535B57" strokeWidth="2" />
            <rect x="134" y="108" width="132" height="134" rx="14" fill={colors.body} />
            <rect x="146" y="128" width="108" height="96" rx="4" fill={colors.label} />
            <rect x="146" y="128" width="108" height="6" fill={colors.accent} />
            <text
              x="156"
              y="148"
              fontFamily="JetBrains Mono, monospace"
              fontSize="8.5"
              fontWeight="600"
              fill="#575C58"
            >
              {product.brand.toUpperCase()}
            </text>
            <text
              x="156"
              y="168"
              fontFamily="Bricolage Grotesque, sans-serif"
              fontSize="14"
              fontWeight="700"
              fill={colors.ink}
            >
              CREATINE
            </text>
            <text
              x="156"
              y="182"
              fontFamily="DM Sans, sans-serif"
              fontSize="9.5"
              fill="#575C58"
            >
              200 Mesh · {product.weight}
            </text>
            <line x1="156" y1="194" x2="244" y2="194" stroke="#E5E7E3" strokeWidth="1" />
            <text
              x="156"
              y="211"
              fontFamily="JetBrains Mono, monospace"
              fontSize="10"
              fontWeight="600"
              fill={colors.accent}
            >
              HPLC 99.7%
            </text>
          </g>
        ) : product.packagingStyle === 'bottle' ? (
          <g>
            {/* Clinical Tablet Bottle */}
            <rect x="164" y="66" width="72" height="22" rx="4" fill={colors.lid} />
            <rect x="158" y="88" width="84" height="10" rx="3" fill="#2A312E" />
            <path
              d="M158 98 L242 98 Q254 106 254 122 L254 228 Q254 242 240 242 L160 242 Q146 242 146 228 L146 122 Q146 106 158 98 Z"
              fill={colors.body}
            />
            <rect x="156" y="126" width="88" height="96" rx="4" fill={colors.label} />
            <rect x="156" y="126" width="88" height="5" fill={colors.accent} />
            <text
              x="164"
              y="145"
              fontFamily="JetBrains Mono, monospace"
              fontSize="8"
              fontWeight="600"
              fill="#575C58"
            >
              NUTRIVERIFY
            </text>
            <text
              x="164"
              y="164"
              fontFamily="Bricolage Grotesque, sans-serif"
              fontSize="13"
              fontWeight="700"
              fill={colors.ink}
            >
              DAILY MULTI
            </text>
            <text
              x="164"
              y="178"
              fontFamily="DM Sans, sans-serif"
              fontSize="9"
              fill="#575C58"
            >
              {product.weight}
            </text>
            <line x1="164" y1="191" x2="236" y2="191" stroke="#E5E7E3" strokeWidth="1" />
            <text
              x="164"
              y="209"
              fontFamily="JetBrains Mono, monospace"
              fontSize="9.5"
              fontWeight="600"
              fill={colors.accent}
            >
              100% ICMR RDA
            </text>
          </g>
        ) : product.packagingStyle === 'bundle' ? (
          <g>
            {/* Primary Whey Tub (left) */}
            <rect x="116" y="58" width="112" height="22" rx="5" fill={colors.lid} />
            <rect x="104" y="78" width="136" height="164" rx="14" fill={colors.body} />
            <rect x="116" y="102" width="112" height="118" rx="4" fill={colors.label} />
            <rect x="116" y="102" width="112" height="6" fill={colors.accent} />
            <text
              x="126"
              y="123"
              fontFamily="JetBrains Mono, monospace"
              fontSize="8.5"
              fontWeight="600"
              fill="#575C58"
            >
              STUDENT BATCH #1
            </text>
            <text
              x="126"
              y="146"
              fontFamily="Bricolage Grotesque, sans-serif"
              fontSize="16"
              fontWeight="700"
              fill={colors.ink}
            >
              WHEY 1KG
            </text>
            <text
              x="126"
              y="164"
              fontFamily="DM Sans, sans-serif"
              fontSize="10"
              fill="#575C58"
            >
              Avvatar Direct Lot
            </text>
            <line x1="126" y1="180" x2="218" y2="180" stroke="#E5E7E3" strokeWidth="1" />
            <text
              x="126"
              y="201"
              fontFamily="JetBrains Mono, monospace"
              fontSize="11"
              fontWeight="600"
              fill={colors.accent}
            >
              27.6g TESTED
            </text>

            {/* Paired Creatine Canister (right foreground) */}
            <rect x="242" y="128" width="72" height="16" rx="4" fill="#3A403D" />
            <rect x="234" y="142" width="88" height="102" rx="10" fill="#13382B" />
            <rect x="243" y="158" width="70" height="72" rx="3" fill="#FFFFFF" />
            <rect x="243" y="158" width="70" height="4" fill="#0F5E43" />
            <text
              x="250"
              y="176"
              fontFamily="Bricolage Grotesque, sans-serif"
              fontSize="10"
              fontWeight="700"
              fill="#111312"
            >
              CREATINE
            </text>
            <text
              x="250"
              y="190"
              fontFamily="JetBrains Mono, monospace"
              fontSize="8.5"
              fill="#575C58"
            >
              250 g
            </text>
            <text
              x="250"
              y="214"
              fontFamily="JetBrains Mono, monospace"
              fontSize="8.5"
              fontWeight="600"
              fill="#0F5E43"
            >
              99.7% PURE
            </text>
          </g>
        ) : (
          <g>
            {/* Standard 1kg Whey Tub */}
            <rect x="140" y="54" width="120" height="24" rx="6" fill={colors.lid} />
            <line x1="154" y1="60" x2="154" y2="72" stroke="#4D5450" strokeWidth="2" />
            <line x1="168" y1="60" x2="168" y2="72" stroke="#4D5450" strokeWidth="2" />
            <line x1="232" y1="60" x2="232" y2="72" stroke="#4D5450" strokeWidth="2" />
            <line x1="246" y1="60" x2="246" y2="72" stroke="#4D5450" strokeWidth="2" />
            <rect x="126" y="76" width="148" height="166" rx="16" fill={colors.body} />
            {/* Front Studio Label */}
            <rect x="140" y="98" width="120" height="122" rx="4" fill={colors.label} />
            <rect x="140" y="98" width="120" height="6" fill={colors.accent} />
            <text
              x="151"
              y="120"
              fontFamily="JetBrains Mono, monospace"
              fontSize="9"
              fontWeight="600"
              fill="#575C58"
            >
              {product.brand.toUpperCase()}
            </text>
            <text
              x="151"
              y="144"
              fontFamily="Bricolage Grotesque, sans-serif"
              fontSize="17"
              fontWeight="700"
              fill={colors.ink}
            >
              WHEY PROTEIN
            </text>
            <text
              x="151"
              y="162"
              fontFamily="DM Sans, sans-serif"
              fontSize="10"
              fill="#575C58"
            >
              {product.weight} · {product.servings} Servings
            </text>
            <line x1="151" y1="176" x2="249" y2="176" stroke="#E5E7E3" strokeWidth="1" />
            <text
              x="151"
              y="196"
              fontFamily="JetBrains Mono, monospace"
              fontSize="11.5"
              fontWeight="600"
              fill={colors.accent}
            >
              {metricText}
            </text>
            <text
              x="151"
              y="211"
              fontFamily="JetBrains Mono, monospace"
              fontSize="8"
              fill="#6A706C"
            >
              NABL {product.nablCertId}
            </text>
          </g>
        )}

        {/* Quiet corner batch stamp */}
        {!compact && (
          <g>
            <text
              x="20"
              y="28"
              fontFamily="JetBrains Mono, monospace"
              fontSize="10"
              fontWeight="500"
              fill="#575C58"
            >
              BATCH {product.batchCode}
            </text>
            <text
              x="380"
              y="28"
              textAnchor="end"
              fontFamily="JetBrains Mono, monospace"
              fontSize="10"
              fontWeight="600"
              fill="#0F5E43"
            >
              NABL VERIFIED
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}
