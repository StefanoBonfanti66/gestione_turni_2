import React from 'react';
import { HistoryEntry } from '../types';
// FIX: Replaced date-fns default import from sub-path with a named import from the main package to resolve "not callable" type error.
import { format } from 'date-fns';

interface HistoryProps {
  history: HistoryEntry[];
}

export const History: React.FC<HistoryProps> = ({ history }) => {
  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Storico Modifiche</h1>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {history.length > 0 ? history.map(entry => (
            <li key={entry.id} className="py-4">
              <div className="flex space-x-3">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-700 dark:text-gray-300">{entry.description}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {format(entry.timestamp, "d MMM yyyy 'alle' HH:mm")}
                    </p>
                  </div>
                </div>
              </div>
            </li>
          )) : (
            <li className="py-4 text-center text-gray-500 dark:text-gray-400">Nessuna modifica registrata.</li>
          )}
        </ul>
      </div>
    </div>
  );
};