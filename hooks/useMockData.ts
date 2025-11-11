import { useState, useCallback, useEffect } from 'react';
import { Department, Machine, Worker, Shift, HistoryEntry, LeaveRequest, MachineType, ShiftTypeName, LeaveRequestStatus, LeaveRequestType, WorkerAvailability } from '../types';
import { DEPARTMENTS } from '../constants';
// FIX: Replaced date-fns default imports from sub-paths with named imports from the main package to resolve "not callable" type errors.
import { format, parseISO } from 'date-fns';

type NotificationType = 'success' | 'info' | 'error';
type AddNotificationFn = (message: string, type?: NotificationType) => void;

const initialWorkers: Worker[] = [
  { id: 'w1', name: 'Mario Rossi', skills: [MachineType.INIEZIONE], availability: WorkerAvailability.FULL_TIME },
  { id: 'w2', name: 'Luigi Verdi', skills: [MachineType.SOFFIAGGIO], availability: WorkerAvailability.PART_TIME },
  { id: 'w3', name: 'Giovanni Bianchi', skills: [MachineType.SERIGRAFIA], availability: WorkerAvailability.FULL_TIME },
  { id: 'w4', name: 'Paola Neri', skills: [MachineType.INIEZIONE, MachineType.SOFFIAGGIO], availability: WorkerAvailability.ON_CALL },
];

const initialMachines: Machine[] = [
  { id: 'm1', name: 'Iniezione 1', type: MachineType.INIEZIONE, departmentId: 'dep1' },
  { id: 'm2', name: 'Iniezione 2', type: MachineType.INIEZIONE, departmentId: 'dep1' },
  { id: 'm3', name: 'Soffiaggio 1', type: MachineType.SOFFIAGGIO, departmentId: 'dep1' },
  { id: 'm4', name: 'Vetro 1', type: MachineType.SOFFIAGGIO, departmentId: 'dep2' },
  { id: 'm5', name: 'Serigrafia 1', type: MachineType.SERIGRAFIA, departmentId: 'dep3' },
];

const generateInitialShifts = (): Shift[] => {
    const shifts: Shift[] = [];
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    for (let i = 1; i < 15; i++) {
        const date = new Date(year, month, i);
        const dateStr = format(date, 'yyyy-MM-dd');
        shifts.push({ id: `s${i*3-2}`, date: dateStr, machineId: 'm1', workerId: 'w1', shiftTypeId: ShiftTypeName.MATTINA, departmentId: 'dep1' });
        shifts.push({ id: `s${i*3-1}`, date: dateStr, machineId: 'm3', workerId: 'w2', shiftTypeId: ShiftTypeName.POMERIGGIO, departmentId: 'dep1' });
        shifts.push({ id: `s${i*3}`, date: dateStr, machineId: 'm5', workerId: 'w3', shiftTypeId: ShiftTypeName.NOTTE, departmentId: 'dep3' });
    }
    return shifts;
}


const generateInitialLeaveRequests = (): LeaveRequest[] => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    return [
        { id: 'lr1', workerId: 'w1', startDate: format(new Date(year, month, 20), 'yyyy-MM-dd'), endDate: format(new Date(year, month, 22), 'yyyy-MM-dd'), type: LeaveRequestType.FERIE, status: LeaveRequestStatus.PENDING },
        { id: 'lr2', workerId: 'w2', startDate: format(new Date(year, month, 18), 'yyyy-MM-dd'), endDate: format(new Date(year, month, 18), 'yyyy-MM-dd'), type: LeaveRequestType.PERMESSO, status: LeaveRequestStatus.APPROVED, startTime: '09:00', endTime: '11:00' },
    ];
}

// Helper function to get data from localStorage
const getFromLocalStorage = <T,>(key: string, defaultValue: T): T => {
    try {
        const item = window.localStorage.getItem(key);
        if (item) {
            const parsed = JSON.parse(item);
            // Special handling for history to convert timestamp strings back to Date objects
            if (key === 'history') {
                return parsed.map((entry: any) => ({...entry, timestamp: parseISO(entry.timestamp)})) as T;
            }
            return parsed;
        }
        return defaultValue;
    } catch (error) {
        console.warn(`Error reading localStorage key "${key}":`, error);
        return defaultValue;
    }
};

