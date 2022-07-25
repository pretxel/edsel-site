import Styles from './styles.module.scss';

function Nav() {
	return (
		<nav className={Styles.nav}>
			<a className={Styles.logolink} href="/">
				<div className={Styles.monogram}>JW</div>
			</a>
			<a className={Styles.link} href="/projects">
				Portfolio
			</a>
		
			
		</nav>
	);
}
export default Nav;
