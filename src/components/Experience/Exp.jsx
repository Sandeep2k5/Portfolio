import React from "react";
import styles from "./Experience.module.css";

const experienceData = [
  {
    company: "VidyaInternahub",
    duration: "May’25 – July’25",
    role: "Backend Developer Intern",
    details: [
      "Worked on CRM System Backend API to improve server-side stability and reduce server response time.",
    ],
  },
  {
    company: "National Institute of Technology, Puducherry",
    duration: "Sep’23 – Dec’23",
    role: "Research Intern", 
    details: [
      "Built a Python-based cryptocurrency wallet using blockchain integration with PyQt5 for GUI.",
      "Features included account creation, balance viewing, and transaction capabilities.",
    ],
  },
];

export const Exp = () => {
  console.log("Experience component rendered");
  return (
    
    <div id = "Exp" className={styles.wrapper}>
      <h2 className={styles.heading}>Internships</h2>
      <div className={styles.projects}> {/* Card wrapper like in Projects */}
        {experienceData.map((exp, index) => (
          <div className={styles.container} key={index}>
            <h3 className={styles.title}>{exp.company}</h3>
            <p className={styles.duration}>{exp.duration}</p>
            <p className={styles.role}>{exp.role}</p>
            {exp.objective && (
              <p className={styles.meta}><strong>Objective:</strong> {exp.objective}</p>
            )}
            {exp.team && (
              <p className={styles.meta}><strong>{exp.team}</strong></p>
            )}
            <ul className={styles.details}>
              {exp.details.map((item, id) => (
                <li key={id}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};
