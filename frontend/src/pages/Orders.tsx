
import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

import {
  getOrders,
  addOrder,
  updateOrder,
  deleteOrder,
  getCustomers,
  getOrderReminders
} from "@/lib/api"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus } from "lucide-react"

const statusColors: any = {
  Pending: "bg-yellow-100 text-yellow-800",
  Cutting: "bg-blue-100 text-blue-800",
  Stitching: "bg-purple-100 text-purple-800",
  Finishing: "bg-indigo-100 text-indigo-800",
  Ready: "bg-green-100 text-green-800",
  Delivered: "bg-gray-200 text-gray-700"
}

export default function Orders() {

  const queryClient = useQueryClient()

  const [open, setOpen] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)

  const initialForm = {
    customer_id: "",
    description: "",
    amount: "",
    due_date: "",
    status: "Pending"
  }

  const [form, setForm] = useState(initialForm)

  /* CUSTOMERS */

  const { data: customers = [] } = useQuery({
    queryKey: ["customers"],
    queryFn: getCustomers
  })

  /* ORDERS */

  const { data: orders = [] } = useQuery({
    queryKey: ["orders"],
    queryFn: getOrders
  })

  /* REMINDERS */

  const { data: reminders } = useQuery({
    queryKey: ["reminders"],
    queryFn: getOrderReminders
  })

  /* ADD ORDER */

  const addMutation = useMutation({
    mutationFn: addOrder,

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] })
      setOpen(false)
      setForm(initialForm)
      alert("Order Added Successfully")
    },

    onError: (error: any) => {
      console.error(error)
      alert("Unable to save order")
    }
  })

  /* UPDATE ORDER */

  const updateMutation = useMutation({
    mutationFn: (data: any) => updateOrder(editId, data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] })
      setOpen(false)
      setEditId(null)
      setForm(initialForm)
      alert("Order Updated Successfully")
    },

    onError: (error: any) => {
      console.error(error)
      alert("Unable to update order")
    }
  })

  /* DELETE ORDER */

  const deleteMutation = useMutation({
    mutationFn: deleteOrder,

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] })
    }
  })

  /* SUBMIT */

  const submit = (e: any) => {
    e.preventDefault()

    if (!form.customer_id) {
      alert("Please select customer")
      return
    }

    if (!form.description) {
      alert("Please enter description")
      return
    }

    if (!form.amount) {
      alert("Please enter amount")
      return
    }

    if (!form.due_date) {
      alert("Please select delivery date")
      return
    }

    const data = {
      customer_id: Number(form.customer_id),
      description: form.description,
      amount: Number(form.amount),
      due_date: form.due_date,
      status: form.status
    }

    console.log("Submitting Order:", data)

    if (editId !== null) {
      updateMutation.mutate(data)
    } else {
      addMutation.mutate(data)
    }
  }

  return (
    <div className="space-y-6">

      {/* REMINDERS */}

      {reminders && (
        <div className="grid grid-cols-2 gap-4">

          <Card className="p-4">
            <h3 className="font-semibold mb-2">
              Today's Delivery
            </h3>

            {reminders.today?.map((o: any) => {
              const customer = customers.find(
                (c: any) => c.id === o.customer_id
              )

              return (
                <p key={o.id} className="text-sm">
                  #{o.id} - {customer?.name}
                </p>
              )
            })}
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold mb-2">
              Overdue Orders
            </h3>

            {reminders.overdue?.map((o: any) => {
              const customer = customers.find(
                (c: any) => c.id === o.customer_id
              )

              return (
                <p key={o.id} className="text-sm text-red-600">
                  #{o.id} - {customer?.name}
                </p>
              )
            })}
          </Card>
        </div>
      )}

      {/* HEADER */}

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">
          Orders
        </h1>

        <Button
          onClick={() => {
            setOpen(true)
            setEditId(null)
            setForm(initialForm)
          }}
        >
          <Plus size={16} className="mr-2" />
          Add Order
        </Button>
      </div>

      {/* ORDER LIST */}

      <div className="grid gap-4">

        {orders.map((o: any) => {

          const customer = customers.find(
            (c: any) => c.id === o.customer_id
          )

          return (
            <Card
              key={o.id}
              className="p-4 flex justify-between items-center"
            >
              <div>
                <p className="font-medium">
                  {customer?.name}
                </p>

                <p className="text-sm text-gray-600">
                  {o.description}
                </p>

                <p className="text-sm mt-1">
                  ₹ {o.amount}
                </p>

                <div className="mt-2">
                  <Badge className={statusColors[o.status]}>
                    {o.status}
                  </Badge>
                </div>

                <p className="text-xs text-gray-500 mt-2">
                  Delivery: {o.due_date}
                </p>
              </div>

              <div className="flex gap-2">

                <Button
                  variant="outline"
                  onClick={() => {
                    setEditId(o.id)

                    setForm({
                      customer_id: String(o.customer_id),
                      description: o.description,
                      amount: String(o.amount),
                      due_date: o.due_date,
                      status: o.status
                    })

                    setOpen(true)
                  }}
                >
                  Edit
                </Button>

                <Button
                  variant="destructive"
                  onClick={() => deleteMutation.mutate(o.id)}
                >
                  Delete
                </Button>

              </div>
            </Card>
          )
        })}
      </div>

      {/* MODAL */}

      {open && (

        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

          <div className="bg-white w-[400px] p-6 rounded-xl space-y-4 shadow-xl">

            <h2 className="text-lg font-semibold">
              {editId !== null ? "Edit Order" : "Add Order"}
            </h2>

            <form onSubmit={submit} className="space-y-3">

              <select
                className="border p-2 rounded w-full"
                value={form.customer_id}
                onChange={(e) =>
                  setForm({
                    ...form,
                    customer_id: e.target.value
                  })
                }
              >
                <option value="">
                  Select Customer
                </option>

                {customers.map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <Input
                placeholder="Description"
                value={form.description}
                onChange={(e) =>
                  setForm({
                    ...form,
                    description: e.target.value
                  })
                }
              />

              <Input
                type="number"
                placeholder="Amount"
                value={form.amount}
                onChange={(e) =>
                  setForm({
                    ...form,
                    amount: e.target.value
                  })
                }
              />

              <Input
                type="date"
                value={form.due_date}
                onChange={(e) =>
                  setForm({
                    ...form,
                    due_date: e.target.value
                  })
                }
              />

              <select
                className="border p-2 rounded w-full"
                value={form.status}
                onChange={(e) =>
                  setForm({
                    ...form,
                    status: e.target.value
                  })
                }
              >
                <option value="Pending">Pending</option>
                <option value="Cutting">Cutting</option>
                <option value="Stitching">Stitching</option>
                <option value="Finishing">Finishing</option>
                <option value="Ready">Ready</option>
                <option value="Delivered">Delivered</option>
              </select>

              <div className="flex gap-2">

                <Button className="w-full" type="submit">
                  {editId !== null ? "Update Order" : "Save Order"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setOpen(false)
                    setEditId(null)
                    setForm(initialForm)
                  }}
                >
                  Cancel
                </Button>

              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  )
}