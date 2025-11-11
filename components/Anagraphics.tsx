import React, { useState, useMemo } from 'react';
import { Worker, Machine, Department, Shift, WorkerAvailability } from '../types';
import { WorkerModal } from './WorkerModal';
import { MachineModal } from './MachineModal';
import { WORKER_AVAILABILITY_TYPES } from '../constants';
import { classNames } from '../utils/helpers';

interface AnagraphicsProps {
  workers: Worker[];
  machines: Machine[];
  departments: Department[];
  shifts: Shift[];
  onAddWorker: (worker: Omit<Worker, 'id'>) => void;
  onUpdateWorker: (worker: Worker) => void;
  onDeleteWorker: (workerId: string) => void;
  onAddMachine: (machine: Omit<Machine, 'id'>) => void;
  onUpdateMachine: (machine: Machine) => void;
  onDeleteMachine: (machineId: string) => void;
}

const TableCard: React.FC<{ title: string; buttonText: string; onButtonClick: () => void; children: React.ReactNode }> = ({ title, buttonText, onButtonClick, children }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h2>
            <button onClick={onButtonClick} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition font-semibold">
                {buttonText}
            </button>
        </div>
        <div className="overflow-x-auto">
            {children}
        </div>
    </div>
);

export const Anagraphics: React.FC<AnagraphicsProps> = ({ workers, machines, departments, shifts, onAddWorker, onUpdateWorker, onDeleteWorker, onAddMachine, onUpdateMachine, onDeleteMachine }) => {
    const [isWorkerModalOpen, setIsWorkerModalOpen] = useState(false);
    const [editingWorker, setEditingWorker] = useState<Worker | null>(null);
    const [isMachineModalOpen, setIsMachineModalOpen] = useState(false);
    const [editingMachine, setEditingMachine] = useState<Machine | null>(null);
    const [availabilityFilter, setAvailabilityFilter] = useState<WorkerAvailability | 'all'>('all');

    const filteredWorkers = useMemo(() => {
        if (availabilityFilter === 'all') {
            return workers;
        }
        return workers.filter(w => w.availability === availabilityFilter);
    }, [workers, availabilityFilter]);

    const handleOpenWorkerModal = (worker: Worker | null = null) => {
        setEditingWorker(worker);
        setIsWorkerModalOpen(true);
    };

    const handleSaveWorker = (workerData: Omit<Worker, 'id'> | Worker) => {
        if ('id' in workerData) {
            onUpdateWorker(workerData);
        } else {
            onAddWorker(workerData);
        }
    };
    
    const handleOpenMachineModal = (machine: Machine | null = null) => {
        setEditingMachine(machine);
        setIsMachineModalOpen(true);
    };

    const handleSaveMachine = (machineData: Omit<Machine, 'id'> | Machine) => {
        if ('id' in machineData) {
            onUpdateMachine(machineData);
        } else {
            onAddMachine(machineData);
        }
    };

    return (
        <>
            <div className="p-4 sm:p-6 space-y-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestione Anagrafiche</h1>
                
                <TableCard title="Lavoratori" buttonText="Aggiungi Lavoratore" onButtonClick={() => handleOpenWorkerModal()}>
                    <div className="flex items-center space-x-2 mb-4">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filtra per disponibilità:</span>
                        <button onClick={() => setAvailabilityFilter('all')} className={classNames(
                            'px-3 py-1 text-sm font-medium rounded-md transition',
                            availabilityFilter === 'all'
                                ? 'bg-blue-600 text-white shadow'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                        )}>Tutti</button>
                        {WORKER_AVAILABILITY_TYPES.map(avail => (
                            <button key={avail} onClick={() => setAvailabilityFilter(avail)} className={classNames(
                                'px-3 py-1 text-sm font-medium rounded-md transition',
                                availabilityFilter === avail
                                    ? 'bg-blue-600 text-white shadow'
                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                            )}>{avail}</button>
                        ))}
                    </div>
                    <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">Nome</th>
                                <th scope="col" className="px-6 py-3">Competenze</th>
                                <th scope="col" className="px-6 py-3">Disponibilità</th>
                                <th scope="col" className="px-6 py-3">Azioni</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredWorkers.map(worker => (
                                <tr key={worker.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">{worker.name}</td>
                                    <td className="px-6 py-4">{worker.skills.join(', ')}</td>
                                    <td className="px-6 py-4">{worker.availability}</td>
                                    <td className="px-6 py-4 space-x-2">
                                        <button onClick={() => handleOpenWorkerModal(worker)} className="font-medium text-blue-600 dark:text-blue-500 hover:underline">Modifica</button>
                                        <button onClick={() => onDeleteWorker(worker.id)} className="font-medium text-red-600 dark:text-red-500 hover:underline">Elimina</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </TableCard>

                <TableCard title="Macchine" buttonText="Aggiungi Macchina" onButtonClick={() => handleOpenMachineModal()}>
                     <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">Nome</th>
                                <th scope="col" className="px-6 py-3">Tipo</th>
                                <th scope="col" className="px-6 py-3">Reparto</th>
                                <th scope="col" className="px-6 py-3">Azioni</th>
                            </tr>
                        </thead>
                        <tbody>
                            {machines.map(machine => (
                                <tr key={machine.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">{machine.name}</td>
                                    <td className="px-6 py-4">{machine.type}</td>
                                    <td className="px-6 py-4">{departments.find(d => d.id === machine.departmentId)?.name}</td>
                                    <td className="px-6 py-4 space-x-2">
                                        <button onClick={() => handleOpenMachineModal(machine)} className="font-medium text-blue-600 dark:text-blue-500 hover:underline">Modifica</button>
                                        <button onClick={() => onDeleteMachine(machine.id)} className="font-medium text-red-600 dark:text-red-500 hover:underline">Elimina</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </TableCard>
            </div>
            <WorkerModal 
                isOpen={isWorkerModalOpen}
                onClose={() => setIsWorkerModalOpen(false)}
                onSave={handleSaveWorker}
                worker={editingWorker}
                shifts={shifts}
                machines={machines}
            />
            <MachineModal
                isOpen={isMachineModalOpen}
                onClose={() => setIsMachineModalOpen(false)}
                onSave={handleSaveMachine}
                machine={editingMachine}
                departments={departments}
                shifts={shifts}
                workers={workers}
            />
        </>
    );
};