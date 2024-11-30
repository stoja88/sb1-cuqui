import { useEffect, useState } from 'react';
import { 
  TicketIcon, 
  Users, 
  Database, 
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowUpRight
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Ticket, Asset } from '../types';
import { Button } from '../components/ui/Button';

interface DashboardStats {
  totalTickets: number;
  openTickets: number;
  resolvedToday: number;
  criticalTickets: number;
  activeAssets: number;
  totalUsers: number;
}

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalTickets: 0,
    openTickets: 0,
    resolvedToday: 0,
    criticalTickets: 0,
    activeAssets: 0,
    totalUsers: 0,
  });
  const [recentTickets, setRecentTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch stats
        const today = new Date().toISOString().split('T')[0];
        
        const [
          { count: totalTickets }, 
          { count: openTickets },
          { count: resolvedToday },
          { count: criticalTickets },
          { count: activeAssets },
          { count: totalUsers },
          { data: recent }
        ] = await Promise.all([
          supabase.from('tickets').select('*', { count: 'exact' }),
          supabase.from('tickets').select('*', { count: 'exact' }).eq('status', 'open'),
          supabase.from('tickets').select('*', { count: 'exact' })
            .eq('status', 'resolved')
            .gte('updated_at', today),
          supabase.from('tickets').select('*', { count: 'exact' })
            .eq('priority', 'critical')
            .eq('status', 'open'),
          supabase.from('assets').select('*', { count: 'exact' }).eq('status', 'active'),
          supabase.from('users').select('*', { count: 'exact' }),
          supabase.from('tickets').select('*')
            .order('created_at', { ascending: false })
            .limit(5)
        ]);

        setStats({
          totalTickets: totalTickets || 0,
          openTickets: openTickets || 0,
          resolvedToday: resolvedToday || 0,
          criticalTickets: criticalTickets || 0,
          activeAssets: activeAssets || 0,
          totalUsers: totalUsers || 0,
        });

        setRecentTickets(recent || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const StatCard = ({ 
    icon: Icon, 
    label, 
    value, 
    color 
  }: { 
    icon: typeof TicketIcon; 
    label: string; 
    value: number; 
    color: string;
  }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${color} bg-opacity-10`}>
          <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
        </div>
        <div className="ml-4">
          <h3 className="text-lg font-medium text-gray-900">{value}</h3>
          <p className="text-sm text-gray-500">{label}</p>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Overview of your IT support system
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          icon={AlertCircle}
          label="Critical Tickets"
          value={stats.criticalTickets}
          color="bg-red-500"
        />
        <StatCard
          icon={Clock}
          label="Open Tickets"
          value={stats.openTickets}
          color="bg-yellow-500"
        />
        <StatCard
          icon={CheckCircle2}
          label="Resolved Today"
          value={stats.resolvedToday}
          color="bg-green-500"
        />
        <StatCard
          icon={TicketIcon}
          label="Total Tickets"
          value={stats.totalTickets}
          color="bg-blue-500"
        />
        <StatCard
          icon={Database}
          label="Active Assets"
          value={stats.activeAssets}
          color="bg-purple-500"
        />
        <StatCard
          icon={Users}
          label="Total Users"
          value={stats.totalUsers}
          color="bg-indigo-500"
        />
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Recent Tickets</h2>
            <Button variant="ghost" size="sm" onClick={() => window.location.href = '/tickets'}>
              View all
              <ArrowUpRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
          <div className="divide-y">
            {recentTickets.map((ticket) => (
              <div key={ticket.id} className="py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      {ticket.title}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {new Date(ticket.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <span className={`
                      px-2 py-1 text-xs rounded-full
                      ${ticket.priority === 'critical' ? 'bg-red-100 text-red-800' :
                        ticket.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                        ticket.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'}
                    `}>
                      {ticket.priority}
                    </span>
                    <span className={`
                      ml-2 px-2 py-1 text-xs rounded-full
                      ${ticket.status === 'open' ? 'bg-blue-100 text-blue-800' :
                        ticket.status === 'in_progress' ? 'bg-purple-100 text-purple-800' :
                        'bg-green-100 text-green-800'}
                    `}>
                      {ticket.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}