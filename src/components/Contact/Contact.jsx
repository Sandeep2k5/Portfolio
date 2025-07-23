import React from "react";
import styles from "./Contact.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLinkedinIn, faGithub } from "@fortawesome/free-brands-svg-icons";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";

export const Contact = () => {
  return (
    <footer id="contact" className={styles.container}>
      <div className={styles.text}>
        <h2>Contact</h2>
      </div>
      <ul className={styles.links}>
        <li className={styles.link}>
          <FontAwesomeIcon icon={faEnvelope} className={styles.icon}></FontAwesomeIcon>
          <a href="sandeeputhayakumar@gmail.com">Mail</a>
        </li>
        <li className={styles.link}>
          <FontAwesomeIcon icon={faLinkedinIn} className={styles.icon} />
          <a href="https://www.linkedin.com/in/sandeep-uthayakumar-8b7242255/" target="_blank" rel="noopener noreferrer">LinkedIn
          </a>
        </li>
        <li className={styles.link}>
          <FontAwesomeIcon icon={faGithub} className={styles.icon} />
          <a href="https://github.com/Sandeep2k5" target="_blank" rel="noopener noreferrer">GitHub
          </a>
        </li>
      </ul>
    </footer>
  );
};

export default Contact;