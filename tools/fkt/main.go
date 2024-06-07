package main

import (
	"fmt"

	"github.com/jolson88/trp/tools/fkt/ideas"

	gui "github.com/gen2brain/raylib-go/raygui"
	rl "github.com/gen2brain/raylib-go/raylib"
)

func main() {
	ideaBank := ideas.NewIdeaBank()
	fmt.Printf("Default ideaBank with %d ideas\n", ideaBank.Count())

	rl.InitWindow(1280, 720, "FKT")
	defer rl.CloseWindow()

	rl.SetTargetFPS(60)

	var button bool
	for !rl.WindowShouldClose() {
		rl.BeginDrawing()

		rl.ClearBackground(rl.Black)

		button = gui.Button(rl.NewRectangle(50, 150, 100, 40), "Click")
		if button {
			fmt.Println("Clicked on button")
		}

		rl.EndDrawing()
	}
}
