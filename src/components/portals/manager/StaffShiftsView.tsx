import React, { useState } from 'react';
import { useSangira } from '../../../context/SangiraContext';
import { Role } from '../../../types';
import {
  Users,
  Clock,
  UserCheck,
  UserX,
  Search,
  Plus,
  Shield,
  CheckCircle,
  X,
  Calendar,
} from 'lucide-react';

export const StaffShiftsView: React.FC = () => {
  const { employees, shifts, clockInShift, clockOutShift } = useSangira();
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('all');

  const filtered = employees.filter((e) => {
    const matchesSearch =
      e.fullName.toLowerCase().includes(search.toLowerCase()) ||
      e.employeeId.toLowerCase().includes(search.toLowerCase()) ||
      e.department.toLowerCase().includes(search.toLowerCase());
    const matchesDept = filterDept === 'all' || e.department === filterDept;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-4">
        <div>
          <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">
            Workforce & Floor Attendance
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900 dark:text-stone-100">
            Staff Directory & Shift Management
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Monitor on-duty status across dining service, kitchen brigade, bar, and inventory controllers.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Search staff or role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white dark:bg-[#121614] rounded-2xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 dark:bg-stone-900/50 text-stone-500 uppercase text-[10px] tracking-wider border-b border-stone-200 dark:border-stone-800">
              <tr>
                <th className="py-3 px-4">Employee ID</th>
                <th className="py-3 px-4">Full Name</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Assigned Roles</th>
                <th className="py-3 px-4">Shift Status</th>
                <th className="py-3 px-4">Last Activity</th>
                <th className="py-3 px-4 text-right">Shift Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60">
              {filtered.map((emp) => (
                <tr key={emp.id} className="hover:bg-stone-50/60 dark:hover:bg-stone-800/30 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-stone-900 dark:text-stone-100">
                    {emp.employeeId}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-stone-900 dark:text-stone-100">
                    {emp.fullName}
                    <div className="text-[11px] text-stone-400 font-normal">{emp.email}</div>
                  </td>
                  <td className="py-3.5 px-4 text-stone-700 dark:text-stone-300">
                    {emp.department}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex flex-wrap gap-1">
                      {emp.roles.map((r, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700"
                        >
                          {r}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    {emp.shiftStatus === 'on_duty' ? (
                      <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1.5 text-[11px]">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span> On Duty
                      </span>
                    ) : (
                      <span className="text-stone-400 font-medium flex items-center gap-1.5 text-[11px]">
                        <span className="w-2 h-2 rounded-full bg-stone-400"></span> Off Duty
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-stone-500 font-mono text-[11px]">
                    {emp.lastActivity}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {emp.shiftStatus === 'on_duty' ? (
                      <button
                        onClick={() => clockOutShift(emp.id)}
                        className="px-3 py-1 rounded-lg border border-rose-300 text-rose-700 hover:bg-rose-50 text-[11px] font-semibold transition-colors"
                      >
                        End Shift
                      </button>
                    ) : (
                      <button
                        onClick={() => clockInShift(emp.id, emp.fullName, emp.department, emp.roles[0])}
                        className="px-3 py-1 rounded-lg bg-emerald-900 dark:bg-emerald-700 text-white hover:bg-emerald-800 text-[11px] font-semibold transition-colors"
                      >
                        Start Shift
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
