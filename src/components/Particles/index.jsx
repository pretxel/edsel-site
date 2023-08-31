import {BrowserView, isMobile} from 'react-device-detect';

const Particles = () => {

    if (isMobile)  return null;

    return (
        <>
        <BrowserView>
        <div id="tsparticles"></div>
        <script is:inline src="/assets/js/particles.min.js"></script>
        <script defer is:inline src="/assets/js/app.js"></script>
        </BrowserView>
        </>
    )
}

export default Particles;