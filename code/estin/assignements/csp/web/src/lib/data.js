const cs_courses = [
  { id: 1, name: "Sécurité", type: "Lecture", teacher: "Teacher 1" },
  { id: 2, name: "Sécurité", type: "TD", teacher: "Teacher 1" },
  { id: 3, name: "Méthodes formelles", type: "Lecture", teacher: "Teacher 2" },
  { id: 4, name: "Méthodes formelles", type: "TD", teacher: "Teacher 2" },
  { id: 5, name: "Analyse numérique", type: "Lecture", teacher: "Teacher 3" },
  { id: 6, name: "Analyse numérique", type: "TD", teacher: "Teacher 3" },
  { id: 7, name: "Entrepreneuriat", type: "Lecture", teacher: "Teacher 4" },
  {
    id: 8,
    name: "Recherche opérationnelle 2",
    type: "Lecture",
    teacher: "Teacher 5",
  },
  {
    id: 9,
    name: "Recherche opérationnelle 2",
    type: "TD",
    teacher: "Teacher 5",
  },
  {
    id: 10,
    name: "Distributed Architecture",
    type: "Lecture",
    teacher: "Teacher 6",
  },
  {
    id: 11,
    name: "Distributed Architecture",
    type: "TD",
    teacher: "Teacher 6",
  },
  { id: 12, name: "Réseaux 2", type: "Lecture", teacher: "Teacher 7" },
  { id: 13, name: "Réseaux 2", type: "TD", teacher: "Teacher 7" },
  { id: 14, name: "Réseaux 2", type: "TP", teacher: "Teacher 8" },
  {
    id: 15,
    name: "Artificial Intelligence",
    type: "Lecture",
    teacher: "Teacher 11",
  },
  {
    id: 16,
    name: "Artificial Intelligence",
    type: "TD",
    teacher: "Teacher 11",
  },
  {
    id: 17,
    name: "Artificial Intelligence",
    type: "TP",
    teacher: "Teacher 12",
  },
];

const cs_timeTable = {
  Sunday: {
    "8:00": null,
    "9:30": null,
    "11:00": null,
    "12:30": null,
    "14:00": null,
  },
  Monday: {
    "8:00": null,
    "9:30": null,
    "11:00": null,
    "12:30": null,
    "14:00": null,
  },
  Tuesday: {
    "8:00": null,
    "9:30": null,
    "11:00": null,
    "12:30": null,
    "14:00": null,
  },
  Wednesday: {
    "8:00": null,
    "9:30": null,
    "11:00": null,
    "12:30": null,
    "14:00": null,
  },
  Thursday: {
    "8:00": null,
    "9:30": null,
    "11:00": null,
    "12:30": null,
    "14:00": null,
  },
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
    { id: 1, name: "Each teacher max two work days", enabled: true },
  ],
};

export { cs_courses, cs_timeTable, cs_constraints };
