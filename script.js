
const display = document.getElementById("display");
const historyList = document.getElementById("historyList");
const operators = ["+", "-", "*", "/", "%"];

function appendValue(value) {
    if (display.value === "Error") {
        display.value = "0";
    }

    if (display.value === "0" && !operators.includes(value) && value !== ".") {
        display.value = value;
        return;
    }

    if (operators.includes(value)) {
        const lastCharacter = display.value.slice(-1);

        if (operators.includes(lastCharacter)) {
            display.value = display.value.slice(0, -1) + value;
            return;
        }
    }

    if (value === "." && display.value.split(/[-+*/%]/).pop().includes(".")) {
        return;
    }

    display.value += value;
}

function clearDisplay() {
    display.value = "0";
}

function deleteLast() {
    display.value = display.value.length > 1
        ? display.value.slice(0, -1)
        : "0";
}

function addHistory(expression, answer) {
    const placeholder = historyList.querySelector("li");
    if (placeholder && placeholder.textContent === "No history yet") {
        historyList.innerHTML = "";
    }

    const item = document.createElement("li");
    item.textContent = `${expression} = ${answer}`;
    historyList.prepend(item);
}

function clearHistory() {
    historyList.innerHTML = "<li>No history yet</li>";
}

document.addEventListener("keydown", (event) => {
    if (/^[0-9+\-*/.%]$/.test(event.key)) {
        appendValue(event.key);
    } else if (event.key === "Enter" || event.key === "=") {
        event.preventDefault();
        calculate();
    } else if (event.key === "Backspace") {
        deleteLast();
    } else if (event.key === "Escape") {
        clearDisplay();
    }
});

function calculate() {
    try {
        const expression = display.value;

        if (!/^[0-9+\-*/%.() ]+$/.test(expression)) {
            throw new Error("Invalid expression");
        }

        const tokens = expression.match(
            /\d+\.?\d*|\.\d+|[+\-*/%()]|\s+/g
        );

        if (!tokens) throw new Error("Invalid");

        const cleanTokens = tokens.filter(t => t.trim() !== "");
        let position = 0;

        function parseExpression() {
            let value = parseTerm();

            while (
                cleanTokens[position] === "+" ||
                cleanTokens[position] === "-"
            ) {
                const operator = cleanTokens[position++];
                const next = parseTerm();

                value = operator === "+"
                    ? value + next
                    : value - next;
            }

            return value;
        }

        function parseTerm() {
            let value = parseFactor();

            while (
                ["*", "/", "%"].includes(cleanTokens[position])
            ) {
                const operator = cleanTokens[position++];
                const next = parseFactor();

                if ((operator === "/" || operator === "%") && next === 0) {
                    throw new Error("Cannot divide by zero");
                }

                if (operator === "*") value *= next;
                if (operator === "/") value /= next;
                if (operator === "%") value %= next;
            }

            return value;
        }

        function parseFactor() {
            const token = cleanTokens[position];

            if (token === "-") {
                position++;
                return -parseFactor();
            }

            if (token === "+") {
                position++;
                return parseFactor();
            }

            if (token === "(") {
                position++;
                const value = parseExpression();

                if (cleanTokens[position++] !== ")") {
                    throw new Error("Missing bracket");
                }

                return value;
            }

            if (token === undefined || isNaN(Number(token))) {
                throw new Error("Invalid number");
            }

            position++;
            return Number(token);
        }

        const result = parseExpression();

        if (position !== cleanTokens.length || !Number.isFinite(result)) {
            throw new Error("Invalid calculation");
        }

        const answer = String(Number(result.toFixed(10)));

        addHistory(expression, answer);
        display.value = answer;

    } catch (error) {
        display.value = "Error";
        console.error(error);
    }
}
