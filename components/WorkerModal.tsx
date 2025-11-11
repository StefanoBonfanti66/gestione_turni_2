

import React, { useState, useEffect, useMemo } from 'react';
import { Worker, MachineType, Shift, Machine, ShiftTypeName, WorkerAvailability } from '../types';
import { MACHINE_TYPES, SHIFT_TYPES, WORKER_AVAILABILITY_TYPES } from '../constants';
import { XIcon } from './icons/XIcon';
import { classNames } from '../utils/helpers';
// FIX: Replaced date-fns default imports from sub-paths with named imports from the main package to resolve "not callable" type errors.
import { format, parseISO } from 'date-fns';

interface WorkerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (worker: Omit<Worker, 'id'> | Worker) => void;
  worker: Worker | null;
  shifts: Shift[];
  machines: Machine[];
}

export const WorkerModal: React.FC<WorkerModalProps> = ({ isOpen, onClose, onSave, worker, shifts, machines }) => {
  const [formData, setFormData] = useState({
    name: '',
    availability: WorkerAvailability.FULL_TIME,
    skills: [] as MachineType[],
  });

  useEffect(() => {
    if (worker) {
      setFormData({
        name: worker.name,
        availability: worker.availability,
        skills: [...worker.skills],
      });
    } else {
      setFormData({ name: '', availability: WorkerAvailability.FULL_TIME, skills: [] });
    }
  }, [worker, isOpen]);

  const assignedShifts = useMemo(() => {
    if (!worker) return [];
    return shifts
      .filter(s => s.workerId === worker.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [shifts, worker]);

  const handleSkillChange = (skill: MachineType) => {
    setFormData(prev => {
      const skills = prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill];
      return { ...prev, skills };
    });
  };

  const handleSubmit = () => {
    if (!formData.name) {
      alert('Il nome è obbligatorio.');
      return;
    }
    onSave({ ...worker, ...formData });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-2xl m-4 transform transition-all max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{worker ? 'Modifica Lavoratore' : 'Aggiungi Lavoratore'}</h2>
          <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700">
            <XIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="overflow-y-auto pr-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome</label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 block w-full pl-3 pr-4 py-2 text-base bg-white text-gray-900 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                />
              </div>
              <div>
                <label htmlFor="availability" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Disponibilità</label>
                <select
                  id="availability"
                  value={formData.availability}
                  onChange={e => setFormData({ ...formData, availability: e.target.value as WorkerAvailability })}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-white text-gray-900 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  {WORKER_AVAILABILITY_TYPES.map(avail => <option key={avail} value={avail}>{avail}</option>)}
                </select>
              </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Competenze</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {MACHINE_TYPES.map(skill => (
                    <button
                      key={skill}
                      onClick={() => handleSkillChange(skill)}
                      className={classNames(
                        'px-2 py-1 text-xs rounded-full border',
                        formData.skills.includes(skill)
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-transparent text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                      )}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
            </div>
            {worker && (
                 <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Turni Assegnati</h3>
                    <div className="max-h-60 overflow-y-auto border dark:border-gray-700 rounded-md">
                        <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 sticky top-0">
                                <tr>
                                    <th scope="col" className="px-4 py-2">Data</th>
                                    <th scope="col" className="px-4 py-2">Turno</th>
                                    <th scope="col" className="px-4 py-2">Macchina</th>
                                </tr>
                            </thead>
                            <tbody>
                                {assignedShifts.length > 0 ? assignedShifts.map(shift => (
                                    <tr key={shift.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
                                        <td className="px-4 py-2">{format(parseISO(shift.date), 'dd/MM/yyyy')}</td>
                                        <td className="px-4 py-2">{SHIFT_TYPES[shift.shiftTypeId as ShiftTypeName].name}</td>
                                        <td className="px-4 py-2">{machines.find(m => m.id === shift.machineId)?.name || 'N/D'}</td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={3} className="text-center p-4">Nessun turno assegnato.</td>
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