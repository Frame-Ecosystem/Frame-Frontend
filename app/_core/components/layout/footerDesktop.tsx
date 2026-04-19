"use client"

import { Mail, Instagram } from "lucide-react"
import Link from "next/link"
import { FooterBrandLogo as _FooterBrandLogo } from "../common/brand-logo"
import { useTranslation } from "@/app/_i18n"

const FooterDesktop = () => {
  const { t } = useTranslation()
  return (
    <footer className="border-border/50 border-t px-4 pt-16 pb-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Top row — brand + links */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-5">
          {/* Brand column */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <div className="mb-3 flex items-baseline">
              <span
                className="text-foreground text-2xl font-bold tracking-tight"
                style={{ fontFamily: "var(--font-nunito), sans-serif" }}
              >
                frame
              </span>
              <span className="text-primary decoration-primary/50 ml-0.5 self-end text-[8px] font-semibold underline">
                beauty
              </span>
            </div>
            <p className="text-muted-foreground mb-5 max-w-xs text-sm leading-relaxed">
              {t("footer.description")}
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://instagram.com/framebeauty"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Frame Beauty on Instagram"
                className="text-muted-foreground hover:text-primary hover:border-border inline-flex h-9 w-9 items-center justify-center rounded-lg border border-transparent transition-colors"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="mailto:abbassimoohamed@gmail.com"
                aria-label="Email Frame Beauty"
                className="text-muted-foreground hover:text-primary hover:border-border inline-flex h-9 w-9 items-center justify-center rounded-lg border border-transparent transition-colors"
              >
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Platform column */}
          <div>
            <h4 className="text-foreground mb-3 text-sm font-semibold">
              {t("footer.platform")}
            </h4>
            <ul className="text-muted-foreground space-y-2.5 text-sm">
              <li>
                <Link
                  href="/home"
                  className="hover:text-foreground transition-colors"
                >
                  {t("footer.feed")}
                </Link>
              </li>
              <li>
                <Link
                  href="/store"
                  className="hover:text-foreground transition-colors"
                >
                  {t("footer.shop")}
                </Link>
              </li>
              <li>
                <Link
                  href="/bookings"
                  className="hover:text-foreground transition-colors"
                >
                  {t("footer.book")}
                </Link>
              </li>
            </ul>
          </div>

          {/* For Clients column */}
          <div>
            <h4 className="text-foreground mb-3 text-sm font-semibold">
              {t("footer.forClients")}
            </h4>
            <ul className="text-muted-foreground space-y-2.5 text-sm">
              <li>
                <Link
                  href="/home"
                  className="hover:text-foreground transition-colors"
                >
                  {t("footer.discoverStyles")}
                </Link>
              </li>
              <li>
                <Link
                  href="/bookings"
                  className="hover:text-foreground transition-colors"
                >
                  {t("footer.bookAppointments")}
                </Link>
              </li>
              <li>
                <Link
                  href="/saved"
                  className="hover:text-foreground transition-colors"
                >
                  {t("footer.savedFavorites")}
                </Link>
              </li>
            </ul>
          </div>

          {/* For Centers column */}
          <div>
            <h4 className="text-foreground mb-3 text-sm font-semibold">
              {t("footer.forCenters")}
            </h4>
            <ul className="text-muted-foreground space-y-2.5 text-sm">
              <li>
                <Link
                  href="/settings"
                  className="hover:text-foreground transition-colors"
                >
                  {t("footer.dashboard")}
                </Link>
              </li>
              <li>
                <Link
                  href="/clients"
                  className="hover:text-foreground transition-colors"
                >
                  {t("footer.clients")}
                </Link>
              </li>
              <li>
                <Link
                  href="/queue"
                  className="hover:text-foreground transition-colors"
                >
                  {t("footer.queue")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact column */}
          <div>
            <h4 className="text-foreground mb-3 text-sm font-semibold">
              {t("footer.contact")}
            </h4>
            <ul className="text-muted-foreground space-y-2.5 text-sm">
              <li>
                <a
                  href="mailto:abbassimoohamed@gmail.com"
                  className="hover:text-foreground break-all transition-colors"
                >
                  abbassimoohamed@gmail.com
                </a>
              </li>
              <li>
                <a
                  href="https://instagram.com/framebeauty"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors"
                >
                  @framebeauty
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-border/50 mt-12 border-t" />

        {/* Bottom row — copyright */}
        <div className="mt-6 flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-muted-foreground text-xs">
            &copy; {new Date().getFullYear()} {t("footer.copyright")}
          </p>
          <p className="text-muted-foreground/60 text-xs">
            {t("footer.madeIn")}
          </p>
        </div>
      </div>
    </footer>
  )
}

export default FooterDesktop
