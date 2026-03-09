import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import Button from '../components/Button';

const OCCUPATION_OPTIONS = [
  'Housekeeper',
  'Nanny',
  'Cook',
  'Driver',
  'Gardener',
  'Caregiver',
  'Cleaner',
  'Security Guard',
  'Laundry Specialist',
  'Babysitter',
  'Chef',
  'Private Chef',
  'Home Tutor',
  'Personal Assistant',
  'Errand Runner',
  'Dishwasher',
  'House Manager',
  'Pet Sitter',
  'Live-in Help',
  'Maid',
  'Electrician',
  'Mechanic',
  'Plumber',
  'Carpenter',
  'Painter',
  'Handyman',
  'AC Technician',
  'Generator Technician',
  'Other',
];

const SKILL_OPTIONS = [
  'Cleaning',
  'Laundry',
  'Ironing',
  'Childcare',
  'Elderly Care',
  'Cooking',
  'Pet Care',
  'Driving',
  'Gardening',
];

const LANGUAGE_OPTIONS = [
  'English',
  'Yoruba',
  'Igbo',
  'Hausa',
  'Pidgin',
  'French',
];

const splitCsv = (value) =>
  String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const appendCsvValue = (currentValue, nextValue) => {
  const currentItems = splitCsv(currentValue);
  if (currentItems.includes(nextValue)) return currentValue;
  return [...currentItems, nextValue].join(', ');
};

const WorkerOnboarding = () => {
  const navigate = useNavigate();
  const { user, completeWorkerOnboarding } = useAuth();
  const { refreshWorkers } = useData();
  const [formData, setFormData] = useState({
    occupation: '',
    yearsExperience: '',
    hourlyRate: '',
    serviceArea: '',
    skills: '',
    languages: '',
    bio: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onChange = (field) => (event) => {
    setFormData((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const addSkill = (skill) => {
    setFormData((prev) => ({ ...prev, skills: appendCsvValue(prev.skills, skill) }));
  };

  const addLanguage = (language) => {
    setFormData((prev) => ({ ...prev, languages: appendCsvValue(prev.languages, language) }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!formData.occupation.trim()) {
      setError('Occupation is required.');
      return;
    }

    try {
      setIsSubmitting(true);
      await completeWorkerOnboarding({
        occupation: formData.occupation.trim(),
        yearsExperience: formData.yearsExperience ? Number(formData.yearsExperience) : undefined,
        hourlyRate: formData.hourlyRate ? Number(formData.hourlyRate) : undefined,
        serviceArea: splitCsv(formData.serviceArea),
        skills: splitCsv(formData.skills),
        languages: splitCsv(formData.languages),
        bio: formData.bio.trim(),
      });
      await refreshWorkers();
      navigate('/worker-panel');
    } catch (err) {
      setError(err?.message || 'Unable to save worker profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-text-primary pb-20">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <form onSubmit={handleSubmit} className="rounded-3xl border border-border bg-container p-6 shadow-xl sm:p-8">
          <div className="mb-8">
            <p className="text-xs uppercase tracking-[0.18em] text-text-tertiary">Worker setup</p>
            <h1 className="mt-2 text-3xl font-semibold">Complete your worker profile</h1>
            <p className="mt-2 text-text-secondary">
              Hi {user?.fullName || 'there'}, this email is registered as a worker account. Fill these details to continue.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label>
              <span className="mb-1 block text-sm text-text-secondary">Occupation</span>
              <select
                value={formData.occupation}
                onChange={onChange('occupation')}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none transition focus:border-amber"
              >
                <option value="">Select occupation</option>
                {OCCUPATION_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span className="mb-1 block text-sm text-text-secondary">Years of experience</span>
              <input
                type="number"
                min="0"
                value={formData.yearsExperience}
                onChange={onChange('yearsExperience')}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none transition focus:border-amber"
                placeholder="e.g. 3"
              />
            </label>

            <label>
              <span className="mb-1 block text-sm text-text-secondary">Hourly rate (NGN)</span>
              <input
                type="number"
                min="0"
                value={formData.hourlyRate}
                onChange={onChange('hourlyRate')}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none transition focus:border-amber"
                placeholder="e.g. 5000"
              />
            </label>

            <label>
              <span className="mb-1 block text-sm text-text-secondary">Service area (comma separated)</span>
              <input
                type="text"
                value={formData.serviceArea}
                onChange={onChange('serviceArea')}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none transition focus:border-amber"
                placeholder="Ikeja, Lekki"
              />
            </label>

            <label className="sm:col-span-2">
              <span className="mb-1 block text-sm text-text-secondary">Skills (comma separated)</span>
              <input
                type="text"
                value={formData.skills}
                onChange={onChange('skills')}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none transition focus:border-amber"
                placeholder="Laundry, Childcare, Cleaning"
              />
              <div className="mt-2 flex flex-wrap gap-2">
                {SKILL_OPTIONS.map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => addSkill(skill)}
                    className="rounded-full border border-border px-3 py-1 text-xs text-text-secondary hover:border-amber hover:text-text-primary"
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </label>

            <label className="sm:col-span-2">
              <span className="mb-1 block text-sm text-text-secondary">Languages (comma separated)</span>
              <input
                type="text"
                value={formData.languages}
                onChange={onChange('languages')}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none transition focus:border-amber"
                placeholder="English, Yoruba"
              />
              <div className="mt-2 flex flex-wrap gap-2">
                {LANGUAGE_OPTIONS.map((language) => (
                  <button
                    key={language}
                    type="button"
                    onClick={() => addLanguage(language)}
                    className="rounded-full border border-border px-3 py-1 text-xs text-text-secondary hover:border-amber hover:text-text-primary"
                  >
                    {language}
                  </button>
                ))}
              </div>
            </label>

            <label className="sm:col-span-2">
              <span className="mb-1 block text-sm text-text-secondary">Bio</span>
              <textarea
                rows={4}
                value={formData.bio}
                onChange={onChange('bio')}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none transition focus:border-amber"
                placeholder="Tell users about your experience and service quality."
              />
            </label>
          </div>

          {error && (
            <p className="mt-4 rounded-lg border border-error bg-error-light px-3 py-2 text-sm text-text-primary">
              {error}
            </p>
          )}

          <Button type="submit" className="mt-6 w-full" size="lg" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Finish worker setup'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default WorkerOnboarding;
