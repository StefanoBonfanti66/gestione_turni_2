
import { ShiftTypeName, ShiftType, Department, DepartmentName, MachineType, WorkerAvailability } from './types';

export const SHIFT_TYPES: Record<ShiftTypeName, ShiftType> = {
  [ShiftTypeName.MATTINA]: {
    id: ShiftTypeName.MATTINA,
    name: 'Mattina',
    startTime: '06:00',
    endTime: '14:00',
    color: 'sky',
  },
  [ShiftTypeName.POMERIGGIO]: {
    id: ShiftTypeName.POMERIGGIO,
    name: 'Pomeriggio',
    startTime: '14:00',
    endTime: '22:00',
    color: 'amber',
  },
  [ShiftTypeName.NOTTE]: {
    id: ShiftTypeName.NOTTE,
    name: 'Notte',
    startTime: '22:00',
    endTime: '06:00',
    color: 'indigo',
  },
};

export const MACHINE_TYPES: MachineType[] = [
  MachineType.INIEZIONE,
  MachineType.SOFFIAGGIO,
  MachineType.SERIGRAFIA,
];

export const WORKER_AVAILABILITY_TYPES: WorkerAvailability[] = [
    WorkerAvailability.FULL_TIME,
    WorkerAvailability.PART_TIME,
    WorkerAvailability.ON_CALL,
];

export const DEPARTMENTS: Department[] = [
    { id: 'dep1', name: DepartmentName.PLASTICA },
    { id: 'dep2', name: DepartmentName.VETRO },
    { id: 'dep3', name: DepartmentName.SERIGRAFIA },
];