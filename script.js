// script.js
// Package data
const packages = [
    { coins: 70, price: 0.91 },
    { coins: 350, price: 4.55 },
    { coins: 700, price: 9.10 },
    { coins: 1400, price: 18.26 },
    { coins: 3500, price: 45.50 },
    { coins: 7000, price: 91.00 },
    { coins: 17500, price: 227.50 }
];

// Sample transaction history
const transactions = [
    { id: 1, date: "2025-09-20", coins: 7000, amount: 91.00, method: "VISA" },
    { id: 2, date: "2025-09-18", coins: 3500, amount: 45.50, method: "MasterCard" },
    { id: 3, date: "2025-09-15", coins: 700, amount: 9.10, method: "PayPal" },
    { id: 4, date: "2025-09-10", coins: 350, amount: 4.55, method: "American Express" }
];

// DOM elements
const packagesGrid = document.getElementById('packagesGrid');
const usernameInput = document.getElementById('username');
const rechargeBtn = document.getElementById('rechargeBtn');
const themeToggle = document.getElementById('themeToggle');
const processingScreen = document.getElementById('processingScreen');
const successScreen = document.getElementById('successScreen');
const timerElement = document.getElementById('timer');
const backBtn = document.getElementById('backBtn');
const successMessage = document.getElementById('successMessage');
const viewTransactionsBtn = document.getElementById('viewTransactions');
const transactionsModal = document.getElementById('transactionsModal');
const closeTransactionsBtn = document.getElementById('closeTransactions');
const showReceiptBtn = document.getElementById('showReceiptBtn');
const receiptModal = document.getElementById('receiptModal');
const closeReceiptBtn = document.getElementById('closeReceipt');
const downloadReceiptBtn = document.getElementById('downloadReceipt');
const receiptContent = document.getElementById('receiptContent');
const transactionsList = document.getElementById('transactionsList');

// State
let selectedPackage = null;
let selectedCustom = false;
let currentTransaction = null;
let timerInterval;
let timerValue = 300; // 5 minutes in seconds

