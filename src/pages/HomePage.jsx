import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

/* ─── tiny helpers ─────────────────────────────────────── */
const useCountUp = (target, duration = 2000, start = false) => {
    const [count, setCount] = useState(0);
    useEffect(() => {
        if (!start) return;
        let startTime = null;
        const step = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            setCount(Math.floor(progress * target));
            if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }, [target, duration, start]);
    return count;
};

/* ─── data ─────────────────────────────────────────────── */
const NAV_LINKS = [
    { label: 'Fonctionnalités', href: '#features' },
    { label: 'Statistiques', href: '#stats' },
    { label: 'Tarifs', href: '#pricing' },
    { label: 'Témoignages', href: '#testimonials' },
    { label: 'Contact', href: '#contact' },
];

const FEATURES = [
    {
        icon: '🛍️',
        title: 'Catalogue Intelligent',
        desc: 'Gérez des milliers de produits avec catégories, variantes et inventaire en temps réel — tout en un seul endroit.',
    },
    {
        icon: '📊',
        title: 'Analytics Avancés',
        desc: "Tableaux de bord interactifs avec insights sur les ventes, le comportement client et les tendances du marché.",
    },
    {
        icon: '💬',
        title: 'Messagerie Intégrée',
        desc: "Communiquez directement avec vos clients et partenaires grâce à notre système de messagerie en temps réel.",
    },
    {
        icon: '🚚',
        title: 'Gestion des Commandes',
        desc: "Suivez chaque commande de la confirmation à la livraison avec des notifications automatiques pour vos clients.",
    },
    {
        icon: '🔐',
        title: 'Sécurité Maximale',
        desc: 'Authentification multi-facteurs, chiffrement des données et conformité RGPD pour protéger votre activité.',
    },
    {
        icon: '🌍',
        title: 'Marketplace Multi-Vendeurs',
        desc: "Accédez à un réseau de vendeurs qualifiés et élargissez votre portée à travers toute la région.",
    },
];

const STATS = [
    { value: 12000, suffix: '+', label: 'Vendeurs Actifs' },
    { value: 98, suffix: '%', label: 'Satisfaction Client' },
    { value: 500, suffix: 'K+', label: 'Produits Listés' },
    { value: 3, suffix: 'M+', label: 'Transactions / An' },
];

const TESTIMONIALS = [
    {
        name: 'Amira Bensalem',
        role: 'Directrice E-Commerce, TechShop DZ',
        avatar: 'AB',
        rating: 5,
        text: "Depuis que nous avons rejoint cette marketplace, notre chiffre d'affaires a augmenté de 340%. L'interface est intuitive et le support est exceptionnel.",
        color: '#6366f1',
    },
    {
        name: 'Karim Medjani',
        role: 'Fondateur, BootiqueMode',
        avatar: 'KM',
        rating: 5,
        text: "Le meilleur investissement pour notre boutique en ligne. Les analytics nous permettent de prendre des décisions éclairées en temps réel.",
        color: '#8b5cf6',
    },
    {
        name: 'Nadia Oukaci',
        role: 'Responsable Ventes, Electro Plus',
        avatar: 'NO',
        rating: 5,
        text: "La gestion des commandes et la messagerie intégrée ont transformé notre relation client. Un outil indispensable pour tout e-commerçant sérieux.",
        color: '#a78bfa',
    },
];

const PRICING = [
    {
        name: 'Starter',
        price: '0',
        period: '/ mois',
        highlight: false,
        features: [
            '50 produits max',
            '1 compte vendeur',
            'Analytics basiques',
            'Support par email',
            'Commission 5%',
        ],
        cta: "Commencer Gratuitement",
        to: '/register',
    },
    {
        name: 'Pro',
        price: '2 900',
        period: 'DA / mois',
        highlight: true,
        badge: '⭐ Populaire',
        features: [
            'Produits illimités',
            '5 comptes vendeurs',
            'Analytics avancés',
            'Support prioritaire 24/7',
            'Commission 3%',
            'Messagerie intégrée',
            'Rapports personnalisés',
        ],
        cta: 'Démarrer l\'essai 14 jours',
        to: '/register',
    },
    {
        name: 'Entreprise',
        price: 'Sur mesure',
        period: '',
        highlight: false,
        features: [
            'Tout en illimité',
            'Comptes vendeurs illimités',
            'API & intégrations',
            'Manager dédié',
            'Commission négociable',
            'SLA garanti 99.9%',
            'Formation incluse',
        ],
        cta: 'Contacter les ventes',
        to: '#contact',
    },
];

