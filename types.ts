
export enum ShiftTypeName {
  MATTINA = 'mattina',
  POMERIGGIO = 'pomeriggio',
  NOTTE = 'notte',
}

export interface ShiftType {
  id: ShiftTypeName;
  name: string;
  startTime: string;
  endTime: string;
  color: string;
}

export enum DepartmentName {
  PLASTICA = 'Plastica',
  VETRO = 'Vetro',
  SERIGRAFIA = 'Serigrafia',
}

export interface Department {
  id: string;
  name: DepartmentName;
}

export enum MachineType {
  INIEZIONE = 'Iniezione',
  SOFFIAGGIO = 'Soffiaggio',
  SERIGRAFIA = 'Serigrafia',
}

export interface Machine {
  id: string;
  name: string;
  type: MachineType;
  departmentId: string;
}

export enum WorkerAvailability {
    FULL_TIME = 'Full-time',
    PART_TIME = 'Part-time',
    ON_CALL = 'A chiamata',
}

export interface Worker {
  id: string;
  name: string;
  skills: MachineType[];
  availability: WorkerAvailability;
}

export interface Shift {
  id: string;
  date: string; // 'yyyy-MM-dd'
  machineId: string;
  workerId: string;
  shiftTypeId: ShiftTypeName;
  departmentId: string;
}

export interface HistoryEntry {
  id: string;
  timestamp: Date;
  description: string;
}

export type View = 'calendar' | 'dashboard' | 'anagraphics' | 'requests' | 'history';

export enum LeaveRequestType {
    FERIE = 'Ferie',
    PERMESSO = 'Permesso',
    MALATTIA = 'Malattia',
}

export enum LeaveRequestStatus {
    PENDING = 'In attesa',
    APPROVED = 'Approvata',
    REJECTED = 'Rifiutata',
}

export interface LeaveRequest {
    id: string;
    workerId: string;
    startDate: string;
    endDate: string;
    type: LeaveRequestType;
    status: LeaveRequestStatus;
    notes?: string;
    startTime?: string; // e.g., '09:00'
    endTime?: string;   // e.g., '10:00'
}