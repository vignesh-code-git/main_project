'use client';

import { useState, useEffect, useRef } from 'react';
import {
  BarChart3,
  TrendingUp,
  ShoppingBag,
  Users,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Download,
  Check
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { API_BASE_URL, getAuthHeaders } from '@/config/api';
import './stats.css';

export default function PerformancePage() {
  const [statsData, setStatsData] = useState(null);
  const [activityFeed, setActivityFeed] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('All Time');
  const [showTimeframe, setShowTimeframe] = useState(false);
  const timeframeRef = useRef(null);

  useEffect(() => {
    fetchStats();

    const handleClickOutside = (event) => {
      if (timeframeRef.current && !timeframeRef.current.contains(event.target)) {
        setShowTimeframe(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const timeframes = ['Today', 'Last 7 Days', 'Last 30 Days', 'This Month', 'All Time'];

  const handleTimeframeChange = (tf) => {
    setTimeframe(tf);
    setShowTimeframe(false);
    // In a real app, you would re-fetch stats with the timeframe parameter
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/seller/stats`, {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setStatsData(data.stats);
        setActivityFeed(data.activity || []);
        setChartData(data.chartData || []);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setLoading(false);
    }
  };

  const stats = [
    {
      label: 'Total Revenue',
      value: statsData ? `₹${statsData.revenue.toLocaleString('en-IN')}` : '₹0',
      trend: '+0.0%',
      icon: TrendingUp,
      color: 'sales'
    },
    {
      label: 'Total Orders',
      value: statsData ? statsData.orders.toString() : '0',
      trend: '+0.0%',
      icon: ShoppingBag,
      color: 'orders'
    },
    {
      label: 'Total Customers',
      value: statsData ? statsData.customers.toString() : '0',
      trend: '+0.0%',
      icon: Users,
      color: 'customers'
    },
    {
      label: 'Total Products',
      value: statsData ? statsData.products.toString() : '0',
      trend: '+0.0%',
      icon: Eye,
      color: 'views'
    },
  ];

  if (loading) {
    return (
      <div className="stats-page">
        <div className="container">
          <div className="empty-state">
            <div className="loading-spinner"></div>
            <p>Gathering your business insights...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="stats-page">
      <div className="container">
        <div className="page-header">
          <div>
            <h1>Performance Analytics</h1>
            <p>Track your store's growth and sales data</p>
          </div>
          <div className="header-actions">
            <div className="timeframe-selector" ref={timeframeRef}>
              <button
                className={`add-btn secondary ${showTimeframe ? 'open' : ''}`}
                onClick={() => setShowTimeframe(!showTimeframe)}
              >
                <Calendar size={18} /> {timeframe}
              </button>

              {showTimeframe && (
                <div className="timeframe-dropdown">
                  {timeframes.map((tf) => (
                    <button
                      key={tf}
                      className={`timeframe-item ${timeframe === tf ? 'active' : ''}`}
                      onClick={() => handleTimeframeChange(tf)}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button className="add-btn">
              <Download size={18} /> Export Report
            </button>
          </div>
        </div>

        <div className="stats-grid">
          {stats.map((stat, i) => (
            <div className="stat-card" key={i}>
              <div className="stat-header">
                <div className={`stat-icon ${stat.color}`}>
                  <stat.icon size={24} />
                </div>
                <div className={`stat-trend ${stat.isDown ? 'trend-down' : 'trend-up'}`}>
                  {stat.isDown ? <ArrowDownRight size={16} /> : <ArrowUpRight size={16} />}
                  {stat.trend}
                </div>
              </div>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="charts-grid">
          <div className="chart-card">
            <div className="chart-header">
              <h3>Revenue Growth</h3>
            </div>
            <div className="chart-container" style={{ width: '100%', height: '300px', marginTop: '20px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 5, left: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#666', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#666', fontSize: 12 }}
                    tickFormatter={(value) => `₹${value}`}
                  />
                  <Tooltip
                    cursor={{ fill: '#f8f9fa' }}
                    contentStyle={{
                      borderRadius: '12px',
                      border: 'none',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                      padding: '12px'
                    }}
                    formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']}
                  />
                  <Bar
                    dataKey="revenue"
                    radius={[6, 6, 0, 0]}
                    barSize={40}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? '#000' : '#E2E8F0'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="chart-card">
            <div className="chart-header">
              <h3>Recent Activity</h3>
            </div>
            <div className="activity-list">
              {activityFeed.length > 0 ? activityFeed.map((activity, i) => (
                <div className="activity-item" key={i}>
                  <div className="activity-content">
                    <div className="activity-title">{activity.title}</div>
                    <div className="activity-time">{new Date(activity.time).toLocaleDateString()} at {new Date(activity.time).toLocaleTimeString()}</div>
                  </div>
                </div>
              )) : (
                <p style={{ textAlign: 'center', color: '#999', padding: '20px' }}>No recent activity found.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
