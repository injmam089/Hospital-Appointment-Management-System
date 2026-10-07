import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Clock, Calendar as CalendarIcon, Coffee, Plus,
  Trash2, Save, CheckCircle2, Ban, RefreshCw,
  Sun, Moon, Shield, CalendarDays
} from 'lucide-react';
import toast from 'react-hot-toast';
import { scheduleApi, type CreateLeavePayload } from '../../api/schedule';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { extractApiError } from '../../api/client';
import type {
  DayOfWeek,
  DayAvailability,
  DoctorLeave,
  DoctorDaySlots,
  TimeSlotDto
} from '../../types';

const DAYS_OF_WEEK: DayOfWeek[] = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY'
];

const SLOT_DURATIONS = [15, 20, 30, 45, 60];

export function DoctorSchedulePage() {
  const [activeTab, setActiveTab] = useState<'schedule' | 'leaves'>('schedule');

  // Schedule State
  const [schedule, setSchedule] = useState<DayAvailability[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Preview State
  const [previewDate, setPreviewDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [previewSlots, setPreviewSlots] = useState<DoctorDaySlots | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  // Leaves State
  const [leaves, setLeaves] = useState<DoctorLeave[]>([]);
  const [leaveForm, setLeaveForm] = useState<CreateLeavePayload>({
    startDate: '',
    endDate: '',
    reason: '',
  });
  const [isSubmittingLeave, setIsSubmittingLeave] = useState(false);

  useEffect(() => {
    fetchSchedule();
    fetchLeaves();
  }, []);

  useEffect(() => {
    if (previewDate) {
      fetchSlotPreview(previewDate);
    }
  }, [previewDate]);

  const fetchSchedule = async () => {
    setIsLoading(true);
    try {
      const data = await scheduleApi.getOwnSchedule();
      setSchedule(data.schedule);
    } catch (err) {
      toast.error(extractApiError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLeaves = async () => {
    try {
      const data = await scheduleApi.getOwnLeaves();
      setLeaves(data);
    } catch (err) {
      // Non-blocking
    }
  };

  const fetchSlotPreview = async (date: string) => {
    setIsPreviewLoading(true);
    try {
      const data = await scheduleApi.previewOwnSlots(date);
      setPreviewSlots(data);
    } catch (err) {
      // Preview error silently handled or badge
      setPreviewSlots(null);
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const handleDayToggle = (day: DayOfWeek) => {
    setSchedule(prev =>
      prev.map(item => {
        if (item.dayOfWeek === day) {
          const newActive = !item.active;
          return {
            ...item,
            active: newActive,
            startTime: newActive && !item.startTime ? '09:00' : item.startTime,
            endTime: newActive && !item.endTime ? '17:00' : item.endTime,
          };
        }
        return item;
      })
    );
  };

  const handleTimeChange = (day: DayOfWeek, field: 'startTime' | 'endTime', value: string) => {
    setSchedule(prev =>
      prev.map(item => {
        if (item.dayOfWeek === day) {
          return { ...item, [field]: value };
        }
        return item;
      })
    );
  };

  const handleDurationChange = (day: DayOfWeek, duration: number) => {
    setSchedule(prev =>
      prev.map(item => {
        if (item.dayOfWeek === day) {
          return { ...item, slotDurationMins: duration };
        }
        return item;
      })
    );
  };

  const handleAddBreak = (day: DayOfWeek) => {
    setSchedule(prev =>
      prev.map(item => {
        if (item.dayOfWeek === day) {
          const currentBreaks = item.breaks || [];
          return {
            ...item,
            breaks: [
              ...currentBreaks,
              { startTime: '13:00', endTime: '14:00' }
            ]
          };
        }
        return item;
      })
    );
  };

  const handleUpdateBreak = (day: DayOfWeek, index: number, field: 'startTime' | 'endTime', value: string) => {
    setSchedule(prev =>
      prev.map(item => {
        if (item.dayOfWeek === day) {
          const newBreaks = [...item.breaks];
          newBreaks[index] = { ...newBreaks[index], [field]: value };
          return { ...item, breaks: newBreaks };
        }
        return item;
      })
    );
  };

  const handleRemoveBreak = (day: DayOfWeek, index: number) => {
    setSchedule(prev =>
      prev.map(item => {
        if (item.dayOfWeek === day) {
          return {
            ...item,
            breaks: item.breaks.filter((_, i) => i !== index)
          };
        }
        return item;
      })
    );
  };

  const handleSaveSchedule = async () => {
    // Client-side quick check
    for (const item of schedule) {
      if (item.active) {
        if (!item.startTime || !item.endTime) {
          toast.error(`Please specify working hours for ${item.dayOfWeek}`);
          return;
        }
        if (item.startTime >= item.endTime) {
          toast.error(`End time must be after start time for ${item.dayOfWeek}`);
          return;
        }
        for (const b of item.breaks || []) {
          if (b.startTime >= b.endTime) {
            toast.error(`Break end time must be after start time on ${item.dayOfWeek}`);
            return;
          }
          if (b.startTime < item.startTime || b.endTime > item.endTime) {
            toast.error(`Break (${b.startTime} - ${b.endTime}) must be within working hours on ${item.dayOfWeek}`);
            return;
          }
        }
      }
    }

    setIsSaving(true);
    try {
      const updated = await scheduleApi.updateOwnSchedule(schedule);
      setSchedule(updated.schedule);
      toast.success('Weekly consultation schedule saved successfully!');
      fetchSlotPreview(previewDate);
    } catch (err) {
      toast.error(extractApiError(err));
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveForm.startDate || !leaveForm.endDate) {
      toast.error('Start date and end date are required');
      return;
    }
    if (leaveForm.endDate < leaveForm.startDate) {
      toast.error('End date cannot be earlier than start date');
      return;
    }

    setIsSubmittingLeave(true);
    try {
      await scheduleApi.createOwnLeave(leaveForm);
      toast.success('Leave recorded successfully. Slots blocked for this period.');
      setLeaveForm({ startDate: '', endDate: '', reason: '' });
      fetchLeaves();
      fetchSlotPreview(previewDate);
    } catch (err) {
      toast.error(extractApiError(err));
    } finally {
      setIsSubmittingLeave(false);
    }
  };

  const handleCancelLeave = async (leaveId: number) => {
    try {
      await scheduleApi.cancelOwnLeave(leaveId);
      toast.success('Leave cancelled. Available slots restored.');
      fetchLeaves();
      fetchSlotPreview(previewDate);
    } catch (err) {
      toast.error(extractApiError(err));
    }
  };

  return (
    <div className="min-h-screen bg-surface">
      {/* Top Bar */}
      <header className="bg-white border-b border-border sticky top-0 z-20 shadow-sm">
        <div className="page-container py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              to="/doctor/dashboard"
              className="p-2 rounded-xl text-muted hover:text-navy hover:bg-surface transition-colors"
              title="Return to Doctor Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display font-bold text-navy text-xl">Schedule & Availability</h1>
                <Badge variant="green" dot>Active Planner</Badge>
              </div>
              <p className="text-xs text-muted">Weekly consultation hours, slot durations, breaks, and leaves</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              isLoading={isSaving}
              leftIcon={<Save className="w-4 h-4" />}
              onClick={handleSaveSchedule}
            >
              Save Schedule
            </Button>
          </div>
        </div>
      </header>

      <main className="page-container py-8">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-3 border-b border-border mb-8">
          <button
            onClick={() => setActiveTab('schedule')}
            className={`pb-3 text-sm font-semibold transition-all relative ${
              activeTab === 'schedule'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-muted hover:text-navy'
            }`}
          >
            <div className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4" />
              Weekly Clinic Hours & Breaks
            </div>
          </button>
          <button
            onClick={() => setActiveTab('leaves')}
            className={`pb-3 text-sm font-semibold transition-all relative ${
              activeTab === 'leaves'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-muted hover:text-navy'
            }`}
          >
            <div className="flex items-center gap-2">
              <Ban className="w-4 h-4" />
              Doctor Leaves & Absence ({leaves.length})
            </div>
          </button>
        </div>

        {activeTab === 'schedule' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left 7 Cols: Weekly Schedule Editor */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h2 className="font-display font-semibold text-navy text-base">Weekly Working Plan</h2>
                  <p className="text-xs text-muted">Configure clinic hours and break intervals for each weekday</p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<Save className="w-4 h-4" />}
                  isLoading={isSaving}
                  onClick={handleSaveSchedule}
                >
                  Save Changes
                </Button>
              </div>

              {isLoading ? (
                <div className="card p-12 text-center">
                  <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-sm text-muted">Loading schedule settings...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {DAYS_OF_WEEK.map(dayName => {
                    const dayConfig = schedule.find(s => s.dayOfWeek === dayName) || {
                      dayOfWeek: dayName,
                      active: false,
                      startTime: null,
                      endTime: null,
                      slotDurationMins: 30,
                      breaks: [],
                    };

                    return (
                      <motion.div
                        key={dayName}
                        className={`card p-4 sm:p-5 border transition-all ${
                          dayConfig.active ? 'border-border bg-white shadow-xs' : 'border-slate-200 bg-slate-50/70'
                        }`}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        {/* Day Row Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => handleDayToggle(dayName)}
                              className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs transition-colors ${
                                dayConfig.active
                                  ? 'bg-primary-600 text-white shadow-xs'
                                  : 'bg-slate-200 text-slate-500 hover:bg-slate-300'
                              }`}
                            >
                              {dayName.substring(0, 3)}
                            </button>
                            <div>
                              <h3 className="font-semibold text-sm text-navy">{dayName}</h3>
                              <p className="text-xs text-muted">
                                {dayConfig.active
                                  ? `${dayConfig.startTime || '09:00'} — ${dayConfig.endTime || '17:00'} • ${dayConfig.slotDurationMins}m slots`
                                  : 'Clinic Closed (Off)'}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleDayToggle(dayName)}
                              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                                dayConfig.active
                                  ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                  : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                              }`}
                            >
                              {dayConfig.active ? 'Working Day' : 'Day Off'}
                            </button>
                          </div>
                        </div>

                        {/* Expanded Day Controls */}
                        {dayConfig.active && (
                          <div className="mt-4 pt-4 border-t border-border space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              {/* Start Time */}
                              <div>
                                <label className="label text-xs">Start Time</label>
                                <div className="relative">
                                  <Clock className="w-3.5 h-3.5 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                                  <input
                                    type="time"
                                    value={dayConfig.startTime || '09:00'}
                                    onChange={e => handleTimeChange(dayName, 'startTime', e.target.value)}
                                    className="input-field text-xs pl-8 py-2"
                                  />
                                </div>
                              </div>

                              {/* End Time */}
                              <div>
                                <label className="label text-xs">End Time</label>
                                <div className="relative">
                                  <Clock className="w-3.5 h-3.5 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                                  <input
                                    type="time"
                                    value={dayConfig.endTime || '17:00'}
                                    onChange={e => handleTimeChange(dayName, 'endTime', e.target.value)}
                                    className="input-field text-xs pl-8 py-2"
                                  />
                                </div>
                              </div>

                              {/* Slot Duration */}
                              <div>
                                <label className="label text-xs">Slot Duration</label>
                                <select
                                  value={dayConfig.slotDurationMins || 30}
                                  onChange={e => handleDurationChange(dayName, Number(e.target.value))}
                                  className="input-field text-xs py-2"
                                >
                                  {SLOT_DURATIONS.map(d => (
                                    <option key={d} value={d}>
                                      {d} minutes
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            {/* Breaks Section */}
                            <div className="bg-surface p-3 rounded-xl border border-border">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-semibold text-navy flex items-center gap-1.5">
                                  <Coffee className="w-3.5 h-3.5 text-amber-600" />
                                  Breaks & Lunch Intervals
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleAddBreak(dayName)}
                                  className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                  Add Break
                                </button>
                              </div>

                              {(!dayConfig.breaks || dayConfig.breaks.length === 0) ? (
                                <p className="text-xs text-muted italic">No breaks scheduled for this day.</p>
                              ) : (
                                <div className="space-y-2">
                                  {dayConfig.breaks.map((b, idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                      <input
                                        type="time"
                                        value={b.startTime}
                                        onChange={e => handleUpdateBreak(dayName, idx, 'startTime', e.target.value)}
                                        className="input-field text-xs py-1.5 w-28"
                                      />
                                      <span className="text-xs text-muted">to</span>
                                      <input
                                        type="time"
                                        value={b.endTime}
                                        onChange={e => handleUpdateBreak(dayName, idx, 'endTime', e.target.value)}
                                        className="input-field text-xs py-1.5 w-28"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveBreak(dayName, idx)}
                                        className="p-1.5 text-muted hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Delete Break"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right 5 Cols: Live Slot Preview */}
            <div className="lg:col-span-5 space-y-4">
              <div className="card p-6 sticky top-24 shadow-sm border border-border">
                <div className="flex items-center justify-between pb-4 border-b border-border mb-4">
                  <div>
                    <h3 className="font-display font-bold text-navy text-base flex items-center gap-2">
                      <Sun className="w-4 h-4 text-amber-500" />
                      Live Slot Preview
                    </h3>
                    <p className="text-xs text-muted">Real-time simulation of patient consultation slots</p>
                  </div>
                  <button
                    onClick={() => fetchSlotPreview(previewDate)}
                    className="p-1.5 text-muted hover:text-primary-600 hover:bg-surface rounded-lg"
                    title="Refresh Preview"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>

                {/* Date Selector */}
                <div className="mb-4">
                  <label className="label text-xs">Preview Calendar Date</label>
                  <div className="relative">
                    <CalendarIcon className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="date"
                      value={previewDate}
                      onChange={e => setPreviewDate(e.target.value)}
                      className="input-field text-xs pl-10"
                    />
                  </div>
                </div>

                {/* Preview Result Content */}
                {isPreviewLoading ? (
                  <div className="p-8 text-center">
                    <div className="w-8 h-8 border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-xs text-muted">Calculating consultation slots...</p>
                  </div>
                ) : !previewSlots ? (
                  <div className="p-6 text-center text-xs text-muted">
                    Select a date above to preview slots.
                  </div>
                ) : previewSlots.onLeave ? (
                  <div className="p-5 bg-red-50 border border-red-200 rounded-xl text-center space-y-2">
                    <Ban className="w-8 h-8 text-red-500 mx-auto" />
                    <h4 className="font-semibold text-red-900 text-sm">Doctor is On Leave</h4>
                    <p className="text-xs text-red-700">
                      {previewSlots.leaveReason || 'A scheduled leave blocks all appointment bookings on this date.'}
                    </p>
                  </div>
                ) : !previewSlots.workingDay ? (
                  <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-2">
                    <Moon className="w-8 h-8 text-slate-400 mx-auto" />
                    <h4 className="font-semibold text-navy text-sm">Clinic Closed / Off Day</h4>
                    <p className="text-xs text-muted">
                      No availability configured for {previewSlots.dayOfWeek}. Patients cannot book appointments on this day.
                    </p>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-3 text-xs">
                      <span className="text-muted font-medium">
                        {previewSlots.dayOfWeek} • <strong className="text-navy">{previewSlots.slots.length}</strong> available slots
                      </span>
                      <span className="badge badge-green text-xs font-semibold">Active Hours</span>
                    </div>

                    <motion.div
                      className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-80 overflow-y-auto pr-1"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      {previewSlots.slots.map((slot: TimeSlotDto, i: number) => (
                        <div
                          key={i}
                          className="px-2.5 py-2 bg-surface hover:bg-primary-50 hover:border-primary-300 border border-border rounded-xl text-center text-xs font-semibold text-navy transition-all shadow-2xs"
                        >
                          {slot.formattedTime}
                        </div>
                      ))}
                    </motion.div>

                    <div className="mt-4 pt-4 border-t border-border flex items-center gap-2 text-xs text-muted">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span>Slots exclude scheduled breaks and leave periods.</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Leaves Management Tab */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left 5 cols: Request / Record Leave */}
            <div className="lg:col-span-5">
              <div className="card p-6">
                <div className="flex items-center gap-2.5 pb-4 border-b border-border mb-4">
                  <Ban className="w-5 h-5 text-red-500" />
                  <div>
                    <h3 className="font-display font-semibold text-navy text-base">Schedule Doctor Leave</h3>
                    <p className="text-xs text-muted">Block consultation dates for vacations, conferences, or emergencies</p>
                  </div>
                </div>

                <form onSubmit={handleCreateLeave} className="space-y-4">
                  <div>
                    <label className="label text-xs">Leave Start Date *</label>
                    <input
                      type="date"
                      value={leaveForm.startDate}
                      onChange={e => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                      required
                      className="input-field text-xs"
                    />
                  </div>

                  <div>
                    <label className="label text-xs">Leave End Date *</label>
                    <input
                      type="date"
                      value={leaveForm.endDate}
                      onChange={e => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                      required
                      className="input-field text-xs"
                    />
                  </div>

                  <div>
                    <label className="label text-xs">Reason for Leave</label>
                    <textarea
                      rows={3}
                      value={leaveForm.reason || ''}
                      onChange={e => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                      placeholder="e.g. Attending national medical conference / Personal leave"
                      className="input-field text-xs"
                    />
                  </div>

                  <div className="pt-2">
                    <Button
                      type="submit"
                      variant="primary"
                      className="w-full text-xs"
                      isLoading={isSubmittingLeave}
                    >
                      Record Leave
                    </Button>
                  </div>
                </form>
              </div>
            </div>

            {/* Right 7 cols: Scheduled Leaves List */}
            <div className="lg:col-span-7">
              <div className="card p-6">
                <div className="flex items-center justify-between pb-4 border-b border-border mb-4">
                  <div>
                    <h3 className="font-display font-semibold text-navy text-base">Scheduled Leaves</h3>
                    <p className="text-xs text-muted">All active, future, and past absence periods</p>
                  </div>
                  <Badge variant="blue">{leaves.length} Recorded</Badge>
                </div>

                {leaves.length === 0 ? (
                  <div className="py-12 text-center">
                    <Shield className="w-10 h-10 text-muted mx-auto mb-2" />
                    <h4 className="font-semibold text-navy text-sm">No leaves scheduled</h4>
                    <p className="text-xs text-muted">Your clinic schedule is active according to your weekly plan.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {leaves.map(l => (
                      <div key={l.id} className="py-3.5 flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-navy">
                              {l.startDate} {l.endDate && l.endDate !== l.startDate ? `— ${l.endDate}` : ''}
                            </span>
                            <span className="badge badge-amber text-xs font-medium">On Leave</span>
                          </div>
                          <p className="text-xs text-muted">
                            {l.reason || 'General clinical leave'}
                          </p>
                        </div>

                        <button
                          onClick={() => handleCancelLeave(l.id)}
                          className="p-1.5 text-muted hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Cancel Leave"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
