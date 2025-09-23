import React, { useState, useEffect } from 'react';
import { sqlApi, type SqlResponse } from '../api/sqlApi';

interface Customer {
  customerid: number;
  firstname: string;
  lastname: string;
  businessname?: string;
  email: string;
}

interface Product {
  productid: number;
  productname: string;
  unitprice: number;
  quantityonhand: number;
}

interface NewPurchaseProps {
  onPurchaseComplete?: () => void;
}

const NewPurchaseDropdown: React.FC<NewPurchaseProps> = ({ onPurchaseComplete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [customerMode, setCustomerMode] = useState<'existing' | 'new'>('existing');

  // Form state
  const [selectedCustomer, setSelectedCustomer] = useState<number | ''>('');
  const [selectedProduct, setSelectedProduct] = useState<number | ''>('');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [unitPrice, setUnitPrice] = useState<number | ''>('');
  const [notes, setNotes] = useState('');

  // New customer form state
  const [newCustomer, setNewCustomer] = useState({
    firstname: '',
    lastname: '',
    businessname: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipcode: ''
  });
  const [creatingCustomer, setCreatingCustomer] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadCustomersAndProducts();
    }
  }, [isOpen]);

  const loadCustomersAndProducts = async () => {
    setLoading(true);
    try {
      const [customersResponse, productsResponse] = await Promise.all([
        sqlApi.executeQuery('SELECT customerid, firstname, lastname, businessname, email FROM customer ORDER BY lastname, firstname'),
        sqlApi.executeQuery('SELECT productid, productname, unitprice, quantityonhand FROM product ORDER BY productname')
      ]);

      if (customersResponse.success && customersResponse.data) {
        setCustomers(customersResponse.data);
      }
      if (productsResponse.success && productsResponse.data) {
        setProducts(productsResponse.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProductChange = (productId: string) => {
    setSelectedProduct(productId);
    if (productId) {
      const product = products.find(p => p.productid === parseInt(productId));
      if (product) {
        setUnitPrice(product.unitprice);
      }
    } else {
      setUnitPrice('');
    }
  };

  const handleNewCustomerChange = (field: string, value: string) => {
    setNewCustomer(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const createNewCustomer = async () => {
    if (!newCustomer.firstname.trim() || !newCustomer.lastname.trim() || !newCustomer.email.trim()) {
      alert('Please fill in at least first name, last name, and email');
      return;
    }

    setCreatingCustomer(true);
    try {
      const response = await fetch('/api/customer/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCustomer),
      });

      const result = await response.json();
      
      if (result.success) {
        // Add the new customer to the list
        setCustomers(prev => [...prev, result.customer]);
        // Select the new customer
        setSelectedCustomer(result.customer_id);
        // Switch back to existing customer mode
        setCustomerMode('existing');
        // Reset new customer form
        setNewCustomer({
          firstname: '',
          lastname: '',
          businessname: '',
          email: '',
          phone: '',
          address: '',
          city: '',
          state: '',
          zipcode: ''
        });
      } else {
        alert(`Failed to create customer: ${result.message}`);
      }
    } catch (error) {
      console.error('Error creating customer:', error);
      alert('Failed to create customer. Please try again.');
    } finally {
      setCreatingCustomer(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || !selectedProduct || !quantity || !unitPrice) {
      return;
    }

    setSubmitting(true);
    try {
      // Use the new purchase API endpoint
      const response = await fetch('/api/purchase/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerid: selectedCustomer,
          productid: selectedProduct,
          quantity: quantity,
          unitprice: unitPrice,
          notes: notes,
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setSuccess(true);
        // Reset form
        setSelectedCustomer('');
        setSelectedProduct('');
        setQuantity('');
        setUnitPrice('');
        setNotes('');
        
        // Close dropdown after 2 seconds
        setTimeout(() => {
          setIsOpen(false);
          setSuccess(false);
          onPurchaseComplete?.();
        }, 2000);
      } else {
        console.error('Purchase failed:', result.error);
        alert(`Purchase failed: ${result.message}`);
      }
    } catch (error) {
      console.error('Error creating purchase:', error);
      alert('Failed to create purchase. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedCustomer('');
    setSelectedProduct('');
    setQuantity('');
    setUnitPrice('');
    setNotes('');
    setSuccess(false);
    setCustomerMode('existing');
    setNewCustomer({
      firstname: '',
      lastname: '',
      businessname: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipcode: ''
    });
  };

  const selectedProductData = products.find(p => p.productid === parseInt(selectedProduct.toString()));
  const totalAmount = quantity && unitPrice ? parseFloat(quantity.toString()) * parseFloat(unitPrice.toString()) : 0;

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: '12px 20px',
          backgroundColor: '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 2px 8px rgba(40, 167, 69, 0.3)',
          transition: 'all 0.3s ease',
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.backgroundColor = '#218838';
          e.currentTarget.style.transform = 'translateY(-1px)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.backgroundColor = '#28a745';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        <span>🛒</span>
        New Purchase
        <span style={{ fontSize: '12px' }}>{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.1)',
              zIndex: 1000,
            }}
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div
            style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '8px',
              width: '400px',
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
              border: '1px solid #e1e5e9',
              zIndex: 1001,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: '20px',
                borderBottom: '1px solid #e1e5e9',
                backgroundColor: '#f8f9fa',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, color: '#2c3e50', fontSize: '1.2rem', fontWeight: '600' }}>
                  🛒 New Purchase
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '20px',
                    cursor: 'pointer',
                    color: '#6c757d',
                    padding: '4px',
                  }}
                >
                  ×
                </button>
              </div>
            </div>

            {success ? (
              <div style={{ padding: '40px', textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '20px' }}>✅</div>
                <h4 style={{ color: '#28a745', margin: '0 0 10px 0' }}>Purchase Created!</h4>
                <p style={{ color: '#6c757d', margin: 0 }}>The order has been added to the database.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
                {loading ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>
                    <div style={{ fontSize: '24px', marginBottom: '10px' }}>⏳</div>
                    Loading customers and products...
                  </div>
                ) : (
                  <>
                    {/* Customer Selection */}
                    <div style={{ marginBottom: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <label style={{ fontWeight: '600', color: '#2c3e50' }}>
                          Customer *
                        </label>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <button
                            type="button"
                            onClick={() => setCustomerMode('existing')}
                            style={{
                              padding: '6px 12px',
                              border: '1px solid #007bff',
                              backgroundColor: customerMode === 'existing' ? '#007bff' : 'white',
                              color: customerMode === 'existing' ? 'white' : '#007bff',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: '500',
                            }}
                          >
                            Existing
                          </button>
                          <button
                            type="button"
                            onClick={() => setCustomerMode('new')}
                            style={{
                              padding: '6px 12px',
                              border: '1px solid #28a745',
                              backgroundColor: customerMode === 'new' ? '#28a745' : 'white',
                              color: customerMode === 'new' ? 'white' : '#28a745',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: '500',
                            }}
                          >
                            New Customer
                          </button>
                        </div>
                      </div>

                      {customerMode === 'existing' ? (
                        <select
                          value={selectedCustomer}
                          onChange={(e) => setSelectedCustomer(e.target.value ? parseInt(e.target.value) : '')}
                          required
                          style={{
                            width: '100%',
                            padding: '10px',
                            border: '2px solid #e1e5e9',
                            borderRadius: '6px',
                            fontSize: '14px',
                            backgroundColor: 'white',
                          }}
                        >
                          <option value="">Select a customer...</option>
                          {customers.map(customer => (
                            <option key={customer.customerid} value={customer.customerid}>
                              {customer.firstname} {customer.lastname} 
                              {customer.businessname && ` (${customer.businessname})`}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div style={{ 
                          border: '2px solid #e1e5e9', 
                          borderRadius: '6px', 
                          padding: '15px',
                          backgroundColor: '#f8f9fa'
                        }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                            <div>
                              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: '600', color: '#2c3e50' }}>
                                First Name *
                              </label>
                              <input
                                type="text"
                                value={newCustomer.firstname}
                                onChange={(e) => handleNewCustomerChange('firstname', e.target.value)}
                                required
                                style={{
                                  width: '100%',
                                  padding: '8px',
                                  border: '1px solid #dee2e6',
                                  borderRadius: '4px',
                                  fontSize: '13px',
                                }}
                              />
                            </div>
                            <div>
                              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: '600', color: '#2c3e50' }}>
                                Last Name *
                              </label>
                              <input
                                type="text"
                                value={newCustomer.lastname}
                                onChange={(e) => handleNewCustomerChange('lastname', e.target.value)}
                                required
                                style={{
                                  width: '100%',
                                  padding: '8px',
                                  border: '1px solid #dee2e6',
                                  borderRadius: '4px',
                                  fontSize: '13px',
                                }}
                              />
                            </div>
                          </div>
                          
                          <div style={{ marginBottom: '10px' }}>
                            <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: '600', color: '#2c3e50' }}>
                              Email *
                            </label>
                            <input
                              type="email"
                              value={newCustomer.email}
                              onChange={(e) => handleNewCustomerChange('email', e.target.value)}
                              required
                              style={{
                                width: '100%',
                                padding: '8px',
                                border: '1px solid #dee2e6',
                                borderRadius: '4px',
                                fontSize: '13px',
                              }}
                            />
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                            <div>
                              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: '600', color: '#2c3e50' }}>
                                Business Name
                              </label>
                              <input
                                type="text"
                                value={newCustomer.businessname}
                                onChange={(e) => handleNewCustomerChange('businessname', e.target.value)}
                                style={{
                                  width: '100%',
                                  padding: '8px',
                                  border: '1px solid #dee2e6',
                                  borderRadius: '4px',
                                  fontSize: '13px',
                                }}
                              />
                            </div>
                            <div>
                              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: '600', color: '#2c3e50' }}>
                                Phone
                              </label>
                              <input
                                type="tel"
                                value={newCustomer.phone}
                                onChange={(e) => handleNewCustomerChange('phone', e.target.value)}
                                style={{
                                  width: '100%',
                                  padding: '8px',
                                  border: '1px solid #dee2e6',
                                  borderRadius: '4px',
                                  fontSize: '13px',
                                }}
                              />
                            </div>
                          </div>

                          <div style={{ marginBottom: '10px' }}>
                            <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: '600', color: '#2c3e50' }}>
                              Address
                            </label>
                            <input
                              type="text"
                              value={newCustomer.address}
                              onChange={(e) => handleNewCustomerChange('address', e.target.value)}
                              style={{
                                width: '100%',
                                padding: '8px',
                                border: '1px solid #dee2e6',
                                borderRadius: '4px',
                                fontSize: '13px',
                              }}
                            />
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                            <div>
                              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: '600', color: '#2c3e50' }}>
                                City
                              </label>
                              <input
                                type="text"
                                value={newCustomer.city}
                                onChange={(e) => handleNewCustomerChange('city', e.target.value)}
                                style={{
                                  width: '100%',
                                  padding: '8px',
                                  border: '1px solid #dee2e6',
                                  borderRadius: '4px',
                                  fontSize: '13px',
                                }}
                              />
                            </div>
                            <div>
                              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: '600', color: '#2c3e50' }}>
                                State
                              </label>
                              <input
                                type="text"
                                value={newCustomer.state}
                                onChange={(e) => handleNewCustomerChange('state', e.target.value)}
                                style={{
                                  width: '100%',
                                  padding: '8px',
                                  border: '1px solid #dee2e6',
                                  borderRadius: '4px',
                                  fontSize: '13px',
                                }}
                              />
                            </div>
                            <div>
                              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: '600', color: '#2c3e50' }}>
                                Zip Code
                              </label>
                              <input
                                type="text"
                                value={newCustomer.zipcode}
                                onChange={(e) => handleNewCustomerChange('zipcode', e.target.value)}
                                style={{
                                  width: '100%',
                                  padding: '8px',
                                  border: '1px solid #dee2e6',
                                  borderRadius: '4px',
                                  fontSize: '13px',
                                }}
                              />
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={createNewCustomer}
                            disabled={creatingCustomer || !newCustomer.firstname.trim() || !newCustomer.lastname.trim() || !newCustomer.email.trim()}
                            style={{
                              width: '100%',
                              padding: '8px',
                              backgroundColor: creatingCustomer ? '#6c757d' : '#28a745',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: creatingCustomer ? 'not-allowed' : 'pointer',
                              fontSize: '13px',
                              fontWeight: '500',
                            }}
                          >
                            {creatingCustomer ? 'Creating...' : 'Create Customer & Continue'}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Product Selection */}
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#2c3e50' }}>
                        Product *
                      </label>
                      <select
                        value={selectedProduct}
                        onChange={(e) => handleProductChange(e.target.value)}
                        required
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '2px solid #e1e5e9',
                          borderRadius: '6px',
                          fontSize: '14px',
                          backgroundColor: 'white',
                        }}
                      >
                        <option value="">Select a product...</option>
                        {products.map(product => (
                          <option key={product.productid} value={product.productid}>
                            {product.productname} - ${product.unitprice} (Stock: {product.quantityonhand})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Quantity and Price */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#2c3e50' }}>
                          Quantity *
                        </label>
                        <input
                          type="number"
                          value={quantity}
                          onChange={(e) => setQuantity(e.target.value ? parseInt(e.target.value) : '')}
                          min="1"
                          max={selectedProductData?.quantityonhand || 999}
                          required
                          style={{
                            width: '100%',
                            padding: '10px',
                            border: '2px solid #e1e5e9',
                            borderRadius: '6px',
                            fontSize: '14px',
                          }}
                        />
                        {selectedProductData && (
                          <div style={{ fontSize: '12px', color: '#6c757d', marginTop: '4px' }}>
                            Max: {selectedProductData.quantityonhand} available
                          </div>
                        )}
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#2c3e50' }}>
                          Unit Price *
                        </label>
                        <input
                          type="number"
                          value={unitPrice}
                          onChange={(e) => setUnitPrice(e.target.value ? parseFloat(e.target.value) : '')}
                          step="0.01"
                          min="0"
                          required
                          style={{
                            width: '100%',
                            padding: '10px',
                            border: '2px solid #e1e5e9',
                            borderRadius: '6px',
                            fontSize: '14px',
                          }}
                        />
                      </div>
                    </div>

                    {/* Total Amount Display */}
                    {totalAmount > 0 && (
                      <div style={{
                        padding: '15px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '6px',
                        marginBottom: '20px',
                        textAlign: 'center',
                      }}>
                        <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '4px' }}>Total Amount</div>
                        <div style={{ fontSize: '24px', fontWeight: '700', color: '#28a745' }}>
                          ${totalAmount.toFixed(2)}
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#2c3e50' }}>
                        Notes (Optional)
                      </label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Add any notes about this purchase..."
                        rows={3}
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '2px solid #e1e5e9',
                          borderRadius: '6px',
                          fontSize: '14px',
                          resize: 'vertical',
                        }}
                      />
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        onClick={resetForm}
                        style={{
                          padding: '10px 20px',
                          backgroundColor: '#6c757d',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: '500',
                        }}
                      >
                        Clear
                      </button>
                      <button
                        type="submit"
                        disabled={submitting || !selectedCustomer || !selectedProduct || !quantity || !unitPrice}
                        style={{
                          padding: '10px 20px',
                          backgroundColor: submitting ? '#6c757d' : '#28a745',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: submitting ? 'not-allowed' : 'pointer',
                          fontSize: '14px',
                          fontWeight: '500',
                        }}
                      >
                        {submitting ? 'Creating...' : 'Create Purchase'}
                      </button>
                    </div>
                  </>
                )}
              </form>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default NewPurchaseDropdown;
