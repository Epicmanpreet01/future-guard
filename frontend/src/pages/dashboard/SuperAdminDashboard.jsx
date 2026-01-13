/* eslint-disable no-unused-vars */
import { useState } from "react";
import {
  Building,
  UserPlus,
  Settings,
  Search,
  Trash2,
  Eye,
  Download,
  Shield,
  X,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Target,
  Users,
  LogOut,
} from "lucide-react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../../components/utils/LoadingSpinner.jsx";

import { useLogoutMutation } from "../../hooks/mutations/authMutation.js";
import { useInstitutesQuery } from "../../hooks/queries/useInstitute.js";
import useAggregationsQuery from "../../hooks/queries/useAggregations.js";
import {
  useAddinstituteMutation,
  useRemoveInstituteMutation,
} from "../../hooks/mutations/instituteMutation.js";
import { useUpdateStatusMutation } from "../../hooks/mutations/adminMutation.js";

import {
  getRiskTotal,
  getReadableId,
  getTotalMentor,
  getSuccessRate,
} from "../../utils/dashboardUtils.js";
import { exportInstituteTableCSV } from "../../utils/dashboardUtils.js";

// --- Main Component ---
export default function SuperAdminDashboard({ authUser }) {
  const navigator = useNavigate();

  // Queries and mutations
  const { mutate: logoutMutate, isPending: logoutPending } =
    useLogoutMutation();
  const {
    data: institutes = [],
    isPending: institutePending,
    isError: instituteError,
  } = useInstitutesQuery();
  const {
    data: aggregations = {
      risk: { high: 0, medium: 0, low: 0 },
      success: 0,
      institute: { active: 0, inactive: 0 },
    },
    isPending: aggregationsPending,
    isError: aggregationsError,
  } = useAggregationsQuery({ role: authUser.role.toLowerCase() });
  const { mutate: addInstituteMutation, isPending: addInstitutePending } =
    useAddinstituteMutation();
  const { mutate: removeInstituteMutation, isPending: removeInstitutePending } =
    useRemoveInstituteMutation();
  const { mutate: updateStatusMutate, isPending: updatetatusPending } =
    useUpdateStatusMutation();

  // States
  const [showAddInstituteModal, setShowAddInstituteModal] = useState(false);
  const [showEditInstituteModal, setShowEditInstituteModal] = useState(false);
  const [selectedInstitute, setSelectedInstitute] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  if (institutePending || aggregationsPending) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (instituteError) {
    toast.error("Failed to fetch institute data");
  }

  if (aggregationsError) {
    toast.error("Failed to fetch aggregations");
  }

  // Stats
  const globalRiskStats = aggregations?.risk;
  const globalSuccessStats = aggregations?.success;
  const globalInstituteStats = aggregations?.institute;

  const riskDistribution = [
    { risk: "High", count: globalRiskStats?.high, color: "bg-red-500" },
    { risk: "Medium", count: globalRiskStats?.medium, color: "bg-yellow-500" },
    { risk: "Low", count: globalRiskStats?.low, color: "bg-green-500" },
  ];

  const topInstitutesByStudents = [...institutes]
    .sort((a, b) => getRiskTotal(b) - getRiskTotal(a))
    .slice(0, 5);

  const maxTopInstituteStudents =
    topInstitutesByStudents?.length > 0
      ? getRiskTotal(topInstitutesByStudents[0])
      : 1;
  const totalInstitutesForPercentage = globalInstituteStats?.total;

  const stats = {
    totalInstitutes: globalInstituteStats?.total || 0,
    totalAdmins: globalInstituteStats?.total || 0,
    avgSuccessRate:
      globalSuccessStats && globalRiskStats?.total
        ? Math.round((globalSuccessStats / globalRiskStats.total) * 100)
        : 0,
    totalHighRisk: globalRiskStats?.high || 0,
  };

  // --- Handlers ---
  const handleAddInstitute = (newInstitute) => {
    addInstituteMutation(newInstitute);
    setShowAddInstituteModal(false);
  };

  const handleUpdateInstitute = () => {
    updateStatusMutate({
      adminId: selectedInstitute.adminId._id,
      status: selectedInstitute.adminId.activeStatus,
    });
    setShowEditInstituteModal(false);
  };

  const handleDeleteInstitute = (id) => {
    removeInstituteMutation({ instituteId: id });
  };

  const filteredInstitutes = institutes.filter(
    (i) =>
      i.instituteName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.adminId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i._id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLogout = () => {
    logoutMutate(undefined, {
      onSuccess: () => {
        navigator("/login");
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      <style>{`
        @keyframes fade-in-scale {
            0% {
                opacity: 0;
                transform: scale(0.95);
            }
            100% {
                opacity: 1;
                transform: scale(1);
            }
        }
        .animate-fade-in-scale {
            animation: fade-in-scale 0.2s ease-out forwards;
        }
      `}</style>

      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-700 to-blue-500 rounded-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  FutureGuard SuperAdmin
                </h1>
                <p className="text-sm text-gray-500">
                  Global Management Dashboard
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  SuperAdmin Panel
                </p>
                <p className="text-xs text-gray-500">Owner</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 text-sm font-medium text-red-700 bg-red-100 border border-red-200 rounded-lg hover:bg-red-200 transition-colors"
                title="Log Out"
              >
                {logoutPending && <LoadingSpinner />}
                {!logoutPending && <LogOut className="w-4 h-4 mr-2" />}
                {!logoutPending && "Log Out"}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Stats */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Building}
            title="Total Institutes"
            value={stats.totalInstitutes}
            color="text-blue-600"
          />
          <StatCard
            icon={Users}
            title="Total Admins"
            value={stats.totalAdmins}
            color="text-emerald-600"
          />
          <StatCard
            icon={Target}
            title="Avg. Success Rate"
            value={`${stats.avgSuccessRate}%`}
            color="text-green-600"
          />
          <StatCard
            icon={AlertTriangle}
            title="High Risk Students"
            value={stats.totalHighRisk}
            color="text-red-600"
          />
        </section>

        {/* Layout */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Institute Analytics */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Institute Analytics
              </h3>
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">
                  Overall Status Breakdown
                </h4>
                <div className="flex bg-gray-200 rounded-lg h-8 overflow-hidden text-sm">
                  <div
                    className="bg-green-200 h-8 flex items-center justify-center transition-all duration-500"
                    style={{
                      width: `${
                        (globalInstituteStats.active /
                          totalInstitutesForPercentage) *
                        100
                      }%`,
                    }}
                  >
                    {globalInstituteStats.active > 0 && (
                      <span className="font-medium text-green-700">
                        {globalInstituteStats.active} Active
                      </span>
                    )}
                  </div>
                  <div
                    className="bg-red-200 h-8 flex items-center justify-center transition-all duration-500"
                    style={{
                      width: `${
                        (globalInstituteStats.inactive /
                          totalInstitutesForPercentage) *
                        100
                      }%`,
                    }}
                  >
                    {globalInstituteStats.inactive > 0 && (
                      <span className="font-medium text-red-700">
                        {globalInstituteStats.inactive} Inactive
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-4">
                  Top Institutes by Student Count
                </h4>
                {topInstitutesByStudents.length > 0 ? (
                  <div className="space-y-4">
                    {topInstitutesByStudents.map((inst) => (
                      <div key={inst._id} className="flex items-center">
                        <p className="font-medium text-gray-800 text-sm w-1/2 truncate pr-4">
                          {inst.instituteName}
                        </p>
                        <div className="w-1/2 flex items-center">
                          <div className="flex-grow bg-gray-200 rounded-full h-4 mr-2">
                            <div
                              className="bg-blue-400 h-4 rounded-full transition-all duration-500"
                              style={{
                                width: `${
                                  (getRiskTotal(inst) /
                                    maxTopInstituteStudents) *
                                  100
                                }%`,
                              }}
                            ></div>
                          </div>
                          <span className="font-bold text-blue-500 w-12 text-right">
                            {getRiskTotal(inst)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    No institute data available.
                  </p>
                )}
              </div>
            </div>

            {/* Institute Management Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Institute Management
                  </h2>
                  <button
                    onClick={() => setShowAddInstituteModal(true)}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                  >
                    <UserPlus className="w-4 h-4 mr-2" /> Add Institute
                  </button>
                </div>
                <div className="mt-4 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search institutes by name, admin, or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-900 placeholder-gray-500"
                  />
                </div>
              </div>
              <div className="max-h-[800px] overflow-y-auto">
                <table id="instituteTable" className="w-full">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Institute
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Admin
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Mentors
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Students
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Success
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        High Risk
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredInstitutes.length > 0 ? (
                      filteredInstitutes.map((i) => (
                        <tr
                          key={i._id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">
                              {i.instituteName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {getReadableId(i._id)}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {i.adminId.name}
                          </td>
                          <td className="px-6 py-4 text-sm text-center text-gray-900">
                            {getTotalMentor(i.adminId)}
                          </td>
                          <td className="px-6 py-4 text-sm text-center text-gray-900">
                            {getRiskTotal(i)}
                          </td>
                          <td className="px-6 py-4 text-sm text-center text-gray-900">
                            {getSuccessRate(i.adminId)}%
                          </td>
                          <td className="px-6 py-4 text-sm text-red-600 text-center font-medium">
                            {i.adminId.aggregations.risk.high}
                          </td>
                          <td className="px-6 py-4 text-sm text-center">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                i.adminId.activeStatus
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {i.adminId.activeStatus ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-center">
                            <div className="flex space-x-3 justify-center">
                              <button
                                onClick={() => {
                                  setSelectedInstitute({ ...i });
                                  setShowEditInstituteModal(true);
                                }}
                                className="text-blue-600 hover:text-blue-900 transition-colors"
                                title="View/Edit Institute"
                              >
                                <Eye className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleDeleteInstitute(i._id)}
                                className="text-red-500 hover:text-red-800 transition-colors"
                                title="Delete Institute"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="8"
                          className="text-center py-12 text-gray-500"
                        >
                          No institutes found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <aside className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <ActionButton
                  icon={Download}
                  text="Export Global Reports"
                  onClick={() =>
                    exportInstituteTableCSV("instituteTable", "institute")
                  }
                />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                All Universities Avg Student Risk
              </h3>
              <div className="space-y-4">
                {riskDistribution.map((item) => (
                  <div key={item.risk}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">
                        {item.risk}
                      </span>
                      <span className="text-sm font-medium text-gray-700">
                        {item.count}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className={`${item.color} h-2.5 rounded-full`}
                        style={{
                          width: `${
                            (item.count / globalRiskStats.total) * 100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Universities Risk Distribution
              </h3>
              <div className="space-y-4">
                {riskDistribution.map((item) => (
                  <div key={item.risk}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">
                        {item.risk}
                      </span>
                      <span className="text-sm font-medium text-gray-700">
                        {item.count}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className={`${item.color} h-2.5 rounded-full`}
                        style={{
                          width: `${
                            (item.count / globalRiskStats.total) * 100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Universities Performance
              </h3>
              <div className="space-y-4">
                {institutes.slice(0, 4).map((inst) => (
                  <div
                    key={inst._id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {inst.instituteName}
                      </p>
                      <p className="text-xs text-gray-500">
                        Success Score: {getSuccessRate(inst.adminId) || 0}%
                      </p>
                    </div>
                    <div
                      className={`flex items-center space-x-1 ${
                        getSuccessRate(inst.adminId) >= 85
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      {inst.interventionSuccess >= 85 ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                      <span className="text-sm font-bold">
                        {getSuccessRate(inst.adminId) || 0}%
                      </span>
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
          <p>
            &copy; {new Date().getFullYear()} FutureGuard. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Add/Edit Modals */}
      <AddInstituteModal
        show={showAddInstituteModal}
        onClose={() => setShowAddInstituteModal(false)}
        onAdd={handleAddInstitute}
      />
      {selectedInstitute && (
        <EditInstituteModal
          show={showEditInstituteModal}
          onClose={() => {
            setShowEditInstituteModal(false);
            setSelectedInstitute(null);
          }}
          institute={selectedInstitute}
          setInstitute={setSelectedInstitute}
          onUpdate={handleUpdateInstitute}
        />
      )}
    </div>
  );
}

// --- Reusable Components ---
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

const ActionButton = ({ icon: Icon, text, onClick }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center px-4 py-3 text-left text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
  >
    <Icon className="w-5 h-5 mr-3 text-gray-500" />
    {text}
  </button>
);

// --- Modals ---
const Modal = ({ show, onClose, title, children, maxWidth = "max-w-md" }) => {
  if (!show) return null;
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 transition-opacity duration-300"
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-xl shadow-xl w-full ${maxWidth} p-6 transform transition-all duration-300 animate-fade-in-scale`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

const InputField = ({ label, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label}
    </label>
    <input
      {...props}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-900 placeholder-gray-500"
    />
  </div>
);

const AddInstituteModal = ({ show, onClose, onAdd }) => {
  const [newInstitute, setNewInstitute] = useState({
    instituteName: "",
    name: "",
    email: "",
    password: "",
  });

  const handleAddClick = () => {
    onAdd(newInstitute);
    setNewInstitute({ instituteName: "", name: "", email: "", password: "" });
  };

  return (
    <Modal show={show} onClose={onClose} title="Add New Institute">
      <div className="space-y-4">
        <InputField
          label="Institute Name"
          type="text"
          placeholder="e.g., Central University"
          value={newInstitute.instituteName}
          onChange={(e) =>
            setNewInstitute({ ...newInstitute, instituteName: e.target.value })
          }
        />
        <InputField
          label="Admin Name"
          type="text"
          placeholder="e.g., Dr. Jane Doe"
          value={newInstitute.name}
          onChange={(e) =>
            setNewInstitute({ ...newInstitute, name: e.target.value })
          }
        />
        <InputField
          label="Admin Email ID"
          type="text"
          placeholder="e.g., mail@gmail.com"
          value={newInstitute.email}
          onChange={(e) =>
            setNewInstitute({ ...newInstitute, email: e.target.value })
          }
        />
        <InputField
          label="Admin Password"
          type="password"
          placeholder="••••••••"
          value={newInstitute.password}
          onChange={(e) =>
            setNewInstitute({ ...newInstitute, password: e.target.value })
          }
        />
      </div>
      <div className="mt-6 flex justify-end space-x-3">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
        >
          Cancel
        </button>
        <button
          onClick={handleAddClick}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          Add Institute
        </button>
      </div>
    </Modal>
  );
};

const EditInstituteModal = ({
  show,
  onClose,
  institute,
  setInstitute,
  onUpdate,
}) => {
  if (!institute) return null;

  return (
    <Modal show={show} onClose={onClose} title="Edit Institute Details">
      <div className="space-y-4">
        <InputField
          label="Institute Name"
          type="text"
          value={institute.instituteName}
          disabled
        />
        <InputField
          label="Admin Name"
          type="text"
          value={institute.adminId?.name || ""}
          disabled
        />
        <InputField
          label="Admin Email ID"
          type="text"
          value={institute.adminId?.email || ""}
          disabled
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            value={institute.adminId.activeStatus}
            onChange={(e) =>
              setInstitute({
                ...institute,
                adminId: {
                  ...institute.adminId,
                  activeStatus: e.target.value === "true",
                },
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
          >
            <option value="" disabled className="text-gray-500">
              Select status
            </option>
            <option value={true}>Active</option>
            <option value={false}>Inactive</option>
          </select>
        </div>
      </div>
      <div className="mt-6 flex justify-end space-x-3">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
        >
          Cancel
        </button>
        <button
          onClick={onUpdate}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          Update Institute
        </button>
      </div>
    </Modal>
  );
};
