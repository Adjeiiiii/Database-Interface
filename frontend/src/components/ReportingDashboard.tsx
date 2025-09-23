import React, { useState, useEffect } from 'react';
import { sqlApi, type SqlResponse } from '../api/sqlApi';

interface DashboardMetric {
  title: string;
  value: string | number;
  icon: string;
  color: string;
  trend?: string;
  trendValue?: string;
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string[];
    borderColor: string[];
    borderWidth: number;
  }[];
}

const ReportingDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [
        totalCustomers,
        totalOrders,
        totalRevenue,
        totalProducts,
        recentOrders,
        topProducts,
        customerGrowth,
        orderStatus
      ] = await Promise.all([
        sqlApi.executeQuery('SELECT COUNT(*) as count FROM customer'),
        sqlApi.executeQuery('SELECT COUNT(*) as count FROM orders'),
        sqlApi.executeQuery('SELECT SUM(totalamount) as total FROM orders'),
        sqlApi.executeQuery('SELECT COUNT(*) as count FROM product'),
        sqlApi.executeQuery(`
          SELECT 
            c.firstname, 
            c.lastname, 
            o.totalamount, 
            o.orderdate,
            o.status
          FROM orders o 
          JOIN customer c ON o.customerid = c.customerid 
          ORDER BY o.orderdate DESC 
          LIMIT 5
        `),
        sqlApi.executeQuery(`
          SELECT 
            p.productname,
            p.quantityonhand as total_available,
            p.unitprice,
            p.unitprice * p.quantityonhand as potential_revenue,
            s.suppliername
          FROM product p
          JOIN supplier s ON p.supplierid = s.supplierid
          ORDER BY p.quantityonhand DESC
          LIMIT 5
        `),
        sqlApi.executeQuery(`
          SELECT 
            YEAR(joindate) as year,
            COUNT(*) as new_customers
          FROM customer
          GROUP BY YEAR(joindate)
          ORDER BY year DESC
          LIMIT 5
        `),
        sqlApi.executeQuery(`
          SELECT 
            status,
            COUNT(*) as count
          FROM orders
          GROUP BY status
        `)
      ]);

      // Process metrics
      const processedMetrics: DashboardMetric[] = [
        {
          title: 'Total Customers',
          value: totalCustomers.success ? totalCustomers.data?.[0]?.count || 0 : 0,
          icon: '👥',
          color: '#007bff',
        },
        {
          title: 'Total Orders',
          value: totalOrders.success ? totalOrders.data?.[0]?.count || 0 : 0,
          icon: '🛒',
          color: '#28a745',
        },
        {
          title: 'Total Revenue',
          value: totalRevenue.success ? `$${(totalRevenue.data?.[0]?.total || 0).toLocaleString()}` : '$0',
          icon: '💰',
          color: '#ffc107',
        },
        {
          title: 'Total Products',
          value: totalProducts.success ? totalProducts.data?.[0]?.count || 0 : 0,
          icon: '📦',
          color: '#dc3545',
        },
      ];

      setMetrics(processedMetrics);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    loadDashboardData();
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '400px',
        fontSize: '18px',
        color: '#6c757d'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>📊</div>
          <div>Loading dashboard data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '400px',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <div style={{ fontSize: '48px' }}>❌</div>
        <div style={{ color: '#dc3545', fontSize: '18px' }}>{error}</div>
        <button
          onClick={refreshData}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '30px',
        paddingBottom: '20px',
        borderBottom: '2px solid #e1e5e9'
      }}>
        <h2 style={{ 
          margin: 0, 
          color: '#2c3e50', 
          fontSize: '2rem',
          fontWeight: '600'
        }}>
          📊 Business Analytics Dashboard
        </h2>
        <button
          onClick={refreshData}
          style={{
            padding: '10px 20px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span>🔄</span>
          Refresh Data
        </button>
      </div>

      {/* Key Metrics */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '20px',
        marginBottom: '40px'
      }}>
        {metrics.map((metric, index) => (
          <div
            key={index}
            style={{
              backgroundColor: 'white',
              padding: '25px',
              borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              border: '1px solid #e1e5e9',
              textAlign: 'center',
              transition: 'transform 0.2s ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{ 
              fontSize: '48px', 
              marginBottom: '15px',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
            }}>
              {metric.icon}
            </div>
            <h3 style={{ 
              margin: '0 0 10px 0', 
              color: '#6c757d', 
              fontSize: '14px',
              fontWeight: '500',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              {metric.title}
            </h3>
            <div style={{ 
              fontSize: '2.5rem', 
              fontWeight: '700', 
              color: metric.color,
              marginBottom: '10px'
            }}>
              {metric.value}
            </div>
            {metric.trend && (
              <div style={{ 
                fontSize: '12px', 
                color: metric.trendValue?.startsWith('+') ? '#28a745' : '#dc3545',
                fontWeight: '600'
              }}>
                {metric.trendValue} {metric.trend}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Quick Analytics */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
        gap: '30px'
      }}>
        {/* Recent Orders */}
        <div style={{
          backgroundColor: 'white',
          padding: '25px',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          border: '1px solid #e1e5e9'
        }}>
          <h3 style={{ 
            margin: '0 0 20px 0', 
            color: '#2c3e50', 
            fontSize: '1.3rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <span>🛒</span>
            Recent Orders
          </h3>
          <RecentOrdersWidget />
        </div>

        {/* Top Products */}
        <div style={{
          backgroundColor: 'white',
          padding: '25px',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          border: '1px solid #e1e5e9'
        }}>
          <h3 style={{ 
            margin: '0 0 20px 0', 
            color: '#2c3e50', 
            fontSize: '1.3rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <span>📦</span>
            Top Products by Stock
          </h3>
          <TopProductsWidget />
        </div>

        {/* Customer Growth */}
        <div style={{
          backgroundColor: 'white',
          padding: '25px',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          border: '1px solid #e1e5e9'
        }}>
          <h3 style={{ 
            margin: '0 0 20px 0', 
            color: '#2c3e50', 
            fontSize: '1.3rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <span>📈</span>
            Customer Growth
          </h3>
          <CustomerGrowthWidget />
        </div>

        {/* Order Status */}
        <div style={{
          backgroundColor: 'white',
          padding: '25px',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          border: '1px solid #e1e5e9'
        }}>
          <h3 style={{ 
            margin: '0 0 20px 0', 
            color: '#2c3e50', 
            fontSize: '1.3rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <span>📊</span>
            Order Status
          </h3>
          <OrderStatusWidget />
        </div>
      </div>
    </div>
  );
};

// Widget Components
const RecentOrdersWidget: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecentOrders();
  }, []);

  const loadRecentOrders = async () => {
    try {
      const response = await sqlApi.executeQuery(`
        SELECT 
          c.firstname, 
          c.lastname, 
          o.totalamount, 
          o.orderdate,
          o.status
        FROM orders o 
        JOIN customer c ON o.customerid = c.customerid 
        ORDER BY o.orderdate DESC 
        LIMIT 5
      `);
      
      if (response.success && response.data) {
        setOrders(response.data);
      }
    } catch (error) {
      console.error('Error loading recent orders:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', color: '#6c757d' }}>Loading...</div>;
  }

  return (
    <div>
      {orders.map((order, index) => (
        <div key={index} style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 0',
          borderBottom: index < orders.length - 1 ? '1px solid #f1f3f4' : 'none'
        }}>
          <div>
            <div style={{ fontWeight: '600', color: '#2c3e50' }}>
              {order.firstname} {order.lastname}
            </div>
            <div style={{ fontSize: '12px', color: '#6c757d' }}>
              {new Date(order.orderdate).toLocaleDateString()}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: '600', color: '#28a745' }}>
              ${parseFloat(order.totalamount).toFixed(2)}
            </div>
            <div style={{ 
              fontSize: '11px', 
              color: order.status === 'SHIPPED' ? '#28a745' : 
                     order.status === 'PENDING' ? '#ffc107' : '#dc3545',
              fontWeight: '500'
            }}>
              {order.status}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const TopProductsWidget: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTopProducts();
  }, []);

  const loadTopProducts = async () => {
    try {
      const response = await sqlApi.executeQuery(`
        SELECT 
          p.productname,
          p.quantityonhand as total_available,
          p.unitprice,
          p.unitprice * p.quantityonhand as potential_revenue,
          s.suppliername
        FROM product p
        JOIN supplier s ON p.supplierid = s.supplierid
        ORDER BY p.quantityonhand DESC
        LIMIT 5
      `);
      
      if (response.success && response.data) {
        setProducts(response.data);
      }
    } catch (error) {
      console.error('Error loading top products:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', color: '#6c757d' }}>Loading...</div>;
  }

  return (
    <div>
      {products.map((product, index) => (
        <div key={index} style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 0',
          borderBottom: index < products.length - 1 ? '1px solid #f1f3f4' : 'none'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundColor: index === 0 ? '#ffd700' : 
                             index === 1 ? '#c0c0c0' : 
                             index === 2 ? '#cd7f32' : '#6c757d',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 'bold',
              color: 'white'
            }}>
              {index + 1}
            </div>
              <div>
                <div style={{ fontWeight: '600', color: '#2c3e50', fontSize: '14px' }}>
                  {product.productname}
                </div>
                <div style={{ fontSize: '12px', color: '#6c757d' }}>
                  {product.total_available} in stock
                </div>
                <div style={{ fontSize: '11px', color: '#6c757d' }}>
                  by {product.suppliername}
                </div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: '600', color: '#28a745', fontSize: '14px' }}>
                ${parseFloat(product.unitprice).toFixed(2)}
              </div>
              <div style={{ fontSize: '11px', color: '#6c757d' }}>
                ${parseFloat(product.potential_revenue).toFixed(2)} total
              </div>
            </div>
        </div>
      ))}
    </div>
  );
};

const CustomerGrowthWidget: React.FC = () => {
  const [growth, setGrowth] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCustomerGrowth();
  }, []);

  const loadCustomerGrowth = async () => {
    try {
      const response = await sqlApi.executeQuery(`
        SELECT 
          YEAR(joindate) as year,
          COUNT(*) as new_customers
        FROM customer
        GROUP BY YEAR(joindate)
        ORDER BY year DESC
        LIMIT 5
      `);
      
      if (response.success && response.data) {
        setGrowth(response.data);
      }
    } catch (error) {
      console.error('Error loading customer growth:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', color: '#6c757d' }}>Loading...</div>;
  }

  return (
    <div>
      {growth.map((item, index) => (
        <div key={index} style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 0',
          borderBottom: index < growth.length - 1 ? '1px solid #f1f3f4' : 'none'
        }}>
          <div style={{ fontWeight: '600', color: '#2c3e50' }}>
            {item.year}
          </div>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px' 
          }}>
            <div style={{
              width: '100px',
              height: '8px',
              backgroundColor: '#e9ecef',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${(item.new_customers / Math.max(...growth.map(g => g.new_customers))) * 100}%`,
                height: '100%',
                backgroundColor: '#007bff',
                transition: 'width 0.3s ease'
              }} />
            </div>
            <div style={{ 
              fontWeight: '600', 
              color: '#007bff',
              minWidth: '30px',
              textAlign: 'right'
            }}>
              {item.new_customers}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const OrderStatusWidget: React.FC = () => {
  const [statuses, setStatuses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrderStatus();
  }, []);

  const loadOrderStatus = async () => {
    try {
      const response = await sqlApi.executeQuery(`
        SELECT 
          status,
          COUNT(*) as count
        FROM orders
        GROUP BY status
        ORDER BY count DESC
      `);
      
      if (response.success && response.data) {
        setStatuses(response.data);
      }
    } catch (error) {
      console.error('Error loading order status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', color: '#6c757d' }}>Loading...</div>;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SHIPPED': return '#28a745';
      case 'PENDING': return '#ffc107';
      case 'CANCELLED': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const totalOrders = statuses.reduce((sum, status) => sum + status.count, 0);

  return (
    <div>
      {statuses.map((status, index) => (
        <div key={index} style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 0',
          borderBottom: index < statuses.length - 1 ? '1px solid #f1f3f4' : 'none'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px' 
          }}>
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: getStatusColor(status.status)
            }} />
            <div style={{ fontWeight: '600', color: '#2c3e50' }}>
              {status.status}
            </div>
          </div>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px' 
          }}>
            <div style={{
              width: '100px',
              height: '8px',
              backgroundColor: '#e9ecef',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${(status.count / totalOrders) * 100}%`,
                height: '100%',
                backgroundColor: getStatusColor(status.status),
                transition: 'width 0.3s ease'
              }} />
            </div>
            <div style={{ 
              fontWeight: '600', 
              color: getStatusColor(status.status),
              minWidth: '30px',
              textAlign: 'right'
            }}>
              {status.count}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReportingDashboard;
