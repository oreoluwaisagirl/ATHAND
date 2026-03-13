import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { workersApi } from '../lib/dataApi';
import AppIcon from '../components/AppIcon';
import Button from '../components/Button';
import { Card, CardContent } from '../components/Card';
import { resolveAvatar } from '../lib/avatars';

const statCardTones = [
  'from-[#ff6e21] to-[#ff7d3a]',
  'from-[#18b86a] to-[#16c86f]',
  'from-[#ca1467] to-[#d61976]',
  'from-[#6865ff] to-[#5b58eb]',
];

const summaryTones = [
  'bg-[#f7dfd1] text-[#ff6e21]',
  'bg-[#d7f0df] text-[#18b86a]',
  'bg-[#e3daf9] text-[#6865ff]',
  'bg-[#f2d8e7] text-[#ca1467]',
];

const WorkerPanel = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [worker, setWorker] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isWorker = user?.role === 'worker';

  useEffect(() => {
    if (!isAuthenticated || !isWorker) return;

    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const profileResponse = await workersApi.me();
        const workerProfile = profileResponse?.worker || null;
        setWorker(workerProfile);

        if (workerProfile?._id) {
          const bookingsResponse = await workersApi.bookings(workerProfile._id, { limit: 100 });
          setBookings(Array.isArray(bookingsResponse?.data) ? bookingsResponse.data : []);
        } else {
          setBookings([]);
        }
      } catch (err) {
        setError(err?.message || 'Unable to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [isAuthenticated, isWorker]);

  const stats = useMemo(() => {
    const total = bookings.length;
    const pending = bookings.filter((item) => item.status === 'pending').length;
    const completed = bookings.filter((item) => item.status === 'completed').length;
    const earnings = bookings
      .filter((item) => item.status === 'completed')
      .reduce((sum, item) => sum + Number(item.totalAmount || item.estimatedAmount || 0), 0);
    const balance = Math.max(earnings - 12500, 0);
    return { pending, completed, earnings, balance, total };
  }, [bookings]);

  const bookingRows = useMemo(() => bookings.slice(0, 4), [bookings]);
  const todoList = useMemo(() => {
    if (bookings.length > 0) {
      return bookings.slice(0, 3).map((booking, index) => ({
        id: booking._id || index,
        text: `${booking.userId?.fullName || 'Client'} booked ${booking.serviceId?.name || 'a service'} for ${booking.address?.city || 'Lagos'}.`,
      }));
    }
    return [
      { id: 1, text: 'Review pending requests and confirm schedule availability.' },
      { id: 2, text: 'Update service area and worker information for the presentation.' },
      { id: 3, text: 'Check completed orders and payout readiness.' },
    ];
  }, [bookings]);

  const workerName = worker?.userId?.fullName || user?.fullName || 'Alex Jenin';
  const workerRole = worker?.occupation || 'Owner CleanMart';
  const profileImage = resolveAvatar(worker?.profilePhotoUrl || worker?.userId?.profilePhotoUrl, workerName);

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold text-text-primary">Sign in required</h2>
            <p className="mt-2 text-text-secondary">Please log in with your worker account.</p>
            <Button className="mt-4 w-full" onClick={() => navigate('/login')}>Go to Login</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isWorker) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold text-text-primary">Worker access only</h2>
            <p className="mt-2 text-text-secondary">This dashboard is only for worker accounts.</p>
            <Button className="mt-4 w-full" onClick={() => navigate('/')}>Back Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f8f8] px-4 py-6 lg:px-6">
      {error ? <div className="mx-auto mb-4 max-w-7xl rounded-xl border border-error bg-error-light px-4 py-3 text-sm text-text-primary">{error}</div> : null}
      <div className="mx-auto grid max-w-[1800px] gap-6 xl:grid-cols-[272px_1fr]">
        <aside className="overflow-hidden rounded-[1.6rem] bg-[#1fc36f] text-white shadow-[0_18px_45px_rgba(31,195,111,0.22)]">
          <div className="px-8 pb-8 pt-10 text-center">
            <img src={profileImage} alt={workerName} className="mx-auto h-24 w-24 rounded-full border-4 border-white/70 object-cover" />
            <h2 className="mt-5 text-[2rem] font-black tracking-[-0.04em]">{workerName}</h2>
            <p className="mt-2 text-lg text-white/82">{workerRole}</p>
          </div>
          <nav className="space-y-1 px-5">
            {[
              ['Dashboard', 'gear'],
              ['Services', 'toolbox'],
              ['Order Pending', 'calendar'],
              ['Order Status', 'shield'],
              ['Payout History', 'card'],
              ['Profile', 'care'],
              ['Settings', 'gear'],
              ['Review', 'star'],
            ].map(([label, icon], index) => (
              <button
                key={label}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-4 text-left text-lg font-semibold transition ${index === 0 ? 'bg-white/14' : 'hover:bg-white/10'}`}
              >
                <AppIcon name={icon} className="h-5 w-5" />
                {label}
              </button>
            ))}
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="mt-2 flex w-full items-center gap-3 rounded-xl px-4 py-4 text-left text-lg font-semibold transition hover:bg-white/10"
            >
              <AppIcon name="arrowRight" className="h-5 w-5" />
              Log Out
            </button>
          </nav>
          <div className="mx-5 mb-5 mt-8 rounded-[1.25rem] bg-[#1bc6a0] px-6 py-10">
            <p className="text-2xl font-black uppercase tracking-[0.18em]">ATHAND</p>
          </div>
        </aside>

        <section className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              { label: 'Order Pending', value: stats.pending || 12, icon: 'calendar' },
              { label: 'Order Completed', value: stats.completed || 2350, icon: 'chat' },
              { label: 'Total Earning', value: stats.earnings || 12, icon: 'card' },
              { label: 'Balance', value: stats.balance || 2350, icon: 'card' },
            ].map((item, index) => (
              <div key={item.label} className={`rounded-[1.35rem] bg-gradient-to-br ${statCardTones[index]} px-6 py-7 text-white shadow-[0_18px_45px_rgba(39,55,86,0.08)]`}>
                <div className="flex items-center gap-4">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-white text-current">
                    <AppIcon name={item.icon} className="h-7 w-7" />
                  </div>
                  <div>
                    <p className="text-[2.2rem] font-black leading-none">{item.value}</p>
                    <p className="mt-2 text-xl font-semibold">{item.label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.4fr_0.65fr_0.6fr]">
            <Card className="rounded-[1.6rem] border border-[#ececec] bg-white shadow-none">
              <CardContent className="p-6">
                <div className="mb-5 flex items-center justify-between">
                  <h3 className="text-[2rem] font-black tracking-[-0.04em] text-text-primary">Total Earning Overview</h3>
                  <div className="rounded-xl bg-[#f4f6fb] px-5 py-3 text-sm font-semibold text-text-secondary">Jan</div>
                </div>
                <div className="relative h-[280px] overflow-hidden rounded-[1rem] border border-[#ececec] bg-[linear-gradient(transparent_31px,#ececec_32px),linear-gradient(90deg,transparent_58px,#ececec_59px)] bg-[size:100%_32px,60px_100%]">
                  <svg viewBox="0 0 600 280" className="absolute inset-0 h-full w-full">
                    <polyline fill="none" stroke="#1fc36f" strokeWidth="4" points="18,140 96,110 174,150 252,180 330,120 408,75 486,58 564,170" />
                    <polyline fill="none" stroke="#6865ff" strokeWidth="4" points="18,180 96,170 174,130 252,82 330,70 408,120 486,105 564,182" />
                    {[18, 96, 174, 252, 330, 408, 486, 564].map((x, index) => (
                      <g key={x}>
                        <circle cx={x} cy={[140, 110, 150, 180, 120, 75, 58, 170][index]} r="7" fill="#fff" stroke="#1fc36f" strokeWidth="4" />
                        <circle cx={x} cy={[180, 170, 130, 82, 70, 120, 105, 182][index]} r="7" fill="#fff" stroke="#6865ff" strokeWidth="4" />
                      </g>
                    ))}
                  </svg>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[1.6rem] border border-[#ececec] bg-white shadow-none">
              <CardContent className="p-6">
                <div className="mb-5 flex items-center justify-between">
                  <h3 className="text-[1.8rem] font-black tracking-[-0.04em] text-text-primary">To do List</h3>
                  <button className="text-sm font-semibold text-primary">See More</button>
                </div>
                <div className="space-y-6">
                  {todoList.map((item) => (
                    <div key={item.id} className="flex items-start gap-3 border-t border-[#f0f0f0] pt-5 first:border-t-0 first:pt-0">
                      <span className="mt-1 inline-flex h-5 w-5 rounded-sm border border-[#d9d9d9]" />
                      <p className="text-base leading-8 text-text-secondary">{item.text}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[1.6rem] border border-[#ececec] bg-white shadow-none">
              <CardContent className="p-6">
                <h3 className="text-[1.8rem] font-black tracking-[-0.04em] text-text-primary">This Month Summery</h3>
                <div className="mt-6 grid grid-cols-2 gap-4">
                  {[
                    { label: 'Order', value: 130 },
                    { label: 'Earning', value: '$6500' },
                    { label: 'Balance', value: 3250 },
                    { label: 'Repeat Buyer', value: 340 },
                  ].map((item, index) => (
                    <div key={item.label} className={`rounded-[1.2rem] p-5 text-center ${summaryTones[index]}`}>
                      <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-white">
                        <AppIcon name={['calendar', 'card', 'card', 'care'][index]} className="h-5 w-5" />
                      </div>
                      <p className="mt-5 text-[2rem] font-black tracking-[-0.04em] text-text-primary">{item.value}</p>
                      <p className="mt-1 text-lg text-text-secondary">{item.label}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <Card className="rounded-[1.6rem] border border-[#ececec] bg-white shadow-none">
              <CardContent className="p-6">
                <div className="grid grid-cols-[1.2fr_0.8fr_0.8fr_0.6fr] gap-4 border-b border-[#ececec] pb-4 text-lg font-semibold text-text-secondary">
                  <p>Client Name</p>
                  <p>Status</p>
                  <p>Location</p>
                  <p>Price</p>
                </div>
                <div className="space-y-4 pt-4">
                  {(bookingRows.length > 0 ? bookingRows : [
                    { _id: 1, userId: { fullName: 'Riyad Hossain' }, status: 'completed', address: { city: 'New York' }, totalAmount: 1475 },
                    { _id: 2, userId: { fullName: 'Arafat Hossain' }, status: 'cancelled', address: { city: 'Oklahoma' }, totalAmount: 1370 },
                    { _id: 3, userId: { fullName: 'Shafiq Islam' }, status: 'pending', address: { city: 'Washington' }, totalAmount: 1365 },
                    { _id: 4, userId: { fullName: 'Sharif Ahmed' }, status: 'completed', address: { city: 'Barcelona' }, totalAmount: 1400 },
                  ]).map((row) => (
                    <div key={row._id} className="grid grid-cols-[1.2fr_0.8fr_0.8fr_0.6fr] items-center gap-4 text-lg text-text-primary">
                      <p>{row.userId?.fullName || 'Client'}</p>
                      <span className={`inline-flex rounded-xl px-4 py-3 text-center text-base font-semibold ${
                        row.status === 'completed'
                          ? 'bg-[#dbf0e5] text-[#18b86a]'
                          : row.status === 'cancelled'
                            ? 'bg-[#f9dce4] text-[#ca1467]'
                            : 'bg-[#f5ecd8] text-[#f0aa38]'
                      }`}>
                        {row.status === 'completed' ? 'Completed' : row.status === 'cancelled' ? 'Canceled' : 'Pending'}
                      </span>
                      <p>{row.address?.city || 'Lagos'}</p>
                      <p>${row.totalAmount || 0}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[1.6rem] border border-[#ececec] bg-white shadow-none">
              <CardContent className="p-6">
                <div className="mb-5 flex items-center justify-between">
                  <h3 className="text-[1.8rem] font-black tracking-[-0.04em] text-text-primary">Weekly Work Summary</h3>
                  <div className="rounded-xl bg-[#f4f6fb] px-5 py-3 text-sm font-semibold text-text-secondary">Sun</div>
                </div>
                <div className="flex h-[280px] items-end justify-between gap-4 rounded-[1rem] border border-[#ececec] px-6 pb-8 pt-6">
                  {[
                    [130, 70, 170],
                    [80, 125, 35],
                    [200, 95, 135],
                    [45, 70, 30],
                    [220, 160, 120],
                    [90, 25, 70],
                    [170, 130, 230],
                  ].map((bars, index) => (
                    <div key={index} className="flex items-end gap-2">
                      <div className="w-3 rounded-full bg-[#2499dd]" style={{ height: `${bars[0]}px` }} />
                      <div className="w-3 rounded-full bg-[#f8b400]" style={{ height: `${bars[1]}px` }} />
                      <div className="w-3 rounded-full bg-[#6865ff]" style={{ height: `${bars[2]}px` }} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>

      {loading ? <div className="pointer-events-none fixed inset-0 bg-white/20 backdrop-blur-[1px]" /> : null}
    </div>
  );
};

export default WorkerPanel;
