'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { api, ApiError } from '@/lib/api';
import {
  mapAddress,
  mapBooking,
  mapCategory,
  mapProvider,
  mapService,
  toApiLabel
} from '@/lib/mappers';
import {
  ServiceCategory,
  ServiceItem,
  ServiceAddon,
  Provider,
  Booking,
  Address,
  Coupon,
  NotificationItem
} from '@/lib/marketplace-data';

// Navigation & Layout Components
import CustomerHeader from '@/components/customer/CustomerHeader';
import { CustomerTab } from '@/components/customer/CustomerSidebar';
import CustomerBottomNav from '@/components/customer/CustomerBottomNav';

// Tab Views
import HomeTab from '@/components/customer/HomeTab';
import ExploreTab from '@/components/customer/ExploreTab';
import BookingsTab from '@/components/customer/BookingsTab';
import MessagesTab, { MessagesTabOpenRequest } from '@/components/customer/MessagesTab';
import FavoritesTab from '@/components/customer/FavoritesTab';
import OffersTab from '@/components/customer/OffersTab';
import ProfileTab from '@/components/customer/ProfileTab';
import SettingsTab from '@/components/customer/SettingsTab';
import HelpSupportTab from '@/components/customer/HelpSupportTab';

// Modals & Drawers
import ServiceDetailModal from '@/components/customer/ServiceDetailModal';
import ProviderProfileModal from '@/components/customer/ProviderProfileModal';
import BookingFlowModal, { BookingSubmission } from '@/components/customer/BookingFlowModal';
import LiveTrackingModal from '@/components/customer/LiveTrackingModal';
import ReviewModal from '@/components/customer/ReviewModal';
import BookingDetailModal from '@/components/customer/BookingDetailModal';
import NotificationsDrawer from '@/components/customer/NotificationsDrawer';
import PaymentsModal from '@/components/customer/PaymentsModal';
import LocationModal from '@/components/customer/LocationModal';

const errMsg = (e: unknown, fallback: string) => (e instanceof ApiError || e instanceof Error ? e.message : fallback);

