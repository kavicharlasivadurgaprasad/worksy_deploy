'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { api, ApiError } from '@/lib/api';
import { mapJob, mapReview } from '@/lib/mappers';
import {
  JobStatus,
  ProviderJob,
  ProviderOffer,
  ProviderNotification,
  ProviderReviewItem
} from '@/lib/provider-data';

import { ProviderMainTab, EarningsSubTab } from '@/components/provider/ProviderSidebar';
import ProviderHeader from '@/components/provider/ProviderHeader';
import DashboardTab from '@/components/provider/DashboardTab';
import JobsTab from '@/components/provider/JobsTab';
import CalendarTab from '@/components/provider/CalendarTab';
import MessagesTab, { MessagesTabOpenRequest } from '@/components/provider/MessagesTab';
import CustomersTab from '@/components/provider/CustomersTab';
import EarningsTab from '@/components/provider/EarningsTab';
import ReviewsTab from '@/components/provider/ReviewsTab';
import AnalyticsTab from '@/components/provider/AnalyticsTab';
import OffersTab from '@/components/provider/OffersTab';
import ProfileTab from '@/components/provider/ProfileTab';
import SettingsTab from '@/components/provider/SettingsTab';
import HelpTab from '@/components/provider/HelpTab';

import JobDetailsModal from '@/components/provider/JobDetailsModal';
import OngoingJobModal from '@/components/provider/OngoingJobModal';
import CompleteJobModal, { AdditionalPart } from '@/components/provider/CompleteJobModal';
import WithdrawModal from '@/components/provider/WithdrawModal';
import CreateOfferModal from '@/components/provider/CreateOfferModal';
import NotificationsDrawer from '@/components/provider/NotificationsDrawer';
import ProviderOnboarding from '@/components/provider/ProviderOnboarding';

const errMsg = (e: unknown, fallback: string) => (e instanceof ApiError || e instanceof Error ? e.message : fallback);