const FAQS = [
    {
        q: 'Comment puis-je créer mon compte vendeur ?',
        a: "Cliquez sur «S'inscrire», renseignez vos informations et votre boutique sera opérationnelle en moins de 5 minutes.",
    },
    {
        q: 'Y a-t-il une période d\'essai gratuite ?',
        a: 'Oui ! Le plan Pro inclut un essai gratuit de 14 jours sans carte bancaire requise.',
    },
    {
        q: 'Quels modes de paiement acceptez-vous ?',
        a: 'Nous acceptons les virements bancaires, CIB, Dahabia et le paiement à la livraison selon les régions.',
    },
    {
        q: 'Comment fonctionne le support technique ?',
        a: 'Notre équipe est disponible 7j/7 via chat, email et téléphone pour les abonnés Pro et Entreprise.',
    },
];

/* ─── sub-components ────────────────────────────────────── */

const Navbar = ({ scrolled }) => (
    <nav className={`hp-nav ${scrolled ? 'hp-nav--scrolled' : ''}`}>
        <div className="hp-nav__inner">
            <Link to="/" className="hp-nav__logo">
                <span className="hp-logo-icon">🏪</span>
                <span>Market<strong>Place</strong></span>
            </Link>

            <ul className="hp-nav__links">
                {NAV_LINKS.map((l) => (
                    <li key={l.label}>
                        <a href={l.href} className="hp-nav__link">{l.label}</a>
                    </li>
                ))}
            </ul>

            <div className="hp-nav__actions">
                <Link to="/login" className="hp-btn hp-btn--ghost">Connexion</Link>
                <Link to="/register" className="hp-btn hp-btn--primary">S'inscrire</Link>
            </div>
        </div>
    </nav>
);

