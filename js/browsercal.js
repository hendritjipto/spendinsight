const urlParams = new URLSearchParams(window.location.search);
const bankAccountNumber = urlParams.get("bankAccountNumber");
const selectedMonth = urlParams.get("month");
let APIURL;
if (!bankAccountNumber) {
    APIURL = "/api/insight";
} else if (bankAccountNumber && selectedMonth) {
    {
        APIURL = `/api/insight?bankAccountNumber=${encodeURIComponent(
            bankAccountNumber
        )}&month=${encodeURIComponent(selectedMonth)}`;
    }
} else {
    APIURL = `/api/insight?bankAccountNumber=${encodeURIComponent(
        bankAccountNumber
    )}`;
}

const selectAccount = document.getElementById("selectBankAccountNumber");
const selectMonth = document.getElementById("selectMonth");
const selectedBank = urlParams.get("bankAccountNumber");
const goToProfile = document.getElementById("profile");
const origin = "transaction;" + selectedMonth;
goToProfile.addEventListener("click", function () {
    //I want to get the url selected bank as the parameter too

    window.location.href = "/profile?bankAccountNumber=" + selectedBank + "&origin=" + origin;
});

document.addEventListener("DOMContentLoaded", function () {
    // Fetch data from API
    fetch("/api/users/spend")
        .then((response) => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json();
        })
        .then((data) => {
            // Get the select element
            const selectElement = document.getElementById(
                "selectBankAccountNumber"
            );
            data.forEach((account) => {
                const option = document.createElement("option");
                option.value = account.bankAccountNumber; // Assuming 'id' is the unique identifier
                option.textContent =
                    account.accountName + " - " + account.bankAccountNumber; // Assuming 'accountNumber' is the display value
                selectElement.appendChild(option);
            });

            // Set the previously selected values (if available)
            if (selectedBank) selectAccount.value = selectedBank;
            if (selectedMonth) selectMonth.value = selectedMonth;
        })
        .catch((error) => {
            console.error("Error fetching data:", error);
            // Hide spinner and show error message
            document.getElementById("filter").innerHTML = `
                         <div class="alert alert-danger">
                             <h4>Failed to load data</h4>
                             <p>Please check your connection and try again later.</p>
                         </div>
                     `;
        });
});

selectAccount.addEventListener("change", function () {
    const selectedValue = this.value;
    if (selectedValue) {
        const url = new URL(window.location.href);
        url.searchParams.set("bankAccountNumber", selectedValue);
        url.searchParams.set("month", selectMonth.value);
        window.location.href = url.href;
    }
});

selectMonth.addEventListener("change", function () {
    const selectedValue = this.value;
    if (selectedValue) {
        const url = new URL(window.location.href);
        url.searchParams.set("bankAccountNumber", selectAccount.value);
        url.searchParams.set("month", selectedValue);
        window.location.href = url.href;
    }
});

document.addEventListener("DOMContentLoaded", function () {
    // Fetch data from API
    fetch(APIURL)
        .then((response) => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json();
        })
        .then((data) => {
            // We'll work with the first item in the array
            const financialData = Array.isArray(data) ? data[0] : data;
            const spendingInsights = financialData.spendingInsights;
            const totalSpending = financialData.totalSpending;

            // Hide loading spinner and show content
            document.getElementById("loading-container").style.display = "none";
            document.getElementById("content-container").style.display =
                "block";

            // Generate chart data
            renderChart(spendingInsights, totalSpending);

            // Generate accordion items
            renderAccordion(spendingInsights, totalSpending);
        })
        .catch((error) => {
            console.error("Error fetching data:", error);
            // Hide spinner and show error message
            document.getElementById("loading-container").innerHTML = `
                <div class="alert alert-danger">
                    <h4>Failed to load data</h4>
                    <p>Please check your connection and try again later.</p>
                </div>
            `;
        });
});

const formatCurrency = (num) => {
    return new Intl.NumberFormat("id-ID").format(num);
};

function renderChart(spendingInsights, totalSpending) {
    // Extract data for chart
    const labels = spendingInsights.map((item) => item.category);
    const amounts = spendingInsights.map((item) => item.totalAmount);
    const percentages = spendingInsights.map((item) => item.percentage);

    // Generate random colors (or you could define a fixed set)
    const colors = spendingInsights.map(
        () =>
            `rgb(${Math.floor(Math.random() * 255)}, ${Math.floor(
                Math.random() * 255
            )}, ${Math.floor(Math.random() * 255)})`
    );

    // Plugin to display total in center
    const centerTextPlugin = {
        id: "centerText",
        beforeDraw: function (chart) {
            const width = chart.width;
            const height = chart.height;
            const ctx = chart.ctx;

            ctx.restore();
            ctx.textBaseline = "middle";
            ctx.textAlign = "center";

            // "Total" label
            const labelFontSize = (height / 300).toFixed(2) * 12;
            ctx.font = `${labelFontSize}px 'Open Sans'`;
            ctx.fillStyle = "#666";
            ctx.fillText("Total Spending", width / 2, height / 1.6 - 15);

            // Total amount text
            const fontSize = (height / 300).toFixed(2) * 16;
            ctx.font = `bold ${fontSize}px 'Open Sans'`;
            ctx.fillStyle = "#333";

            const text = "IDR " + formatCurrency(totalSpending.toFixed(2));
            //const text = 'IDR ' + "350.000.000";
            ctx.fillText(text, width / 2, height / 1.6 + 10);

            ctx.save();
        },
    };

    var ctx = document.getElementById("myDonutChart").getContext("2d");
    var myDonutChart = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: labels,
            datasets: [
                {
                    label: "Spending by Category",
                    data: amounts,
                    backgroundColor: colors,
                    hoverOffset: 4,
                },
            ],
        },
        options: {
            cutout: "70%", // Increase the hole size to fit text
            responsive: true,
            plugins: {
                legend: {
                    position: "top",
                    labels: {
                        font: {
                            family: "'Open Sans', sans-serif",
                        },
                    },
                },
                title: {
                    display: true,
                    text: "Your Expenses",
                    font: {
                        family: "'Open Sans', sans-serif",
                        size: 16,
                        weight: "bold",
                    },
                },
                tooltip: {
                    titleFont: {
                        family: "'Open Sans', sans-serif",
                    },
                    bodyFont: {
                        family: "'Open Sans', sans-serif",
                    },
                    callbacks: {
                        label: function (context) {
                            const index = context.dataIndex;
                            const percentage = (
                                (amounts[index] / totalSpending) *
                                100
                            ).toFixed(1);
                            return `${labels[index]}: $${amounts[index]} (${percentage}%)`;
                        },
                    },
                },
            },
        },
        plugins: [centerTextPlugin],
    });
}

