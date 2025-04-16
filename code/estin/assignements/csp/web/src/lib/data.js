const cs_courses = [
  { id: 1, name: "Sécurité", type: "Lecture", teacher: "Dr. Brahmi" },
  { id: 2, name: "Sécurité", type: "TD", teacher: "Dr. Brahmi" },
  { id: 3, name: "Méthodes formelles", type: "Lecture", teacher: "Dr. Zedek" },
  { id: 4, name: "Méthodes formelles", type: "TD", teacher: "Dr. Zedek" },
  { id: 5, name: "Analyse numérique", type: "Lecture", teacher: "Dr. Alkama" },
  { id: 6, name: "Analyse numérique", type: "TD", teacher: "Dr. Alkama" },
  { id: 7, name: "Entrepreneuriat", type: "Lecture", teacher: "Dr. Kaci" },
  {
    id: 8,
    name: "Recherche opérationnelle 2",
    type: "Lecture",
    teacher: "Dr. Issadi",
  },
  {
    id: 9,
    name: "Recherche opérationnelle 2",
    type: "TD",
    teacher: "Dr. Issadi",
  },
  {
    id: 10,
    name: "Distributed Architecture",
    type: "Lecture",
    teacher: "Dr. Djenadi",
  },
  {
    id: 11,
    name: "Distributed Architecture",
    type: "TD",
    teacher: "Dr. Djenadi",
  },
  { id: 12, name: "Réseaux 2", type: "Lecture", teacher: "Dr. Zenadji" },
  { id: 13, name: "Réseaux 2", type: "TD", teacher: "M. Sahli" },
  { id: 14, name: "Réseaux 2", type: "TP", teacher: "Dr. Zenadji" },
  {
    id: 15,
    name: "Artificial Intelligence",
    type: "Lecture",
    teacher: "Dr. Lekhali",
  },
  {
    id: 16,
    name: "Artificial Intelligence",
    type: "TD",
    teacher: "Dr. Lekhali",
  },
  {
    id: 17,
    name: "Artificial Intelligence",
    type: "TP",
    teacher: "M. Embarki & M. Brahami",
  },
];

const day = {
  "8:00": null,
  "9:30": null,
  "11:00": null,
  "12:30": null,
  "14:00": null,
};

const week = {
  Sunday: day,
  Monday: day,
  Tuesday: day,
  Wednesday: day,
  Thursday: day,
};

const cs_timestable = {
  G1: week,
  G2: week,
  G3: week,
  G4: week,
  G5: week,
  G6: week,
};

const cs_constraints = {
  hardConstraints: [
    { id: 1, name: "Max three successive slots", enabled: true },
    { id: 2, name: "No same course in same slot", enabled: true },
    {
      id: 3,
      name: "Different courses for same group in different slots",
      enabled: true,
    },
    { id: 4, name: "Tuesday has only three morning slots", enabled: true },
  ],
  softConstraints: [
    { id: 1, name: "Each teacher work max two days", enabled: false },
  ],
};

export { cs_courses, week, cs_constraints, cs_timestable };
