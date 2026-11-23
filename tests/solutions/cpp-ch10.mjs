// Еталонні рішення завдань C++, глава 10 «Формати й протоколи» (уроки 95–100). У сайт не потрапляють
const raw = String.raw;

export const SOLUTIONS_10 = {
  "cpp-http-header": raw`#include <cctype>
#include <iostream>
#include <string>
#include <vector>

std::string trim(const std::string& s) {
    const char* ws = " \t\r\n";
    std::size_t b = s.find_first_not_of(ws);
    if (b == std::string::npos) {
        return "";
    }
    return s.substr(b, s.find_last_not_of(ws) - b + 1);
}

std::string lower(std::string s) {
    for (char& c : s) {
        c = static_cast<char>(std::tolower(static_cast<unsigned char>(c)));
    }
    return s;
}

bool parse_header(const std::string& line, std::string& name, std::string& value) {
    std::size_t colon = line.find(':');
    if (colon == std::string::npos) {
        return false;
    }
    name = lower(trim(line.substr(0, colon)));
    value = trim(line.substr(colon + 1));
    return true;
}

int main() {
    std::vector<std::string> lines = {
        "Host: Example.com\r",
        "X-Token:   abc123  \r",
        "ACCEPT:*/*",
        "це не заголовок",
    };
    for (const std::string& line : lines) {
        std::string name, value;
        if (parse_header(line, name, value)) {
            std::cout << name << "=" << value << "\n";
        } else {
            std::cout << "відхилено\n";
        }
    }
    return 0;
}
`,
  "cpp-url-decode": raw`#include <iostream>
#include <string>
#include <vector>

int hex_val(char c) {
    if (c >= '0' && c <= '9') {
        return c - '0';
    }
    if (c >= 'a' && c <= 'f') {
        return c - 'a' + 10;
    }
    if (c >= 'A' && c <= 'F') {
        return c - 'A' + 10;
    }
    return -1;
}

bool percent_decode(const std::string& in, std::string& out) {
    out.clear();
    for (std::size_t i = 0; i < in.size(); ++i) {
        char c = in[i];
        if (c == '+') {
            out += ' ';
        } else if (c == '%') {
            if (i + 2 >= in.size()) {
                return false;
            }
            int hi = hex_val(in[i + 1]);
            int lo = hex_val(in[i + 2]);
            if (hi < 0 || lo < 0) {
                return false;
            }
            out += static_cast<char>(hi * 16 + lo);
            i += 2;
        } else {
            out += c;
        }
    }
    return true;
}

int main() {
    std::vector<std::string> inputs = {"c%2B%2B", "a+b%20c", "%D0%9E%D0%BB%D1%8F", "100%", "x%zzy"};
    for (const std::string& in : inputs) {
        std::string out;
        if (percent_decode(in, out)) {
            std::cout << in << " => " << out << "\n";
        } else {
            std::cout << in << " => помилка\n";
        }
    }
    return 0;
}
`,
  "cpp-json-escape": raw`#include <iostream>
#include <string>

std::string escape(const std::string& s) {
    std::string out;
    for (char c : s) {
        switch (c) {
        case '"': out += "\\\""; break;
        case '\\': out += "\\\\"; break;
        case '\n': out += "\\n"; break;
        case '\t': out += "\\t"; break;
        default: out += c;
        }
    }
    return out;
}

std::string quote(const std::string& s) {
    return "\"" + escape(s) + "\"";
}

int main() {
    std::string json = "{";
    json += quote("name") + ":" + quote("Оля \"Кіт\"");
    json += "," + quote("path") + ":" + quote("C:\\temp");
    json += "," + quote("note") + ":" + quote("рядок1\nрядок2\tкінець");
    json += "," + quote("age") + ":" + std::to_string(30);
    json += "}";
    std::cout << json << "\n";
    return 0;
}
`,
  "cpp-endian-bytes": raw`#include <cstdint>
#include <iomanip>
#include <iostream>
#include <vector>

using Bytes = std::vector<std::uint8_t>;

void put_u32_be(Bytes& out, std::uint32_t v) {
    for (int shift = 24; shift >= 0; shift -= 8) {
        out.push_back(static_cast<std::uint8_t>((v >> shift) & 0xFF));
    }
}

void put_u32_le(Bytes& out, std::uint32_t v) {
    for (int shift = 0; shift <= 24; shift += 8) {
        out.push_back(static_cast<std::uint8_t>((v >> shift) & 0xFF));
    }
}

std::uint32_t get_u32_le(const Bytes& in, std::size_t pos) {
    std::uint32_t v = 0;
    for (std::size_t i = 4; i > 0; --i) {
        v = (v << 8) | static_cast<std::uint32_t>(in[pos + i - 1]);
    }
    return v;
}

void put_i16_be(Bytes& out, std::int16_t v) {
    std::uint16_t u = static_cast<std::uint16_t>(v);
    out.push_back(static_cast<std::uint8_t>((u >> 8) & 0xFF));
    out.push_back(static_cast<std::uint8_t>(u & 0xFF));
}

void show(const char* name, const Bytes& b) {
    std::cout << name << ":";
    for (std::uint8_t x : b) {
        std::cout << " " << std::hex << std::setw(2) << std::setfill('0') << static_cast<unsigned>(x);
    }
    std::cout << std::dec << "\n";
}

int main() {
    Bytes be, le, neg;
    put_u32_be(be, 0x12345678);
    put_u32_le(le, 0x12345678);
    put_i16_be(neg, -2);
    show("be", be);
    show("le", le);
    show("i16", neg);
    if (be.size() == 4) {
        std::cout << "LE з BE-байтів: " << std::hex << get_u32_le(be, 0) << "\n";
    }
    return 0;
}
`,
  "cpp-fsm-pairs": raw`#include <iostream>
#include <string>
#include <utility>
#include <vector>

enum class State { Key, Value };

class PairParser {
public:
    void feed(const std::string& chunk) {
        for (char c : chunk) {
            step(c);
        }
    }
    const std::vector<std::pair<std::string, std::string>>& pairs() const { return pairs_; }

private:
    void step(char c) {
        switch (st_) {
        case State::Key:
            if (c == '=') {
                st_ = State::Value;
            } else {
                key_ += c;
            }
            break;
        case State::Value:
            if (c == ';') {
                pairs_.emplace_back(key_, value_);
                key_.clear();
                value_.clear();
                st_ = State::Key;
            } else {
                value_ += c;
            }
            break;
        }
    }

    State st_ = State::Key;
    std::string key_, value_;
    std::vector<std::pair<std::string, std::string>> pairs_;
};

std::string dump(const PairParser& p) {
    std::string out;
    for (const auto& [k, v] : p.pairs()) {
        out += k + "=[" + v + "]\n";
    }
    return out;
}

int main() {
    const std::string input = "a=1;name=Ola;x=;";
    PairParser whole;
    whole.feed(input);

    PairParser pieces;
    for (std::size_t i = 0; i < input.size(); i += 2) {
        pieces.feed(input.substr(i, 2));
    }

    std::cout << dump(whole);
    std::cout << "пар: " << whole.pairs().size() << "\n";
    std::cout << "однаково: " << (dump(whole) == dump(pieces) ? "так" : "ні") << "\n";
    return 0;
}
`,
  "cpp-view-split": raw`#include <iostream>
#include <string>
#include <string_view>
#include <vector>

std::string_view trim(std::string_view s) {
    while (!s.empty() && s.front() == ' ') {
        s.remove_prefix(1);
    }
    while (!s.empty() && s.back() == ' ') {
        s.remove_suffix(1);
    }
    return s;
}

std::vector<std::string_view> split(std::string_view text, char sep) {
    std::vector<std::string_view> parts;
    while (true) {
        std::size_t pos = text.find(sep);
        if (pos == std::string_view::npos) {
            parts.push_back(text);
            return parts;
        }
        parts.push_back(text.substr(0, pos));
        text.remove_prefix(pos + 1);
    }
}

int main() {
    std::string line = "alpha, beta ,gamma";
    std::vector<std::string_view> parts = split(line, ',');
    for (std::string_view p : parts) {
        std::cout << "[" << trim(p) << "]";
    }
    std::cout << "\n";
    std::cout << "частин: " << parts.size() << "\n";
    bool inside = !parts.empty() && parts[0].data() == line.data();
    std::cout << "у тому ж буфері: " << (inside ? "так" : "ні") << "\n";
    return 0;
}
`,
};
