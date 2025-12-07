import React, { useState, useEffect } from 'react';
import { VitalSigns, Coordinates, EmergencyStatus, MedicalHistory, EmergencyContact } from './types';
import { VitalsMonitor } from './components/VitalsMonitor';
import { EmergencyDashboard } from './components/EmergencyDashboard';
import { EmergencyContactForm } from './components/EmergencyContactForm';

// Dummy Medical History
const MOCK_HISTORY: MedicalHistory = {
  name: "John Doe",
  age: 58,
  conditions: ["Hypertension", "Type 2 Diabetes"],
  allergies: ["Penicillin", "Latex"],
  medications: ["Metformin", "Lisinopril"]
};

const DEFAULT_CONTACT: EmergencyContact = {
    name: "",
    relationship: "",
    phone: ""
};

const App: React.FC = () => {
  const [vitals, setVitals] = useState<VitalSigns>({
    heartRate: 72,
    systolicBP: 120,
    diastolicBP: 80,
    isResponsive: true
  });

  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [manualLocation, setManualLocation] = useState<string>("");
  const [isManualLocInputOpen, setIsManualLocInputOpen] = useState(false);

  const [emergencyContact, setEmergencyContact] = useState<EmergencyContact>(() => {
      if (typeof window === 'undefined') return DEFAULT_CONTACT;
      const saved = localStorage.getItem('emergencyContact');
      return saved ? JSON.parse(saved) : DEFAULT_CONTACT;
  });

  const [emergencyStatus, setEmergencyStatus] = useState<EmergencyStatus>({
    isCritical: false,
    statusMessage: '',
    trigger: null
  });

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const saveEmergencyContact = (contact: EmergencyContact) => {
      setEmergencyContact(contact);
      localStorage.setItem('emergencyContact', JSON.stringify(contact));
  };

  // 1. Geolocation Setup
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.watchPosition(
        (position) => {
          setCoords({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          setHasPermission(true);
        },
        (error) => {
          console.error("Geo Error", error);
          setHasPermission(false);
          // If permission denied or unavailable, suggest manual input
          if (!manualLocation) setIsManualLocInputOpen(true);
        },
        { enableHighAccuracy: true }
      );
    } else {
      setHasPermission(false);
      setIsManualLocInputOpen(true);
    }
  }, []);

  // 2. Monitoring Logic
  useEffect(() => {
    // Thresholds
    const CRITICAL_HR_LOW = 40;
    const CRITICAL_HR_HIGH = 160;
    const CRITICAL_SYS_HIGH = 180;
    const CRITICAL_SYS_LOW = 90;
    const CRITICAL_DIA_HIGH = 110;
    const CRITICAL_DIA_LOW = 60;

    let critical = false;
    let message = "";
    let trigger = null;

    if (!vitals.isResponsive) {
      critical = true;
      message = "PATIENT UNRESPONSIVE";
      trigger = "unresponsive";
    } else if (vitals.heartRate < CRITICAL_HR_LOW || vitals.heartRate > CRITICAL_HR_HIGH) {
      critical = true;
      message = `CRITICAL HEART RATE: ${vitals.heartRate} BPM`;
      trigger = "hr";
    } else if (vitals.systolicBP > CRITICAL_SYS_HIGH || vitals.systolicBP < CRITICAL_SYS_LOW) {
      critical = true;
      message = `CRITICAL BLOOD PRESSURE: ${vitals.systolicBP}/${vitals.diastolicBP}`;
      trigger = "bp";
    } else if (vitals.diastolicBP > CRITICAL_DIA_HIGH || vitals.diastolicBP < CRITICAL_DIA_LOW) {
      critical = true;
      message = `CRITICAL BLOOD PRESSURE: ${vitals.systolicBP}/${vitals.diastolicBP}`;
      trigger = "bp";
    }

    if (critical && !emergencyStatus.isCritical) {
      // Trigger Alarm
      setEmergencyStatus({ isCritical: true, statusMessage: message, trigger });
    }
  }, [vitals, emergencyStatus.isCritical]);

  const resetEmergency = () => {
    setEmergencyStatus({ isCritical: false, statusMessage: '', trigger: null });
    setVitals({
        heartRate: 75,
        systolicBP: 120,
        diastolicBP: 80,
        isResponsive: true
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Header Section */}
        <header className="flex flex-col gap-4 border-b border-slate-800 pb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-blue-400 tracking-tight">VitalGuard Response</h1>
              <p className="text-slate-500 mt-1">Automated Critical Care Locator Prototype</p>
            </div>
            
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-3 bg-slate-900 p-3 rounded-lg border border-slate-800">
                <div className={`w-3 h-3 rounded-full ${hasPermission ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-xs font-mono text-slate-400">
                  {hasPermission ? "GPS SIGNAL ACTIVE" : "GPS SIGNAL LOST"}
                </span>
              </div>
              {!hasPermission && (
                  <button 
                    onClick={() => setIsManualLocInputOpen(!isManualLocInputOpen)}
                    className="text-xs text-blue-400 hover:text-blue-300 underline"
                  >
                    {isManualLocInputOpen ? "Hide Manual Location" : "Set Manual Location"}
                  </button>
              )}
            </div>
          </div>

          {/* Manual Location Input - Shown if GPS failed or user toggled it */}
          {(!hasPermission || isManualLocInputOpen) && (
              <div className="bg-slate-900/50 border border-yellow-900/30 p-4 rounded-lg flex flex-col md:flex-row gap-3 items-center">
                  <span className="text-sm text-yellow-500 font-medium whitespace-nowrap">
                      ⚠️ GPS Unavailable. Enter location:
                  </span>
                  <input 
                    type="text" 
                    placeholder="e.g. 123 Main St, Springfield or Central Park, NY" 
                    className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:border-yellow-500 outline-none"
                    value={manualLocation}
                    onChange={(e) => setManualLocation(e.target.value)}
                  />
              </div>
          )}
        </header>

        {/* Info Card */}
        <section className="bg-blue-900/20 border border-blue-900/50 p-4 rounded-lg text-sm text-blue-200">
          <p className="font-semibold mb-2">Feasibility & Concept Analysis:</p>
          <ul className="list-disc pl-5 space-y-1 opacity-80">
            <li><strong>Current Constraint:</strong> Web browsers cannot directly access biological metrics (BP/Pulse) without specific Bluetooth medical devices.</li>
            <li><strong>This Prototype:</strong> Uses manual sliders to <em>simulate</em> the data input from a wearable device.</li>
            <li><strong>Real Implementation:</strong> Would require a WatchOS/WearOS app or Bluetooth Low Energy (BLE) integration with a specific monitor.</li>
          </ul>
        </section>

        {/* Medical ID Card & Emergency Contact */}
        <section className="space-y-4">
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                <h2 className="text-sm uppercase tracking-wider text-slate-500 font-bold mb-4">Patient Profile</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                    <span className="block text-xs text-slate-500">Name</span>
                    <span className="font-medium text-slate-200">{MOCK_HISTORY.name}</span>
                    </div>
                    <div>
                    <span className="block text-xs text-slate-500">Age</span>
                    <span className="font-medium text-slate-200">{MOCK_HISTORY.age}</span>
                    </div>
                    <div className="col-span-2">
                    <span className="block text-xs text-slate-500">Known Conditions</span>
                    <span className="font-medium text-slate-200">{MOCK_HISTORY.conditions.join(", ")}</span>
                    </div>
                </div>
            </div>
            
            {/* Emergency Contact Component */}
            <EmergencyContactForm 
                contact={emergencyContact}
                onSave={saveEmergencyContact}
            />
        </section>

        {/* Vitals Controls (Simulation) */}
        <VitalsMonitor 
          vitals={vitals} 
          setVitals={setVitals} 
          isMonitoring={true} 
        />

        {/* Emergency Overlay */}
        <EmergencyDashboard 
          status={emergencyStatus} 
          coords={coords} 
          manualLocation={manualLocation}
          vitals={vitals}
          history={MOCK_HISTORY}
          emergencyContact={emergencyContact}
          onReset={resetEmergency}
        />

      </div>
    </div>
  );
};

export default App;
