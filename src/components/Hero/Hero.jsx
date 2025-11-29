import React from "react";

import styles from "./Hero.module.css";
import ss1 from '../../assets//Hero/123.jpg';
import resumePdf from '../../assets//Hero/Sandeep_Resume.pdf';

export const Hero = () => {
  return (
    <section className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>Hi,I'm Sandeep</h1>
        <p className={styles.description}>
         A curious software developer with a strong foundation in C++, DSA and in MERN Stack.
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

