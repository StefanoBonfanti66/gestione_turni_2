
import React, { useState, useMemo } from 'react';
import { Machine, Worker, ShiftTypeName } from '../types';
import { SHIFT_TYPES } from '../constants';
import { XIcon } from './icons/XIcon';
import { classNames } from '../utils/helpers';

interface AddShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { workerId: string; shiftTypeId: ShiftTypeName; }) => void;
  machine: Machine | null;
  workers: Worker[];
}

export const AddShiftModal: React.FC<AddShiftModalProps> = ({ isOpen, onClose, onSave, machine, workers }) => {
  const [selectedWorkerId, setSelectedWorkerId] = useState('');
  const [selectedShiftTypeId, setSelectedShiftTypeId] = useState<ShiftTypeName>(ShiftTypeName.MATTINA);
  
  const qualifiedWorkers = useMemo(() => {
    if (!machine) return [];
    return workers.filter(w => w.skills.includes(machine.type));
  }, [machine, workers]);

  React.useEffect(() => {
    if (qualifiedWorkers.length > 0) {
      setSelectedWorkerId(qualifiedWorkers[0].id);
    } else {
        setSelectedWorkerId('');
    }
  }, [qualifiedWorkers]);

  const handleSave = () => {
    if (!selectedWorkerId || !selectedShiftTypeId) {
        alert('Per favore, seleziona un lavoratore e un tipo di turno.');
        return;
    }
    onSave({ workerId: selectedWorkerId, shiftTypeId: selectedShiftTypeId });
    onClose();
  };

  if (!isOpen || !machine) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity" aria-modal="true" role="dialog">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md m-4 transform transition-all">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Aggiungi Turno</h2>
            <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700">
                <XIcon className="h-6 w-6" />
            </button>
        </div>
        
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            Stai aggiungendo un turno per la macchina: <span className="font-semibold">{machine.name}</span>
        </p>

        <div className="space-y-4">
            <div>
                <label htmlFor="workerId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Lavoratore Qualificato</label>
                <select 
                    id="workerId" 
                    value={selectedWorkerId} 
                    onChange={(e) => setSelectedWorkerId(e.target.value)} 
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-white text-gray-900 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                    {qualifiedWorkers.length > 0 ? (
                        qualifiedWorkers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)
                    ) : (
                        <option disabled>Nessun lavoratore qualificato</option>
                    )}
                </select>
            </div>
             <div>
                <label htmlFor="shiftTypeId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tipo di Turno</label>
                <select 
                    id="shiftTypeId" 
                    value={selectedShiftTypeId}
                    onChange={(e) => setSelectedShiftTypeId(e.target.value as ShiftTypeName)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-white text-gray-900 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                    {Object.values(SHIFT_TYPES).map(st => <option key={st.id} value={st.id}>{st.name}</option>)}
                </select>
            </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
            <button onClick={onClose} className="bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-200 px-4 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition font-semibold">
                Annulla
            </button>
            <button 
                onClick={handleSave} 
                disabled={!selectedWorkerId}
                className={classNames(
                    "text-white px-4 py-2 rounded-md transition font-semibold",
                    !selectedWorkerId ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                )}
            >
                Salva Turno
            </button>
        </div>
      </div>
    </div>
  );
};
