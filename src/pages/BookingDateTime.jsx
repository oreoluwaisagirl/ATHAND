import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Badge from '../components/Badge';
import { Card, CardContent, CardHeader } from '../components/Card';

const BookingDateTime = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  // Mock available dates (next 7 days)
  const availableDates = [
    { date: '2024-03-15', day: 'Fri', display: '15' },
    { date: '2024-03-16', day: 'Sat', display: '16' },
    { date: '2024-03-17', day: 'Sun', display: '17' },
    { date: '2024-03-18', day: 'Mon', display: '18' },
    { date: '2024-03-19', day: 'Tue', display: '19' },
    { date: '2024-03-20', day: 'Wed', display: '20' },
    { date: '2024-03-21', day: 'Thu', display: '21' },
  ];

  // Mock available time slots
  const morningSlots = ['6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM'];
  const afternoonSlots = ['12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'];
  const eveningSlots = ['6:00 PM', '7:00 PM', '8:00 PM'];

  const quickDateOptions = [
    { label: 'Today', date: '2024-03-14' },
    { label: 'Tomorrow', date: '2024-03-15' },
    { label: 'This Weekend', date: '2024-03-16' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <div className="bg-white shadow-sm px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => navigate('/booking-summary')}
          className="text-gray-600 hover:text-gray-900"
        >
          ←
        </button>
        <h1 className="text-xl font-semibold">Date & Time</h1>
        <div className="w-8"></div>
      </div>

      {/* Progress Indicator */}
      <div className="bg-white px-4 py-2 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
          <div className="flex-1 h-1 bg-gray-200 rounded">
            <div className="w-2/4 h-1 bg-primary rounded"></div>
          </div>
          <span className="text-sm text-gray-600">Step 2 of 4</span>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Date Selection */}
        <Card>
          <CardHeader>
            <h3 className="font-semibold">Select Date</h3>
          </CardHeader>
          <CardContent>
            {/* Quick Date Options */}
            <div className="flex space-x-2 mb-4 overflow-x-auto">
              {quickDateOptions.map((option) => (
                <button
                  key={option.date}
                  onClick={() => setSelectedDate(option.date)}
                  className={`px-4 py-2 border rounded-lg whitespace-nowrap ${
                    selectedDate === option.date
                      ? 'border-primary bg-primary text-white'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2 mb-4">
              {availableDates.map((date) => (
                <button
                  key={date.date}
                  onClick={() => setSelectedDate(date.date)}
                  className={`p-3 border rounded-lg text-center ${
                    selectedDate === date.date
                      ? 'border-primary bg-primary text-white'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="text-xs text-gray-500 mb-1">{date.day}</div>
                  <div className="text-lg font-semibold">{date.display}</div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Time Slot Selection */}
        <Card>
          <CardHeader>
            <h3 className="font-semibold">Select Time</h3>
          </CardHeader>
          <CardContent>
            {/* Morning */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Morning</h4>
              <div className="grid grid-cols-3 gap-2">
                {morningSlots.map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`p-2 border rounded text-center text-sm ${
                      selectedTime === time
                        ? 'border-primary bg-primary text-white'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            {/* Afternoon */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Afternoon</h4>
              <div className="grid grid-cols-3 gap-2">
                {afternoonSlots.map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`p-2 border rounded text-center text-sm ${
                      selectedTime === time
                        ? 'border-primary bg-primary text-white'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            {/* Evening */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Evening</h4>
              <div className="grid grid-cols-3 gap-2">
                {eveningSlots.map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`p-2 border rounded text-center text-sm ${
                      selectedTime === time
                        ? 'border-primary bg-primary text-white'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Duration Confirmation */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Duration</span>
              <span className="font-semibold">8 hours</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Service will end approximately at {selectedTime ? calculateEndTime(selectedTime, 8) : '5:00 PM'}
            </p>
          </CardContent>
        </Card>

        {/* Provider Availability Notice */}
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <div className="text-green-600 text-xl">✅</div>
              <div>
                <h4 className="font-semibold text-green-900 mb-1">Available</h4>
                <p className="text-sm text-green-800">
                  This provider is typically available during weekdays 8am-6pm. Your selected time is within their preferred hours.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Booking Summary Preview */}
        <Card>
          <CardHeader>
            <h3 className="font-semibold">Booking Summary</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Provider</span>
                <span>Adebayo Johnson</span>
              </div>
              <div className="flex justify-between">
                <span>Date</span>
                <span>{selectedDate ? new Date(selectedDate).toLocaleDateString() : 'Not selected'}</span>
              </div>
              <div className="flex justify-between">
                <span>Start Time</span>
                <span>{selectedTime || 'Not selected'}</span>
              </div>
              <div className="flex justify-between">
                <span>Duration</span>
                <span>8 hours</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Estimated Total</span>
                <span>₦22,000</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={() => navigate('/booking-summary')}
            className="flex-1"
          >
            Back
          </Button>
          <Button
            onClick={() => navigate('/booking-location')}
            className="flex-1"
            disabled={!selectedDate || !selectedTime}
          >
            Continue to Location
          </Button>
        </div>
      </div>
    </div>
  );
};

// Helper function to calculate end time
const calculateEndTime = (startTime, duration) => {
  const [time, period] = startTime.split(' ');
  const [hours, minutes] = time.split(':').map(Number);
  let totalHours = hours + duration;

  if (period === 'PM' && hours !== 12) totalHours += 12;
  if (period === 'AM' && hours === 12) totalHours -= 12;

  const endHours = totalHours % 24;
  const endPeriod = endHours >= 12 ? 'PM' : 'AM';
  const displayHours = endHours === 0 ? 12 : endHours > 12 ? endHours - 12 : endHours;

  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${endPeriod}`;
};

export default BookingDateTime;
