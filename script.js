let productCount = 0;

const products = [
  {
    name: "Magnetic Surface Light",
    description: "High-quality magnetic surface track light, 10W.",
    rate: 350,
    image: "images/2.png"
  },
  {
    name: "Spotlight",
    description: "Adjustable LED spotlight with aluminum body. Ideal for focused lighting.",
    rate: 270,
    image: "images/2.png"
  },
  {
    name: "Linear Light",
    description: "Slim linear profile light for ambient lighting and clean aesthetics.",
    rate: 400,
    image: "images/linear-light.jpg"
  }
];

function addProduct() {
  productCount++;
  const table = document.querySelector("#productTable tbody");
  const row = document.createElement("tr");

  row.innerHTML = `
    <td>${productCount}</td>
    <td class="image-cell"></td>
    <td><textarea class="description-field"></textarea></td>
    <td><input type="number" value="1" min="1" onchange="calculateTotal()"></td>
    <td><input type="number" value="0" onchange="calculateTotal()"></td>
    <td><input type="number" value="0" min="0" max="100" onchange="calculateTotal()"></td>
    <td class="amount">0.00</td>
    <td class="no-print"><button onclick="removeProduct(this)">Remove</button></td>
  `;

  // In addProduct():
const descField = row.querySelector(".description-field");

// ✅ Auto-resize height on input
descField.addEventListener("input", function () {
  this.style.height = "auto";                  // Reset height
  this.style.height = this.scrollHeight + "px"; // Expand based on content
});


  const select = document.createElement("select");
  select.classList.add("product-select");

  select.innerHTML =
    `<option value="">Select Product</option>` +
    products.map((p, i) => `<option value="${i}">${p.name}</option>`).join("");

  // ✅ When a product is selected, autofill description and rate
  select.onchange = function () {
    const selected = products[this.value];
    if (!selected) return;

    // Show image
    row.querySelector(".image-cell").innerHTML = `<img src="${selected.image}" alt="Product">`;

    // Autofill description and resize
    descField.value = selected.description;
    descField.style.height = "auto";
    descField.style.height = descField.scrollHeight + "px";

    // Autofill rate
    row.cells[4].querySelector("input").value = selected.rate;

    calculateTotal();
  };

  row.querySelector(".image-cell").appendChild(select);
  table.appendChild(row);

  $(select).select2({
    placeholder: "Select Product",
    width: "160px"
  });

  calculateTotal();
}

function removeProduct(button) {
  const row = button.closest("tr");
  row.remove();
  updateSrNo();
  calculateTotal();
}

function updateSrNo() {
  const rows = document.querySelectorAll("#productTable tbody tr");
  rows.forEach((row, index) => {
    row.cells[0].textContent = index + 1;
  });
  productCount = rows.length;
}

function calculateTotal() {
  let total = 0;
  const rows = document.querySelectorAll("#productTable tbody tr");

  rows.forEach(row => {
    const qty = parseFloat(row.cells[3].querySelector("input").value) || 0;
    const rate = parseFloat(row.cells[4].querySelector("input").value) || 0;
    const discount = parseFloat(row.cells[5].querySelector("input").value) || 0;
    const amount = qty * rate * (1 - discount / 100);
    row.cells[6].textContent = amount.toFixed(2);
    total += amount;
  });

  document.getElementById("totalAmount").textContent = total.toFixed(2);
}


// helper to auto-resize textarea
function autoResize() {
  this.style.height = 'auto';
  this.style.height = this.scrollHeight + 'px';
}

// helper to create a textarea matching your original setup
function createDescriptionTextarea(value = '') {
  const textarea = document.createElement('textarea');
  textarea.className = 'description-field';
  textarea.value = value;
  textarea.style.width = '100%';
  textarea.style.minHeight = '30px';
  textarea.style.border = 'none';
  textarea.style.resize = 'none';
  textarea.style.overflow = 'hidden';
  textarea.style.fontSize = '13px';
  textarea.style.fontFamily = 'inherit';
  textarea.style.background = 'transparent';
  textarea.style.textAlign = 'left';
  textarea.addEventListener('input', autoResize);

  // set initial height to fit content
  requestAnimationFrame(() => {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  });

  return textarea;
}

