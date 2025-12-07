import React, { useEffect, useState } from 'react';
import { EmergencyStatus, Coordinates, MedicalHistory, VitalSigns, EmergencyContact } from '../types';
import { findNearestHospital, generateHandoverReport } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

interface EmergencyDashboardProps {
  status: EmergencyStatus;
  coords: Coordinates | null;
  manualLocation: string;
  vitals: VitalSigns;
  history: MedicalHistory;
  emergencyContact: EmergencyContact;
  onReset: () => void;
}

export const EmergencyDashboard: React.FC<EmergencyDashboardProps> = ({ 
  status, 
  coords, 
  manualLocation,
  vitals, 
  history, 
  emergencyContact,
  onReset 
}) => {
  const [hospitalInfo, setHospitalInfo] = useState<string>('');
  const [medicalReport, setMedicalReport] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [groundingUrls, setGroundingUrls] = useState<any[]>([]);

  useEffect(() => {
    const fetchEmergencyData = async () => {
      // Logic: Use coords if available, otherwise use manualLocation. If neither, fail.
      const locationToUse = coords ? coords : manualLocation;
      
      if (!locationToUse) {
          setHospitalInfo("No location data available. Please provide manual location or enable GPS.");
          return;
      }

      setLoading(true);
      
      try {
        // 1. Find Hospital via Gemini + Google Maps
        const { text: hospitalText, chunks } = await findNearestHospital(locationToUse);
        setHospitalInfo(hospitalText);
        setGroundingUrls(chunks);

        // 2. Generate Medical Handover Report
        const locationStringForReport = coords 
            ? `Lat: ${coords.latitude}, Lng: ${coords.longitude}`
            : manualLocation;

        const report = await generateHandoverReport(
            vitals, 
            history, 
            locationStringForReport, 
            emergencyContact
        );
        setMedicalReport(report);
      } catch (err) {
        setHospitalInfo("Failed to retrieve emergency data. Please call emergency services manually.");
      } finally {
        setLoading(false);
      }
    };

    if (status.isCritical) {
      fetchEmergencyData();
    }
  }, [status.isCritical, coords, manualLocation]); 

  if (!status.isCritical) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border-2 border-red-600 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden pulse-animation flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-red-600 p-6 text-white flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-wider flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Emergency Protocol Active
            </h1>
            <p className="mt-2 font-mono text-red-100">{status.statusMessage}</p>
          </div>
          <button 
            onClick={onReset}
            className="bg-white text-red-600 px-4 py-2 rounded-lg font-bold hover:bg-red-50 text-sm"
          >
            DEACTIVATE ALARM
          </button>
        </div>

        {/* Content Grid */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto">
          
          {/* Left: Location & Hospital */}
          <div className="space-y-6">
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
              <h3 className="text-lg font-semibold text-slate-300 mb-3 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Current Location Source
              </h3>
              {coords ? (
                <div className="font-mono text-green-400 text-lg">
                  <span className="text-xs text-slate-500 block mb-1">GPS SATELLITE FIX</span>
                  LAT: {coords.latitude.toFixed(6)}<br/>
                  LNG: {coords.longitude.toFixed(6)}
                </div>
              ) : manualLocation ? (
                 <div className="font-mono text-yellow-400 text-lg">
                    <span className="text-xs text-slate-500 block mb-1">MANUAL USER INPUT</span>
                    "{manualLocation}"
                 </div>
              ) : (
                <div className="text-red-500 animate-pulse font-bold">NO LOCATION DATA AVAILABLE</div>
              )}
            </div>

            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
              <h3 className="text-lg font-semibold text-slate-300 mb-3 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Nearest A&E Hospital
              </h3>
              {loading ? (
                <div className="flex items-center gap-3 text-slate-400">
                  <span className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"></span>
                  Contacting Emergency AI Services...
                </div>
              ) : (
                <div className="prose prose-invert prose-sm">
                  <ReactMarkdown>{hospitalInfo}</ReactMarkdown>
                  {groundingUrls.length > 0 && (
                     <div className="mt-4 pt-4 border-t border-slate-700">
                        <p className="text-xs text-slate-500 mb-2">Sources:</p>
                        <div className="flex flex-wrap gap-2">
                        {groundingUrls.map((chunk, idx) => {
                            const uri = chunk.web?.uri || chunk.maps?.uri;
                            const title = chunk.web?.title || chunk.maps?.title || "Map Link";
                            if (uri) {
                                return (
                                    <a key={idx} href={uri} target="_blank" rel="noopener noreferrer" className="text-xs bg-slate-700 hover:bg-slate-600 text-blue-300 px-2 py-1 rounded">
                                        {title}
                                    </a>
                                )
                            }
                            return null;
                        })}
                        </div>
                     </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right: Medical Report */}
          <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex flex-col h-full">
            <h3 className="text-lg font-semibold text-slate-300 mb-3 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Auto-Generated EMS Handoff
            </h3>
            <div className="bg-slate-900 p-4 rounded-lg flex-grow font-mono text-sm text-slate-300 whitespace-pre-wrap overflow-y-auto border border-slate-700">
                {loading ? "Generating report..." : medicalReport}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
