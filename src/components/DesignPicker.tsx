import { useState } from 'react';
import { DESIGN_PRESETS } from '@/config/designPresets';
import { useTheme } from '@/hooks/useTheme';
import { Palette, Check, ChevronDown } from 'lucide-react';

export default function DesignPicker() {
  const { designPreset, setDesignPreset } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const current = DESIGN_PRESETS.find((p) => p.id === designPreset) ?? DESIGN_PRESETS[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2.5 px-3 py-2 bg-surface-light border border-border hover:border-primary/40 transition-all text-left group"
        style={{ borderRadius: 'var(--radius-sm)' }}
      >
        <div className="flex gap-1">
          <span
            className="w-3 h-3 rounded-full ring-1 ring-white/10"
            style={{ backgroundColor: current.preview.accent }}
          />
          <span
            className="w-3 h-3 rounded-full ring-1 ring-white/10"
            style={{ backgroundColor: current.preview.surface }}
          />
        </div>
        <span className="text-xs font-medium text-text flex-1">{current.name}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute bottom-full left-0 mb-2 z-50 bg-surface border border-border shadow-2xl overflow-hidden animate-[fadeIn_0.15s_ease-out]" style={{ borderRadius: 'var(--radius-card)', width: '260px' }}>
            <div className="px-3 py-2 border-b border-border flex items-center gap-2">
              <Palette className="w-3.5 h-3.5 text-text-muted" />
              <span className="text-xs font-medium text-text-muted">Design Presets</span>
            </div>
            <div className="p-1.5 max-h-80 overflow-y-auto">
              {DESIGN_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => {
                    setDesignPreset(preset.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-2.5 py-2.5 text-left transition-colors ${
                    designPreset === preset.id
                      ? 'bg-primary/15'
                      : 'hover:bg-surface-light'
                  }`}
                  style={{ borderRadius: 'var(--radius-sm)' }}
                >
                  {/* Mini color preview */}
                  <div
                    className="w-9 h-9 flex items-center justify-center gap-0.5 shrink-0 ring-1 ring-white/5"
                    style={{ backgroundColor: preset.preview.bg, borderRadius: preset.style.radius === 'sharp' ? '4px' : preset.style.radius === 'pill' ? '9999px' : '8px' }}
                  >
                    <span
                      className="w-2 h-5"
                      style={{ backgroundColor: preset.preview.surface, borderRadius: preset.style.radius === 'sharp' ? '1px' : '3px' }}
                    />
                    <span
                      className="w-2 h-5"
                      style={{ backgroundColor: preset.preview.accent, borderRadius: preset.style.radius === 'sharp' ? '1px' : '3px' }}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-text">{preset.name}</p>
                    <p className="text-[10px] text-text-muted leading-tight">{preset.description}</p>
                    <div className="flex gap-1 mt-1">
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-surface-lighter text-text-muted">
                        {preset.style.radius}
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-surface-lighter text-text-muted">
                        {preset.style.sidebarStyle}
                      </span>
                      {preset.style.glowAccent && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-primary/20 text-primary-light">
                          glow
                        </span>
                      )}
                    </div>
                  </div>

                  {designPreset === preset.id && (
                    <Check className="w-3.5 h-3.5 text-primary-light shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
