import { useEffect, useState } from 'react';
import { Users, BookOpen, BarChart2, AlertCircle, ShieldCheck, Search, Filter, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../api/client';

type Stats = {
  total_users: number;
  active_classes: number;
  avg_attendance: string;
  pending_issues: number;
};

type AttendanceSummaryItem = {
  student_id: string;
  student_name: string;
  email: string;
  class_id: string;
  class_name: string;
  total_records: number;
  present_records: number;
  attendance_percentage: number;
};

type ClassItem = {
  id: string;
  name: string;
  section: string;
};

export const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [attendanceSummary, setAttendanceSummary] = useState<AttendanceSummaryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [statsRes, classesRes] = await Promise.all([
          apiClient.get('users/admin/stats/'),
          apiClient.get('academics/classes/'),
        ]);
        setStats(statsRes.data);
        setClasses(classesRes.data || []);
      } catch (err) {
        console.error('Failed to fetch admin stats', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  useEffect(() => {
    const fetchAttendanceSummary = async () => {
      try {
        const url = selectedClass
          ? `academics/attendance/summary/?class_id=${selectedClass}`
          : 'academics/attendance/summary/';
        const res = await apiClient.get(url);
        setAttendanceSummary(res.data || []);
      } catch (err) {
        console.error('Failed to fetch attendance summary', err);
      }
    };

    fetchAttendanceSummary();
  }, [selectedClass]);

  const filteredSummary = attendanceSummary.filter((item) =>
    item.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <header style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ padding: '10px', borderRadius: '12px', background: 'rgba(56, 189, 248, 0.15)', color: 'var(--accent)' }}>
          <ShieldCheck size={28} />
        </div>
        <div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 700, margin: 0 }}>
            Admin Panel — {user?.name}
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '4px', margin: 0 }}>School-wide overview, stats, and attendance insights.</p>
        </div>
      </header>

      {/* Live Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        {[
          { icon: Users, label: 'Total Users', value: stats ? stats.total_users : '...', color: '#f472b6' },
          { icon: BookOpen, label: 'Active Classes', value: stats ? stats.active_classes : '...', color: '#818cf8' },
          { icon: BarChart2, label: 'Avg Attendance', value: stats ? stats.avg_attendance : '...', color: '#34d399' },
          { icon: AlertCircle, label: 'Pending Issues', value: stats ? stats.pending_issues : '...', color: '#f59e0b' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>
              <Icon size={22} />
            </div>
            <div>
              <p style={{ fontSize: '1.8rem', fontWeight: 700, margin: 0 }}>{value}</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Attendance Insights Section */}
      <div className="glass-panel" style={{ padding: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <UserCheck size={22} color="var(--accent)" />
              Student Attendance Insights
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>Filter by class or search by student name to view average attendance.</p>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {/* Search Input */}
            <div style={{ position: 'relative', minWidth: '200px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search student..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  padding: '9px 12px 9px 36px',
                  borderRadius: '10px',
                  border: '1px solid var(--glass-border)',
                  background: 'rgba(255,255,255,0.05)',
                  color: 'white',
                  width: '100%',
                  fontSize: '0.9rem',
                }}
              />
            </div>

            {/* Class Select Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Filter size={16} style={{ color: 'var(--text-muted)' }} />
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                style={{
                  padding: '9px 14px',
                  borderRadius: '10px',
                  border: '1px solid var(--glass-border)',
                  background: 'rgba(255,255,255,0.05)',
                  color: 'white',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                }}
              >
                <option value="" style={{ background: '#0f172a' }}>All Classes</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id} style={{ background: '#0f172a' }}>
                    {cls.name} - {cls.section}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Table of Students & Average Attendance */}
        {filteredSummary.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '30px 0' }}>
            {loading ? 'Loading attendance data...' : 'No attendance records found.'}
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  <th style={{ padding: '12px 16px' }}>Student</th>
                  <th style={{ padding: '12px 16px' }}>Class</th>
                  <th style={{ padding: '12px 16px' }}>Records</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Avg Attendance</th>
                </tr>
              </thead>
              <tbody>
                {filteredSummary.map((item) => {
                  const pct = item.attendance_percentage;
                  const color = pct >= 85 ? '#34d399' : pct >= 70 ? '#f59e0b' : '#f87171';
                  return (
                    <tr key={item.student_id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 600 }}>{item.student_name}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{item.email}</div>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '0.9rem' }}>{item.class_name}</td>
                      <td style={{ padding: '14px 16px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {item.present_records} / {item.total_records} present
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px' }}>
                          <div style={{ width: '80px', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '3px' }} />
                          </div>
                          <span style={{ fontWeight: 700, color, minWidth: '45px' }}>{pct}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
