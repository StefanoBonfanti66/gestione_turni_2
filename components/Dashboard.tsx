
import React, { useMemo } from 'react';
import { Shift, Worker, Department, Machine } from '../types';
import { SHIFT_TYPES } from '../constants';

// Fix: Declare Recharts on the window object to resolve TypeScript error.
declare global {
    interface Window {
        Recharts: any;
    }
}

interface DashboardProps {
  shifts: Shift[];
  workers: Worker[];
  departments: Department[];
  machines: Machine[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export const Dashboard: React.FC<DashboardProps> = ({ shifts, workers, departments, machines }) => {
    
    if (!window.Recharts) {
        return <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">Loading charts...</div>;
    }
    const { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } = window.Recharts;

    const stats = useMemo(() => {
        const totalShifts = shifts.length;
        const totalWorkers = workers.length;
        const totalMachines = machines.length;
        return { totalShifts, totalWorkers, totalMachines };
    }, [shifts, workers, machines]);

    const shiftsByDepartment = useMemo(() => {
        const counts = departments.map(dep => ({
            name: dep.name,
            value: shifts.filter(s => s.departmentId === dep.id).length
        }));
        return counts.filter(c => c.value > 0);
    }, [shifts, departments]);

    const hoursByWorker = useMemo(() => {
        return workers.map(worker => {
            const workerShifts = shifts.filter(s => s.workerId === worker.id);
            // Each shift is 8 hours
            const totalHours = workerShifts.length * 8;
            return { name: worker.name, ore: totalHours };
        }).filter(w => w.ore > 0).sort((a,b) => b.ore - a.ore);
    }, [shifts, workers]);

    const shiftsByMachine = useMemo(() => {
        return machines.map(machine => ({
            name: machine.name,
            turni: shifts.filter(s => s.machineId === machine.id).length
        })).filter(m => m.turni > 0).sort((a,b) => b.turni - a.turni);
    }, [shifts, machines]);
    
    const StatCard: React.FC<{ title: string; value: number | string; }> = ({ title, value }) => (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
            <p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">{value}</p>
        </div>
    );

    return (
        <div className="p-4 sm:p-6 space-y-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard Riepilogativa</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard title="Turni totali registrati" value={stats.totalShifts} />
                <StatCard title="Lavoratori attivi" value={stats.totalWorkers} />
                <StatCard title="Macchine operative" value={stats.totalMachines} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md h-96">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Ore per Lavoratore</h2>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={hoursByWorker} margin={{ top: 5, right: 20, left: -10, bottom: 50 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                            <XAxis dataKey="name" angle={-45} textAnchor="end" interval={0} style={{ fontSize: '12px' }}/>
                            <YAxis />
                            <Tooltip wrapperClassName="!bg-white dark:!bg-gray-700 !border-gray-300 dark:!border-gray-600 rounded-md shadow-lg" />
                            <Legend />
                            <Bar dataKey="ore" fill="#8884d8" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md h-96">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Turni per Reparto</h2>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={shiftsByDepartment} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120} fill="#8884d8" label>
                                {shiftsByDepartment.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip wrapperClassName="!bg-white dark:!bg-gray-700 !border-gray-300 dark:!border-gray-600 rounded-md shadow-lg" />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
             <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md h-96">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Utilizzo Macchine (numero di turni)</h2>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={shiftsByMachine} layout="vertical" margin={{ top: 5, right: 30, left: 70, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                            <XAxis type="number" />
                            <YAxis type="category" dataKey="name" width={150} style={{ fontSize: '12px' }}/>
                            <Tooltip wrapperClassName="!bg-white dark:!bg-gray-700 !border-gray-300 dark:!border-gray-600 rounded-md shadow-lg" />
                            <Legend />
                            <Bar dataKey="turni" fill="#82ca9d" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
        </div>
    );
};