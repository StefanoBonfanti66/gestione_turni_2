

import React, { useState, useEffect } from 'react';
import { Worker, LeaveRequest, LeaveRequestStatus, LeaveRequestType } from '../types';
// FIX: Replaced date-fns default imports from sub-paths with named imports from the main package to resolve "not callable" type errors.
import { format, parseISO } from 'date-fns';
import { classNames } from '../utils/helpers';
import { XIcon } from './icons/XIcon';

interface RequestsViewProps {
    workers: Worker[];
    leaveRequests: LeaveRequest[];
    onAddRequest: (request: Omit<LeaveRequest, 'id' | 'status'>) => void;
    onUpdateRequestStatus: (requestId: string, status: LeaveRequestStatus) => void;
}

interface RequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (request: Omit<LeaveRequest, 'id' | 'status'>) => void;
    workers: Worker[];
}

const RequestModal: React.FC<RequestModalProps> = ({ isOpen, onClose, onSave, workers }) => {
    const [workerId, setWorkerId] = useState(workers[0]?.id || '');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [type, setType] = useState<LeaveRequestType>(LeaveRequestType.FERIE);
    const [startTime, setStartTime] = useState('08:00');
    const [endTime, setEndTime] = useState('09:00');

    // Generate time options with 30-minute intervals
    const timeOptions = React.useMemo(() => {
        const options = [];
        for (let h = 0; h < 24; h++) {
            for (let m = 0; m < 60; m += 30) {
                const hour = h.toString().padStart(2, '0');
                const minute = m.toString().padStart(2, '0');
                options.push(`${hour}:${minute}`);
            }
        }
        return options;
    }, []);

    useEffect(() => {
        if (type === LeaveRequestType.PERMESSO && startDate) {
            setEndDate(startDate);
        }
    }, [type, startDate]);
    
    const handleTypeChange = (newType: LeaveRequestType) => {
        setType(newType);
        if (newType !== LeaveRequestType.PERMESSO) {
            setStartTime('08:00');
            setEndTime('09:00');
        }
    };
    
    const handleStartDateChange = (date: string) => {
        setStartDate(date);
        if (type === LeaveRequestType.PERMESSO) {
            setEndDate(date);
        }
    };
    
    const resetForm = () => {
        setWorkerId(workers[0]?.id || '');
        setStartDate('');
        setEndDate('');
        setType(LeaveRequestType.FERIE);
        setStartTime('08:00');
        setEndTime('09:00');
    };

    const handleSubmit = () => {
        if (!workerId || !startDate || !endDate) {
            alert('Tutti i campi data e lavoratore sono obbligatori.');
            return;
        }
        if (new Date(startDate) > new Date(endDate)) {
            alert('La data di inizio non può essere successiva alla data di fine.');
            return;
        }

        const requestData: Omit<LeaveRequest, 'id' | 'status'> = { workerId, startDate, endDate, type };
        
        if (type === LeaveRequestType.PERMESSO) {
            if (!startTime || !endTime) {
                alert("Per i permessi è necessario specificare l'orario di inizio e fine.");
                return;
            }
            if (startTime >= endTime) {
                 alert("L'orario di inizio non può essere successivo o uguale all'orario di fine.");
                 return;
            }
            requestData.startTime = startTime;
            requestData.endTime = endTime;
        }
        
        onSave(requestData);
        onClose();
        resetForm();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md m-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Nuova Richiesta</h2>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700">
                        <XIcon className="h-6 w-6" />
                    </button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="worker" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Lavoratore</label>
                        <select id="worker" value={workerId} onChange={(e) => setWorkerId(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-white text-gray-900 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                            {workers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tipo Richiesta</label>
                        <select id="type" value={type} onChange={(e) => handleTypeChange(e.target.value as LeaveRequestType)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-white text-gray-900 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                            {Object.values(LeaveRequestType).map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Data Inizio</label>
                            <input type="date" id="startDate" value={startDate} onChange={e => handleStartDateChange(e.target.value)} className="mt-1 block w-full pl-3 pr-4 py-2 text-base bg-white text-gray-900 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md" />
                        </div>
                        <div>
                            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Data Fine</label>
                            <input type="date" id="endDate" value={endDate} onChange={e => setEndDate(e.target.value)} disabled={type === LeaveRequestType.PERMESSO} className="mt-1 block w-full pl-3 pr-4 py-2 text-base bg-white text-gray-900 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md disabled:bg-gray-100 dark:disabled:bg-gray-700/50" />
                        </div>
                    </div>
                    {type === LeaveRequestType.PERMESSO && (
                         <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Dalle ore</label>
                                <select id="startTime" value={startTime} onChange={e => setStartTime(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-white text-gray-900 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                                    {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Alle ore</label>
                                <select id="endTime" value={endTime} onChange={e => setEndTime(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-white text-gray-900 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                                    {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                        </div>
                    )}
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                    <button onClick={onClose} className="bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-200 px-4 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition font-semibold">Annulla</button>
                    <button onClick={handleSubmit} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition font-semibold">Invia Richiesta</button>
                </div>
            </div>
        </div>
    );
};

export const RequestsView: React.FC<RequestsViewProps> = ({ workers, leaveRequests, onAddRequest, onUpdateRequestStatus }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const getStatusColor = (status: LeaveRequestStatus) => {
        switch(status) {
            case LeaveRequestStatus.APPROVED: return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case LeaveRequestStatus.REJECTED: return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            case LeaveRequestStatus.PENDING:
            default:
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
        }
    };
    
    const sortedRequests = [...leaveRequests].sort((a,b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

    return (
        <>
            <div className="p-4 sm:p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestione Ferie e Permessi</h1>
                    <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition font-semibold">
                        Nuova Richiesta
                    </button>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <div className="overflow-x-auto">
                         <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Lavoratore</th>
                                    <th scope="col" className="px-6 py-3">Tipo</th>
                                    <th scope="col" className="px-6 py-3">Periodo</th>
                                    <th scope="col" className="px-6 py-3">Stato</th>
                                    <th scope="col" className="px-6 py-3">Azioni</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedRequests.map(req => {
                                    const formattedStartDate = format(parseISO(req.startDate), 'dd/MM/yy');
                                    const formattedEndDate = format(parseISO(req.endDate), 'dd/MM/yy');
                                    let periodDisplay;
                                    if (req.type === LeaveRequestType.PERMESSO && req.startTime && req.endTime) {
                                        periodDisplay = `${formattedStartDate} (${req.startTime} - ${req.endTime})`;
                                    } else if (formattedStartDate === formattedEndDate) {
                                        periodDisplay = formattedStartDate;
                                    } else {
                                        periodDisplay = `${formattedStartDate} - ${formattedEndDate}`;
                                    }
                                    
                                    return (
                                    <tr key={req.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">{workers.find(w => w.id === req.workerId)?.name}</td>
                                        <td className="px-6 py-4">{req.type}</td>
                                        <td className="px-6 py-4">{periodDisplay}</td>
                                        <td className="px-6 py-4">
                                            <span className={classNames('px-2 inline-flex text-xs leading-5 font-semibold rounded-full', getStatusColor(req.status))}>
                                                {req.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 space-x-2">
                                            {req.status === LeaveRequestStatus.PENDING && (
                                                <>
                                                    <button onClick={() => onUpdateRequestStatus(req.id, LeaveRequestStatus.APPROVED)} className="font-medium text-green-600 dark:text-green-500 hover:underline">Approva</button>
                                                    <button onClick={() => onUpdateRequestStatus(req.id, LeaveRequestStatus.REJECTED)} className="font-medium text-red-600 dark:text-red-500 hover:underline">Rifiuta</button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                )})}
                            </tbody>
                        </table>
                        {sortedRequests.length === 0 && (
                             <p className="text-center py-4 text-gray-500 dark:text-gray-400">Nessuna richiesta trovata.</p>
                        )}
                    </div>
                </div>
            </div>
            <RequestModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={onAddRequest} workers={workers} />
        </>
    );
};