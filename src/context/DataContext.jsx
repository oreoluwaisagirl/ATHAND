import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { resolveAvatar } from '../lib/avatars';
import { useAuth } from './AuthContext';
import { adminApi, workersApi } from '../lib/dataApi';

const DataContext = createContext(null);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

const isMongoObjectId = (value) => typeof value === 'string' && /^[a-fA-F0-9]{24}$/.test(value);

const baseCategories = [
  { id: 'nanny', name: 'Nanny', icon: 'care' },
  { id: 'maid', name: 'House Maid', icon: 'cleaning' },
  { id: 'cook', name: 'Cook', icon: 'chef' },
  { id: 'driver', name: 'Driver', icon: 'car' },
  { id: 'gardener', name: 'Gardener', icon: 'leaf' },
  { id: 'cleaner', name: 'Cleaner', icon: 'cleaning' },
  { id: 'tutor', name: 'Tutor', icon: 'book' },
  { id: 'security', name: 'Security', icon: 'shield' },
  { id: 'engineer', name: 'Engineer', icon: 'gear' },
  { id: 'mechanic', name: 'Mechanic', icon: 'wrench' },
  { id: 'carpenter', name: 'Carpenter', icon: 'hammer' },
  { id: 'plumber', name: 'Plumber', icon: 'pipe' },
  { id: 'electrician', name: 'Electrician', icon: 'electric' },
];
const categoryNameById = baseCategories.reduce((acc, category) => {
  acc[category.id] = category.name;
  return acc;
}, {});

const inferCategoryFromWorker = (worker) => {
  const text = `${worker?.occupation || ''} ${worker?.bio || ''} ${(worker?.skills || []).join(' ')}`.toLowerCase();
  if (text.includes('nanny') || text.includes('child')) return 'nanny';
  if (text.includes('maid') || text.includes('housekeeper')) return 'maid';
  if (text.includes('cook') || text.includes('meal') || text.includes('chef')) return 'cook';
  if (text.includes('driver')) return 'driver';
  if (text.includes('garden')) return 'gardener';
  if (text.includes('clean')) return 'cleaner';
  if (text.includes('tutor') || text.includes('math') || text.includes('science')) return 'tutor';
  if (text.includes('security')) return 'security';
  if (text.includes('engineer')) return 'engineer';
  if (text.includes('mechanic')) return 'mechanic';
  if (text.includes('carpenter')) return 'carpenter';
  if (text.includes('plumb')) return 'plumber';
  if (
    text.includes('electric')
    || text.includes('generator')
    || text.includes('ac technician')
    || text.includes('air condition')
  ) return 'electrician';
  return 'cleaner';
};

const mapBackendWorkerToUi = (worker) => {
  const workerUser = worker?.userId && typeof worker.userId === 'object' ? worker.userId : {};
  const fullName = workerUser.fullName || 'Worker';
  const categoryId = inferCategoryFromWorker(worker);
  const completedJobs = worker.completedBookings || Math.max(0, (worker.totalBookings || 0) - (worker.cancelledBookings || 0));
  const startingPrice = worker.hourlyRate || 2500;
  return {
    id: worker._id,
    categoryId,
    name: fullName,
    location: worker.serviceArea?.[0] || 'Lagos',
    phoneNumber: workerUser.phone || '',
    homeAddress: 'Not set',
    rating: worker.averageRating || 0,
    reviews: worker.totalReviews || 0,
    bio: worker.bio || 'Professional service provider',
    rate: startingPrice,
    startingPrice,
    availability: worker.isAvailable ? 'Available Today' : 'Not Available',
    verified: worker.verificationStatus === 'verified',
    skills: worker.skills?.length ? worker.skills : ['General Services'],
    avatar: resolveAvatar(worker.profilePhotoUrl || workerUser.profilePhotoUrl, fullName),
    age: worker.age || '',
    experience: worker.yearsExperience ? `${worker.yearsExperience} years` : '1 year',
    languages: worker.languages?.length ? worker.languages : ['English'],
    completedJobs,
    distanceKm: typeof worker.distanceKm === 'number' ? worker.distanceKm : null,
    latitude: Number.isFinite(worker.latitude) ? worker.latitude : null,
    longitude: Number.isFinite(worker.longitude) ? worker.longitude : null,
    createdAt: worker.createdAt,
  };
};

