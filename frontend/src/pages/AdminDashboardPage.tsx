import { useAdminDashboard } from '../hooks/useAdminDashboard';
import StatisticsWidget from '../components/StatisticsWidget';

export default function AdminDashboardPage() {
  const { state, exportReport } = useAdminDashboard();

  if (state.loading || !state.overview) {
    return <p>Loading dashboard data...</p>;
  }

  if (state.error) {
    return <p>{state.error}</p>;
  }

  const handleExport = async () => {
    const csv = await exportReport();
    if (!csv) {
      return;
    }
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'crms-reservations.csv';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <h1>Operational overview</h1>
      <section style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <StatisticsWidget title="Cars" value={state.overview.totalCars} subtitle="In fleet" />
        <StatisticsWidget
          title="Available"
          value={state.overview.availableCars}
          subtitle="Ready for booking"
        />
        <StatisticsWidget
          title="Active reservations"
          value={state.overview.activeReservations}
          subtitle="Across all branches"
        />
        <StatisticsWidget
          title="Members"
          value={state.overview.totalMembers}
          subtitle="Registered customers"
        />
        <StatisticsWidget
          title="Utilization"
          value={`${state.overview.utilizationRate}%`}
          subtitle="Fleet usage"
        />
        <StatisticsWidget
          title="Revenue (est.)"
          value={`₺${state.overview.monthlyRevenue}`}
          subtitle="All statuses"
        />
      </section>
      <section style={{ marginTop: '2rem' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between' }}>
          <h2>Recent reservations</h2>
          <button type="button" onClick={handleExport}>
            Export CSV
          </button>
        </header>
        <table width="100%" cellPadding={12}>
          <thead>
            <tr>
              <th align="left">Reservation</th>
              <th align="left">Member</th>
              <th align="left">Car</th>
              <th align="left">Status</th>
              <th align="left">Total</th>
            </tr>
          </thead>
          <tbody>
            {state.report?.rows.slice(0, 6).map((row) => (
              <tr key={row.reservationNumber}>
                <td>{row.reservationNumber}</td>
                <td>{row.memberName}</td>
                <td>{row.carLabel}</td>
                <td>{row.status}</td>
                <td>₺{row.totalCost}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
