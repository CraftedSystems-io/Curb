import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service - Curb",
  description:
    "Review the terms and conditions for using the Curb home services platform.",
};

export default function TermsOfServicePage() {
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
          Terms of Service
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Last updated: March 14, 2026
        </p>

        <div className="mt-10 space-y-10 text-gray-700 leading-relaxed">
          {/* Intro */}
          <p>
            Welcome to Curb. These Terms of Service (&quot;Terms&quot;) govern
            your access to and use of the Curb mobile application and website
            (collectively, the &quot;Service&quot;) operated by Crafted &amp;
            Company (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;). By
            creating an account or using the Service, you agree to be bound by
            these Terms. If you do not agree, please do not use the Service.
          </p>

          {/* 1. Eligibility */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900">
              1. Eligibility
            </h2>
            <p className="mt-3">
              You must be at least 18 years of age to use the Service. By using
              Curb, you represent and warrant that you are at least 18 years old
              and have the legal capacity to enter into these Terms.
            </p>
          </section>

          {/* 2. Account Registration */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900">
              2. Account Registration
            </h2>
            <p className="mt-3">
              To access certain features of the Service, you must create an
              account. You agree to provide accurate, current, and complete
              information during registration and to update such information as
              needed. You are responsible for safeguarding your account
              credentials and for all activity that occurs under your account.
            </p>
            <p className="mt-3">
              You must notify us immediately of any unauthorized use of your
              account. We are not liable for any losses arising from unauthorized
              use of your account.
            </p>
          </section>

          {/* 3. The Service */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900">
              3. Description of the Service
            </h2>
            <p className="mt-3">
              Curb is a two-sided marketplace platform that connects homeowners
              (&quot;Clients&quot;) with local service professionals
              (&quot;Contractors&quot;) in the lawn care, pool cleaning, and
              house cleaning industries. The Service provides tools for
              discovering nearby contractors, booking services, communicating
              through in-app messaging, and managing service-related activities.
            </p>
            <p className="mt-3">
              Curb is a platform that facilitates connections between Clients
              and Contractors. We are not a party to any service agreement
              between Clients and Contractors, and we do not employ, endorse, or
              guarantee any Contractor. All services are provided directly by
              independent Contractors.
            </p>
          </section>

          {/* 4. User Roles */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900">
              4. User Roles and Responsibilities
            </h2>
            <p className="mt-3 font-medium text-gray-900">For Clients:</p>
            <ul className="mt-2 space-y-2 list-disc pl-6">
              <li>
                You agree to provide accurate information when booking services,
                including your address and service requirements.
              </li>
              <li>
                You agree to treat Contractors with respect and to communicate
                in good faith.
              </li>
              <li>
                You understand that Curb does not guarantee the availability,
                quality, or timeliness of services provided by Contractors.
              </li>
            </ul>
            <p className="mt-4 font-medium text-gray-900">For Contractors:</p>
            <ul className="mt-2 space-y-2 list-disc pl-6">
              <li>
                You represent that you have the necessary skills, licenses, and
                insurance to provide the services you offer.
              </li>
              <li>
                You agree to provide accurate information about your services,
                pricing, and availability.
              </li>
              <li>
                You agree to fulfill accepted bookings in a professional and
                timely manner.
              </li>
              <li>
                You acknowledge that you are an independent service provider and
                not an employee of Crafted &amp; Company.
              </li>
            </ul>
          </section>

          {/* 5. Bookings and Payments */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900">
              5. Bookings and Payments
            </h2>
            <p className="mt-3">
              Bookings made through the Service represent a request from a
              Client to a Contractor for services. Contractors may accept or
              decline booking requests at their discretion. Acceptance of a
              booking creates a direct service agreement between the Client and
              the Contractor.
            </p>
            <p className="mt-3">
              Payment terms, pricing, and payment methods are established
              between the Client and Contractor. Curb may facilitate payment
              processing in the future but is not currently responsible for
              collecting or disbursing payments between parties.
            </p>
          </section>

          {/* 6. User Content */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900">
              6. User Content
            </h2>
            <p className="mt-3">
              You may submit content to the Service, including profile
              information, portfolio photos, reviews, ratings, and messages
              (&quot;User Content&quot;). You retain ownership of your User
              Content, but you grant us a non-exclusive, worldwide,
              royalty-free license to use, display, and distribute your User
              Content in connection with operating and promoting the Service.
            </p>
            <p className="mt-3">
              You are solely responsible for your User Content. You agree not
              to submit content that is false, misleading, defamatory, obscene,
              or otherwise objectionable. We reserve the right to remove any
              User Content that violates these Terms.
            </p>
          </section>

          {/* 7. Reviews and Ratings */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900">
              7. Reviews and Ratings
            </h2>
            <p className="mt-3">
              Clients may leave reviews and ratings for Contractors after a
              completed booking. Reviews must be honest, fair, and based on
              actual service experiences. We do not verify or endorse any
              reviews. We reserve the right to remove reviews that we determine
              to be fraudulent, abusive, or in violation of these Terms.
            </p>
          </section>

          {/* 8. Location Data */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900">
              8. Location Data
            </h2>
            <p className="mt-3">
              The Service uses location data to connect Clients with nearby
              Contractors. By using the Service, you consent to the collection
              and use of your location data as described in our{" "}
              <Link
                href="/privacy"
                className="text-emerald-600 hover:text-emerald-700 underline"
              >
                Privacy Policy
              </Link>
              . You may disable location sharing through your device settings,
              but this may limit the functionality of the Service.
            </p>
          </section>

          {/* 9. Prohibited Conduct */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900">
              9. Prohibited Conduct
            </h2>
            <p className="mt-3">You agree not to:</p>
            <ul className="mt-3 space-y-2 list-disc pl-6">
              <li>
                Use the Service for any illegal or unauthorized purpose.
              </li>
              <li>
                Impersonate any person or entity, or falsely represent your
                affiliation with any person or entity.
              </li>
              <li>
                Harass, abuse, or threaten other users of the Service.
              </li>
              <li>
                Submit false, misleading, or fraudulent information, reviews,
                or content.
              </li>
              <li>
                Interfere with or disrupt the Service or servers or networks
                connected to the Service.
              </li>
              <li>
                Attempt to gain unauthorized access to other users&apos;
                accounts or personal information.
              </li>
              <li>
                Use the Service to solicit users for services outside the
                platform in a manner that circumvents Curb.
              </li>
            </ul>
          </section>

          {/* 10. Intellectual Property */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900">
              10. Intellectual Property
            </h2>
            <p className="mt-3">
              The Service and its original content (excluding User Content),
              features, and functionality are owned by Crafted &amp; Company
              and are protected by intellectual property laws. You may not copy,
              modify, distribute, or create derivative works based on our
              Service without our prior written consent.
            </p>
          </section>

          {/* 11. Disclaimer of Warranties */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900">
              11. Disclaimer of Warranties
            </h2>
            <p className="mt-3">
              The Service is provided &quot;as is&quot; and &quot;as
              available&quot; without warranties of any kind, either express or
              implied. We do not warrant that the Service will be
              uninterrupted, secure, or error-free. We do not endorse,
              guarantee, or assume responsibility for any services provided by
              Contractors through the platform.
            </p>
          </section>

          {/* 12. Limitation of Liability */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900">
              12. Limitation of Liability
            </h2>
            <p className="mt-3">
              To the maximum extent permitted by law, Crafted &amp; Company
              shall not be liable for any indirect, incidental, special,
              consequential, or punitive damages arising out of your use of the
              Service, including but not limited to damages for loss of profits,
              data, or other intangible losses, even if we have been advised of
              the possibility of such damages.
            </p>
          </section>

          {/* 13. Termination */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900">
              13. Termination
            </h2>
            <p className="mt-3">
              We may suspend or terminate your account and access to the
              Service at our sole discretion, without prior notice, for conduct
              that we determine violates these Terms or is otherwise harmful to
              other users, us, or third parties. You may also delete your
              account at any time through the app settings.
            </p>
          </section>

          {/* 14. Changes to Terms */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900">
              14. Changes to These Terms
            </h2>
            <p className="mt-3">
              We reserve the right to modify these Terms at any time. When we
              make changes, we will update the &quot;Last updated&quot; date at
              the top of this page. Your continued use of the Service after any
              changes constitutes your acceptance of the new Terms.
            </p>
          </section>

          {/* 15. Governing Law */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900">
              15. Governing Law
            </h2>
            <p className="mt-3">
              These Terms shall be governed by and construed in accordance with
              the laws of the State of California, without regard to its
              conflict of law provisions.
            </p>
          </section>

          {/* 16. Contact Us */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900">
              16. Contact Us
            </h2>
            <p className="mt-3">
              If you have any questions about these Terms, please contact us:
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
