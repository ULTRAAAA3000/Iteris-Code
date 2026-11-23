// «Поломки» еталонів TypeScript: після заміни мають стати FAIL саме перелічені вимоги. Кожна вимога покрита хоч однією поломкою.
export default {
  "ts-order-calc": [
    { fails: ["R1"], replace: [["return item.price * item.qty;", "return item.price + item.qty;"]] },
    { fails: ["R2"], replace: [["return item.hours * item.rate;", "return item.hours + item.rate;"]] },
    { fails: ["R3"], replace: [['case "STUDENT":\n      return 0.1;', 'case "STUDENT":\n      return 0.15;']] },
    { fails: ["R4"], replace: [["acc + lineTotal(it), 0)", "acc + lineTotal(it), 1)"]] },
    { fails: ["R5"], replace: [["Math.round(sum * (1 - discountRate(d)) * 100) / 100", "sum * (1 - discountRate(d))"]] },
    { fails: ["R6"], replace: [["if (!Number.isInteger(item.qty) || item.qty <= 0 || item.price < 0)", "if (item.qty < 0 || item.price < 0)"]] },
    { fails: ["R7"], replace: [['item.name + " ×" + item.qty', 'item.name + " x" + item.qty']] },
    // при рівності має лишатись перший
    { fails: ["R8"], replace: [["lineTotal(it) > lineTotal(best)", "lineTotal(it) >= lineTotal(best)"]] },
  ],
  "ts-repository": [
    { fails: ["R1"], replace: [["private nextId = 1;", "private nextId = 0;"]] },
    { fails: ["R2"], replace: [["return this.items.find((x) => x.id === id);", "return this.items[id];"]] },
    // all() віддає внутрішній масив
    { fails: ["R3"], replace: [["return [...this.items];", "return this.items;"]] },
    // add зберігає і повертає переданий ззовні об'єкт
    { fails: ["R3"], replace: [["const saved = { ...item, id: this.nextId++ } as unknown as T;", "const saved = Object.assign(item, { id: this.nextId++ }) as unknown as T;"]] },
    { fails: ["R4"], replace: [["{ ...this.items[i], ...patch, id } as T", "{ ...patch, id } as T"]] },
    { fails: ["R5"], replace: [["{ ...this.items[i], ...patch, id } as T", "{ ...this.items[i], ...patch } as T"]] },
    { fails: ["R6"], replace: [['throw new Error("запис " + id + " не знайдено");', 'throw new Error("запис не знайдено");']] },
    // id береться з довжини списку: після видалення він повторюється
    { fails: ["R7"], replace: [["{ ...item, id: this.nextId++ } as unknown as T", "{ ...item, id: this.items.length + 1 } as unknown as T"]] },
    { fails: ["R8"], replace: [["return this.items.filter(pred);", "return this.items.filter((x) => !pred(x));"]] },
    // сховище прописує поле done: для Task непомітно, для Note ламає результат
    { fails: ["R9"], replace: [["{ ...item, id: this.nextId++ } as unknown as T", "{ done: false, ...item, id: this.nextId++ } as unknown as T"]] },
  ],
  "ts-api-parser": [
    { fails: ["R1"], replace: [["isObject(x) && FIELDS.every(", "isObject(x) && Object.keys(x).length === 4 && FIELDS.every("]] },
    { fails: ["R2"], replace: [["/^[^@\\s]+@[^@\\s]+$/", "/@/"]] },
    { fails: ["R3"], replace: [["return { ok: true, value: x as unknown as User };", 'return { ok: false, error: "x" };']] },
    { fails: ["R4"], replace: [['error: "невірне поле: " + f', 'error: "поле: " + f']] },
    { fails: ["R5"], replace: [["return { ok: true, value: users };", "return { ok: true, value: users.slice(1) };"]] },
    { fails: ["R6"], replace: [['error: "некоректний JSON"', 'error: "помилка JSON"']] },
    { fails: ["R7"], replace: [['"елемент " + i + ": "', '"елемент " + (i + 1) + ": "']] },
    { fails: ["R8"], replace: [["g[u.role].push(u);", "g[u.role].unshift(u);"]] },
    { fails: ["R9"], replace: [["return r.ok ? r.value : fallback;", "return fallback;"]] },
  ],
};
