import React, { useState, useEffect } from 'react'
import { DollarSign, Plus, Trash2, Download, X, Calculator } from 'lucide-react'
import { useStore } from '../store'
import { getTranslation } from '../i18n/translations'
import './FinancialPlanner.css'

function FinancialPlanner({ trip, onClose }) {
  const language = useStore((state) => state.language || 'he')
  const [expenses, setExpenses] = useState([])
  const [newExpense, setNewExpense] = useState({
    category: 'accommodation',
    description: '',
    amount: '',
    currency: 'USD',
    date: new Date().toISOString().split('T')[0]
  })
  const [budget, setBudget] = useState('')
  const [budgetCurrency, setBudgetCurrency] = useState('USD')

  const categories = [
    { value: 'accommodation', label: getTranslation('accommodation', language) || 'Accommodation' },
    { value: 'transport', label: getTranslation('transport', language) || 'Transport' },
    { value: 'food', label: getTranslation('food', language) || 'Food' },
    { value: 'activities', label: getTranslation('activities', language) || 'Activities' },
    { value: 'shopping', label: getTranslation('shopping', language) || 'Shopping' },
    { value: 'other', label: getTranslation('other', language) || 'Other' }
  ]

  const currencies = ['USD', 'EUR', 'GBP', 'ILS', 'JPY', 'CNY', 'AUD', 'CAD']

  // Currency conversion rates (simplified - in production use real API)
  const exchangeRates = {
    USD: 1, EUR: 0.92, GBP: 0.79, ILS: 3.65, JPY: 150, CNY: 7.24, AUD: 1.52, CAD: 1.35
  }

  const convertToUSD = (amount, currency) => {
    return amount / (exchangeRates[currency] || 1)
  }

  const addExpense = () => {
    if (!newExpense.description || !newExpense.amount) return
    
    const expense = {
      id: Date.now(),
      ...newExpense,
      amount: parseFloat(newExpense.amount),
      amountUSD: convertToUSD(parseFloat(newExpense.amount), newExpense.currency)
    }
    
    setExpenses([...expenses, expense])
    setNewExpense({
      category: 'accommodation',
      description: '',
      amount: '',
      currency: 'USD',
      date: new Date().toISOString().split('T')[0]
    })
  }

  const removeExpense = (id) => {
    setExpenses(expenses.filter(e => e.id !== id))
  }

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amountUSD, 0)
  const budgetUSD = budget ? convertToUSD(parseFloat(budget), budgetCurrency) : 0
  const remaining = budgetUSD - totalExpenses

  const exportToPDF = () => {
    // Create PDF content
    const content = `
      <html>
        <head>
          <title>${getTranslation('financialPlan', language) || 'Financial Plan'}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #4a90e2; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #4a90e2; color: white; }
            .summary { background: #f0f0f0; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .positive { color: green; }
            .negative { color: red; }
          </style>
        </head>
        <body>
          <h1>${getTranslation('financialPlan', language) || 'Financial Plan'}</h1>
          ${trip ? `<h2>${trip.name || 'Trip'}</h2>` : ''}
          
          <div class="summary">
            <h3>${getTranslation('budget', language) || 'Budget'}: ${budget || '0'} ${budgetCurrency}</h3>
            <h3>${getTranslation('totalExpenses', language) || 'Total Expenses'}: $${totalExpenses.toFixed(2)}</h3>
            <h3 class="${remaining >= 0 ? 'positive' : 'negative'}">
              ${getTranslation('remaining', language) || 'Remaining'}: $${remaining.toFixed(2)}
            </h3>
          </div>

          <table>
            <thead>
              <tr>
                <th>${getTranslation('category', language) || 'Category'}</th>
                <th>${getTranslation('description', language) || 'Description'}</th>
                <th>${getTranslation('amount', language) || 'Amount'}</th>
                <th>${getTranslation('currency', language) || 'Currency'}</th>
                <th>${getTranslation('date', language) || 'Date'}</th>
              </tr>
            </thead>
            <tbody>
              ${expenses.map(e => `
                <tr>
                  <td>${categories.find(c => c.value === e.category)?.label || e.category}</td>
                  <td>${e.description}</td>
                  <td>${e.amount}</td>
                  <td>${e.currency}</td>
                  <td>${e.date}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `

    const printWindow = window.open('', '_blank')
    printWindow.document.write(content)
    printWindow.document.close()
    printWindow.focus()
    
    setTimeout(() => {
      printWindow.print()
    }, 250)
  }

  return (
    <div className="financial-planner-overlay" onClick={onClose}>
      <div className="financial-planner-panel" onClick={(e) => e.stopPropagation()}>
        <div className="financial-planner-header">
          <div className="header-title">
            <Calculator size={24} />
            <h2>{getTranslation('financialPlan', language) || 'Financial Plan'}</h2>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="financial-planner-content">
          {/* Budget Section */}
          <div className="budget-section">
            <label>{getTranslation('setBudget', language) || 'Set Budget'}</label>
            <div className="budget-inputs">
              <input
                type="number"
                placeholder="0"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
              />
              <select
                value={budgetCurrency}
                onChange={(e) => setBudgetCurrency(e.target.value)}
              >
                {currencies.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Summary */}
          <div className="financial-summary">
            <div className="summary-item">
              <span>{getTranslation('budget', language) || 'Budget'}:</span>
              <strong>{budget || '0'} {budgetCurrency}</strong>
            </div>
            <div className="summary-item">
              <span>{getTranslation('totalExpenses', language) || 'Total Expenses'}:</span>
              <strong>${totalExpenses.toFixed(2)}</strong>
            </div>
            <div className={`summary-item ${remaining >= 0 ? 'positive' : 'negative'}`}>
              <span>{getTranslation('remaining', language) || 'Remaining'}:</span>
              <strong>${remaining.toFixed(2)}</strong>
            </div>
          </div>

          {/* Add Expense */}
          <div className="add-expense-section">
            <h3>{getTranslation('addExpense', language) || 'Add Expense'}</h3>
            <div className="expense-form">
              <select
                value={newExpense.category}
                onChange={(e) => setNewExpense({...newExpense, category: e.target.value})}
              >
                {categories.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder={getTranslation('description', language) || 'Description'}
                value={newExpense.description}
                onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
              />
              <input
                type="number"
                placeholder={getTranslation('amount', language) || 'Amount'}
                value={newExpense.amount}
                onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
              />
              <select
                value={newExpense.currency}
                onChange={(e) => setNewExpense({...newExpense, currency: e.target.value})}
              >
                {currencies.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <input
                type="date"
                value={newExpense.date}
                onChange={(e) => setNewExpense({...newExpense, date: e.target.value})}
              />
              <button className="add-expense-btn" onClick={addExpense}>
                <Plus size={18} />
                {getTranslation('add', language) || 'Add'}
              </button>
            </div>
          </div>

          {/* Expenses List */}
          <div className="expenses-list">
            <h3>{getTranslation('expenses', language) || 'Expenses'}</h3>
            {expenses.length === 0 ? (
              <p className="no-expenses">{getTranslation('noExpenses', language) || 'No expenses yet'}</p>
            ) : (
              <div className="expenses-table">
                <div className="expense-header">
                  <span>{getTranslation('category', language) || 'Category'}</span>
                  <span>{getTranslation('description', language) || 'Description'}</span>
                  <span>{getTranslation('amount', language) || 'Amount'}</span>
                  <span>{getTranslation('date', language) || 'Date'}</span>
                  <span></span>
                </div>
                {expenses.map(expense => (
                  <div key={expense.id} className="expense-row">
                    <span>{categories.find(c => c.value === expense.category)?.label || expense.category}</span>
                    <span>{expense.description}</span>
                    <span>{expense.amount} {expense.currency}</span>
                    <span>{expense.date}</span>
                    <button
                      className="remove-expense-btn"
                      onClick={() => removeExpense(expense.id)}
                      aria-label={getTranslation('remove', language) || 'Remove'}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Export Button */}
          <button className="export-pdf-btn" onClick={exportToPDF}>
            <Download size={18} />
            {getTranslation('exportToPDF', language) || 'Export to PDF'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default FinancialPlanner

