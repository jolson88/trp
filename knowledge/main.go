package main

import (
	"bufio"
	"fmt"
	"os"
)

func main() {
	scanner := bufio.NewScanner(os.Stdin)

	for {
		fmt.Print("knowl> ")
		if scanner.Scan() {
			input := scanner.Text()
			if input == "exit" {
				break
			}
			fmt.Println(input)
		} else {
			break
		}
	}

	if err := scanner.Err(); err != nil {
		fmt.Println("Error reading input:", err)
	}
}
