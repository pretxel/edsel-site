import ParticlesV2 from "./v2";


const ParticlesContainer = ({totalParticles}) => {

    let content = [];
    for(let i = 0; i < totalParticles; i++) {
        content.push(<ParticlesV2 key={i} />)
    }

    return  content
 
}

export default ParticlesContainer;