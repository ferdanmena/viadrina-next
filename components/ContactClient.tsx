"use client";

import { useState } from "react";
import { translations } from "@/lib/translations";


type Props = {
    lang: "es" | "en";
};

export default function ContactClient({ lang }: Props) {
    const t = translations[lang];

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        const res = await fetch("/api/contact", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ name, email, message }),
        });

        const data = await res.json();

        if (data.success) {
            alert("Message sent successfully");
            setName("");
            setEmail("");
            setMessage("");
        } else {
            alert("Error sending message");
        }

        console.log("LANG:", lang);
        console.log("PLACEHOLDER NAME:", t.phcontactName);
    }

    return (
        <>
            <div className="contact-hero">
                <div className="contact-hero-content container">
                    <h1>{t.contactTitle}</h1>
                    <p className="contact-subtitle">
                        {t.contactSubtitle}
                    </p>
                </div>
                <span className="contact-tooltip">{t.contactTooltip}</span>
            </div>

            <section className="contact container">
                <div className="contact-grid">

                    {/* LEFT SIDE */}
                    <div className="contact-info">
                        

                        <div className="contact-details">
                            <div>
                                <strong>Email</strong>
                                <span>info@viadrinatours.com</span>
                            </div>

                            <div>
                                <strong>{lang === "es" ? "Ubicación" : "Location"}</strong>
                                <span>Wrocław, Poland</span>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT SIDE */}
                    <div className="contact-card">
                        <form onSubmit={handleSubmit} className="contact-form">

                            <div className="field">
                                <label>{t.contactName}</label>
                                <input
                                    type="text"
                                    placeholder={t.phcontactName}
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="field">
                                <label>{t.contactEmail}</label>
                                <input
                                    type="email"
                                    placeholder={t.phEmail}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="field">
                                <label>{t.contactMessage}</label>
                                <textarea
                                    rows={5}
                                    placeholder={t.phMessage}
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    required
                                />
                            </div>

                            <button type="submit" className="btn-primary">
                                {t.contactSend}
                            </button>

                        </form>
                    </div>

                </div>
            </section>
        </>

    );

}