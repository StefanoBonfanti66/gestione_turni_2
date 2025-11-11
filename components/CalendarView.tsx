import React, { useState, useMemo } from 'react';
// FIX: Replaced date-fns default imports from sub-paths with named imports from the main package and locale to resolve "not callable" type errors.
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isToday } from 'date-fns';
import { it } from 'date-fns/locale';
import { Shift, Machine, Worker, Department, DepartmentName, ShiftTypeName } from '../types';
import { ShiftCard } from './ShiftCard';
import { AddShiftModal } from './AddShiftModal';
import { classNames } from '../utils/helpers';
import { DEPARTMENTS } from '../constants';

interface CalendarViewProps {
  shifts: Shift[];
  machines: Machine[];
  workers: Worker[];
  departments: Department[];
  onUpdateShift: (shiftId: string, newDate: string, newMachineId: string) => void;
  onAddShift: (shiftData: Omit<Shift, 'id'| 'departmentId'>) => void;
  onDeleteShift: (shiftId: string) => void;
}

const WEEKDAYS = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];

export const CalendarView: React.FC<CalendarViewProps> = ({ shifts, machines, workers, onUpdateShift, onAddShift, onDeleteShift }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDepartment, setSelectedDepartment] = useState<DepartmentName>(DepartmentName.PLASTICA);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContext, setModalContext] = useState<{date: Date, machine: Machine} | null>(null);

  const daysInMonth = useMemo(() => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  const filteredMachines = useMemo(() => {
      const department = DEPARTMENTS.find(d => d.name === selectedDepartment);
      if (!department) return [];
      return machines.filter(m => m.departmentId === department.id).sort((a, b) => a.name.localeCompare(b.name));
  }, [machines, selectedDepartment]);

  const handleDrop = (e: React.DragEvent<HTMLTableCellElement>, date: Date, machineId: string) => {
    e.preventDefault();
    const shiftId = e.dataTransfer.getData('shiftId');
    if (shiftId) {
      onUpdateShift(shiftId, format(date, 'yyyy-MM-dd'), machineId);
    }
  };
  
  const handleOpenAddModal = (date: Date, machine: Machine) => {
      setModalContext({date, machine});
      setIsModalOpen(true);
  };

  const handleSaveShift = (data: { workerId: string; shiftTypeId: ShiftTypeName; }) => {
    if (modalContext) {
        onAddShift({
            date: format(modalContext.date, 'yyyy-MM-dd'),
            machineId: modalContext.machine.id,
            ...data
        });
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLTableCellElement>) => {
    e.preventDefault();
  };
  
  const changeMonth = (amount: number) => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + amount, 1));
  };

  return (
    <>
      <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-lg h-full flex flex-col">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
          <div className="flex items-center">
            <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition">&lt;</button>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100 mx-4 w-48 text-center">{format(currentDate, 'MMMM yyyy', { locale: it })}</h2>
            <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition">&gt;</button>
          </div>
          <div className="flex flex-wrap gap-2">
              {DEPARTMENTS.map(dep => (
                  <button key={dep.id} onClick={() => setSelectedDepartment(dep.name)} className={classNames(
                      'px-3 py-1.5 text-sm font-medium rounded-md transition',
                      selectedDepartment === dep.name 
                          ? 'bg-blue-600 text-white shadow' 
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                  )}>
                      {dep.name}
                  </button>
              ))}
          </div>
        </div>
        
        <div className="flex-grow overflow-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-900 p-2 border-b border-gray-200 dark:border-gray-700 text-left text-sm font-semibold text-gray-600 dark:text-gray-300 w-48">Macchina</th>
                {daysInMonth.map(day => (
                  <th key={day.toString()} className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-900 p-2 border-b border-gray-200 dark:border-gray-700 text-center text-sm font-semibold text-gray-600 dark:text-gray-300 min-w-[80px]">
                    <div className={classNames(isToday(day) ? 'text-blue-600 dark:text-blue-400' : '')}>
                      <div>{WEEKDAYS[getDay(day)]}</div>
                      <div>{format(day, 'd')}</div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredMachines.map((machine) => (
                <tr key={machine.id} className="border-b border-gray-200 dark:border-gray-700">
                  <td className="p-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-900 sticky left-0">{machine.name}</td>
                  {daysInMonth.map(day => {
                    const dayShifts = shifts.filter(s => s.machineId === machine.id && s.date === format(day, 'yyyy-MM-dd'));
                    return (
                      <td key={day.toString()} 
                          className={classNames(
                              "p-1 border-l border-gray-200 dark:border-gray-700 align-top min-w-[80px] h-24 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer",
                              isToday(day) ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                          )}
                          onDrop={(e) => handleDrop(e, day, machine.id)}
                          onDragOver={handleDragOver}
                          onClick={() => handleOpenAddModal(day, machine)}
                      >
                        <div className="flex flex-col gap-1">
                          {dayShifts.map(shift => (
                            <ShiftCard key={shift.id} shift={shift} worker={workers.find(w => w.id === shift.workerId)} onDelete={onDeleteShift}/>
                          ))}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <AddShiftModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSaveShift}
        machine={modalContext?.machine || null} 
        workers={workers}
      />
    </>
  );
};