const groupWorkersByCategory = (workerList) => {
  return workerList
    .filter((worker) => worker && worker._id)
    .reduce((acc, worker) => {
    const mapped = mapBackendWorkerToUi(worker);
    if (!acc[mapped.categoryId]) acc[mapped.categoryId] = [];
    acc[mapped.categoryId].push(mapped);
    return acc;
  }, {});
};

export const DataProvider = ({ children }) => {
  const { isAuthenticated, isAdmin } = useAuth();

  const [workers, setWorkers] = useState(() => {
    const stored = localStorage.getItem('athand_workers');
    if (!stored) return {};
    try { return JSON.parse(stored); } catch { return {}; }
  });

  const [users, setUsers] = useState(() => {
    const stored = localStorage.getItem('athand_users');
    if (!stored) return [];
    try { return JSON.parse(stored); } catch { return []; }
  });

  const [bookings, setBookings] = useState(() => {
    const stored = localStorage.getItem('athand_bookings');
    if (!stored) return [];
    try { return JSON.parse(stored); } catch { return []; }
  });

  const [messages, setMessages] = useState(() => {
    const stored = localStorage.getItem('athand_messages');
    if (!stored) return [];
    try { return JSON.parse(stored); } catch { return []; }
  });

  const [syncStatus, setSyncStatus] = useState({ backendConnected: false, lastSyncAt: null });

  const refreshWorkers = async () => {
    const pageSize = 200;
    const firstPage = await workersApi.list({ page: 1, limit: pageSize });
    const firstPageWorkers = Array.isArray(firstPage?.data) ? firstPage.data : [];
    const totalPages = Number(firstPage?.pagination?.pages || 1);

    let allWorkers = [...firstPageWorkers];

    if (totalPages > 1) {
      const pageRequests = Array.from({ length: totalPages - 1 }, (_, index) =>
        workersApi.list({ page: index + 2, limit: pageSize })
      );
      const remainingPages = await Promise.all(pageRequests);
      const remainingWorkers = remainingPages.flatMap((response) =>
        Array.isArray(response?.data) ? response.data : []
      );
      allWorkers = [...allWorkers, ...remainingWorkers];
    }

    const grouped = groupWorkersByCategory(allWorkers);
    setWorkers(grouped);
  };

  useEffect(() => {
    localStorage.setItem('athand_workers', JSON.stringify(workers));
  }, [workers]);

  useEffect(() => {
    localStorage.setItem('athand_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('athand_bookings', JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem('athand_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    const syncFromBackend = async () => {
      try {
        await refreshWorkers();

        if (isAuthenticated && isAdmin) {
          const [usersResponse, bookingsResponse] = await Promise.all([
            adminApi.users(),
            adminApi.bookings(),
          ]);
          setUsers(Array.isArray(usersResponse?.data) ? usersResponse.data : []);
          setBookings(Array.isArray(bookingsResponse?.data) ? bookingsResponse.data : []);
        }

        setSyncStatus({ backendConnected: true, lastSyncAt: new Date().toISOString() });
      } catch {
        setSyncStatus({ backendConnected: false, lastSyncAt: null });
      }
    };

    syncFromBackend();
  }, [isAuthenticated, isAdmin]);

  const getAllWorkers = () => Object.values(workers).flat();
  const getWorkersByCategory = (categoryId) => workers[categoryId] || [];
  const getWorkerById = (workerId) => getAllWorkers().find((w) => String(w.id) === String(workerId));

  const addWorker = async (worker) => {
    if (isAuthenticated && isAdmin) {
      const selectedCategoryName = categoryNameById[worker.categoryId] || 'Cleaner';
      const payload = {
        fullName: worker.name,
        email: worker.email,
        phone: worker.phoneNumber,
        password: worker.password || 'Worker@123',
        occupation: selectedCategoryName,
        bio: worker.bio,
        yearsExperience: parseInt(worker.experience, 10) || 1,
        location: worker.location,
        hourlyRate: worker.rate,
        languages: Array.isArray(worker.languages) ? worker.languages : [worker.languages || 'English'],
        skills: Array.isArray(worker.skills) ? worker.skills : [worker.skills || 'General Services'],
        verificationStatus: worker.verified ? 'verified' : 'pending',
        isAvailable: worker.availability !== 'Not Available',
      };

      const response = await workersApi.create(payload);
      const mapped = mapBackendWorkerToUi(response.worker);

      setWorkers((prev) => ({
        ...prev,
        [mapped.categoryId]: [mapped, ...(prev[mapped.categoryId] || [])],
      }));

      return mapped;
    }

    const newWorker = {
      ...worker,
      id: Date.now(),
      rating: 0,
      reviews: 0,
      avatar: resolveAvatar(worker.avatar, `${worker.name}-${worker.categoryId || 'cleaner'}`),
      createdAt: new Date().toISOString(),
    };

    setWorkers((prev) => {
      const category = worker.categoryId || 'cleaner';
      const categoryWorkers = prev[category] || [];
      return {
        ...prev,
        [category]: [...categoryWorkers, newWorker],
      };
    });

    return newWorker;
  };

  const updateWorker = async (workerId, updates) => {
    if (isAuthenticated && isAdmin && isMongoObjectId(workerId)) {
      await workersApi.update(workerId, {
        bio: updates.bio,
        yearsExperience: parseInt(updates.experience, 10) || undefined,
        hourlyRate: updates.rate,
        skills: updates.skills,
        languages: updates.languages,
        serviceArea: updates.location ? [updates.location] : undefined,
        isAvailable: updates.availability ? updates.availability !== 'Not Available' : undefined,
        verificationStatus: updates.verified === true ? 'verified' : undefined,
      });
    }

    setWorkers((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((category) => {
        next[category] = next[category].map((w) =>
          String(w.id) === String(workerId) ? { ...w, ...updates } : w
        );
      });
      return next;
    });
  };

  const deleteWorker = async (workerId) => {
    if (isAuthenticated && isAdmin && isMongoObjectId(workerId)) {
      await workersApi.remove(workerId);
    }

    setWorkers((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((category) => {
        next[category] = next[category].filter((w) => String(w.id) !== String(workerId));
      });
      return next;
    });
  };

  const addUser = (user) => {
    const newUser = {
      ...user,
      id: Date.now(),
      createdAt: new Date().toISOString(),
    };
    setUsers((prev) => [...prev, newUser]);
    return newUser;
  };

  const updateUser = (userId, updates) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, ...updates } : u)));
  };

  const addBooking = (booking) => {
    const newBooking = {
      ...booking,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      status: booking.status || 'pending',
    };
    setBookings((prev) => [...prev, newBooking]);
    return newBooking;
  };

  const updateBooking = (bookingId, updates) => {
    setBookings((prev) => prev.map((b) => (String(b.id) === String(bookingId) ? { ...b, ...updates } : b)));
  };

  const addMessage = (message) => {
    const newMessage = {
      ...message,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      read: false,
      toAdmin: message.toAdmin !== false,
    };
    setMessages((prev) => [...prev, newMessage]);
    return newMessage;
  };

  const markMessageRead = (messageId) => {
    setMessages((prev) => prev.map((m) => (String(m.id) === String(messageId) ? { ...m, read: true } : m)));
  };

  const getUnreadMessagesCount = () => messages.filter((m) => !m.read && m.toAdmin).length;

  const categories = useMemo(() => {
    const allWorkers = Object.values(workers).flat();
    return baseCategories.map((category) => {
      const categoryWorkers = allWorkers.filter((worker) => worker.categoryId === category.id);
      const avgRating = categoryWorkers.length
        ? Number((categoryWorkers.reduce((sum, worker) => sum + (worker.rating || 0), 0) / categoryWorkers.length).toFixed(1))
        : 0;
      return {
        ...category,
        providers: categoryWorkers.length,
        avgRating,
      };
    });
  }, [workers]);

  const value = {
    workers,
    getAllWorkers,
    getWorkersByCategory,
    getWorkerById,
    addWorker,
    updateWorker,
    deleteWorker,
    users,
    addUser,
    updateUser,
    bookings,
    addBooking,
    updateBooking,
    messages,
    addMessage,
    markMessageRead,
    getUnreadMessagesCount,
    categories,
    syncStatus,
    refreshWorkers,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export default DataContext;
