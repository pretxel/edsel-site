import Styles from './styles.module.scss';

function Nav() {
	return (
		<nav className={Styles.nav}>
			{/* <a className={Styles.logolink} href="/">
				<div className={Styles.monogram}>ED</div>
			</a> */}
			<a className={Styles.link} href="/blog">
				Blog
			</a>
		
			
		</nav>
	);
}
export default Nav;
