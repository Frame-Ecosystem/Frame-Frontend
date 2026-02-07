"use client"

import { CardContent } from "../ui/card"
import { MapPinIcon, PhoneIcon, MailIcon } from "lucide-react"
import Link from "next/link"

const FooterDesktop = () => {
  return (
    <footer className="bg-card/30 hidden border-t backdrop-blur-sm lg:block">
      <CardContent className="px-5 py-6 lg:px-8 lg:py-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 grid grid-cols-3 gap-8">
            {/* Brand column */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold">Lookisi</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                The best platform to book your appointment with the best centers
                in Tunisia.
              </p>
              <div className="text-muted-foreground flex items-center gap-2 text-sm">
                <MapPinIcon className="h-4 w-4" />
                <span>Tunis, TN</span>
              </div>
            </div>
            {/* Company column */}
            <div className="space-y-4">
              <h4 className="font-semibold">Company</h4>
              <ul className="text-muted-foreground space-y-2 text-sm">
                <li>
                  <Link
                    href="#"
                    className="hover:text-primary transition-colors"
                  >
                    About us
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-primary transition-colors"
                  >
                    Careers
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-primary transition-colors"
                  >
                    Partners
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-primary transition-colors"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            {/* Contact column */}
            <div className="space-y-4">
              <h4 className="font-semibold">Contact</h4>
              <div className="text-muted-foreground space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <PhoneIcon className="h-4 w-4" />
                  <span>(216) 50 922 140</span>
                </div>
                <div className="flex items-center gap-2">
                  <MailIcon className="h-4 w-4" />
                  <span>medab@gmail.com</span>
                </div>
              </div>
            </div>
          </div>
          {/* Bottom section */}
          <div className="flex items-center justify-between border-t pt-8">
            <p className="text-muted-foreground text-sm">
              © 2026 <span className="font-bold">Lookisi</span>. All rights
              reserved.
            </p>
            <p>
              Developed by{" "}
              <Link
                className="hover:text-primary flex items-center text-[#0077B5] transition-colors"
                href="https://www.linkedin.com/"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={16}
                  height={16}
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.268c-.966 0-1.75-.784-1.75-1.75s.784-1.75 1.75-1.75 1.75.784 1.75 1.75-.784 1.75-1.75 1.75zm15.5 11.268h-3v-5.604c0-1.337-.025-3.063-1.868-3.063-1.868 0-2.154 1.459-2.154 2.968v5.699h-3v-10h2.881v1.367h.041c.401-.761 1.379-1.563 2.841-1.563 3.039 0 3.6 2.001 3.6 4.599v5.597z" />
                </svg>
                <span className="ml-2 font-bold">medab</span>
              </Link>
            </p>
            <div className="text-muted-foreground flex items-center gap-6 text-sm">
              <Link href="#" className="hover:text-primary transition-colors">
                Privacidade
              </Link>
              <Link href="#" className="hover:text-primary transition-colors">
                Termos
              </Link>
              <Link href="#" className="hover:text-primary transition-colors">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </footer>
  )
}

export default FooterDesktop
