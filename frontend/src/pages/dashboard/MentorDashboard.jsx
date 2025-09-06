import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Users,
  Search,
  ChevronDown,
  AlertTriangle,
  CheckCircle2,
  PieChart,
  BarChart2,
  MoreVertical,
  LogOut,
  User,
  MessageSquare,
  FileText,
  Upload,
  Download,
  X,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

// --- MOCK STUDENT DATA ---
// Expanded to better showcase filtering and charts
const initialStudents = [
  { id: 'S001', name: 'Ravi Kumar', department: 'Computer Science', risk: 'Low', attendance: 92, feesPaid: true, lastContacted: '2025-08-28', grade: 8.5 },
  { id: 'S002', name: 'Priya Sharma', department: 'Electronics', risk: 'High', attendance: 65, feesPaid: false, lastContacted: '2025-09-01', grade: 5.8 },
  { id: 'S003', name: 'Amit Singh', department: 'Mechanical', risk: 'Medium', attendance: 78, feesPaid: true, lastContacted: '2025-08-25', grade: 7.2 },
  { id: 'S004', name: 'Sneha Patel', department: 'Civil', risk: 'Low', attendance: 95, feesPaid: true, lastContacted: '2025-09-03', grade: 9.1 },
  { id: 'S005', name: 'Vikram Rathore', department: 'Computer Science', risk: 'Low', attendance: 88, feesPaid: true, lastContacted: '2025-08-30', grade: 8.1 },
  { id: 'S006', name: 'Anjali Gupta', department: 'Biotechnology', risk: 'Medium', attendance: 81, feesPaid: false, lastContacted: '2025-08-22', grade: 7.5 },
  { id: 'S007', name: 'Rahul Verma', department: 'Electrical', risk: 'High', attendance: 58, feesPaid: true, lastContacted: '2025-09-02', grade: 5.2 },
  { id: 'S008', name: 'Natasha Iyer', department: 'Computer Science', risk: 'Low', attendance: 98, feesPaid: true, lastContacted: '2025-09-04', grade: 9.5 },
  { id: 'S009', name: 'Karan Malhotra', department: 'Mechanical', risk: 'Medium', attendance: 74, feesPaid: true, lastContacted: '2025-08-19', grade: 6.8 },
  { id: 'S010', name: 'Deepika Reddy', department: 'Electronics', risk: 'High', attendance: 71, feesPaid: false, lastContacted: '2025-08-29', grade: 6.1 },
  { id: 'S011', name: 'Arjun Desai', department: 'Civil', risk: 'Medium', attendance: 72, feesPaid: false, lastContacted: '2025-08-15' , grade: 6.5},
  { id: 'S012', name: 'Meera Nair', department: 'Biotechnology', risk: 'Low', attendance: 90, feesPaid: true, lastContacted: '2025-09-05', grade: 8.9 },
];

