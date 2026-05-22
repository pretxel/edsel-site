import Styles from './styles.module.scss';

/**
 * Top-of-page navigation used on the homepage and any future legacy pages.
 *
 * The link copy is bilingual: a `lang` prop drives whether the Spanish or
 * English labels render, and (for `en`) the URLs are prefixed with `/en`.
 *
 * Owned by agent 06-new-pages. Agent 04 reuses this component as-is on the
 * homepage, so any tweaks should preserve the existing class hooks.
 */
function Nav({ lang = 'es' } = {}) {
	const isEnglish = lang === 'en';
	const prefix = isEnglish ? '/en' : '';

	const links = isEnglish
		? [
				{ href: `${prefix}/`, label: 'Home' },
				{ href: `${prefix}/projects`, label: 'Projects' },
				{ href: `${prefix}/about`, label: 'About' },
		  ]
		: [
				{ href: `${prefix}/`, label: 'Inicio' },
				{ href: `${prefix}/projects`, label: 'Proyectos' },
				{ href: `${prefix}/about`, label: 'Sobre mí' },
		  ];

	return (
		<nav className={Styles.nav} aria-label="Primary">
			{links.map((link) => (
				<a key={link.href} className={Styles.link} href={link.href}>
					{link.label}
				</a>
			))}
		</nav>
	);
}

export default Nav;
