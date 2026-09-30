import React, { useState } from 'react';
import { X, Check, Ruler, Sliders, Cpu } from 'lucide-react';

interface SizeChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  category?: string;
}

export const SizeChartModal: React.FC<SizeChartModalProps> = ({
  isOpen,
  onClose,
  productName,
  category = 'apparel',
}) => {
  const [unit, setUnit] = useState<'in' | 'cm'>('in');

  if (!isOpen) return null;

  const isEquipment = category === 'musical' || category === 'electronics' || category === 'appliances';

  const garmentMeasurements = {
    in: [
      { size: 'XS', chest: '36 - 38', shoulder: '17.2', sleeve: '32.5', length: '27.0' },
      { size: 'S', chest: '38 - 40', shoulder: '17.8', sleeve: '33.5', length: '27.5' },
      { size: 'M', chest: '40 - 42', shoulder: '18.5', sleeve: '34.5', length: '28.2' },
      { size: 'L', chest: '42 - 44', shoulder: '19.2', sleeve: '35.5', length: '29.0' },
      { size: 'XL', chest: '44 - 46', shoulder: '20.0', sleeve: '36.5', length: '29.8' },
    ],
    cm: [
      { size: 'XS', chest: '91 - 96', shoulder: '43.7', sleeve: '82.5', length: '68.5' },
      { size: 'S', chest: '96 - 101', shoulder: '45.2', sleeve: '85.0', length: '70.0' },
      { size: 'M', chest: '101 - 106', shoulder: '47.0', sleeve: '87.5', length: '71.5' },
      { size: 'L', chest: '106 - 112', shoulder: '48.8', sleeve: '90.0', length: '73.5' },
      { size: 'XL', chest: '112 - 118', shoulder: '50.8', sleeve: '92.5', length: '75.5' },
    ],
  };

  const equipmentSpecs = {
    in: [
      { model: 'Standard / Solo', width: '12.5 in', depth: '10.2 in', height: '14.8 in', weight: '14.2 lbs' },
      { model: 'Studio / Pro Kit', width: '18.0 in', depth: '14.5 in', height: '16.5 in', weight: '22.5 lbs' },
      { model: 'Master Edition', width: '22.4 in', depth: '16.8 in', height: '18.2 in', weight: '31.0 lbs' },
    ],
    cm: [
      { model: 'Standard / Solo', width: '31.8 cm', depth: '25.9 cm', height: '37.6 cm', weight: '6.4 kg' },
      { model: 'Studio / Pro Kit', width: '45.7 cm', depth: '36.8 cm', height: '41.9 cm', weight: '10.2 kg' },
      { model: 'Master Edition', width: '56.9 cm', depth: '42.7 cm', height: '46.2 cm', weight: '14.1 kg' },
    ],
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs">
      <div
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-200">
          <div>
            <h3 className="text-xl font-display font-medium text-zinc-900">
              {isEquipment ? 'Dimensions & Technical Specifications Guide' : 'Sizing & Fit Guide'}
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">{productName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Unit Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-700 uppercase tracking-wider">
              {isEquipment ? 'Physical Dimensions' : 'Garment Dimensions'}
            </span>
            <div className="flex items-center bg-zinc-100 p-1 rounded-lg">
              <button
                onClick={() => setUnit('in')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                  unit === 'in'
                    ? 'bg-white text-zinc-950 shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-950'
                }`}
              >
                {isEquipment ? 'Inches (in)' : 'Inches (in)'}
              </button>
              <button
                onClick={() => setUnit('cm')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                  unit === 'cm'
                    ? 'bg-white text-zinc-950 shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-950'
                }`}
              >
                {isEquipment ? 'Centimeters (cm)' : 'Centimeters (cm)'}
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto border border-zinc-200 rounded-xl">
            {isEquipment ? (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Edition / Configuration</th>
                    <th className="py-3 px-4">Width (W)</th>
                    <th className="py-3 px-4">Depth (D)</th>
                    <th className="py-3 px-4">Height (H)</th>
                    <th className="py-3 px-4">Weight</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 font-mono tabular-nums text-zinc-800">
                  {equipmentSpecs[unit].map((row) => (
                    <tr key={row.model} className="hover:bg-zinc-50/70 transition-colors">
                      <td className="py-3 px-4 font-sans font-semibold text-zinc-950">{row.model}</td>
                      <td className="py-3 px-4">{row.width}</td>
                      <td className="py-3 px-4">{row.depth}</td>
                      <td className="py-3 px-4">{row.height}</td>
                      <td className="py-3 px-4">{row.weight}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Size</th>
                    <th className="py-3 px-4">Chest</th>
                    <th className="py-3 px-4">Shoulder</th>
                    <th className="py-3 px-4">Sleeve</th>
                    <th className="py-3 px-4">Body Length</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 font-mono tabular-nums text-zinc-800">
                  {garmentMeasurements[unit].map((row) => (
                    <tr key={row.size} className="hover:bg-zinc-50/70 transition-colors">
                      <td className="py-3 px-4 font-sans font-semibold text-zinc-950">{row.size}</td>
                      <td className="py-3 px-4">{row.chest}</td>
                      <td className="py-3 px-4">{row.shoulder}</td>
                      <td className="py-3 px-4">{row.sleeve}</td>
                      <td className="py-3 px-4">{row.length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Recommendations & Tips */}
          <div className="bg-[#FAF9F6] p-4 rounded-xl border border-zinc-200/80 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-900">
              {isEquipment ? 'Equipment Setup & Compatibility Notes' : 'Product Fit Recommendation'}
            </h4>
            <ul className="text-xs text-zinc-600 space-y-2">
              {isEquipment ? (
                <>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-zinc-900 shrink-0 mt-0.5" />
                    <span><strong>Power & Voltage:</strong> Universal 100V–240V auto-switching power supply included with region-specific IEC cable.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-zinc-900 shrink-0 mt-0.5" />
                    <span><strong>Studio Integration:</strong> Designed for standard studio rack and desk footprints with vibration-damped silicone feet.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-zinc-900 shrink-0 mt-0.5" />
                    <span><strong>Warranty & Support:</strong> Backed by a 3-year global manufacturer warranty and direct concierge setup assistance.</span>
                  </li>
                </>
              ) : (
                <>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-zinc-900 shrink-0 mt-0.5" />
                    <span><strong>Relaxed Modern Silhouette:</strong> This garment is cut with a relaxed drape and slightly dropped shoulders. Take your true size for the intended archival boxy fit.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-zinc-900 shrink-0 mt-0.5" />
                    <span><strong>Layering Fit:</strong> If you plan to wear thick fisherman knitwear beneath, your normal size provides ample room without bunching.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-zinc-900 shrink-0 mt-0.5" />
                    <span><strong>Free Size Exchanges:</strong> Need a different size? We offer complimentary prepaid exchanges within 30 days.</span>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-zinc-50 border-t border-zinc-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold bg-zinc-950 text-white hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
