import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/AppLayout';
import { ConnectedAppsScreen } from './components/ConnectedAppsScreen';
import { DataAgreementsScreen } from './components/DataAgreementsScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { HomeDashboard } from './components/HomeDashboard';
import { DeveloperLayout } from './components/developer/DeveloperLayout';
import { DeveloperAppsScreen } from './components/developer/DeveloperAppsScreen';
import { CreateAppScreen } from './components/developer/CreateAppScreen';
import { AppDashboardScreen } from './components/developer/AppDashboardScreen';
import { DeveloperOverviewScreen } from './components/developer/DeveloperOverviewScreen';
import { ApiKeysScreen } from './components/developer/ApiKeysScreen';
import { ApiDocsScreen } from './components/developer/ApiDocsScreen';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminOverviewScreen } from './components/admin/AdminOverviewScreen';
import { UserManagementScreen } from './components/admin/UserManagementScreen';
import { AppModerationScreen } from './components/admin/AppModerationScreen';
import { ComplianceScreen } from './components/admin/ComplianceScreen';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Main User Portal Routes */}
        <Route path="/*" element={
          <AppLayout>
            <Routes>
              <Route path="/" element={<HomeDashboard />} />
              <Route path="/apps" element={<ConnectedAppsScreen />} />
              <Route path="/agreements" element={<DataAgreementsScreen />} />
              <Route path="/settings" element={<SettingsScreen />} />
            </Routes>
          </AppLayout>
        } />

        {/* Developer Portal Routes */}
        <Route path="/developer/*" element={
          <AppLayout fullWidth={true}>
            <DeveloperLayout>
              <Routes>
                <Route path="/" element={<DeveloperOverviewScreen />} />
                <Route path="/dashboard" element={<DeveloperOverviewScreen />} />
                <Route path="/apps" element={<DeveloperAppsScreen />} />
                <Route path="/apps/new" element={<CreateAppScreen />} />
                <Route path="/apps/:id" element={<AppDashboardScreen />} />
                <Route path="/keys" element={<ApiKeysScreen />} />
                <Route path="/docs" element={<ApiDocsScreen />} />
              </Routes>
            </DeveloperLayout>
          </AppLayout>
        } />

        {/* Admin Portal Routes */}
        <Route path="/admin/*" element={
          <AppLayout fullWidth={true}>
            <AdminLayout>
              <Routes>
                <Route path="/" element={<AdminOverviewScreen />} />
                <Route path="/overview" element={<AdminOverviewScreen />} />
                <Route path="/users" element={<UserManagementScreen />} />
                <Route path="/apps" element={<AppModerationScreen />} />
                <Route path="/compliance" element={<ComplianceScreen />} />
                <Route path="/audit" element={<ComplianceScreen />} />
              </Routes>
            </AdminLayout>
          </AppLayout>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
