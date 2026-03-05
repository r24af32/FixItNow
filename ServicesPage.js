import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, SlidersHorizontal, MapPin, X } from 'lucide-react';
import { api, SERVICE_CATEGORIES } from '../../utils/api';
import { useEffect } from 'react';
import { StarRating, SectionHeader } from '../../components/common/index';

export const ServicesPage = () => {
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('All');
  const [sortBy, setSortBy] = useState('rating');
  const [maxPrice, setMaxPrice] = useState(3000);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [services, setServices] = useState([]);
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const [locationSearch, setLocationSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const getIcon = (category) => {
    return SERVICE_CATEGORIES.find(c => c.name === category)?.icon || "🔧";
  };

  // useEffect(() => {
  //   api.get('/services')
  //     .then(res => {
  //       const enhanced = res.data.map(service => ({
  //       ...service,
  //       rating: service.rating ?? 0,
  //       reviews: service.reviews ?? 0,
  //       verified: service.verified ?? false,   // KEEP BACKEND VALUE
  //       completedJobs: service.completedJobs ?? 0,
  //       image: service.image ?? "🔧",
  //       distance: service.distance ?? ""
  //     }));

  //       setServices(enhanced);
  //       setLoading(false);
  //     })
  //     .catch(err => {
  //       console.error(err);
  //       setLoading(false);
  //     });
  // }, []);

  useEffect(() => {
    const fetchServices = async (loc = "") => {
      try {
        const params = {};

        if (loc.trim()) {
          params.location = loc.trim();
        }

        const res = await api.get('/services', { params });

        setServices(res.data.map(service => ({
          ...service,
          rating: service.rating ?? 0,
          reviews: service.reviews ?? 0,
          verified: service.verified ?? false,
          completedJobs: service.completedJobs ?? 0,
          image: getIcon(service.category),
          distance: service.providerLocation ?? ""
        })));

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchServices(locationSearch);
  }, [locationSearch]);


  

  const filtered = useMemo(() => {
  let list = [...services];

  // Category
  if (selectedCat !== 'All') {
    list = list.filter(s => s.category === selectedCat);
  }

  // Search
  if (search) {
    list = list.filter(s =>
      s.category?.toLowerCase().includes(search.toLowerCase()) ||
      s.providerName?.toLowerCase().includes(search.toLowerCase()) ||
      s.subcategory?.toLowerCase().includes(search.toLowerCase())
    );
  }

  // Price
  list = list.filter(s => s.price <= maxPrice);

  // Verified Only
  if (verifiedOnly) {
    list = list.filter(s => s.verified === true);
  }

  // Sorting
  if (sortBy === 'price_asc') {
    list.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price_desc') {
    list.sort((a, b) => b.price - a.price);
  } else if (sortBy === 'distance') {
    list.sort((a, b) => (a.distance || '').localeCompare(b.distance || ''));
  } else {
    list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }

  return list;
}, [services, search, selectedCat, sortBy, maxPrice, verifiedOnly]);

  if (loading) {
  return (
    <div className="flex items-center justify-center py-20">
      <p className="text-white text-lg">Loading services...</p>
    </div>
  );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <SectionHeader title="Find Services" subtitle="Browse verified professionals near you" />

      {/* Search Bar */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400 pointer-events-none" />

          <input
            type="text"
            placeholder="Search electricians, plumbers, carpenters..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field !pl-12 !pr-10"
          />

          {search && (
            <button
              onClick={() => {
                setSearch('');
                setLocationSearch('');
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl border font-medium text-sm transition-all ${
            showFilters ? 'bg-brand-500 border-brand-500 text-white' : 'bg-dark-800 border-dark-600 text-dark-300 hover:border-brand-500'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span className="hidden sm:inline">Filters</span>
        </button>
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          className="bg-dark-800 border border-dark-600 text-dark-300 rounded-xl px-3 py-3 text-sm focus:border-brand-500 focus:outline-none"
        >
          <option value="rating">Top Rated</option>
          <option value="distance">Nearest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </div>

      <div className="relative flex-1 mt-2">
        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-400" />
        <input
          type="text"
          placeholder="Search by location (city / area)"
          value={locationSearch}
          onChange={e => {
            const val = e.target.value;
            setLocationSearch(val);
            if (!val.trim()) setLocationSearch(val);
          }}
          // onKeyDown={e => e.key === 'Enter' && setUseLocationFilter(true)}
          className="input-field !pl-11"
        />
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-dark-800 border border-dark-700 rounded-2xl p-5 animate-slide-up">
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="text-sm font-medium text-dark-300 mb-3 block">Max Price: ₹{maxPrice}</label>
              <input
                type="range"
                min={200}
                max={3000}
                step={100}
                value={maxPrice}
                onChange={e => setMaxPrice(Number(e.target.value))}
                className="w-full accent-brand-500"
              />
              <div className="flex justify-between text-xs text-dark-500 mt-1">
                <span>₹200</span><span>₹3000</span>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-dark-300 mb-3 block">Verified Only</label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={verifiedOnly}
                  onChange={e => setVerifiedOnly(e.target.checked)}
                  className="accent-brand-500 w-4 h-4"
                />
                <span className="text-dark-300 text-sm">Show verified providers only</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Category Filter Pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {['All', ...SERVICE_CATEGORIES.map(c => c.name)].map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCat(cat)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
              selectedCat === cat
                ? 'bg-brand-500 text-white shadow-glow-sm'
                : 'bg-dark-800 text-dark-400 hover:text-white border border-dark-700 hover:border-brand-500/50'
            }`}
          >
            {cat !== 'All' && <span>{SERVICE_CATEGORIES.find(c => c.name === cat)?.icon}</span>}
            {cat}
          </button>
        ))}
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-dark-400 text-sm">
          <span className="text-white font-semibold">{filtered.length}</span> services found
          {selectedCat !== 'All' && <> in <span className="text-brand-400">{selectedCat}</span></>}
        </p>
        <div className="flex items-center gap-1">
          {['grid', 'list'].map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`p-2 rounded-lg transition-colors ${viewMode === mode ? 'bg-brand-500 text-white' : 'text-dark-400 hover:text-white hover:bg-dark-700'}`}
            >
              {mode === 'grid'
                ? <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16"><path d="M1 2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1H2a1 1 0 01-1-1V2zm5 0a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1H7a1 1 0 01-1-1V2zm5 0a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1h-2a1 1 0 01-1-1V2zM1 7a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1H2a1 1 0 01-1-1V7zm5 0a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1H7a1 1 0 01-1-1V7zm5 0a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1h-2a1 1 0 01-1-1V7zM1 12a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1H2a1 1 0 01-1-1v-2zm5 0a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1H7a1 1 0 01-1-1v-2zm5 0a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1h-2a1 1 0 01-1-1v-2z"/></svg>
                : <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16"><path fillRule="evenodd" d="M2.5 12a.5.5 0 01.5-.5h10a.5.5 0 010 1H3a.5.5 0 01-.5-.5zm0-4a.5.5 0 01.5-.5h10a.5.5 0 010 1H3a.5.5 0 01-.5-.5zm0-4a.5.5 0 01.5-.5h10a.5.5 0 010 1H3a.5.5 0 01-.5-.5z"/></svg>
              }
            </button>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <span className="text-5xl mb-4">🔍</span>
          <h3 className="font-display font-semibold text-xl text-white mb-2">No services found</h3>
          <p className="text-dark-400 text-sm">Try adjusting your filters or search terms</p>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid sm:grid-cols-2 xl:grid-cols-3 gap-4' : 'space-y-3'}>
          {filtered.map(service => (
            <ServiceCard key={service.id} service={service} view={viewMode} />
          ))}
        </div>
      )}
    </div>
  );
};

const ServiceCard = ({ service, view }) => {
  if (view === 'list') {
    return (
      <div className="flex items-center gap-4 bg-dark-800 border border-dark-700 rounded-xl p-4 hover:border-brand-500/40 transition-all group">
        <div className="w-14 h-14 bg-dark-700 rounded-xl flex items-center justify-center text-3xl flex-shrink-0">{service.image}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-semibold text-white">{service.category}</h4>
            <span className="text-dark-500 text-xs">·</span>
            <span className="text-dark-400 text-xs">{service.subcategory}</span>
            {service.verified && <span className="badge bg-green-500/20 text-green-400 border border-green-500/30 text-[10px]">✓ Verified</span>}
          </div>
          <p className="text-dark-400 text-sm">{service.providerName}</p>
          <div className="flex items-center gap-3 mt-1">
            {service.rating > 0 && (
            <div className="flex items-center gap-1">
              <StarRating rating={service.rating} size="sm" />
              <span className="text-xs text-dark-400">
                {service.rating} ({service.reviews})
              </span>
            </div>
            )}
            <span className="flex items-center gap-1 text-xs text-dark-400"><MapPin className="w-3 h-3" />{service.distance}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <p className="font-bold text-brand-400 text-lg">₹{service.price}</p>
          <Link to={`/customer/services/${service.id}`} className="btn-primary py-2 px-4 text-sm">Book Now</Link>
        </div>
      </div>
    );
  }

    return (
    <div className="bg-dark-800 border border-dark-700 rounded-2xl overflow-hidden card-hover group">
      {/* Top */}
      <div className="relative p-5 pb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="w-14 h-14 bg-dark-700 rounded-xl flex items-center justify-center text-3xl">
            {service.image || "🔧"}
          </div>

          <div className="flex flex-col items-end gap-1">
            {service.verified && (
              <span className="badge bg-green-500/20 text-green-400 border border-green-500/30 text-[10px]">
                ✓ Verified
              </span>
            )}

            {service.providerLocation && (
              <span className="text-xs text-dark-400 flex items-center gap-0.5">
                <MapPin className="w-3 h-3" />
                {service.providerLocation}
              </span>
            )}
          </div>
        </div>

        <h4 className="font-display font-semibold text-white mb-0.5">
          {service.category}
        </h4>

        <p className="text-xs text-dark-400 mb-1">
          {service.subcategory}
        </p>

        <p className="text-sm text-dark-300 mb-3 flex items-center gap-1">
          <span className="w-5 h-5 bg-brand-500/20 rounded-full flex items-center justify-center text-[10px]">
            👤
          </span>
          {service.providerName}
        </p>

        {/* Rating Section (Render only if exists) */}
        {service.rating && (
          <>
            <div className="flex items-center gap-2">
              <StarRating rating={service.rating} size="sm" />
              <span className="text-sm font-semibold text-white">
                {service.rating}
              </span>
              <span className="text-dark-500 text-xs">
                ({service.reviews || 0} reviews)
              </span>
            </div>

            {service.completedJobs && (
              <p className="text-dark-500 text-xs mt-1">
                {service.completedJobs} jobs completed
              </p>
            )}
          </>
        )}
      </div>

      {/* Bottom */}
      <div className="border-t border-dark-700 px-5 py-3 flex items-center justify-between bg-dark-900/50">
        <div>
          <p className="text-xs text-dark-500">Starting from</p>
          <p className="font-bold text-brand-400 text-xl">
            ₹{service.price}
          </p>
        </div>

        <Link
          to={`/customer/services/${service.id}`}
          className="btn-primary py-2.5 text-sm"
        >
          Book Now
        </Link>
      </div>
    </div>
  );
};
