import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Users,
  Search,
  ChevronDown,
  AlertTriangle,
  CheckCircle2,
  BarChart2 as BarChartIcon,
  MoreVertical,
  LogOut,
  User,
  MessageSquare,
  FileText,
  Upload,
  Download,
  X,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ScatterChart,
  Scatter,
  ZAxis,
  Label,
} from "recharts";

import { useUploadedStudents } from "../../hooks/queries/useUploadStudents";
import { useUploadStudentsMutation } from "../../hooks/mutations/useUploadStudentsMutation";
import { useLogoutMutation } from "../../hooks/mutations/authMutation";
import useAggregationsQuery from "../../hooks/queries/useAggregations";
import { exportInstituteTableCSV } from "../../utils/dashboardUtils";

const riskToNumber = { Low: 1, Medium: 2, High: 3 };
const riskColors = { Low: "#22c55e", Medium: "#f59e0b", High: "#ef4444" };

const mapApiStudentToUI = (s) => ({
  id: s.rollId,
  name: s.studentName || "Student",
  risk: s.riskLabel.charAt(0).toUpperCase() + s.riskLabel.slice(1),
  attendance: Number(s.features?.attendancePercentage || 0),
  feesPaid: String(s.features?.feesPaid) === "true",
  gpa: Number(s.features?.cgpa || 0),
  lastContacted: null,

  explanation: s.explanation,
  recommendation: s.recommendation,
});