export default function CustomerDashboardPage() {
  const router = useRouter();
  const { user, logout, isReady } = useAuth();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // Route protection: must be a signed-in CUSTOMER
  useEffect(() => {
    if (!isReady) return;
    if (!user) router.replace('/login');
    else if (user.role !== 'customer') router.replace('/provider');
  }, [isReady, user, router]);

  // Active Tab state
  const [activeTab, setActiveTab] = useState<CustomerTab>('home');
  const [selectedLocation, setSelectedLocation] = useState('Select location');

  // Core Data State (all loaded from the backend)
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  // Chat: which conversation to jump to (set by "Message" buttons elsewhere) and the unread badge count.
  const [openChatRequest, setOpenChatRequest] = useState<MessagesTabOpenRequest | null>(null);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

  // Client-only state: the backend has no endpoints for these yet (see AUDIT_REPORT.md)
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [offers] = useState<Coupon[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [walletBalance, setWalletBalance] = useState<number>(0);

  const categoryOfService = useCallback(
    (serviceId: string, list: ServiceItem[] = services) => list.find((sv) => sv.id === serviceId)?.category,
    [services]
  );

  const loadAll = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    setLoadError('');
    try {
      const [apiCats, apiServices, apiProviders, apiAddresses, apiBookings] = await Promise.all([
        api.getCategories(),
        api.getServices(),
        api.getProviders(),
        api.getAddresses(user.id),
        api.getCustomerBookings(user.id)
      ]);
      const svc = apiServices.map(mapService);
      const cats = apiCats.map((c) => mapCategory(c, svc.filter((sv) => sv.categoryId === String(c.id)).length));
      const addrs = apiAddresses.map(mapAddress);
      setServices(svc);
      setCategories(cats);
      setProviders(apiProviders.map((p) => mapProvider(p, cats, svc)));
      setAddresses(addrs);
      setBookings(apiBookings.map((b) => mapBooking(b, categoryOfService(String(b.serviceId), svc))));
      const def = addrs.find((a) => a.isDefault) || addrs[0];
      if (def) setSelectedLocation(`${def.area}, ${def.city}`);
    } catch (e) {
      setLoadError(errMsg(e, 'Could not load your data.'));
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (isReady && user && user.role === 'customer') void loadAll();
  }, [isReady, user, loadAll]);

  // Bottom-nav "Messages" badge: polled independently of the Messages tab itself, so it stays
  // accurate even while the user is on a different tab (the tab's own WebSocket only runs while mounted).
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    const poll = () => {
      api.getUnreadChatCount().then((r) => {
        if (!cancelled) setUnreadMessagesCount(r.unreadCount);
      }).catch(() => {});
    };
    poll();
    const interval = setInterval(poll, 15000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [user]);

  // Explore search & filter transfer
  const [exploreCategory, setExploreCategory] = useState<string>('all');
  const [exploreQuery, setExploreQuery] = useState<string>('');

  // Modals state
  const [serviceModalItem, setServiceModalItem] = useState<ServiceItem | null>(null);
  const [providerModalItem, setProviderModalItem] = useState<Provider | null>(null);
  const [bookingFlowActive, setBookingFlowActive] = useState(false);
  const [bookingFlowService, setBookingFlowService] = useState<ServiceItem | null>(null);
  const [bookingFlowProvider, setBookingFlowProvider] = useState<Provider | null>(null);
  const [bookingFlowAddons, setBookingFlowAddons] = useState<ServiceAddon[]>([]);

  const [activeTrackingBooking, setActiveTrackingBooking] = useState<Booking | null>(null);
  const [activeReviewBooking, setActiveReviewBooking] = useState<Booking | null>(null);
  const [activeInvoiceBooking, setActiveInvoiceBooking] = useState<Booking | null>(null);

  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Active bookings count
  const activeBookingsCount = bookings.filter(
    (b) => b.status === 'Upcoming'
  ).length;

  const unreadNotifsCount = notifications.filter((n) => !n.read).length;

  // Find upcoming booking for Home display
  const upcomingBooking = bookings.find((b) => b.status === 'Upcoming');
  const recentBooking = bookings.find((b) => b.status === 'Completed');

  // HANDLERS
  const handleToggleFavorite = (providerId: string) => {
    setFavorites((prev) =>
      prev.includes(providerId)
        ? prev.filter((id) => id !== providerId)
        : [...prev, providerId]
    );
  };

  const handleSelectCategory = (categoryId: string) => {
    setExploreCategory(categoryId);
    setActiveTab('explore');
  };

  const handleSearchSubmit = (query: string) => {
    setExploreQuery(query);
    setActiveTab('explore');
  };

  const handleStartBookingFlow = (service?: ServiceItem, provider?: Provider) => {
    // A provider can only be booked for services in their own category, so pick a matching service.
    const chosenService =
      service ||
      (provider
        ? services.find((sv) => provider.servicesOffered.some((o) => o.serviceId === sv.id))
        : services[0]);
    if (!chosenService) {
      alert('No services are available to book yet.');
      return;
    }
    setBookingFlowService(chosenService);
    setBookingFlowProvider(provider || null);
    setBookingFlowAddons([]);
    setBookingFlowActive(true);
  };

  /** POST /bookings. Rejects with the backend's message (validation, conflict, forbidden...). */
  const createBooking = async (input: BookingSubmission): Promise<Booking> => {
    if (!user) throw new Error('Please sign in again.');
    const saved = await api.createBooking({
      customerId: user.id,
      providerId: Number(input.provider.id),
      serviceId: Number(input.service.id),
      addressId: Number(input.address.id),
      date: input.date,
      timeSlot: input.timeSlot,
      problemDescription: input.problemDescription || undefined,
      paymentMethod: input.paymentMethod,
      addonIds: input.addons.map((a) => Number(a.id))
    });
    return mapBooking(saved, input.service.category);
  };

  const handleBookingConfirmed = (newBooking: Booking) => {
    setBookings((prev) => [newBooking, ...prev]);
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: `Booking Requested #${newBooking.id} ✓`,
        message: `${newBooking.serviceTitle} with ${newBooking.providerName} requested for ${newBooking.date}.`,
        type: 'booking',
        timestamp: 'Just now',
        read: false
      },
      ...prev
    ]);
  };

  const handleCallProvider = (phone: string, name: string) => {
    alert(`Connecting secure masked call to ${name} (${phone}). Please pick up your phone.`);
  };

  const replaceBooking = (updated: Booking) =>
    setBookings((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));

  /** POST /reviews. Rejects with the backend message so ReviewModal can show it. */
  const handleSubmitReview = async (bookingId: string, rating: number, review: string) => {
    await api.submitReview({ bookingId: Number(bookingId), rating, comment: review || undefined });
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, reviewed: true, ratingGiven: rating, reviewGiven: review } : b))
    );
  };

  const handleAddWalletCredit = (amount: number) => {
    setWalletBalance((prev) => prev + amount);
    const creditNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: `₹${amount} Added to Worksy Wallet 👛`,
      message: `Your updated wallet balance is ₹${walletBalance + amount}.`,
      type: 'payment',
      timestamp: 'Just now',
      read: false
    };
    setNotifications([creditNotif, ...notifications]);
  };

  /** POST /users/{id}/addresses. Rejects with the backend message. */
  const addAddress = async (newAddr: Omit<Address, 'id'>): Promise<Address> => {
    if (!user) throw new Error('Please sign in again.');
    const saved = mapAddress(
      await api.createAddress(user.id, {
        label: toApiLabel(newAddr.label),
        street: newAddr.street,
        area: newAddr.area,
        city: newAddr.city,
        pincode: newAddr.pincode,
        defaultAddress: newAddr.isDefault
      })
    );
    // The backend may have moved the "default" flag to this address, so re-read the list.
    const fresh = (await api.getAddresses(user.id)).map(mapAddress);
    setAddresses(fresh);
    return fresh.find((a) => a.id === saved.id) || saved;
  };

  const handleAddAddress = async (newAddr: Omit<Address, 'id'>) => {
    try {
      await addAddress(newAddr);
    } catch (e) {
      alert(errMsg(e, 'Could not save the address.'));
    }
  };

  /** DELETE /users/{id}/addresses/{addressId} */
  const handleDeleteAddress = async (addrId: string) => {
    if (!user) return;
    try {
      await api.deleteAddress(user.id, Number(addrId));
      setAddresses((prev) => prev.filter((a) => a.id !== addrId));
    } catch (e) {
      alert(errMsg(e, 'Could not delete the address.'));
    }
  };

  /** PATCH /bookings/{id}/cancel */
  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    try {
      const updated = await api.cancelBooking(Number(bookingId));
      replaceBooking(mapBooking(updated, categoryOfService(String(updated.serviceId))));
    } catch (e) {
      alert(errMsg(e, 'Could not cancel the booking.'));
    }
  };

  if (!isReady || !user || user.role !== 'customer') {
    return (
      <div className="min-h-screen bg-[#EDEAE1] flex items-center justify-center text-sm text-stone-600">
        Loading...
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#EDEAE1] flex items-center justify-center text-sm text-stone-600">
        Loading your Worksy dashboard...
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-[#EDEAE1] flex flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="text-sm font-semibold text-rose-700 max-w-md">{loadError}</div>
        <button
          onClick={() => void loadAll()}
          className="px-5 py-2.5 rounded-xl bg-black text-white text-xs font-bold hover:bg-stone-800"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EDEAE1] text-stone-900 flex flex-col selection:bg-stone-300 selection:text-stone-900 font-body">
      {/* Top Customer Header with Navigation & Search */}
      <CustomerHeader
        selectedLocation={selectedLocation}
        onOpenLocationModal={() => setIsLocationModalOpen(true)}
        onOpenWalletModal={() => setIsWalletModalOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        unreadNotifsCount={unreadNotifsCount}
        walletBalance={walletBalance}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onSearchSubmit={handleSearchSubmit}
        activeBookingsCount={activeBookingsCount}
        unreadMessagesCount={unreadMessagesCount}
        favoritesCount={favorites.length}
        onLogout={handleLogout}
      />

      {/* Main Container: Expansive Full-Width Experience without Sidebar */}
      <div className="flex-1 w-full max-w-[1840px] 2xl:max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Dynamic Main Workspace Content */}
        <main className="w-full py-6 min-w-0 overflow-x-hidden">
          {/* TAB 1: HOME */}
          {activeTab === 'home' && (
            <HomeTab
              userName={user?.name?.split(' ')[0] || 'there'}
              selectedLocation={selectedLocation}
              onOpenLocationModal={() => setIsLocationModalOpen(true)}
              categories={categories}
              services={services}
              providers={providers}
              upcomingBooking={upcomingBooking}
              recentBooking={recentBooking}
              offers={offers}
              favorites={favorites}
              onToggleFavorite={handleToggleFavorite}
              onSelectCategory={handleSelectCategory}
              onSelectService={(srv) => setServiceModalItem(srv)}
              onSelectProvider={(pro) => setProviderModalItem(pro)}
              onTrackBooking={(b) => setActiveTrackingBooking(b)}
              onViewBookingDetails={(b) => setActiveInvoiceBooking(b)}
              onBookNow={handleStartBookingFlow}
              onRateService={(b) => setActiveReviewBooking(b)}
              onOpenOffers={() => setActiveTab('offers')}
              setActiveTab={setActiveTab}
            />
          )}

          {/* TAB 2: EXPLORE SERVICES */}
          {activeTab === 'explore' && (
            <ExploreTab
              categories={categories}
              services={services}
              providers={providers}
              selectedLocation={selectedLocation}
              favorites={favorites}
              onToggleFavorite={handleToggleFavorite}
              onSelectService={(srv) => setServiceModalItem(srv)}
              onSelectProvider={(pro) => setProviderModalItem(pro)}
              onBookNow={handleStartBookingFlow}
              initialCategory={exploreCategory}
              initialQuery={exploreQuery}
            />
          )}

          {/* TAB 3: MY BOOKINGS */}
          {activeTab === 'bookings' && (
            <BookingsTab
              bookings={bookings}
              onTrackBooking={(b) => setActiveTrackingBooking(b)}
              onViewBookingDetails={(b) => setActiveInvoiceBooking(b)}
              onMessageProvider={(b) => {
                setOpenChatRequest({
                  otherUserId: Number(b.providerUserId),
                  otherUserName: b.providerName,
                  otherUserAvatarUrl: null,
                  otherUserRole: 'PROVIDER',
                  otherUserPhone: b.providerPhone || null,
                  bookingId: b.id,
                });
                setActiveTab('messages');
              }}
              onRateService={(b) => setActiveReviewBooking(b)}
              onBookAgain={(b) => {
                const srv = services.find((s) => s.id === b.serviceId);
                const pro = providers.find((p) => p.id === b.providerId);
                handleStartBookingFlow(srv, pro);
              }}
              onCancelBooking={handleCancelBooking}
              onViewInvoice={(b) => setActiveInvoiceBooking(b)}
            />
          )}

          {/* TAB 4: MESSAGES */}
          {activeTab === 'messages' && (
            <MessagesTab
              openRequest={openChatRequest}
              onOpenRequestHandled={() => setOpenChatRequest(null)}
              onViewBookingById={(bookingId) => {
                const match = bookings.find((b) => b.id === bookingId);
                if (match) setActiveInvoiceBooking(match);
              }}
            />
          )}

          {/* TAB 5: FAVORITES */}
          {activeTab === 'favorites' && (
            <FavoritesTab
              favoriteProviderIds={favorites}
              providers={providers}
              services={services}
              onToggleFavorite={handleToggleFavorite}
              onSelectProvider={(pro) => setProviderModalItem(pro)}
              onBookNow={handleStartBookingFlow}
            />
          )}

          {/* TAB 6: OFFERS */}
          {activeTab === 'offers' && (
            <OffersTab
              offers={offers}
              onAddWalletCredit={handleAddWalletCredit}
            />
          )}

          {/* TAB 7: PROFILE */}
          {activeTab === 'profile' && (
            <ProfileTab
              addresses={addresses}
              walletBalance={walletBalance}
              onAddAddress={handleAddAddress}
              onDeleteAddress={handleDeleteAddress}
              onOpenWalletModal={() => setIsWalletModalOpen(true)}
              setActiveTab={setActiveTab}
            />
          )}

          {/* TAB 8: SETTINGS */}
          {activeTab === 'settings' && <SettingsTab />}

          {/* TAB 9: HELP & SUPPORT */}
          {activeTab === 'help' && (
            <HelpSupportTab
              onStartSupportChat={() => setActiveTab('messages')}
              setActiveTab={setActiveTab}
            />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <CustomerBottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeBookingsCount={activeBookingsCount}
        unreadMessagesCount={unreadMessagesCount}
      />

      {/* MODALS & DRAWERS */}
      {/* 1. Service Detail Modal */}
      <ServiceDetailModal
        service={serviceModalItem}
        onClose={() => setServiceModalItem(null)}
        onBookNow={(srv, addons) => {
          setServiceModalItem(null);
          setBookingFlowService(srv);
          setBookingFlowAddons(addons);
          setBookingFlowActive(true);
        }}
        providers={providers}
        onSelectProvider={(pro) => {
          setServiceModalItem(null);
          setProviderModalItem(pro);
        }}
      />

      {/* 2. Provider Profile Modal */}
      <ProviderProfileModal
        provider={providerModalItem}
        onClose={() => setProviderModalItem(null)}
        onBookNow={(pro) => {
          setProviderModalItem(null);
          handleStartBookingFlow(undefined, pro);
        }}
        onMessage={(pro) => {
          setProviderModalItem(null);
          setOpenChatRequest({
            otherUserId: Number(pro.userId),
            otherUserName: pro.name,
            otherUserAvatarUrl: null,
            otherUserRole: 'PROVIDER',
            otherUserPhone: pro.phone || null,
          });
          setActiveTab('messages');
        }}
        isFavorite={providerModalItem ? favorites.includes(providerModalItem.id) : false}
        onToggleFavorite={handleToggleFavorite}
      />

      {/* 3. Interactive 5-Step Booking Flow */}
      {bookingFlowActive && (
        <BookingFlowModal
          service={bookingFlowService}
          provider={bookingFlowProvider}
          initialAddons={bookingFlowAddons}
          allServices={services}
          allProviders={providers}
          savedAddresses={addresses}
          coupons={offers}
          walletBalance={walletBalance}
          onClose={() => setBookingFlowActive(false)}
          createBooking={createBooking}
          onAddAddress={addAddress}
          onBookingConfirmed={(newB) => {
            handleBookingConfirmed(newB);
          }}
        />
      )}

      {/* 4. Live GPS Tracking Modal */}
      <LiveTrackingModal
        booking={activeTrackingBooking}
        onClose={() => setActiveTrackingBooking(null)}
        onMessageProvider={(b) => {
          setActiveTrackingBooking(null);
          setOpenChatRequest({
            otherUserId: Number(b.providerUserId),
            otherUserName: b.providerName,
            otherUserAvatarUrl: null,
            otherUserRole: 'PROVIDER',
            otherUserPhone: b.providerPhone || null,
            bookingId: b.id,
          });
          setActiveTab('messages');
        }}
        onCallProvider={handleCallProvider}
      />

      {/* 5. Rating & Review Modal */}
      <ReviewModal
        booking={activeReviewBooking}
        onClose={() => setActiveReviewBooking(null)}
        onSubmitReview={handleSubmitReview}
      />

      {/* 6. Invoice & Booking Detail Modal */}
      <BookingDetailModal
        booking={activeInvoiceBooking}
        onClose={() => setActiveInvoiceBooking(null)}
        onTrack={(b) => {
          setActiveInvoiceBooking(null);
          setActiveTrackingBooking(b);
        }}
      />

      {/* 7. Notifications Drawer */}
      <NotificationsDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkAllRead={() => {
          setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        }}
        onClearAll={() => setNotifications([])}
        onNotificationClick={(notif) => {
          if (notif.type === 'booking') setActiveTab('bookings');
          if (notif.type === 'offer') setActiveTab('offers');
          if (notif.type === 'payment') setIsWalletModalOpen(true);
          setIsNotificationsOpen(false);
        }}
      />

      {/* 8. Wallet & Payment Methods Modal */}
      <PaymentsModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        walletBalance={walletBalance}
        onAddMoney={handleAddWalletCredit}
        bookings={bookings}
        onViewInvoice={(b) => setActiveInvoiceBooking(b)}
      />

      {/* 9. Location Selector Modal */}
      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        currentLocation={selectedLocation}
        onSelectLocation={(loc) => setSelectedLocation(loc)}
      />

      {/* WORKSY Bottom Footer matching screenshot */}
      <footer className="w-full border-t border-[#D6D0C2] bg-[#E2DCCF] py-8 px-6 sm:px-12 text-stone-600 text-xs mt-auto">
        <div className="max-w-[1560px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left: Brand & Tagline */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full border border-stone-800/40 flex items-center justify-center relative">
                <div className="absolute inset-0 rounded-full border-t border-stone-900 rotate-45" />
              </div>
              <span className="font-display text-2xl italic tracking-tightest text-stone-900">
                Worksy
              </span>
            </div>
            <span className="text-stone-500 text-xs hidden sm:inline">
              Local Services. Real People.
            </span>
          </div>

          {/* Center: Policy & Company Links */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-stone-600">
            <button onClick={() => setActiveTab('help')} className="hover:text-stone-900 transition-colors">
              About Us
            </button>
            <button onClick={() => setActiveTab('help')} className="hover:text-stone-900 transition-colors">
              Privacy Policy
            </button>
            <button onClick={() => setActiveTab('help')} className="hover:text-stone-900 transition-colors">
              Terms & Conditions
            </button>
            <button onClick={() => setActiveTab('help')} className="hover:text-stone-900 transition-colors">
              Help Center
            </button>
          </div>

          {/* Right: Social Media Icons */}
          <div className="flex items-center gap-4 text-stone-600">
            {/* Instagram */}
            <a href="#instagram" className="hover:text-stone-900 transition-colors" title="Instagram">
              <svg className="w-4 h-4 fill-none stroke-current" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </a>
            {/* X / Twitter */}
            <a href="#x" className="hover:text-stone-900 transition-colors" title="X">
              <svg className="w-4 h-4 fill-currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            {/* Facebook */}
            <a href="#facebook" className="hover:text-stone-900 transition-colors" title="Facebook">
              <svg className="w-4 h-4 fill-currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>
            {/* LinkedIn */}
            <a href="#linkedin" className="hover:text-stone-900 transition-colors" title="LinkedIn">
              <svg className="w-4 h-4 fill-currentColor" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
              </svg>
            </a>
            {/* YouTube */}
            <a href="#youtube" className="hover:text-stone-900 transition-colors" title="YouTube">
              <svg className="w-4 h-4 fill-currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
