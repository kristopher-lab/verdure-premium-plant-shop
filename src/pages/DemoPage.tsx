import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { get } from '@/lib/api-client';
import type { Order } from '@shared/types';
import { Skeleton } from '@/components/ui/skeleton';
const fetchOrders = async (): Promise<Order[]> => {
  return get('/api/orders');
};
const processOrderData = (orders: Order[] = []) => {
  const monthlySales: { [key: string]: number } = {};
  orders.forEach(order => {
    const date = new Date(order.createdAt);
    const month = date.toLocaleString('default', { month: 'short', year: 'numeric' });
    if (!monthlySales[month]) {
      monthlySales[month] = 0;
    }
    monthlySales[month] += order.total / 100;
  });
  return Object.entries(monthlySales)
    .map(([name, sales]) => ({ name, sales }))
    .sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime());
};
export function DemoPage() {
  const { data: orders, isLoading } = useQuery({ queryKey: ['orders'], queryFn: fetchOrders });
  const chartData = processOrderData(orders);
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8 md:py-10 lg:py-12">
        <h1 className="text-4xl font-bold font-display mb-8">Analytics Dashboard</h1>
        <div className="h-[400px] w-full" aria-label="Sales chart">
          <h2 className="text-2xl font-semibold mb-4">Monthly Sales</h2>
          {isLoading ? (
            <Skeleton className="w-full h-full" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
                <Legend />
                <Bar dataKey="sales" fill="#27532A" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}