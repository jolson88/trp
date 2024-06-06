package main

import (
	"testing"

	"github.com/jolson88/knowl/ideas"
)

func TestCreatesAndInteractsWithNewIdea(t *testing.T) {
	ideaBank := ideas.NewIdeaBank()
	var countBefore = ideaBank.Count()

	//
	// Create new ideas
	//
	var firstIdea = ideaBank.CreateIdea("first idea")
	var secondIdea = ideaBank.CreateIdea("second idea")

	if firstIdea.Id == secondIdea.Id {
		t.Fatalf("Expected different ids, but got %d and %d", firstIdea.Id, secondIdea.Id)
	}
	if ideaBank.Count() != countBefore+2 {
		t.Fatalf("Expected %d ideas, got %d", countBefore+2, ideaBank.Count())
	}

	//
	// Append Children
	//
	countBefore = ideaBank.Count()

	const firstChildText = "first child"
	const secondChildText = "second child"
	firstChild := ideaBank.CreateChild(firstIdea.Id, firstChildText)
	secondChild := ideaBank.CreateChild(firstIdea.Id, secondChildText)

	countAfter := ideaBank.Count()
	if countAfter != countBefore+2 {
		t.Fatalf("Expected children to be added for %d total ideas, got %d", countBefore+2, countAfter)
	}

	//
	// Re-ordering
	//
	ideaBank.MoveChild(firstIdea.Id, 1, -1)

	var newFirstChild = ideaBank.GetIdea(firstIdea.Children[0])
	var newSecondChild = ideaBank.GetIdea(firstIdea.Children[1])
	if newFirstChild.Text != secondChildText {
		t.Fatalf("Expected first child to have text '%s', got '%s'", firstChildText, firstChild.Text)
	}
	if newSecondChild.Text != firstChildText {
		t.Fatalf("Expected second child to have text '%s', got '%s'", secondChildText, secondChild.Text)
	}

	//
	// References
	//
	secondIdea = ideaBank.AddReference(secondIdea.Id, firstIdea.Id)
	if len(secondIdea.References) != 1 {
		t.Fatalf("Expected second idea to have 1 reference, got %d", len(secondIdea.References))
	}

	secondIdea = ideaBank.AddReference(secondIdea.Id, firstIdea.Id)
	if len(secondIdea.References) != 1 {
		t.Fatalf("Expected to not have duplicate added, but found %d references", len(secondIdea.References))
	}
}

func TestLogsAndReloads(t *testing.T) {
	ideaBank := ideas.NewIdeaBank()
	firstIdea := ideaBank.CreateIdea("P1")
	secondIdea := ideaBank.CreateIdea("P2")
	ideaBank.CreateChild(secondIdea.Id, "P2-C1")
	ideaBank.CreateChild(secondIdea.Id, "P2-C2")
	ideaBank.MoveChild(secondIdea.Id, 1, -1)
	childIdea := ideaBank.CreateChild(firstIdea.Id, "P1-C1")
	ideaBank.AddReference(childIdea.Id, secondIdea.Id)

	log := ideaBank.CommandLog()
	restoredIdeaBank := ideas.NewIdeaBankFromCommandLog(log)
	if restoredIdeaBank.Count() != ideaBank.Count() {
		t.Fatalf("Expected restored idea bank to have %d ideas, got %d", ideaBank.Count(), restoredIdeaBank.Count())
	}

	var originalIdeas = ideaBank.AllIdeas()
	for i, originalIdea := range originalIdeas {
		restoredIdea := restoredIdeaBank.GetIdea(originalIdea.Id)
		if originalIdea.Text != restoredIdea.Text {
			t.Fatalf("Expected restored idea at index %d to have text '%s', got '%s'", i, originalIdea.Text, restoredIdea.Text)
		}
		if len(originalIdea.Children) != len(restoredIdea.Children) {
			t.Fatalf("Expected restored idea at index %d to have %d children, got %d", i, len(originalIdea.Children), len(restoredIdea.Children))
		}
		for j, originalChild := range originalIdea.Children {
			if originalChild != restoredIdea.Children[j] {
				t.Fatalf("Expected restored idea at index %d to have child %d be %d, got %d", i, j, originalChild, restoredIdea.Children[j])
			}
		}
		if len(originalIdea.References) != len(restoredIdea.References) {
			t.Fatalf("Expected restored idea at index %d to have %d references, got %d", i, len(originalIdea.References), len(restoredIdea.References))
		}
		for j, originalReference := range originalIdea.References {
			if originalReference != restoredIdea.References[j] {
				t.Fatalf("Expected restored idea at index %d to have reference %d be %d, got %d", i, j, originalReference, restoredIdea.References[j])
			}
		}
	}
}
