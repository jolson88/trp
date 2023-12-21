import { describe, it, expect, beforeEach } from "vitest";
import {
  BuiltInConnections,
  clearAllNotes,
  connectNotes,
  deleteConnection,
  deleteNote,
  getConnections,
  noteCount,
  saveNote,
} from "./notes";

describe("Notes", () => {
  beforeEach(() => {
    clearAllNotes();
  });

  it("should save and update a note", () => {
    let note = saveNote("Foo", "Bar");

    note = saveNote("XX", "YY", note.id);

    expect(note.id).toMatch(/\d{17}/);
    expect(note).toEqual({ id: note.id, text: "XX", title: "YY" });
    expect(noteCount()).toBe(1);
  });

  it("should add a connection between two notes", () => {
    const firstNote = saveNote("Foo", "Foo", "Foo");
    const secondNote = saveNote("Bar", "Bar", "Bar");
    connectNotes(firstNote.id, secondNote.id, BuiltInConnections.Child);

    const connections = getConnections(firstNote.id);
    expect(connections).toEqual([
      {
        sourceNoteId: firstNote.id,
        connectionType: BuiltInConnections.Child,
        targetNoteId: secondNote.id,
      },
    ]);
  });

  it("should delete a note and all its references", () => {
    const firstNote = saveNote("Foo", "Foo", "Foo");
    const secondNote = saveNote("Bar", "Bar", "Bar");
    connectNotes(firstNote.id, secondNote.id, BuiltInConnections.Child);
    connectNotes(secondNote.id, firstNote.id, BuiltInConnections.Source);

    deleteNote(firstNote.id);

    const connections = getConnections(firstNote.id);
    expect(connections).toHaveLength(0);
    expect(noteCount()).toBe(1);
  });

  it("should remove a reference from a note", () => {
    const firstNote = saveNote("Foo", "Foo", "Foo");
    const secondNote = saveNote("Bar", "Bar", "Bar");
    connectNotes(firstNote.id, secondNote.id, BuiltInConnections.Child);
    connectNotes(firstNote.id, secondNote.id, BuiltInConnections.Source);

    deleteConnection(firstNote.id, secondNote.id, BuiltInConnections.Child);

    const connections = getConnections(firstNote.id);
    expect(connections).toHaveLength(1);
    expect(noteCount()).toBe(2);
  });
});
