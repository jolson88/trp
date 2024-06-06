import { describe, it, expect, beforeEach } from "vitest";
import {
  BuiltInConnectionTypes,
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

  it("should add a bidirectional connection between two notes", () => {
    const firstNote = saveNote("Foo", "Foo", "Foo");
    const secondNote = saveNote("Bar", "Bar", "Bar");
    connectNotes(firstNote.id, secondNote.id, BuiltInConnectionTypes.Child);

    const firstConnections = getConnections(firstNote.id);
    const secondConnections = getConnections(secondNote.id);
    expect(firstConnections).toEqual([
      {
        sourceNoteId: firstNote.id,
        connectionTypeId: BuiltInConnectionTypes.Child,
        targetNoteId: secondNote.id,
      },
    ]);
    expect(secondConnections).toEqual([
      {
        sourceNoteId: secondNote.id,
        connectionTypeId: BuiltInConnectionTypes.Parent,
        targetNoteId: firstNote.id,
      },
    ]);
  });

  it("should delete a note and all its connections", () => {
    const firstNote = saveNote("Foo", "Foo", "Foo");
    const secondNote = saveNote("Bar", "Bar", "Bar");
    connectNotes(firstNote.id, secondNote.id, BuiltInConnectionTypes.Child);
    connectNotes(secondNote.id, firstNote.id, BuiltInConnectionTypes.Reference);

    deleteNote(firstNote.id);

    const connections = getConnections(firstNote.id);
    expect(connections).toHaveLength(0);
    expect(noteCount()).toBe(1);
  });

  it("should remove a connection from a note", () => {
    const firstNote = saveNote("Foo", "Foo", "Foo");
    const secondNote = saveNote("Bar", "Bar", "Bar");
    connectNotes(firstNote.id, secondNote.id, BuiltInConnectionTypes.Child);
    connectNotes(firstNote.id, secondNote.id, BuiltInConnectionTypes.Reference);

    deleteConnection(firstNote.id, secondNote.id, BuiltInConnectionTypes.Child);

    const firstConnections = getConnections(firstNote.id);
    const secondConnections = getConnections(secondNote.id);
    expect(firstConnections).toHaveLength(1);
    expect(secondConnections).toHaveLength(1);
    expect(noteCount()).toBe(2);
  });
});
