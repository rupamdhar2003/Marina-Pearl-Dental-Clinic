import './Legal.css';

export default function Privacy() {
    return (
        <section className="mp-legal">
            <div className="mp-container mp-legal__inner">
                <span className="mp-eyebrow">Privacy</span>
                <h1>Privacy Policy</h1>
                <p className="mp-legal__meta">Last updated: January 2026</p>

                <p>
                    Marina Pearl Dental Clinic (&quot;we&quot;, &quot;us&quot;) collects personal data to manage your dental
                    care and administer your appointments. This policy explains what we collect, why, and your rights under
                    the UAE Federal Decree-Law No. 45 of 2021 on the Protection of Personal Data (PDPL).
                </p>

                <h2>1. What we collect</h2>
                <ul>
                    <li>Contact details: your name, email, and phone number.</li>
                    <li>Appointment records: date, time, service, and clinician you were seen by.</li>
                    <li>Clinical notes recorded by our dentists during treatment (held under separate clinical records).</li>
                    <li>Communication history: enquiries you send through our website or WhatsApp.</li>
                </ul>

                <h2>2. Why we collect it</h2>
                <ul>
                    <li>To schedule and confirm your appointment.</li>
                    <li>To provide continuity of care between visits.</li>
                    <li>To respond to your enquiries and remind you of upcoming visits.</li>
                    <li>To comply with our legal obligations as a licensed dental clinic.</li>
                </ul>

                <h2>3. Consent</h2>
                <p>
                    By checking the consent box during booking, you agree to Marina Pearl Dental collecting and processing
                    the personal data you provide for the purposes above. You can withdraw consent at any time by contacting
                    us — see section 6.
                </p>

                <h2>4. Sharing</h2>
                <p>
                    We do not sell your personal data. We may share data with:
                </p>
                <ul>
                    <li>Your insurance provider, only when you explicitly ask us to direct-bill a claim.</li>
                    <li>Vendors who help us run the clinic (email, appointment SMS, secure record hosting), under
                        data-processing agreements.</li>
                    <li>UAE authorities, when required by law.</li>
                </ul>

                <h2>5. Storage &amp; retention</h2>
                <p>
                    Clinical records are held for a minimum period required by DHA regulations. Marketing communications
                    are stored only while you remain opted in. All personal data is stored on infrastructure with encryption
                    at rest and in transit.
                </p>

                <h2>6. Your rights</h2>
                <p>Under the PDPL you may:</p>
                <ul>
                    <li>Ask what personal data we hold about you.</li>
                    <li>Ask us to correct anything inaccurate.</li>
                    <li>Ask us to delete data we hold, subject to our record-keeping obligations.</li>
                    <li>Withdraw consent for marketing communications at any time.</li>
                </ul>
                <p>
                    To exercise these rights, email us at{' '}
                    <a href="mailto:hello@marinapearldental.example">hello@marinapearldental.example</a>.
                </p>

                <h2>7. Cookies</h2>
                <p>
                    Our website uses only functional cookies (to remember your language preference and keep you signed in).
                    We do not use tracking or advertising cookies.
                </p>

                <h2>8. Contact</h2>
                <p>
                    Data Protection Officer, Marina Pearl Dental Clinic, Marina Plaza, Level 12, Dubai Marina, UAE.
                    Phone: +971 4 000 0000.
                </p>
            </div>
        </section>
    );
}
