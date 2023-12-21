export enum BuiltInConnections {
  BackReference = 0,
  Child,
  Parent,
  Source,
  Citation,
}

export interface NoteConnection {
  sourceNoteId: string;
  connectionType: number;
  targetNoteId: string;
}

export interface Note {
  id: string;
  title: string;
  text: string;
}

const notes = new Map<string, Note>();
const connections = new Set<NoteConnection>();

export function clearAllNotes() {
  notes.clear();
  connections.clear();
}

export function noteCount() {
  return notes.size;
}

export function deleteNote(noteId: string) {
  notes.delete(noteId);
  connections.forEach((c) => {
    if (c.sourceNoteId === noteId || c.targetNoteId === noteId) {
      connections.delete(c);
    }
  });
}

export function saveNote(
  text: string = "",
  title: string = "",
  id?: string
): Note {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hrs = String(d.getHours()).padStart(2, "0");
  const mins = String(d.getMinutes()).padStart(2, "0");
  const secs = String(d.getSeconds()).padStart(2, "0");
  const mills = String(d.getMilliseconds()).padStart(4, "0");

  const note: Note = {
    id: id ?? `${y}${m}${day}${hrs}${mins}${secs}${mills}`,
    title,
    text,
  };
  notes.set(note.id, note);

  return note;
}

export function connectionCount() {
  return connections.size;
}

export function connectNotes(
  sourceNoteId: string,
  targetNoteId: string,
  connectionType: number
) {
  connections.add({
    sourceNoteId,
    targetNoteId,
    connectionType,
  });
}

export function getConnections(sourceNoteId: string): NoteConnection[] {
  return Array.from(connections).filter((c) => c.sourceNoteId === sourceNoteId);
}

export function deleteConnection(
  sourceNoteId: string,
  targetNoteId: string,
  connectionType: number
) {
  connections.forEach((c) => {
    if (
      c.sourceNoteId === sourceNoteId &&
      c.targetNoteId === targetNoteId &&
      c.connectionType === connectionType
    ) {
      connections.delete(c);
    }
  });
}
