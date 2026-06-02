// ============================================
// AdminPizzas.jsx - ADMIN MENU MANAGER (/admin/pizzas)
// Create, edit, delete pizzas; toggle isAvailable to hide from customers
// ============================================

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { pizzaAPI } from '../services/api';
import { formatPrice, CATEGORIES } from '../utils/format';
import SkeletonLoader from '../components/SkeletonLoader';

const emptyForm = {
  name: '',
  description: '',
  price: '',
  category: 'Veg',
  imageUrl: '',
  isAvailable: true,
};

const AdminPizzas = () => {
  const [pizzas, setPizzas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const fetchPizzas = () => {
    setLoading(true);
    pizzaAPI
      .getAll()
      .then((res) => setPizzas(res.data.data))
      .catch(() => toast.error('Failed to load pizzas'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPizzas();
  }, []);

  // modal form for new pizza
  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  // same modal, pre-filled for editing
  const openEdit = (pizza) => {
    setEditingId(pizza._id);
    setForm({
      name: pizza.name,
      description: pizza.description,
      price: pizza.price,
      category: pizza.category,
      imageUrl: pizza.imageUrl,
      isAvailable: pizza.isAvailable,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, price: Number(form.price) };

    try {
      if (editingId) {
        await pizzaAPI.update(editingId, payload);
        toast.success('Pizza updated');
      } else {
        await pizzaAPI.create(payload);
        toast.success('Pizza created');
      }
      setShowModal(false);
      fetchPizzas();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}" permanently?`)) return;
    try {
      await pizzaAPI.delete(id);
      toast.success('Pizza deleted');
      fetchPizzas();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  // quick hide/show on menu without deleting the pizza record
  const toggleAvailability = async (pizza) => {
    try {
      await pizzaAPI.update(pizza._id, { isAvailable: !pizza.isAvailable });
      toast.success(`${pizza.name} ${pizza.isAvailable ? 'hidden from' : 'shown on'} menu`);
      fetchPizzas();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
        <div>
          <Link to="/admin" className="text-primary text-sm hover:underline">
            ← Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-neutral-dark mt-1">Manage Pizzas</h1>
        </div>
        <button type="button" onClick={openCreate} className="btn-primary">
          + Add Pizza
        </button>
      </div>

      {loading ? (
        <SkeletonLoader type="table" count={6} />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-4 font-semibold">Pizza</th>
                <th className="text-left p-4 font-semibold">Category</th>
                <th className="text-left p-4 font-semibold">Price</th>
                <th className="text-left p-4 font-semibold">Available</th>
                <th className="text-left p-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pizzas.map((pizza) => (
                <tr key={pizza._id} className="border-t hover:bg-gray-50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img src={pizza.imageUrl} alt={pizza.name} className="w-12 h-12 rounded-lg object-cover" />
                      <span className="font-medium">{pizza.name}</span>
                    </div>
                  </td>
                  <td className="p-4">{pizza.category}</td>
                  <td className="p-4">{formatPrice(pizza.price)}</td>
                  <td className="p-4">
                    <button
                      type="button"
                      onClick={() => toggleAvailability(pizza)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        pizza.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}
                      aria-label={`Toggle availability for ${pizza.name}`}
                    >
                      {pizza.isAvailable ? 'Yes' : 'No'}
                    </button>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(pizza)}
                        className="text-primary hover:underline font-medium"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(pizza._id, pizza.name)}
                        className="text-red-600 hover:underline font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="card p-6 w-full max-w-lg"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="pizza-modal-title"
            >
              <h2 id="pizza-modal-title" className="text-xl font-bold mb-4">
                {editingId ? 'Edit Pizza' : 'Add New Pizza'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  name="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Pizza name"
                  className="input-field"
                  required
                />
                <textarea
                  name="description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Description"
                  className="input-field min-h-[80px]"
                  required
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    name="price"
                    type="number"
                    min="0"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder="Price (INR)"
                    className="input-field"
                    required
                  />
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="input-field"
                  >
                    {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <input
                  name="imageUrl"
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  placeholder="Image URL"
                  className="input-field"
                  required
                />
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.isAvailable}
                    onChange={(e) => setForm({ ...form, isAvailable: e.target.checked })}
                  />
                  Available on menu
                </label>
                <div className="flex gap-3">
                  <button type="submit" className="btn-primary flex-1">
                    {editingId ? 'Update' : 'Create'}
                  </button>
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 border rounded-lg py-2">
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminPizzas;
