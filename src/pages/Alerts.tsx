import React, { useState } from 'react';
import { DEMO_ALERTS } from '../data/mockAlerts';
import { AlertTriangle, Lightbulb, Info, ShieldAlert, Check } from 'lucide-react';
import { Alert } from '../data/types';

type FilterType = 'ALL' | 'critical' | 'warning' | 'info';

export default function Alerts() {
  const [filter, setFilter] = useState<FilterType>('ALL');
  const [alerts, setAlerts] = useState<Alert[]>(DEMO_ALERTS);

  const counts = {
    ALL: alerts.length,
    critical: alerts.filter(a => a.severity === 'critical').length,
    warning: alerts.filter(a => a.severity === 'warning').length,
    info: alerts.filter(a => a.severity === 'info').length,
  };

  const filteredAlerts = filter === 'ALL' ? alerts : alerts.filter(a => a.severity === filter);
  
  // Sort by timestamp descending (newest first)
  filteredAlerts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const toggleAcknowledge = (id: string) => {
    setAlerts(alerts.map(a => a.id === id ? { ...a, acknowledged: !a.acknowledged } : a));
  };

  const getSeverityColors = (severity: string) => {
    switch(severity) {
      case 'critical': return 'bg-red-500 text-red-500 border-red-500';
      case 'warning': return 'bg-amber-500 text-amber-500 border-amber-500';
      default: return 'bg-blue-500 text-blue-500 border-blue-500';
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col mb-4">
        <div className="flex items-center space-x-3">
          <AlertTriangle className="w-8 h-8 text-amber-500" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">ENGINEERING ALERTS</h1>
        </div>
        <div className="mt-3 inline-block bg-amber-500/10 border border-amber-500/20 rounded px-2 py-1 self-start">
          <span className="text-amber-500 text-xs font-semibold tracking-wider">SIMULATED ALERTS</span>
        </div>
      </div>

      <div className="flex space-x-4 border-b border-gray-200 dark:border-gray-800 pb-2">
        {(['ALL', 'critical', 'warning', 'info'] as FilterType[]).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`pb-2 px-1 text-sm font-semibold uppercase tracking-wider transition-colors border-b-2 ${
              filter === f 
                ? 'border-amber-500 text-amber-500' 
                : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            {f} ({counts[f]})
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredAlerts.map(alert => {
          const colorClass = getSeverityColors(alert.severity);
          const bgBar = colorClass.split(' ')[0];
          const textColor = colorClass.split(' ')[1];

          return (
            <div key={alert.id} className="relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-5 flex pl-6 shadow-sm">
              <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-lg ${bgBar}`} />
              
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center space-x-2">
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 ${textColor}`}>
                      {alert.severity}
                    </span>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">{alert.title}</h3>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(alert.timestamp).toLocaleString()}
                  </span>
                </div>
                
                <div className="mb-3">
                  <span className="inline-block dark:bg-gray-800 bg-gray-100 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded text-xs">
                    Parameter: {alert.parameter}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{alert.description || 'No additional description provided.'}</p>
                
                <div className="flex items-start bg-amber-500/5 p-3 rounded border border-amber-500/10 mb-4">
                  <Lightbulb className="w-4 h-4 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-amber-600 dark:text-amber-400/90 italic">Action: {alert.suggestedAction}</p>
                </div>

                <div>
                  {alert.acknowledged ? (
                    <span className="inline-flex items-center text-xs font-semibold text-emerald-500">
                      <Check className="w-3 h-3 mr-1" /> Acknowledged
                    </span>
                  ) : (
                    <button 
                      onClick={() => toggleAcknowledge(alert.id)}
                      className="text-xs font-semibold px-3 py-1 rounded border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
                    >
                      Acknowledge
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        
        {filteredAlerts.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No alerts found for this filter.
          </div>
        )}
      </div>
    </div>
  );
}
