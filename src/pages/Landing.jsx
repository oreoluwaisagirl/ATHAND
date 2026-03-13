import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { Card, CardContent } from '../components/Card';
import AppIcon from '../components/AppIcon';
import { useData } from '../context/DataContext';
import { resolveAvatar } from '../lib/avatars';

const heroTags = ['Electrician', 'Cleaner', 'Painting', 'Salon', 'Home Move'];

const browseCategories = [
  { id: 'cleaner', label: 'Cleaning', icon: 'cleaning', services: '36+ Service', tone: 'from-[#5c9dff] to-[#3f6ed8]' },
  { id: 'driver', label: 'Home Move', icon: 'truck', services: '19+ Service', tone: 'from-[#ffbb4d] to-[#f08b32]' },
  { id: 'electrician', label: 'Electrician', icon: 'electric', services: '16+ Service', tone: 'from-[#a855f7] to-[#7c3aed]' },
  { id: 'nanny', label: 'Saloon', icon: 'care', services: '24+ Service', tone: 'from-[#ef5da8] to-[#c93a7b]' },
  { id: 'gardener', label: 'Painting', icon: 'paint', services: '32+ Service', tone: 'from-[#63d297] to-[#36b37e]' },
  { id: 'security', label: 'Helping', icon: 'shield', services: '21+ Service', tone: 'from-[#8aa0b8] to-[#61758b]' },
];

const valueCards = [
  { title: 'Service Commitment', text: 'Structured worker profiles and clearer service labels help the marketplace feel dependable during demos.', icon: 'shield' },
  { title: 'Super Experience', text: 'The homepage now follows a polished marketplace rhythm with stronger visual hierarchy and cleaner sections.', icon: 'star' },
  { title: 'Secure Data & Payment', text: 'Bookings, workers, and backend records are now aligned so the UI can support a serious product story.', icon: 'card' },
  { title: 'Dedicated Support', text: 'Core routes remain connected from the home surface, making live navigation safer during your presentation.', icon: 'support' },
];

const articleCards = [
  { title: 'How to present a trusted service marketplace clearly', category: 'Marketplace', tone: 'from-[#4e8ef7] to-[#7fb4ff]' },
  { title: 'Building confidence with verified workers and clean UX', category: 'Trust', tone: 'from-[#f0aa38] to-[#ffd36a]' },
  { title: 'What users expect from service booking interfaces', category: 'Product', tone: 'from-[#ef6ca7] to-[#ff9dc4]' },
];

const SectionHeading = ({ title, accent, actionLabel, onAction }) => (
  <div className="mb-8 flex items-end justify-between gap-4">
    <div>
      <h2 className="text-[2rem] font-black tracking-[-0.04em] text-text-primary sm:text-[2.35rem]">
        {title}{accent ? <> <span className="text-primary">{accent}</span></> : null}
      </h2>
      <p className="mt-3 max-w-xl text-sm leading-7 text-text-tertiary">
        It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout.
      </p>
    </div>
    {actionLabel ? (
      <button onClick={onAction} className="hidden text-sm font-semibold text-text-secondary transition hover:text-primary lg:block">
        {actionLabel}
      </button>
    ) : null}
  </div>
);

const WorkerCard = ({ worker, onClick, imageTone = 'from-sky-200 to-white' }) => (
  <Card className="overflow-hidden rounded-[1.5rem] border border-[#edf0f7] bg-white shadow-[0_18px_40px_rgba(39,55,86,0.08)]">
    <div className={`relative h-52 overflow-hidden bg-gradient-to-br ${imageTone}`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.85),transparent_34%)]" />
      <img
        src={resolveAvatar(worker.avatar, worker.name)}
        alt={worker.name}
        className="absolute inset-x-0 bottom-0 mx-auto h-44 w-44 rounded-[1.5rem] object-cover shadow-xl"
      />
      <div className="absolute right-4 top-4 rounded-full bg-white/95 p-2 text-accent shadow">
        <AppIcon name="card" className="h-4 w-4" />
      </div>
    </div>
    <CardContent className="space-y-4 p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-text-tertiary">
          <img
            src={resolveAvatar(worker.avatar, `${worker.name}-mini`)}
            alt={worker.name}
            className="h-6 w-6 rounded-full object-cover"
          />
          <span>{worker.location}</span>
        </div>
        <div className="flex items-center gap-1 text-xs font-semibold text-accent">
          <AppIcon name="star" className="h-3.5 w-3.5 fill-current stroke-current" />
          <span>{Number(worker.rating || 0).toFixed(1)}</span>
        </div>
      </div>
      <div>
        <h3 className="text-lg font-bold text-text-primary">{worker.name}</h3>
        <p className="mt-1 text-sm text-text-secondary">{worker.categoryId} service specialist</p>
      </div>
      <p className="min-h-[48px] text-sm leading-6 text-text-tertiary">{worker.bio}</p>
      <div className="flex items-center justify-between">
        <p className="text-[2rem] font-black tracking-[-0.04em] text-text-primary">₦{(worker.startingPrice || worker.rate || 0).toLocaleString()}</p>
        <Button variant="accent" size="sm" onClick={onClick}>Book Now</Button>
      </div>
    </CardContent>
  </Card>
);

