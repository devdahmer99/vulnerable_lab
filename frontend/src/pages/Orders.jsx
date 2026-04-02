import React from 'react'
import { apiCall } from '../services/api'

export default function Orders() {
  const [orders, setOrders] = React.useState([])
  const [selectedOrder, setSelectedOrder] = React.useState(null)
  const [status, setStatus] = React.useState('')
  const [loading, setLoading] = React.useState(true)
  const [searchTerm, setSearchTerm] = React.useState('')
  const [isCreateOpen, setIsCreateOpen] = React.useState(false)
  const [isEditOpen, setIsEditOpen] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const [editingOrderId, setEditingOrderId] = React.useState(null)
  const [form, setForm] = React.useState({
    customer_name: '',
    customer_email: '',
    total: '0',
    status: 'pending',
    notes: '',
  })

  React.useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    try {
      setLoading(true)
      const res = await apiCall('/v1/orders')
      const data = await res.json()
      setOrders(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const viewOrder = async (id) => {
    try {
      const res = await apiCall(`/v1/orders/${id}`)
      const data = await res.json()
      setSelectedOrder(data)
    } catch (err) {
      console.error(err)
    }
  }

  const updateStatus = async (id, newStatus) => {
    try {
      await apiCall(`/v1/orders/${id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      loadOrders()
      setSelectedOrder(null)
    } catch (err) {
      console.error(err)
    }
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchTerm.trim()) return
    try {
      const res = await apiCall(`/v1/orders/search?q=${searchTerm}`)
      const data = await res.json()
      setOrders(data)
    } catch (err) {
      console.error(err)
    }
  }

  const onChangeForm = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const closeModals = () => {
    setIsCreateOpen(false)
    setIsEditOpen(false)
    setEditingOrderId(null)
    setSaving(false)
  }

  const openCreateModal = () => {
    setForm({
      customer_name: '',
      customer_email: '',
      total: '0',
      status: 'pending',
      notes: '',
    })
    setIsCreateOpen(true)
  }

  const openEditModal = (order) => {
    setEditingOrderId(order.id)
    setForm({
      customer_name: order.customer_name || '',
      customer_email: order.customer_email || '',
      total: String(order.total ?? 0),
      status: order.status || 'pending',
      notes: order.notes || '',
    })
    setIsEditOpen(true)
  }

  const createOrder = async (e) => {
    e.preventDefault()
    if (!form.customer_name.trim()) return

    setSaving(true)
    await apiCall('/v1/orders', {
      method: 'POST',
      body: JSON.stringify({ ...form, customer_id: 1 })
    })
    closeModals()
    loadOrders()
  }

  const editOrder = async (e) => {
    e.preventDefault()
    if (!editingOrderId || !form.customer_name.trim()) return

    setSaving(true)
    await apiCall(`/v1/orders/${editingOrderId}`, {
      method: 'PUT',
      body: JSON.stringify(form)
    })
    closeModals()
    loadOrders()
    viewOrder(editingOrderId)
  }

  const deleteOrder = async (id) => {
    if (!confirm(`Excluir pedido #${id}?`)) return
    await apiCall(`/v1/orders/${id}`, { method: 'DELETE' })
    setSelectedOrder(null)
    loadOrders()
  }

  const OrderModal = ({ title, open, onSubmit }) => {
    if (!open) return null

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={closeModals} />
        <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl">
          <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
            <h4 className="text-lg font-semibold text-slate-100">{title}</h4>
            <button onClick={closeModals} className="text-slate-400 hover:text-slate-200">✕</button>
          </div>

          <form onSubmit={onSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-300 mb-1">Cliente</label>
                <input
                  value={form.customer_name}
                  onChange={(e) => onChangeForm('customer_name', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 text-slate-100 rounded-lg focus:ring-2 focus:ring-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-1">Email</label>
                <input
                  type="email"
                  value={form.customer_email}
                  onChange={(e) => onChangeForm('customer_email', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 text-slate-100 rounded-lg focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-1">Total</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.total}
                  onChange={(e) => onChangeForm('total', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 text-slate-100 rounded-lg focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => onChangeForm('status', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 text-slate-100 rounded-lg focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="pending">Pendente</option>
                  <option value="processing">Processando</option>
                  <option value="shipped">Enviado</option>
                  <option value="completed">Entregue</option>
                </select>
              </div>

              <div className="col-span-2">
                <label className="block text-sm text-slate-300 mb-1">Notas (aceita HTML)</label>
                <textarea
                  rows={4}
                  value={form.notes}
                  onChange={(e) => onChangeForm('notes', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 text-slate-100 rounded-lg focus:ring-2 focus:ring-cyan-500"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button type="button" onClick={closeModals} className="px-4 py-2 bg-slate-700 text-slate-100 rounded-lg hover:bg-slate-600">
                Cancelar
              </button>
              <button type="submit" disabled={saving} className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500 disabled:bg-slate-700">
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-xl p-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            placeholder="Buscar por ID, cliente ou referência..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 bg-slate-950 border border-slate-700 text-slate-100 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
          <button type="submit" className="px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500">
            🔍 Buscar
          </button>
          <button type="button" onClick={loadOrders} className="px-4 py-2 bg-slate-700 text-slate-100 rounded-lg hover:bg-slate-600">
            Limpar
          </button>
          <button type="button" onClick={openCreateModal} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500">
            + Novo Pedido
          </button>
        </form>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Orders List */}
        <div className={selectedOrder ? 'col-span-2' : 'col-span-3'}>
          <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-xl overflow-hidden">
            <div className="p-4 border-b border-slate-800">
              <h3 className="font-semibold text-slate-100">Pedidos</h3>
            </div>
            {loading ? (
              <div className="p-8 text-center text-slate-400">Carregando...</div>
            ) : orders.length > 0 ? (
              <div className="divide-y divide-slate-800">
                {orders.map(order => (
                  <div
                    key={order.id}
                    onClick={() => viewOrder(order.id)}
                    className="p-4 hover:bg-slate-800/60 cursor-pointer transition"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-100">Pedido #{order.id}</p>
                        <p className="text-sm text-slate-400">{order.customer_name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-slate-100">R$ {order.total?.toFixed(2)}</p>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          order.status === 'completed' ? 'bg-emerald-500/20 text-emerald-300' :
                          order.status === 'pending' ? 'bg-amber-500/20 text-amber-300' :
                          'bg-slate-700 text-slate-200'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400">Nenhum pedido encontrado</div>
            )}
          </div>
        </div>

        {/* Order Details */}
        {selectedOrder && (
          <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-xl p-6">
            <div className="mb-6">
              <h3 className="font-semibold text-slate-100 mb-4">Detalhes do Pedido #{selectedOrder.id}</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-slate-400">Cliente</p>
                  <p className="font-medium text-slate-100">{selectedOrder.customer_name}</p>
                </div>
                <div>
                  <p className="text-slate-400">Email</p>
                  <p className="font-medium text-slate-100">{selectedOrder.customer_email}</p>
                </div>
                <div>
                  <p className="text-slate-400">Data</p>
                  <p className="font-medium text-slate-100">{new Date(selectedOrder.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-slate-400">Total</p>
                  <p className="font-medium text-lg text-emerald-300">R$ {selectedOrder.total?.toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* Items */}
            {selectedOrder.items && selectedOrder.items.length > 0 && (
              <div className="mb-6 pb-6 border-b border-slate-800">
                <p className="text-sm font-medium text-slate-100 mb-3">Itens</p>
                <div className="space-y-2 text-sm text-slate-300">
                  {selectedOrder.items.map((item, i) => (
                    <div key={i} className="flex justify-between">
                      <span>{item.product_name} x{item.quantity}</span>
                      <span>R$ {item.price?.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Comments */}
            {selectedOrder.notes && (
              <div className="mb-6 pb-6 border-b border-slate-800">
                <p className="text-sm font-medium text-slate-100 mb-2">Anotações</p>
                <div 
                  className="text-sm text-slate-300 bg-slate-950 p-3 rounded border border-slate-800"
                  dangerouslySetInnerHTML={{ __html: selectedOrder.notes }}
                />
              </div>
            )}

            {/* Status Change */}
            <div>
              <p className="text-sm font-medium text-slate-100 mb-2">Status</p>
              <select
                value={status || selectedOrder.status}
                onChange={(e) => updateStatus(selectedOrder.id, e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 text-slate-100 rounded-lg"
              >
                <option value="pending">Pendente</option>
                <option value="processing">Processando</option>
                <option value="shipped">Enviado</option>
                <option value="completed">Entregue</option>
              </select>
            </div>

            <div className="mt-4 flex gap-2">
              <button onClick={() => openEditModal(selectedOrder)} className="flex-1 px-3 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500">
                Editar
              </button>
              <button onClick={() => deleteOrder(selectedOrder.id)} className="flex-1 px-3 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-500">
                Excluir
              </button>
              <button onClick={() => setSelectedOrder(null)} className="px-3 py-2 bg-slate-700 text-slate-100 rounded-lg hover:bg-slate-600">
                Fechar
              </button>
            </div>
          </div>
        )}
      </div>

      <OrderModal title="Novo Pedido" open={isCreateOpen} onSubmit={createOrder} />
      <OrderModal title="Editar Pedido" open={isEditOpen} onSubmit={editOrder} />
    </div>
  )
}
