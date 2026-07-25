import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, UserCheck, Building2, Briefcase, FileText, Award, TrendingUp, DollarSign, ArrowRight 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';
import analyticsService from '../../services/analyticsService';

const COLORS = ['#38bdf8', '#818cf8', '#34d399', '#fbbf24', '#f87171', '#a78bfa'];

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await analyticsService.getDashboardAnalytics();
      setData(res);
    } catch (err) {
      console.error('Failed to load admin analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="portal-page-container"><p>Loading Placement Analytics...</p></div>;
  }

  return (
    <div className="portal-page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Placement Administrator Dashboard</h1>
          <p className="page-subtitle">Real-time statistics, company recruiters management, and branch-wise placement analytics.</p>
        </div>
      </div>

      {/* Stats Cards Row 1 */}
      <div className="stats-grid-4">
        <div className="stat-card">
          <div className="stat-icon-bg cyan">
            <Users size={22} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{data?.total_students || 0}</span>
            <span className="stat-label">Total Students</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-bg purple">
            <UserCheck size={22} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{data?.total_recruiters || 0}</span>
            <span className="stat-label">Total Recruiters</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-bg emerald">
            <Building2 size={22} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{data?.registered_companies || 0}</span>
            <span className="stat-label">Registered Companies</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-bg amber">
            <Briefcase size={22} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{data?.active_jobs || 0}</span>
            <span className="stat-label">Active Jobs</span>
          </div>
        </div>
      </div>

      {/* Stats Cards Row 2 (Placement Metrics) */}
      <div className="stats-grid-4" style={{ marginTop: '1rem' }}>
        <div className="stat-card">
          <div className="stat-icon-bg cyan">
            <FileText size={22} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{data?.total_applications || 0}</span>
            <span className="stat-label">Applications Filed</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-bg emerald">
            <Award size={22} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{data?.students_placed || 0}</span>
            <span className="stat-label">Students Placed</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-bg purple">
            <TrendingUp size={22} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{data?.placement_rate || 0}%</span>
            <span className="stat-label">Placement Rate</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-bg amber">
            <DollarSign size={22} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{data?.average_package || '0 LPA'}</span>
            <span className="stat-label">Average Package</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="dashboard-grid-2" style={{ marginTop: '1.5rem' }}>
        {/* Placement by Branch Chart */}
        <div className="content-card">
          <div className="card-header">
            <h3>Placement Rate by Engineering Branch</h3>
          </div>
          <div style={{ width: '100%', height: 300, marginTop: '1rem' }}>
            <ResponsiveContainer>
              <BarChart data={data?.placement_by_branch || []} margin={{ top: 10, right: 20, left: 0, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="branch" stroke="#94a3b8" tick={{ fontSize: 11 }} angle={-15} textAnchor="end" />
                <YAxis stroke="#94a3b8" unit="%" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', borderColor: 'rgba(255,255,255,0.1)', color: '#f9fafb' }}
                />
                <Bar dataKey="placement_rate" name="Placement Rate (%)" fill="#38bdf8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Application Status Distribution Chart */}
        <div className="content-card">
          <div className="card-header">
            <h3>Application Status Breakdown</h3>
          </div>
          <div style={{ width: '100%', height: 300, marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={data?.application_status_distribution || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="count"
                  nameKey="status"
                  label={({ status, count }) => `${status}: ${count}`}
                >
                  {(data?.application_status_distribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', borderColor: 'rgba(255,255,255,0.1)', color: '#f9fafb' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2 Charts & Lists */}
      <div className="dashboard-grid-2" style={{ marginTop: '1.5rem' }}>
        {/* Monthly Placement Trend */}
        <div className="content-card">
          <div className="card-header">
            <h3>Monthly Selection Trend</h3>
          </div>
          <div style={{ width: '100%', height: 260, marginTop: '1rem' }}>
            <ResponsiveContainer>
              <AreaChart data={data?.monthly_placement_trend || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', borderColor: 'rgba(255,255,255,0.1)', color: '#f9fafb' }}
                />
                <Area type="monotone" dataKey="selections" stroke="#34d399" fill="rgba(52, 211, 153, 0.2)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Recruiting Companies List */}
        <div className="content-card">
          <div className="card-header">
            <h3>Top Recruiting Partners</h3>
            <Link to="/admin/companies" className="link-action">
              View All Companies <ArrowRight size={16} />
            </Link>
          </div>

          <div className="job-list-mini" style={{ marginTop: '1rem' }}>
            {(data?.top_recruiting_companies || []).map((comp, idx) => (
              <div key={idx} className="job-item-mini">
                <div className="job-item-details">
                  <h4 className="job-title-mini">{comp.company}</h4>
                  <p className="job-company-mini">Total Drives Posted: {comp.jobs}</p>
                </div>
                <span className="tag-pill success">
                  {comp.selections} Students Placed
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
