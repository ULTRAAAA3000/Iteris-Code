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
  "go-slices-pkg": raw`package main

import (
	"fmt"
	"slices"
)

func without(s []int, v int) []int {
	c := slices.Clone(s)
	if i := slices.Index(c, v); i >= 0 {
		c = slices.Delete(c, i, i+1)
	}
	return c
}

func uniqueSorted(s []int) []int {
	c := slices.Clone(s)
	slices.Sort(c)
	return slices.Compact(c)
}

func main() {
	nums := []int{5, 3, 5, 1, 3, 9, 1}
	fmt.Println(without(nums, 3), nums)
	fmt.Println(without(nums, 42))
	fmt.Println(uniqueSorted(nums), nums)
	fmt.Println(slices.Max(nums))
}
`,
  "go-matrix": raw`package main

import "fmt"

func newMatrix(rows, cols int) [][]int {
	m := make([][]int, rows)
	for i := range m {
		m[i] = make([]int, cols)
		for j := range m[i] {
			m[i][j] = i*cols + j
		}
	}
	return m
}

func transpose(m [][]int) [][]int {
	if len(m) == 0 {
		return nil
	}
	rows, cols := len(m), len(m[0])
	t := make([][]int, cols)
	for j := range t {
		t[j] = make([]int, rows)
		for i := range m {
			t[j][i] = m[i][j]
		}
	}
	return t
}

func main() {
	m := newMatrix(2, 3)
	fmt.Println(m)
	t := transpose(m)
	fmt.Println(t)
	fmt.Println(len(t), len(t[0]), transpose(nil) == nil)
	t[0][0] = 100
	fmt.Println(m[0][0])
}
`,
  "go-map-basics": raw`package main

import "fmt"

func describe(m map[string]int, key string) string {
	if v, ok := m[key]; ok {
		return fmt.Sprintf("%s=%d", key, v)
	}
	return key + " відсутній"
}

func remove(m map[string]int, keys ...string) {
	for _, k := range keys {
		delete(m, k)
	}
}

func main() {
	m := map[string]int{"яблуко": 5, "груша": 0, "слива": 3}
	fmt.Println(describe(m, "груша"))
	fmt.Println(describe(m, "ківі"))
	remove(m, "яблуко", "ківі")
	fmt.Println(m, len(m))
}
`,
  "go-set-group": raw`package main

import "fmt"

func distinct(words []string) int {
	set := map[string]struct{}{}
	for _, w := range words {
		set[w] = struct{}{}
	}
	return len(set)
}

func groupByLen(words []string) map[int][]string {
	groups := make(map[int][]string)
	for _, w := range words {
		groups[len(w)] = append(groups[len(w)], w)
	}
	return groups
}

func main() {
	words := []string{"go", "is", "fun", "go", "and", "fast", "is"}
	fmt.Println(distinct(words))
	fmt.Println(groupByLen(words))
	fmt.Println(len(groupByLen(nil)))
}
`,
  "go-range-all": raw`package main

import (
	"fmt"
	"sort"
)

func sortedKeys(m map[string]int) []string {
	keys := make([]string, 0, len(m))
	for k := range m {
		keys = append(keys, k)
	}
	sort.Strings(keys)
	return keys
}

func countRunes(s string) int {
	n := 0
	for range s {
		n++
	}
	return n
}

func main() {
	stock := map[string]int{"яблуко": 5, "груша": 0, "слива": 3, "ківі": 8}
	for _, k := range sortedKeys(stock) {
		fmt.Println(k, stock[k])
	}
	text := "Привіт, світе"
	fmt.Println(len(text), countRunes(text))
}
`,
  "go-sorting": raw`package main

import (
	"cmp"
	"fmt"
	"slices"
	"strings"
)

func sortedDesc(nums []int) []int {
	c := slices.Clone(nums)
	slices.SortFunc(c, func(a, b int) int { return cmp.Compare(b, a) })
	return c
}

func byLenThenAlpha(words []string) []string {
	c := slices.Clone(words)
	slices.SortFunc(c, func(a, b string) int {
		if r := cmp.Compare(len(a), len(b)); r != 0 {
			return r
		}
		return strings.Compare(a, b)
	})
	return c
}

func main() {
	nums := []int{5, 2, 9, 2, 7}
	fmt.Println(sortedDesc(nums), nums)
	words := []string{"pear", "fig", "apple", "kiwi", "date", "banana", "plum"}
	fmt.Println(byLenThenAlpha(words))
	fmt.Println(words)
}
`,
  // NEXT
};
