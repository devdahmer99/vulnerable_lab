import React from 'react'
import { apiCall } from '../services/api'

export default function Dashboard() {
  const [stats, setStats] = React.useState(null)
  const [recentOrders, setRecentOrders] = React.useState([])
  const [salesSeries, setSalesSeries] = React.useState([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    loadStats()
    loadRecentOrders()
    loadSalesChart()
  }, [])

  const loadStats = async () => {
    try {
      const res = await apiCall('/v1/dashboard')
      const data = await res.json()
      setStats(data)
    } catch (err) {
      console.error(err)
      setStats({ total_orders: 0, total_revenue: 0, pending_orders: 0, customers: 0 })
    }
  }

  const loadRecentOrders = async () => {
    try {
      const res = await apiCall('/v1/orders?limit=5')
      const data = await res.json()
      setRecentOrders(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const loadSalesChart = async () => {
    try {
      const res = await apiCall('/v1/reports?type=sales&range=14&sort=created_at ASC')
      const data = await res.json()
      setSalesSeries(data?.daily_sales || [])
    } catch (err) {
      console.error(err)
      setSalesSeries([])
    }
  }

  const StatCard = ({ icon, label, value, color = 'blue' }) => {
    const colors = {
      blue: 'bg-slate-900 text-cyan-300 border-cyan-500/20',
      green: 'bg-slate-900 text-emerald-300 border-emerald-500/20',
      orange: 'bg-slate-900 text-amber-300 border-amber-500/20',
      purple: 'bg-slate-900 text-fuchsia-300 border-fuchsia-500/20',
    }
    return (
      <div className={`p-6 rounded-lg border ${colors[color]}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium opacity-75">{label}</p>
            <p className="text-3xl font-bold mt-2">{value}</p>
          </div>
          <span className="text-4xl opacity-30">{icon}</span>
        </div>
      </div>
    )
  }

  const maxRevenue = Math.max(1, ...salesSeries.map((item) => Number(item.revenue || 0)))

  return (
    <div className="space-y-6">
      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-4 gap-4">
          <StatCard
            icon="📦"
            label="Total de Pedidos"
            value={stats.total_orders || 0}
            color="blue"
          />
          <StatCard
            icon="💰"
            label="Receita Total"
            value={`R$ ${(stats.total_revenue || 0).toFixed(2)}`}
            color="green"
          />
          <StatCard
            icon="⏳"
            label="Pedidos Pendentes"
            value={stats.pending_orders || 0}
            color="orange"
          />
          <StatCard
            icon="👥"
            label="Clientes"
            value={stats.customers || 0}
            color="purple"
          />
        </div>
      )}

      {/* Recent Orders */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-xl">
          <div className="p-6 border-b border-slate-800">
            <h3 className="font-semibold text-slate-100 text-lg">Pedidos Recentes</h3>
          </div>
          <div className="divide-y divide-slate-800">
            {recentOrders.length > 0 ? (
              recentOrders.map(order => (
                <div key={order.id} className="p-4 hover:bg-slate-800/60 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-100">#{order.id}</p>
                      <p className="text-sm text-slate-400">{order.customer_name}</p>
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      order.status === 'completed' ? 'bg-emerald-500/20 text-emerald-300' :
                      order.status === 'pending' ? 'bg-amber-500/20 text-amber-300' :
                      'bg-cyan-500/20 text-cyan-300'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-slate-300">
                    R$ {order.total?.toFixed(2)}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-400">Nenhum pedido</div>
            )}
          </div>
        </div>

        {/* Activity Chart (Placeholder) */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-xl p-6">
          <h3 className="font-semibold text-slate-100 text-lg mb-4">Atividade</h3>
          <div className="h-64 border border-slate-800 rounded bg-slate-950 p-4">
            {salesSeries.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <p className="text-slate-500">Sem dados para o período</p>
              </div>
            ) : (
              <div className="h-full flex items-end gap-2">
                {salesSeries.map((item) => {
                  const revenue = Number(item.revenue || 0)
                  const height = Math.max(8, Math.round((revenue / maxRevenue) * 100))
                  return (
                    <div key={item.day} className="flex-1 h-full flex flex-col justify-end items-center">
                      <div
                        className="w-full max-w-8 bg-cyan-500/70 hover:bg-cyan-400 rounded-t transition-colors"
                        style={{ height: `${height}%` }}
                        title={`${item.day} - R$ ${revenue.toFixed(2)}`}
                      />
                      <span className="mt-2 text-[10px] text-slate-500">
                        {String(item.day).slice(5)}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
