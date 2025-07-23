import React from "react";

import styles from "./ProjectCard.module.css";
import chat from '../../assets/Projects/chatbot.png';
import cry from '../../assets/Projects/OIP.jpg';
import tod from '../../assets/Projects/react.png';

function findA(ad) {
  if (ad === "tod") {
    return tod;
  }
  if (ad === "cry") {
    return cry;
  }
  if (ad === "chat") {
    return chat;
  }
}

export const ProjectCard = ({
  project: { title, imageSrc, description, skills, source },
}) => {
    
const k = findA(imageSrc);
  return (    
    <div className={styles.container}>
      <img
        src={k}
        alt={`Image of ${title}`}
        className={styles.image}
      />
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.description}>{description}</p>
      <ul className={styles.skills}>
        {skills.map((skill, id) => {
          return (
            <li key={id} className={styles.skill}>
              {skill}
            </li>
          );
        })}
      </ul>
      <div className={styles.links}>
        <a href={source} className={styles.link}>
          Source
        </a>
      </div>
    </div>
  );
};