export default function ProviderDashboardPage() {
  const router = useRouter();
  const { user, isReady, switchRole, logout } = useAuth();

  // Route protection: must be a signed-in PROVIDER
  useEffect(() => {
    if (!isReady) return;
    if (!user) router.replace('/login');
    else if (user.role !== 'provider') router.replace('/customer');
  }, [isReady, user, router]);

  // Navigation State
  const [activeTab, setActiveTab] = useState<ProviderMainTab>('dashboard');
  const [activeJobSubTab, setActiveJobSubTab] = useState<JobStatus>('New Requests');
  const [activeEarningsSubTab, setActiveEarningsSubTab] = useState<EarningsSubTab>('overview');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Operational State
  const [isOnline, setIsOnline] = useState(true);
  const [providerSkills, setProviderSkills] = useState<string[]>(user?.category ? [user.category] : []);
  const [jobs, setJobs] = useState<ProviderJob[]>([]);
  const [reviews, setReviews] = useState<ProviderReviewItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  // Client-only (no backend endpoints yet, see AUDIT_REPORT.md)
  const [withdrawn, setWithdrawn] = useState(0);
  const [offers, setOffers] = useState<ProviderOffer[]>([]);
  const [notifications, setNotifications] = useState<ProviderNotification[]>([]);

  // Chat: which conversation to jump to (set by "Message" buttons elsewhere) and the unread badge count.
  const [openChatRequest, setOpenChatRequest] = useState<MessagesTabOpenRequest | null>(null);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

  // Bookings are already scoped to this provider by GET /bookings/provider/{id}: no client-side skill filtering.
  // Balance = 90% of completed job totals (10% platform commission, same rate the UI already displayed) minus local withdrawals.
  const availableBalance = Math.max(
    0,
    jobs.filter((j) => j.status === 'Completed').reduce((sum, j) => sum + Math.round((j.finalAmount ?? 0) * 0.9), 0) - withdrawn
  );

  const providerId = user?.providerId;
  const category = user?.category || '';

  const loadJobs = useCallback(async () => {
    if (!providerId) return;
    setIsLoading(true);
    setLoadError('');
    try {
      const [bookings, revs] = await Promise.all([api.getProviderBookings(providerId), api.getProviderReviews(providerId)]);
      setJobs(bookings.map((b) => mapJob(b, category)));
      setReviews(revs.map(mapReview));
    } catch (e) {
      setLoadError(errMsg(e, 'Could not load your jobs.'));
    } finally {
      setIsLoading(false);
    }
  }, [providerId, category]);

  useEffect(() => {
    if (isReady && user?.role === 'provider' && providerId) void loadJobs();
  }, [isReady, user, providerId, loadJobs]);

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

  // Modals state
  const [selectedJobForDetails, setSelectedJobForDetails] = useState<ProviderJob | null>(null);
  const [selectedJobForOngoing, setSelectedJobForOngoing] = useState<ProviderJob | null>(null);
  const [selectedJobForComplete, setSelectedJobForComplete] = useState<ProviderJob | null>(null);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [createOfferModalOpen, setCreateOfferModalOpen] = useState(false);

  // Badge Counts
  const newRequestsCount = jobs.filter((j) => j.status === 'New Requests').length;
  const ongoingCount = jobs.filter((j) => j.status === 'Ongoing').length;
  const unreadNotifsCount = notifications.filter((n) => !n.read).length;

  // Actions (each one calls the backend, then replaces the job with the server's version)
  const applyServerJob = (b: Awaited<ReturnType<typeof api.acceptBooking>>) => {
    const updated = mapJob(b, category);
    setJobs((prev) => prev.map((j) => (j.id === updated.id ? updated : j)));
    return updated;
  };

  /** PATCH /bookings/{id}/accept */
  const handleAcceptLead = async (jobId: string) => {
    try {
      const updated = applyServerJob(await api.acceptBooking(Number(jobId)));
      setNotifications((prev) => [
        {
          id: `notif-${Date.now()}`,
          type: 'booking',
          title: 'Booking Accepted',
          message: `You accepted ${updated.serviceTitle} for ${updated.customerName}.`,
          timestamp: 'Just now',
          read: false,
          jobId
        },
        ...prev
      ]);
    } catch (e) {
      alert(errMsg(e, 'Could not accept the job.'));
      void loadJobs();
    }
  };

  /** PATCH /bookings/{id}/decline */
  const handleDeclineLead = async (jobId: string) => {
    try {
      applyServerJob(await api.declineBooking(Number(jobId)));
    } catch (e) {
      alert(errMsg(e, 'Could not decline the job.'));
      void loadJobs();
    }
  };

  /** PATCH /bookings/{id}/start with the customer's OTP (verified by the server). Rejects on a wrong OTP. */
  const handleVerifyOtp = async (jobId: string, otp: string) => {
    applyServerJob(await api.startBooking(Number(jobId), otp));
  };

  /** PATCH /bookings/{id}/complete. Rejects so CompleteJobModal can show the error. */
  const handleJobCompleted = async (jobId: string, _finalPrice: number, _parts: AdditionalPart[], _notes: string) => {
    // NOTE: the backend records completion only. Extra parts / a changed final price are not stored yet.
    const updated = applyServerJob(await api.completeBooking(Number(jobId)));
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        type: 'payment',
        title: `₹${Math.round((updated.finalAmount ?? 0) * 0.9).toLocaleString('en-IN')} Credited`,
        message: `Job ${jobId} completed. Earnings added to your available balance.`,
        timestamp: 'Just now',
        read: false,
        jobId
      },
      ...prev
    ]);
  };

  const handleWithdrawSuccess = (amount: number) => {
    setWithdrawn((prev) => prev + amount);
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        type: 'payment',
        title: `Withdrawal of ₹${amount.toLocaleString('en-IN')} Initiated`,
        message: `IMPS transfer submitted. Funds will reflect in your account within 15 minutes.`,
        timestamp: 'Just now',
        read: false
      },
      ...prev
    ]);
  };

  const handleSwitchToCustomer = () => {
    switchRole('customer'); // roles are fixed per account: signs out and opens the customer login
  };

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardTab
            jobs={jobs}
            reviews={reviews}
            onAcceptLead={handleAcceptLead}
            onDeclineLead={handleDeclineLead}
            onSelectJob={(job) => setSelectedJobForDetails(job)}
            onStartNavigation={(job) => setSelectedJobForOngoing(job)}
            setActiveTab={setActiveTab}
          />
        );

      case 'jobs':
        return (
          <JobsTab
            jobs={jobs}
            activeSubTab={activeJobSubTab}
            setActiveSubTab={setActiveJobSubTab}
            onAcceptLead={handleAcceptLead}
            onDeclineLead={handleDeclineLead}
            onSelectJob={(job) => setSelectedJobForDetails(job)}
            onStartNavigation={(job) => setSelectedJobForOngoing(job)}
            onOpenCompleteModal={(job) => setSelectedJobForComplete(job)}
            providerSkills={providerSkills}
            onGoToProfile={() => setActiveTab('profile')}
          />
        );

      case 'calendar':
        return (
          <CalendarTab
            jobs={jobs}
            onSelectJob={(job) => setSelectedJobForDetails(job)}
          />
        );

      case 'messages':
        return (
          <MessagesTab
            openRequest={openChatRequest}
            onOpenRequestHandled={() => setOpenChatRequest(null)}
          />
        );

      case 'customers':
        return (
          <CustomersTab
            onOpenCustomerChat={() => setActiveTab('messages')}
          />
        );

      case 'earnings':
        return (
          <EarningsTab
            activeSubTab={activeEarningsSubTab}
            setActiveSubTab={setActiveEarningsSubTab}
            onOpenWithdrawModal={() => setWithdrawModalOpen(true)}
            availableBalance={availableBalance}
            jobs={jobs}
          />
        );

      case 'reviews':
        return <ReviewsTab reviews={reviews} businessName={user?.businessName} />;

      case 'analytics':
        return <AnalyticsTab jobs={jobs} />;

      case 'offers':
        return (
          <OffersTab
            offers={offers}
            onOpenCreateOfferModal={() => setCreateOfferModalOpen(true)}
          />
        );

      case 'profile':
        return (
          <ProfileTab
            providerSkills={providerSkills}
            onUpdateSkills={setProviderSkills}
          />
        );

      case 'settings':
        return <SettingsTab onSwitchToCustomer={handleSwitchToCustomer} />;

      case 'help':
        return <HelpTab onOpenLiveChat={() => setActiveTab('messages')} />;

      default:
        return (
          <DashboardTab
            jobs={jobs}
            reviews={reviews}
            onAcceptLead={handleAcceptLead}
            onDeclineLead={handleDeclineLead}
            onSelectJob={(job) => setSelectedJobForDetails(job)}
            onStartNavigation={(job) => setSelectedJobForOngoing(job)}
            setActiveTab={setActiveTab}
          />
        );
    }
  };

  if (!isReady || !user || user.role !== 'provider') {
    return <div className="min-h-screen bg-[#EDEAE1] flex items-center justify-center text-sm text-stone-600">Loading...</div>;
  }
  if (!user.providerId) return <ProviderOnboarding />;
  if (isLoading) {
    return <div className="min-h-screen bg-[#EDEAE1] flex items-center justify-center text-sm text-stone-600">Loading your jobs...</div>;
  }
  if (loadError) {
    return (
      <div className="min-h-screen bg-[#EDEAE1] flex flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="text-sm font-semibold text-rose-700 max-w-md">{loadError}</div>
        <button onClick={() => void loadJobs()} className="px-5 py-2.5 rounded-xl bg-black text-white text-xs font-bold">Try again</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EDEAE1] text-stone-900 flex flex-col font-body antialiased selection:bg-amber-200 selection:text-stone-900">
      {/* Top Operations Header with Navbar Tabs & Profile Picture Dropdown */}
      <ProviderHeader
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isOnline={isOnline}
        onToggleOnline={() => setIsOnline(!isOnline)}
        unreadNotifsCount={unreadNotifsCount}
        onOpenNotifications={() => setNotificationsOpen(true)}
        newRequestsCount={newRequestsCount}
        unreadMessagesCount={unreadMessagesCount}
        onSwitchToCustomer={handleSwitchToCustomer}
        onLogout={() => {
          logout();
          router.push('/login');
        }}
      />

      {/* Main Container: Expansive Full-Width Experience matching Customer page */}
      <div className="flex-1 w-full max-w-[1840px] 2xl:max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
        <main className="w-full py-6 min-w-0 overflow-x-hidden animate-in fade-in duration-150">
          {renderTabContent()}
        </main>
      </div>

      {/* Modals & Drawers */}
      <JobDetailsModal
        job={selectedJobForDetails}
        onClose={() => setSelectedJobForDetails(null)}
        onAccept={handleAcceptLead}
        onDecline={handleDeclineLead}
        onStartJob={(job) => {
          setSelectedJobForDetails(null);
          setSelectedJobForOngoing(job);
        }}
        onCompleteJob={(job) => {
          setSelectedJobForDetails(null);
          setSelectedJobForComplete(job);
        }}
        onOpenChat={(job) => {
          setSelectedJobForDetails(null);
          setOpenChatRequest({
            otherUserId: Number(job.customerId),
            otherUserName: job.customerName,
            otherUserAvatarUrl: null,
            otherUserRole: 'CUSTOMER',
            otherUserPhone: job.customerPhone || null,
            jobId: job.id,
          });
          setActiveTab('messages');
        }}
      />

      <OngoingJobModal
        job={selectedJobForOngoing}
        onClose={() => setSelectedJobForOngoing(null)}
        onVerifyOtp={handleVerifyOtp}
        onProceedToComplete={(job) => {
          setSelectedJobForOngoing(null);
          setSelectedJobForComplete(job);
        }}
        onOpenChat={(job) => {
          setSelectedJobForOngoing(null);
          setOpenChatRequest({
            otherUserId: Number(job.customerId),
            otherUserName: job.customerName,
            otherUserAvatarUrl: null,
            otherUserRole: 'CUSTOMER',
            otherUserPhone: job.customerPhone || null,
            jobId: job.id,
          });
          setActiveTab('messages');
        }}
      />

      <CompleteJobModal
        job={selectedJobForComplete}
        onClose={() => setSelectedJobForComplete(null)}
        onJobCompleted={handleJobCompleted}
      />

      {withdrawModalOpen && (
        <WithdrawModal
          isOpen={withdrawModalOpen}
          availableBalance={availableBalance}
          onClose={() => setWithdrawModalOpen(false)}
          onWithdrawSuccess={handleWithdrawSuccess}
        />
      )}

      {createOfferModalOpen && (
        <CreateOfferModal
          isOpen={createOfferModalOpen}
          onClose={() => setCreateOfferModalOpen(false)}
          onOfferCreated={(offer) => setOffers((prev) => [offer, ...prev])}
        />
      )}

      <NotificationsDrawer
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        notifications={notifications}
        onMarkAllAsRead={() => {
          setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        }}
        onSelectNotification={(notif) => {
          setNotificationsOpen(false);
          if (notif.type === 'lead') {
            setActiveTab('jobs');
            setActiveJobSubTab('New Requests');
          } else if (notif.type === 'booking') {
            setActiveTab('jobs');
            setActiveJobSubTab('Upcoming');
          } else if (notif.type === 'payment') {
            setActiveTab('earnings');
            setActiveEarningsSubTab('overview');
          } else if (notif.type === 'review') {
            setActiveTab('reviews');
          }
        }}
      />
    </div>
  );
}