export default function MentorDashboard({ authUser }) {
  const fileInputRef = useRef(null);

  const {
    data: aggregations = {
      risk: { high: 0, medium: 0, low: 0, total: 0 },
      success: 0,
    },
    isPending: aggregationsPending,
  } = useAggregationsQuery({ role: authUser.role.toLowerCase() });

  const { mutate: uploadStudents, isPending: uploadPending } =
    useUploadStudentsMutation();

  const { mutate: logoutMutate, isPending: logoutPending } =
    useLogoutMutation();

  const { data: uploadedStudents = [] } = useUploadedStudents();

  const students = useMemo(
    () => uploadedStudents.map(mapApiStudentToUI),
    [uploadedStudents]
  );

  const [showAllStudentsModal, setShowAllStudentsModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);

  const highRiskStudents = useMemo(() => {
    return [...students]
      .sort((a, b) => {
        const order = { High: 3, Medium: 2, Low: 1 };
        return order[b.risk] - order[a.risk];
      })
      .slice(0, 10);
  }, [students]);

  const hasUploadedFile = uploadedStudents.length > 0;

  const avgAttendance = hasUploadedFile
    ? Math.round(
        uploadedStudents.reduce(
          (sum, s) => sum + Number(s.features?.attendancePercentage || 0),
          0
        ) / uploadedStudents.length
      )
    : null;

  const feesPendingCount = hasUploadedFile
    ? uploadedStudents.filter((s) => String(s.features?.feesPaid) !== "true")
        .length
    : null;

  const stats = {
    totalStudents: aggregations?.risk?.total || 0,
    highRiskStudents: aggregations?.risk?.high || 0,
    avgAttendance: hasUploadedFile ? avgAttendance : "...",
    feesPending: hasUploadedFile ? feesPendingCount : "...",
  };

  const riskChartData = useMemo(
    () => [
      {
        name: "Low",
        value: aggregations?.risk?.low || 0,
        color: riskColors.Low,
      },
      {
        name: "Medium",
        value: aggregations?.risk?.medium || 0,
        color: riskColors.Medium,
      },
      {
        name: "High",
        value: aggregations?.risk?.high || 0,
        color: riskColors.High,
      },
    ],
    [aggregations]
  );

  const successVsRiskData = useMemo(() => {
    const highRisk = aggregations?.risk?.high || 0;
    const success = aggregations?.success || 0;

    return [
      {
        name: "Students",
        Success: success,
        "High Risk": Math.max(highRisk - success, 0),
      },
    ];
  }, [aggregations]);

  if (aggregationsPending) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <style>{`
        @keyframes fade-in-scale {
            0% { opacity: 0; transform: scale(0.95); }
            100% { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in-scale { animation: fade-in-scale 0.2s ease-out forwards; }
    `}</style>
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Mentor Dashboard
                </h1>
                <p className="text-sm text-gray-500">
                  Welcome, {authUser?.name}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => logoutMutate()}
                disabled={logoutPending}
                className="flex items-center px-4 py-2 text-sm font-medium text-red-700 bg-red-100 border border-red-200 rounded-lg hover:bg-red-200 transition-colors"
                title="Log Out"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Log Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Users}
            title="Total Students"
            value={stats.totalStudents}
            color="text-amber-500"
          />
          <StatCard
            icon={AlertTriangle}
            title="High-Risk Students"
            value={stats.highRiskStudents}
            color="text-red-500"
          />
          <StatCard
            icon={CheckCircle2}
            title="Avg. Attendance"
            value={`${stats.avgAttendance}%`}
            color="text-green-500"
          />
          <StatCard
            icon={FileText}
            title="Fees Pending"
            value={stats.feesPending}
            color="text-orange-500"
          />
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                High-Risk Student Management
              </h2>
            </div>
            <div className="flex-grow overflow-y-auto max-h-[600px]">
              <StudentTable students={highRiskStudents} />
            </div>
          </div>

          <aside className="space-y-8">
            <QuickActions
              onShowAllStudents={() => setShowAllStudentsModal(true)}
              onShowAnalytics={() => setShowAnalyticsModal(true)}
              onImportStudents={() => {
                if (!uploadPending) fileInputRef.current?.click();
              }}
              uploadPending={uploadPending}
            />
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Risk Distribution
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      borderRadius: "0.5rem",
                      borderColor: "#e5e7eb",
                    }}
                  />
                  <Pie
                    data={riskChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    labelLine={false}
                  >
                    {riskChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Success vs High-Risk Students
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart
                  data={successVsRiskData}
                  margin={{ top: 10, right: 20, left: -10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Success" stackId="a" fill="#22c55e" />
                  <Bar dataKey="High Risk" stackId="a" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </aside>
        </section>
      </main>

      {showAllStudentsModal && (
        <AllStudentsModal
          students={students}
          onClose={() => setShowAllStudentsModal(false)}
        />
      )}
      {showAnalyticsModal && (
        <AnalyticsModal
          students={students}
          onClose={() => setShowAnalyticsModal(false)}
          authUser={authUser}
        />
      )}

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".csv,.xlsx,.xls"
        hidden
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          if (!files.length) return;

          uploadStudents(files);
          e.target.value = ""; // reset input
        }}
      />
    </div>
  );
}

// eslint-disable-next-line no-unused-vars
const StatCard = ({ icon: Icon, title, value, color }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
    <div className="flex items-center">
      <div className="flex-shrink-0">
        <Icon className={`h-8 w-8 ${color}`} />
      </div>
      <div className="ml-4">
        <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  </div>
);

const QuickActions = ({
  onShowAllStudents,
  onShowAnalytics,
  onImportStudents,
  uploadPending,
}) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
    <div className="space-y-3">
      <button
        onClick={onShowAllStudents}
        disabled={uploadPending}
        className="w-full flex items-center px-4 py-3 text-left text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <Users className="w-5 h-5 mr-3 text-gray-500" />
        All Student Management
      </button>
      <button
        onClick={onShowAnalytics}
        className="w-full flex items-center px-4 py-3 text-left text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <BarChartIcon className="w-5 h-5 mr-3 text-gray-500" />
        View Student Analytics
      </button>
      <button
        onClick={onImportStudents}
        disabled={uploadPending}
        className={`w-full flex items-center px-4 py-3 text-left text-sm font-medium rounded-lg transition-colors
    ${
      uploadPending
        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
        : "text-gray-700 bg-gray-50 hover:bg-gray-100"
    }
  `}
      >
        {uploadPending ? (
          <>
            <svg
              className="animate-spin h-5 w-5 mr-3 text-amber-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
            Processing students…
          </>
        ) : (
          <>
            <Download className="w-5 h-5 mr-3 text-gray-500" />
            Import Students (CSV/Excel)
          </>
        )}
      </button>
      <button
        onClick={() =>
          exportInstituteTableCSV("student-table", "students_export")
        }
        className="w-full flex items-center px-4 py-3 text-left text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <Upload className="w-5 h-5 mr-3 text-gray-500" />
        Export Students (CSV)
      </button>
    </div>
  </div>
);

