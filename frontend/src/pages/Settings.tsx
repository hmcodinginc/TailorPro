import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User, Store, Bell, Palette, Shield,
  Save, Check, ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { changePassword, getBusinessProfile, updateBusinessProfile } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

const TABS = [
  { id: "profile",       label: "Profile",       icon: User    },
  { id: "shop",         label: "Shop Info",     icon: Store   },
  { id: "notifications",label: "Notifications", icon: Bell    },
  { id: "appearance",   label: "Appearance",    icon: Palette },
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
  const [profile, setProfile] = useState({ name: "Tailor Studio", email: "admin@tailorpro.com", phone: "+91 98765 43210" });
  
  const [shop, setShop] = useState({ name: "", address: "", phone: "", email: "", gst_number: "" });
  
  const { data: businessData, isLoading: businessLoading } = useQuery({
    queryKey: ["business"],
    queryFn: getBusinessProfile
  });
  
  useEffect(() => {
    if (businessData) {
      setShop({
        name: businessData.name || "",
        address: businessData.address || "",
        phone: businessData.phone || "",
        email: businessData.email || "",
        gst_number: businessData.gst_number || ""
      });
    }
  }, [businessData]);

  const updateBusinessMutation = useMutation({
    mutationFn: updateBusinessProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business"] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  });

  const [notifs, setNotifs] = useState({ orderAlerts: true, dueDateReminders: true, paymentAlerts: true, weeklyReport: false });
  const [look, setLook]     = useState({ theme: "light", accent: "sky" });
  
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
        new_password: passwordData.new_password
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
    if (tab === "shop") {
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
        <p className="text-sm text-gray-500 mt-0.5">Manage your account and studio preferences</p>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-5">

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
                    ? "bg-sky-50 text-sky-700"
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
        <motion.div variants={item} className="flex-1 bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
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
                        {tab === "profile"        && "Update your personal details"}
                        {tab === "shop"           && "Your studio details and billing info"}
                        {tab === "notifications"  && "Choose what alerts you receive"}
                        {tab === "appearance"     && "Customize the look and feel"}
                        {tab === "security"       && "Manage your password and access"}
                      </p>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Profile */}
            {tab === "profile" && (
              <div className="space-y-4">
                {[
                  { label: "Display Name", key: "name", type: "text" },
                  { label: "Email Address", key: "email", type: "email" },
                  { label: "Phone Number", key: "phone", type: "tel" },
                ].map(({ label, key, type }) => (
                  <div key={key} className="space-y-1.5">
                    <Label className="text-sm font-medium text-gray-700">{label}</Label>
                    <Input type={type} className="h-9 rounded-xl border-gray-200"
                      value={(profile as any)[key]}
                      onChange={(e) => setProfile({ ...profile, [key]: e.target.value })} />
                  </div>
                ))}
              </div>
            )}

            {/* Shop */}
            {tab === "shop" && (
              <div className="space-y-4">
                {[
                  { label: "Shop Name",  key: "name" },
                  { label: "Phone",      key: "phone" },
                  { label: "Email",      key: "email" },
                  { label: "Address",    key: "address" },
                  { label: "GST Number", key: "gst_number" },
                ].map(({ label, key }) => (
                  <div key={key} className="space-y-1.5">
                    <Label className="text-sm font-medium text-gray-700">{label}</Label>
                    <Input className="h-9 rounded-xl border-gray-200"
                      value={(shop as any)[key]}
                      onChange={(e) => setShop({ ...shop, [key]: e.target.value })} 
                      disabled={businessLoading}
                    />
                  </div>
                ))}
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

            {/* Appearance */}
            {tab === "appearance" && (
              <div className="space-y-6">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-3">Theme</p>
                  <div className="grid grid-cols-3 gap-3">
                    {["light", "dark", "system"].map((t) => (
                      <button
                        key={t}
                        onClick={() => setLook({ ...look, theme: t })}
                        className={cn(
                          "p-3 rounded-xl border text-sm font-medium capitalize transition-all",
                          look.theme === t
                            ? "border-sky-400 bg-sky-50 text-sky-700"
                            : "border-gray-200 text-gray-600 hover:border-sky-300 hover:text-sky-600"
                        )}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-3">Accent Color</p>
                  <div className="flex gap-3">
                    {[
                      { id: "sky",    bg: "bg-sky-500"    },
                      { id: "teal",   bg: "bg-teal-500"   },
                      { id: "violet", bg: "bg-violet-500" },
                      { id: "rose",   bg: "bg-rose-500"   },
                      { id: "amber",  bg: "bg-amber-500"  },
                    ].map(({ id, bg }) => (
                      <button
                        key={id}
                        onClick={() => setLook({ ...look, accent: id })}
                        className={cn(
                          "h-8 w-8 rounded-xl transition-all",
                          bg,
                          look.accent === id ? "ring-2 ring-offset-2 ring-sky-400 scale-110" : "hover:scale-105"
                        )}
                      />
                    ))}
                  </div>
                </div>
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
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
            <p className="text-xs text-gray-400">
              {saved ? "All changes saved successfully." : "Changes are saved to your account."}
            </p>
            <Button
              onClick={handleSave}
              className={cn(
                "gap-2 h-9 text-sm rounded-xl transition-all font-semibold",
                saved ? "bg-emerald-500 hover:bg-emerald-600 text-white" : "gradient-brand text-white shadow-brand-sm hover:opacity-90"
              )}
            >
              {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
              {saved ? "Saved!" : "Save Changes"}
            </Button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
