import ContactInfo from "./ContactInfo";
import ContactForm from "./ContactForm";
export default function ContactSection() {
    return (
        <section
            className="
                bg-[var(--brand-cream)]
                py-14
                sm:py-16
                lg:py-20
            "
        >
            <div className="section-container">
                <div
                    className="
                        grid
                        gap-8
                        lg:grid-cols-[0.8fr_1.2fr]
                        lg:gap-12
                        xl:grid-cols-[0.75fr_1.25fr]
                        xl:gap-16
                    "
                >
                    {/* CONTACT INFO */}
                    <div>
                        <p
                            className="
                                text-[10px]
                                font-bold
                                uppercase
                                tracking-[0.1em]
                                text-[var(--brand-gold-dark)]
                            "
                        >
                            We&apos;re here to help
                        </p>
                        <h2
                            className="
                                mt-3
                                max-w-[460px]
                                text-[32px]
                                font-extrabold
                                leading-[1.05]
                                tracking-[-0.03em]
                                text-[var(--text-primary)]
                                sm:text-[38px]
                                lg:text-[42px]
                            "
                        >
                            Everything you need,
                            <span className="block">
                                one conversation away.
                            </span>
                        </h2>
                        <div className="mt-8">
                            <ContactInfo />
                        </div>
                    </div>
                    {/* FORM */}
                    <div>
                        <ContactForm />
                    </div>
                </div>
            </div>
        </section>
    );
}