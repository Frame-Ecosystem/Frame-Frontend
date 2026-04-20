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
    { value: "cash_on_delivery", label: "Cash on Delivery", icon: "💵" },
    { value: "bank_transfer", label: "Bank Transfer", icon: "🏦" },
    { value: "online_payment", label: "Online Payment", icon: "💳" },
  ]

export default function CheckoutPage() {
  const { storeId } = useParams<{ storeId: string }>()
  const router = useRouter()
  const { data: cart } = useMyCart()
  const placeOrder = usePlaceOrder()

  const [address, setAddress] = useState({
    street: "",
    city: "",
    state: "",
    country: "Tunisia",
    postalCode: "",
  })
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("cash_on_delivery")
  const [notes, setNotes] = useState("")

  const storeItems = (cart?.items ?? []).filter((item) => {
    const s =
      typeof item.product.storeId === "object"
        ? (item.product.storeId as { _id: string })
        : null
    return s?._id === storeId
  })

  const subtotal = storeItems.reduce(
    (sum, item) => sum + (item.price ?? 0) * item.quantity,
    0,
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!address.street || !address.city) {
      toast.error("Please fill in your shipping address")
      return
    }

    placeOrder.mutate(
      {
        storeId,
        items: storeItems.map((item) => ({
          productId: item.product._id,
          quantity: item.quantity,
          variants: item.variants,
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
    <div className="from-background to-muted/10 min-h-screen bg-linear-to-br">
      <div className="mx-auto max-w-3xl px-4 py-6 lg:px-8">
        {/* Back */}
        <button
          onClick={() => router.back()}
          className="text-muted-foreground hover:text-foreground mb-4 flex items-center gap-1 text-sm"
        >
          <ChevronLeft size={16} /> Back to cart
        </button>

        <h1 className="mb-6 text-2xl font-bold">Checkout</h1>

        <form
          onSubmit={handleSubmit}
          className="grid gap-6 lg:grid-cols-[1fr_auto]"
        >
          <div className="space-y-5">
            {/* Shipping address */}
            <div className="bg-card border-border space-y-3 rounded-xl border p-4">
              <h2 className="flex items-center gap-2 font-semibold">
                <MapPin size={16} className="text-primary" /> Shipping Address
              </h2>
              <Input
                placeholder="Street address"
                value={address.street}
                onChange={(e) =>
                  setAddress((a) => ({ ...a, street: e.target.value }))
                }
                required
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  placeholder="City"
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
              <div className="grid grid-cols-2 gap-3">
                <Input
                  placeholder="Country"
                  value={address.country}
                  onChange={(e) =>
                    setAddress((a) => ({ ...a, country: e.target.value }))
                  }
                />
                <Input
                  placeholder="Postal code"
                  value={address.postalCode}
                  onChange={(e) =>
                    setAddress((a) => ({ ...a, postalCode: e.target.value }))
                  }
                />
              </div>
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

          {/* Order summary */}
          <div className="w-full lg:w-80">
            <div className="bg-card border-border sticky top-6 space-y-3 rounded-xl border p-4">
              <h2 className="font-semibold">Order Summary</h2>
              <div className="max-h-64 space-y-3 overflow-y-auto">
                {storeItems.map((item) => (
                  <div
                    key={item.product._id}
                    className="flex items-center gap-2"
                  >
                    {item.product.images?.[0] && (
                      <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg">
                        <Image
                          src={item.product.images[0].url}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium">
                        {item.product.name}
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
              <Button
                type="submit"
                className="w-full"
                disabled={placeOrder.isPending}
              >
                {placeOrder.isPending ? "Placing Order..." : "Place Order"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
