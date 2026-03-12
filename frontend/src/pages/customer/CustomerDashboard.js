import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Star, Clock, TrendingUp, ChevronRight, MapPin, Zap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { MOCK_BOOKINGS, MOCK_SERVICES, SERVICE_CATEGORIES } from '../../utils/api';
import { StarRating, StatusBadge, SectionHeader } from '../../components/common/index';

const StatCard = ({ icon, label, value, sub, color = 'brand' }) => {
  const colors = {
    brand: 'text-brand-400 bg-brand-500/10',
    blue:  'text-blue-400 bg-blue-500/10',
    green: 'text-green-400 bg-green-500/10',
    yellow:'text-yellow-400 bg-yellow-500/10',
  };
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-dark-400 text-sm mb-1">{label}</p>
          <p className="font-display font-bold text-2xl text-white">{value}</p>
          {sub && <p className="text-dark-500 text-xs mt-1">{sub}</p>}
        </div>
        <div className={`p-2.5 rounded-xl ${colors[color]}`}>{icon}</div>
      </div>
    </div>
  );
};

export const CustomerDashboard = () => {
  const { user } = useAuth();
  const recentBookings = MOCK_BOOKINGS.slice(0, 3);
  const nearbyServices = MOCK_SERVICES.slice(0, 4);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="relative bg-gradient-to-r from-brand-600 to-brand-500 rounded-2xl p-6 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djZoNnYtNmgtNnptNiA2djZoNnYtNmgtNnptLTYgMGgtNnY2aDZ2LTZ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
        <div className="relative z-10">
          <p className="text-brand-100 text-sm font-medium mb-1">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          <h1 className="font-display font-bold text-2xl text-white mb-2">
            Welcome back, {user?.name?.split(' ')[0] || 'there'}! 👋
          </h1>
          <p className="text-brand-100 text-sm mb-4">What service do you need today?</p>
          <Link to="/customer/services" className="inline-flex items-center gap-2 bg-white text-brand-600 font-semibold px-5 py-2.5 rounded-xl hover:bg-brand-50 transition-colors text-sm shadow-lg">
            <Zap className="w-4 h-4" /> Find Services Near Me
          </Link>
        </div>
        <div className="absolute right-6 bottom-0 text-8xl opacity-20 select-none">🔧</div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Calendar className="w-5 h-5" />} label="Total Bookings" value="8" sub="All time" color="brand" />
        <StatCard icon={<Clock className="w-5 h-5" />} label="Upcoming" value="2" sub="This week" color="blue" />
        <StatCard icon={<Star className="w-5 h-5" />} label="Avg Rating Given" value="4.5" sub="Out of 5" color="yellow" />
        <StatCard icon={<TrendingUp className="w-5 h-5" />} label="Services Used" value="5" sub="Categories" color="green" />
      </div>

      {/* Service Categories */}
      <div>
        <SectionHeader
          title="Browse by Category"
          action={
            <Link to="/customer/services" className="flex items-center gap-1 text-brand-400 hover:text-brand-300 text-sm font-medium transition-colors">
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          }
        />
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
          {SERVICE_CATEGORIES.map(cat => (
            <Link
              key={cat.id}
              to={`/customer/services?category=${cat.name}`}
              className="flex flex-col items-center gap-2 p-3 bg-dark-800 border border-dark-700 rounded-xl hover:border-brand-500/50 hover:bg-dark-700 transition-all group text-center card-hover"
            >
              <span className="text-2xl group-hover:scale-110 transition-transform">{cat.icon}</span>
              <span className="text-xs text-dark-300 group-hover:text-white transition-colors leading-tight">{cat.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Nearby Services */}
      <div>
        <SectionHeader
          title="Nearby Services"
          subtitle={<span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {user?.location || 'Bengaluru'}</span>}
          action={
            <Link to="/customer/services" className="flex items-center gap-1 text-brand-400 hover:text-brand-300 text-sm font-medium transition-colors">
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          }
        />
        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {nearbyServices.map(service => (
            <div key={service.id} className="bg-dark-800 border border-dark-700 rounded-2xl p-4 card-hover group">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 bg-dark-700 rounded-xl flex items-center justify-center text-2xl">
                  {service.image}
                </div>
                {service.verified && (
                  <span className="badge bg-green-500/20 text-green-400 border border-green-500/30 text-[10px]">✓ Verified</span>
                )}
              </div>
              <h4 className="font-semibold text-white text-sm mb-0.5">{service.category}</h4>
              <p className="text-dark-400 text-xs mb-2">{service.provider}</p>
              <div className="flex items-center gap-1 mb-3">
                <StarRating rating={service.rating} size="sm" />
                <span className="text-xs text-dark-400">({service.reviews})</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-brand-400 font-bold text-sm">₹{service.price}</p>
                  <p className="text-dark-500 text-xs">{service.distance}</p>
                </div>
                <Link
                  to={`/customer/services/${service.id}`}
                  className="text-xs bg-brand-500/20 text-brand-400 hover:bg-brand-500 hover:text-white border border-brand-500/30 px-3 py-1.5 rounded-lg transition-all font-medium"
                >
                  Book
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Bookings */}
      <div>
        <SectionHeader
          title="Recent Bookings"
          action={
            <Link to="/customer/bookings" className="flex items-center gap-1 text-brand-400 hover:text-brand-300 text-sm font-medium transition-colors">
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          }
        />
        <div className="bg-dark-800 border border-dark-700 rounded-2xl overflow-hidden">
          {recentBookings.map((booking, i) => (
            <div key={booking.id} className={`flex items-center gap-4 p-4 hover:bg-dark-750 transition-colors ${i < recentBookings.length - 1 ? 'border-b border-dark-700' : ''}`}>
              <div className="w-10 h-10 bg-dark-700 rounded-xl flex items-center justify-center text-lg flex-shrink-0">
                {SERVICE_CATEGORIES.find(c => booking.service.includes(c.name))?.icon || '🔧'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white text-sm truncate">{booking.service}</p>
                <p className="text-dark-400 text-xs">{booking.provider} • {booking.date}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <StatusBadge status={booking.status} />
                <p className="text-brand-400 text-xs font-semibold">₹{booking.price}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
