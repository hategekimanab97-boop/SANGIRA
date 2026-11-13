import React, { useState } from 'react';
import { useSangira } from '../../../context/SangiraContext';
import { HotelRoom, HotelReservation } from '../../../types';
import {
  BedDouble,
  CheckCircle,
  Clock,
  Sparkles,
  AlertTriangle,
  UserCheck,
  Calendar,
  Search,
  ArrowRight,
  Shield,
} from 'lucide-react';

export const HotelOperationsView: React.FC = () => {
  const {
    hotelRooms,
    reservations,
    updateRoomHousekeeping,
    checkInReservation,
    checkOutReservation,
  } = useSangira();

  const [activeSubTab, setActiveSubTab] = useState<'rooms' | 'reservations' | 'housekeeping'>('rooms');
  const [selectedRoom, setSelectedRoom] = useState<HotelRoom | null>(null);

  // Computed Room Stats
  const availableRooms = hotelRooms.filter((r) => r.status === 'available').length;
  const occupiedRooms = hotelRooms.filter((r) => r.status === 'occupied').length;
  const cleaningRooms = hotelRooms.filter((r) => r.status === 'cleaning').length;
  const maintenanceRooms = hotelRooms.filter((r) => r.status === 'maintenance').length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-4">
        <div>
          <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">
            Hospitality Accommodations
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <BedDouble className="w-6 h-6 text-emerald-800 dark:text-emerald-400" />
            <span>Hotel Operations & Front Desk</span>
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Manage room statuses, guest folios, arrival check-ins, and housekeeping cleaning cycles.
          </p>
        </div>

        {/* Tab switch pills */}
        <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-900 p-1 rounded-xl text-xs font-semibold overflow-x-auto scrollbar-none max-w-full">
          <button
            onClick={() => setActiveSubTab('rooms')}
            className={`min-h-[36px] px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeSubTab === 'rooms'
                ? 'bg-white dark:bg-stone-800 text-emerald-950 dark:text-emerald-300 shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            Room Status Board
          </button>
          <button
            onClick={() => setActiveSubTab('reservations')}
            className={`min-h-[36px] px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeSubTab === 'reservations'
                ? 'bg-white dark:bg-stone-800 text-emerald-950 dark:text-emerald-300 shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            Reservations & Check-In
          </button>
          <button
            onClick={() => setActiveSubTab('housekeeping')}
            className={`min-h-[36px] px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeSubTab === 'housekeeping'
                ? 'bg-white dark:bg-stone-800 text-emerald-950 dark:text-emerald-300 shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            Housekeeping Inspection
          </button>
        </div>
      </div>

      {/* KPI Room Counts */}
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#121614] shadow-xs">
          <div className="text-xs text-stone-500 font-medium">Available Rooms</div>
          <div className="text-2xl font-bold font-mono text-emerald-700 dark:text-emerald-400 mt-1 tabular-nums">
            {availableRooms}
          </div>
          <div className="text-[11px] text-stone-400 mt-0.5">Clean & ready for check-in</div>
        </div>

        <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#121614] shadow-xs">
          <div className="text-xs text-stone-500 font-medium">Occupied Rooms</div>
          <div className="text-2xl font-bold font-mono text-blue-700 dark:text-blue-400 mt-1 tabular-nums">
            {occupiedRooms}
          </div>
          <div className="text-[11px] text-stone-400 mt-0.5">Active checked-in guests</div>
        </div>

        <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#121614] shadow-xs">
          <div className="text-xs text-stone-500 font-medium">Cleaning In Progress</div>
          <div className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-1 tabular-nums">
            {cleaningRooms}
          </div>
          <div className="text-[11px] text-stone-400 mt-0.5">Turnaround turnover</div>
        </div>

        <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#121614] shadow-xs">
          <div className="text-xs text-stone-500 font-medium">Under Maintenance</div>
          <div className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400 mt-1 tabular-nums">
            {maintenanceRooms}
          </div>
          <div className="text-[11px] text-stone-400 mt-0.5">Requires engineering sign-off</div>
        </div>
      </div>

      {/* Sub-View: Room Status Grid */}
      {activeSubTab === 'rooms' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100">
              Visual Room Status Grid
            </h3>
            <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Available</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Occupied</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Cleaning</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Maintenance</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {hotelRooms.map((room) => {
              const isOccupied = room.status === 'occupied';
              const isCleaning = room.status === 'cleaning';
              const isMaint = room.status === 'maintenance';

              return (
                <div
                  key={room.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    isOccupied
                      ? 'border-blue-200 dark:border-blue-900/60 bg-blue-50/30 dark:bg-blue-950/20'
                      : isCleaning
                      ? 'border-amber-200 dark:border-amber-900/60 bg-amber-50/30 dark:bg-amber-950/20'
                      : isMaint
                      ? 'border-rose-200 dark:border-rose-900/60 bg-rose-50/30 dark:bg-rose-950/20'
                      : 'border-emerald-200 dark:border-emerald-900/60 bg-white dark:bg-[#121614]'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-xs text-stone-500">Floor {room.floor} · {room.type.toUpperCase()}</span>
                      <h4 className="text-xl font-bold font-mono text-stone-900 dark:text-stone-100">
                        Room {room.roomNumber}
                      </h4>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        isOccupied
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                          : isCleaning
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : isMaint
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      }`}
                    >
                      {room.status}
                    </span>
                  </div>

                  <div className="my-3 py-2 border-y border-stone-200/50 dark:border-stone-800/60 text-xs space-y-1">
                    {room.guestName ? (
                      <div>
                        <span className="text-stone-400 text-[10px] uppercase font-bold">Current Guest:</span>
                        <div className="font-semibold text-stone-900 dark:text-stone-100">{room.guestName}</div>
                        <div className="text-[11px] text-stone-500">Departs: {room.checkOut}</div>
                      </div>
                    ) : (
                      <div>
                        <span className="text-stone-400 text-[10px] uppercase font-bold">Standard Rate:</span>
                        <div className="font-mono font-semibold text-stone-800 dark:text-stone-200">
                          {room.pricePerNight.toLocaleString()} RWF / night
                        </div>
                      </div>
                    )}
                    {room.maintenanceAlert && (
                      <div className="text-[11px] text-rose-600 font-medium flex items-center gap-1 pt-1">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        <span>{room.maintenanceAlert}</span>
                      </div>
                    )}
                  </div>

                  {/* Quick Housekeeping Action */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-[11px] text-stone-500 capitalize">
                      Cleaning: {room.housekeepingStatus.replace(/_/g, ' ')}
                    </span>
                    <button
                      onClick={() =>
                        updateRoomHousekeeping(
                          room.id,
                          room.housekeepingStatus === 'clean' ? 'needs_cleaning' : 'clean'
                        )
                      }
                      className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 transition-colors"
                    >
                      {room.housekeepingStatus === 'clean' ? 'Mark Dirty' : 'Mark Clean'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Sub-View: Reservations & Check-in / Out Folios */}
      {activeSubTab === 'reservations' && (
        <div className="bg-white dark:bg-[#121614] rounded-2xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
            <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100">
              Front Desk Guest Reservations & Folios
            </h3>
            <span className="text-xs text-stone-500 font-mono">
              {reservations.length} Bookings
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 dark:bg-stone-900/50 text-stone-500 uppercase text-[10px] tracking-wider border-b border-stone-200 dark:border-stone-800">
                <tr>
                  <th className="py-3 px-4">Reservation #</th>
                  <th className="py-3 px-4">Guest Details</th>
                  <th className="py-3 px-4">Assigned Room</th>
                  <th className="py-3 px-4">Dates</th>
                  <th className="py-3 px-4">Folio Total</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Front Desk Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60">
                {reservations.map((res) => (
                  <tr key={res.id} className="hover:bg-stone-50/60 dark:hover:bg-stone-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-950 dark:text-emerald-300">
                      {res.reservationNumber}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-stone-900 dark:text-stone-100">
                      {res.guestName}
                      <div className="text-[11px] text-stone-400 font-mono font-normal">{res.guestEmail}</div>
                    </td>
                    <td className="py-3.5 px-4 font-bold font-mono text-stone-800 dark:text-stone-200">
                      Room {res.roomNumber} ({res.roomType})
                    </td>
                    <td className="py-3.5 px-4 text-stone-600 dark:text-stone-300 font-mono text-[11px]">
                      {res.checkIn} → {res.checkOut}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold tabular-nums text-stone-900 dark:text-stone-100">
                      {res.totalAmount.toLocaleString()} RWF
                    </td>
                    <td className="py-3.5 px-4 capitalize font-semibold">
                      {res.status === 'checked_in' && (
                        <span className="text-emerald-700 dark:text-emerald-400">Checked In</span>
                      )}
                      {res.status === 'confirmed' && (
                        <span className="text-blue-700 dark:text-blue-400">Confirmed Arrival</span>
                      )}
                      {res.status === 'checked_out' && (
                        <span className="text-stone-400">Checked Out</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {res.status === 'confirmed' && (
                        <button
                          onClick={() => checkInReservation(res.id)}
                          className="px-3 py-1 rounded-lg bg-emerald-900 dark:bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-[11px] transition-colors"
                        >
                          Check In Guest
                        </button>
                      )}
                      {res.status === 'checked_in' && (
                        <button
                          onClick={() => checkOutReservation(res.id)}
                          className="px-3 py-1 rounded-lg border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 font-semibold text-[11px] transition-colors"
                        >
                          Check Out & Settle
                        </button>
                      )}
                      {res.status === 'checked_out' && (
                        <span className="text-stone-400 text-[11px] italic">Folio Closed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sub-View: Housekeeping Inspection */}
      {activeSubTab === 'housekeeping' && (
        <div className="bg-white dark:bg-[#121614] rounded-2xl border border-stone-200 dark:border-stone-800 p-4 sm:p-6 space-y-4 shadow-xs">
          <div className="border-b border-stone-200 dark:border-stone-800 pb-3">
            <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100">
              Housekeeping Inspection Checklist
            </h3>
            <p className="text-xs text-stone-500">
              Authorized supervisors inspect cleaned rooms before unlocking them for guest arrival.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {hotelRooms.map((room) => (
              <div
                key={room.id}
                className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="font-bold text-sm text-stone-900 dark:text-stone-100">
                    Room {room.roomNumber} ({room.type.toUpperCase()})
                  </div>
                  <div className="text-stone-500 capitalize mt-0.5">
                    Current: <strong className="text-stone-800 dark:text-stone-200">{room.housekeepingStatus.replace(/_/g, ' ')}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => updateRoomHousekeeping(room.id, 'inspected')}
                    className="px-3 py-1.5 rounded-lg bg-emerald-900 dark:bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs transition-colors flex items-center gap-1"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Approve & Lock</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
