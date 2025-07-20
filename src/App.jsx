import React, { useState } from 'react';

const LoanManager = () => {
  // Dynamic loan data
  const [loans, setLoans] = useState([
    { id: 1, name: 'One Credit Card', amount: 235.41 },
    { id: 2, name: 'ICICI Loan', amount: 12824 },
    { id: 3, name: 'ICICI Credit card', amount: 16880.93 },
    { id: 4, name: 'One card Loan', amount: 21068 },
    { id: 5, name: 'Mannarkkad loan', amount: 28600 },
    { id: 6, name: 'Cred Loan 1', amount: 42218 },
    { id: 7, name: 'Cred Loan 2', amount: 63893 },
    { id: 8, name: 'Education Loan', amount: 139000 },
    { id: 9, name: 'Marriage Loan', amount: 344500 }
  ]);

  // Form state
  const [loanName, setLoanName] = useState('');
  const [loanAmount, setLoanAmount] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingLoan, setEditingLoan] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingLoan, setDeletingLoan] = useState(null);

  // Calculate statistics
  const sortedLoans = [...loans].sort((a, b) => a.amount - b.amount);
  const totalAmount = loans.reduce((sum, loan) => sum + loan.amount, 0);
  const totalLoans = loans.length;
  const smallLoans = loans.filter(loan => loan.amount < 10000).length;
  const mediumLoans = loans.filter(loan => loan.amount >= 10000 && loan.amount < 30000).length;
  const largeLoans = loans.filter(loan => loan.amount >= 30000 && loan.amount <= 100000).length;
  const highLoans = loans.filter(loan => loan.amount > 100000).length;

  const [motivationalTitle] = useState("Debt Freedom Journey");

  // Get loan color based on amount
  const getLoanColor = (amount) => {
    if (amount < 10000) return 'bg-green-500 border-green-600';
    if (amount < 30000) return 'bg-yellow-500 border-yellow-600';
    if (amount <= 100000) return 'bg-orange-500 border-orange-600';
    return 'bg-red-500 border-red-600';
  };

  // Get text color for contrast
  const getTextColor = () => {
    return 'text-white'; // All colors use white text for consistency
  };

  // Add/Edit loan function
  const saveLoan = (e) => {
    e.preventDefault();
    
    if (!loanName.trim() || !loanAmount || parseFloat(loanAmount) <= 0) {
      alert('Please enter valid loan name and amount');
      return;
    }

    if (isEditMode && editingLoan) {
      // Update existing loan
      setLoans(loans.map(loan => 
        loan.id === editingLoan.id 
          ? { ...loan, name: loanName.trim(), amount: parseFloat(loanAmount) }
          : loan
      ));
    } else {
      // Add new loan
      const newLoan = {
        id: Date.now(),
        name: loanName.trim(),
        amount: parseFloat(loanAmount)
      };
      setLoans([...loans, newLoan]);
    }

    closeModal();
  };

  // Open edit modal
  const editLoan = (loan) => {
    setEditingLoan(loan);
    setLoanName(loan.name);
    setLoanAmount(loan.amount.toString());
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  // Delete loan function
  const deleteLoan = (loanId) => {
    setLoans(loans.filter(loan => loan.id !== loanId));
    setShowDeleteConfirm(false);
    setDeletingLoan(null);
  };

  // Confirm delete
  const confirmDelete = (loan) => {
    setDeletingLoan(loan);
    setShowDeleteConfirm(true);
  };

  // Close modal and reset
  const closeModal = () => {
    setLoanName('');
    setLoanAmount('');
    setIsModalOpen(false);
    setIsEditMode(false);
    setEditingLoan(null);
  };

  // Close delete confirmation
  const closeDeleteConfirm = () => {
    setShowDeleteConfirm(false);
    setDeletingLoan(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Container - Centered */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        
        {/* Header - Centered */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{motivationalTitle}</h1>
          <p className="text-gray-600">Track your progress towards financial freedom</p>
        </div>

        {/* Loan Pyramid Display */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Debt Snowball Strategy</h2>
            <p className="text-gray-500 text-sm">Pay off smallest loans first for quick wins and momentum</p>
          </div>
          
          {sortedLoans.length > 0 ? (
            <div className="space-y-4">
              {/* Progress Indicator */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full border border-blue-200">
                  <span className="font-medium">Next Target:</span>
                  <span className="font-bold">{sortedLoans[0]?.name}</span>
                  <span className="text-blue-600">₹{sortedLoans[0]?.amount.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Pyramid Layout */}
              <div className="flex flex-col items-center space-y-3">
                {sortedLoans.map((loan, index) => {
                  // Calculate width based on loan amount for true pyramid shape
                  const maxAmount = Math.max(...sortedLoans.map(l => l.amount));
                  const minAmount = Math.min(...sortedLoans.map(l => l.amount));
                  const amountRange = maxAmount - minAmount;
                  
                  // Calculate proportional width (smallest: 200px, largest: 500px)
                  const minWidth = 200;
                  const maxWidth = 500;
                  const widthRange = maxWidth - minWidth;
                  
                  let calculatedWidth;
                  if (amountRange === 0) {
                    calculatedWidth = minWidth; // All loans same amount
                  } else {
                    const ratio = (loan.amount - minAmount) / amountRange;
                    calculatedWidth = minWidth + (ratio * widthRange);
                  }

                  return (
                    <div
                      key={loan.id}
                      className={`${getLoanColor(loan.amount)} ${getTextColor()} 
                                 rounded-lg border-2 shadow-md hover:shadow-lg transition-all duration-200 
                                 transform hover:scale-105 p-4 relative group`}
                      style={{ 
                        width: `${calculatedWidth}px`,
                        minWidth: '200px'
                      }}
                    >
                      {/* Priority Badge */}
                      {index === 0 && (
                        <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full border-2 border-white shadow-sm">
                          PRIORITY
                        </div>
                      )}

                      {/* Edit/Delete Buttons - Show on Hover */}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            editLoan(loan);
                          }}
                          className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-full w-8 h-8 flex items-center justify-center transition-colors"
                          title="Edit loan"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            confirmDelete(loan);
                          }}
                          className="bg-white/20 hover:bg-red-500 backdrop-blur-sm text-white rounded-full w-8 h-8 flex items-center justify-center transition-colors"
                          title="Delete loan"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                      
                      <div className="text-center">
                        <div className="font-semibold text-lg mb-1">{loan.name}</div>
                        <div className="text-2xl font-bold mb-1">₹{loan.amount.toLocaleString('en-IN')}</div>
                        <div className="text-xs opacity-90">
                          {index === 0 ? '🎯 Focus Here First!' : 
                           index === 1 ? '📋 Next Up' : 
                           `Position #${index + 1}`}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Strategy Tip */}
              <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="text-blue-500 text-lg">💡</div>
                  <div>
                    <h4 className="font-medium text-blue-900 mb-1">Debt Snowball Tip</h4>
                    <p className="text-blue-700 text-sm">
                      Focus all extra payments on <strong>{sortedLoans[0]?.name}</strong> while making minimum payments on others. 
                      Quick wins build momentum!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔺</div>
              <p className="text-gray-500 text-lg font-medium">No loans added yet</p>
              <p className="text-gray-400 text-sm mt-2">Click the + button to add your first loan</p>
            </div>
          )}
        </div>

        {/* Summary Cards - Centered */}
        <div className="flex justify-center gap-6 mb-8 flex-wrap">
          {/* Total Due */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 min-w-[200px]">
            <div className="flex items-center gap-3">
              <div className="text-2xl">💰</div>
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Due</p>
                <p className="text-2xl font-bold text-gray-900">₹{totalAmount.toLocaleString('en-IN')}</p>
              </div>
            </div>
          </div>

          {/* Total Loans */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 min-w-[200px]">
            <div className="flex items-center gap-3">
              <div className="text-2xl">📋</div>
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Loans</p>
                <p className="text-2xl font-bold text-gray-900">{totalLoans}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Category Indicators - Centered */}
        <div className="flex justify-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm border border-gray-200">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-sm font-medium text-gray-700">Small ({smallLoans})</span>
          </div>
          <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm border border-gray-200">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span className="text-sm font-medium text-gray-700">Medium ({mediumLoans})</span>
          </div>
          <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm border border-gray-200">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span className="text-sm font-medium text-gray-700">Large ({largeLoans})</span>
          </div>
          <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm border border-gray-200">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-sm font-medium text-gray-700">High ({highLoans})</span>
          </div>
        </div>
      </div>

      {/* Sticky Add Button - Bottom Right */}
      <button
        onClick={() => {
          setIsEditMode(false);
          setIsModalOpen(true);
        }}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">
                {isEditMode ? 'Edit Loan' : 'Add New Loan'}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={saveLoan} className="p-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="loanName" className="block text-sm font-medium text-gray-700 mb-2">
                    Loan Name
                  </label>
                  <input
                    id="loanName"
                    type="text"
                    placeholder="e.g., Credit Card, Personal Loan"
                    value={loanName}
                    onChange={(e) => setLoanName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    maxLength={50}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="loanAmount" className="block text-sm font-medium text-gray-700 mb-2">
                    Amount (₹)
                  </label>
                  <input
                    id="loanAmount"
                    type="number"
                    placeholder="0.00"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  {isEditMode ? 'Update Loan' : 'Save Loan'}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && deletingLoan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Delete Loan</h3>
                  <p className="text-gray-600 text-sm">This action cannot be undone</p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Are you sure you want to delete <strong>"{deletingLoan.name}"</strong> with amount ₹{deletingLoan.amount.toLocaleString('en-IN')}?
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => deleteLoan(deletingLoan.id)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  Yes, Delete
                </button>
                <button
                  onClick={closeDeleteConfirm}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoanManager;