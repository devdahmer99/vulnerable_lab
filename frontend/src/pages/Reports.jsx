import React from 'react'
import { apiCall } from '../services/api'

export default function Reports() {
  const [reportType, setReportType] = React.useState('sales')
  const [dateRange, setDateRange] = React.useState('30')
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState('')
  const [report, setReport] = React.useState(null)

  React.useEffect(() => {
    generateReport()
  }, [])

  const generateReport = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await apiCall(`/v1/reports?type=${reportType}&range=${dateRange}&sort=created_at DESC`)
      const data = await res.json()
      setReport(data)
    } catch (err) {
      setError('Falha ao gerar relatório')
    } finally {
      setLoading(false)
    }
  }

  const exportCsv = () => {
    if (!report) return

    const lines = []
    lines.push('secao,campo,valor')
    lines.push(`metricas,total_orders,${report.metrics?.total_orders ?? 0}`)
    lines.push(`metricas,total_revenue,${report.metrics?.total_revenue ?? 0}`)
    lines.push(`metricas,avg_ticket,${report.metrics?.avg_ticket ?? 0}`)
    lines.push(`metricas,total_customers,${report.metrics?.total_customers ?? 0}`)

    ;(report.daily_sales || []).forEach((d) => {
      lines.push(`vendas_dia,${d.day},${d.revenue}`)
    })

    ;(report.top_products || []).forEach((p) => {
      lines.push(`top_produtos,${String(p.name).replace(/,/g, ' ')},${p.sales}`)
    })

    ;(report.top_customers || []).forEach((c) => {
      lines.push(`top_clientes,${String(c.name).replace(/,/g, ' ')},${c.spent}`)
    })

    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `relatorio-${reportType}-${dateRange}d.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const dailySales = report?.daily_sales || []
  const maxRevenue = Math.max(1, ...dailySales.map((d) => Number(d.revenue || 0)))

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-xl p-6">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Tipo de Relatório</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-4 py-2 bg-slate-950 border border-slate-700 text-slate-100 rounded-lg focus:ring-2 focus:ring-cyan-500"
            >
              <option value="sales">Vendas</option>
              <option value="products">Produtos Mais Vendidos</option>
              <option value="customers">Clientes</option>
              <option value="revenue">Receita</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Período</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-4 py-2 bg-slate-950 border border-slate-700 text-slate-100 rounded-lg focus:ring-2 focus:ring-cyan-500"
            >
              <option value="7">Últimos 7 dias</option>
              <option value="30">Últimos 30 dias</option>
              <option value="90">Últimos 90 dias</option>
              <option value="365">Último ano</option>
            </select>
          </div>

          <div className="flex items-end gap-2">
            <button onClick={generateReport} disabled={loading} className="px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500 w-full disabled:bg-slate-700">
              {loading ? 'Gerando...' : 'Gerar Relatório'}
            </button>
            <button onClick={exportCsv} className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 w-full">
              Exportar CSV
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-rose-500/15 border border-rose-500/30 text-rose-300 rounded-lg p-4">
          {error}
        </div>
      )}

      {/* Report Content */}
      <div className="grid grid-cols-3 gap-6">
        {/* Metrics */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-xl p-6">
          <h3 className="font-semibold text-slate-100 mb-4">Métricas Principais</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-slate-400">Total de Vendas</p>
              <p className="text-2xl font-bold text-slate-100">R$ {Number(report?.metrics?.total_revenue || 0).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Número de Pedidos</p>
              <p className="text-2xl font-bold text-slate-100">{report?.metrics?.total_orders || 0}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Ticket Médio</p>
              <p className="text-2xl font-bold text-slate-100">R$ {Number(report?.metrics?.avg_ticket || 0).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Clientes no Período</p>
              <p className="text-2xl font-bold text-slate-100">{report?.metrics?.total_customers || 0}</p>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="col-span-2 bg-slate-900 rounded-xl border border-slate-800 shadow-xl p-6">
          <h3 className="font-semibold text-slate-100 mb-4">Vendas por Dia</h3>
          <div className="h-80 flex items-end justify-between gap-2">
            {dailySales.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-slate-500">Sem dados no período</div>
            ) : (
              dailySales.map((d) => (
                <div key={d.day} className="flex-1 flex flex-col items-center justify-end h-full">
                  <div
                    className="w-full bg-cyan-500/70 rounded-t"
                    style={{ height: `${Math.max(8, (Number(d.revenue || 0) / maxRevenue) * 100)}%` }}
                    title={`${d.day}: R$ ${Number(d.revenue || 0).toFixed(2)}`}
                  />
                </div>
              ))
            )}
          </div>
          <p className="text-xs text-slate-500 mt-4 text-center">Últimos {dateRange} dias</p>
        </div>
      </div>

      {/* Top Products */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-xl p-6">
          <h3 className="font-semibold text-slate-100 mb-4">Produtos Mais Vendidos</h3>
          <div className="space-y-3">
            {(report?.top_products || []).map((product, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-sm text-slate-300">{i + 1}. {product.name}</span>
                <span className="font-medium text-slate-100">{product.sales} vendas</span>
              </div>
            ))}
            {(report?.top_products || []).length === 0 && <p className="text-sm text-slate-500">Sem dados</p>}
          </div>
        </div>

        <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-xl p-6">
          <h3 className="font-semibold text-slate-100 mb-4">Top Clientes</h3>
          <div className="space-y-3">
            {(report?.top_customers || []).map((customer, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-sm text-slate-300">{i + 1}. {customer.name}</span>
                <span className="font-medium text-emerald-300">R$ {Number(customer.spent || 0).toFixed(2)}</span>
              </div>
            ))}
            {(report?.top_customers || []).length === 0 && <p className="text-sm text-slate-500">Sem dados</p>}
          </div>
        </div>
      </div>

      <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-xl p-6">
        <h3 className="font-semibold text-slate-100 mb-4">Pedidos no Período</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-800">
            <thead className="bg-slate-950">
              <tr>
                <th className="px-4 py-2 text-left text-xs text-slate-400 uppercase">ID</th>
                <th className="px-4 py-2 text-left text-xs text-slate-400 uppercase">Cliente</th>
                <th className="px-4 py-2 text-left text-xs text-slate-400 uppercase">Status</th>
                <th className="px-4 py-2 text-left text-xs text-slate-400 uppercase">Total</th>
                <th className="px-4 py-2 text-left text-xs text-slate-400 uppercase">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {(report?.recent_orders || []).map((o) => (
                <tr key={o.id} className="hover:bg-slate-800/60">
                  <td className="px-4 py-2 text-sm text-slate-200">#{o.id}</td>
                  <td className="px-4 py-2 text-sm text-slate-300">{o.customer_name}</td>
                  <td className="px-4 py-2 text-sm text-slate-300">{o.status}</td>
                  <td className="px-4 py-2 text-sm text-emerald-300">R$ {Number(o.total || 0).toFixed(2)}</td>
                  <td className="px-4 py-2 text-sm text-slate-400">{o.created_at}</td>
                </tr>
              ))}
              {(report?.recent_orders || []).length === 0 && (
                <tr>
                  <td className="px-4 py-4 text-sm text-slate-500" colSpan={5}>Sem pedidos no período</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
