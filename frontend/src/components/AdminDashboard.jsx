import React, { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  Settings,
  BarChart3,
  Search,
  Trash2,
  Eye,
  Download,
  Brain,
  Shield,
  X,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Activity,
  Target,
  BookOpen,
  UploadCloud,
  LogOut,
} from "lucide-react";

import { useLogoutMutation } from "../hooks/mutations/authMutation.js";
import LoadingSpinner from "./utils/LoadingSpinner.jsx";

// --- Master list of all departments, cleaned and deduplicated ---
const allInstituteDepartments = [
    'Accountancy & Business Statistics (ABST)', 'Aerospace Engineering', 'Agricultural Economics', 'Agricultural Sciences', 'Agronomy', 'AI & Data Science', 'Anatomy', 'Animal Husbandry', 'Architecture & Planning', 'Arts', 'Bachelor in Arts (B.A.)', 'Bachelor in Commerce (B.Com.)', 'Bachelor in Computer Applications (B.C.A.)', 'Bachelor in Physical Education (B.P.Ed.)', 'Bachelor in Science (B.Sc.) Computer Science', 'Bachelor in Science (B.Sc.) Hons.', 'Bachelor in Science (B.Sc.) Medical & Non-Medical', 'Bachelors in Arts (B.A.)', 'Banking & Insurance', 'Biochemistry', 'Bio-Informatics', 'Biotechnology', 'Biotechnology / Bioengineering', 'Botany', 'Business Administration', 'Business Administration (BBA / MBA)', 'Carrier Oriented Courses', 'Chemical Engineering', 'Chemistry', 'Civil & Family Law', 'Civil Engineering (CE)', 'Commerce (B.Com, M.Com)', 'Community Medicine', 'Computer Science & Applications', 'Computer Science & Engineering (CSE)', 'Constitutional Law', 'Corporate Law', 'Criminal Law', 'Dairy Science', 'Dentistry', 'Dermatology', 'Design (Fashion, Industrial, Graphic, etc.)', 'Economic Administration and Financial Management (EAFM)', 'Economics', 'Education (B.Ed, M.Ed)', 'Electrical Engineering (EE)', 'Electronics & Communication Engineering (ECE)', 'Engineering', 'English / Literature', 'Entomology', 'Environmental Auditing', 'Environmental Science', 'Environmental Studies', 'Film & Media Studies', 'Finance & Accounting', 'Fine Arts', 'Food Technology', 'Forensic Medicine', 'Forestry', 'Geography', 'Geology', 'Gynecology & Obstetrics', 'Hindi', 'History', 'Horticulture', 'Human Rights', 'Information Technology (IT)', 'Journalism & Mass Communication', 'Labour Law', 'Languages (Hindi, Sanskrit, Foreign Languages etc.)', 'Law (LLB, LLM)', 'Library & Information Science', 'M.A.I English', 'M.Sc.I Zoology', 'Management Studies', 'Marketing', 'Master in Arts (M.A.) English & History', 'Master in Arts (M.A.) Music Instrumental, Music Vocal, Economics, Public Administration and Dance', 'Master in Commerce (M.Com.) Semester System', 'Master in Science (M.Sc.) Information Technology', 'Mathematics', 'Mechanical Engineering (ME)', 'Medicine', 'Medicine (MBBS)', 'Metallurgical & Materials Engineering', 'Microbiology', 'Mining Engineering', 'Music, Theatre & Dance', 'Nursing', 'Orthopedics', 'Pathology', 'Pediatrics', 'Performing Arts (Music, Dance, Theatre)', 'Petroleum Engineering', 'Pharmacology', 'Pharmacy', 'Philosophy', 'Physical Education & Sports', 'Physics', 'Physiology', 'Physiotherapy', 'Plant Breeding & Genetics', 'Plant Pathology', 'Political Science', 'Post Graduate Diploma in Dress Designing', 'Post Graduate Diploma in Mass Communication', 'Postgraduate Diploma in Translation (English to Hindi)', 'Psychiatry', 'Psychology', 'Public Administration', 'Public Health', 'Sanskrit', 'Social Work', 'Sociology', 'Soil Science', 'Statistics', 'Surgery', 'Tourism & Travel Management', 'Tribal Studies', 'Urdu / Persian', 'Veterinary Anatomy', 'Veterinary Medicine', 'Zoology'
];


