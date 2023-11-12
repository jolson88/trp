interface Note {
  id: string;
  title: string;
  summary: string;
  references: Array<string>;
  topics: Array<string>;
  types: Array<string>;
}

function createAllNotes(): Array<Note> {
  return [
    {
      title: "Instructional Hierarchy",
      summary: "Acquisition, Fluency, Generalization, and Adaptation. The instructional hierarchy is a model of skill acquisition premised on the theory that children will best acquire skills through progressive instructional techniques beginning with content accuracy. Upon demonstrating adequate competency of the content (i.e., accuracy), instruction should then focus on training the learner to become fluent in the skill (i.e., high rates of accurate responding during timed probes). As fluency is achieved, the instructional hierarchy progresses to the promotion of the generalization of the skill to meaningful educational contexts. The final goal of the instructional hierarchy is to foster adaptation of the target skill to novel contexts and demands.",
      id: "https://jolson88.com/graph/learning/instructional-hierarchy",
      references: [
        "https://link.springer.com/referenceworkentry/10.1007/978-0-387-79061-9_3164",
        "https://www.interventioncentral.org/academic-interventions/general-academic/instructional-hierarchy-linking-stages-learning-effective-in",
      ],
      topics: [
        "instructional-hierarchy",
        "learning",
        "fluency",
        "growth",
        "personal-development",
      ],
      types: ["concept"],
    },
  ];
}

function printNotes(notes: Array<Note>) {
  for (const note of notes) {
    console.log(JSON.stringify(note));
  }
}

const notes = createAllNotes();
printNotes(notes);
