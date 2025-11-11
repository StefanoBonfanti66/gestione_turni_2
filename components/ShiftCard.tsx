import React from 'react';
import { Shift, Worker, ShiftTypeName } from '../types';
import { SHIFT_TYPES } from '../constants';
import { classNames } from '../utils/helpers';
import { TrashIcon } from './icons/TrashIcon';

interface ShiftCardProps {
  shift: Shift;
  worker?: Worker;
  onDelete: (shiftId: string) => void;
}

export const ShiftCard: React.FC<ShiftCardProps> = ({ shift, worker, onDelete }) => {
  const shiftType = SHIFT_TYPES[shift.shiftTypeId as ShiftTypeName];

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.stopPropagation(); // Prevent triggering cell's onClick
    e.dataTransfer.setData('shiftId', shift.id);
  };
  
  if (!worker || !shiftType) {
    return null;
  }

  const color = shiftType.color;

  const handleDelete = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); // Prevent the click from bubbling up to the table cell
    onDelete(shift.id);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className={classNames(
        'p-1.5 rounded-md border text-xs cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-shadow duration-200 relative group',
        `bg-${color}-200`,
        `text-${color}-800`,
        `border-${color}-300`,
        `dark:bg-${color}-700`,
        `dark:text-${color}-100`,
        `dark:border-${color}-600`
      )}
    >
      <p className="font-bold truncate">{worker.name}</p>
      <p className="text-xs truncate">{shiftType.name}</p>
      <button 
        onClick={handleDelete}
        className="absolute top-0.5 right-0.5 p-0.5 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
        aria-label="Elimina turno"
        >
          <TrashIcon className="h-3 w-3" />
      </button>
    </div>
  );
};