import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { ThemeProvider } from './context/ThemeContext';
import Landing from './pages/Landing';
import OtherHelpHub from './pages/OtherHelpHub';
import HouseHelpSearch from './pages/HouseHelpSearch';
import CategoryList from './pages/CategoryList';
import WorkerProfile from './pages/WorkerProfile';
import BookingSummary from './pages/BookingSummary';
import BookingDateTime from './pages/BookingDateTime';
import BookingLocation from './pages/BookingLocation';
import BookingConfirmation from './pages/BookingConfirmation';
import Messages from './pages/Messages';
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import HelpCenter from './pages/HelpCenter';
import PaymentMethods from './pages/PaymentMethods';
import NotificationSettings from './pages/NotificationSettings';
import LanguageRegion from './pages/LanguageRegion';
import TermsOfService from './pages/TermsOfService';
import AboutATHAND from './pages/AboutATHAND';
import AdminPanel from './pages/AdminPanel';
import OtpDebug from './pages/OtpDebug';
import WorkerPanel from './pages/WorkerPanel';
import WorkerOnboarding from './pages/WorkerOnboarding';
import EmergencyHelp from './pages/EmergencyHelp';
import BookingScreen from './pages/BookingScreen';
import BookingTracking from './pages/BookingTracking';
import BottomNavigation from './components/BottomNavigation';
import DesktopHeader from './components/DesktopHeader';
import CommandCenter from './components/CommandCenter';
import './App.css';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname]);

  return null;
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DataProvider>
          <Router>
            <ScrollToTop />
            <div className="min-h-screen bg-background transition-colors duration-300">
              <DesktopHeader />
              
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/house-help-search" element={<HouseHelpSearch />} />
                <Route path="/other-help" element={<OtherHelpHub />} />
                <Route path="/emergency-help" element={<EmergencyHelp />} />
                <Route path="/category/:categoryId" element={<CategoryList />} />
                <Route path="/worker/:categoryId/:workerId" element={<WorkerProfile />} />
                <Route path="/booking-summary" element={<BookingSummary />} />
                <Route path="/booking" element={<BookingScreen />} />
                <Route path="/booking-datetime" element={<BookingDateTime />} />
                <Route path="/booking-location" element={<BookingLocation />} />
                <Route path="/booking-confirmation" element={<BookingConfirmation />} />
                <Route path="/booking-tracking/:bookingId" element={<BookingTracking />} />
                <Route path="/messages" element={<Messages />} />
                <Route path="/chat/:conversationId" element={<Chat />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/help-center" element={<HelpCenter />} />
                <Route path="/payment-methods" element={<PaymentMethods />} />
                <Route path="/notification-settings" element={<NotificationSettings />} />
                <Route path="/language-region" element={<LanguageRegion />} />
                <Route path="/terms-of-service" element={<TermsOfService />} />
                <Route path="/about-athand" element={<AboutATHAND />} />
                <Route path="/admin" element={<AdminPanel />} />
                <Route path="/worker-panel" element={<WorkerPanel />} />
                <Route path="/worker-onboarding" element={<WorkerOnboarding />} />
                <Route path="/otp-test" element={<OtpDebug />} />
              </Routes>
              <BottomNavigation />
              <CommandCenter />
            </div>
          </Router>
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