function renderAccordion(spendingInsights, totalSpending) {
    const accordionContainer = document.getElementById("accordionExample");
    accordionContainer.innerHTML = ""; // Clear any existing content

    // Create emoji mapping
    const emojiMap = {
        Groceries: "🛒",
        Rent: "🏠",
        Utilities: "💡",
        Entertainment: "🎬",
        Dining: "🍽️",
        Transportation: "🚗",
        Shopping: "🛍️",
        Health: "⚕️",
        Education: "📚",
    };

    // Generate accordion items for each category
    spendingInsights.forEach((category, index) => {
        const emoji = emojiMap[category.category] || "💰"; // Default emoji if not found
        const headingId = `heading${index}`;
        const collapseId = `collapse${index}`;
        const percentage = (
            (category.totalAmount / totalSpending) *
            100
        ).toFixed(1);

        // Create transactions table HTML
        let transactionsHtml = `<div class="row mt-2 mb-2">
    <div class="col-md-5 col-12 box" style="font-weight: bold;">Description</div>
    <div class="col-md-3 col-12 box" style="font-weight: bold;">Date</div>
    <div class="col-md-4 col-12 box" style="font-weight: bold; text-align: right;">Amount</div>
</div>
        `;

        category.transactions.forEach((transaction) => {
            // Format the date
            const date = new Date(transaction.date);
            const formattedDate = date.toLocaleDateString();

            transactionsHtml += `
            
            <div id="content" class="row pt-2 pb-2">
    <div class="col-md-5 col-12 box" style="">${transaction.description}</div>
    <div class="col-md-3 col-12 box" style="">${formattedDate}</div>
    <div class="col-md-4 col-12 box" style="text-align: right;">IDR ${formatCurrency(
                                                                transaction.amount.toFixed(2)
                                                            )}</div>
</div>`;
        });

        transactionsHtml += `
        <div id="footer" class="row pt-2 pb-2 mb-3">
    <div class="col-md-5 col-12 box" style="font-weight: bold;">Total</div>
    <div class="col-md-3 col-12 box" style=""></div>
    <div class="col-md-4 col-12 box" style="font-weight: bold; text-align: right;">IDR ${formatCurrency(
            category.totalAmount.toFixed(2)
        )} (${percentage}%)</div>
</div>`;

        // Create accordion item
        const accordionItem = document.createElement("div");
        accordionItem.className = "accordion-item";
        accordionItem.innerHTML = `
            <h2 class="accordion-header" id="${headingId}">
                <button
                    class="accordion-button collapsed"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#${collapseId}"
                    aria-expanded="false"
                    aria-controls="${collapseId}"
                >
                <div class="d-flex align-items-center rounded">
                    <div class="me-3" style="font-size: 2rem;">
                        ${emoji}
                    </div>
                    <div>
                        <div class="fw-bold">${category.category}</div>
                        <div>IDR ${formatCurrency(category.totalAmount.toFixed(2))} (${percentage}%)</div>
                    </div>
                </div>                               
                </button>
            </h2>
            <div
                id="${collapseId}"
                class="accordion-collapse collapse"
                aria-labelledby="${headingId}"
            >
                <div class="accordion-body">
                    ${transactionsHtml}
                </div>
            </div>
        `;

        accordionContainer.appendChild(accordionItem);
    });
}

document
    .getElementById("toggleAccordionBtn")
    .addEventListener("click", function () {
        const accordionItems = document.querySelectorAll(
            ".accordion-collapse"
        );

        console.log(this.textContent.trim());
        //const allCollapsed = Array.from(accordionItems).every(
        //	(item) => !item.classList.contains("show")
        //);

        if (this.textContent.trim() == "Expand All") {
            document.querySelectorAll(".accordion-collapse").forEach((item) => {
                let bsCollapse = new bootstrap.Collapse(item, { toggle: false });
                bsCollapse.show();
            });
        } else {
            document.querySelectorAll(".accordion-collapse.show")
                .forEach((item) => {
                    let bsCollapse = new bootstrap.Collapse(item, {
                        toggle: false,
                    });
                    bsCollapse.hide();
                });
        }

        // Update button text
        if (this.textContent.trim() == "Expand All") {
            this.textContent = "Collapse All";
        } else {
            this.textContent = "Expand All";
        }
    });
