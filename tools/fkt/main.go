package main

import (
	"bufio"
	"fmt"
	"os"
	"strings"

	"github.com/jolson88/knowl/ideas"
)

func main() {
	activeId := ideas.IdeaId(0)
	ideaBank := ideas.NewIdeaBank()
	scanner := bufio.NewScanner(os.Stdin)

	for {
		fmt.Print("knowl> ")
		if scanner.Scan() {
			input := scanner.Text()
			if input == "exit" {
				break
			}

			words := strings.SplitN(input, " ", 2)
			command := words[0]
			commandInput := ""
			if len(words) > 1 {
				commandInput = words[1]
			}

			switch command {

			case "+":
				if commandInput == "" {
					fmt.Println("Usage: + <text>")
					continue
				}
				activeId = ideaBank.CreateIdea(commandInput).Id

			case "log":
				for _, command := range ideaBank.CommandLog() {
					fmt.Println(string(command))
				}

			case "ls":
				visited := make(map[ideas.IdeaId]bool)
				for _, idea := range ideaBank.AllIdeas() {
					if idea.Id == ideaBank.NilIdea.Id {
						continue
					}
					if visited[idea.Id] {
						continue
					}

					if idea.Id == activeId {
						fmt.Printf("*[%d] %s\n", idea.Id, idea.Text)
					} else {
						fmt.Printf("[%d] %s\n", idea.Id, idea.Text)
					}
					visited[idea.Id] = true

					for _, childId := range idea.Children {
						fmt.Printf("    - [%d] %s\n", childId, ideaBank.GetIdea(childId).Text)
						visited[childId] = true
					}
				}

			default:
				fmt.Println("Unknown command:", command)
			}
		} else {
			break
		}
	}

	if err := scanner.Err(); err != nil {
		fmt.Println("Error reading input:", err)
	}
}
