import React from "react";

import styles from "./Hero.module.css";
import ss1 from '../../assets//Hero/file.png';
import resumePdf from '../../assets/Hero/Academic_resume.pdf';

export const Hero = () => {
  return (
    <section className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>Hi, Sandeep</h1>
        <p className={styles.description}>
         A passionate software developer with a strong foundation in Java, Python and in MERN Stack.
        </p>
        <a href={resumePdf} className={styles.contactBtn}>
          Download My Resume
        </a>
      </div>
      <img
        src={ss1}
        alt="An image of me"
        className={styles.heroImg}
      />
      <div className={styles.topBlur} />
      <div className={styles.bottomBlur} />
    </section>
  );
};
