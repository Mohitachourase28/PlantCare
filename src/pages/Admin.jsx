import React, { useEffect, useState } from 'react'
import api from '../../utils/api.js'

export default function AdminPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null) // {id, name, category, ...}
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchList()
  }, [])

  async function fetchList() {
    setLoading(true)
    try {
      const res = await api.get('/api/admin/diseases')
      setItems(res.data || [])
    } catch (err) {
      console.error(err)
      alert('Failed to load diseases')
    } finally {
      setLoading(false)
    }
  }

  function startCreate() {
    setEditing({ name: '', category: '', description: '', symptoms: [], treatment: [] })
  }

  function startEdit(d) {
    setEditing({ ...d })
  }

  function cancelEdit() {
    setEditing(null)
  }

  async function saveEdit() {
    setSaving(true)
    try {
      if (editing.id) {
        await api.put(`/api/admin/diseases/${editing.id}`, editing)
      } else {
        await api.post(`/api/admin/diseases`, editing)
      }
      await fetchList()
      setEditing(null)
    } catch (err) {
      console.error(err)
      alert(err.response?.data?.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  async function remove(id) {
    if (!confirm('Delete this disease?')) return
    try {
      await api.delete(`/api/admin/diseases/${id}`)
      setItems(prev => prev.filter(p => p.id !== id))
    } catch (err) {
      console.error(err)
      alert('Delete failed')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Admin: Disease Management</h2>
        <div className="flex gap-2">
          <button onClick={startCreate} className="bg-green-500 text-white px-3 py-1 rounded">Add New</button>
          <button onClick={fetchList} className="px-3 py-1 border rounded">Refresh</button>
        </div>
      </div>

      <div className="bg-white rounded shadow p-4">
        {loading ? <p>Loading...</p> : (
          <ul className="space-y-2">
            {items.map(d => (
              <li key={d.id} className="flex justify-between items-start gap-3 border-b pb-3">
                <div>
                  <div className="font-medium">{d.name}</div>
                  <div className="text-xs text-gray-600">{d.category} • {d.short || (d.description || '').slice(0,80)}</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => startEdit(d)} className="px-2 py-1 border rounded text-sm">Edit</button>
                  <button onClick={() => remove(d.id)} className="px-2 py-1 border rounded text-sm text-red-600">Delete</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Inline editor modal-like */}
      {editing && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl p-6 rounded shadow">
            <h3 className="text-lg font-semibold mb-3">{editing.id ? 'Edit Disease' : 'Create Disease'}</h3>
            <div className="grid grid-cols-1 gap-3">
              <input value={editing.name} onChange={e => setEditing(s => ({...s, name: e.target.value}))} placeholder="Name" className="w-full p-2 border rounded" />
              <input value={editing.category} onChange={e => setEditing(s => ({...s, category: e.target.value}))} placeholder="Category" className="w-full p-2 border rounded" />
              <textarea value={editing.description} onChange={e => setEditing(s => ({...s, description: e.target.value}))} placeholder="Description" className="w-full p-2 border rounded h-28" />
              <div className="flex gap-2">
                <button onClick={saveEdit} disabled={saving} className="bg-green-500 text-white px-3 py-1 rounded">{saving ? 'Saving...' : 'Save'}</button>
                <button onClick={cancelEdit} className="px-3 py-1 border rounded">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
