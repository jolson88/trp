package main

import (
	"math"

	rl "github.com/gen2brain/raylib-go/raylib"
)

const (
	WindowWidth  = 1280
	WindowHeight = 720
)

type Circle struct {
	Frequency   float64
	PhaseOffset float64
	Radius      float32
	Color       rl.Color
}

func translate(x, y float64) (float64, float64) {
	return x + WindowWidth/2, WindowHeight/2 - y
}

func secToHz(s float64) float64 {
	return 1 / s
}

func osc(frequency, elapsedInSeconds float64) float64 {
	return math.Sin(frequency * elapsedInSeconds * 2 * math.Pi)
}

func main() {
	circles := []*Circle{
		{Frequency: secToHz(2), Radius: 20, PhaseOffset: 0, Color: rl.Red},
		{Frequency: secToHz(2), Radius: 20, PhaseOffset: 0.25, Color: rl.Blue},
		{Frequency: secToHz(2), Radius: 20, PhaseOffset: 0.5, Color: rl.Green},
		{Frequency: secToHz(2), Radius: 20, PhaseOffset: 0.75, Color: rl.Magenta},
	}

	rl.InitWindow(1280, 720, "Circles")
	defer rl.CloseWindow()

	rl.SetTargetFPS(60)
	for !rl.WindowShouldClose() {
		rl.BeginDrawing()
		rl.ClearBackground(rl.Black)

		rl.BeginBlendMode(rl.BlendAdditive)
		freqCounter := 2 * math.Pi * rl.GetTime()
		for _, circle := range circles {
			radius := 200 * osc(0.2, rl.GetTime())
			phaseOffset := circle.PhaseOffset * 2 * math.Pi
			screenX, screenY := translate(
				math.Sin(freqCounter*circle.Frequency+phaseOffset)*radius,
				math.Cos(freqCounter*circle.Frequency+phaseOffset)*radius,
			)

			rl.DrawCircle(int32(screenX), int32(screenY), circle.Radius, circle.Color)
		}
		rl.EndBlendMode()

		rl.EndDrawing()
	}
}
