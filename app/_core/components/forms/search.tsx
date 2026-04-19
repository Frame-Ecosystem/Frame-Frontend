"use client"

import { SearchIcon } from "lucide-react"
import { Button } from "@/app/_core/ui/button"
import { Input } from "@/app/_core/ui/input"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/app/_core/ui/form"
import { useTranslation } from "@/app/_i18n"

export const searchInputRef = { current: null as null | HTMLInputElement }

const Search = () => {
  const { t } = useTranslation()

  const formSchema = z.object({
    title: z
      .string()
      .trim()
      .min(1, {
        message: t("search.validation"),
      }),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
    },
  })

  const router = useRouter()

  const handleSubmit = (data: z.infer<typeof formSchema>) => {
    router.push(`/lounges?title=${data.title}`)
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
                  placeholder={t("search.placeholder")}
                  className="border bg-transparent shadow-sm backdrop-blur-sm transition-shadow focus:shadow-md lg:h-14 lg:rounded-xl lg:px-6 lg:text-base"
                  suppressHydrationWarning={true}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="text-primary hover:bg-primary/10 border bg-transparent shadow-sm transition-all hover:scale-105 hover:shadow-md lg:h-14 lg:rounded-xl lg:px-8"
        >
          <SearchIcon className="lg:h-5 lg:w-5" />
          <span className="ml-2 hidden lg:inline">{t("search.button")}</span>
        </Button>
      </form>
    </Form>
  )
}

export default Search
