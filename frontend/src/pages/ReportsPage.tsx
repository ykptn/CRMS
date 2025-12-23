import { useEffect, useState } from 'react';
import { reportingService, type ReportingSummary } from '../services/reportingService';
import { formatDate } from '../utils/date';

export default function ReportsPage() {
  const [summary, setSummary] = useState<ReportingSummary | null>(null);

  useEffect(() => {
    reportingService.buildReservationReport().then(setSummary);
  }, []);

  if (!summary) {
    return <p>Loading report...</p>;
  }

  return (
    <div>
      <h2>Reservation reports</h2>
      <section style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <article>
          <h3>Status breakdown</h3>
          <ul>
            {Object.entries(summary.statusSummary).map(([status, count]) => (
              <li key={status}>
                {status}: {count}
              </li>
            ))}
          </ul>
        </article>
        <article>
          <h3>Fleet utilization</h3>
          <p>{summary.fleetUtilization}%</p>
        </article>
      </section>
      <section>
        <h3>Revenue by location</h3>
        <ul>
          {summary.revenueByLocation.map((item) => (
            <li key={item.location}>
              {item.location}: ₺{item.total}
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h3>Reservations</h3>
        <table width="100%" cellPadding={12}>
          <thead>
            <tr>
              <th align="left">Reservation</th>
              <th align="left">Member</th>
              <th align="left">Car</th>
              <th align="left">Pick-up</th>
              <th align="left">Drop-off</th>
              <th align="left">Status</th>
              <th align="left">Amount</th>
            </tr>
          </thead>
          <tbody>
            {summary.rows.map((row) => (
              <tr key={row.reservationNumber}>
                <td>{row.reservationNumber}</td>
                <td>{row.memberName}</td>
                <td>{row.carLabel}</td>
                <td>{formatDate(row.pickUpDate)}</td>
                <td>{formatDate(row.dropOffDate)}</td>
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
