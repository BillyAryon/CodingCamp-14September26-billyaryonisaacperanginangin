# CodingCamp-14September26-billyaryonisaacperanginangin

Build an Expense & Budget Visualizer web app with the following requirements:

Project Overview:
A mobile-friendly web app that helps users track daily spending. It shows total balance, transaction history, and a visual pie chart of spending by category.

Required Features (MVP):

1. Input Form
   - Fields: Item Name, Amount, Category (dropdown: Food, Transport, Fun)
   - "Add" button that adds the transaction to the list
   - Validate that all fields are filled before submitting

2. Transaction List
   - Scrollable list of all added transactions
   - Each item shows: name, amount, and category
   - Delete button for each transaction

3. Total Balance
   - Display total balance at the top of the page
   - Updates automatically when items are added or deleted

4. Visual Chart
   - Pie chart showing spending distribution by category
   - Use Chart.js library
   - Chart updates automatically when transactions change

Technical Constraints:
- TC-1: Use only HTML, CSS, and Vanilla JavaScript (no React, Vue, or any framework)
- TC-2: Store all data using browser localStorage (no backend needed)
- TC-3: Must work in Chrome, Firefox, Edge, and Safari

Non-Functional Requirements:
- Clean, minimal, and mobile-friendly interface
- Fast load time with no noticeable lag
- Clear visual hierarchy and readable typography
- No test setup required

Folder Structure Rules:
- Only 1 CSS file inside css/ folder (e.g. css/style.css)
- Only 1 JavaScript file inside js/ folder (e.g. js/app.js)
- Main HTML file: index.html
- Keep code clean and readable

Optional Challenges (implement all 3 of these):
1. Sort transactions by amount or category
2. Highlight spending that goes over a set limit
3. Dark/light mode toggle

