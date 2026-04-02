import React from 'react'
import { apiCall } from '../services/api'

export default function Products() {
  const [products, setProducts] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [isCreateOpen, setIsCreateOpen] = React.useState(false)
  const [isEditOpen, setIsEditOpen] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const [editingProductId, setEditingProductId] = React.useState(null)
  const [form, setForm] = React.useState({
    name: '',
    description: '',
    price: '0',
    stock: '0',
    sku: '',
  })

  React.useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const res = await apiCall('/v1/products')
      const data = await res.json()
      setProducts(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const openCreateModal = () => {
    setForm({
      name: '',
      description: '',
      price: '0',
      stock: '0',
      sku: `SKU-${Date.now()}`,
    })
    setIsCreateOpen(true)
  }

  const openEditModal = (product) => {
    setEditingProductId(product.id)
    setForm({
      name: product.name || '',
      description: product.description || '',
      price: String(product.price ?? 0),
      stock: String(product.stock ?? 0),
      sku: product.sku || `SKU-${Date.now()}`,
    })
    setIsEditOpen(true)
  }

  const closeModals = () => {
    setIsCreateOpen(false)
    setIsEditOpen(false)
    setEditingProductId(null)
    setSaving(false)
  }

  const onChangeForm = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const createProduct = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return

    setSaving(true)

    await apiCall('/v1/products', {
      method: 'POST',
      body: JSON.stringify(form)
    })
    closeModals()
    loadProducts()
  }

  const editProduct = async (e) => {
    e.preventDefault()
    if (!editingProductId || !form.name.trim()) return

    setSaving(true)

    await apiCall(`/v1/products/${editingProductId}`, {
      method: 'PUT',
      body: JSON.stringify(form)
    })
    closeModals()
    loadProducts()
  }

  const deleteProduct = async (product) => {
    if (!confirm(`Excluir produto ${product.name}?`)) return
    await apiCall(`/v1/products/${product.id}`, { method: 'DELETE' })
    loadProducts()
  }

  const ProductModal = ({ title, onSubmit, open }) => {
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
              <div className="col-span-2">
                <label className="block text-sm text-slate-300 mb-1">Nome</label>
                <input
                  value={form.name}
                  onChange={(e) => onChangeForm('name', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 text-slate-100 rounded-lg focus:ring-2 focus:ring-cyan-500"
                  placeholder="Nome do produto"
                  required
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm text-slate-300 mb-1">Descrição</label>
                <textarea
                  value={form.description}
                  onChange={(e) => onChangeForm('description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 text-slate-100 rounded-lg focus:ring-2 focus:ring-cyan-500"
                  placeholder="Descrição do produto"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-1">Preço</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => onChangeForm('price', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 text-slate-100 rounded-lg focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-1">Estoque</label>
                <input
                  type="number"
                  value={form.stock}
                  onChange={(e) => onChangeForm('stock', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 text-slate-100 rounded-lg focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm text-slate-300 mb-1">SKU</label>
                <input
                  value={form.sku}
                  onChange={(e) => onChangeForm('sku', e.target.value)}
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
      {/* Add Product Button */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-xl p-4 flex justify-between items-center">
        <h3 className="font-semibold text-slate-100">Gestão de Produtos</h3>
        <button onClick={openCreateModal} className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500">
          + Novo Produto
        </button>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="p-8 text-center text-slate-400">Carregando...</div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(product => (
            <div key={product.id} className="bg-slate-900 rounded-xl border border-slate-800 shadow-xl overflow-hidden hover:border-cyan-500/30 transition">
              {/* Product Image */}
              <div className="h-48 bg-slate-950 flex items-center justify-center border-b border-slate-800">
                <span className="text-4xl">🛍️</span>
              </div>
              
              {/* Product Info */}
              <div className="p-4">
                <h4 className="font-semibold text-slate-100 mb-2">{product.name}</h4>
                <p className="text-sm text-slate-400 mb-4 line-clamp-2">{product.description}</p>
                
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-emerald-300">R$ {product.price?.toFixed(2)}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    product.stock > 0 
                      ? 'bg-emerald-500/20 text-emerald-300' 
                      : 'bg-rose-500/20 text-rose-300'
                  }`}>
                    {product.stock > 0 ? `${product.stock} em estoque` : 'Sem estoque'}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => openEditModal(product)} className="flex-1 px-3 py-2 bg-cyan-500/20 text-cyan-300 rounded hover:bg-cyan-500/30 text-sm font-medium">
                    Editar
                  </button>
                  <button onClick={() => deleteProduct(product)} className="flex-1 px-3 py-2 bg-rose-500/20 text-rose-300 rounded hover:bg-rose-500/30 text-sm font-medium">
                    Deletar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-8 text-center text-slate-400 bg-slate-900 rounded-xl border border-slate-800 shadow-xl">
          Nenhum produto cadastrado
        </div>
      )}

      <ProductModal title="Novo Produto" onSubmit={createProduct} open={isCreateOpen} />
      <ProductModal title="Editar Produto" onSubmit={editProduct} open={isEditOpen} />
    </div>
  )
}
