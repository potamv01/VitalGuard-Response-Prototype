import React from 'react';
import { VitalSigns } from '../types';

interface VitalsMonitorProps {
  vitals: VitalSigns;
  setVitals: React.Dispatch<React.SetStateAction<VitalSigns>>;
  isMonitoring: boolean;
}

export const VitalsMonitor: React.FC<VitalsMonitorProps> = ({ vitals, setVitals, isMonitoring }) => {
  
  const handleChange = (key: keyof VitalSigns, value: number | boolean) => {
    setVitals(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-slate-100 flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></span>
          Live Vitals Simulation
        </h2>
        <span className={`text-xs font-mono py-1 px-2 rounded ${isMonitoring ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
          {isMonitoring ? 'SENSOR ACTIVE' : 'SENSOR PAUSED'}
        </span>
      </div>

      <div className="space-y-8">
        {/* Heart Rate */}
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-slate-400 text-sm font-medium">Heart Rate (BPM)</label>
            <span className={`text-2xl font-bold font-mono ${vitals.heartRate < 40 || vitals.heartRate > 120 ? 'text-red-500' : 'text-emerald-400'}`}>
              {vitals.heartRate}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="220"
            value={vitals.heartRate}
            onChange={(e) => handleChange('heartRate', parseInt(e.target.value))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>0</span>
            <span>Normal: 60-100</span>
            <span>220</span>
          </div>
        </div>

        {/* Blood Pressure */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-slate-400 text-sm font-medium">Systolic (Top)</label>
              <span className={`text-xl font-bold font-mono ${vitals.systolicBP > 160 || vitals.systolicBP < 90 ? 'text-red-500' : 'text-emerald-400'}`}>
                {vitals.systolicBP}
              </span>
            </div>
            <input
              type="range"
              min="50"
              max="250"
              value={vitals.systolicBP}
              onChange={(e) => handleChange('systolicBP', parseInt(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-slate-400 text-sm font-medium">Diastolic (Bottom)</label>
              <span className={`text-xl font-bold font-mono ${vitals.diastolicBP > 100 || vitals.diastolicBP < 50 ? 'text-red-500' : 'text-emerald-400'}`}>
                {vitals.diastolicBP}
              </span>
            </div>
            <input
              type="range"
              min="30"
              max="150"
              value={vitals.diastolicBP}
              onChange={(e) => handleChange('diastolicBP', parseInt(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>
        </div>

        {/* Responsiveness */}
        <div className="bg-slate-900/50 p-4 rounded-lg flex items-center justify-between">
            <span className="text-slate-300">Patient Responsiveness</span>
            <button
                onClick={() => handleChange('isResponsive', !vitals.isResponsive)}
                className={`px-4 py-2 rounded-lg font-bold transition-colors ${
                    vitals.isResponsive 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-red-600 hover:bg-red-700 text-white animate-pulse'
                }`}
            >
                {vitals.isResponsive ? 'Alert & Oriented' : 'UNRESPONSIVE'}
            </button>
        </div>
      </div>
    </div>
  );
};
