"use client"

import { Store, ShoppingCart, Heart, Star } from "lucide-react"
import { Button } from "../_components/ui/button"
import { Card, CardContent } from "../_components/ui/card"
import { Badge } from "../_components/ui/badge"
import { Input } from "../_components/ui/input"
import Image from "next/image"
import { useState } from "react"
import { useTranslation } from "@/app/_i18n"

// Sample products data - replace with real API data later
const SAMPLE_PRODUCTS = [
  {
    id: "1",
    name: "Premium Hair Gel",
    description: "Professional-grade styling gel for all hair types",
    price: 24.99,
    imageUrl: "/images/frameLight.png",
    category: "Hair Care",
    rating: 4.5,
    inStock: true,
  },
  {
    id: "2",
    name: "Beard Oil",
    description: "Natural beard conditioning oil with essential oils",
    price: 19.99,
    imageUrl: "/images/clientType.png",
    category: "Beard Care",
    rating: 4.8,
    inStock: true,
  },
  {
    id: "3",
    name: "Hair Wax",
    description: "Strong hold matte finish hair wax",
    price: 22.5,
    imageUrl: "/images/frameLight.png",
    category: "Hair Care",
    rating: 4.6,
    inStock: true,
  },
  {
    id: "4",
    name: "Shaving Cream",
    description: "Luxury shaving cream with moisturizing formula",
    price: 15.99,
    imageUrl: "/images/frameDark.png",
    category: "Shaving",
    rating: 4.7,
    inStock: false,
  },
  {
    id: "5",
    name: "Hair Pomade",
    description: "High shine medium hold pomade",
    price: 21.99,
    imageUrl: "/images/frameLight.png",
    category: "Hair Care",
    rating: 4.4,
    inStock: true,
  },
  {
    id: "6",
    name: "Aftershave Balm",
    description: "Soothing aftershave balm with aloe vera",
    price: 18.99,
    imageUrl: "/images/loungeType.png",
    category: "Shaving",
    rating: 4.9,
    inStock: true,
  },
]

export default function StorePage() {
  const { t, dir } = useTranslation()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const categories = Array.from(new Set(SAMPLE_PRODUCTS.map((p) => p.category)))

  const filteredProducts = SAMPLE_PRODUCTS.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory =
      !selectedCategory || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="from-background via-background to-muted/20 min-h-screen bg-linear-to-br pb-24 lg:pb-0">
      <div className="mx-auto max-w-7xl lg:pt-0">
        <div className="p-5 lg:px-8 lg:py-12">
          {/* Header */}
          <div className="mb-8 lg:mb-12">
            <div dir={dir} className="mt-6 mb-4 flex items-center gap-3">
              <Store className="text-primary h-8 w-8 lg:h-10 lg:w-10" />
              <h1 className="text-3xl font-bold lg:text-4xl">
                {t("store.title")}
              </h1>
            </div>
            <p className="text-muted-foreground lg:text-lg">
              {t("store.subtitle")}
            </p>
          </div>

          {/* Search and Filters */}
          <div className="mb-8 space-y-4">
            <Input
              type="text"
              placeholder={t("store.searchPlaceholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />

            {/* Category Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                onClick={() => setSelectedCategory(null)}
                size="sm"
              >
                {t("store.allProducts")}
              </Button>
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={
                    selectedCategory === category ? "default" : "outline"
                  }
                  onClick={() => setSelectedCategory(category)}
                  size="sm"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product, productIndex) => (
              <Card
                key={product.id}
                className="group overflow-hidden rounded-2xl"
              >
                <CardContent className="p-0">
                  {/* Product Image */}
                  <div className="bg-muted relative h-[200px] w-full overflow-hidden">
                    <Image
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-110"
                      src={product.imageUrl}
                      priority={productIndex === 0}
                      loading={productIndex === 0 ? "eager" : undefined}
                    />

                    {/* Stock Badge */}
                    {!product.inStock && (
                      <Badge
                        className="absolute top-2 left-2"
                        variant="destructive"
                      >
                        {t("store.outOfStock")}
                      </Badge>
                    )}

                    {/* Favorite Button */}
                    <Button
                      size="icon"
                      variant="secondary"
                      className="absolute top-2 right-2 h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <Badge variant="outline" className="mb-2 text-xs">
                      {product.category}
                    </Badge>

                    <h3 className="mb-1 font-semibold">{product.name}</h3>
                    <p className="text-muted-foreground mb-3 line-clamp-2 text-sm">
                      {product.description}
                    </p>

                    {/* Rating */}
                    <div className="mb-3 flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">
                        {product.rating}
                      </span>
                    </div>

                    {/* Price and Add to Cart */}
                    <div className="flex items-center justify-between">
                      <p className="text-xl font-bold">${product.price}</p>
                      <Button
                        size="sm"
                        disabled={!product.inStock}
                        className="gap-2"
                      >
                        <ShoppingCart className="h-4 w-4" />
                        {t("store.addToCart")}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* No Results */}
          {filteredProducts.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">{t("store.noResults")}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
