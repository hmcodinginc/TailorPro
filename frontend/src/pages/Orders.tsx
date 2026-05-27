import { useState } from "react"

import {
  useQuery,
  useMutation,
  useQueryClient
} from "@tanstack/react-query"

import {
  getOrders,
  getCustomers,
  addOrder,
  updateOrder,
  deleteOrder
} from "@/lib/api"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"

import {
  Trash2,
  Pencil
} from "lucide-react"

export default function Orders() {

  const queryClient = useQueryClient()

  const [open, setOpen] = useState(false)

  const [editingId, setEditingId] = useState<number | null>(null)

  const initialForm = {
    customer_id: "",
    description: "",
    amount: "",
    order_date: "",
    due_date: "",
    status: "Pending"
  }

  const [form, setForm] = useState(initialForm)

  const { data: orders = [] } = useQuery({
    queryKey: ["orders"],
    queryFn: getOrders
  })

  const { data: customers = [] } = useQuery({
    queryKey: ["customers"],
    queryFn: getCustomers
  })

  const mutation = useMutation({

    mutationFn: (data: any) => {

      if (editingId) {
        return updateOrder(editingId, data)
      }

      return addOrder(data)
    },

    onSuccess: () => {

      queryClient.invalidateQueries({
        queryKey: ["orders"]
      })

      setOpen(false)

      setEditingId(null)

      setForm(initialForm)
    }
  })

  const deleteMutation = useMutation({

    mutationFn: deleteOrder,

    onSuccess: () => {

      queryClient.invalidateQueries({
        queryKey: ["orders"]
      })
    }
  })

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

    if (!form.order_date) {
      alert("Please select order date")
      return
    }

    if (!form.due_date) {
      alert("Please select due date")
      return
    }

    const data = {

      customer_id: Number(form.customer_id),

      description: form.description,

      amount: Number(form.amount),

      order_date: form.order_date,

      due_date: form.due_date,

      status: form.status
    }

    mutation.mutate(data)
  }

  return (

    <div className="space-y-6 p-6">

      {/* HEADER */}

      <div className="flex items-center justify-between">

        <div>
          <h1 className="text-3xl font-bold">
            Orders
          </h1>

          <p className="text-gray-500 mt-1">
            Manage tailoring orders
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>

          <DialogTrigger asChild>

            <Button>
              Add Order
            </Button>

          </DialogTrigger>

          <DialogContent>

            <DialogHeader>
              <DialogTitle>
                {editingId ? "Edit Order" : "Add Order"}
              </DialogTitle>
            </DialogHeader>

            <form
              onSubmit={submit}
              className="space-y-4"
            >

              {/* CUSTOMER */}

              <Select
                value={form.customer_id}
                onValueChange={(value) =>
                  setForm({
                    ...form,
                    customer_id: value
                  })
                }
              >

                <SelectTrigger>
                  <SelectValue placeholder="Select Customer" />
                </SelectTrigger>

                <SelectContent>

                  {customers.map((customer: any) => (

                    <SelectItem
                      key={customer.id}
                      value={String(customer.id)}
                    >
                      {customer.name}
                    </SelectItem>

                  ))}

                </SelectContent>

              </Select>

              {/* DESCRIPTION */}

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

              {/* AMOUNT */}

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

              {/* ORDER DATE */}

              <Input
                type="date"
                value={form.order_date}
                onChange={(e) =>
                  setForm({
                    ...form,
                    order_date: e.target.value
                  })
                }
              />

              {/* DUE DATE */}

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

              {/* STATUS */}

              <Select
                value={form.status}
                onValueChange={(value) =>
                  setForm({
                    ...form,
                    status: value
                  })
                }
              >

                <SelectTrigger>
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="Pending">
                    Pending
                  </SelectItem>

                  <SelectItem value="Stitching">
                    Stitching
                  </SelectItem>

                  <SelectItem value="Ready">
                    Ready
                  </SelectItem>

                  <SelectItem value="Delivered">
                    Delivered
                  </SelectItem>
                </SelectContent>

              </Select>

              <Button
                type="submit"
                className="w-full"
              >
                {editingId ? "Update Order" : "Create Order"}
              </Button>

            </form>

          </DialogContent>

        </Dialog>

      </div>

      {/* ORDERS GRID */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

        {orders.map((order: any) => {

          const customer = customers.find(
            (c: any) => c.id === order.customer_id
          )

          return (

            <Card key={order.id}>

              <CardHeader className="flex flex-row items-start justify-between">

                <div>

                  <CardTitle className="text-lg">
                    {order.order_code}
                  </CardTitle>

                  <p className="text-sm text-gray-500 mt-1">
                    {customer?.name}
                  </p>

                </div>

                <div className="flex gap-2">

                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => {

                      setEditingId(order.id)

                      setForm({
                        customer_id: String(order.customer_id),
                        description: order.description,
                        amount: String(order.amount),
                        order_date: order.order_date,
                        due_date: order.due_date,
                        status: order.status
                      })

                      setOpen(true)
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>

                  <Button
                    size="icon"
                    variant="destructive"
                    onClick={() => {

                      const confirmDelete = window.confirm(
                        `Delete ${order.order_code}?`
                      )

                      if (confirmDelete) {
                        deleteMutation.mutate(order.id)
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>

                </div>

              </CardHeader>

              <CardContent className="space-y-2">

                <p>
                  <span className="font-medium">
                    Description:
                  </span>
                  {" "}
                  {order.description}
                </p>

                <p>
                  <span className="font-medium">
                    Amount:
                  </span>
                  {" "}
                  ₹{order.amount}
                </p>

                <p>
                  <span className="font-medium">
                    Status:
                  </span>
                  {" "}
                  {order.status}
                </p>

                <p>
                  <span className="font-medium">
                    Order Date:
                  </span>
                  {" "}
                  {order.order_date}
                </p>

                <p>
                  <span className="font-medium">
                    Due Date:
                  </span>
                  {" "}
                  {order.due_date}
                </p>

              </CardContent>

            </Card>
          )
        })}

      </div>

    </div>
  )
}