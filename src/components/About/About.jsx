import React from "react";
import styles from "./About.module.css";
import lap1 from "../../assets/About/Profile.jpeg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPython, faJava, faHtml5, faCss3Alt, faJs, faNodeJs, faReact, faGitAlt } from "@fortawesome/free-brands-svg-icons";
import { faC, faDatabase,} from "@fortawesome/free-solid-svg-icons";

export const About = () => {
  return (
    <section className={styles.container} id="about">
      <h2 className={styles.title}>About</h2>
      <div className={styles.content}>
        <img
          src={lap1}
          alt="Me sitting with a laptop"
          className={styles.aboutImage}
        />
        <ul className={styles.aboutItems}>
          <li className={styles.aboutItem}>
            <div className={styles.aboutItemText}>
              <h3>About Me</h3>
              <p>
              A passionate software developer with a strong foundation in Java, Python and in MERN Stack. My journey through internships and personal projects has
                developed my ability to build scalable applications and design
                efficient systems.
              </p>
            </div>
          </li>
          <li className={styles.aboutItem}>
            <div className={styles.aboutItemText}>
              <h3>Technical Proficiency</h3>

                  <strong>Languages:</strong>
                  <FontAwesomeIcon icon={faC} className={styles.icon} />
                  <FontAwesomeIcon icon={faJava} className={styles.icon} />
                  <FontAwesomeIcon icon={faPython} className={styles.icon} />
                  <FontAwesomeIcon icon={faHtml5} className={styles.icon} />
                  <FontAwesomeIcon icon={faCss3Alt} className={styles.icon} />
                  <FontAwesomeIcon icon={faJs} className={styles.icon} />
                  <br/>
                  <strong>Software:</strong>
                  <FontAwesomeIcon icon={faGitAlt} className={styles.icon} />
                  <FontAwesomeIcon icon={faDatabase} className={styles.icon} />MongoDB
                  <br/>
                  <strong>Frameworks:</strong>
                  <FontAwesomeIcon icon={faReact} className={styles.icon} /> 
                  <FontAwesomeIcon icon={faNodeJs} className={styles.icon} /> 
                
              
            </div>
          </li>
        </ul>
      </div>
    </section>
  );
};