const ProfessionalStrip = ({ worker, onClick }) => (
  <button onClick={onClick} className="overflow-hidden rounded-[1.4rem] bg-white text-left shadow-[0_16px_35px_rgba(39,55,86,0.08)]">
    <div className="h-48 overflow-hidden bg-gradient-to-br from-slate-800 via-slate-700 to-slate-500">
      <img src={resolveAvatar(worker.avatar, worker.name)} alt={worker.name} className="h-full w-full object-cover" />
    </div>
    <div className="p-4">
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">{worker.categoryId}</p>
      <p className="mt-1 text-lg font-bold text-text-primary">{worker.name}</p>
    </div>
  </button>
);

const Landing = () => {
  const navigate = useNavigate();
  const { getAllWorkers } = useData();
  const workers = getAllWorkers();

  const featuredWorkers = useMemo(
    () => [...workers].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 4),
    [workers]
  );
  const popularWorkers = useMemo(
    () => [...workers].sort((a, b) => (b.completedJobs || 0) - (a.completedJobs || 0)).slice(0, 6),
    [workers]
  );
  const professionalWorkers = useMemo(
    () => [...workers].sort((a, b) => (b.reviews || 0) - (a.reviews || 0)).slice(0, 5),
    [workers]
  );

  return (
    <main className="bg-background pb-24 text-text-primary md:pb-10">
      <section className="relative overflow-hidden bg-[linear-gradient(90deg,#f3ede8_0%,#f3ebf7_100%)]">
        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 pb-24 pt-8 sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:px-10 lg:pb-20 lg:pt-16">
          <div className="relative hidden lg:block">
            <div className="absolute left-8 top-24 grid grid-cols-6 gap-3 opacity-40">
              {Array.from({ length: 48 }).map((_, index) => (
                <span key={index} className="h-1.5 w-1.5 rounded-full bg-[#ffb9a4]" />
              ))}
            </div>
            <div className="relative mx-auto mt-24 h-[500px] w-[500px] rounded-full bg-[#ece7e3]">
              <div className="absolute inset-[22px] overflow-hidden rounded-full bg-white shadow-[0_24px_50px_rgba(39,55,86,0.08)]">
                <img src="/images/hero-service.svg" alt="ATHAND cleaner" className="h-full w-full object-cover" />
              </div>
              <div className="absolute left-8 top-[360px] flex items-center gap-4 rounded-[1.1rem] bg-white px-5 py-4 shadow-[0_18px_40px_rgba(39,55,86,0.12)]">
                <span className="inline-flex h-14 w-14 items-center justify-center rounded-[1rem] bg-accent text-white">
                  <AppIcon name="cleaning" className="h-7 w-7" />
                </span>
                <div>
                  <p className="text-sm font-bold text-text-primary">Cleaning Service</p>
                  <div className="mt-1 flex items-center gap-1 text-accent">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <AppIcon key={index} name="star" className="h-3.5 w-3.5 fill-current stroke-current" />
                    ))}
                  </div>
                </div>
              </div>
              <div className="absolute left-[360px] top-4 rounded-[1.4rem] bg-[#42bfe8] px-7 py-6 text-white shadow-[0_18px_40px_rgba(66,191,232,0.35)]">
                <p className="text-[2.4rem] font-black leading-none">12,978</p>
                <p className="mt-2 text-sm font-medium text-white/88">Happy Clients</p>
              </div>
            </div>
          </div>

          <div className="flex items-center">
            <div className="w-full max-w-3xl">
              <h1 className="text-[3.4rem] font-black leading-[1.02] tracking-[-0.06em] text-text-primary sm:text-[4.4rem] lg:text-[5.2rem]">
                One-stop Solution
                <span className="block">for your <span className="text-accent">Services</span></span>
              </h1>
              <p className="mt-6 text-[1.65rem] font-medium text-text-primary">Order any service, anytime from anywhere</p>

              <div className="mt-8 flex w-full max-w-4xl flex-col overflow-hidden rounded-[1rem] bg-white shadow-[0_22px_50px_rgba(39,55,86,0.08)] md:flex-row">
                <button onClick={() => navigate('/other-help')} className="flex items-center justify-between gap-3 bg-accent px-5 py-4 text-left text-white md:min-w-[180px]">
                  <span className="text-lg font-semibold">New York</span>
                  <AppIcon name="chevronDown" className="h-4 w-4" />
                </button>
                <button onClick={() => navigate('/other-help')} className="flex flex-1 items-center gap-3 px-5 py-4 text-left text-[#b1b1b1]">
                  <AppIcon name="search" className="h-4 w-4" />
                  <span className="text-sm">What are you look for</span>
                </button>
                <button onClick={() => navigate('/other-help')} className="flex items-center justify-center bg-accent px-5 py-4 text-white md:w-[72px]">
                  <AppIcon name="search" className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <span className="text-sm font-semibold text-accent">Popular:</span>
                {heroTags.map((tag) => (
                  <button key={tag} onClick={() => navigate('/other-help')} className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-[#8f8f8f] shadow-sm">
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#f7f3ef]">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-8 lg:px-10">
          <SectionHeading
            title="Brows Category"
            accent=""
            actionLabel="Explore All →"
            onAction={() => navigate('/other-help')}
          />
          <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
            {browseCategories.map((item) => (
              <button
                key={item.id}
                onClick={() => navigate(`/category/${item.id}`)}
                className={`rounded-[1.35rem] bg-gradient-to-br ${item.tone} p-0.5 text-left shadow-[0_16px_30px_rgba(39,55,86,0.08)] transition hover:-translate-y-1`}
              >
                <div className="rounded-[1.25rem] bg-white/92 px-5 py-6">
                  <div className={`inline-flex h-14 w-14 items-center justify-center rounded-[1rem] bg-gradient-to-br ${item.tone} text-white`}>
                    <AppIcon name={item.icon} className="h-6 w-6" />
                  </div>
                  <p className="mt-5 text-lg font-bold text-text-primary">{item.label}</p>
                  <p className="mt-1 text-sm text-text-tertiary">{item.services}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-8 lg:px-10">
        <SectionHeading
            title="Featured Services"
            accent=""
          actionLabel="Explore All →"
          onAction={() => navigate('/house-help-search')}
        />
        <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
          {featuredWorkers.map((worker, index) => (
            <WorkerCard
              key={worker.id}
              worker={worker}
              onClick={() => navigate(`/worker/${worker.categoryId}/${worker.id}`)}
              imageTone={['from-[#ffe08a] to-[#fff5d8]', 'from-[#8fc8ff] to-[#eef7ff]', 'from-[#a8d6ff] to-[#f2f8ff]', 'from-[#9ad4ff] to-[#f3faff]'][index % 4]}
            />
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-12 px-4 py-14 sm:px-8 lg:grid-cols-[0.92fr_1.08fr] lg:px-10">
        <div className="rounded-[2rem] bg-[#faf7f4] p-8 lg:p-10">
          <h2 className="max-w-md text-[3rem] font-black leading-[1.02] tracking-[-0.05em] text-text-primary">
            Why you ChooseThis Marketplace?
          </h2>
          <p className="mt-6 text-sm leading-8 text-text-secondary">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc in rutrum odio, a blandit leo. Mauris placerat vulputate lacus eu eleifend. Donec euismod, metus id consequat egestas, tellus dui fermentum est.
          </p>
          <Button variant="accent" className="mt-8 rounded-md px-6" onClick={() => navigate('/worker-onboarding')}>
            Become A Seller
          </Button>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          {valueCards.map((item) => (
            <Card key={item.title} className="rounded-[1.6rem] border border-[#edf0f7] bg-[#f4f6fb]">
              <CardContent className="p-7">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-white text-primary shadow">
                  <AppIcon name={item.icon} className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-lg font-bold text-text-primary">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-text-tertiary">{item.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-8 lg:px-10">
        <SectionHeading
          title="Popular Services"
          accent=""
          actionLabel="Explore All →"
          onAction={() => navigate('/house-help-search')}
        />
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {popularWorkers.map((worker, index) => (
            <WorkerCard
              key={worker.id}
              worker={worker}
              onClick={() => navigate(`/worker/${worker.categoryId}/${worker.id}`)}
              imageTone={['from-[#b8efff] to-[#effcff]', 'from-[#ffe58d] to-[#fff8dd]', 'from-[#ffb6d6] to-[#ffe7f2]'][index % 3]}
            />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-8 lg:px-10">
        <SectionHeading
          title="Popular"
          accent="Professional Service"
          actionLabel=""
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {professionalWorkers.map((worker) => (
            <ProfessionalStrip
              key={worker.id}
              worker={worker}
              onClick={() => navigate(`/worker/${worker.categoryId}/${worker.id}`)}
            />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-8 lg:px-10">
        <div className="grid items-center gap-8 rounded-[2rem] bg-[#eef5ea] p-8 lg:grid-cols-[0.96fr_1.04fr] lg:p-10">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">Start As Seller</p>
            <h2 className="mt-4 text-[2.7rem] font-black leading-[1.02] tracking-[-0.05em] text-text-primary">
              Add workers and keep your marketplace full.
            </h2>
            <p className="mt-5 max-w-xl text-sm leading-8 text-text-secondary">
              The backend now has seeded workers and service mappings, so the polished homepage can also be backed by real operational data when you present.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button variant="accent" onClick={() => navigate('/worker-onboarding')}>Start Onboarding</Button>
              <Button variant="outline" onClick={() => navigate('/admin')}>Admin Panel</Button>
            </div>
          </div>
          <div className="overflow-hidden rounded-[1.6rem] bg-white shadow-[0_18px_40px_rgba(39,55,86,0.08)]">
            <div className="grid grid-cols-2 gap-0">
              {featuredWorkers.slice(0, 4).map((worker) => (
                <div key={worker.id} className="border border-[#edf0f7] p-4">
                  <div className="h-36 overflow-hidden rounded-[1rem] bg-gradient-to-br from-slate-900 via-slate-700 to-slate-500">
                    <img src={resolveAvatar(worker.avatar, worker.name)} alt={worker.name} className="h-full w-full object-cover" />
                  </div>
                  <p className="mt-3 text-sm font-bold text-text-primary">{worker.name}</p>
                  <p className="text-xs text-text-tertiary">{worker.categoryId} • {worker.location}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-8 lg:px-10">
        <SectionHeading
          title="Recent Blog"
          accent="& Articles"
          actionLabel=""
        />
        <div className="grid gap-6 lg:grid-cols-3">
          {articleCards.map((article) => (
            <Card key={article.title} className="overflow-hidden rounded-[1.6rem] border border-[#edf0f7] bg-white shadow-[0_16px_35px_rgba(39,55,86,0.08)]">
              <div className={`h-44 bg-gradient-to-br ${article.tone}`} />
              <CardContent className="p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{article.category}</p>
                <h3 className="mt-3 text-xl font-bold leading-8 text-text-primary">{article.title}</h3>
                <p className="mt-3 text-sm leading-7 text-text-tertiary">
                  Clean marketplace sections, better hierarchy, and stronger operational credibility for the final presentation.
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <footer className="border-t border-[#e9dfd5] bg-[#f7f3ef]">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-8 md:grid-cols-4 lg:px-10">
          <div className="md:col-span-2">
            <p className="text-2xl font-black uppercase tracking-[0.24em] text-text-primary">ATHAND</p>
            <p className="mt-4 max-w-md text-sm leading-8 text-text-secondary">
              ATHAND is a service marketplace for domestic and technical workers, rebuilt to follow the marketplace reference more closely while keeping your own product identity.
            </p>
          </div>
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-text-primary">Services</p>
            <div className="mt-4 space-y-3 text-sm text-text-secondary">
              <button onClick={() => navigate('/other-help')} className="block hover:text-primary">Categories</button>
              <button onClick={() => navigate('/house-help-search')} className="block hover:text-primary">Service List</button>
              <button onClick={() => navigate('/worker-panel')} className="block hover:text-primary">Dashboard</button>
            </div>
          </div>
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-text-primary">Company</p>
            <div className="mt-4 space-y-3 text-sm text-text-secondary">
              <button onClick={() => navigate('/about-athand')} className="block hover:text-primary">About</button>
              <button onClick={() => navigate('/messages')} className="block hover:text-primary">Messages</button>
              <button onClick={() => navigate('/profile')} className="block hover:text-primary">Account</button>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default Landing;
