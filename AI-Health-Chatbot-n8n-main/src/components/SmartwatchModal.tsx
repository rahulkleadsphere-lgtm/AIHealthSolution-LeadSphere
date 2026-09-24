import React, { useState, useEffect, useRef } from "react";
import {
  Watch,
  Bluetooth,
  Heart,
  Activity,
  Wifi,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  X,
  ShieldCheck,
  Zap,
  Database,
  Layers,
  Info,
  Sliders,
  Plus,
  ArrowRight,
  TrendingUp,
  FileText,
  Clock
} from "lucide-react";
import { wearableTelemetryService, LiveVitalsPayload } from "../services/api";
import { toast } from "sonner";

interface SmartwatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  onVitalsUpdated?: (vitals: LiveVitalsPayload) => void;
}

export const SmartwatchModal: React.FC<SmartwatchModalProps> = ({
  isOpen,
  onClose,
  userId = "rahul_mumbai_demo",
  onVitalsUpdated
}) => {
  const [activeTab, setActiveTab] = useState<"bluetooth" | "batch_sync" | "streamer" | "missing_sensors">("bluetooth");
  const [liveData, setLiveData] = useState<LiveVitalsPayload | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Web Bluetooth state
  const [bleDeviceName, setBleDeviceName] = useState<string | null>(null);
  const [isBleConnected, setIsBleConnected] = useState(false);
  const [bleHeartRate, setBleHeartRate] = useState<number | null>(null);
  const bleDeviceRef = useRef<any>(null);

  // Live Streamer Simulator state
  const [streamBpm, setStreamBpm] = useState<number>(76);
  const [streamSpo2, setStreamSpo2] = useState<number>(98);
  const [isStreaming, setIsStreaming] = useState(false);
  const streamIntervalRef = useRef<any>(null);

  // Missing Sensor Quick Log state
  const [manualBpSys, setManualBpSys] = useState("120");
  const [manualBpDia, setManualBpDia] = useState("80");
  const [manualGlucose, setManualGlucose] = useState("95");
  const [manualNotes, setManualNotes] = useState("Omron M2 Upper-Arm Digital Cuff");
  const [isSavingManual, setIsSavingManual] = useState(false);

  // Fetch initial telemetry
  const fetchTelemetry = async () => {
    try {
      const data = await wearableTelemetryService.getLiveTelemetry(userId);
      setLiveData(data);
      if (onVitalsUpdated) onVitalsUpdated(data);
    } catch (e) {
      console.error("Telemetry fetch error:", e);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchTelemetry();
    }
  }, [isOpen, userId]);

  // Clean up streaming on unmount
  useEffect(() => {
    return () => {
      if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);
      if (bleDeviceRef.current && bleDeviceRef.current.gatt?.connected) {
        bleDeviceRef.current.gatt.disconnect();
      }
    };
  }, []);

  // =========================================================================
  // TAB 1: WEB BLUETOOTH (BLE) HARDWARE PAIRING
  // =========================================================================
  const handleConnectBluetooth = async () => {
    setIsLoading(true);
    try {
      if (!(navigator as any).bluetooth) {
        toast.info("Web Bluetooth is not supported in this browser environment. Using high-fidelity NoiseFit emulator.");
        simulateNoiseFitConnect();
        return;
      }

      toast.loading("Scanning for nearby Bluetooth Smartwatches & Heart Rate Monitors...", { id: "ble-scan" });

      const device = await (navigator as any).bluetooth.requestDevice({
        filters: [{ services: ["heart_rate"] }],
        optionalServices: ["battery_service"]
      });

      bleDeviceRef.current = device;
      setBleDeviceName(device.name || "Bluetooth Smartwatch");

      const server = await device.gatt.connect();
      const service = await server.getPrimaryService("heart_rate");
      const characteristic = await service.getCharacteristic("heart_rate_measurement");

      await characteristic.startNotifications();
      characteristic.addEventListener("characteristicvaluechanged", (event: any) => {
        const value = event.target.value;
        const flags = value.getUint8(0);
        let hr = 0;
        if ((flags & 0x01) === 0) {
          hr = value.getUint8(1); // 8-bit BPM
        } else {
          hr = value.getUint16(1, /*littleEndian=*/true); // 16-bit BPM
        }

        setBleHeartRate(hr);
        wearableTelemetryService.streamLiveVital({
          user_id: userId,
          device_name: device.name || "Bluetooth Smartwatch",
          heart_rate: hr,
          source_type: "web_ble_live"
        }).then(res => {
          setLiveData(res);
          if (onVitalsUpdated) onVitalsUpdated(res);
        }).catch(err => console.error("BLE Stream write error:", err));
      });

      setIsBleConnected(true);
      toast.success(`Paired with ${device.name || 'Smartwatch'} via Web Bluetooth!`, { id: "ble-scan" });
    } catch (err: any) {
      console.warn("Bluetooth connection failed or cancelled:", err);
      toast.dismiss("ble-scan");
      if (err.name !== "NotFoundError") {
        toast.info("Hardware pairing fallback: Simulated Noise ColorFit Pro 5 active.");
      }
      simulateNoiseFitConnect();
    } finally {
      setIsLoading(false);
    }
  };

  const simulateNoiseFitConnect = async () => {
    setBleDeviceName("Noise ColorFit Pro 5 (Simulated BLE)");
    setIsBleConnected(true);
    setBleHeartRate(75);
    
    const res = await wearableTelemetryService.streamLiveVital({
      user_id: userId,
      device_name: "Noise ColorFit Pro 5",
      heart_rate: 75,
      spo2: 98,
      source_type: "web_ble_live"
    });
    setLiveData(res);
    if (onVitalsUpdated) onVitalsUpdated(res);
    toast.success("Connected to Noise ColorFit Pro 5 BLE Stream!");
  };

  const handleDisconnectBle = () => {
    if (bleDeviceRef.current && bleDeviceRef.current.gatt?.connected) {
      bleDeviceRef.current.gatt.disconnect();
    }
    setIsBleConnected(false);
    setBleDeviceName(null);
    setBleHeartRate(null);
    toast.info("Smartwatch disconnected.");
  };

  // =========================================================================
  // TAB 2: NOISEFIT 10-MINUTE INTERVAL BATCH SYNC
  // =========================================================================
  const handleBatchSync = async () => {
    setIsLoading(true);
    try {
      const now = new Date();
      // Generate realistic 10-minute intervals from Noise watch background sync
      const batchData = [
        {
          timestamp: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
          heart_rate: 72,
          steps: 420
        },
        {
          timestamp: new Date(now.getTime() - 20 * 60 * 1000).toISOString(),
          heart_rate: 76,
          steps: 780
        },
        {
          timestamp: new Date(now.getTime() - 10 * 60 * 1000).toISOString(),
          heart_rate: 74,
          spo2: 98,
          steps: 1240
        },
        {
          timestamp: now.toISOString(),
          heart_rate: 73,
          spo2: 98,
          steps: 1610
        }
      ];

      const res = await wearableTelemetryService.syncWearableBatch(
        userId,
        "Noise ColorFit Pro 5 (NoiseFit App)",
        batchData
      );

      toast.success(res.message || "Synced 4 data points from Noise watch (10-min interval)");
      await fetchTelemetry();
    } catch (e: any) {
      toast.error("Failed to sync NoiseFit batch: " + e.message);
    } finally {
      setIsLoading(false);
    }
  };

  // =========================================================================
  // TAB 3: REAL-TIME TELEMETRY STREAMER & STRESS TEST
  // =========================================================================
  const toggleStreaming = () => {
    if (isStreaming) {
      if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);
      setIsStreaming(false);
      toast.info("Live pulse streaming paused.");
    } else {
      setIsStreaming(true);
      toast.success("Streaming 1 Hz live pulse telemetry to Redis cache...");
      streamIntervalRef.current = setInterval(async () => {
        // Natural pulse jitter (+/- 2 BPM)
        const jitter = Math.floor(Math.random() * 5) - 2;
        const currentHr = Math.max(45, Math.min(180, streamBpm + jitter));
        
        try {
          const res = await wearableTelemetryService.streamLiveVital({
            user_id: userId,
            device_name: "Noise ColorFit Pro 5",
            heart_rate: currentHr,
            spo2: streamSpo2,
            source_type: "live_stream_1hz"
          });
          setLiveData(res);
          if (onVitalsUpdated) onVitalsUpdated(res);
        } catch (e) {
          console.error("Stream tick error:", e);
        }
      }, 1200);
    }
  };

  // =========================================================================
  // TAB 4: MANUAL SENSOR RESOLUTION (EDGE CASE FIX)
  // =========================================================================
  const handleSaveManualVital = async (vitalName: "blood_pressure" | "blood_glucose") => {
    setIsSavingManual(true);
    try {
      const val = vitalName === "blood_pressure" 
        ? `${manualBpSys}/${manualBpDia}`
        : `${manualGlucose} mg/dL`;
      
      const res = await wearableTelemetryService.logManualVital(
        userId,
        vitalName,
        val,
        vitalName === "blood_pressure" ? manualNotes : "Accu-Chek Instant Blood Glucose Strip"
      );

      toast.success(res.message || `Recorded ${vitalName}`);
      await fetchTelemetry();
    } catch (e: any) {
      toast.error("Failed to record manual vital: " + e.message);
    } finally {
      setIsSavingManual(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="relative px-6 py-5 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-white/20 backdrop-blur-md rounded-2xl shadow-inner">
              <Watch className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-xl font-bold tracking-tight">Smartwatch & Wearable Telemetry</h3>
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-xs font-semibold uppercase tracking-wider">
                  Redis Powered
                </span>
              </div>
              <p className="text-xs text-emerald-100 mt-0.5">
                Sub-millisecond IoT vitals stream with multi-modal sensor fusion
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Status Bar */}
        <div className="bg-slate-50 dark:bg-slate-800/60 px-6 py-2.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${isStreaming || isBleConnected ? 'bg-emerald-500 animate-ping' : 'bg-amber-400'}`}></span>
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {isBleConnected ? bleDeviceName : (isStreaming ? "Streaming 1 Hz Live Pulse" : "Noise ColorFit Paired (10-min Sync)")}
              </span>
            </div>
            <div className="hidden sm:flex items-center space-x-1 text-slate-500 dark:text-slate-400">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Latency: <strong className="text-slate-800 dark:text-slate-200">{liveData?.latency_ms || 0.4} ms</strong></span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-mono text-[11px] font-semibold">
              {liveData?.cache_tier || "IN_MEMORY_BUFFER"}
            </span>
            <div className="flex items-center space-x-1 text-rose-500 font-bold">
              <Heart className="w-3.5 h-3.5 fill-rose-500 animate-pulse" />
              <span>{liveData?.vitals?.heart_rate || 74} BPM</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 bg-white dark:bg-slate-900">
          <button
            onClick={() => setActiveTab("bluetooth")}
            className={`flex items-center space-x-2 py-3 px-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "bluetooth"
                ? "border-emerald-600 text-emerald-600 dark:text-emerald-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <Bluetooth className="w-4 h-4" />
            <span>Web BLE Pairing</span>
          </button>

          <button
            onClick={() => setActiveTab("batch_sync")}
            className={`flex items-center space-x-2 py-3 px-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "batch_sync"
                ? "border-emerald-600 text-emerald-600 dark:text-emerald-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Noise 10-Min Sync</span>
          </button>

          <button
            onClick={() => setActiveTab("streamer")}
            className={`flex items-center space-x-2 py-3 px-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "streamer"
                ? "border-emerald-600 text-emerald-600 dark:text-emerald-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Telemetry Streamer</span>
          </button>

          <button
            onClick={() => setActiveTab("missing_sensors")}
            className={`flex items-center space-x-2 py-3 px-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "missing_sensors"
                ? "border-amber-600 text-amber-600 dark:text-amber-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Missing Sensor Matrix</span>
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">

          {/* TAB 1: WEB BLUETOOTH */}
          {activeTab === "bluetooth" && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                <div className="flex items-start space-x-3">
                  <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                    <Bluetooth className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      Standard GATT Heart Rate Service (0x180D)
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      Connect any Bluetooth Smartwatch (Noise, boAt, Apple Watch, Garmin, Polar) directly via the Web Bluetooth API. Heart rate pulses stream at 1 Hz directly into our sub-millisecond Redis buffer.
                    </p>
                  </div>
                </div>
              </div>

              {isBleConnected ? (
                <div className="p-5 rounded-2xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/30 flex flex-col items-center text-center space-y-3">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 animate-pulse">
                    <Heart className="w-8 h-8 fill-emerald-500 text-emerald-500" />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 dark:text-slate-100 text-base">{bleDeviceName}</h5>
                    <p className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">GATT Notifications Active (Characteristic 0x2A37)</p>
                  </div>
                  <div className="flex items-center space-x-2 text-2xl font-black text-slate-900 dark:text-white font-mono">
                    <span>{bleHeartRate || liveData?.vitals?.heart_rate || 74}</span>
                    <span className="text-sm font-normal text-slate-500">BPM</span>
                  </div>
                  <button
                    onClick={handleDisconnectBle}
                    className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition"
                  >
                    Disconnect Device
                  </button>
                </div>
              ) : (
                <div className="text-center py-6 space-y-4">
                  <div className="inline-flex p-4 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">
                    <Bluetooth className="w-10 h-10" />
                  </div>
                  <div>
                    <h5 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                      Pair Physical Smartwatch
                    </h5>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                      Ensure your Noise watch has Bluetooth turned on and is within range.
                    </p>
                  </div>
                  <div className="flex justify-center space-x-3">
                    <button
                      onClick={handleConnectBluetooth}
                      disabled={isLoading}
                      className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md transition disabled:opacity-50"
                    >
                      <Bluetooth className="w-4 h-4" />
                      <span>{isLoading ? "Searching BLE..." : "Scan & Pair Bluetooth Watch"}</span>
                    </button>
                    <button
                      onClick={simulateNoiseFitConnect}
                      className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium transition"
                    >
                      Demo Pair (Noise ColorFit 5)
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: NOISEFIT 10-MIN INTERVAL SYNC */}
          {activeTab === "batch_sync" && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                <div className="flex items-start space-x-3">
                  <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      NoiseFit Cloud & Companion App Sync (10-Minute Polling)
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      To preserve watch battery life, consumer smartwatches like Noise capture PPG heart rate every 5–10 minutes in the background rather than running a constant 24/7 battery-draining continuous stream. Our backend ingests these multi-point time series directly into Redis.
                    </p>
                  </div>
                </div>
              </div>

              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3">
                <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Sample 10-Minute Batch Interval
                </h5>
                <div className="space-y-2 font-mono text-xs">
                  <div className="flex justify-between items-center p-2 rounded-lg bg-slate-100 dark:bg-slate-800/80">
                    <span className="text-slate-500">T - 30 min</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">72 BPM (Resting)</span>
                    <span className="text-emerald-600 dark:text-emerald-400">420 Steps</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-lg bg-slate-100 dark:bg-slate-800/80">
                    <span className="text-slate-500">T - 20 min</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">76 BPM (Walking)</span>
                    <span className="text-emerald-600 dark:text-emerald-400">780 Steps</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-lg bg-slate-100 dark:bg-slate-800/80">
                    <span className="text-slate-500">T - 10 min</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">74 BPM | SpO2: 98%</span>
                    <span className="text-emerald-600 dark:text-emerald-400">1,240 Steps</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200">
                    <span className="font-bold">Latest (Now)</span>
                    <span className="font-bold">73 BPM | SpO2: 98%</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">1,610 Steps</span>
                  </div>
                </div>

                <button
                  onClick={handleBatchSync}
                  disabled={isLoading}
                  className="w-full mt-2 inline-flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white font-semibold text-sm transition shadow-sm"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>{isLoading ? "Ingesting Batch to Redis..." : "Sync 10-Min Wearable Batch Now"}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: TELEMETRY STREAMER & STRESS TEST */}
          {activeTab === "streamer" && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                <div className="flex items-start space-x-3">
                  <div className="p-2 rounded-xl bg-teal-100 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      Live 1 Hz Pulse Streamer & Threshold Testing
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      Test real-time sub-millisecond updates and the clinical safety guardrail. Drag the slider above 120 BPM to test acute Tachycardia alerts, or below 93% SpO2 to trigger Hypoxia alerts.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {/* Heart Rate Slider */}
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <label className="font-semibold text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
                      <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                      <span>Simulated Heart Rate</span>
                    </label>
                    <span className={`font-mono font-bold text-base ${streamBpm > 120 ? 'text-rose-600' : 'text-slate-900 dark:text-white'}`}>
                      {streamBpm} BPM {streamBpm > 120 ? '(Tachycardia Trigger)' : ''}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="150"
                    value={streamBpm}
                    onChange={(e) => setStreamBpm(Number(e.target.value))}
                    className="w-full accent-rose-600"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                    <span>50 BPM (Resting)</span>
                    <span>100 BPM (Moderate)</span>
                    <span className="text-rose-500 font-bold">120+ BPM (Alert Trigger)</span>
                  </div>
                </div>

                {/* SpO2 Slider */}
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <label className="font-semibold text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
                      <Activity className="w-4 h-4 text-cyan-500" />
                      <span>Blood Oxygen (SpO2)</span>
                    </label>
                    <span className={`font-mono font-bold text-base ${streamSpo2 < 93 ? 'text-amber-600' : 'text-slate-900 dark:text-white'}`}>
                      {streamSpo2}% {streamSpo2 < 93 ? '(Hypoxia Alert)' : ''}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="85"
                    max="100"
                    value={streamSpo2}
                    onChange={(e) => setStreamSpo2(Number(e.target.value))}
                    className="w-full accent-cyan-600"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                    <span className="text-amber-500 font-bold">&lt; 93% (Hypoxia Trigger)</span>
                    <span>95% (Acceptable)</span>
                    <span>100% (Optimal)</span>
                  </div>
                </div>

                <button
                  onClick={toggleStreaming}
                  className={`w-full py-3 rounded-xl font-bold text-sm shadow-md transition flex items-center justify-center space-x-2 ${
                    isStreaming
                      ? 'bg-rose-600 hover:bg-rose-700 text-white'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  <Activity className={`w-4 h-4 ${isStreaming ? 'animate-spin' : ''}`} />
                  <span>{isStreaming ? "Stop Live Telemetry Stream" : "Start 1 Hz Live Pulse Stream"}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: MISSING SENSORS & DATA FUSION (THE USER'S EDGE CASE) */}
          {activeTab === "missing_sensors" && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
                <div className="flex items-start space-x-3">
                  <div className="p-2 rounded-xl bg-amber-200/60 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300">
                    <Info className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-amber-950 dark:text-amber-100">
                      Edge-Case Resolution: What If The Watch Does Not Provide A Vital?
                    </h4>
                    <p className="text-xs text-amber-800 dark:text-amber-300 mt-1 leading-relaxed">
                      Consumer smartwatches (Noise, boAt, Apple) rely on optical light sensors. They <strong>cannot clinically measure Blood Pressure</strong> (which requires a pneumatic upper-arm bladder) or <strong>Blood Glucose</strong> (which requires a biochemical reagent strip). Rather than failing, SevaSetu automatically fuses multiple medical data streams:
                    </p>
                  </div>
                </div>
              </div>

              {/* Sensor Capability Matrix */}
              <div className="space-y-3">
                <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Authoritative Sensor & Data Fusion Matrix
                </h5>

                <div className="space-y-2">
                  {/* Heart Rate */}
                  <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-rose-100 dark:bg-rose-950 text-rose-600">
                        <Heart className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-800 dark:text-slate-200">Heart Rate & Pulse</div>
                        <div className="text-xs text-slate-500">Optical PPG Sensor on Smartwatch</div>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">
                      Watch Streaming
                    </span>
                  </div>

                  {/* SpO2 */}
                  <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-cyan-100 dark:bg-cyan-950 text-cyan-600">
                        <Activity className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-800 dark:text-slate-200">Blood Oxygen (SpO2)</div>
                        <div className="text-xs text-slate-500">Red & IR Reflectance Sensor (On-Demand Test)</div>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-cyan-100 dark:bg-cyan-950/80 text-cyan-700 dark:text-cyan-300">
                      On-Demand / Synced
                    </span>
                  </div>

                  {/* Blood Pressure (Missing on Watch) */}
                  <div className="p-3 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-600">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Blood Pressure</span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-200 text-amber-800">Missing On Watch</span>
                        </div>
                        <div className="text-xs text-slate-500">Fused from Upper-Arm Cuff or Doctor Clinic Log</div>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300">
                      Fused: {liveData?.vitals?.blood_pressure || "118/78"}
                    </span>
                  </div>

                  {/* Blood Glucose (Missing on Watch) */}
                  <div className="p-3 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-600">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Blood Glucose</span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-200 text-amber-800">Missing On Watch</span>
                        </div>
                        <div className="text-xs text-slate-500">Fused from Lab OCR (Health Vault Diagnostic Panel)</div>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300">
                      Fused: {liveData?.vitals?.blood_glucose || "92 mg/dL"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Edge-Case Quick Entry for Missing Sensors */}
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-3">
                <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                  <Plus className="w-4 h-4 text-emerald-600" />
                  <span>Log Missing Sensor Reading (Manual Cuff / Lab Panel)</span>
                </h5>
                <p className="text-xs text-slate-500">
                  Enter your latest blood pressure reading from an upper-arm cuff to instantly enrich the live vitals telemetry:
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Systolic (mmHg)</label>
                    <input
                      type="number"
                      value={manualBpSys}
                      onChange={(e) => setManualBpSys(e.target.value)}
                      placeholder="120"
                      className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Diastolic (mmHg)</label>
                    <input
                      type="number"
                      value={manualBpDia}
                      onChange={(e) => setManualBpDia(e.target.value)}
                      placeholder="80"
                      className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-mono"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => handleSaveManualVital("blood_pressure")}
                    disabled={isSavingManual}
                    className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isSavingManual ? "Saving..." : "Save Blood Pressure to Telemetry"}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Alerts Banner (If Triggered) */}
        {liveData?.alerts && liveData.alerts.length > 0 && (
          <div className="px-6 py-3 bg-rose-50 dark:bg-rose-950/50 border-t border-rose-200 dark:border-rose-900 text-xs text-rose-800 dark:text-rose-200 flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>
              <strong>Clinical Guardrail Alert:</strong> {liveData.alerts[0].message}
            </span>
          </div>
        )}

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-500 flex items-center space-x-1.5">
            <Database className="w-3.5 h-3.5 text-emerald-600" />
            <span>Redis Cache Active &bull; Multi-Modal Fused Record</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-semibold text-xs transition"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
