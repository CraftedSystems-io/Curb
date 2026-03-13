import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy - Curb",
  description:
    "Learn how Curb collects, uses, and protects your personal information.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-16 max-w-4xl items-center gap-4 px-4 sm:px-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Curb
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
        {/* Title */}
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600">
            <MapPin className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">Curb</span>
        </div>
        <h1 className="mt-6 text-3xl font-bold text-gray-900 sm:text-4xl">
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Last updated: March 12, 2026
        </p>

        <div className="mt-10 space-y-10 text-gray-700 leading-relaxed">
          {/* Intro */}
          <p>
            Crafted &amp; Company (&quot;we,&quot; &quot;us,&quot; or
            &quot;our&quot;) operates the Curb mobile application and website
            (collectively, the &quot;Service&quot;). This Privacy Policy explains
            how we collect, use, disclose, and safeguard your information when
            you use our Service. By using Curb, you agree to the collection and
            use of information in accordance with this policy.
          </p>

          {/* 1. Information We Collect */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900">
              1. Information We Collect
            </h2>
            <p className="mt-3">
              We collect several types of information to provide and improve our
              Service:
            </p>
            <ul className="mt-4 space-y-3 list-disc pl-6">
              <li>
                <span className="font-medium text-gray-900">
                  Account Information:
                </span>{" "}
                When you create an account, we collect your name, email address,
                and password. Authentication is handled through Supabase Auth, a
                secure third-party authentication provider.
              </li>
              <li>
                <span className="font-medium text-gray-900">
                  Profile Information:
                </span>{" "}
                Depending on your role (homeowner or contractor), you may provide
                additional details such as a profile photo, business name,
                service areas, service types offered, and a bio or description.
              </li>
              <li>
                <span className="font-medium text-gray-900">
                  Service Booking Data:
                </span>{" "}
                We collect information related to service bookings, including
                service type, date and time, address, pricing, status, and any
                notes or special instructions you provide.
              </li>
              <li>
                <span className="font-medium text-gray-900">
                  Photos and Media:
                </span>{" "}
                Contractors may upload portfolio photos showcasing their work
                using their device camera or photo library. Clients may also
                upload images related to service requests.
              </li>
              <li>
                <span className="font-medium text-gray-900">
                  Communications:
                </span>{" "}
                Messages sent through the in-app messaging feature are stored to
                facilitate communication between clients and contractors.
              </li>
              <li>
                <span className="font-medium text-gray-900">
                  Usage and Device Data:
                </span>{" "}
                We automatically collect information about how you interact with
                the Service, including device type, operating system, app
                version, and general usage patterns.
              </li>
            </ul>
          </section>

          {/* 2. How We Use Information */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900">
              2. How We Use Your Information
            </h2>
            <p className="mt-3">
              We use the information we collect for the following purposes:
            </p>
            <ul className="mt-4 space-y-3 list-disc pl-6">
              <li>
                To create and manage your account and authenticate your identity.
              </li>
              <li>
                To connect homeowners with nearby service contractors based on
                location and availability.
              </li>
              <li>
                To process and manage service bookings, scheduling, and
                payments.
              </li>
              <li>
                To facilitate in-app communication between clients and
                contractors.
              </li>
              <li>
                To send push notifications about booking updates, messages, and
                other relevant activity.
              </li>
              <li>
                To display contractor profiles, portfolios, ratings, and reviews
                to potential clients.
              </li>
              <li>
                To improve, personalize, and optimize the Service and user
                experience.
              </li>
              <li>
                To detect, prevent, and address fraud, abuse, or technical
                issues.
              </li>
              <li>
                To comply with legal obligations and enforce our terms of
                service.
              </li>
            </ul>
          </section>

          {/* 3. Location Data */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900">
              3. Location Data
            </h2>
            <p className="mt-3">
              Location data is central to how Curb works. We collect and use
              location information as follows:
            </p>
            <ul className="mt-4 space-y-3 list-disc pl-6">
              <li>
                <span className="font-medium text-gray-900">
                  Client Location:
                </span>{" "}
                With your permission, we access your device&apos;s GPS to show
                you service contractors who are nearby. Your location is used to
                calculate proximity and display relevant results on the map.
              </li>
              <li>
                <span className="font-medium text-gray-900">
                  Contractor Location:
                </span>{" "}
                Contractors who opt in to live availability share their real-time
                location so they can appear on the map for nearby clients seeking
                services. Contractors can control when their location is shared
                by toggling their availability status.
              </li>
              <li>
                <span className="font-medium text-gray-900">
                  Location Permissions:
                </span>{" "}
                You can grant or revoke location permissions at any time through
                your device settings. Disabling location access may limit
                certain features of the Service, such as the ability to discover
                nearby contractors or appear on the map.
              </li>
            </ul>
            <p className="mt-4">
              We do not sell your location data to third parties. Location
              information is used solely to provide the proximity-based features
              of the Service.
            </p>
          </section>

          {/* 4. Push Notifications */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900">
              4. Push Notifications
            </h2>
            <p className="mt-3">
              We use Apple Push Notification service (APNs) and other
              platform-specific notification services to send you timely updates.
              To deliver push notifications, we collect and store a device token
              that uniquely identifies your device for notification delivery.
            </p>
            <p className="mt-3">
              Push notifications may include alerts about new booking requests,
              booking confirmations, messages from clients or contractors,
              schedule reminders, and other Service-related updates.
            </p>
            <p className="mt-3">
              You can manage your notification preferences or disable push
              notifications entirely through your device settings at any time.
              Disabling notifications will not affect core functionality of the
              Service, but you may miss time-sensitive updates.
            </p>
          </section>

          {/* 5. Data Sharing */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900">
              5. Data Sharing and Disclosure
            </h2>
            <p className="mt-3">
              We do not sell your personal information. We may share your
              information in the following limited circumstances:
            </p>
            <ul className="mt-4 space-y-3 list-disc pl-6">
              <li>
                <span className="font-medium text-gray-900">
                  Between Users:
                </span>{" "}
                When a booking is made, relevant information (such as name,
                profile photo, service details, and approximate location) is
                shared between the client and contractor to facilitate the
                service.
              </li>
              <li>
                <span className="font-medium text-gray-900">
                  Service Providers:
                </span>{" "}
                We use trusted third-party services to operate the platform,
                including Supabase for authentication and data storage, and
                Apple Push Notification service for notifications. These
                providers only access data necessary to perform their functions
                and are bound by their own privacy policies.
              </li>
              <li>
                <span className="font-medium text-gray-900">
                  Legal Requirements:
                </span>{" "}
                We may disclose your information if required to do so by law, in
                response to valid legal process, or to protect the rights,
                property, or safety of Crafted &amp; Company, our users, or the
                public.
              </li>
              <li>
                <span className="font-medium text-gray-900">
                  Business Transfers:
                </span>{" "}
                In the event of a merger, acquisition, or sale of all or a
                portion of our assets, your information may be transferred as
                part of that transaction. We will notify you of any such change
                and any choices you may have regarding your information.
              </li>
            </ul>
          </section>

          {/* 6. Data Security */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900">
              6. Data Security
            </h2>
            <p className="mt-3">
              We take reasonable administrative, technical, and physical measures
              to protect your personal information from unauthorized access,
              alteration, disclosure, or destruction. These measures include:
            </p>
            <ul className="mt-4 space-y-3 list-disc pl-6">
              <li>
                Encryption of data in transit using TLS/SSL protocols.
              </li>
              <li>
                Secure password hashing through our authentication provider.
              </li>
              <li>
                Row-level security policies on our database to ensure users can
                only access data they are authorized to view.
              </li>
              <li>
                Regular review and updates of our security practices.
              </li>
            </ul>
            <p className="mt-4">
              While we strive to protect your data, no method of electronic
              transmission or storage is completely secure. We cannot guarantee
              absolute security, but we are committed to maintaining industry
              best practices.
            </p>
          </section>

          {/* 7. Data Retention */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900">
              7. Data Retention
            </h2>
            <p className="mt-3">
              We retain your personal information for as long as your account is
              active or as needed to provide you with the Service. If you delete
              your account, we will delete or anonymize your personal information
              within 30 days, except where we are required to retain it for
              legal, accounting, or regulatory purposes.
            </p>
            <p className="mt-3">
              Booking history and reviews may be retained in anonymized form
              after account deletion to maintain the integrity of the
              platform&apos;s review system.
            </p>
          </section>

          {/* 8. Your Rights */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900">
              8. Your Rights and Choices
            </h2>
            <p className="mt-3">
              Depending on your jurisdiction, you may have the following rights
              regarding your personal information:
            </p>
            <ul className="mt-4 space-y-3 list-disc pl-6">
              <li>
                <span className="font-medium text-gray-900">Access:</span> You
                can request a copy of the personal data we hold about you.
              </li>
              <li>
                <span className="font-medium text-gray-900">Correction:</span>{" "}
                You can update or correct inaccurate information through your
                account settings or by contacting us.
              </li>
              <li>
                <span className="font-medium text-gray-900">Deletion:</span>{" "}
                You can request deletion of your account and associated personal
                data.
              </li>
              <li>
                <span className="font-medium text-gray-900">
                  Location Opt-Out:
                </span>{" "}
                You can disable location sharing through your device settings at
                any time.
              </li>
              <li>
                <span className="font-medium text-gray-900">
                  Notification Opt-Out:
                </span>{" "}
                You can disable push notifications through your device settings.
              </li>
            </ul>
            <p className="mt-4">
              To exercise any of these rights, please contact us at{" "}
              <a
                href="mailto:contact@craftedcompany.com"
                className="text-emerald-600 hover:text-emerald-700 underline"
              >
                contact@craftedcompany.com
              </a>
              .
            </p>
          </section>

          {/* 9. Children's Privacy */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900">
              9. Children&apos;s Privacy
            </h2>
            <p className="mt-3">
              Curb is not intended for use by individuals under the age of 18. We
              do not knowingly collect personal information from children. If we
              become aware that we have inadvertently collected data from a child
              under 18, we will take steps to delete that information promptly.
              If you believe a child has provided us with personal information,
              please contact us at{" "}
              <a
                href="mailto:contact@craftedcompany.com"
                className="text-emerald-600 hover:text-emerald-700 underline"
              >
                contact@craftedcompany.com
              </a>
              .
            </p>
          </section>

          {/* 10. Changes to Policy */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900">
              10. Changes to This Privacy Policy
            </h2>
            <p className="mt-3">
              We may update this Privacy Policy from time to time. When we make
              changes, we will revise the &quot;Last updated&quot; date at the
              top of this page and, where appropriate, notify you through the
              app or by email. We encourage you to review this Privacy Policy
              periodically to stay informed about how we are protecting your
              information.
            </p>
            <p className="mt-3">
              Your continued use of the Service after any changes to this
              Privacy Policy constitutes your acceptance of the updated terms.
            </p>
          </section>

          {/* 11. Contact Us */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900">
              11. Contact Us
            </h2>
            <p className="mt-3">
              If you have any questions, concerns, or requests regarding this
              Privacy Policy or our data practices, please contact us:
            </p>
            <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-6">
              <p className="font-medium text-gray-900">Crafted &amp; Company</p>
              <p className="mt-1 text-gray-600">
                Email:{" "}
                <a
                  href="mailto:contact@craftedcompany.com"
                  className="text-emerald-600 hover:text-emerald-700 underline"
                >
                  contact@craftedcompany.com
                </a>
              </p>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600">
                <MapPin className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900">Curb</span>
            </div>
            <p className="text-sm text-gray-400">
              &copy; {new Date().getFullYear()} Crafted &amp; Company. All
              rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
