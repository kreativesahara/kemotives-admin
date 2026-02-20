import { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import Badge from "../../utils/badges";
import axiosPrivate from "../../api/axios";
import DashboardSection from "../../layout/dataTable";
import LoadingSpinner from "../../utils/loadingspinner";
import ConditionalViewAll from "../../utils/conditionalViewAll";

const STATUS_VARIANTS = {
  successful: 'success',
  pending: 'warning',
  failed: 'destructive',
};

const RecentSubscriptionPayments = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [payments, setPayments] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchSubscriptionPayments = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data } = await axiosPrivate.get('/api/dashboard/subscriptions');
        if (isMounted) setPayments(data.recentSubscriptionPayments || []);
      } catch (err) {
        console.error('Failed to fetch subscription payments:', err);
        if (isMounted) {
          //   setError('Unable to load subscription payments. Showing fallback data.');
          setPayments([
            {
              id: 1,
              user: { firstname: 'Alice', lastname: 'Smith', email: 'alice@example.com' },
              subscription: { tier: 'Free', name: 'Starter', period: '/month' },
              amount: 0.00,
              currency: 'KES',
              paymentMethod: 'N/A',
              txnId: 'FREE_PLAN',
              status: 'successful',
              createdAt: '2025-04-01T08:30:00Z'
            },
            {
              id: 2,
              user: { firstname: 'Bob', lastname: 'Johnson', email: 'bob@example.com' },
              subscription: { tier: 'Limited', name: 'Growth', period: '/month' },
              amount: 5970.00,
              currency: 'KES',
              paymentMethod: 'MPesa',
              txnId: 'MPESA12345',
              status: 'pending',
              createdAt: '2025-04-15T10:00:00Z'
            },
            {
              id: 3,
              user: { firstname: 'Carol', lastname: 'Ngugi', email: 'carol@example.com' },
              subscription: { tier: 'Premium', name: 'Enterprise', period: '/month' },
              amount: 15880.00,
              currency: 'KES',
              paymentMethod: 'Stripe',
              txnId: 'STRIPE56789',
              status: 'successful',
              createdAt: '2025-04-17T12:15:00Z'
            },
            {
              id: 4,
              user: { firstname: 'Daniel', lastname: 'Otieno', email: 'daniel@example.com' },
              subscription: { tier: 'Limited', name: 'Growth', period: '/month' },
              amount: 5970.00,
              currency: 'KES',
              paymentMethod: 'PayPal',
              txnId: 'PAYPAL33221',
              status: 'failed',
              createdAt: '2025-04-20T09:45:00Z'
            },
          ]);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchSubscriptionPayments();
    return () => { isMounted = false; };
  }, []);

  // Limit displayed payments to 15 items
  const getLimitedPayments = () => {
    return payments.slice(0, 15);
  };

  return (
    <DashboardSection title="Recent Subscription">
      {isLoading ? (
        <div className="py-10 flex justify-center">
          <LoadingSpinner />
        </div>
      ) : (
        <>
          {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr className="border-b">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subscriber</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Txn ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {getLimitedPayments().map(p => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">{`${p.user.firstname} ${p.user.lastname}`}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{p.user.email}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{`${p.subscription.name} (${p.subscription.tier})`}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{p.amount.toLocaleString()} {p.currency}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{p.paymentMethod}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{p.txnId}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Badge variant={STATUS_VARIANTS[p.status] || 'default'}>
                        {p.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">{new Date(p.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ConditionalViewAll to="/subscriptions" entityName="subscriptions" />
        </>
      )}
    </DashboardSection>
  );
};

export default RecentSubscriptionPayments;