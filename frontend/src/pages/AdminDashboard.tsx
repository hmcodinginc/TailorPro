import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"

interface Business {
  id: number;
  name: string;
  subscription_status: string;
  trial_ends_at: string | null;
}

interface Inquiry {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
}

interface User {
  id: number;
  name: string | null;
  email: string;
  is_superadmin: boolean;
  business_id: number | null;
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Tabs: 'businesses', 'inquiries', 'users'
  const [activeTab, setActiveTab] = useState("businesses")

  useEffect(() => {
    fetchAdminData()
  }, [])

  const fetchAdminData = async () => {
    try {
      const token = localStorage.getItem("token")
      const headers = { Authorization: `Bearer ${token}` }
      const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000"
      
      const [busRes, inqRes, usrRes] = await Promise.all([
        fetch(`${backendUrl}/api/admin/businesses`, { headers }),
        fetch(`${backendUrl}/api/admin/inquiries`, { headers }),
        fetch(`${backendUrl}/api/admin/users`, { headers })
      ])
      
      if (!busRes.ok) {
        if (busRes.status === 403) {
          setError("You do not have Super Admin access.")
        } else {
          setError("Failed to fetch admin data.")
        }
        setLoading(false)
        return
      }
      
      const busData = await busRes.json()
      const inqData = await inqRes.json()
      const usrData = await usrRes.json()
      
      setBusinesses(busData)
      setInquiries(inqData)
      setUsers(usrData)
      setLoading(false)
    } catch (err) {
      setError("Network error")
      setLoading(false)
    }
  }

  const handleAction = async (action: string, businessId: number, payload: Record<string, unknown> | null = null) => {
    if (!confirm(`Are you sure you want to perform: ${action}?`)) return
    
    try {
      const token = localStorage.getItem("token")
      const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000"
      const url = `${backendUrl}/api/admin/businesses/${businessId}/${action}`
      const method = "POST"
      const body = payload ? JSON.stringify(payload) : null
      
      const res = await fetch(url, {
        method,
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body
      })
      
      if (res.ok) {
        fetchAdminData()
      } else {
        alert("Action failed")
      }
    } catch (e) {
      alert("Error")
    }
  }

  const handleInquiryStatus = async (inquiryId: number, status: string) => {
    try {
      const token = localStorage.getItem("token")
      const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000"
      const res = await fetch(`${backendUrl}/api/admin/inquiries/${inquiryId}`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status })
      })
      if (res.ok) fetchAdminData()
    } catch (e) {
      alert("Error updating inquiry")
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-screen bg-gray-50">Loading Admin Panel...</div>
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">{error}</h1>
        <button onClick={() => navigate("/dashboard")} className="px-4 py-2 bg-blue-600 text-white rounded">
          Return to Dashboard
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col hidden md:flex">
        <div 
          onClick={() => { navigate("/admin"); setActiveTab("businesses"); }}
          className="p-6 font-bold text-2xl tracking-wide border-b border-slate-800 cursor-pointer hover:text-sky-400 transition-colors"
        >
          TailorPro Admin
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setActiveTab("businesses")}
            className={`w-full text-left px-4 py-2 rounded ${activeTab === 'businesses' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}
          >
            Businesses
          </button>
          <button 
            onClick={() => setActiveTab("users")}
            className={`w-full text-left px-4 py-2 rounded ${activeTab === 'users' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}
          >
            Users
          </button>
          <button 
            onClick={() => setActiveTab("inquiries")}
            className={`w-full text-left px-4 py-2 rounded ${activeTab === 'inquiries' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}
          >
            Inquiries
          </button>
        </nav>
        <div className="p-4 border-t border-slate-800 flex flex-col gap-4">
          <button onClick={() => navigate("/")} className="text-sm text-slate-400 hover:text-white text-left transition-colors">
            🌍 Marketing Site
          </button>
          <button onClick={() => navigate("/dashboard")} className="text-sm text-slate-400 hover:text-white text-left transition-colors">
            ← App Dashboard
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-y-auto h-screen">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 capitalize">{activeTab}</h1>
        
        {activeTab === "businesses" && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Business Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trial Expiry</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {businesses.map(b => (
                  <tr key={b.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{b.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{b.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        b.subscription_status === 'ACTIVE_MONTHLY' || b.subscription_status === 'ACTIVE_YEARLY' ? 'bg-green-100 text-green-800' :
                        b.subscription_status === 'TRIAL' ? 'bg-blue-100 text-blue-800' :
                        b.subscription_status === 'SUSPENDED' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {b.subscription_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {b.trial_ends_at ? new Date(b.trial_ends_at).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button onClick={() => handleAction('extend-trial', b.id, { days: 14 })} className="text-blue-600 hover:text-blue-900">Extend Trial</button>
                      
                      {b.subscription_status === 'SUSPENDED' ? (
                        <button onClick={() => handleAction('reactivate', b.id)} className="text-green-600 hover:text-green-900">Reactivate</button>
                      ) : (
                        <button onClick={() => handleAction('suspend', b.id)} className="text-red-600 hover:text-red-900">Suspend</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "users" && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Business ID</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map(u => (
                  <tr key={u.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{u.name || "N/A"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <a href={`mailto:${u.email}`} className="text-blue-500 hover:text-blue-700 hover:underline">{u.email}</a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${u.is_superadmin ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                        {u.is_superadmin ? "Super Admin" : "User"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.business_id || "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "inquiries" && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
             <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">From</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Message</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {inquiries.map(inq => (
                  <tr key={inq.id}>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {inq.name} <br/> <a href={`mailto:${inq.email}`} className="text-blue-500 hover:text-blue-700 hover:underline text-xs">{inq.email}</a>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">{inq.subject}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{inq.message}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        {inq.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      <select 
                        value={inq.status} 
                        onChange={(e) => handleInquiryStatus(inq.id, e.target.value)}
                        className="text-sm border-gray-300 rounded"
                      >
                        <option value="NEW">New</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="RESOLVED">Resolved</option>
                        <option value="CLOSED">Closed</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </main>
    </div>
  )
}
