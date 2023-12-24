export enum BuiltInConnectionTypes {
  Child,
  Parent,
  Reference,
  CitedBy,
}

export interface ConnectionType {
  id: number;
  name: string;
  description: string;
  bidirectional: boolean;
  bidirectionalConnectionTypeId?: number;
}

export interface NoteConnection {
  sourceNoteId: string;
  connectionTypeId: number;
  targetNoteId: string;
}

export interface Note {
  id: string;
  title: string;
  text: string;
}

const notes = new Map<string, Note>();
const connections = new Set<NoteConnection>();
const connectionTypes = new Map<number, ConnectionType>([
  [BuiltInConnectionTypes.Child, {
    id: BuiltInConnectionTypes.Child,
    name: "Child",
    description: "A connection from a parent note to a child note",
    bidirectional: true,
    bidirectionalConnectionTypeId: BuiltInConnectionTypes.Parent,
  }],
  [BuiltInConnectionTypes.Parent, {
    id: BuiltInConnectionTypes.Parent,
    name: "Parent",
    description: "A connection from a child note to a parent note",
    bidirectional: true,
    bidirectionalConnectionTypeId: BuiltInConnectionTypes.Child,
  }],
  [BuiltInConnectionTypes.Reference, {
    id: BuiltInConnectionTypes.Reference,
    name: "Reference",
    description: "A connection from a note to a referenced note",
    bidirectional: true,
    bidirectionalConnectionTypeId: BuiltInConnectionTypes.CitedBy,
  }],
  [BuiltInConnectionTypes.CitedBy, {
    id: BuiltInConnectionTypes.CitedBy,
    name: "Cited By",
    description: "A connection where a note is referenced by another note",
    bidirectional: false,
  }],
]);

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
  connectionTypeId: number
) {
  const connectionType = connectionTypes.get(connectionTypeId);
  if (!connectionType) {
    throw new Error(`Unknown connection type ${connectionTypeId}`);
  }

  connections.add({
    sourceNoteId,
    targetNoteId,
    connectionTypeId,
  });
  if (connectionType.bidirectional && connectionType.bidirectionalConnectionTypeId) {
    connections.add({
      sourceNoteId: targetNoteId,
      targetNoteId: sourceNoteId,
      connectionTypeId: connectionType.bidirectionalConnectionTypeId,
    });
  } else {
    connections.add({
      sourceNoteId: targetNoteId,
      targetNoteId: sourceNoteId,
      connectionTypeId: BuiltInConnectionTypes.CitedBy,
    })
  }
}

export function getConnections(sourceNoteId: string): NoteConnection[] {
  return Array.from(connections).filter((c) => c.sourceNoteId === sourceNoteId);
}

export function deleteConnection(
  sourceNoteId: string,
  targetNoteId: string,
  connectionTypeId: number
) {
  const connectionType = connectionTypes.get(connectionTypeId);
  if (!connectionType) {
    throw new Error(`Unknown connection type ${connectionTypeId}`);
  }

  connections.forEach((c) => {
    if (
      c.sourceNoteId === sourceNoteId &&
      c.targetNoteId === targetNoteId &&
      c.connectionTypeId === connectionTypeId
    ) {
      connections.delete(c);
    }
  });

  if (connectionType.bidirectional && connectionType.bidirectionalConnectionTypeId) {
    connections.forEach((c) => {
      if (
        c.sourceNoteId === targetNoteId &&
        c.targetNoteId === sourceNoteId &&
        c.connectionTypeId === connectionType.bidirectionalConnectionTypeId
      ) {
        connections.delete(c);
      }
    });
  }
}
