import React from "react";
import styles from "../Experience/Experience.module.css";
import im1 from "./react.png";
import im2 from "./pub2.png";

const publicationData = [
  {
    image: im1,
    title: "APK Malware Detection and Family Prediction Using CNN-LSTM and RF Classifiers",
    journal: "IEEE Access",
    year: "2025",
    source: "https://ieeexplore.ieee.org/Xplore/home.jsp",
  },
  {
    image: im2,
    title: "Multi-Head Attention Transformer for Text2Text Translation",
    journal: "Science Direct",
    year: "2025",
    source: "https://www.sciencedirect.com/science/article/pii/S1877050925015509",
  },
];

export const Pub = () => {
  return (
    <div id="Pub" className={styles.wrapper}>
      <h2 className={styles.heading}>Publications</h2>
      <div className={styles.projects}>
        {publicationData.map((pub, index) => (
          <div className={styles.container} key={index}>
            {pub.image && (
              <img
                src={pub.image}
                alt={pub.title}
                className={styles.image}
              />
            )}
            <h3 className={styles.title}>{pub.title}</h3>
            <p className={styles.role}>{pub.journal}</p>
            <p className={styles.duration}>{pub.year}</p>
            {pub.source && (
              <div className={styles.links}>
                <a
                  href={pub.source}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.link}
                >
                  Source
                </a>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
