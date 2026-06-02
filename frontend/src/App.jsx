import React, { useState, useEffect } from 'react';
import { Package, Users, ShoppingCart } from 'lucide-react';
import { getProducts, createProduct, getCustomers, createCustomer, getOrders, createOrder } from './api';
import './index.css';

function App() {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);

  // Forms State
  const [productForm, setProductForm] = useState({ name: '', sku: '', price: '', stock: '' });
  const [customerForm, setCustomerForm] = useState({ name: '', email: '' });
  const [orderForm, setOrderForm] = useState({ customer_id: '', product_id: '', quantity: '' });

  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      if (activeTab === 'products' || activeTab === 'orders') {
        const pRes = await getProducts();
        setProducts(pRes.data);
      }
      if (activeTab === 'customers' || activeTab === 'orders') {
        const cRes = await getCustomers();
        setCustomers(cRes.data);
      }
      if (activeTab === 'orders') {
        const oRes = await getOrders();
        setOrders(oRes.data);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch data");
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      await createProduct({ ...productForm, price: parseFloat(productForm.price), stock: parseInt(productForm.stock) });
      setProductForm({ name: '', sku: '', price: '', stock: '' });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.detail || "Error creating product");
    }
  };

  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      await createCustomer(customerForm);
      setCustomerForm({ name: '', email: '' });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.detail || "Error creating customer");
    }
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      await createOrder({
        customer_id: parseInt(orderForm.customer_id),
        product_id: parseInt(orderForm.product_id),
        quantity: parseInt(orderForm.quantity)
      });
      setOrderForm({ customer_id: '', product_id: '', quantity: '' });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.detail || "Error creating order");
    }
  };

  return (
    <div className="container">
      <header className="app-header">
        <h1>Inventory & Orders</h1>
        {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{error}</div>}
      </header>

      <div className="nav-tabs">
        <button className={`nav-btn ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')}>
          <Package style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} size={18} /> Products
        </button>
        <button className={`nav-btn ${activeTab === 'customers' ? 'active' : ''}`} onClick={() => setActiveTab('customers')}>
          <Users style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} size={18} /> Customers
        </button>
        <button className={`nav-btn ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
          <ShoppingCart style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} size={18} /> Orders
        </button>
      </div>

      <main>
        {activeTab === 'products' && (
          <div className="grid">
            <div className="card">
              <h2>Add Product</h2>
              <form onSubmit={handleCreateProduct}>
                <div className="form-group">
                  <label>Name</label>
                  <input className="form-input" required value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>SKU</label>
                  <input className="form-input" required value={productForm.sku} onChange={e => setProductForm({...productForm, sku: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Price</label>
                  <input className="form-input" type="number" step="0.01" required value={productForm.price} onChange={e => setProductForm({...productForm, price: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Initial Stock</label>
                  <input className="form-input" type="number" required value={productForm.stock} onChange={e => setProductForm({...productForm, stock: e.target.value})} />
                </div>
                <button type="submit" className="btn-primary">Save Product</button>
              </form>
            </div>
            <div className="card">
              <h2>Product List</h2>
              <div className="table-wrapper">
                <table>
                  <thead><tr><th>ID</th><th>Name</th><th>SKU</th><th>Price</th><th>Stock</th></tr></thead>
                  <tbody>
                    {products.map(p => (
                      <tr key={p.id}><td>{p.id}</td><td>{p.name}</td><td>{p.sku}</td><td>${p.price}</td><td>{p.stock}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'customers' && (
          <div className="grid">
            <div className="card">
              <h2>Add Customer</h2>
              <form onSubmit={handleCreateCustomer}>
                <div className="form-group">
                  <label>Name</label>
                  <input className="form-input" required value={customerForm.name} onChange={e => setCustomerForm({...customerForm, name: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input className="form-input" type="email" required value={customerForm.email} onChange={e => setCustomerForm({...customerForm, email: e.target.value})} />
                </div>
                <button type="submit" className="btn-primary">Save Customer</button>
              </form>
            </div>
            <div className="card">
              <h2>Customer List</h2>
              <div className="table-wrapper">
                <table>
                  <thead><tr><th>ID</th><th>Name</th><th>Email</th></tr></thead>
                  <tbody>
                    {customers.map(c => (
                      <tr key={c.id}><td>{c.id}</td><td>{c.name}</td><td>{c.email}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="grid">
            <div className="card">
              <h2>Place Order</h2>
              <form onSubmit={handleCreateOrder}>
                <div className="form-group">
                  <label>Customer</label>
                  <select className="form-input" required value={orderForm.customer_id} onChange={e => setOrderForm({...orderForm, customer_id: e.target.value})}>
                    <option value="">Select Customer</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.email})</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Product</label>
                  <select className="form-input" required value={orderForm.product_id} onChange={e => setOrderForm({...orderForm, product_id: e.target.value})}>
                    <option value="">Select Product</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name} - ${p.price} (Stock: {p.stock})</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Quantity</label>
                  <input className="form-input" type="number" min="1" required value={orderForm.quantity} onChange={e => setOrderForm({...orderForm, quantity: e.target.value})} />
                </div>
                <button type="submit" className="btn-primary">Place Order</button>
              </form>
            </div>
            <div className="card">
              <h2>Order History</h2>
              <div className="table-wrapper">
                <table>
                  <thead><tr><th>ID</th><th>Customer ID</th><th>Product ID</th><th>Qty</th><th>Status</th></tr></thead>
                  <tbody>
                    {orders.map(o => (
                      <tr key={o.id}><td>{o.id}</td><td>{o.customer_id}</td><td>{o.product_id}</td><td>{o.quantity}</td><td><span className="status-badge">{o.status}</span></td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
