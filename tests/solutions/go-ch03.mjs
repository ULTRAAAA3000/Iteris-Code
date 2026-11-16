const raw = String.raw;
const BT = "`";

export const SOLUTIONS_03 = {
  "go-arrays-fixed": raw`package main

import "fmt"

func doubled(a [4]int) [4]int {
	for i := range a {
		a[i] *= 2
	}
	return a
}

func same(a, b [4]int) bool {
	return a == b
}

func main() {
	orig := [4]int{1, 2, 3, 4}
	d := doubled(orig)
	fmt.Println(orig, d)
	fmt.Println(same(orig, d), same(orig, [4]int{1, 2, 3, 4}))
}
`,
  "go-slices-basics": raw`package main

import "fmt"

func countdown(n int) []int {
	s := make([]int, n)
	for i := range s {
		s[i] = n - i
	}
	return s
}

func trim(s []int) []int {
	if len(s) < 3 {
		return s[:0]
	}
	return s[1 : len(s)-1]
}

func main() {
	c := countdown(5)
	fmt.Println(c)
	fmt.Println(trim(c))
	t := trim([]int{1, 2})
	fmt.Println(len(t), t == nil)
}
`,
  "go-filter-evens": raw`package main

import "fmt"

func sum(nums []int) int {
	total := 0
	for _, n := range nums {
		total += n
	}
	return total
}

func evens(nums []int) []int {
	res := make([]int, 0, len(nums))
	for _, n := range nums {
		if n%2 == 0 {
			res = append(res, n)
		}
	}
	return res
}

func main() {
	nums := []int{5, 2, 9, 7, 4, 10, 3, 8}
	e := evens(nums)
	fmt.Println("Сума:", sum(nums))
	fmt.Println("Парні:", e)
	fmt.Println("Скільки парних:", len(e), cap(e) >= len(e))
	fmt.Println("Вхідний:", nums)
}
`,
  "go-slice-copy": raw`package main

import "fmt"

func removeAt(s []int, i int) []int {
	res := make([]int, 0, len(s)-1)
	res = append(res, s[:i]...)
	res = append(res, s[i+1:]...)
	return res
}

func firstThree(big []int) []int {
	head := make([]int, 3)
	copy(head, big)
	return head
}

func main() {
	orig := []int{10, 20, 30, 40, 50}
	r := removeAt(orig, 1)
	fmt.Println(r, orig)
	head := firstThree(orig)
	head[0] = 99
	fmt.Println(head, orig[0])
}
`,
  // NEXT
};
