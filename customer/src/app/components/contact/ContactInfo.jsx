import {
    FiClock,
    FiMail,
    FiMapPin,
    FiPhone,
} from "react-icons/fi";
import {
    contactDetails,
} from "../../data/contactData";
const contactItems = [
    {
        icon: FiPhone,
        label: "Call Us",
        value: contactDetails.phoneDisplay,
        description:
            "Speak to our team for products, services or general enquiries.",
        href: `tel:${contactDetails.phoneLink}`,
    },
    {
        icon: FiMail,
        label: "Email Us",
        value: contactDetails.email,
        description:
            "Send us your enquiry and our team will get back to you.",
        href: `mailto:${contactDetails.email}`,
    },
    {
        icon: FiMapPin,
        label: "Visit Us",
        value: contactDetails.address,
        description:
            "Visit our showroom and service centre.",
    },
    {
        icon: FiClock,
        label: "Business Hours",
        value: contactDetails.businessHours,
        description:
            "We're available during our regular working hours.",
    },
];
export default function ContactInfo() {
    return (
        <div className="space-y-3">
            {contactItems.map((item) => {
                const Icon = item.icon;
                const content = (
                    <div
                        className="
                            group
                            flex
                            gap-4
                            rounded-xl
                            border
                            border-[var(--border)]
                            bg-white
                            p-4
                            transition-all
                            duration-300
                            hover:border-[var(--brand-gold)]
                            hover:shadow-sm
                            sm:p-5
                        "
                    >
                        <div
                            className="
                                flex
                                h-11
                                w-11
                                shrink-0
                                items-center
                                justify-center
                                rounded-full
                                bg-[var(--brand-gold-light)]
                                text-[var(--brand-black)]
                            "
                        >
                            <Icon size={19} />
                        </div>
                        <div className="min-w-0">
                            <p
                                className="
                                    text-[9px]
                                    font-bold
                                    uppercase
                                    tracking-[0.08em]
                                    text-[var(--brand-gold-dark)]
                                "
                            >
                                {item.label}
                            </p>
                            <p
                                className="
                                    mt-1
                                    text-sm
                                    font-bold
                                    text-[var(--text-primary)]
                                "
                            >
                                {item.value}
                            </p>
                            <p
                                className="
                                    mt-1
                                    text-xs
                                    leading-5
                                    text-[var(--text-secondary)]
                                "
                            >
                                {item.description}
                            </p>
                        </div>
                    </div>
                );
                if (item.href) {
                    return (
                        <a
                            key={item.label}
                            href={item.href}
                            className="block"
                        >
                            {content}
                        </a>
                    );
                }
                return (
                    <div key={item.label}>
                        {content}
                    </div>
                );
            })}
        </div>
    );
}