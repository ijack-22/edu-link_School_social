import { useEffect, useMemo, useState } from 'react';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';

type GradeItem = {
  id: string;
  student: string;
  student_name?: string;
  subject: string;
  grade?: string;
  score?: string;
  max_score?: string;
  term?: string;
  status: string;
};

type AttendanceItem = {
  id: string;
  student: string;
  student_name?: string;
  date: string;
  status: string;
  notes?: string;
};

type ComplaintItem = {
  id: string;
  title: string;
  description: string;
  status: string;
  submitted_by_name?: string;
};

type AccountItem = {
  id: string;
  username: string;
  email: string;
  role: string;
  full_name?: string;
};

type ClassItem = {
  id: string;
  name: string;
  section: string;
};

const panelStyle = { padding: '20px', display: 'grid', gap: '14px' };
const fieldStyle = { padding: '11px 12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.04)', color: 'var(--text-main)' };

export const SchoolWorkflow = () => {
  const { user } = useAuth();
  const [grades, setGrades] = useState<GradeItem[]>([]);
  const [attendance, setAttendance] = useState<AttendanceItem[]>([]);
  const [complaints, setComplaints] = useState<ComplaintItem[]>([]);
  const [users, setUsers] = useState<AccountItem[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [notice, setNotice] = useState('');
  const [createdPassword, setCreatedPassword] = useState('');
  const [createdEmail, setCreatedEmail] = useState('');
  const [parentPassword, setParentPassword] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState('student');

  const students = useMemo(() => users.filter((item) => item.role === 'student'), [users]);
  const canCreateUsers = user?.role === 'admin';
  const canApproveGrades = user?.role === 'registrar';
  const canSubmitGrades = user?.role === 'teacher';
  const canSubmitComplaint = user?.role === 'student' || user?.role === 'parent';
  const canSeeComplaints = user?.role === 'admin';

  const loadData = async () => {
    if (!user) return;
    try {
      const requests: Promise<void>[] = [];
      if (['teacher', 'admin', 'registrar', 'student', 'parent'].includes(user.role)) {
        requests.push(apiClient.get('academics/grades/').then((res) => setGrades(res.data || [])));
        requests.push(apiClient.get('academics/attendance/').then((res) => setAttendance(res.data || [])));
      }
      if (canSubmitGrades) {
        requests.push(apiClient.get('academics/classes/').then((res) => setClasses(res.data || [])));
      }
      if (canSeeComplaints) {
        requests.push(apiClient.get('social/complaints/').then((res) => setComplaints(res.data || [])));
      }
      if (canCreateUsers || canSubmitGrades) {
        requests.push(apiClient.get('users/').then((res) => setUsers(res.data || [])).catch(() => setUsers([])));
      }
      await Promise.all(requests);
    } catch (error) {
      setNotice('Could not load all workflow data yet.');
    }
  };

  useEffect(() => {
    loadData();
  }, [user?.role]);

  const createAccount = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const role = String(form.get('role'));
    const payload = {
      username: String(form.get('username')),
      email: String(form.get('email')),
      first_name: String(form.get('first_name') || ''),
      last_name: String(form.get('last_name') || ''),
      role,
      class_name: String(form.get('class_name') || ''),
      class_names: String(form.get('class_names') || '').split(',').map((name) => name.trim()).filter(Boolean),
      section: String(form.get('section') || ''),
      parent_name: String(form.get('parent_name') || ''),
      parent_email: String(form.get('parent_email') || ''),
    };
    const response = await apiClient.post('users/create/', payload);
    setCreatedEmail(payload.email);
    setCreatedPassword(response.data.temporary_password || '');
    if (response.data.parent_temporary_password) {
      setParentEmail(payload.parent_email);
      setParentPassword(response.data.parent_temporary_password);
    } else {
      setParentEmail('');
      setParentPassword('');
    }
    setNotice('Account created successfully. See login credentials below.');
    event.currentTarget.reset();
    loadData();
  };

  const submitGrade = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await apiClient.post('academics/grades/', Object.fromEntries(form.entries()));
    setNotice('Grade sent to the registrar for approval.');
    event.currentTarget.reset();
    loadData();
  };

  const markAttendance = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await apiClient.post('academics/attendance/', Object.fromEntries(form.entries()));
    setNotice('Attendance recorded.');
    event.currentTarget.reset();
    loadData();
  };


  const uploadClassWork = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const workType = String(form.get('work_type'));
    form.delete('work_type');
    const selectedClass = form.get('class_id');
    form.delete('class_id');
    if (selectedClass) form.append('classes', String(selectedClass));
    if (workType === 'material') {
      const details = form.get('instructions');
      form.delete('instructions');
      if (details) form.append('content', String(details));
    }
    const endpoint = workType === 'assignment' ? 'academics/assignments/' : 'academics/materials/';
    await apiClient.post(endpoint, form, { headers: { 'Content-Type': 'multipart/form-data' } });
    setNotice(workType === 'assignment' ? 'Assignment uploaded to the selected class.' : 'Note uploaded to the selected class.');
    event.currentTarget.reset();
  };
  const submitComplaint = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await apiClient.post('social/complaints/', Object.fromEntries(form.entries()));
    setNotice('Complaint submitted to administration.');
    event.currentTarget.reset();
  };


  const updateGradeStatus = async (grade: GradeItem, status: 'approved' | 'rejected') => {
    await apiClient.patch(`academics/grades/${grade.id}/`, { status });
    setNotice(`Grade ${status}.`);
    loadData();
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <header style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>School workflow</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '6px' }}>Manage grades, attendance, complaints, accounts, and password settings.</p>
      </header>

      {notice && <div className="glass-panel" style={{ padding: '14px', marginBottom: '18px', color: '#34d399' }}>{notice}</div>}

      <div style={{ display: 'grid', gap: '20px' }}>
        {canCreateUsers && (
          <section className="glass-panel" style={panelStyle}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>Create User Account</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '4px 0 12px 0' }}>Select the type of account you want to create to reveal the required details.</p>

            {/* Role Selector Buttons */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
              {[
                { id: 'student', label: 'Student (+ Parent)' },
                { id: 'teacher', label: 'Teacher' },
                { id: 'registrar', label: 'Registrar' },
                { id: 'administration', label: 'Administrator' },
              ].map((roleItem) => {
                const isSelected = selectedRole === roleItem.id;
                return (
                  <button
                    key={roleItem.id}
                    type="button"
                    onClick={() => setSelectedRole(roleItem.id)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '20px',
                      border: isSelected ? '1px solid var(--accent)' : '1px solid var(--glass-border)',
                      background: isSelected ? 'rgba(56, 189, 248, 0.18)' : 'rgba(255,255,255,0.03)',
                      color: isSelected ? 'var(--accent)' : 'var(--text-muted)',
                      fontWeight: isSelected ? 600 : 400,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {roleItem.label}
                  </button>
                );
              })}
            </div>

            <form onSubmit={createAccount} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
              <input type="hidden" name="role" value={selectedRole} />

              <input name="first_name" placeholder="First name" style={fieldStyle} />
              <input name="last_name" placeholder="Last name" style={fieldStyle} />
              <input name="username" placeholder="Username *" required style={fieldStyle} />
              <input name="email" type="email" placeholder="Email address *" required style={fieldStyle} />

              {selectedRole === 'student' && (
                <>
                  <input name="class_name" placeholder="Class Name (e.g. Grade 10)" style={fieldStyle} />
                  <input name="section" placeholder="Section (e.g. A)" style={fieldStyle} />
                  <input name="parent_name" placeholder="Parent Full Name (Optional)" style={fieldStyle} />
                  <input name="parent_email" type="email" placeholder="Parent Email (Optional)" style={fieldStyle} />
                </>
              )}

              {selectedRole === 'teacher' && (
                <>
                  <input name="class_names" placeholder="Assigned Classes (e.g. Math, Physics)" style={fieldStyle} />
                  <input name="section" placeholder="Section (e.g. A)" style={fieldStyle} />
                </>
              )}

              <div style={{ gridColumn: '1 / -1', marginTop: '4px' }}>
                <button className="btn" style={{ padding: '12px 28px' }}>Create {selectedRole.toUpperCase()} Account</button>
              </div>
            </form>

            {createdPassword && (
              <div style={{ background: 'rgba(52, 211, 153, 0.12)', border: '1px solid rgba(52, 211, 153, 0.3)', borderRadius: '10px', padding: '16px', marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <p style={{ margin: 0, color: '#34d399', fontWeight: 700, fontSize: '1.05rem' }}>✅ Account(s) created successfully!</p>
                
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px' }}>
                  <p style={{ margin: '0 0 6px 0', fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>{selectedRole} Login</p>
                  <p style={{ margin: '0 0 4px 0', fontSize: '0.95rem' }}>Email: <strong style={{ color: 'white' }}>{createdEmail}</strong></p>
                  <p style={{ margin: 0, fontSize: '0.95rem' }}>Password: <strong style={{ color: 'white', letterSpacing: '1px' }}>{createdPassword}</strong></p>
                </div>

                {parentPassword && (
                  <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px' }}>
                    <p style={{ margin: '0 0 6px 0', fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Parent Login</p>
                    <p style={{ margin: '0 0 4px 0', fontSize: '0.95rem' }}>Email: <strong style={{ color: 'white' }}>{parentEmail}</strong></p>
                    <p style={{ margin: 0, fontSize: '0.95rem' }}>Password: <strong style={{ color: 'white', letterSpacing: '1px' }}>{parentPassword}</strong></p>
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {canSubmitGrades && (
          <section className="glass-panel" style={panelStyle}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Send grade for approval</h2>
            <form onSubmit={submitGrade} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
              <select name="student" required style={fieldStyle}>{students.map((student) => <option key={student.id} value={student.id}>{student.full_name || student.username}</option>)}</select>
              <input name="subject" placeholder="Subject" required style={fieldStyle} />
              <input name="grade" placeholder="Grade" style={fieldStyle} />
              <input name="score" type="number" step="0.01" placeholder="Score" style={fieldStyle} />
              <input name="max_score" type="number" step="0.01" placeholder="Max score" style={fieldStyle} />
              <input name="term" placeholder="Term" style={fieldStyle} />
              <button className="btn" style={{ minHeight: '44px' }}>Send grade</button>
            </form>
          </section>
        )}

        {canSubmitGrades && (
          <section className="glass-panel" style={panelStyle}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Record attendance</h2>
            <form onSubmit={markAttendance} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
              <select name="student" required style={fieldStyle}>{students.map((student) => <option key={student.id} value={student.id}>{student.full_name || student.username}</option>)}</select>
              <input name="date" type="date" required style={fieldStyle} />
              <select name="status" style={fieldStyle}><option value="present">Present</option><option value="absent">Absent</option><option value="late">Late</option></select>
              <input name="notes" placeholder="Notes" style={fieldStyle} />
              <button className="btn" style={{ minHeight: '44px' }}>Save attendance</button>
            </form>
          </section>
        )}

        {canSubmitGrades && (
          <section className="glass-panel" style={panelStyle}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Upload assignment or note</h2>
            <form onSubmit={uploadClassWork} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
              <select name="work_type" required style={fieldStyle}>
                <option value="assignment">Assignment</option>
                <option value="material">Note / material</option>
              </select>
              <select name="class_id" required style={fieldStyle}>{classes.map((cls) => <option key={cls.id} value={cls.id}>{cls.name} - {cls.section}</option>)}</select>
              <input name="title" placeholder="Title" required style={fieldStyle} />
              <input name="subject" placeholder="Subject" style={fieldStyle} />
              <input name="file" type="file" required style={fieldStyle} />
              <textarea name="instructions" placeholder="Instructions or note details" rows={3} style={fieldStyle} />
              <button className="btn" style={{ minHeight: '44px' }}>Submit</button>
            </form>
          </section>
        )}
        {canSubmitComplaint && (
          <section className="glass-panel" style={panelStyle}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Submit complaint</h2>
            <form onSubmit={submitComplaint} style={{ display: 'grid', gap: '12px' }}>
              <input name="title" placeholder="Title" required style={fieldStyle} />
              <textarea name="description" placeholder="Complaint details" required rows={4} style={fieldStyle} />
              <button className="btn" style={{ minHeight: '44px' }}>Send complaint</button>
            </form>
          </section>
        )}



        {(canApproveGrades || user?.role === 'teacher' || user?.role === 'student' || user?.role === 'parent') && (
          <section className="glass-panel" style={panelStyle}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Grades</h2>
            {grades.length ? grades.map((grade) => (
              <div key={grade.id} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', padding: '10px 0', borderBottom: '1px solid var(--glass-border)' }}>
                <span><strong>{grade.student_name || grade.student}</strong> - {grade.subject}: {grade.grade || grade.score || 'Pending'} ({grade.status})</span>
                {canApproveGrades && grade.status === 'pending' && <span><button onClick={() => updateGradeStatus(grade, 'approved')} className="btn">Approve</button> <button onClick={() => updateGradeStatus(grade, 'rejected')} className="btn">Reject</button></span>}
              </div>
            )) : <p style={{ color: 'var(--text-muted)' }}>No grades available.</p>}
          </section>
        )}

        {(user?.role === 'teacher' || user?.role === 'student' || user?.role === 'parent') && (
          <section className="glass-panel" style={panelStyle}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Attendance</h2>
            {attendance.length ? attendance.map((item) => <div key={item.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--glass-border)' }}><strong>{item.student_name || item.student}</strong> - {item.date}: {item.status}</div>) : <p style={{ color: 'var(--text-muted)' }}>No attendance records available.</p>}
          </section>
        )}

        {canSeeComplaints && (
          <section className="glass-panel" style={panelStyle}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Complaints for admin</h2>
            {complaints.length ? complaints.map((item) => <div key={item.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--glass-border)' }}><strong>{item.title}</strong> from {item.submitted_by_name}: {item.description}</div>) : <p style={{ color: 'var(--text-muted)' }}>No complaints submitted.</p>}
          </section>
        )}

        {canCreateUsers && (
          <section className="glass-panel" style={panelStyle}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Accounts</h2>
            {users.map((item) => <div key={item.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--glass-border)' }}><strong>{item.full_name || item.username}</strong> - {item.email} ({item.role})</div>)}
          </section>
        )}
      </div>
    </div>
  );
};




