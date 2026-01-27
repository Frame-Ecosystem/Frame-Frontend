"use client"

import { SearchIcon } from "lucide-react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormMessage } from "./ui/form"

export const searchInputRef = { current: null as null | HTMLInputElement }

const formSchema = z.object({
  title: z.string().trim().min(1, {
    message: "Enter something to search",
  }),
})

const Search = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
    },
  })

  const router = useRouter()

  const handleSubmit = (data: z.infer<typeof formSchema>) => {
    router.push(`/barbershops?title=${data.title}`)
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex gap-2 lg:gap-3"
        suppressHydrationWarning
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormControl>
                <Input
                  {...field}
                  ref={(el) => {
                    field.ref(el)
                    searchInputRef.current = el
                  }}
                  placeholder="Search barbershop by name..."
                  className="bg-transparent border  shadow-sm backdrop-blur-sm transition-shadow focus:shadow-md lg:h-14 lg:rounded-xl lg:px-6 lg:text-base"
                  suppressHydrationWarning={true}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="bg-transparent border text-primary hover:bg-primary/10 shadow-sm transition-all hover:scale-105 hover:shadow-md lg:h-14 lg:rounded-xl lg:px-8"
        >
          <SearchIcon className="lg:h-5 lg:w-5" />
          <span className="ml-2 hidden lg:inline">Search</span>
        </Button>
      </form>
    </Form>
  )
}

export default Search
