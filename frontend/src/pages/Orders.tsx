import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
  ShoppingBag,
  Plus,
  Search,
  Calendar,
  AlertTriangle,
  Scissors,
  MoreHorizontal,
  X,
  Pencil,
  Trash2,
} from "lucide-react";

import {
  getOrders,
  getCustomers,
  addOrder,
  updateOrder,
  deleteOrder,
} from "@/lib/api";


import {
  formatCurrency,
  formatDate,
  isOverdue,
} from "@/lib/format";

import {
  getOrderStatusMeta,
  ORDER_STATUSES,
} from "@/lib/domain";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";



// =====================================================
// ANIMATION
// =====================================================

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const item = {
  hidden: {
    opacity: 0,
    y: 12,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
    },
  },
};


// =====================================================
// EMPTY FORM
// =====================================================

const emptyForm = {
  customer_id: "",
  description: "",
  amount: "",
  order_date: "",
  due_date: "",
  status: "Pending",
};


// =====================================================
// COMPONENT
// =====================================================

export default function Orders() {

  const queryClient = useQueryClient();


  // ===================================================
  // GET ORDERS
  // ===================================================

  const {
    data: orders = [],
    isLoading,
  } = useQuery({
    queryKey: ["orders"],
    queryFn: getOrders,
  });


  // ===================================================
  // GET CUSTOMERS
  // ===================================================

  const {
    data: customers = [],
  } = useQuery({
    queryKey: ["customers"],
    queryFn: getCustomers,
  });


  // ===================================================
  // CREATE ORDER
  // ===================================================

  const createMutation = useMutation({
    mutationFn: addOrder,
    onMutate: async (newOrderData: any) => {
      await queryClient.cancelQueries({ queryKey: ["orders"] });
      const previousOrders = queryClient.getQueryData<any[]>(["orders"]) || [];
      const customerList = queryClient.getQueryData<any[]>(["customers"]) || [];
      const targetCustomer = customerList.find((c: any) => Number(c.id) === Number(newOrderData.customer_id));
      const prefix = targetCustomer?.name ? targetCustomer.name.trim().toUpperCase().replace(/\s+/g, "") : "CUSTOMER";
      const custSeq = previousOrders.filter((o: any) => Number(o.customer_id) === Number(newOrderData.customer_id)).length + 1;

      const optimisticOrder = {
        id: Date.now(),
        order_code: `${prefix}-${String(custSeq).padStart(3, "0")}`,
        ...newOrderData,
      };
      queryClient.setQueryData(["orders"], [optimisticOrder, ...previousOrders]);
      return { previousOrders };
    },
    onError: (err, _newOrder, context) => {
      if (context?.previousOrders) {
        queryClient.setQueryData(["orders"], context.previousOrders);
      }
      setError((err as any)?.message || "Failed to create order.");
      setOpen(true);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => updateOrder(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      setEditOpen(false);
      setEditingOrder(null);
    },
    onError: (err: any) => {
      setEditError(err.message || "Failed to update order.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteOrder,
    onMutate: async (id: number) => {
      await queryClient.cancelQueries({ queryKey: ["orders"] });
      const previousOrders = queryClient.getQueryData<any[]>(["orders"]) || [];
      queryClient.setQueryData(
        ["orders"],
        previousOrders.filter((o) => o.id !== id)
      );
      return { previousOrders };
    },
    onError: (_err, _id, context) => {
      if (context?.previousOrders) {
        queryClient.setQueryData(["orders"], context.previousOrders);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });


  // ===================================================
  // STATES
  // ===================================================

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [open, setOpen] =
    useState(false);

  const [form, setForm] =
    useState(emptyForm);

  const [error, setError] =
    useState("");

  const [editOpen, setEditOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<any>(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [editError, setEditError] = useState("");

  const openEditOrderDialog = (order: any) => {
    setEditingOrder(order);
    setEditForm({
      customer_id: String(order.customer_id || ""),
      description: order.description || "",
      amount: String(order.amount ?? ""),
      order_date: order.order_date ? order.order_date.split("T")[0] : "",
      due_date: order.due_date ? order.due_date.split("T")[0] : "",
      status: order.status || "Pending",
    });
    setEditError("");
    setEditOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;
    if (!editForm.customer_id || !editForm.description || !editForm.amount || !editForm.due_date) {
      setEditError("Please fill in all required fields.");
      return;
    }
    setEditError("");
    updateMutation.mutate({
      id: editingOrder.id,
      data: {
        customer_id: Number(editForm.customer_id),
        description: editForm.description,
        amount: Number(editForm.amount),
        order_date: editForm.order_date,
        due_date: editForm.due_date,
        status: editForm.status,
      },
    });
  };



  // ===================================================
  // FILTER ORDERS
  // ===================================================

  const filteredOrders = orders.filter(
    (order: any) => {

      const searchValue =
        search.toLowerCase();

      const matchesSearch =
        order.description
          ?.toLowerCase()
          .includes(searchValue)
        ||
        order.order_code
          ?.toLowerCase()
          .includes(searchValue);

      const matchesStatus =
        statusFilter === "all"
        ||
        order.status === statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    }
  );


  // ===================================================
  // OVERDUE COUNT
  // ===================================================

  const overdueCount =
    orders.filter(
      (order: any) =>
        order.status !== "Delivered" &&
        isOverdue(order.due_date)
    ).length;


  // ===================================================
  // CREATE ORDER
  // ===================================================

  const handleAdd = async (
    e: React.FormEvent
  ) => {

    e.preventDefault();

    setError("");


    // Customer
    if (!form.customer_id) {

      setError(
        "Please select a customer."
      );

      return;
    }


    // Description
    if (!form.description.trim()) {

      setError(
        "Please enter order description."
      );

      return;
    }


    // Amount
    if (
      !form.amount ||
      Number(form.amount) <= 0
    ) {

      setError(
        "Please enter a valid amount."
      );

      return;
    }


    // Order date
    if (!form.order_date) {

      setError(
        "Please select order date."
      );

      return;
    }


    // Due date
    if (!form.due_date) {

      setError(
        "Please select due date."
      );

      return;
    }


    // Check date order
    if (
      form.due_date <
      form.order_date
    ) {

      setError(
        "Due date cannot be before order date."
      );

      return;
    }


    // =================================================
    // PAYLOAD
    // =================================================

    const orderData = {

      customer_id:
        Number(form.customer_id),

      description:
        form.description.trim(),

      amount:
        Number(form.amount),

      status:
        form.status,

      order_date:
        form.order_date,

      due_date:
        form.due_date,

    };


    console.log(
      "ORDER PAYLOAD:",
      orderData
    );


    try {
      setOpen(false);
      setForm({ ...emptyForm });
      createMutation.mutate(orderData);
    } catch (err) {
      console.error("Create order error:", err);
      setError("Failed to create order. Please check your details.");
    }

  };


  // ===================================================
  // STATUS COUNT
  // ===================================================

  const statusCount = (
    status: string
  ) => {

    return orders.filter(
      (order: any) =>
        order.status === status
    ).length;

  };


  // ===================================================
  // RENDER
  // ===================================================

  return (

    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >


      {/* =================================================
          HEADER
      ================================================= */}

      <motion.div
        variants={item}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >

        <div>

          <h1 className="text-xl font-bold text-gray-900">
            Orders
          </h1>

          <p className="text-sm text-gray-500 mt-0.5">
            Track garments from order to delivery
          </p>

        </div>


        {/* NEW ORDER */}

        <Dialog
          open={open}
          onOpenChange={(value) => {

            setOpen(value);

            if (!value) {

              setForm({
                ...emptyForm,
              });

              setError("");

            }

          }}
        >

          <DialogTrigger asChild>

            <Button className="gradient-brand text-white shadow-brand-sm hover:opacity-90 gap-2">

              <Plus className="h-4 w-4" />

              New Order

            </Button>

          </DialogTrigger>


          {/* =================================================
              CREATE ORDER DIALOG
          ================================================= */}

          <DialogContent className="sm:max-w-md">

            <DialogHeader>

              <DialogTitle>
                Create Order
              </DialogTitle>

            </DialogHeader>


            <form
              onSubmit={handleAdd}
              className="space-y-4 mt-2"
            >


              {/* CUSTOMER */}

              <div className="space-y-1.5">

                <Label className="text-sm">
                  Customer *
                </Label>


                <Select
                  value={form.customer_id}
                  onValueChange={(value) => {

                    setForm({
                      ...form,
                      customer_id: value,
                    });

                  }}
                >

                  <SelectTrigger className="h-9 rounded-xl">

                    <SelectValue placeholder="Select customer" />

                  </SelectTrigger>


                  <SelectContent>

                    {customers.map(
                      (customer: any) => (

                        <SelectItem
                          key={customer.id}
                          value={String(customer.id)}
                        >

                          {customer.name}

                        </SelectItem>

                      )
                    )}

                  </SelectContent>

                </Select>

              </div>


              {/* DESCRIPTION */}

              <div className="space-y-1.5">

                <Label className="text-sm">
                  Description *
                </Label>

                <Input
                  className="h-9 rounded-xl"
                  placeholder="e.g. Kurta, Shirt, Pant"
                  value={form.description}
                  onChange={(e) => {

                    setForm({
                      ...form,
                      description:
                        e.target.value,
                    });

                  }}
                  required
                />

              </div>


              {/* AMOUNT */}

              <div className="space-y-1.5">

                <Label className="text-sm">
                  Amount (₹) *
                </Label>

                <Input
                  type="number"
                  min="0"
                  className="h-9 rounded-xl"
                  placeholder="Enter amount"
                  value={form.amount}
                  onChange={(e) => {

                    setForm({
                      ...form,
                      amount:
                        e.target.value,
                    });

                  }}
                  required
                />

              </div>


              {/* DATES */}

              <div className="grid grid-cols-2 gap-3">


                {/* ORDER DATE */}
                <div className="space-y-1.5">
                  <Label className="text-sm">Order Date *</Label>
                  <Input
                    type="date"
                    className="h-9 rounded-xl text-xs md:text-sm px-3 cursor-pointer"
                    value={form.order_date}
                    onChange={(e) => setForm({ ...form, order_date: e.target.value })}
                    required
                  />
                </div>

                {/* DUE DATE */}
                <div className="space-y-1.5">
                  <Label className="text-sm">Due Date *</Label>
                  <Input
                    type="date"
                    className="h-9 rounded-xl text-xs md:text-sm px-3 cursor-pointer"
                    value={form.due_date}
                    min={form.order_date || undefined}
                    onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                    required
                  />
                </div>


              </div>


              {/* STATUS */}

              <div className="space-y-1.5">

                <Label className="text-sm">
                  Status
                </Label>


                <Select
                  value={form.status}
                  onValueChange={(value) => {

                    setForm({
                      ...form,
                      status: value,
                    });

                  }}
                >

                  <SelectTrigger className="h-9 rounded-xl">

                    <SelectValue />

                  </SelectTrigger>


                  <SelectContent>

                    {ORDER_STATUSES.map(
                      (status) => (

                        <SelectItem
                          key={status}
                          value={status}
                        >

                          {status}

                        </SelectItem>

                      )
                    )}

                  </SelectContent>

                </Select>

              </div>


              {/* ERROR */}

              {error && (

                <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">

                  {error}

                </p>

              )}


              {/* BUTTONS */}

              <div className="flex gap-2 pt-1">

                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 rounded-xl"
                  onClick={() => {

                    setOpen(false);

                    setForm({
                      ...emptyForm,
                    });

                    setError("");

                  }}
                >

                  Cancel

                </Button>


                <Button
                  type="submit"
                  className="flex-1 gradient-brand text-white rounded-xl"
                  disabled={
                    createMutation.isPending
                  }
                >

                  {createMutation.isPending
                    ? "Creating…"
                    : "Create Order"}

                </Button>

              </div>

            </form>

          </DialogContent>

        </Dialog>

        {/* =================================================
            EDIT ORDER DIALOG
        ================================================= */}

        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Order {editingOrder?.order_code ? `(${editingOrder.order_code})` : ""}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditSubmit} className="space-y-4 mt-2">
              <div className="space-y-1.5">
                <Label className="text-sm">Customer *</Label>
                <Select
                  value={editForm.customer_id}
                  onValueChange={(val) => setEditForm({ ...editForm, customer_id: val })}
                >
                  <SelectTrigger className="h-9 rounded-xl">
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((c: any) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm">Description *</Label>
                <Input
                  className="h-9 rounded-xl"
                  placeholder="e.g. Kurta, Shirt, Pant"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm">Amount (₹) *</Label>
                <Input
                  type="number"
                  min="0"
                  className="h-9 rounded-xl"
                  placeholder="Enter amount"
                  value={editForm.amount}
                  onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-sm">Order Date *</Label>
                  <Input
                    type="date"
                    className="h-9 rounded-xl text-xs md:text-sm px-3 cursor-pointer"
                    value={editForm.order_date}
                    onChange={(e) => setEditForm({ ...editForm, order_date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm">Due Date *</Label>
                  <Input
                    type="date"
                    className="h-9 rounded-xl text-xs md:text-sm px-3 cursor-pointer"
                    value={editForm.due_date}
                    min={editForm.order_date || undefined}
                    onChange={(e) => setEditForm({ ...editForm, due_date: e.target.value })}
                    required
                  />
                </div>
              </div>


              <div className="space-y-1.5">
                <Label className="text-sm">Status</Label>
                <Select
                  value={editForm.status}
                  onValueChange={(val) => setEditForm({ ...editForm, status: val })}
                >
                  <SelectTrigger className="h-9 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ORDER_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {editError && (
                <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {editError}
                </p>
              )}

              <div className="flex gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 rounded-xl"
                  onClick={() => {
                    setEditOpen(false);
                    setEditingOrder(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 gradient-brand text-white rounded-xl"
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? "Saving…" : "Save Changes"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

      </motion.div>



      {/* =================================================
          STATUS FILTERS
      ================================================= */}

      <motion.div
        variants={item}
        className="flex flex-wrap gap-2"
      >

        {[
          "all",
          ...ORDER_STATUSES,
        ].map((status) => {

          const count =
            status === "all"
              ? orders.length
              : statusCount(status);

          return (

            <button
              key={status}
              onClick={() =>
                setStatusFilter(status)
              }
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                statusFilter === status
                  ? "gradient-brand text-white shadow-brand-sm"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-sky-300 hover:text-sky-600"
              }`}
            >

              {status === "all"
                ? "All"
                : status}

              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                  statusFilter === status
                    ? "bg-white/20"
                    : "bg-gray-100"
                }`}
              >

                {count}

              </span>

            </button>

          );

        })}

      </motion.div>


      {/* =================================================
          OVERDUE ALERT
      ================================================= */}

      {overdueCount > 0 && (

        <motion.div
          variants={item}
          className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl p-4"
        >

          <AlertTriangle
            className="h-4.5 w-4.5 text-red-500 shrink-0 mt-0.5"
          />

          <div>

            <p className="text-sm font-semibold text-red-700">

              {overdueCount} overdue order
              {overdueCount > 1
                ? "s"
                : ""}

            </p>

            <p className="text-xs text-red-500 mt-0.5">

              These orders have passed their due date and are still active.

            </p>

          </div>

        </motion.div>

      )}


      {/* =================================================
          SEARCH
      ================================================= */}

      <motion.div
        variants={item}
        className="flex items-center gap-3"
      >

        <div className="relative flex-1 max-w-sm">

          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />

          <Input
            className="pl-8 h-9 rounded-xl border-gray-200"
            placeholder="Search orders…"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />


          {search && (

            <button
              onClick={() =>
                setSearch("")
              }
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >

              <X className="h-3.5 w-3.5" />

            </button>

          )}

        </div>


        <span className="text-sm text-gray-400 shrink-0">

          {filteredOrders.length} result
          {filteredOrders.length !== 1
            ? "s"
            : ""}

        </span>

      </motion.div>


      {/* =================================================
          LOADING
      ================================================= */}

      {isLoading ? (

        <div className="space-y-2">

          {Array.from({
            length: 5,
          }).map((_, index) => (

            <div
              key={index}
              className="bg-white border border-gray-100 rounded-2xl p-4 animate-pulse flex items-center gap-4"
            >

              <div className="h-9 w-9 bg-gray-100 rounded-xl shrink-0" />

              <div className="flex-1 space-y-2">

                <div className="h-3.5 bg-gray-100 rounded w-40" />

                <div className="h-3 bg-gray-100 rounded w-28" />

              </div>

              <div className="h-6 w-20 bg-gray-100 rounded-full" />

            </div>

          ))}

        </div>

      ) : filteredOrders.length === 0 ? (


        /* =================================================
           EMPTY
        ================================================= */

        <motion.div
          variants={item}
          className="flex flex-col items-center justify-center py-20 text-gray-400"
        >

          <ShoppingBag
            className="h-10 w-10 mb-3 opacity-30"
          />

          <p className="font-medium text-sm">
            No orders found
          </p>

          <p className="text-xs mt-1">

            {search ||
            statusFilter !== "all"
              ? "Try different filters"
              : "Create your first order"}

          </p>

        </motion.div>

      ) : (


        /* =================================================
           ORDER LIST
        ================================================= */

        <div className="space-y-2">

          {filteredOrders.map(
            (order: any) => {

              const meta =
                getOrderStatusMeta(
                  order.status
                );

              const overdue =
                isOverdue(
                  order.due_date
                ) &&
                order.status !==
                  "Delivered";


              const customer =
                customers.find(
                  (customer: any) =>
                    customer.id ===
                    order.customer_id
                );


              return (

                <motion.div
                  key={order.id}
                  variants={item}
                  className={`group bg-white border rounded-2xl p-4 flex items-center gap-4 hover:shadow-sm transition-all duration-200 ${
                    overdue
                      ? "border-red-200 bg-red-50/30"
                      : "border-gray-100"
                  }`}
                >


                  {/* ICON */}

                  <div
                    className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${
                      overdue
                        ? "bg-red-100"
                        : "bg-sky-50"
                    }`}
                  >

                    {overdue ? (

                      <AlertTriangle
                        className="h-4 w-4 text-red-500"
                      />

                    ) : (

                      <Scissors
                        className="h-4 w-4 text-sky-500"
                      />

                    )}

                  </div>


                  {/* ORDER */}

                  <div className="flex-1 min-w-0">

                    <div className="flex items-center gap-2">

                      <p className="font-semibold text-gray-900 text-sm truncate">

                        {order.order_code ||
                          `Order #${order.id}`}

                      </p>


                      {overdue && (

                        <span className="text-[10px] font-bold text-red-600 bg-red-100 px-1.5 py-0.5 rounded">

                          OVERDUE

                        </span>

                      )}

                    </div>


                    <p className="text-xs text-gray-400 truncate mt-0.5">

                      {order.description}

                    </p>

                  </div>


                  {/* CUSTOMER */}

                  <div className="hidden lg:block text-xs text-gray-500 shrink-0 min-w-[100px]">

                    {customer?.name || "—"}

                  </div>


                  {/* ORDER DATE */}

                  <div className="hidden xl:flex items-center gap-2 text-xs text-gray-400 shrink-0">

                    <Calendar className="h-3.5 w-3.5" />

                    {order.order_date
                      ? formatDate(
                          order.order_date
                        )
                      : "—"}

                  </div>


                  {/* DUE DATE */}

                  <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400 shrink-0">

                    <Calendar className="h-3.5 w-3.5" />

                    {order.due_date
                      ? formatDate(
                          order.due_date
                        )
                      : "—"}

                  </div>


                  {/* AMOUNT */}

                  <p className="hidden md:block text-sm font-semibold text-gray-700 shrink-0 w-20 text-right">

                    {order.amount
                      ? formatCurrency(
                          order.amount
                        )
                      : "—"}

                  </p>


                  {/* STATUS */}

                  <Badge
                    variant="outline"
                    className={`text-xs shrink-0 ${meta.className}`}
                  >

                    {meta.label}

                  </Badge>


                  {/* MENU */}

                  <div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          className="h-7 w-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all opacity-0 group-hover:opacity-100"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-36">
                        <DropdownMenuItem
                          className="flex items-center gap-2 text-xs text-sky-600 focus:text-sky-600 cursor-pointer"
                          onClick={() => openEditOrderDialog(order)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          <span>Edit Order</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="flex items-center gap-2 text-xs text-red-600 focus:text-red-600 cursor-pointer"
                          onClick={() => {
                            if (
                              window.confirm(
                                `Delete ${
                                  order.order_code ||
                                  `Order #${order.id}`
                                }?`
                              )
                            ) {
                              deleteMutation.mutate(order.id);
                            }
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>


                </motion.div>

              );

            }
          )}

        </div>

      )}

    </motion.div>

  );
}