export const useMockData = (addNotification: AddNotificationFn) => {
    const [departments] = useState<Department[]>(DEPARTMENTS);
    const [machines, setMachines] = useState<Machine[]>(() => getFromLocalStorage('machines', initialMachines));
    const [workers, setWorkers] = useState<Worker[]>(() => getFromLocalStorage('workers', initialWorkers));
    const [shifts, setShifts] = useState<Shift[]>(() => getFromLocalStorage('shifts', generateInitialShifts()));
    const [history, setHistory] = useState<HistoryEntry[]>(() => getFromLocalStorage('history', []));
    const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(() => getFromLocalStorage('leaveRequests', generateInitialLeaveRequests()));
    
    // Effect to save all data to localStorage whenever it changes
    useEffect(() => {
        try {
            localStorage.setItem('machines', JSON.stringify(machines));
            localStorage.setItem('workers', JSON.stringify(workers));
            localStorage.setItem('shifts', JSON.stringify(shifts));
            localStorage.setItem('history', JSON.stringify(history));
            localStorage.setItem('leaveRequests', JSON.stringify(leaveRequests));
        } catch (error) {
            console.error("Failed to save to localStorage", error);
        }
    }, [machines, workers, shifts, history, leaveRequests]);


    const addHistoryEntry = useCallback((description: string) => {
        const newEntry: HistoryEntry = {
            id: `h-${Date.now()}`,
            timestamp: new Date(),
            description,
        };
        setHistory(prev => [newEntry, ...prev]);
    }, []);
    
    const addShift = useCallback((shiftData: Omit<Shift, 'id' | 'departmentId'>) => {
        const machine = machines.find(m => m.id === shiftData.machineId);
        if (!machine) return;

        const newShift: Shift = {
            ...shiftData,
            id: `s-${Date.now()}`,
            departmentId: machine.departmentId,
        };
        setShifts(prev => [...prev, newShift]);
        const worker = workers.find(w => w.id === newShift.workerId);
        addHistoryEntry(`Aggiunto turno per ${worker?.name} su ${machine.name} il ${format(parseISO(newShift.date), 'dd/MM/yyyy')}.`);
        addNotification('Turno aggiunto con successo', 'success');
    }, [machines, workers, addHistoryEntry, addNotification]);

    const deleteShift = useCallback((shiftId: string) => {
        const shiftToDelete = shifts.find(s => s.id === shiftId);
        if (shiftToDelete) {
            const worker = workers.find(w => w.id === shiftToDelete.workerId);
            const machine = machines.find(m => m.id === shiftToDelete.machineId);
            setShifts(prev => prev.filter(s => s.id !== shiftId));
            addHistoryEntry(`Eliminato turno per ${worker?.name} su ${machine?.name} del ${format(parseISO(shiftToDelete.date), 'dd/MM/yyyy')}.`);
            addNotification('Turno eliminato', 'info');
        }
    }, [shifts, workers, machines, addHistoryEntry, addNotification]);

    const updateShift = useCallback((shiftId: string, newDate: string, newMachineId: string) => {
        setShifts(prev => prev.map(s => {
            if (s.id === shiftId) {
                const oldMachine = machines.find(m => m.id === s.machineId);
                const newMachine = machines.find(m => m.id === newMachineId);
                const worker = workers.find(w => w.id === s.workerId);
                addHistoryEntry(`Spostato turno di ${worker?.name} da ${oldMachine?.name} (${format(parseISO(s.date), 'dd/MM/yyyy')}) a ${newMachine?.name} (${format(parseISO(newDate), 'dd/MM/yyyy')}).`);
                return { ...s, date: newDate, machineId: newMachineId, departmentId: newMachine?.departmentId || s.departmentId };
            }
            return s;
        }));
        addNotification('Turno spostato con successo', 'success');
    }, [machines, workers, addHistoryEntry, addNotification]);

    const addWorker = useCallback((workerData: Omit<Worker, 'id'>) => {
        const newWorker: Worker = {
            ...workerData,
            id: `w-${Date.now()}`,
        };
        setWorkers(prev => [...prev, newWorker]);
        addHistoryEntry(`Aggiunto lavoratore: ${newWorker.name}.`);
        addNotification('Lavoratore aggiunto', 'success');
    }, [addHistoryEntry, addNotification]);
    
    const updateWorker = useCallback((workerData: Worker) => {
        setWorkers(prev => prev.map(w => w.id === workerData.id ? workerData : w));
        addHistoryEntry(`Modificato lavoratore: ${workerData.name}.`);
        addNotification('Lavoratore aggiornato', 'success');
    }, [addHistoryEntry, addNotification]);

    const deleteWorker = useCallback((workerId: string) => {
        const worker = workers.find(w => w.id === workerId);
        if (shifts.some(s => s.workerId === workerId)) {
            addNotification('Impossibile eliminare un lavoratore con turni assegnati.', 'error');
            return;
        }
        setWorkers(prev => prev.filter(w => w.id !== workerId));
        addHistoryEntry(`Eliminato lavoratore: ${worker?.name}.`);
        addNotification('Lavoratore eliminato', 'info');
    }, [workers, shifts, addHistoryEntry, addNotification]);
    
    const addMachine = useCallback((machineData: Omit<Machine, 'id'>) => {
        const newMachine: Machine = {
            ...machineData,
            id: `m-${Date.now()}`,
        };
        setMachines(prev => [...prev, newMachine]);
        addHistoryEntry(`Aggiunta macchina: ${newMachine.name}.`);
        addNotification('Macchina aggiunta', 'success');
    }, [addHistoryEntry, addNotification]);

    const updateMachine = useCallback((machineData: Machine) => {
        setMachines(prev => prev.map(m => m.id === machineData.id ? machineData : m));
        addHistoryEntry(`Modificata macchina: ${machineData.name}.`);
        addNotification('Macchina aggiornata', 'success');
    }, [addHistoryEntry, addNotification]);
    
    const deleteMachine = useCallback((machineId: string) => {
        const machine = machines.find(m => m.id === machineId);
        if (shifts.some(s => s.machineId === machineId)) {
            addNotification('Impossibile eliminare una macchina con turni pianificati.', 'error');
            return;
        }
        setMachines(prev => prev.filter(m => m.id !== machineId));
        addHistoryEntry(`Eliminata macchina: ${machine?.name}.`);
        addNotification('Macchina eliminata', 'info');
    }, [machines, shifts, addHistoryEntry, addNotification]);

    const addLeaveRequest = useCallback((requestData: Omit<LeaveRequest, 'id' | 'status'>) => {
        const newRequest: LeaveRequest = {
            ...requestData,
            id: `lr-${Date.now()}`,
            status: LeaveRequestStatus.PENDING
        };
        setLeaveRequests(prev => [newRequest, ...prev]);
        const worker = workers.find(w => w.id === newRequest.workerId);
        addHistoryEntry(`Aggiunta richiesta ferie/permesso per ${worker?.name}.`);
        addNotification('Richiesta inviata', 'success');
    }, [workers, addHistoryEntry, addNotification]);

    const updateLeaveRequestStatus = useCallback((requestId: string, status: LeaveRequestStatus) => {
        setLeaveRequests(prev => prev.map(r => r.id === requestId ? { ...r, status } : r));
        const request = leaveRequests.find(r => r.id === requestId);
        const worker = workers.find(w => w.id === request?.workerId);
        addHistoryEntry(`Stato richiesta per ${worker?.name} aggiornato a ${status}.`);
        addNotification('Stato richiesta aggiornato', 'info');
    }, [leaveRequests, workers, addHistoryEntry, addNotification]);

    return { departments, machines, workers, shifts, history, leaveRequests, addShift, deleteShift, updateShift, addWorker, updateWorker, deleteWorker, addMachine, updateMachine, deleteMachine, addLeaveRequest, updateLeaveRequestStatus };
};