const HeroSection = () => {
    const [typed, setTyped] = useState('');
    const words = ['Vendez Plus.', 'Grandissez Vite.', 'Réussissez Ensemble.'];
    const [wi, setWi] = useState(0);

    useEffect(() => {
        let ci = 0;
        let direction = 1;
        const currentWord = words[wi];
        const interval = setInterval(() => {
            if (direction === 1) {
                setTyped(currentWord.slice(0, ci + 1));
                ci++;
                if (ci === currentWord.length) {
                    direction = -1;
                    setTimeout(() => { }, 1000);
                }
            } else {
                setTyped(currentWord.slice(0, ci - 1));
                ci--;
                if (ci === 0) {
                    direction = 1;
                    setWi((p) => (p + 1) % words.length);
                    clearInterval(interval);
                }
            }
        }, 80);
        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [wi]);

    return (
        <section className="hp-hero">
            {/* animated blobs */}
            <div className="hp-blob hp-blob--1" />
            <div className="hp-blob hp-blob--2" />
            <div className="hp-blob hp-blob--3" />

            <div className="hp-hero__content">
                <div className="hp-hero__badge">
                    <span className="hp-badge-dot" />
                    Plateforme #1 en Algérie
                </div>

                <h1 className="hp-hero__title">
                    La Marketplace qui vous aide à
                    <br />
                    <span className="hp-gradient-text">{typed}<span className="hp-cursor">|</span></span>
                </h1>

                <p className="hp-hero__subtitle">
                    Rejoignez plus de <strong> vendeurs</strong> qui font confiance à notre plateforme
                    pour gérer, développer et optimiser leurs ventes en ligne — tout en un.
                </p>

                <div className="hp-hero__cta">
                    <Link to="/register" className="hp-btn hp-btn--hero">
                        Créer mon compte gratuitement
                        <span className="hp-btn-arrow">→</span>
                    </Link>
                    <a href="#features" className="hp-btn hp-btn--watch">
                        <span className="hp-play-icon">▶</span>
                        Voir la démo
                    </a>
                </div>

                <div className="hp-hero__trust">
                    <div className="hp-avatars">
                        {['👩‍💼', '👨‍💻', '👩‍🔬', '👨‍💼', '👩‍🎨'].map((a, i) => (
                            <span key={i} className="hp-avatar" style={{ zIndex: 5 - i }}>{a}</span>
                        ))}
                    </div>
                    <p><strong>+500 vendeurs</strong> ont rejoint cette semaine</p>
                </div>
            </div>

            <div className="hp-hero__mockup">
                <div className="hp-mockup-card hp-mockup-card--main">
                    <div className="hp-mockup-header">
                        <div className="hp-dot r" /><div className="hp-dot y" /><div className="hp-dot g" />
                        <span>Dashboard — Vue d'ensemble</span>
                    </div>
                    <div className="hp-mockup-body">
                        <div className="hp-kpi-row">
                            {[
                                { label: 'Ventes', value: '842 500 DA', trend: '+24%', up: true },
                                { label: 'Commandes', value: '1 247', trend: '+12%', up: true },
                            ].map((k) => (
                                <div className="hp-kpi" key={k.label}>
                                    <span className="hp-kpi__label">{k.label}</span>
                                    <span className="hp-kpi__value">{k.value}</span>
                                    <span className={`hp-kpi__trend ${k.up ? 'up' : 'down'}`}>{k.trend}</span>
                                </div>
                            ))}
                        </div>
                        <div className="hp-chart">
                            {[40, 65, 50, 80, 60, 90, 75, 95, 70, 85, 60, 100].map((h, i) => (
                                <div key={i} className="hp-bar" style={{ height: `${h}%`, animationDelay: `${i * 0.08}s` }} />
                            ))}
                        </div>
                        <div className="hp-product-list">
                            {['Nike Air Max 270', 'Samsung Galaxy S24', 'MacBook Pro 14"'].map((p) => (
                                <div className="hp-product-item" key={p}>
                                    <span className="hp-product-dot" />
                                    <span className="hp-product-name">{p}</span>
                                    <span className="hp-product-badge">En stock</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="hp-mockup-card hp-mockup-card--small hp-mockup-card--notify">
                    <span className="hp-notify-icon">🔔</span>
                    <div>
                        <p className="hp-notify-title">Nouvelle commande !</p>
                        <p className="hp-notify-sub">Air Max — il y a 2 min</p>
                    </div>
                </div>

                <div className="hp-mockup-card hp-mockup-card--small hp-mockup-card--rating">
                    <span>⭐⭐⭐⭐⭐</span>
                    <p>Excellent service client</p>
                </div>
            </div>
        </section>
    );
};

const StatsSection = () => {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.3 });
        if (ref.current) obs.observe(ref.current);
        return () => obs.disconnect();
    }, []);
    const counts = STATS.map((s) => useCountUp(s.value, 2000, visible)); // eslint-disable-line react-hooks/rules-of-hooks

    return (
        <section id="stats" className="hp-stats" ref={ref}>
            <div className="hp-container">
                <div className="hp-stats__grid">
                    {STATS.map((s, i) => (
                        <div className="hp-stat" key={s.label}>
                            <span className="hp-stat__value">
                                {counts[i].toLocaleString('fr-FR')}{s.suffix}
                            </span>
                            <span className="hp-stat__label">{s.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const FeaturesSection = () => (
    <section id="features" className="hp-features">
        <div className="hp-container">
            <div className="hp-section-header">
                <span className="hp-section-tag">✨ Fonctionnalités</span>
                <h2 className="hp-section-title">Tout ce dont vous avez besoin pour réussir</h2>
                <p className="hp-section-sub">
                    Une suite complète d'outils professionnels conçus pour les vendeurs ambitieux.
                </p>
            </div>
            <div className="hp-features__grid">
                {FEATURES.map((f) => (
                    <div className="hp-feature-card" key={f.title}>
                        <div className="hp-feature-icon">{f.icon}</div>
                        <h3 className="hp-feature-title">{f.title}</h3>
                        <p className="hp-feature-desc">{f.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    </section>
);

const PricingSection = () => (
    <section id="pricing" className="hp-pricing">
        <div className="hp-container">
            <div className="hp-section-header">
                <span className="hp-section-tag">💰 Tarifs</span>
                <h2 className="hp-section-title">Des plans pour chaque ambition</h2>
                <p className="hp-section-sub">Commencez gratuitement, évoluez quand vous êtes prêt.</p>
            </div>
            <div className="hp-pricing__grid">
                {PRICING.map((p) => (
                    <div className={`hp-pricing-card ${p.highlight ? 'hp-pricing-card--highlight' : ''}`} key={p.name}>
                        {p.badge && <span className="hp-pricing-badge">{p.badge}</span>}
                        <h3 className="hp-pricing-name">{p.name}</h3>
                        <div className="hp-pricing-price">
                            <span className="hp-pricing-amount">{p.price}</span>
                            <span className="hp-pricing-period">{p.period}</span>
                        </div>
                        <ul className="hp-pricing-features">
                            {p.features.map((f) => (
                                <li key={f}><span className="hp-check">✓</span> {f}</li>
                            ))}
                        </ul>
                        <Link
                            to={p.to.startsWith('/') ? p.to : '/register'}
                            className={`hp-btn hp-pricing-cta ${p.highlight ? 'hp-btn--primary' : 'hp-btn--outline'}`}
                        >
                            {p.cta}
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    </section>
);

const TestimonialsSection = () => {
    const [active, setActive] = useState(0);
    useEffect(() => {
        const t = setInterval(() => setActive((p) => (p + 1) % TESTIMONIALS.length), 5000);
        return () => clearInterval(t);
    }, []);

    return (
        <section id="testimonials" className="hp-testimonials">
            <div className="hp-container">
                <div className="hp-section-header">
                    <span className="hp-section-tag">💬 Témoignages</span>
                    <h2 className="hp-section-title">Ce que disent nos vendeurs</h2>
                </div>
                <div className="hp-testimonials__slider">
                    {TESTIMONIALS.map((t, i) => (
                        <div key={t.name} className={`hp-testimonial ${i === active ? 'hp-testimonial--active' : ''}`}>
                            <div className="hp-testimonial__stars">{'⭐'.repeat(t.rating)}</div>
                            <p className="hp-testimonial__text">"{t.text}"</p>
                            <div className="hp-testimonial__author">
                                <div className="hp-testimonial__avatar" style={{ background: t.color }}>{t.avatar}</div>
                                <div>
                                    <strong>{t.name}</strong>
                                    <span>{t.role}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                    <div className="hp-testimonial__dots">
                        {TESTIMONIALS.map((_, i) => (
                            <button key={i} className={`hp-dot-btn ${i === active ? 'hp-dot-btn--active' : ''}`} onClick={() => setActive(i)} />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

const FAQSection = () => {
    const [open, setOpen] = useState(null);
    return (
        <section className="hp-faq">
            <div className="hp-container hp-container--narrow">
                <div className="hp-section-header">
                    <span className="hp-section-tag">❓ FAQ</span>
                    <h2 className="hp-section-title">Questions fréquentes</h2>
                </div>
                <div className="hp-faq__list">
                    {FAQS.map((f, i) => (
                        <div className={`hp-faq-item ${open === i ? 'hp-faq-item--open' : ''}`} key={i}>
                            <button className="hp-faq-q" onClick={() => setOpen(open === i ? null : i)}>
                                {f.q}
                                <span className="hp-faq-arrow">{open === i ? '▲' : '▼'}</span>
                            </button>
                            <p className="hp-faq-a">{f.a}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const CTASection = () => (
    <section className="hp-cta">
        <div className="hp-blob hp-blob--cta1" />
        <div className="hp-blob hp-blob--cta2" />
        <div className="hp-container hp-container--center">
            <h2 className="hp-cta__title">Prêt à transformer votre activité ?</h2>
            <p className="hp-cta__sub">
                Rejoignez des milliers d'entrepreneurs qui font confiance à notre plateforme. Démarrez gratuitement, sans carte bancaire.
            </p>
            <div className="hp-cta__btns">
                <Link to="/register" className="hp-btn hp-btn--hero">Créer mon comte gratuit →</Link>
                <Link to="/login" className="hp-btn hp-btn--ghost-light">J'ai déjà un compte</Link>
            </div>
            <p className="hp-cta__note">✅ Sans engagement &nbsp;·&nbsp; ✅ 14 jours d'essai gratuit &nbsp;·&nbsp; ✅ Support 24/7</p>
        </div>
    </section>
);

const FooterSection = () => (
    <footer id="contact" className="hp-footer">
        <div className="hp-container hp-footer__grid">
            <div className="hp-footer__brand">
                <Link to="/" className="hp-nav__logo hp-footer__logo">
                    <span className="hp-logo-icon">🏪</span>
                    <span>Market<strong>Place</strong></span>
                </Link>
                <p>La plateforme marketplace professionnelle qui connecte vendeurs et acheteurs à travers toute l'Algérie.</p>
                <div className="hp-socials">
                    {['𝕏', 'in', 'f', '▶'].map((s, i) => <a key={i} href="#!" className="hp-social">{s}</a>)}
                </div>
            </div>

            {[
                { title: 'Produit', links: ['Fonctionnalités', 'Tarifs', 'API', 'Changelog'] },
                { title: 'Entreprise', links: ['À propos', 'Blog', 'Carrières', 'Presse'] },
                { title: 'Support', links: ['Documentation', 'Contact', 'Statut', 'Politique de confidentialité'] },
            ].map((col) => (
                <div className="hp-footer__col" key={col.title}>
                    <h4>{col.title}</h4>
                    <ul>
                        {col.links.map((l) => <li key={l}><a href="#!">{l}</a></li>)}
                    </ul>
                </div>
            ))}

            <div className="hp-footer__col">
                <h4>Newsletter</h4>
                <p>Recevez nos conseils e-commerce chaque semaine.</p>
                <div className="hp-newsletter">
                    <input type="email" placeholder="votre@email.com" />
                    <button className="hp-btn hp-btn--primary">→</button>
                </div>
            </div>
        </div>
        <div className="hp-footer__bottom">
            <p>© 2025 MarketPlace. Tous droits réservés.</p>
            <p>Fait avec ❤️ en Algérie</p>
        </div>
    </footer>
);

/* ─── page root ─────────────────────────────────────────── */
export default function HomePage() {
    const [scrolled, setScrolled] = useState(false);
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <div className="hp-root">
            <Navbar scrolled={scrolled} />
            <HeroSection />
            <StatsSection />
            <FeaturesSection />
            <PricingSection />
            <TestimonialsSection />
            <FAQSection />
            <CTASection />
            <FooterSection />
        </div>
    );
}
