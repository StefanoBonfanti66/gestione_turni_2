

import React, { useState, useEffect, useMemo } from 'react';
import { Machine, MachineType, Department, Shift, ShiftTypeName, Worker } from '../types';
import { MACHINE_TYPES, SHIFT_TYPES } from '../constants';
import { XIcon } from './icons/XIcon';
// FIX: Replaced date-fns default imports from sub-paths with named imports from the main package to resolve "not callable" type errors.
import { format, parseISO } from 'date-fns';

interface MachineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (machine: Omit<Machine, 'id'> | Machine) => void;
  machine: Machine | null;
  departments: Department[];
  shifts: Shift[];
  workers: Worker[];
}

export const MachineModal: React.FC<MachineModalProps> = ({ isOpen, onClose, onSave, machine, departments, shifts, workers }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: MachineType.INIEZIONE,
    departmentId: departments[0]?.id || '',
  });

  useEffect(() => {
    if (machine) {
      setFormData({
        name: machine.name,
        type: machine.type,
        departmentId: machine.departmentId,
      });
    } else {
      setFormData({
        name: '',
        type: MachineType.INIEZIONE,
        departmentId: departments[0]?.id || '',
      });
    }
  }, [machine, isOpen, departments]);

  const assignedShifts = useMemo(() => {
    if (!machine) return [];
    return shifts
      .filter(s => s.machineId === machine.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [shifts, machine]);

  const handleSubmit = () => {
    if (!formData.name || !formData.departmentId) {
      alert('Tutti i campi sono obbligatori.');
      return;
    }
    onSave({ ...machine, ...formData });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-2xl m-4 transform transition-all max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{machine ? 'Modifica Macchina' : 'Aggiungi Macchina'}</h2>
          <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700">
            <XIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="overflow-y-auto pr-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome Macchina</label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 block w-full pl-3 pr-4 py-2 text-base bg-white text-gray-900 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                />
              </div>
               <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tipo</label>
                <select id="type" name="type" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as MachineType})} className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-white text-gray-900 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                    {MACHINE_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                </select>
              </div>
              <div className="md:col-span-2">
                <label htmlFor="departmentId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Reparto</label>
                <select id="departmentId" name="departmentId" value={formData.departmentId} onChange={e => setFormData({...formData, departmentId: e.target.value})} className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-white text-gray-900 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                    {departments.map(dep => <option key={dep.id} value={dep.id}>{dep.name}</option>)}
                </select>
              </div>
            </div>

            {machine && (
                 <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Turni Pianificati</h3>
                     <div className="max-h-60 overflow-y-auto border dark:border-gray-700 rounded-md">
                        <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                           <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 sticky top-0">
                                <tr>
                                    <th scope="col" className="px-4 py-2">Data</th>
                                    <th scope="col" className="px-4 py-2">Turno</th>
                                    <th scope="col" className="px-4 py-2">Lavoratore</th>
                                </tr>
                            </thead>
                            <tbody>
                                {assignedShifts.length > 0 ? assignedShifts.map(shift => (
                                    <tr key={shift.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
                                        <td className="px-4 py-2">{format(parseISO(shift.date), 'dd/MM/yyyy')}</td>
                                        <td className="px-4 py-2">{SHIFT_TYPES[shift.shiftTypeId as ShiftTypeName].name}</td>
                                        <td className="px-4 py-2">{workers.find(w => w.id === shift.workerId)?.name || 'N/D'}</td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={3} className="text-center p-4">Nessun turno pianificato.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                 </div>
            )}
        </div>
        
        <div className="mt-6 pt-4 border-t dark:border-gray-700 flex justify-end space-x-3">
          <button onClick={onClose} className="bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-200 px-4 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition font-semibold">
            Annulla
          </button>
          <button onClick={handleSubmit} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition font-semibold">
            Salva
          </button>
        </div>
      </div>
    </div>
  );
};