import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import AppIcon from '../components/AppIcon';
import GoogleLiveMap from '../components/GoogleLiveMap';

const cityOptions = [
  { id: 'lagos', label: 'Lagos,\nNigeria', active: true, center: { lat: 6.5244, lng: 3.3792 } },
  { id: 'los-angeles', label: 'Los Angeles,\nCalifornia', center: { lat: 34.0522, lng: -118.2437 } },
  { id: 'chicago', label: 'Chicago,\nLagos', center: { lat: 41.8781, lng: -87.6298 } },
  { id: 'houston', label: 'Houston,\nTexas', center: { lat: 29.7604, lng: -95.3698 } },
  { id: 'phoenix', label: 'Phoenix,\nArizona', center: { lat: 33.4484, lng: -112.074 } },
];

const steps = ['Location', 'Service', 'Date & Time', 'Information', 'Confirmation'];

const BookingLocation = () => {
  const navigate = useNavigate();
  const [selectedCity, setSelectedCity] = useState('lagos');

  const currentCity = useMemo(
    () => cityOptions.find((city) => city.id === selectedCity) || cityOptions[0],
    [selectedCity]
  );

  return (
    <div className="min-h-screen bg-[#f8f8f8] px-4 py-10 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center gap-4 py-4 text-xl font-semibold text-text-secondary">
          {steps.map((step, index) => (
            <React.Fragment key={step}>
              <div className="flex items-center gap-3">
                <span className={`inline-flex h-11 w-11 items-center justify-center rounded-full border-2 text-lg ${index === 0 ? 'border-primary text-primary' : 'border-[#d9d9d9] bg-[#ececec] text-[#9a9a9a]'}`}>
                  {index + 1}
                </span>
                <span className={index === 0 ? 'text-text-primary' : 'text-[#9a9a9a]'}>{step}</span>
              </div>
              {index < steps.length - 1 ? <AppIcon name="arrowRight" className="h-5 w-5 text-[#a7a7a7]" /> : null}
            </React.Fragment>
          ))}
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-5">
          {cityOptions.map((city) => (
            <button
              key={city.id}
              onClick={() => setSelectedCity(city.id)}
              className={`min-h-[168px] rounded-[0.9rem] px-6 py-8 text-left text-[2rem] font-semibold leading-[1.3] tracking-[-0.03em] shadow-sm transition ${
                selectedCity === city.id
                  ? 'bg-primary text-white'
                  : 'bg-[#eef1f7] text-text-primary hover:bg-[#e6ebf5]'
              }`}
            >
              {city.label.split('\n').map((line) => (
                <span key={line} className="block">{line}</span>
              ))}
            </button>
          ))}
        </div>

        <div className="mx-auto mt-20 max-w-5xl overflow-hidden rounded-[0.95rem] bg-white shadow-[0_16px_35px_rgba(39,55,86,0.08)]">
          <div className="flex items-center justify-center gap-3 bg-primary px-4 py-4 text-2xl font-semibold text-white">
            <AppIcon name="pin" className="h-5 w-5" />
            Select Current Location
          </div>
          <GoogleLiveMap
            center={currentCity.center}
            height={430}
            className="rounded-none border-0"
            markers={[{ ...currentCity.center, label: currentCity.label.replace('\n', ', ') }]}
          />
        </div>

        <div className="mt-10 flex justify-end">
          <Button
            className="rounded-none px-10 py-4 text-lg font-semibold"
            onClick={() => navigate('/booking-confirmation')}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BookingLocation;