// replace old printQuotation() with this
function printQuotation() {
  // 1) collect current textareas and their values
  const textareas = Array.from(document.querySelectorAll('.description-field'));
  if (textareas.length === 0) {
    // nothing to replace — just print
    window.print();
    return;
  }

  const originalValues = textareas.map(t => t.value);
  const replacedDivs = [];

  // 2) replace each textarea with a div that expands naturally when printing
  textareas.forEach((ta, i) => {
    const div = document.createElement('div');
    div.className = 'print-description';
    div.style.whiteSpace = 'pre-wrap';
    div.style.fontSize = '13px';
    div.style.padding = '4px 0';
    div.textContent = originalValues[i];

    ta.parentNode.replaceChild(div, ta);
    replacedDivs.push(div);
  });

  // 3) give browser a moment to reflow, then print
  setTimeout(() => {
    window.print();

    // 4) restore the original textareas after printing
    replacedDivs.forEach((div, idx) => {
      const ta = createDescriptionTextarea(originalValues[idx]);
      div.parentNode.replaceChild(ta, div);
    });

    // recalc totals/heights just in case
    calculateTotal();
  }, 150); // 150ms should be enough for DOM updates; increase if needed
}

function saveQuotation() {
  const partyName = document.getElementById("partyName").value;
  const address = document.getElementById("address").value;
  const phoneNo = document.getElementById("phoneNo").value;
  const date = document.getElementById("date").value;

  const rows = document.querySelectorAll("#productTable tbody tr");
  const products = [];

  rows.forEach(row => {
    const select = row.querySelector("select.product-select");
    const productName = select ? select.options[select.selectedIndex].text : "";

    let description = "";
    const descInput = row.cells[2].querySelector("textarea");
    if (descInput) {
      description = descInput.value.trim();
    } else {
      description = row.cells[2].textContent.trim();
    }

    const qty = row.cells[3].querySelector("input")?.value || "0";
    const rate = row.cells[4].querySelector("input")?.value || "0";
    const discount = row.cells[5].querySelector("input")?.value || "0";
    const amount = row.cells[6]?.textContent || "0.00";

    products.push({
      productName,
      description,
      qty,
      rate,
      discount,
      amount
    });
  });

  const quotationData = {
    partyName,
    address,
    phoneNo,
    date,
    products,
    totalAmount: document.getElementById("totalAmount").textContent
  };

  const jsonData = JSON.stringify(quotationData, null, 2);
  const blob = new Blob([jsonData], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `Quotation_${partyName}_${date}.json`;
  a.click();

  URL.revokeObjectURL(url);
  alert("Quotation saved successfully!");
}

function savepdf() {
  const element = document.querySelector('.quotation-container');
  document.body.classList.add('pdf-mode');

  // ✅ Temporarily replace textareas with divs for PDF
  const originalTextareas = [];
  const textareas = document.querySelectorAll('.description-field');

  textareas.forEach(textarea => {
    originalTextareas.push(textarea.value); // Save text
    const div = document.createElement('div');
    div.style.textAlign = 'left';
    div.style.whiteSpace = 'pre-wrap';
    div.style.fontSize = '13px';
    div.style.padding = '4px';
    div.textContent = textarea.value;
    textarea.replaceWith(div);
  });

  const opt = {
    margin: 0.3,
    filename: `Quotation_${document.getElementById("partyName").value || "Customer"}_${document.getElementById("date").value || "Date"}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
  };

  html2pdf().set(opt).from(element).outputPdf('bloburl').then((pdfUrl) => {
    // ✅ Restore textareas after PDF generation
    const divs = document.querySelectorAll('.quotation-container td div');
    divs.forEach((div, index) => {
      const textarea = document.createElement('textarea');
      textarea.className = 'description-field';
      textarea.value = originalTextareas[index];

      // ✅ Style to match original
      textarea.style.width = '100%';
      textarea.style.minHeight = '30px';
      textarea.style.border = 'none';
      textarea.style.resize = 'none';
      textarea.style.overflow = 'hidden';
      textarea.style.fontSize = '13px';
      textarea.style.fontFamily = 'inherit';
      textarea.style.background = 'transparent';
      textarea.style.textAlign = 'left';

      // ✅ Add input event for auto-resize
      textarea.addEventListener('input', function () {
        this.style.height = 'auto';
        this.style.height = this.scrollHeight + 'px';
      });

      div.replaceWith(textarea);

      // ✅ Force correct height after DOM update
      requestAnimationFrame(() => {
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
      });
    });

    document.body.classList.remove('pdf-mode');

    // ✅ Download PDF instead of opening in new tab
    const a = document.createElement('a');
    a.href = pdfUrl;
    a.download = `Quotation_${document.getElementById("partyName").value || "Customer"}_${document.getElementById("date").value || "Date"}.pdf`;
    a.click();

    // ✅ Show success message
    alert('PDF saved successfully!');
  });
}







