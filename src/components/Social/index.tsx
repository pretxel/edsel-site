const Social = () => {
  return (
    <nav>
      <ul>
        <li>
          <a
            href="https://twitter.com/pretxelcom"
            className="fa fa-twitter"
            aria-label="Twitter"
          >
            <span>Twitter</span>
          </a>
        </li>
        <li>
          <a
            href="https://www.facebook.com/serranomontiel"
            aria-label="Facebook"
            className="fa fa-facebook"
          >
            <span>Facebook</span>
          </a>
        </li>
        <li>
          <a
            href="https://github.com/pretxel"
            className="fa fa-github"
            aria-label="Github"
          >
            <span>Github</span>
          </a>
        </li>
        <li>
          <a
            href="https://mx.linkedin.com/in/edselserrano"
            aria-label="Linkedin"
            className="fa fa-linkedin"
          >
            <span>Linkedin</span>
          </a>
        </li>
        <li>
          <a
            href="https://medium.com/@edselserranomontiel"
            aria-label="Medium"
            className="fa fa-medium"
          >
            <span>Medium</span>
          </a>
        </li>
        <li>
          <a
            href="mailto:pretxel100@gmail.com?Subject=Hello"
            aria-label="Email"
            className="fa fa-envelope-o"
          >
            <span>Email</span>
          </a>
        </li>
      </ul>
    </nav>
  );
};

export default Social;
