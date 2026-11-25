// «Поломки» еталонів Pascal: після заміни мають стати FAIL саме перелічені вимоги. Кожна вимога покрита хоч однією поломкою.
export default {
  "pascal-guess-number": [
    { fails: ["R1"], replace: [["Hint := 'Замало'", "Hint := 'Забагато'"]] },
    { fails: ["R2"], replace: [["      PlayGame := i;\n", "      PlayGame := i + 1;\n"]] },
    // без виходу цикл іде далі й перезаписує результат наступним влучанням
    { fails: ["R3"], replace: [["      exit;\n", ""]] },
    { fails: ["R4"], replace: [["  PlayGame := 0;\n  i := 1;", "  PlayGame := -1;\n  i := 1;"]] },
    { fails: ["R5"], replace: [["while (i <= limit) and (i <= 8) do", "while (i <= 5) and (i <= 8) do"]] },
    { fails: ["R6"], replace: [["Score := (limit - attempt + 1) * 10;", "Score := (limit - attempt) * 10;"]] },
  ],
  "pascal-number-toolkit": [
    { fails: ["R1"], replace: [["if n < 2 then", "if n < 1 then"]] },
    { fails: ["R2"], replace: [["while b <> 0 do", "while b > 1 do"]] },
    { fails: ["R3"], replace: [["s := s + n mod 10;", "s := s + n mod 9;"]] },
    { fails: ["R4"], replace: [["r := r * 10 + n mod 10;", "r := r + n mod 10;"]] },
    { fails: ["R5"], replace: [["for i := 2 to upTo do", "for i := 2 to upTo - 1 do"]] },
    { fails: ["R6"], replace: [["Lcm := a div Gcd(a, b) * b;", "Lcm := a * b;"]] },
  ],
  "pascal-student-cards": [
    { fails: ["R1"], replace: [["SetStudent(s[2], 'Ihor', 102, 3.8);", "SetStudent(s[2], 'Ihor', 102, 3.9);"]] },
    { fails: ["R2"], replace: [["' (' + grp + ') '", "' [' + grp + '] '"]] },
    { fails: ["R3"], replace: [["Average := sum / Count;", "Average := sum / (Count + 1);"]] },
    { fails: ["R4"], replace: [["if s[i].grade > s[best].grade then", "if s[i].grade >= s[best].grade then"]] },
    { fails: ["R5"], replace: [["if s[i].grade > limit then", "if s[i].grade >= limit then"]] },
    { fails: ["R6"], replace: [["if s[j].grade < s[j + 1].grade then", "if s[j].grade > s[j + 1].grade then"]] },
    { fails: ["R7"], replace: [["for j := 1 to Count - i do", "for j := 1 to Count - i - 1 do"]] },
  ],
};
