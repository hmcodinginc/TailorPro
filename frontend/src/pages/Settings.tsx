import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User, Store, Bell, Shield,
  Save, Check, ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  changePassword,
  getBusinessProfile,
  updateBusinessProfile,
  getUserProfile,
  updateUserProfile
} from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PhoneInput } from "@/components/PhoneInput";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

const TABS = [
  { id: "profile",       label: "Profile",       icon: User    },
  { id: "shop",         label: "Shop Info",     icon: Store   },
  { id: "notifications",label: "Notifications", icon: Bell    },
  { id: "security",     label: "Security",      icon: Shield  },
];

const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className={cn(
      "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2",
      checked ? "bg-sky-500" : "bg-gray-200"
    )}
  >
    <span className="sr-only">Use setting</span>
    <span
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute left-0.5 inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
        checked ? "translate-x-4" : "translate-x-0"
      )}
    />
  </button>
);

const SettingRow = ({ label, description, children }: { label: string; description: string; children: React.ReactNode }) => (
  <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
    <div className="space-y-0.5">
      <Label className="text-sm font-medium text-gray-900">{label}</Label>
      <p className="text-xs text-gray-500">{description}</p>
    </div>
    {children}
  </div>
);

export default function Settings() {
  const queryClient = useQueryClient();
  const [tab, setTab]       = useState("profile");
  const [saved, setSaved]   = useState(false);
  
  // Real Profile State
  const [profile, setProfile] = useState({ name: "", email: "", phone: "" });
  
  // Real Shop State
  const [shop, setShop] = useState({ name: "", address: "", phone: "", email: "", gst_number: "" });
  
  // Queries
  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: ["userProfile"],
    queryFn: getUserProfile,
  });

  const { data: businessData, isLoading: businessLoading } = useQuery({
    queryKey: ["business"],
    queryFn: getBusinessProfile,
  });
  
  useEffect(() => {
    if (userData) {
      setProfile({
        name: userData.name || "",
        email: userData.email || "",
        phone: userData.phone || "",
      });
    }
  }, [userData]);

  useEffect(() => {
    if (businessData) {
      setShop({
        name: businessData.name || "",
        address: businessData.address || "",
        phone: businessData.phone || "",
        email: businessData.email || "",
        gst_number: businessData.gst_number || "",
      });
    }
  }, [businessData]);

  const updateProfileMutation = useMutation({
    mutationFn: updateUserProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
  });

  const updateBusinessMutation = useMutation({
    mutationFn: updateBusinessProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business"] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
  });

  const [notifs, setNotifs] = useState({ orderAlerts: true, dueDateReminders: true, paymentAlerts: true, weeklyReport: false });
  
  const [passwordData, setPasswordData] = useState({ current_password: "", new_password: "", confirm_password: "" });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess(false);

    if (!passwordData.current_password || !passwordData.new_password || !passwordData.confirm_password) {
      return setPasswordError("Please fill in all password fields.");
    }

    if (passwordData.new_password !== passwordData.confirm_password) {
      return setPasswordError("New passwords do not match.");
    }

    if (passwordData.new_password.length < 6) {
      return setPasswordError("New password must be at least 6 characters long.");
    }

    try {
      setPasswordLoading(true);
      await changePassword({
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
      });
      setPasswordSuccess(true);
      setPasswordData({ current_password: "", new_password: "", confirm_password: "" });
    } catch (err: any) {
      setPasswordError(err.message || "Failed to update password");
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleSave = () => {
    if (tab === "profile") {
      updateProfileMutation.mutate({
        name: profile.name,
        phone: profile.phone,
      });
    } else if (tab === "shop") {
      updateBusinessMutation.mutate(shop);
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <motion.div variants={item}>
        <h1 className="text-xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage your studio profile and preferences</p>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Sidebar tabs */}
        <motion.div variants={item} className="lg:w-52 shrink-0">
          <div className="bg-white border border-gray-100 rounded-2xl p-2 shadow-sm flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap w-full text-left",
                  tab === id
                    ? "bg-sky-50 text-sky-700 font-semibold"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                )}
              >
                <Icon className={cn("h-4 w-4 shrink-0", tab === id ? "text-sky-600" : "text-gray-400")} />
                <span className="flex-1">{label}</span>
                {tab === id && <ChevronRight className="h-3.5 w-3.5 text-sky-400 shrink-0 hidden lg:block" />}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Content panel */}
        <motion.div variants={item} className="flex-1 bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden w-full">
          <div className="p-6">
            {/* Section header */}
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
              {(() => {
                const t = TABS.find((t) => t.id === tab)!;
                const Icon = t.icon;
                return (
                  <>
                    <div className="h-9 w-9 rounded-xl bg-sky-50 flex items-center justify-center shrink-0">
                      <Icon className="h-4.5 w-4.5 text-sky-600" />
                    </div>
                    <div>
                      <h2 className="font-semibold text-gray-900">{t.label}</h2>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {tab === "profile"        && "Update your personal credentials and phone"}
                        {tab === "shop"           && "Your studio details, GST, and billing address"}
                        {tab === "notifications"  && "Choose what alerts you receive"}
                        {tab === "security"       && "Manage your account password"}
                      </p>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Profile */}
            {tab === "profile" && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-700">Display Name</Label>
                  <Input
                    type="text"
                    className="h-9 rounded-xl border-gray-200"
                    placeholder="Your Name"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    disabled={userLoading}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-700">Email Address</Label>
                  <Input
                    type="email"
                    className="h-9 rounded-xl border-gray-200 bg-gray-50 text-gray-500"
                    value={profile.email}
                    disabled
                  />
                  <p className="text-[11px] text-gray-400">Account login email cannot be changed directly.</p>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-700">Phone Number</Label>
                  <PhoneInput
                    value={profile.phone}
                    onChange={(v) => setProfile({ ...profile, phone: v })}
                    disabled={userLoading}
                  />
                </div>
              </div>
            )}

            {/* Shop */}
            {tab === "shop" && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-700">Shop / Studio Name</Label>
                  <Input
                    className="h-9 rounded-xl border-gray-200"
                    placeholder="My Boutique"
                    value={shop.name}
                    onChange={(e) => setShop({ ...shop, name: e.target.value })}
                    disabled={businessLoading}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-700">Studio Phone</Label>
                  <PhoneInput
                    value={shop.phone}
                    onChange={(v) => setShop({ ...shop, phone: v })}
                    disabled={businessLoading}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-700">Studio Email</Label>
                  <Input
                    type="email"
                    className="h-9 rounded-xl border-gray-200"
                    placeholder="shop@example.com"
                    value={shop.email}
                    onChange={(e) => setShop({ ...shop, email: e.target.value })}
                    disabled={businessLoading}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-700">Studio Address</Label>
                  <Input
                    className="h-9 rounded-xl border-gray-200"
                    placeholder="123 Fashion Street, City"
                    value={shop.address}
                    onChange={(e) => setShop({ ...shop, address: e.target.value })}
                    disabled={businessLoading}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-700">GST Number</Label>
                  <Input
                    className="h-9 rounded-xl border-gray-200 uppercase"
                    placeholder="22AAAAA0000A1Z5"
                    value={shop.gst_number}
                    onChange={(e) => setShop({ ...shop, gst_number: e.target.value.toUpperCase() })}
                    disabled={businessLoading}
                  />
                </div>
              </div>
            )}

            {/* Notifications */}
            {tab === "notifications" && (
              <div>
                <SettingRow label="Order Alerts" description="Notify when new orders are created or updated">
                  <Toggle checked={notifs.orderAlerts} onChange={(v) => setNotifs({ ...notifs, orderAlerts: v })} />
                </SettingRow>
                <SettingRow label="Due Date Reminders" description="Reminders 1 day before order due dates">
                  <Toggle checked={notifs.dueDateReminders} onChange={(v) => setNotifs({ ...notifs, dueDateReminders: v })} />
                </SettingRow>
                <SettingRow label="Payment Alerts" description="Notify when invoices are paid or overdue">
                  <Toggle checked={notifs.paymentAlerts} onChange={(v) => setNotifs({ ...notifs, paymentAlerts: v })} />
                </SettingRow>
                <SettingRow label="Weekly Report" description="Receive a weekly summary of your studio">
                  <Toggle checked={notifs.weeklyReport} onChange={(v) => setNotifs({ ...notifs, weeklyReport: v })} />
                </SettingRow>
              </div>
            )}

            {/* Security */}
            {tab === "security" && (
              <form onSubmit={handlePasswordChange} className="space-y-4">
                {passwordError && (
                  <div className="p-3 bg-red-50 text-red-700 text-sm rounded-xl">
                    {passwordError}
                  </div>
                )}
                {passwordSuccess && (
                  <div className="p-3 bg-green-50 text-green-700 text-sm rounded-xl">
                    Password updated successfully.
                  </div>
                )}
                
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-700">Current Password</Label>
                  <Input 
                    type="password" 
                    value={passwordData.current_password}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, current_password: e.target.value }))}
                    className="h-9 rounded-xl border-gray-200" 
                    placeholder="••••••••" 
                  />
                </div>
                
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-700">New Password</Label>
                  <Input 
                    type="password" 
                    value={passwordData.new_password}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, new_password: e.target.value }))}
                    className="h-9 rounded-xl border-gray-200" 
                    placeholder="••••••••" 
                  />
                </div>
                
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-700">Confirm New Password</Label>
                  <Input 
                    type="password" 
                    value={passwordData.confirm_password}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirm_password: e.target.value }))}
                    className="h-9 rounded-xl border-gray-200" 
                    placeholder="••••••••" 
                  />
                </div>
                
                <Button 
                  type="submit" 
                  disabled={passwordLoading}
                  variant="outline" 
                  size="sm" 
                  className="text-sm rounded-xl border-gray-200 mt-1"
                >
                  {passwordLoading ? "Updating..." : "Update Password"}
                </Button>
              </form>
            )}
          </div>

          {/* Save bar */}
          {(tab === "profile" || tab === "shop") && (
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <p className="text-xs text-gray-400">
                {saved ? "All changes saved successfully." : "Changes are saved to your account in the backend."}
              </p>
              <Button
                onClick={handleSave}
                disabled={updateProfileMutation.isPending || updateBusinessMutation.isPending}
                className={cn(
                  "gap-2 h-9 text-sm rounded-xl transition-all font-semibold",
                  saved ? "bg-emerald-500 hover:bg-emerald-600 text-white" : "gradient-brand text-white shadow-brand-sm hover:opacity-90"
                )}
              >
                {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                {saved ? "Saved!" : "Save Changes"}
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
