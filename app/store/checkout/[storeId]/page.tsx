"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ChevronLeft, MapPin, CreditCard } from "lucide-react"
import { Button } from "@/app/_components/ui/button"
import { Input } from "@/app/_components/ui/input"
import { useMyCart, usePlaceOrder } from "@/app/_hooks/queries/useMarketplace"
import { PaymentMethod } from "@/app/_types/marketplace"
import { toast } from "sonner"
import Image from "next/image"

const PAYMENT_METHODS: { value: PaymentMethod; label: string; icon: string }[] =
  [
    { value: "cashOnDelivery", label: "Cash on Delivery", icon: "💵" },
    { value: "bankTransfer", label: "Bank Transfer", icon: "🏦" },
    { value: "inStore", label: "In Store", icon: "🏪" },
  ]

export default function CheckoutPage() {
  const { storeId } = useParams<{ storeId: string }>()
  const router = useRouter()
  const { data: cart } = useMyCart()
  const placeOrder = usePlaceOrder()

  const [address, setAddress] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
  })
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("cashOnDelivery")
  const [notes, setNotes] = useState("")

  const storeItems = (cart?.items ?? []).filter((item) => {
    if (!item.productId) return false
    const sid = item.productId.storeId
    if (!sid) return false
    if (typeof sid === "object") return (sid as { _id: string })._id === storeId
    return sid === storeId
  })

  const subtotal = storeItems.reduce(
    (sum, item) => sum + (item.price ?? 0) * item.quantity,
    0,
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (
      !address.fullName ||
      !address.phone ||
      !address.address ||
      !address.city
    ) {
      toast.error("Please fill in all required shipping fields")
      return
    }

    placeOrder.mutate(
      {
        storeId,
        items: storeItems.map((item) => ({
          productId: item.productId._id,
          quantity: item.quantity,
          ...(item.variantIndex !== undefined && {
            variantIndex: item.variantIndex,
          }),
        })),
        shippingAddress: address,
        paymentMethod,
        notes: notes || undefined,
      },
      {
        onSuccess: (order) => {
          toast.success("Order placed successfully!")
          router.push(`/store/orders/${order._id}`)
        },
        onError: () => toast.error("Failed to place order"),
      },
    )
  }

  if (storeItems.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">No items for this store</p>
      </div>
    )
  }

  return (
    <div className="from-background to-muted/10 min-h-screen w-full overflow-x-hidden bg-linear-to-br">
      <div className="mx-auto w-full max-w-3xl px-4 py-6 pb-28 lg:px-8 lg:pb-10">
        {/* Back — desktop only */}
        <button
          onClick={() => router.back()}
          className="bg-background border-border/60 hover:bg-muted mb-5 hidden h-10 items-center gap-1.5 rounded-full border px-4 text-sm font-medium shadow-sm transition-colors lg:inline-flex"
        >
          <ChevronLeft size={18} /> Back to cart
        </button>

        <h1 className="mb-5 text-xl font-bold lg:text-2xl">Checkout</h1>

        <form
          id="checkout-form"
          onSubmit={handleSubmit}
          className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_340px]"
        >
          {/* Order summary — shows first on mobile, sidebar on desktop */}
          <div className="order-1 min-w-0 lg:order-2">
            <div className="bg-card border-border space-y-3 rounded-xl border p-4 lg:sticky lg:top-24">
              <h2 className="font-semibold">Order Summary</h2>
              <div className="max-h-48 space-y-3 overflow-y-auto lg:max-h-64">
                {storeItems.map((item) => (
                  <div
                    key={item.productId._id}
                    className="flex items-center gap-2"
                  >
                    {item.productId.images?.[0] && (
                      <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg">
                        <Image
                          src={item.productId.images[0].url}
                          alt={item.productId.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium">
                        {item.productId.name}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        x{item.quantity}
                      </p>
                    </div>
                    <p className="flex-shrink-0 text-sm font-semibold">
                      {((item.price ?? 0) * item.quantity).toFixed(2)} DT
                    </p>
                  </div>
                ))}
              </div>
              <div className="border-border border-t pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">
                    Subtotal
                  </span>
                  <span className="font-bold">{subtotal.toFixed(2)} DT</span>
                </div>
              </div>
              {/* Place Order button — desktop only */}
              <Button
                type="submit"
                className="hidden w-full lg:flex"
                disabled={placeOrder.isPending}
              >
                {placeOrder.isPending ? "Placing Order..." : "Place Order"}
              </Button>
            </div>
          </div>

          {/* Form fields */}
          <div className="order-2 min-w-0 space-y-4 lg:order-1">
            {/* Shipping address */}
            <div className="bg-card border-border space-y-3 rounded-xl border p-4">
              <h2 className="flex items-center gap-2 font-semibold">
                <MapPin size={16} className="text-primary" /> Shipping Address
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  placeholder="Full name *"
                  value={address.fullName}
                  onChange={(e) =>
                    setAddress((a) => ({ ...a, fullName: e.target.value }))
                  }
                  required
                />
                <Input
                  placeholder="Phone *"
                  value={address.phone}
                  onChange={(e) =>
                    setAddress((a) => ({ ...a, phone: e.target.value }))
                  }
                  required
                />
              </div>
              <Input
                placeholder="Street address *"
                value={address.address}
                onChange={(e) =>
                  setAddress((a) => ({ ...a, address: e.target.value }))
                }
                required
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  placeholder="City *"
                  value={address.city}
                  onChange={(e) =>
                    setAddress((a) => ({ ...a, city: e.target.value }))
                  }
                  required
                />
                <Input
                  placeholder="State / Region"
                  value={address.state}
                  onChange={(e) =>
                    setAddress((a) => ({ ...a, state: e.target.value }))
                  }
                />
              </div>
              <Input
                placeholder="Zip code"
                value={address.zipCode}
                onChange={(e) =>
                  setAddress((a) => ({ ...a, zipCode: e.target.value }))
                }
              />
            </div>

            {/* Payment method */}
            <div className="bg-card border-border space-y-3 rounded-xl border p-4">
              <h2 className="flex items-center gap-2 font-semibold">
                <CreditCard size={16} className="text-primary" /> Payment Method
              </h2>
              <div className="space-y-2">
                {PAYMENT_METHODS.map((pm) => (
                  <label
                    key={pm.value}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-all ${
                      paymentMethod === pm.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-muted"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={pm.value}
                      checked={paymentMethod === pm.value}
                      onChange={() => setPaymentMethod(pm.value)}
                      className="hidden"
                    />
                    <span className="text-xl">{pm.icon}</span>
                    <span className="text-sm font-medium">{pm.label}</span>
                    {paymentMethod === pm.value && (
                      <span className="text-primary ml-auto text-xs">✓</span>
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="bg-card border-border rounded-xl border p-4">
              <h2 className="mb-2 text-sm font-semibold">
                Order Notes (optional)
              </h2>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special instructions..."
                rows={3}
                className="border-border bg-background focus:ring-primary/30 w-full resize-none rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
              />
            </div>
          </div>
        </form>
      </div>

      {/* Mobile sticky bottom bar */}
      <div className="border-border bg-background/95 fixed right-0 bottom-0 left-0 z-50 border-t px-4 py-3 backdrop-blur-sm lg:hidden">
        <div className="mx-auto flex max-w-3xl items-center gap-4">
          <div className="flex-1">
            <p className="text-muted-foreground text-xs">Total</p>
            <p className="text-lg font-bold">{subtotal.toFixed(2)} DT</p>
          </div>
          <Button
            type="submit"
            form="checkout-form"
            className="flex-1"
            disabled={placeOrder.isPending}
          >
            {placeOrder.isPending ? "Placing..." : "Place Order"}
          </Button>
        </div>
      </div>
    </div>
  )
}
