import { useNavigate } from 'react-router-dom';
import { Users, TrendingUp, Wallet } from 'lucide-react';
import { PartnerTableToolbar } from '../components/table/PartnerTableToolbar';
import { PartnerDirectoryTable } from '../components/table/PartnerDirectoryTable';
import { PartnerMetricCard } from '../components/shared';
import { usePartnersDirectory } from '../hooks/usePartnersDirectory';

export function PartnersDirectoryPage() {
  const navigate = useNavigate();
  const { partners, isLoading, filters, setFilters, aggregates, refresh } = usePartnersDirectory();

  const handleFiltersChange = (nextFilters: typeof filters) => {
    setFilters(() => nextFilters);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#03030B] via-[#0A0A1A] to-[#05040B] px-6 pb-32 pt-12 text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="space-y-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-semibold bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent">
              Partnerships Directory
            </h1>
            <p className="mt-2 text-sm text-white/60">
              Track every partner, their pipeline impact, and commission status in a single control centre.
            </p>
          </div>

          <section className="grid gap-4 md:grid-cols-3">
            <PartnerMetricCard
              title="Active Partners"
              value={aggregates.activePartners.toString()}
              icon={Users}
              hint={`${partners.length} total partners`}
            />
            <PartnerMetricCard
              title="Pipeline Influence"
              value={`£${aggregates.totalRevenue.toLocaleString()}`}
              icon={TrendingUp}
              hint="Combined revenue influenced"
            />
            <PartnerMetricCard
              title="Commission Owed"
              value={`£${aggregates.totalCommission.toLocaleString()}`}
              icon={Wallet}
              hint="Pending payouts"
            />
          </section>
        </header>

        <PartnerTableToolbar
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onRefresh={() => void refresh()}
          onAddPartner={() => navigate('/partner/create')}
        />

        <PartnerDirectoryTable
          partners={partners}
          searchQuery={filters.search}
          onSearchChange={(query) => setFilters((prev) => ({ ...prev, search: query }))}
          onOpenPartner={(partnerId) => navigate(`/partner/${partnerId}`)}
        />
        {isLoading && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/60">
            Syncing latest partner data…
          </div>
        )}
      </div>
    </div>
  );
}
