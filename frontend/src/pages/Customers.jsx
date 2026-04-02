import React from 'react'
import { apiCall } from '../services/api'

export default function Customers() {
  const [customers, setCustomers] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [searchTerm, setSearchTerm] = React.useState('')
  const [isCreateOpen, setIsCreateOpen] = React.useState(false)
  const [isEditOpen, setIsEditOpen] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const [editingCustomerId, setEditingCustomerId] = React.useState(null)
  const [form, setForm] = React.useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    address: '',
  })

  React.useEffect(() => {
    loadCustomers()
  }, [])

  const loadCustomers = async () => {
    try {
      setLoading(true)
      const res = await apiCall('/v1/customers')
      const data = await res.json()
      setCustomers(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchTerm.trim()) return
    try {
      const res = await apiCall(`/v1/customers/search?q=${searchTerm}`)
      const data = await res.json()
      setCustomers(data)
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
    setEditingCustomerId(null)
    setSaving(false)
  }

  const openCreateModal = () => {
    setForm({ name: '', email: '', phone: '', city: '', address: '' })
    setIsCreateOpen(true)
  }

  const openEditModal = (customer) => {
    setEditingCustomerId(customer.id)
    setForm({
      name: customer.name || '',
      email: customer.email || '',
      phone: customer.phone || '',
      city: customer.city || '',
      address: customer.address || '',
    })
    setIsEditOpen(true)
  }

  const createCustomer = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return

    setSaving(true)
    await apiCall('/v1/customers', {
      method: 'POST',
      body: JSON.stringify(form)
    })
    closeModals()
    loadCustomers()
  }

  const editCustomer = async (e) => {
    e.preventDefault()
    if (!editingCustomerId || !form.name.trim()) return

    setSaving(true)
    await apiCall(`/v1/customers/${editingCustomerId}`, {
      method: 'PUT',
      body: JSON.stringify(form)
    })
    closeModals()
    loadCustomers()
  }

  const deleteCustomer = async (customer) => {
    if (!confirm(`Excluir cliente ${customer.name}?`)) return
    await apiCall(`/v1/customers/${customer.id}`, { method: 'DELETE' })
    loadCustomers()
  }

  const CustomerModal = ({ title, open, onSubmit }) => {
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
                <label className="block text-sm text-slate-300 mb-1">Nome</label>
                <input
                  value={form.name}
                  onChange={(e) => onChangeForm('name', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 text-slate-100 rounded-lg focus:ring-2 focus:ring-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => onChangeForm('email', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 text-slate-100 rounded-lg focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-1">Telefone</label>
                <input
                  value={form.phone}
                  onChange={(e) => onChangeForm('phone', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 text-slate-100 rounded-lg focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-1">Cidade</label>
                <input
                  value={form.city}
                  onChange={(e) => onChangeForm('city', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 text-slate-100 rounded-lg focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm text-slate-300 mb-1">Endereço</label>
                <textarea
                  rows={3}
                  value={form.address}
                  onChange={(e) => onChangeForm('address', e.target.value)}
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
            placeholder="Buscar cliente por nome, email ou CPF..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 bg-slate-950 border border-slate-700 text-slate-100 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
          <button type="submit" className="px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500">
            🔍 Buscar
          </button>
          <button type="button" onClick={loadCustomers} className="px-6 py-2 bg-slate-700 text-slate-100 rounded-lg hover:bg-slate-600">
            Limpar
          </button>
          <button type="button" onClick={openCreateModal} className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500">
            + Novo Cliente
          </button>
        </form>
      </div>

      {/* Customers Table */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800">
          <h3 className="font-semibold text-slate-100">Clientes Cadastrados</h3>
        </div>
        {loading ? (
          <div className="p-8 text-center text-slate-400">Carregando...</div>
        ) : customers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-800">
              <thead className="bg-slate-950">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Nome</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Telefone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Cidade</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Pedidos</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Total Gasto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {customers.map(customer => (
                  <tr key={customer.id} className="hover:bg-slate-800/60">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-100">{customer.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{customer.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{customer.phone}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{customer.city}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{customer.order_count || 0}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-emerald-300">R$ {(customer.total_spent || 0).toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <button onClick={() => openEditModal(customer)} className="px-2 py-1 bg-cyan-600 text-white rounded hover:bg-cyan-500">
                          Editar
                        </button>
                        <button onClick={() => deleteCustomer(customer)} className="px-2 py-1 bg-rose-600 text-white rounded hover:bg-rose-500">
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-400">Nenhum cliente encontrado</div>
        )}
      </div>

      <CustomerModal title="Novo Cliente" open={isCreateOpen} onSubmit={createCustomer} />
      <CustomerModal title="Editar Cliente" open={isEditOpen} onSubmit={editCustomer} />
    </div>
  )
}