const StudentTable = ({ students, isModal = false }) => {
  const [viewingStudent, setViewingStudent] = useState(null);

  const getRiskClass = (risk) =>
    ({
      High: "bg-red-100 text-red-700",
      Medium: "bg-amber-100 text-amber-700",
      Low: "bg-green-100 text-green-700",
    }[risk] || "bg-gray-100 text-gray-700");

  return (
    <>
      <table id="student-table" className="w-full">
        <thead className="bg-gray-50 sticky top-0 z-10">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Student
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Attendance
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Risk Level
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Fees
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {students.length > 0 ? (
            students.map((student, index) => (
              <tr
                key={student.id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {student.name}
                  </div>
                  <div className="text-sm text-gray-500">{student.id}</div>
                </td>
                <td className="px-6 py-4 text-sm text-center text-gray-900">
                  {student.attendance}%
                </td>
                <td className="px-6 py-4 text-center">
                  <span
                    className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${getRiskClass(
                      student.risk
                    )}`}
                  >
                    {student.risk}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-center">
                  <span
                    className={`inline-flex items-center text-xs font-medium ${
                      student.feesPaid ? "text-green-600" : "text-orange-600"
                    }`}
                  >
                    {student.feesPaid ? (
                      <CheckCircle2 className="w-4 h-4 mr-1.5" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 mr-1.5" />
                    )}
                    {student.feesPaid ? "Paid" : "Pending"}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-center font-medium relative">
                  <ActionMenu
                    student={student}
                    isFirst={isModal && index < 2}
                    onViewProfile={() => setViewingStudent(student)}
                  />
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center py-12 text-gray-500">
                No students found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      {viewingStudent && (
        <StudentProfileModal
          student={viewingStudent}
          onClose={() => setViewingStudent(null)}
        />
      )}
    </>
  );
};

const ActionMenu = ({ student, isFirst, onViewProfile }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-gray-500 hover:text-gray-800"
      >
        <MoreVertical size={20} />
      </button>
      {isOpen && (
        <div
          className={`absolute right-8 ${
            isFirst ? "bottom-full mb-1" : "top-full mt-1"
          } w-48 bg-white rounded-md shadow-lg border border-gray-200 z-20`}
        >
          <ul className="py-1">
            <li
              onClick={() => {
                onViewProfile();
                setIsOpen(false);
              }}
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
            >
              <User size={14} className="mr-2" /> View Full Profile
            </li>
            <li
              onClick={() => {
                alert("Logging intervention for " + student.name);
                setIsOpen(false);
              }}
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
            >
              <FileText size={14} className="mr-2" /> Log Intervention
            </li>
            <li
              onClick={() => {
                alert("Sending message to " + student.name);
                setIsOpen(false);
              }}
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
            >
              <MessageSquare size={14} className="mr-2" /> Send Message
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

const AllStudentsModal = ({ students, onClose }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    risk: "All",
    attendance: "All",
    fees: "All",
  });

  const handleFilterChange = (filterName, value) =>
    setFilters((prev) => ({ ...prev, [filterName]: value }));

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const searchMatch =
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.id.toLowerCase().includes(searchTerm.toLowerCase());
      const riskMatch = filters.risk === "All" || student.risk === filters.risk;
      const feesMatch =
        filters.fees === "All" ||
        (filters.fees === "Paid" ? student.feesPaid : !student.feesPaid);
      const attendanceMatch =
        filters.attendance === "All" ||
        (filters.attendance === "Below 75%"
          ? student.attendance < 75
          : student.attendance >= 75);
      return searchMatch && riskMatch && feesMatch && attendanceMatch;
    });
  }, [students, searchTerm, filters]);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-40"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-6xl h-[90vh] flex flex-col p-6 animate-fade-in-scale"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4 pb-4 border-b">
          <h3 className="text-xl font-semibold text-gray-900">
            All Student Management
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="space-y-3 mb-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-gray-900 placeholder-gray-500"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <FilterDropdown
              label="Risk Level"
              value={filters.risk}
              onChange={(e) => handleFilterChange("risk", e.target.value)}
              options={["All", "Low", "Medium", "High"]}
            />
            <FilterDropdown
              label="Attendance"
              value={filters.attendance}
              onChange={(e) => handleFilterChange("attendance", e.target.value)}
              options={["All", "Above 75%", "Below 75%"]}
            />
            <FilterDropdown
              label="Fee Status"
              value={filters.fees}
              onChange={(e) => handleFilterChange("fees", e.target.value)}
              options={["All", "Paid", "Pending"]}
            />
          </div>
        </div>
        <div className="flex-grow overflow-y-auto">
          <StudentTable students={filteredStudents} isModal={true} />
        </div>
      </div>
    </div>
  );
};

const AnalyticsModal = ({ students, onClose, authUser }) => {
  const riskData = useMemo(
    () => students.map((s) => ({ gpa: s.gpa, risk: riskToNumber[s.risk] })),
    [students]
  );

  const feesRiskData = useMemo(() => {
    const buckets = {
      Paid: { High: 0, Medium: 0, Low: 0 },
      Pending: { High: 0, Medium: 0, Low: 0 },
    };

    students.forEach((s) => {
      const key = s.feesPaid ? "Paid" : "Pending";
      buckets[key][s.risk]++;
    });

    return Object.entries(buckets).map(([name, values]) => ({
      name,
      ...values,
    }));
  }, [students]);

  const attendanceRiskData = useMemo(() => {
    const categories = {
      "<70%": { High: 0, Medium: 0, Low: 0 },
      "70-85%": { High: 0, Medium: 0, Low: 0 },
      ">85%": { High: 0, Medium: 0, Low: 0 },
    };
    students.forEach((s) => {
      if (s.attendance < 70) categories["<70%"][s.risk]++;
      else if (s.attendance <= 85) categories["70-85%"][s.risk]++;
      else categories[">85%"][s.risk]++;
    });
    return Object.keys(categories).map((key) => ({
      name: key,
      ...categories[key],
    }));
  }, [students]);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-40"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-6xl h-[90vh] flex flex-col p-6 animate-fade-in-scale"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4 pb-4 border-b">
          <h3 className="text-xl font-semibold text-gray-900">
            Student Analytics Dashboard
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="flex-grow overflow-y-auto pr-2">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AnalyticsCard title="GPA vs. Risk (Latest Data)">
              <ResponsiveContainer width="100%" height={250}>
                <ScatterChart
                  margin={{ top: 20, right: 30, bottom: 20, left: 20 }}
                >
                  <CartesianGrid />
                  <XAxis
                    type="number"
                    dataKey="gpa"
                    name="GPA"
                    domain={[5, 10]}
                  >
                    <Label value="GPA" offset={-15} position="insideBottom" />
                  </XAxis>
                  <YAxis
                    type="number"
                    dataKey="risk"
                    name="Risk"
                    domain={[0, 4]}
                    width={80}
                    ticks={[1, 2, 3]}
                    tickFormatter={(val) => ["Low", "Medium", "High"][val - 1]}
                  >
                    <Label
                      value="Risk Level"
                      angle={-90}
                      position="insideLeft"
                      style={{ textAnchor: "middle" }}
                    />
                  </YAxis>
                  <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                  <Scatter name="Students" data={riskData} fill="#f59e0b" />
                </ScatterChart>
              </ResponsiveContainer>
            </AnalyticsCard>
            <AnalyticsCard title="Fees Paid vs Risk">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart
                  data={feesRiskData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="High" stackId="a" fill="#ef4444" />
                  <Bar dataKey="Medium" stackId="a" fill="#f59e0b" />
                  <Bar dataKey="Low" stackId="a" fill="#22c55e" />
                </BarChart>
              </ResponsiveContainer>
            </AnalyticsCard>

            <AnalyticsCard title="Attendance vs. Risk">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart
                  data={attendanceRiskData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="High" stackId="a" fill="#ef4444" />
                  <Bar dataKey="Medium" stackId="a" fill="#f59e0b" />
                  <Bar
                    dataKey="Low"
                    stackId="a"
                    fill="#22c55e"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </AnalyticsCard>
            <AnalyticsCard title="Upload History">
              <div className="pt-2 max-h-[260px] overflow-y-auto pr-1">
                {(authUser.uploadHistory || []).length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-6">
                    No uploads yet
                  </p>
                ) : (
                  <div className="space-y-3">
                    {[...authUser.uploadHistory]
                      .sort(
                        (a, b) =>
                          new Date(b.uploadedAt) - new Date(a.uploadedAt)
                      )
                      .map((u) => (
                        <UploadItem
                          key={u.uploadedAt}
                          fileName={u.fileName}
                          date={new Date(u.uploadedAt)
                            .toISOString()
                            .slice(0, 10)}
                          count={u.studentCount}
                        />
                      ))}
                  </div>
                )}
              </div>
            </AnalyticsCard>
          </div>
        </div>
      </div>
    </div>
  );
};

const AnalyticsCard = ({ title, children }) => (
  <div className="bg-gray-50 rounded-lg p-4 border">
    <h4 className="font-semibold text-gray-800 mb-4">{title}</h4>
    {children}
  </div>
);
const UploadItem = ({ fileName, date, count }) => (
  <div className="flex justify-between items-center p-2 bg-white rounded border">
    <div>
      <p className="text-sm font-medium text-gray-700">{fileName}</p>
      <p className="text-xs text-gray-500">{date}</p>
    </div>
    <span className="text-sm font-semibold text-amber-600 bg-amber-100 px-2 py-1 rounded-full">
      {count} students
    </span>
  </div>
);

const StudentProfileModal = ({ student, onClose }) => {
  if (!student) return null;
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 animate-fade-in-scale"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900">
            Student Profile
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center text-amber-500 text-2xl font-bold">
              {student.name.charAt(0)}
            </div>
            <div>
              <h4 className="text-lg font-bold text-gray-800">
                {student.name}
              </h4>
              <p className="text-sm text-gray-500">{student.id}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 border-t pt-4">
            <InfoItem label="Risk Level" value={student.risk} />
            <InfoItem label="Attendance" value={`${student.attendance}%`} />
            <InfoItem
              label="Fee Status"
              value={student.feesPaid ? "Paid" : "Pending"}
            />
            <InfoItem label="Last Contacted" value={student.lastContacted} />
            <InfoItem label="Current GPA" value={student.gpa} />
          </div>
          <div className="border-t pt-4">
            <h5 className="text-sm font-bold text-gray-700 mb-2">
              Mentor Notes
            </h5>
            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
              <strong>Risk Reason:</strong>{" "}
              {student.explanation?.rule_reasons?.join(", ") ||
                "No explanation available"}
              <br />
              <strong>Recommendation:</strong>{" "}
              {student.recommendation || "No recommendation available"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const FilterDropdown = ({ label, value, onChange, options }) => (
  <div>
    <label className="block text-xs font-medium text-gray-600 mb-1">
      {label}
    </label>
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        className="appearance-none w-full bg-gray-50 border border-gray-300 text-gray-900 py-2 pl-3 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt
              .replace("Below 75%", "Below 75%")
              .replace("Above 75%", "Above 75%")}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
    </div>
  </div>
);

const InfoItem = ({ label, value }) => (
  <div>
    <p className="text-xs text-gray-500 uppercase font-semibold">{label}</p>
    <p className="text-sm font-medium text-gray-800">{value}</p>
  </div>
);
