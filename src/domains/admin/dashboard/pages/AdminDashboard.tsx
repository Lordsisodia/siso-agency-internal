import React from "react";

// Minimal Admin Dashboard page to break circular re-exports.
const AdminDashboardPage: React.FC = () => (
  <div className="p-6">
    <h1 className="text-2xl font-semibold text-slate-100">Admin Dashboard</h1>
    <p className="text-slate-400 mt-2">Dashboard content placeholder.</p>
  </div>
);

export default AdminDashboardPage;
export { AdminDashboardPage as AdminDashboard };
