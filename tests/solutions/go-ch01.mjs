const raw = String.raw;
const BT = "`";

export const SOLUTIONS_01 = {
  "go-hello-module": raw`package main

import "fmt"

func main() {
	fmt.Println("Привіт, Go!")
	fmt.Println("Модуль: example.com/hello")
}
`,
  "go-first-program": raw`package main

import "fmt"

func main() {
	fmt.Println("2 + 3 =", 2+3)
	fmt.Println((8 + 4) * 3)
}
`,
  "go-imports-visibility": raw`package main

import (
	"fmt"
	"math"
	"strings"
)

func main() {
	fmt.Println(strings.ToUpper("go любить пакети"))
	fmt.Printf("%.2f\n", math.Pi*2*2)
}
`,
  "go-fix-compile-errors": raw`package main

import "fmt"

func total(a int, b int) int {
	sum := a + b
	return sum
}

func main() {
	fmt.Println("Разом:", total(4, 5))
	fmt.Println("Готово")
}
`,
};
