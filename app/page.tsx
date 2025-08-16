'use client';

import { useMemo, useState } from 'react';
import { addDays, format, isWithinInterval, startOfDay } from 'date-fns';
import { Calendar as CalendarIcon, BedDouble, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

// --- Mock data --------------------------------------------------------------
const mockRooms = [
  { id: '101', type: 'Deluxe', floor: 1 },
  { id: '102', type: 'Deluxe', floor: 1 },
  { id: '201', type: 'Suite', floor: 2 },
  { id: '202', type: 'Suite', floor: 2 },
  { id: '301', type: 'Standard', floor: 3 },
  { id: '302', type: 'Standard', floor: 3 },
];

const mockBookings = [
  {
    roomId: '101',
    guest: 'Nguyen Van A',
    status: 'booked',
    start: addDays(startOfDay(new Date()), 1),
    end: addDays(startOfDay(new Date()), 3),
    note: 'OTA: Booking.com',
  },
  {
    roomId: '201',
    guest: 'Tran Thi B',
    status: 'occupied',
    start: addDays(startOfDay(new Date()), 0),
    end: addDays(startOfDay(new Date()), 5),
    note: 'Late checkout 14:00',
  },
  {
    roomId: '301',
    guest: 'Le C',
    status: 'maintenance',
    start: addDays(startOfDay(new Date()), 2),
    end: addDays(startOfDay(new Date()), 6),
    note: 'A/C repair',
  },
];

const STATUS_META: Record<string, { label: string; cell: string; dot: string }> = {
  available: { label: 'Available', cell: 'bg-muted', dot: 'bg-muted-foreground' },
  booked: { label: 'Booked', cell: 'bg-amber-200/70', dot: 'bg-amber-500' },
  occupied: { label: 'Occupied', cell: 'bg-blue-200/70', dot: 'bg-blue-500' },
  maintenance: { label: 'Maintenance', cell: 'bg-rose-200/70', dot: 'bg-rose-500' },
  cleaning: { label: 'Cleaning', cell: 'bg-emerald-200/70', dot: 'bg-emerald-500' },
};

// --- Component --------------------------------------------------------------
export default function HotelBookingManager() {
  const [range, setRange] = useState<{ from: Date; to: Date }>({
    from: startOfDay(new Date()),
    to: addDays(startOfDay(new Date()), 13),
  });
  const [q, setQ] = useState('');
  const [groupByFloor, setGroupByFloor] = useState(true);

  const days = useMemo(() => {
    const out: Date[] = [];
    for (let d = 0; d <= Math.round((+range.to - +range.from) / 86400000); d++) {
      out.push(addDays(range.from, d));
    }
    return out;
  }, [range]);

  const rooms = useMemo(() => {
    const filtered = mockRooms.filter((r) =>
      (r.id + r.type).toLowerCase().includes(q.toLowerCase())
    );
    if (!groupByFloor) return filtered;
    // simple stable sort by floor then id
    return [...filtered].sort((a, b) => (a.floor - b.floor) || a.id.localeCompare(b.id));
  }, [q, groupByFloor]);

  function getCellStatus(roomId: string, day: Date) {
    // default available
    let status: keyof typeof STATUS_META = 'available';
    for (const b of mockBookings) {
      if (b.roomId !== roomId) continue;
      if (
        isWithinInterval(day, { start: b.start, end: addDays(b.end, -1) })
      ) {
        status = b.status as keyof typeof STATUS_META;
        break;
      }
    }
    return status;
  }

  function getBooking(roomId: string, day: Date) {
    return mockBookings.find(
      (b) =>
        b.roomId === roomId &&
        isWithinInterval(day, { start: b.start, end: addDays(b.end, -1) })
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <BedDouble className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Hotel Booking Manager</h1>
        </div>
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2">
                <CalendarIcon className="h-4 w-4" />
                {format(range.from, 'dd/MM')} - {format(range.to, 'dd/MM')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0" align="end">
              <Calendar
                mode="range"
                selected={{ from: range.from, to: range.to }}
                onSelect={(v) => {
                  if (!v?.from || !v?.to) return;
                  setRange({ from: startOfDay(v.from), to: startOfDay(v.to) });
                }}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
          <Button>New Booking</Button>
        </div>
      </div>

      {/* Controls */}
      <Card className="mb-4">
        <CardContent className="py-4 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            <Input
              placeholder="Tìm phòng hoặc loại phòng..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-64"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <Label htmlFor="group">Nhóm theo tầng</Label>
            <Switch id="group" checked={groupByFloor} onCheckedChange={setGroupByFloor} />
          </div>
          {/* Legend */}
          <div className="ml-auto flex items-center gap-3">
            {Object.entries(STATUS_META).map(([k, v]) => (
              <div key={k} className="flex items-center gap-2 text-sm">
                <span className={cn('h-3 w-3 rounded-full', v.dot)} />
                <span className="text-muted-foreground">{v.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Timeline Grid */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Availability Matrix</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Column headers */}
          <div className="grid" style={{ gridTemplateColumns: `220px repeat(${days.length}, minmax(52px, 1fr))` }}>
            <div />
            {days.map((d) => (
              <div key={+d} className="p-2 text-xs text-center text-muted-foreground border-b">
                <div className="font-medium">{format(d, 'dd')}</div>
                <div>{format(d, 'EEE')}</div>
              </div>
            ))}

            {/* Rows */}
            {rooms.map((room) => (
              <>
                <div key={`meta-${room.id}`} className="sticky left-0 z-10 bg-white border-r p-3 flex items-center gap-3">
                  <div className="flex flex-col">
                    <span className="font-medium">Phòng {room.id}</span>
                    <span className="text-xs text-muted-foreground">{room.type} • Tầng {room.floor}</span>
                  </div>
                </div>
                {days.map((d) => {
                  const status = getCellStatus(room.id, d);
                  const booking = getBooking(room.id, d);
                  return (
                    <Popover key={`${room.id}-${+d}`}>
                      <PopoverTrigger asChild>
                        <button
                          className={cn(
                            'h-12 w-full border-b border-l hover:ring-2 hover:ring-offset-2 transition',
                            STATUS_META[status].cell
                          )}
                          title={booking ? `${booking.guest} • ${STATUS_META[status].label}` : STATUS_META[status].label}
                        />
                      </PopoverTrigger>
                      <PopoverContent className="w-80">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className={cn('h-2.5 w-2.5 rounded-full', STATUS_META[status].dot)} />
                              <span className="text-sm font-medium">{STATUS_META[status].label}</span>
                            </div>
                            <Badge variant="outline">{format(d, 'dd/MM')}</Badge>
                          </div>
                          {booking ? (
                            <div className="text-sm">
                              <div className="font-medium">{booking.guest}</div>
                              <div>Phòng {booking.roomId}</div>
                              <div>
                                {format(booking.start, 'dd/MM')} → {format(booking.end, 'dd/MM')}
                              </div>
                              {booking.note && (
                                <div className="text-muted-foreground">{booking.note}</div>
                              )}
                              <div className="flex gap-2 mt-2">
                                <Button size="sm">Xem chi tiết</Button>
                                <Button size="sm" variant="outline">Đổi phòng</Button>
                              </div>
                            </div>
                          ) : (
                            <div className="text-sm text-muted-foreground">Trống • Tạo đặt phòng mới?</div>
                          )}
                        </div>
                      </PopoverContent>
                    </Popover>
                  );
                })}
              </>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