// Initialize packages
function renderPackages() {
    packagesGrid.innerHTML = '';
    
    // Add standard packages
    packages.forEach(pkg => {
        const packageCard = document.createElement('div');
        packageCard.className = 'package-card';
        packageCard.innerHTML = `
            <div class="coin-container">
                <div class="coin">
                    <div class="coin-outer">
                        <div class="coin-inner"></div>
                    </div>
                </div>
                <span class="package-amount">${pkg.coins}</span>
            </div>
            <div class="package-price">$${pkg.price.toFixed(2)}</div>
        `;
        
        packageCard.addEventListener('click', () => {
            // Deselect all packages
            document.querySelectorAll('.package-card, .custom-package-card').forEach(card => {
                card.classList.remove('selected');
            });
            
            // Select this package
            packageCard.classList.add('selected');
            selectedPackage = pkg;
            selectedCustom = false;
            
            // Update recharge button state
            updateRechargeButton();
        });
        
        packagesGrid.appendChild(packageCard);
    });
    
    // Add custom package
    const customPackageCard = document.createElement('div');
    customPackageCard.className = 'custom-package-card';
    customPackageCard.innerHTML = `
        <div class="coin-container">
            <div class="coin">
                <div class="coin-outer">
                    <div class="coin-inner"></div>
                </div>
            </div>
            <span class="package-amount">Custom</span>
        </div>
        <input type="number" class="custom-package-input" id="customCoinsInput" min="1" value="" placeholder="Enter coins amount">
        <div class="custom-package-price" id="customPackagePrice">$0.00</div>
    `;
    
    customPackageCard.addEventListener('click', () => {
        // Deselect all packages
        document.querySelectorAll('.package-card, .custom-package-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        // Select custom package
        customPackageCard.classList.add('selected');
        selectedPackage = null;
        selectedCustom = true;
        
        // Focus on input and update price
        const customCoinsInput = document.getElementById('customCoinsInput');
        customCoinsInput.focus();
        
        // Update recharge button state
        updateRechargeButton();
    });
    
    packagesGrid.appendChild(customPackageCard);
    
    // Add event listener for custom input
    const customCoinsInput = document.getElementById('customCoinsInput');
    const customPackagePrice = document.getElementById('customPackagePrice');
    
    // Update price when input changes
    function updateCustomPrice() {
        const coins = parseInt(customCoinsInput.value) || 0;
        if (coins > 0) {
            const basePricePer70 = 0.91; // Base price for 70 coins
            const totalPrice = (coins / 70) * basePricePer70;
            customPackagePrice.textContent = `$${totalPrice.toFixed(2)}`;
        } else {
            customPackagePrice.textContent = `$0.00`;
        }
    }
    
    customCoinsInput.addEventListener('input', updateCustomPrice);
    customCoinsInput.addEventListener('change', updateCustomPrice);
}

// Render transaction history
function renderTransactions() {
    transactionsList.innerHTML = '';
    
    transactions.forEach(transaction => {
        const transactionItem = document.createElement('div');
        transactionItem.className = 'transaction-item';
        transactionItem.innerHTML = `
            <div>
                <div class="transaction-date">${transaction.date}</div>
                <div>${transaction.method}</div>
            </div>
            <div>
                <div class="transaction-coins">${transaction.coins.toLocaleString()} Coins</div>
                <div class="transaction-amount">$${transaction.amount.toFixed(2)}</div>
            </div>
        `;
        
        transactionsList.appendChild(transactionItem);
    });
}

// Generate receipt content
function generateReceipt() {
    const username = usernameInput.value.trim() || "Anonymous User";
    let coins, amount;
    
    if (selectedCustom) {
        const customCoinsInput = document.getElementById('customCoinsInput');
        coins = parseInt(customCoinsInput.value) || 0;
        if (coins > 0) {
            const basePricePer70 = 0.91;
            amount = ((coins / 70) * basePricePer70).toFixed(2);
        } else {
            coins = 70;
            amount = "0.91";
        }
    } else if (selectedPackage) {
        coins = selectedPackage.coins;
        amount = selectedPackage.price.toFixed(2);
    } else {
        coins = 70;
        amount = "0.91";
    }
    
    // Store current transaction for download
    currentTransaction = {
        username,
        coins,
        amount,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString(),
        id: "TXN" + Date.now().toString().slice(-8)
    };
    
    receiptContent.innerHTML = `
        <div class="receipt-row">
            <span class="receipt-label">Transaction ID:</span>
            <span class="receipt-value">${currentTransaction.id}</span>
        </div>
        <div class="receipt-row">
            <span class="receipt-label">Date:</span>
            <span class="receipt-value">${currentTransaction.date}</span>
        </div>
        <div class="receipt-row">
            <span class="receipt-label">Time:</span>
            <span class="receipt-value">${currentTransaction.time}</span>
        </div>
        <div class="receipt-row">
            <span class="receipt-label">Username:</span>
            <span class="receipt-value">${currentTransaction.username}</span>
        </div>
        <div class="receipt-row">
            <span class="receipt-label">Coins Purchased:</span>
            <span class="receipt-value">${currentTransaction.coins.toLocaleString()}</span>
        </div>
        <div class="receipt-row">
            <span class="receipt-label">Amount:</span>
            <span class="receipt-value">$${currentTransaction.amount}</span>
        </div>
        <div class="receipt-row receipt-total">
            <span class="receipt-label">Total:</span>
            <span class="receipt-value">$${currentTransaction.amount}</span>
        </div>
    `;
}

// Download receipt as text file
function downloadReceipt() {
    if (!currentTransaction) return;
    
    const receiptText = `
TikTok Coin Recharge Receipt
===========================

Transaction ID: ${currentTransaction.id}
Date: ${currentTransaction.date}
Time: ${currentTransaction.time}
Username: ${currentTransaction.username}

Coins Purchased: ${currentTransaction.coins.toLocaleString()}
Amount: $${currentTransaction.amount}

Total: $${currentTransaction.amount}

Thank you for your purchase!
    `.trim();
    
    const blob = new Blob([receiptText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tiktok_receipt_${currentTransaction.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Update recharge button state
function updateRechargeButton() {
    const username = usernameInput.value.trim();
    const hasSelection = selectedPackage !== null || selectedCustom;
    const isValidCustom = selectedCustom ? (parseInt(document.getElementById('customCoinsInput').value) > 0) : true;
    rechargeBtn.disabled = !(username && hasSelection && isValidCustom);
}

// Initialize timer display
function updateTimerDisplay() {
    const minutes = Math.floor(timerValue / 60);
    const seconds = timerValue % 60;
    timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Start processing
function startProcessing() {
    processingScreen.style.display = 'flex';
    timerValue = 300;
    updateTimerDisplay();
    
    timerInterval = setInterval(() => {
        timerValue--;
        updateTimerDisplay();
        
        if (timerValue <= 0) {
            clearInterval(timerInterval);
            showSuccess();
        }
    }, 1000);
    
    // Simulate processing completion after 3 seconds
    setTimeout(showSuccess, 3000);
}

// Show success screen
function showSuccess() {
    clearInterval(timerInterval);
    processingScreen.style.display = 'none';
    
    // Set success message based on selection
    let coins;
    if (selectedCustom) {
        const customCoinsInput = document.getElementById('customCoinsInput');
        coins = parseInt(customCoinsInput.value) || 70;
    } else if (selectedPackage) {
        coins = selectedPackage.coins;
    } else {
        coins = 70; // Default value if no package is selected
    }
    
    successMessage.textContent = `You recharged ${coins * 100000000} Coins. You can use them to send virtual Gifts.`;
    successScreen.style.display = 'flex';
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    renderPackages();
    renderTransactions();
    updateRechargeButton();
    
    // Username input
    usernameInput.addEventListener('input', updateRechargeButton);
    
    // Recharge button
    rechargeBtn.addEventListener('click', startProcessing);
    
    // Back button
    backBtn.addEventListener('click', () => {
        successScreen.style.display = 'none';
        selectedPackage = null;
        selectedCustom = false;
        document.querySelectorAll('.package-card, .custom-package-card').forEach(card => {
            card.classList.remove('selected');
        });
    });
    
    // View transactions button
    viewTransactionsBtn.addEventListener('click', () => {
        transactionsModal.style.display = 'block';
    });
    
    // Close transactions modal
    closeTransactionsBtn.addEventListener('click', () => {
        transactionsModal.style.display = 'none';
    });
    
    // Show receipt button
    showReceiptBtn.addEventListener('click', () => {
        generateReceipt();
        successScreen.style.display = 'none';
        receiptModal.style.display = 'block';
    });
    
    // Close receipt modal
    closeReceiptBtn.addEventListener('click', () => {
        receiptModal.style.display = 'none';
        successScreen.style.display = 'flex';
    });
    
    // Download receipt
    downloadReceiptBtn.addEventListener('click', downloadReceipt);
    
    // Theme toggle
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        themeToggle.textContent = document.body.classList.contains('dark-theme') ? '☀️' : '🌙';
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', (event) => {
        if (event.target === transactionsModal) {
            transactionsModal.style.display = 'none';
        }
        if (event.target === receiptModal) {
            receiptModal.style.display = 'none';
            successScreen.style.display = 'flex';
        }
    });
});
