import React from 'react';
import { 
  Database, Radio, BarChart, Flame, ArrowUpDown, Workflow, 
  Layers, CircleDot, Cog, Factory, Brain, AlertTriangle, 
  Target, FlaskConical, Lightbulb, Monitor, FileText 
} from 'lucide-react';

export default function Architecture() {
  const Box = ({ icon: Icon, title, desc }: { icon: any, title: string, desc?: string }) => (
    <div className="flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm text-center w-full max-w-[160px] mx-auto z-10 relative">
      <Icon className="w-6 h-6 text-cyan-400 mb-2" />
      <span className="text-xs font-bold text-gray-900 dark:text-gray-100 leading-tight">{title}</span>
      {desc && <span className="text-[10px] text-gray-500 mt-1">{desc}</span>}
    </div>
  );

  const Arrow = () => (
    <div className="h-8 w-0.5 border-l-2 border-dashed border-gray-400 dark:border-gray-600 mx-auto my-2 animate-[pulse_2s_ease-in-out_infinite]" />
  );

  return (
    <div className="p-6 flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto">
      <div className="flex-1 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">SYSTEM ARCHITECTURE</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">End-to-end data flow from well to engineer</p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-950 p-8 rounded-xl border border-gray-200 dark:border-gray-800 overflow-x-auto relative">
          
          {/* Row 1: Data Sources */}
          <div className="grid grid-cols-5 gap-2 min-w-[700px]">
            <Box icon={Database} title="Historical Data" />
            <Box icon={Radio} title="Sensor Data" />
            <Box icon={BarChart} title="Production Data" />
            <Box icon={Flame} title="CSS Parameters" />
            <Box icon={ArrowUpDown} title="SRP Parameters" />
          </div>
          
          <Arrow />

          {/* Row 2: Data Engineering */}
          <div className="flex justify-center min-w-[700px]">
            <div className="flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg w-full max-w-lg z-10">
              <Workflow className="w-6 h-6 text-amber-500 mb-2" />
              <span className="text-sm font-bold text-gray-900 dark:text-gray-100">DATA ENGINEERING</span>
              <span className="text-xs text-gray-500 mt-1">Ingestion → Cleaning → Feature Engineering</span>
            </div>
          </div>

          <Arrow />

          {/* Row 3: Digital Twin Core */}
          <div className="grid grid-cols-4 gap-4 min-w-[700px]">
            <Box icon={Layers} title="Reservoir Model" />
            <Box icon={CircleDot} title="Wellbore Model" />
            <Box icon={Cog} title="Pump Model" />
            <Box icon={Factory} title="Surface Model" />
          </div>

          <Arrow />

          {/* Row 4: AI / ML */}
          <div className="flex justify-center gap-8 min-w-[700px]">
            <Box icon={Brain} title="Prediction Models" />
            <Box icon={AlertTriangle} title="Anomaly Detection" />
          </div>

          <Arrow />

          {/* Row 5: Optimization */}
          <div className="flex justify-center min-w-[700px]">
             <div className="flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-900 border border-amber-500/50 rounded-lg w-full max-w-sm z-10 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
              <Target className="w-6 h-6 text-amber-500 mb-2" />
              <span className="text-sm font-bold text-gray-900 dark:text-gray-100">OPTIMIZATION ENGINE</span>
              <span className="text-xs text-gray-500 mt-1">Multi-Objective Optimization</span>
            </div>
          </div>

          <Arrow />

          {/* Row 6: Dashboard */}
          <div className="grid grid-cols-4 gap-4 min-w-[700px]">
            <Box icon={FlaskConical} title="Simulation" />
            <Box icon={Lightbulb} title="Recommendation" />
            <Box icon={Monitor} title="Monitoring" />
            <Box icon={FileText} title="Reports" />
          </div>

        </div>
      </div>

      <div className="lg:w-80 flex-shrink-0 space-y-6">
        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <Brain className="w-5 h-5 text-cyan-400 mr-2" />
            HYBRID PHYSICS + AI
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            The Baghewala Digital Twin employs a hybrid approach, combining physics-based simulation with data-driven AI models:
          </p>
          <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400 list-disc pl-5">
            <li><strong className="text-gray-800 dark:text-gray-200">Physics Base:</strong> Mass & energy balance, thermodynamics, fluid dynamics for CSS cycles.</li>
            <li><strong className="text-gray-800 dark:text-gray-200">AI Calibration:</strong> Machine learning models continuously calibrate physics parameters using real-time sensor data.</li>
            <li><strong className="text-gray-800 dark:text-gray-200">Predictive AI:</strong> Neural networks forecast production trends and equipment failure risks based on historical patterns.</li>
            <li><strong className="text-gray-800 dark:text-gray-200">Multi-Objective Optimization:</strong> Evolutionary algorithms find the Pareto frontier balancing production vs efficiency.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
