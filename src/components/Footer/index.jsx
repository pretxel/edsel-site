import Styles from './styles.module.scss';

function Footer() {
	return (
		<footer className={Styles.footer}>
			&copy; {new Date().getFullYear()} Edsel Serrano Montiel
			<small className={Styles.byline}>Built by </small>
		</footer>
	);
}
export default Footer;