// --- MAIN MENTOR DASHBOARD COMPONENT ---
export default function MentorDashboard() {
  const [students, setStudents] = useState(initialStudents);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    risk: 'All',
    attendance: 'All',
    fees: 'All',
    department: 'All'
  });
  const [activeActionMenu, setActiveActionMenu] = useState(null);
  const [viewingStudent, setViewingStudent] = useState(null);

  // --- DERIVED DATA & CALCULATIONS ---

  const departments = useMemo(() => [...new Set(students.map(s => s.department))], [students]);

  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const searchMatch =
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.department.toLowerCase().includes(searchTerm.toLowerCase());
      
      const riskMatch = filters.risk === 'All' || student.risk === filters.risk;
      const feesMatch = filters.fees === 'All' || (filters.fees === 'Paid' ? student.feesPaid : !student.feesPaid);
      const attendanceMatch = filters.attendance === 'All' || (filters.attendance === 'Below 75' ? student.attendance < 75 : student.attendance >= 75);
      const departmentMatch = filters.department === 'All' || student.department === filters.department;

      return searchMatch && riskMatch && feesMatch && attendanceMatch && departmentMatch;
    });
  }, [students, searchTerm, filters]);

  const stats = useMemo(() => ({
    totalStudents: students.length,
    highRiskStudents: students.filter(s => s.risk === 'High').length,
    avgAttendance: Math.round(students.reduce((acc, s) => acc + s.attendance, 0) / (students.length || 1)),
    feesPending: students.filter(s => !s.feesPaid).length,
  }), [students]);

  // Data formatted for Recharts
  const riskChartData = useMemo(() => [
    { name: 'Low', value: students.filter(s => s.risk === 'Low').length, color: '#22c55e' },
    { name: 'Medium', value: students.filter(s => s.risk === 'Medium').length, color: '#f59e0b' },
    { name: 'High', value: students.filter(s => s.risk === 'High').length, color: '#ef4444' },
  ], [students]);

  const attendanceChartData = useMemo(() => [
      { month: 'May', attendance: 82 }, { month: 'June', attendance: 85 }, { month: 'July', attendance: 78 }, { month: 'Aug', attendance: 88 }, { month: 'Sept', attendance: 81 },
  ], []);
  
  const departmentChartData = useMemo(() => {
    const counts = students.reduce((acc, student) => {
        acc[student.department] = (acc[student.department] || 0) + 1;
        return acc;
    }, {});
    return Object.keys(counts).map(key => ({ name: key, students: counts[key] }));
  }, [students]);


  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Mentor Dashboard</h1>
                <p className="text-sm text-gray-500">Welcome, Dr. Ananya Sharma</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
               <button onClick={() => alert("Logging out...")} className="flex items-center px-4 py-2 text-sm font-medium text-red-700 bg-red-100 border border-red-200 rounded-lg hover:bg-red-200 transition-colors" title="Log Out" >
                <LogOut className="w-4 h-4 mr-2" />
                Log Out
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard icon={Users} title="Total Students" value={stats.totalStudents} color="text-amber-500" />
          <StatCard icon={AlertTriangle} title="High-Risk Students" value={stats.highRiskStudents} color="text-red-500" />
          <StatCard icon={CheckCircle2} title="Avg. Attendance" value={`${stats.avgAttendance}%`} color="text-green-500" />
          <StatCard icon={FileText} title="Fees Pending" value={stats.feesPending} color="text-orange-500" />
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Student Management</h2>
              <div className="mt-4 space-y-3">
                 <div className="relative flex-grow">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input type="text" placeholder="Search by name, ID, or department..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition text-gray-900 placeholder-gray-500" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                   <FilterDropdown label="Risk Level" value={filters.risk} onChange={(e) => handleFilterChange('risk', e.target.value)} options={['All', 'Low', 'Medium', 'High']} />
                   <FilterDropdown label="Attendance" value={filters.attendance} onChange={(e) => handleFilterChange('attendance', e.target.value)} options={['All', 'Above 75%', 'Below 75%']} />
                   <FilterDropdown label="Fee Status" value={filters.fees} onChange={(e) => handleFilterChange('fees', e.target.value)} options={['All', 'Paid', 'Pending']} />
                   <FilterDropdown label="Department" value={filters.department} onChange={(e) => handleFilterChange('department', e.target.value)} options={['All', ...departments]} />
                </div>
              </div>
            </div>
            <div className="max-h-[600px] overflow-y-auto">
              <StudentTable students={filteredStudents} activeActionMenu={activeActionMenu} setActiveActionMenu={setActiveActionMenu} onViewProfile={setViewingStudent} />
            </div>
          </div>

          <aside className="space-y-8">
            <QuickActions />
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Distribution</h3>
               <ResponsiveContainer width="100%" height={200}>
                <RechartsPieChart>
                  <Tooltip contentStyle={{ backgroundColor: 'white', borderRadius: '0.5rem', borderColor: '#e5e7eb' }} />
                  <Pie data={riskChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} labelLine={false}>
                    {riskChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <Legend iconType="circle" />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
             <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Department Distribution</h3>
              <ResponsiveContainer width="100%" height={200}>
                 <RechartsBarChart data={departmentChartData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" hide />
                    <YAxis type="category" dataKey="name" fontSize={12} tickLine={false} axisLine={false} width={80} />
                    <Tooltip cursor={{fill: 'rgba(245, 158, 11, 0.1)'}} contentStyle={{ backgroundColor: 'white', borderRadius: '0.5rem', borderColor: '#e5e7eb' }}/>
                    <Bar dataKey="students" name="Students" fill="#f59e0b" radius={[0, 4, 4, 0]} barSize={12}/>
                  </RechartsBarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Attendance Trend</h3>
              <ResponsiveContainer width="100%" height={200}>
                 <RechartsBarChart data={attendanceChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip cursor={{fill: 'rgba(245, 158, 11, 0.1)'}} contentStyle={{ backgroundColor: 'white', borderRadius: '0.5rem', borderColor: '#e5e7eb' }}/>
                    <Bar dataKey="attendance" name="Avg. Attendance" fill="#f97316" radius={[4, 4, 0, 0]} />
                  </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          </aside>
        </section>
      </main>

      {viewingStudent && <StudentProfileModal student={viewingStudent} onClose={() => setViewingStudent(null)} />}
    </div>
  );
}

// --- REUSABLE SUB-COMPONENTS ---

const StatCard = ({ icon: Icon, title, value, color }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
    <div className="flex items-center">
      <div className="flex-shrink-0"><Icon className={`h-8 w-8 ${color}`} /></div>
      <div className="ml-4">
        <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  </div>
);

const FilterDropdown = ({ label, value, onChange, options }) => (
  <div className="relative">
    <select value={value} onChange={onChange} className="appearance-none w-full bg-gray-50 border border-gray-300 text-gray-900 py-2 pl-3 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500">
      {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
    <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
  </div>
);

const QuickActions = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="space-y-3">
            <button onClick={() => alert("Importing student data...")} className="w-full flex items-center px-4 py-3 text-left text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <Upload className="w-5 h-5 mr-3 text-gray-500" />Import Students (CSV/Excel)
            </button>
            <button onClick={() => alert("Exporting student data...")} className="w-full flex items-center px-4 py-3 text-left text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <Download className="w-5 h-5 mr-3 text-gray-500" />Export Students (CSV/Excel)
            </button>
        </div>
    </div>
);


const StudentTable = ({ students, activeActionMenu, setActiveActionMenu, onViewProfile }) => {
  const getRiskClass = (risk) => ({ 'High': 'bg-red-100 text-red-700', 'Medium': 'bg-amber-100 text-amber-700', 'Low': 'bg-green-100 text-green-700' }[risk] || 'bg-gray-100 text-gray-700');
  const actionMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
        if (actionMenuRef.current && !actionMenuRef.current.contains(event.target)) {
            setActiveActionMenu(null);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setActiveActionMenu]);

  return (
    <table className="w-full">
      <thead className="bg-gray-50 sticky top-0 z-10">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Attendance</th>
          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Risk Level</th>
          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Fees</th>
          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {students.length > 0 ? students.map((student) => (
          <tr key={student.id} className="hover:bg-gray-50 transition-colors">
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm font-medium text-gray-900">{student.name}</div>
              <div className="text-sm text-gray-500">{student.id}</div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.department}</td>
            <td className="px-6 py-4 text-sm text-center text-gray-900">{student.attendance}%</td>
            <td className="px-6 py-4 text-center">
              <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${getRiskClass(student.risk)}`}>{student.risk}</span>
            </td>
            <td className="px-6 py-4 text-sm text-center">
              <span className={`inline-flex items-center text-xs font-medium ${student.feesPaid ? 'text-green-600' : 'text-orange-600'}`}>
                {student.feesPaid ? <CheckCircle2 className="w-4 h-4 mr-1.5" /> : <AlertTriangle className="w-4 h-4 mr-1.5" />}
                {student.feesPaid ? 'Paid' : 'Pending'}
              </span>
            </td>
            <td className="px-6 py-4 text-sm text-center font-medium relative">
               <button onClick={() => setActiveActionMenu(activeActionMenu === student.id ? null : student.id)} className="text-gray-500 hover:text-gray-800"><MoreVertical size={20} /></button>
               {activeActionMenu === student.id && (
                    <div ref={actionMenuRef} className="absolute right-8 top-full mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-20">
                        <ul className="py-1">
                            <li onClick={() => { onViewProfile(student); setActiveActionMenu(null); }} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"><User size={14} className="mr-2" /> View Full Profile</li>
                            <li onClick={() => { alert('Logging intervention for ' + student.name); setActiveActionMenu(null); }} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"><FileText size={14} className="mr-2" /> Log Intervention</li>
                            <li onClick={() => { alert('Sending message to ' + student.name); setActiveActionMenu(null); }} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"><MessageSquare size={14} className="mr-2" /> Send Message</li>
                        </ul>
                    </div>
               )}
            </td>
          </tr>
        )) : (
          <tr>
            <td colSpan="6" className="text-center py-12 text-gray-500">No students found.</td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

const StudentProfileModal = ({ student, onClose }) => {
  if (!student) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 animate-fade-in-scale" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Student Profile</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
        </div>
        <div className="space-y-4">
            <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center text-amber-500 text-2xl font-bold">{student.name.charAt(0)}</div>
                <div>
                    <h4 className="text-lg font-bold text-gray-800">{student.name}</h4>
                    <p className="text-sm text-gray-500">{student.id} | {student.department}</p>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4 border-t pt-4">
                <InfoItem label="Risk Level" value={student.risk} />
                <InfoItem label="Attendance" value={`${student.attendance}%`} />
                <InfoItem label="Fee Status" value={student.feesPaid ? 'Paid' : 'Pending'} />
                <InfoItem label="Last Contacted" value={student.lastContacted} />
                 <InfoItem label="Current Grade/GPA" value={student.grade} />
            </div>
            <div className="border-t pt-4">
                 <h5 className="text-sm font-bold text-gray-700 mb-2">Mentor Notes</h5>
                 <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                    {student.risk === 'High' ? "Priya has shown a significant drop in attendance. Needs immediate follow-up regarding her pending fees and recent test scores." : "Ravi is a consistent performer with excellent attendance. No immediate concerns."}
                 </p>
            </div>
        </div>
      </div>
    </div>
  );
};

const InfoItem = ({ label, value }) => (
    <div>
        <p className="text-xs text-gray-500 uppercase font-semibold">{label}</p>
        <p className="text-sm font-medium text-gray-800">{value}</p>
    </div>
);

