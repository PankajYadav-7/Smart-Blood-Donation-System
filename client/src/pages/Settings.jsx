import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  Settings as SettingsIcon, Shield, Trash2, Download,
  AlertTriangle, Save, Moon, Sun, ArrowLeft, Bell,
  Globe, Database, Eye, EyeOff, CheckCircle,
} from "lucide-react";

const Settings = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const [appSettings, setAppSettings] = useState({
    language: "en", theme: "light", dateFormat: "DD/MM/YYYY",
    timeFormat: "12h", distanceUnit: "km", autoLocation: true, offlineMode: false,
  });

  const [accountSettings, setAccountSettings] = useState({
    twoFactorAuth: false, loginNotifications: true,
    dataBackup: true, analyticsSharing: false,
  });

  const [notifSettings, setNotifSettings] = useState({
    emailAlerts: true, emergencyAlerts: true,
    reminderAlerts: true, closureAlerts: false,
  });

  const [passwords, setPasswords] = useState({
    current: "", newPass: "", confirm: "",
  });

  const [showPass, setShowPass] = useState(false);
  const [saved, setSaved] = useState("");
  const [activeTab, setActiveTab] = useState("general");

  const handleSave = (section) => {
    setSaved(section);
    setTimeout(() => setSaved(""), 3000);
  };

  const handleChangePassword = () => {
    if (passwords.newPass !== passwords.confirm) {
      alert("New passwords do not match!");
      return;
    }
    if (passwords.newPass.length < 6) {
      alert("Password must be at least 6 characters!");
      return;
    }
    alert("Password changed successfully!");
    setPasswords({ current: "", newPass: "", confirm: "" });
  };

  const getDashboardLink = () => {
    const routes = { donor: "/donor/dashboard", hospital: "/hospital/dashboard", ngo: "/ngo/dashboard", admin: "/admin/dashboard" };
    return routes[user?.role] || "/";
  };

  const tabs = [
    { id: "general", label: "⚙️ General" },
    { id: "notifications", label: "🔔 Notifications" },
    { id: "security", label: "🔒 Security" },
    { id: "data", label: "📊 Data & Privacy" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <button onClick={() => navigate(getDashboardLink())} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm font-medium">Back to Dashboard</span>
        </button>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500 mt-1">Manage your application preferences and account settings</p>
        </div>

        {saved && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Settings saved successfully!
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm border border-gray-200 mb-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-3 py-2.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id ? "bg-red-600 text-white shadow-sm" : "text-gray-600 hover:bg-gray-50"
              }`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* General Settings */}
        {activeTab === "general" && (
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="h-5 w-5 text-red-600" />
                General Settings
              </CardTitle>
              <CardDescription>Customize your app experience and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                  <select
                    value={appSettings.language}
                    onChange={(e) => setAppSettings({ ...appSettings, language: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                  >
                    <option value="en">English</option>
                    <option value="ne">नेपाली (Nepali)</option>
                    <option value="hi">हिंदी (Hindi)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Theme</label>
                  <div className="flex gap-2">
                    {[
                      { value: "light", icon: Sun, label: "Light" },
                      { value: "dark", icon: Moon, label: "Dark" },
                      { value: "system", icon: SettingsIcon, label: "System" },
                    ].map((t) => (
                      <button
                        key={t.value}
                        onClick={() => setAppSettings({ ...appSettings, theme: t.value })}
                        className={`flex-1 flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 text-xs font-medium transition-all ${
                          appSettings.theme === t.value
                            ? "border-red-600 bg-red-50 text-red-600"
                            : "border-gray-200 text-gray-600 hover:border-gray-300"
                        }`}
                      >
                        <t.icon className="h-4 w-4" />
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date Format</label>
                  <select
                    value={appSettings.dateFormat}
                    onChange={(e) => setAppSettings({ ...appSettings, dateFormat: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                  >
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Distance Unit</label>
                  <select
                    value={appSettings.distanceUnit}
                    onChange={(e) => setAppSettings({ ...appSettings, distanceUnit: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                  >
                    <option value="km">Kilometers (km)</option>
                    <option value="mi">Miles (mi)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  { key: "autoLocation", label: "Auto Location Detection", desc: "Automatically detect your location for nearby requests" },
                  { key: "offlineMode", label: "Offline Mode", desc: "Cache data for offline access" },
                ].map((setting) => (
                  <div key={setting.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{setting.label}</p>
                      <p className="text-xs text-gray-500">{setting.desc}</p>
                    </div>
                    <button
                      onClick={() => setAppSettings({ ...appSettings, [setting.key]: !appSettings[setting.key] })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        appSettings[setting.key] ? "bg-red-600" : "bg-gray-300"
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow ${
                        appSettings[setting.key] ? "translate-x-6" : "translate-x-1"
                      }`} />
                    </button>
                  </div>
                ))}
              </div>

              <Button className="w-full" onClick={() => handleSave("general")}>
                <Save className="h-4 w-4 mr-2" />Save General Settings
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Notifications */}
        {activeTab === "notifications" && (
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-red-600" />
                Notification Settings
              </CardTitle>
              <CardDescription>Control which notifications you receive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { key: "emailAlerts", label: "Email Notifications", desc: "Receive notifications via email" },
                { key: "emergencyAlerts", label: "Emergency Alerts", desc: "Get notified of emergency blood requests immediately" },
                { key: "reminderAlerts", label: "Eligibility Reminders", desc: "Remind me when I am eligible to donate again" },
                { key: "closureAlerts", label: "Request Closure Alerts", desc: "Notify when a blood request is fulfilled or closed" },
              ].map((setting) => (
                <div key={setting.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{setting.label}</p>
                    <p className="text-xs text-gray-500">{setting.desc}</p>
                  </div>
                  <button
                    onClick={() => setNotifSettings({ ...notifSettings, [setting.key]: !notifSettings[setting.key] })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notifSettings[setting.key] ? "bg-red-600" : "bg-gray-300"
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow ${
                      notifSettings[setting.key] ? "translate-x-6" : "translate-x-1"
                    }`} />
                  </button>
                </div>
              ))}
              <Button className="w-full mt-2" onClick={() => handleSave("notifications")}>
                <Save className="h-4 w-4 mr-2" />Save Notification Settings
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Security */}
        {activeTab === "security" && (
          <div className="space-y-4">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-red-600" />
                  Account Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { key: "twoFactorAuth", label: "Two-Factor Authentication", desc: "Add an extra layer of security to your account" },
                  { key: "loginNotifications", label: "Login Notifications", desc: "Get notified of new login attempts" },
                ].map((setting) => (
                  <div key={setting.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{setting.label}</p>
                      <p className="text-xs text-gray-500">{setting.desc}</p>
                    </div>
                    <button
                      onClick={() => setAccountSettings({ ...accountSettings, [setting.key]: !accountSettings[setting.key] })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        accountSettings[setting.key] ? "bg-red-600" : "bg-gray-300"
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow ${
                        accountSettings[setting.key] ? "translate-x-6" : "translate-x-1"
                      }`} />
                    </button>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { key: "current", label: "Current Password", placeholder: "Enter current password" },
                  { key: "newPass", label: "New Password", placeholder: "Minimum 6 characters" },
                  { key: "confirm", label: "Confirm New Password", placeholder: "Repeat new password" },
                ].map((field) => (
                  <div key={field.key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                    <div className="relative">
                      <input
                        type={showPass ? "text" : "password"}
                        value={passwords[field.key]}
                        onChange={(e) => setPasswords({ ...passwords, [field.key]: e.target.value })}
                        placeholder={field.placeholder}
                        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass(!showPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                ))}
                <Button className="w-full" onClick={handleChangePassword}>
                  <Shield className="h-4 w-4 mr-2" />Change Password
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Data & Privacy */}
        {activeTab === "data" && (
          <div className="space-y-4">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-red-600" />
                  Data Management
                </CardTitle>
                <CardDescription>Export, import, or manage your account data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { key: "dataBackup", label: "Automatic Data Backup", desc: "Regularly backup your profile and donation history" },
                  { key: "analyticsSharing", label: "Analytics Sharing", desc: "Help improve our service by sharing anonymous usage data" },
                ].map((setting) => (
                  <div key={setting.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{setting.label}</p>
                      <p className="text-xs text-gray-500">{setting.desc}</p>
                    </div>
                    <button
                      onClick={() => setAccountSettings({ ...accountSettings, [setting.key]: !accountSettings[setting.key] })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        accountSettings[setting.key] ? "bg-red-600" : "bg-gray-300"
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow ${
                        accountSettings[setting.key] ? "translate-x-6" : "translate-x-1"
                      }`} />
                    </button>
                  </div>
                ))}

                <div className="flex gap-3 pt-2">
                  <Button variant="outline" className="flex-1" onClick={() => alert("Exporting your data...")}>
                    <Download className="h-4 w-4 mr-2" />Export Data
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md border border-red-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                  Danger Zone
                </CardTitle>
                <CardDescription>Irreversible actions that affect your account permanently</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                  <p className="text-sm text-red-700">
                    <strong>Warning:</strong> Deleting your account is permanent and cannot be undone.
                    All your data, donation history, and badges will be permanently removed.
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => {
                    if (window.confirm("Are you sure you want to delete your account? This cannot be undone.")) {
                      localStorage.removeItem("token");
                      localStorage.removeItem("user");
                      window.location.href = "/";
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />Delete Account
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Settings;
