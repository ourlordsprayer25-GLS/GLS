import React, { useState } from 'react';
import {
  Laptop,
  Monitor,
  Cpu,
  Layers,
  HardDrive,
  SlidersHorizontal,
  Check,
  ChevronDown,
  Sparkles,
  X,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import {
  LAPTOP_BRANDS,
  PROCESSOR_CATALOG,
  RAM_SPEC_OPTIONS,
  STORAGE_SPEC_OPTIONS,
  OS_CATALOG,
  DISPLAY_OPTIONS,
  WORKLOAD_OPTIONS,
} from '../../data/hardwareTaxonomy';

interface HardwareSpecWizardProps {
  initialBrand?: string;
  onApplySpecs: (specs: { label: string; value: string }[], generatedTitle?: string, brandName?: string) => void;
  onClose?: () => void;
}

export const HardwareSpecWizard: React.FC<HardwareSpecWizardProps> = ({
  initialBrand = 'HP',
  onApplySpecs,
  onClose,
}) => {
  // Wizard active section accordion: 'device' | 'brand' | 'cpu' | 'ram' | 'storage' | 'os' | 'display'
  const [activeAccordion, setActiveAccordion] = useState<string>('brand');

  // Selected State
  const [deviceType, setDeviceType] = useState<'Laptop' | 'Desktop / Tower' | 'All-in-One (AIO)' | 'Workstation'>('Laptop');
  const [selectedBrand, setSelectedBrand] = useState<string>(initialBrand || 'HP');
  const [selectedSeries, setSelectedSeries] = useState<string>('EliteBook');
  
  const [selectedCpuFamily, setSelectedCpuFamily] = useState<string>('Intel Core i7');
  const [selectedCpuGen, setSelectedCpuGen] = useState<string>('11th Gen (Tiger Lake)');
  
  const [selectedRamType, setSelectedRamType] = useState<string>('DDR4 (3200MHz)');
  const [selectedRamCapacity, setSelectedRamCapacity] = useState<string>('16 GB');
  
  const [selectedStorageType, setSelectedStorageType] = useState<string>('High-Speed NVMe M.2 SSD');
  const [selectedStorageCapacity, setSelectedStorageCapacity] = useState<string>('512 GB');
  
  const [selectedOsFamily, setSelectedOsFamily] = useState<string>('Windows');
  const [selectedOsEdition, setSelectedOsEdition] = useState<string>('Windows 11 Pro (64-bit)');
  
  const [selectedDisplay, setSelectedDisplay] = useState<string>('14.0" Full HD IPS Anti-Glare');
  const [selectedWorkload, setSelectedWorkload] = useState<string>('Software Development & Engineering');

  // Handlers for interactive cascading drill-downs
  const handleBrandChange = (brand: string) => {
    setSelectedBrand(brand);
    const found = LAPTOP_BRANDS.find((b) => b.brand === brand);
    if (found && found.series.length > 0) {
      setSelectedSeries(found.series[0]);
    }
  };

  const handleCpuFamilyChange = (family: string) => {
    setSelectedCpuFamily(family);
    const found = PROCESSOR_CATALOG.find((c) => c.family === family);
    if (found && found.generations.length > 0) {
      setSelectedCpuGen(found.generations[0]);
    }
  };

  const handleOsFamilyChange = (osFam: string) => {
    setSelectedOsFamily(osFam);
    const found = OS_CATALOG.find((o) => o.family === osFam);
    if (found && found.editions.length > 0) {
      setSelectedOsEdition(found.editions[0]);
    }
  };

  // Compile final clean title
  const buildConfiguredTitle = () => {
    const brandName = selectedBrand;
    const seriesName = selectedSeries;
    const cpuSimple = selectedCpuFamily.replace('Intel ', '').replace('Apple Silicon (M-Series)', 'Apple');
    const genSimple = selectedCpuGen.split(' ')[0];
    const ramSimple = selectedRamCapacity;
    const storageSimple = selectedStorageCapacity;
    const osSimple = selectedOsEdition.includes('Windows 11 Pro') ? 'Win 11 Pro'
      : selectedOsEdition.includes('Windows 10 Pro') ? 'Win 10 Pro'
      : selectedOsEdition.split(' ')[0] + ' ' + (selectedOsEdition.split(' ')[1] || '');

    return `${brandName} ${seriesName} (${cpuSimple} ${genSimple} • ${ramSimple} RAM • ${storageSimple} SSD • ${osSimple})`;
  };

  // Compile full structured specs
  const handleConfirmAndApply = (updateTitle: boolean) => {
    const specs: { label: string; value: string }[] = [
      { label: 'Device Category', value: deviceType },
      { label: 'Brand & Model Series', value: `${selectedBrand} ${selectedSeries}` },
      { label: 'Processor (CPU)', value: `${selectedCpuFamily} — ${selectedCpuGen}` },
      { label: 'Installed RAM', value: `${selectedRamCapacity} ${selectedRamType}` },
      { label: 'Primary Storage', value: `${selectedStorageCapacity} ${selectedStorageType}` },
      { label: 'Operating System', value: selectedOsEdition },
      { label: 'Display & Screen', value: selectedDisplay },
      { label: 'Recommended Use', value: selectedWorkload },
    ];

    const generatedTitle = updateTitle ? buildConfiguredTitle() : undefined;
    onApplySpecs(specs, generatedTitle, selectedBrand);
    if (onClose) onClose();
  };

  const currentBrandSeries = LAPTOP_BRANDS.find((b) => b.brand === selectedBrand)?.series || [];
  const currentCpuGenerations = PROCESSOR_CATALOG.find((c) => c.family === selectedCpuFamily)?.generations || [];
  const currentOsEditions = OS_CATALOG.find((o) => o.family === selectedOsFamily)?.editions || [];

  return (
    <div className="bg-white rounded-3xl border border-zinc-200/90 shadow-xl overflow-hidden flex flex-col max-h-[85vh]">
      {/* Header bar */}
      <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-blue-400" />
            <h3 className="text-base sm:text-lg font-bold tracking-tight">
              Hardware Specification Wizard
            </h3>
            <span className="text-[10px] uppercase font-black tracking-widest px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
              Drill-Down Matrix
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Click any section below to drill into specific sub-options. Others fold cleanly.
          </p>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Live Configuration Bar */}
      <div className="p-4 bg-blue-50/70 border-b border-blue-100 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-blue-950 uppercase tracking-wider text-[10px] flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            Live Build:
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-white border border-blue-200 text-blue-900 font-bold shadow-2xs">
            {selectedBrand} {selectedSeries}
          </span>
          <span className="px-2 py-1 rounded-lg bg-white border border-blue-200 text-slate-800 font-medium shadow-2xs">
            {selectedCpuFamily} ({selectedCpuGen.split(' ')[0]})
          </span>
          <span className="px-2 py-1 rounded-lg bg-white border border-blue-200 text-slate-800 font-medium font-mono shadow-2xs">
            {selectedRamCapacity} {selectedRamType.split(' ')[0]}
          </span>
          <span className="px-2 py-1 rounded-lg bg-white border border-blue-200 text-slate-800 font-medium font-mono shadow-2xs">
            {selectedStorageCapacity} {selectedStorageType.includes('NVMe') ? 'NVMe SSD' : 'SSD'}
          </span>
          <span className="px-2 py-1 rounded-lg bg-white border border-blue-200 text-slate-800 font-medium shadow-2xs">
            {selectedOsEdition.split(' ')[0]} {selectedOsEdition.split(' ')[1]}
          </span>
        </div>
      </div>

      {/* Scrollable Accordion Body */}
      <div className="p-5 sm:p-6 overflow-y-auto space-y-3.5 flex-1">
        
        {/* SECTION 1: DEVICE FORM FACTOR */}
        <div className="border border-zinc-200 rounded-2xl overflow-hidden transition-all bg-white shadow-2xs">
          <button
            type="button"
            onClick={() => setActiveAccordion(activeAccordion === 'device' ? '' : 'device')}
            className="w-full p-4 flex items-center justify-between bg-zinc-50/70 hover:bg-zinc-100/60 transition-colors cursor-pointer text-left"
          >
            <div className="flex items-center gap-2.5">
              <Laptop className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                1. Device Form Factor
              </span>
              <span className="text-xs text-blue-600 font-semibold ml-2">
                • {deviceType}
              </span>
            </div>
            <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${activeAccordion === 'device' ? 'rotate-180' : ''}`} />
          </button>
          {activeAccordion === 'device' && (
            <div className="p-4 border-t border-zinc-100 flex flex-wrap gap-2 animate-in fade-in duration-200">
              {(['Laptop', 'Desktop / Tower', 'All-in-One (AIO)', 'Workstation'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setDeviceType(t);
                    setActiveAccordion('brand');
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    deviceType === t
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* SECTION 2: BRAND & MODEL SERIES (CASCADING DRILL-DOWN) */}
        <div className="border border-zinc-200 rounded-2xl overflow-hidden transition-all bg-white shadow-2xs">
          <button
            type="button"
            onClick={() => setActiveAccordion(activeAccordion === 'brand' ? '' : 'brand')}
            className="w-full p-4 flex items-center justify-between bg-zinc-50/70 hover:bg-zinc-100/60 transition-colors cursor-pointer text-left"
          >
            <div className="flex items-center gap-2.5">
              <Monitor className="w-4 h-4 text-purple-600" />
              <span className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                2. Brand & Model Series
              </span>
              <span className="text-xs text-purple-600 font-semibold ml-2">
                • {selectedBrand} {selectedSeries}
              </span>
            </div>
            <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${activeAccordion === 'brand' ? 'rotate-180' : ''}`} />
          </button>
          {activeAccordion === 'brand' && (
            <div className="p-4 border-t border-zinc-100 space-y-4 animate-in fade-in duration-200">
              {/* Level 1: Brand Picker */}
              <div>
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-2">
                  Select Brand:
                </label>
                <div className="flex flex-wrap gap-2">
                  {LAPTOP_BRANDS.map((b) => (
                    <button
                      key={b.brand}
                      type="button"
                      onClick={() => handleBrandChange(b.brand)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        selectedBrand === b.brand
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800'
                      }`}
                    >
                      {b.brand}
                    </button>
                  ))}
                </div>
              </div>

              {/* Level 2: Sub-Series Drill-Down for Chosen Brand */}
              <div className="p-3.5 bg-purple-50/50 rounded-2xl border border-purple-100">
                <label className="text-[10px] font-black text-purple-800 uppercase tracking-widest block mb-2">
                  Select {selectedBrand} Series / Model Line:
                </label>
                <div className="flex flex-wrap gap-2">
                  {currentBrandSeries.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        setSelectedSeries(s);
                        setActiveAccordion('cpu');
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        selectedSeries === s
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'bg-white border border-purple-200 text-purple-900 hover:bg-purple-100'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 3: PROCESSOR (CPU) & GENERATION (CASCADING DRILL-DOWN) */}
        <div className="border border-zinc-200 rounded-2xl overflow-hidden transition-all bg-white shadow-2xs">
          <button
            type="button"
            onClick={() => setActiveAccordion(activeAccordion === 'cpu' ? '' : 'cpu')}
            className="w-full p-4 flex items-center justify-between bg-zinc-50/70 hover:bg-zinc-100/60 transition-colors cursor-pointer text-left"
          >
            <div className="flex items-center gap-2.5">
              <Cpu className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                3. Processor (CPU) & Generation
              </span>
              <span className="text-xs text-emerald-600 font-semibold ml-2">
                • {selectedCpuFamily} ({selectedCpuGen})
              </span>
            </div>
            <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${activeAccordion === 'cpu' ? 'rotate-180' : ''}`} />
          </button>
          {activeAccordion === 'cpu' && (
            <div className="p-4 border-t border-zinc-100 space-y-4 animate-in fade-in duration-200">
              {/* Level 1: CPU Family */}
              <div>
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-2">
                  Select Processor Family:
                </label>
                <div className="flex flex-wrap gap-2">
                  {PROCESSOR_CATALOG.map((c) => (
                    <button
                      key={c.family}
                      type="button"
                      onClick={() => handleCpuFamilyChange(c.family)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        selectedCpuFamily === c.family
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800'
                      }`}
                    >
                      {c.family}
                    </button>
                  ))}
                </div>
              </div>

              {/* Level 2: Generation Drill-Down */}
              <div className="p-3.5 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                <label className="text-[10px] font-black text-emerald-800 uppercase tracking-widest block mb-2">
                  Select {selectedCpuFamily} Generation / Release:
                </label>
                <div className="flex flex-wrap gap-2">
                  {currentCpuGenerations.map((gen) => (
                    <button
                      key={gen}
                      type="button"
                      onClick={() => {
                        setSelectedCpuGen(gen);
                        setActiveAccordion('ram');
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        selectedCpuGen === gen
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-white border border-emerald-200 text-emerald-900 hover:bg-emerald-100'
                      }`}
                    >
                      {gen}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 4: RAM (MEMORY TYPE & CAPACITY DRILL-DOWN) */}
        <div className="border border-zinc-200 rounded-2xl overflow-hidden transition-all bg-white shadow-2xs">
          <button
            type="button"
            onClick={() => setActiveAccordion(activeAccordion === 'ram' ? '' : 'ram')}
            className="w-full p-4 flex items-center justify-between bg-zinc-50/70 hover:bg-zinc-100/60 transition-colors cursor-pointer text-left"
          >
            <div className="flex items-center gap-2.5">
              <Layers className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                4. Installed RAM (Memory)
              </span>
              <span className="text-xs text-amber-600 font-semibold font-mono ml-2">
                • {selectedRamCapacity} ({selectedRamType.split(' ')[0]})
              </span>
            </div>
            <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${activeAccordion === 'ram' ? 'rotate-180' : ''}`} />
          </button>
          {activeAccordion === 'ram' && (
            <div className="p-4 border-t border-zinc-100 space-y-4 animate-in fade-in duration-200">
              {/* RAM Type */}
              <div>
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-2">
                  RAM Technology Type (DDR Generation):
                </label>
                <div className="flex flex-wrap gap-2">
                  {RAM_SPEC_OPTIONS.types.map((rt) => (
                    <button
                      key={rt}
                      type="button"
                      onClick={() => setSelectedRamType(rt)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        selectedRamType === rt
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800'
                      }`}
                    >
                      {rt}
                    </button>
                  ))}
                </div>
              </div>

              {/* RAM Capacity */}
              <div className="p-3.5 bg-amber-50/50 rounded-2xl border border-amber-100">
                <label className="text-[10px] font-black text-amber-800 uppercase tracking-widest block mb-2">
                  Installed RAM Capacity:
                </label>
                <div className="flex flex-wrap gap-2">
                  {RAM_SPEC_OPTIONS.capacities.map((cap) => (
                    <button
                      key={cap}
                      type="button"
                      onClick={() => {
                        setSelectedRamCapacity(cap);
                        setActiveAccordion('storage');
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
                        selectedRamCapacity === cap
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'bg-white border border-amber-200 text-amber-900 hover:bg-amber-100'
                      }`}
                    >
                      {cap}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 5: STORAGE (DRIVE TYPE & CAPACITY DRILL-DOWN) */}
        <div className="border border-zinc-200 rounded-2xl overflow-hidden transition-all bg-white shadow-2xs">
          <button
            type="button"
            onClick={() => setActiveAccordion(activeAccordion === 'storage' ? '' : 'storage')}
            className="w-full p-4 flex items-center justify-between bg-zinc-50/70 hover:bg-zinc-100/60 transition-colors cursor-pointer text-left"
          >
            <div className="flex items-center gap-2.5">
              <HardDrive className="w-4 h-4 text-cyan-600" />
              <span className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                5. Storage (Drive & Capacity)
              </span>
              <span className="text-xs text-cyan-600 font-semibold font-mono ml-2">
                • {selectedStorageCapacity} {selectedStorageType.includes('NVMe') ? 'NVMe SSD' : 'SSD'}
              </span>
            </div>
            <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${activeAccordion === 'storage' ? 'rotate-180' : ''}`} />
          </button>
          {activeAccordion === 'storage' && (
            <div className="p-4 border-t border-zinc-100 space-y-4 animate-in fade-in duration-200">
              {/* Drive Type */}
              <div>
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-2">
                  Storage Drive Architecture:
                </label>
                <div className="flex flex-wrap gap-2">
                  {STORAGE_SPEC_OPTIONS.driveTypes.map((dt) => (
                    <button
                      key={dt}
                      type="button"
                      onClick={() => setSelectedStorageType(dt)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        selectedStorageType === dt
                          ? 'bg-cyan-600 text-white shadow-xs'
                          : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800'
                      }`}
                    >
                      {dt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Storage Capacity */}
              <div className="p-3.5 bg-cyan-50/50 rounded-2xl border border-cyan-100">
                <label className="text-[10px] font-black text-cyan-800 uppercase tracking-widest block mb-2">
                  Storage Capacity:
                </label>
                <div className="flex flex-wrap gap-2">
                  {STORAGE_SPEC_OPTIONS.capacities.map((cap) => (
                    <button
                      key={cap}
                      type="button"
                      onClick={() => {
                        setSelectedStorageCapacity(cap);
                        setActiveAccordion('os');
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
                        selectedStorageCapacity === cap
                          ? 'bg-cyan-600 text-white shadow-xs'
                          : 'bg-white border border-cyan-200 text-cyan-900 hover:bg-cyan-100'
                      }`}
                    >
                      {cap}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 6: OPERATING SYSTEM (WINDOWS / MACOS / LINUX DRILL-DOWN) */}
        <div className="border border-zinc-200 rounded-2xl overflow-hidden transition-all bg-white shadow-2xs">
          <button
            type="button"
            onClick={() => setActiveAccordion(activeAccordion === 'os' ? '' : 'os')}
            className="w-full p-4 flex items-center justify-between bg-zinc-50/70 hover:bg-zinc-100/60 transition-colors cursor-pointer text-left"
          >
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                6. Operating System (Windows / macOS / Linux)
              </span>
              <span className="text-xs text-indigo-600 font-semibold ml-2">
                • {selectedOsEdition}
              </span>
            </div>
            <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${activeAccordion === 'os' ? 'rotate-180' : ''}`} />
          </button>
          {activeAccordion === 'os' && (
            <div className="p-4 border-t border-zinc-100 space-y-4 animate-in fade-in duration-200">
              {/* OS Family */}
              <div>
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-2">
                  Operating System Ecosystem:
                </label>
                <div className="flex flex-wrap gap-2">
                  {OS_CATALOG.map((o) => (
                    <button
                      key={o.family}
                      type="button"
                      onClick={() => handleOsFamilyChange(o.family)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        selectedOsFamily === o.family
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800'
                      }`}
                    >
                      {o.family}
                    </button>
                  ))}
                </div>
              </div>

              {/* OS Edition Drill-Down */}
              <div className="p-3.5 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                <label className="text-[10px] font-black text-indigo-800 uppercase tracking-widest block mb-2">
                  Select {selectedOsFamily} Edition / Version:
                </label>
                <div className="flex flex-wrap gap-2">
                  {currentOsEditions.map((ed) => (
                    <button
                      key={ed}
                      type="button"
                      onClick={() => {
                        setSelectedOsEdition(ed);
                        setActiveAccordion('display');
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        selectedOsEdition === ed
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-white border border-indigo-200 text-indigo-900 hover:bg-indigo-100'
                      }`}
                    >
                      {ed}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 7: DISPLAY & WORKLOAD PURPOSE */}
        <div className="border border-zinc-200 rounded-2xl overflow-hidden transition-all bg-white shadow-2xs">
          <button
            type="button"
            onClick={() => setActiveAccordion(activeAccordion === 'display' ? '' : 'display')}
            className="w-full p-4 flex items-center justify-between bg-zinc-50/70 hover:bg-zinc-100/60 transition-colors cursor-pointer text-left"
          >
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-rose-600" />
              <span className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                7. Display & Recommended Workload
              </span>
              <span className="text-xs text-rose-600 font-semibold ml-2">
                • {selectedDisplay.split(' ')[0]}
              </span>
            </div>
            <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${activeAccordion === 'display' ? 'rotate-180' : ''}`} />
          </button>
          {activeAccordion === 'display' && (
            <div className="p-4 border-t border-zinc-100 space-y-4 animate-in fade-in duration-200">
              {/* Display Size */}
              <div>
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-2">
                  Screen Display & Resolution:
                </label>
                <div className="flex flex-wrap gap-2">
                  {DISPLAY_OPTIONS.map((disp) => (
                    <button
                      key={disp}
                      type="button"
                      onClick={() => setSelectedDisplay(disp)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        selectedDisplay === disp
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800'
                      }`}
                    >
                      {disp}
                    </button>
                  ))}
                </div>
              </div>

              {/* Workload Purpose */}
              <div className="p-3.5 bg-rose-50/50 rounded-2xl border border-rose-100">
                <label className="text-[10px] font-black text-rose-800 uppercase tracking-widest block mb-2">
                  Intended Workload / Target Customer:
                </label>
                <div className="flex flex-wrap gap-2">
                  {WORKLOAD_OPTIONS.map((w) => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => setSelectedWorkload(w)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        selectedWorkload === w
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'bg-white border border-rose-200 text-rose-900 hover:bg-rose-100'
                      }`}
                    >
                      {w}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Footer Bar with Apply Buttons */}
      <div className="p-4 sm:p-5 bg-zinc-50 border-t border-zinc-200 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-xs text-zinc-500 font-medium">
          Ready to save specifications to this piece.
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => handleConfirmAndApply(false)}
            className="flex-1 sm:flex-initial px-4 py-2.5 bg-zinc-200 hover:bg-zinc-300 text-zinc-800 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            Apply Specs Only
          </button>
          <button
            type="button"
            onClick={() => handleConfirmAndApply(true)}
            className="flex-1 sm:flex-initial px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-xs font-black shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>Apply Specs & Auto-Fill Title</span>
          </button>
        </div>
      </div>
    </div>
  );
};
