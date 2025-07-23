import React from "react";
import styles from "./About.module.css";
import lap1 from "../../assets/About/Profile.jpeg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPython, faHtml5, faCss3Alt, faJs, faNodeJs, faReact, faGitAlt } from "@fortawesome/free-brands-svg-icons";
import { faC, faDatabase,} from "@fortawesome/free-solid-svg-icons";
import { FaLeaf } from "react-icons/fa"; // MongoDB (leaf icon)
import { SiTypescript, SiNextdotjs,SiCplusplus } from "react-icons/si"; // TypeScript & Next.js


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
              A passionate software developer with a strong foundation in C++, Data Structures and in MERN Stack. My journey through internships and personal projects has
                developed my ability to build scalable applications and design
                efficient systems.
              </p>
            </div>
          </li>
          <li className={styles.aboutItem}>
            <div className={styles.aboutItemText}>
              <h3>Technical Proficiency</h3>

<strong>Languages:</strong>
<div className={styles.iconGroup}>
  <span><FontAwesomeIcon icon={faC} className={styles.icon} /></span>
  <span><SiCplusplus className={styles.icon} /></span>
  <span><FontAwesomeIcon icon={faPython} className={styles.icon} /> </span>
  <span><FontAwesomeIcon icon={faHtml5} className={styles.icon} /> </span>
  <span><FontAwesomeIcon icon={faCss3Alt} className={styles.icon} /></span>
  <span><FontAwesomeIcon icon={faJs} className={styles.icon} /> </span>
  <span><SiTypescript className={styles.icon} /></span>
</div>

<br />

<strong>Software:</strong>
<div className={styles.iconGroup}>
  <span><FontAwesomeIcon icon={faGitAlt} className={styles.icon} /> Git</span>
  <span><FaLeaf className={styles.icon} /> MongoDB</span>
  <span><FontAwesomeIcon icon={faDatabase} className={styles.icon} /> MySQL</span>
</div>

<br />

<strong>Frameworks:</strong>
<div className={styles.iconGroup}>
  
  <span><SiNextdotjs className={styles.icon} /></span>
  <span><FontAwesomeIcon icon={faReact} className={styles.icon} /></span>
  <span><FontAwesomeIcon icon={faNodeJs} className={styles.icon} /></span>
</div>
                
              
            </div>
          </li>
        </ul>
      </div>
    </section>
  );
};