// Main Dashboard Component
export default function AdminDashboard() {
  // State for config data mapping - no longer used by the modal but kept for now
  const [configData, setConfigData] = useState({ studentIdColumn: "student_id", nameColumn: "full_name", gradeColumn: "current_grade", attendanceColumn: "attendance_rate", performanceColumn: "gpa" });

  const [showAddMentorModal, setShowAddMentorModal] = useState(false);
  const [showEditMentorModal, setShowEditMentorModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showDepartmentsModal, setShowDepartmentsModal] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { mutate: logoutMutate, isPending, isError } = useLogoutMutation();
  // Sample mentor data
  const [mentors, setMentors] = useState([
    { id: "M001", name: "Dr. Sarah Johnson", email: "sarah.j@institute.edu", department: "Computer Science & Engineering (CSE)", studentsAssigned: 45, status: "Active", interventionSuccess: 85, riskPredictions: { high: 8 } },
    { id: "M002", name: "Prof. Michael Chen", email: "michael.c@institute.edu", department: "Mathematics", studentsAssigned: 38, status: "Active", interventionSuccess: 78, riskPredictions: { high: 5 } },
    { id: "M003", name: "Dr. Emily Davis", email: "emily.d@institute.edu", department: "Psychology", studentsAssigned: 52, status: "Active", interventionSuccess: 91, riskPredictions: { high: 12 } },
    { id: "M004", name: "Prof. James Wilson", email: "james.w@institute.edu", department: "Mechanical Engineering (ME)", studentsAssigned: 41, status: "Inactive", interventionSuccess: 82, riskPredictions: { high: 6 } },
    { id: "M005", name: "Dr. Jessica Brown", email: "jessica.b@institute.edu", department: "Psychology", studentsAssigned: 48, status: "Active", interventionSuccess: 88, riskPredictions: { high: 10 } },
    { id: "M006", name: "Mr. David Smith", email: "david.s@institute.edu", department: "Business Administration (BBA / MBA)", studentsAssigned: 60, status: "Active", interventionSuccess: 95, riskPredictions: { high: 4 } },
    { id: "M007", name: "Ms. Linda White", email: "linda.w@institute.edu", department: "Computer Science & Engineering (CSE)", studentsAssigned: 33, status: "Active", interventionSuccess: 89, riskPredictions: { high: 7 } },
    { id: "M008", name: "Dr. Robert Green", email: "robert.g@institute.edu", department: "Psychology", studentsAssigned: 55, status: "Active", interventionSuccess: 93, riskPredictions: { high: 9 } },
    { id: "M009", name: "Prof. Karen Hall", email: "karen.h@institute.edu", department: "Fine Arts", studentsAssigned: 25, status: "Active", interventionSuccess: 81, riskPredictions: { high: 3 } },
    { id: "M010", name: "Dr. Steven King", email: "steven.k@institute.edu", department: "Mechanical Engineering (ME)", studentsAssigned: 42, status: "Active", interventionSuccess: 76, riskPredictions: { high: 8 } },
    { id: "M011", name: "Ms. Nancy Adams", email: "nancy.a@institute.edu", department: "Business Administration (BBA / MBA)", studentsAssigned: 58, status: "Inactive", interventionSuccess: 90, riskPredictions: { high: 5 } },
    { id: "M012", name: "Mr. Paul Wright", email: "paul.w@institute.edu", department: "Computer Science & Engineering (CSE)", studentsAssigned: 39, status: "Active", interventionSuccess: 92, riskPredictions: { high: 6 } },
  ]);

  // Sample analytics data for graphs
  const analyticsData = {
    riskDistribution: [
      { risk: "High Risk", count: 31, color: "bg-red-200" },
      { risk: "Medium Risk", count: 59, color: "bg-yellow-300" },
      { risk: "Low Risk", count: 86, color: "bg-green-200" },
    ],
    departmentPerformance: [
      { department: "Psychology", score: 95, trend: "up" },
      { department: "Computer Science", score: 92, trend: "up" },
      { department: "Mathematics", score: 88, trend: "down" },
      { department: "Engineering", score: 87, trend: "up" },
    ],
  };
  const totalRiskStudents = analyticsData.riskDistribution.reduce((sum, item) => sum + item.count, 0) || 1;

  // State for new mentor form
  const [newMentor, setNewMentor] = useState({ name: "", email: "", department: "", password: "", confirmPassword: "" });
  
  // Calculated stats from mentor data
  const stats = {
    totalMentors: mentors.length,
    activeMentors: mentors.filter((m) => m.status === "Active").length,
    avgSuccessRate: Math.round(mentors.reduce((sum, m) => sum + m.interventionSuccess, 0) / (mentors.length || 1)),
    totalHighRiskStudents: mentors.reduce((sum, m) => sum + m.riskPredictions.high, 0),
  };

  // --- Mentor stats for the analytics panel ---
  const departmentCounts = mentors.reduce((acc, mentor) => {
    acc[mentor.department] = (acc[mentor.department] || 0) + 1;
    return acc;
  }, {});

  const departmentData = Object.entries(departmentCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  const topDepartments = departmentData.slice(0, 6);
  const maxTopDepartmentCount = topDepartments.length > 0 ? topDepartments[0].count : 0;


  const activeInactiveData = {
      active: mentors.filter(m => m.status === 'Active').length,
      inactive: mentors.filter(m => m.status === 'Inactive').length,
  };
  const totalMentorsForPercentage = mentors.length || 1;
  
  // Handlers for mentor CRUD operations
  const handleAddMentor = () => {
    if (newMentor.name && newMentor.email && newMentor.department && newMentor.password && newMentor.password === newMentor.confirmPassword) {
      const mentorId = "M" + String(mentors.length + 1).padStart(3, "0");
      setMentors([...mentors, { id: mentorId, ...newMentor, studentsAssigned: 0, status: "Active", interventionSuccess: 0, riskPredictions: { high: 0 } }]);
      setNewMentor({ name: "", email: "", department: "", password: "", confirmPassword: "" });
      setShowAddMentorModal(false);
    } else {
        alert("Please fill all fields and ensure passwords match.");
    }
  };
  
  const handleUpdateMentor = () => {
    if(!selectedMentor) return;
    setMentors(mentors.map(m => m.id === selectedMentor.id ? selectedMentor : m));
    setShowEditMentorModal(false);
    setSelectedMentor(null);
  }

  const handleDeleteMentor = (mentorId) => {
    if (window.confirm("Are you sure you want to delete this mentor?")) {
        setMentors(mentors.filter((m) => m.id !== mentorId));
    }
  };

  const filteredMentors = mentors.filter((mentor) =>
      mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mentor.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mentor.id.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Effect to lock body scroll when a modal is open
  useEffect(() => {
    const isModalOpen = showAddMentorModal || showEditMentorModal || showConfigModal || showDepartmentsModal;
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    // Cleanup function
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showAddMentorModal, showEditMentorModal, showConfigModal, showDepartmentsModal]);
    const handleLogout = async () => {
        logoutMutate();
    }
  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">FutureGuard Admin</h1>
                <p className="text-sm text-gray-500">Institute Management Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">Admin Panel</p>
                <p className="text-xs text-gray-500">Springfield Institute</p>
              </div>
              <button 
                onClick={handleLogout} 
                className="flex items-center px-4 py-2 text-sm font-medium text-red-700 bg-red-100 border border-red-200 rounded-lg hover:bg-red-200 transition-colors"
                title="Log Out"
              >
                <LogOut className="w-4 h-4 mr-2" />
                {isPending ? <LoadingSpinner /> : 'Log Out'} 
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard icon={Users} title="Total Mentors" value={stats.totalMentors} color="text-teal-600" />
            <StatCard icon={Shield} title="Active Mentors" value={stats.activeMentors} color="text-blue-600" />
            <StatCard icon={Target} title="Avg. Success Rate" value={`${stats.avgSuccessRate}%`} color="text-green-500" />
            <StatCard icon={AlertTriangle} title="High Risk Students" value={stats.totalHighRiskStudents} color="text-red-500" />
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Mentor Analytics</h3>
                    <div className="mb-6">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Overall Status Breakdown</h4>
                        <div className="flex bg-gray-200 rounded-lg h-8 overflow-hidden text-sm">
                            <div className="bg-green-200 h-8 flex items-center justify-center transition-all duration-500" style={{ width: `${(activeInactiveData.active / totalMentorsForPercentage) * 100}%` }} title={`Active: ${activeInactiveData.active}`}>
                                {activeInactiveData.active > 0 && <span className="font-medium text-green-700">{activeInactiveData.active} Active</span>}
                            </div>
                            <div className="bg-red-200 h-8 flex items-center justify-center transition-all duration-500" style={{ width: `${(activeInactiveData.inactive / totalMentorsForPercentage) * 100}%` }} title={`Inactive: ${activeInactiveData.inactive}`}>
                                {activeInactiveData.inactive > 0 && <span className="font-medium text-red-700">{activeInactiveData.inactive} Inactive</span>}
                            </div>
                        </div>
                    </div>
                    <div className="border-t border-gray-200 my-6"></div>
                    <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-4">Top Departments by Mentor Count</h4>
                        {topDepartments.length > 0 ? (
                            <div className="space-y-4">
                                {topDepartments.map((dept) => (
                                    <div key={dept.name} className="flex items-center">
                                        <p className="font-medium text-gray-800 text-sm w-1/2 truncate pr-4">{dept.name}</p>
                                        <div className="w-1/2 flex items-center">
                                            <div className="flex-grow bg-gray-200 rounded-full h-4 mr-2">
                                                <div 
                                                    className="bg-teal-400 h-4 rounded-full transition-all duration-500"
                                                    style={{ width: `${(dept.count / maxTopDepartmentCount) * 100}%` }}
                                                ></div>
                                            </div>
                                            <span className="font-bold text-teal-400 w-8 text-right">{dept.count}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : <p className="text-gray-500 text-center py-4">No mentor data available.</p>}
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-semibold text-gray-900">Mentor Management</h2>
                            <button onClick={() => setShowAddMentorModal(true)} className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 transition-colors">
                                <UserPlus className="w-4 h-4 mr-2" /> Add Mentor
                            </button>
                        </div>
                        <div className="mt-4 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input type="text" placeholder="Search mentors by name, department, or ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition text-gray-900 placeholder-gray-500" />
                        </div>
                    </div>
                    <div className="max-h-[600px] overflow-y-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 sticky top-0 z-10">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mentor</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Students</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Success</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">High Risk</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredMentors.map((mentor) => (
                                    <tr key={mentor.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{mentor.name}</div>
                                            <div className="text-sm text-gray-500">{mentor.id}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{mentor.department}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">{mentor.studentsAssigned}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{mentor.interventionSuccess}%</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-400 font-medium text-center">{mentor.riskPredictions.high}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${mentor.status === 'Active' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>{mentor.status}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex space-x-3">
                                                <button onClick={() => { setSelectedMentor({ ...mentor }); setShowEditMentorModal(true); }} className="text-teal-500 hover:text-teal-800 transition-colors" title="View/Edit Mentor"><Eye className="w-5 h-5" /></button>
                                                <button onClick={() => handleDeleteMentor(mentor.id)} className="text-red-400 hover:text-red-700 transition-colors" title="Delete Mentor"><Trash2 className="w-5 h-5" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <aside className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                        <ActionButton icon={Settings} text="Configure Data Mapping" onClick={() => setShowConfigModal(true)} />
                        <ActionButton icon={BookOpen} text="All Departments Info" onClick={() => setShowDepartmentsModal(true)} />
                        <ActionButton icon={Download} text="Export Reports" onClick={() => alert("Exporting reports...")} />
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Student Risk Distribution</h3>
                    <div className="space-y-4">
                        {analyticsData.riskDistribution.map((item) => (
                           <div key={item.risk}>
                                <div className="flex justify-between mb-1">
                                    <span className="text-sm font-medium text-gray-700">{item.risk}</span>
                                    <span className="text-sm font-medium text-gray-700">{item.count}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div className={`${item.color} h-2.5 rounded-full`} style={{ width: `${(item.count / totalRiskStudents) * 100}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Department Performance</h3>
                    <div className="space-y-4">
                        {analyticsData.departmentPerformance.map((dept) => (
                            <div key={dept.department} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{dept.department}</p>
                                    <p className="text-xs text-gray-500">Success Score: {dept.score}%</p>
                                </div>
                                <div className={`flex items-center space-x-1 ${dept.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                                    {dept.trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                    <span className="text-sm font-bold">{dept.score}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </aside>
        </section>
      </main>

      <footer className="bg-white border-t border-gray-200 mt-8">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500">
            <p>&copy; {new Date().getFullYear()} FutureGuard. All rights reserved.</p>
        </div>
      </footer>

      <AddMentorModal show={showAddMentorModal} onClose={() => setShowAddMentorModal(false)} newMentor={newMentor} setNewMentor={setNewMentor} onAdd={handleAddMentor} />
      {selectedMentor && <EditMentorModal show={showEditMentorModal} onClose={() => { setShowEditMentorModal(false); setSelectedMentor(null); }} mentor={selectedMentor} setMentor={setSelectedMentor} onUpdate={handleUpdateMentor} />}
      <ConfigModal show={showConfigModal} onClose={() => setShowConfigModal(false)} />
      <DepartmentsModal show={showDepartmentsModal} onClose={() => setShowDepartmentsModal(false)} mentors={mentors} />
    </div>
  );
}

// --- Reusable Components ---
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
const ActionButton = ({ icon: Icon, text, onClick }) => (
    <button onClick={onClick} className="w-full flex items-center px-4 py-3 text-left text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
        <Icon className="w-5 h-5 mr-3 text-gray-500" />{text}
    </button>
);

// --- Modal Components ---
const Modal = ({ show, onClose, title, children, maxWidth = 'max-w-md' }) => {
    if (!show) return null;
    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50"
            onClick={onClose} // Add onClick to the backdrop to close the modal
        >
            <div 
                className={`bg-white rounded-xl shadow-xl w-full ${maxWidth} p-6`}
                onClick={(e) => e.stopPropagation()} // Stop click from bubbling up from the modal content
            >
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
                </div>
                {children}
            </div>
        </div>
    );
};

const InputField = ({ label, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
        <input {...props} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition text-gray-900 placeholder-gray-500" />
    </div>
);

const AddMentorModal = ({ show, onClose, newMentor, setNewMentor, onAdd }) => (
    <Modal show={show} onClose={onClose} title="Add New Mentor">
        <div className="space-y-4">
            <InputField label="Full Name" type="text" value={newMentor.name} onChange={e => setNewMentor({...newMentor, name: e.target.value})} placeholder="Enter mentor name" />
            <InputField label="Email" type="email" value={newMentor.email} onChange={e => setNewMentor({...newMentor, email: e.target.value})} placeholder="mentor@institute.edu" />
            <InputField label="Department" type="text" value={newMentor.department} onChange={e => setNewMentor({...newMentor, department: e.target.value})} placeholder="e.g., Computer Science" />
            <InputField label="Password" type="password" value={newMentor.password} onChange={e => setNewMentor({...newMentor, password: e.target.value})} placeholder="••••••••" />
            <InputField label="Confirm Password" type="password" value={newMentor.confirmPassword} onChange={e => setNewMentor({...newMentor, confirmPassword: e.target.value})} placeholder="••••••••" />
        </div>
        <div className="mt-6 flex justify-end space-x-3">
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
            <button onClick={onAdd} className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700">Add Mentor</button>
        </div>
    </Modal>
);

const EditMentorModal = ({ show, onClose, mentor, setMentor, onUpdate }) => (
    <Modal show={show} onClose={onClose} title="Edit Mentor Details">
         <div className="space-y-4">
            <InputField label="Full Name" type="text" value={mentor.name} onChange={e => setMentor({...mentor, name: e.target.value})} />
            <InputField label="Email" type="email" value={mentor.email} onChange={e => setMentor({...mentor, email: e.target.value})} />
            <InputField label="Department" type="text" value={mentor.department} onChange={e => setMentor({...mentor, department: e.target.value})} />
            <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                 <select value={mentor.status} onChange={e => setMentor({...mentor, status: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900">
                     <option value="Active">Active</option>
                     <option value="Inactive">Inactive</option>
                 </select>
            </div>
        </div>
        <div className="mt-6 flex justify-end space-x-3">
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
            <button onClick={onUpdate} className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700">Update Mentor</button>
        </div>
    </Modal>
);

const ConfigModal = ({ show, onClose }) => {
    const [files, setFiles] = useState([]);

    const handleFileChange = (event) => {
        const newFiles = Array.from(event.target.files);
        if (newFiles.length) {
            setFiles(prevFiles => [...prevFiles, ...newFiles]);
        }
    };
    
    const handleRemoveFile = (fileName) => {
        setFiles(prevFiles => prevFiles.filter(file => file.name !== fileName));
    };

    const handleUpload = () => {
        if (files.length === 0) {
            alert("Please select at least one file to upload.");
            return;
        }
        // Here you would typically handle the file upload logic,
        // e.g., sending the files to a backend server.
        alert(`${files.length} file(s) ready for upload: ${files.map(f => f.name).join(', ')}`);
        onClose(); // Close modal after initiating upload
    };

    return (
    <Modal show={show} onClose={onClose} title="Upload Student Data">
        <p className="text-sm text-gray-600 mb-4">Upload one or more CSV or Excel files containing student data. The system will process them accordingly.</p>
        
        <div className="space-y-4">
            {/* File Upload Area */}
            <label className="flex justify-center w-full h-32 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-md appearance-none cursor-pointer hover:border-gray-400 focus:outline-none">
                <span className="flex items-center space-x-2">
                    <UploadCloud className="w-6 h-6 text-gray-600" />
                    <span className="font-medium text-gray-600">
                        Drop files to Attach, or <span className="text-emerald-600 underline">browse</span>
                    </span>
                </span>
                <input 
                    type="file" 
                    name="file_upload" 
                    className="hidden" 
                    multiple
                    accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                    onChange={handleFileChange}
                />
            </label>

            {/* List of selected files */}
            {files.length > 0 && (
                <div className="border-t pt-4">
                     <h4 className="text-sm font-medium text-gray-800 mb-2">Selected Files:</h4>
                     <ul className="space-y-2 max-h-40 overflow-y-auto">
                        {files.map((file, index) => (
                            <li key={index} className="flex justify-between items-center text-sm p-2 bg-gray-100 rounded-md">
                                <span className="text-gray-800 truncate pr-2">{file.name}</span>
                                <button onClick={() => handleRemoveFile(file.name)} className="text-red-500 hover:text-red-700">
                                    <X size={16} />
                                </button>
                            </li>
                        ))}
                     </ul>
                </div>
            )}
        </div>

        <div className="mt-6 flex justify-end">
            <button 
                onClick={handleUpload} 
                className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:bg-emerald-300"
                disabled={files.length === 0}
            >
                Upload Files
            </button>
        </div>
    </Modal>
    );
};


const DepartmentsModal = ({ show, onClose, mentors }) => {
    const [departmentSearch, setDepartmentSearch] = useState('');

    const mentorCounts = mentors.reduce((acc, mentor) => {
        acc[mentor.department] = (acc[mentor.department] || 0) + 1;
        return acc;
    }, {});

    const allDepartmentsWithCounts = allInstituteDepartments.map(deptName => ({
        name: deptName,
        count: mentorCounts[deptName] || 0,
    }));
    
    const maxMentorCount = Math.max(...allDepartmentsWithCounts.map(d => d.count), 1);
    
    const filteredDepartments = allDepartmentsWithCounts.filter(dept => 
        dept.name.toLowerCase().includes(departmentSearch.toLowerCase())
    );

    return (
        <Modal show={show} onClose={onClose} title="All Institute Departments" maxWidth="max-w-4xl">
            <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input 
                    type="text" 
                    placeholder="Search for a department..."
                    value={departmentSearch}
                    onChange={e => setDepartmentSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition text-gray-900 placeholder-gray-500"
                />
            </div>
            <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-3">
                {filteredDepartments.length > 0 ? filteredDepartments.map(dept => (
                    <div key={dept.name} className="flex items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                        <p className="font-medium text-gray-800 text-sm w-1/2 truncate pr-4">{dept.name}</p>
                        <div className="w-1/2 flex items-center">
                            <div className="flex-grow bg-gray-200 rounded-full h-4 mr-2">
                                <div 
                                    className={`${dept.count > 0 ? 'bg-green-300' : 'bg-gray-200'} h-4 rounded-full transition-all duration-500`}
                                    style={{ width: `${(dept.count / maxMentorCount) * 100}%` }}
                                ></div>
                            </div>
                            <span className="font-bold text-green-400 w-8 text-right">{dept.count}</span>
                        </div>
                    </div>
                )) : (
                    <p className="text-center text-gray-500 py-8">No departments found.</p>
                )}
            </div>
        </Modal>
    );
};

