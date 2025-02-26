import React from "react";

import styles from "./Hero.module.css";
import ss1 from '../../assets//Hero/file.png';

export const Hero = () => {
  return (
    <section className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>Hi, Sandeep</h1>
        <p className={styles.description}>
         A passionate software developer with a strong foundation in Java, Python and in MERN Stack.
        </p>
        <a href={"https://drive.google.com/file/d/1YLySwAcu0SsxFSmUPF2TkU_EonKwEvTZ/view?usp=sharing"} className={styles.contactBtn}>
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
