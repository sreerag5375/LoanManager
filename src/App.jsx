import React, { useState } from 'react';

const LoanManager = () => {
  // Dynamic loan data
  const [loans, setLoans] = useState([
    { id: 1, name: 'One card Loan', amount: 15000 },
    { id: 2, name: 'Fed Credit card', amount: 37800 },
    { id: 2, name: 'ICICI Credit card', amount: 19000 },
    { id: 3, name: 'Mannarkkad loan', amount: 24000 },
    { id: 4, name: 'Cred Loan 1', amount: 32000 },
    { id: 5, name: 'Cred Loan 2', amount: 58000 },
    { id: 6, name: 'Education Loan', amount: 139000 },
    { id: 7, name: 'Marriage Loan', amount: 335000 }
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

  // Get gradient colors based on amount
  const getGradientColors = (amount) => {
    if (amount < 10000) return 'from-green-500 to-green-600';
    if (amount < 30000) return 'from-yellow-500 to-yellow-600';
    if (amount <= 100000) return 'from-orange-500 to-orange-600';
    return 'from-red-500 to-red-600';
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
      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Header - Centered */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{motivationalTitle}</h1>
          {/* Progress Indicator */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 bg-green-100  px-4 py-2 rounded-full border border-green-400">
              <span className="font-medium">Focus on:</span>
              <span className="font-bold">{sortedLoans[0]?.name}</span>
              <span >₹{sortedLoans[0]?.amount.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Loan Rectangle Grid Display */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          {sortedLoans.length > 0 ? (
            <div className="flex flex-col gap-4 max-w-md mx-auto">
              {sortedLoans.map((loan, index) => (
                <div key={loan.id} className="relative group">
                  <div
                    className={`bg-gradient-to-br ${getGradientColors(loan.amount)} relative flex flex-col justify-center text-white font-bold transition-all duration-200 hover:brightness-110 cursor-pointer rounded-lg border-2 ${getLoanColor(loan.amount).split(' ')[1]} p-6 h-32 shadow-lg hover:shadow-xl transform hover:scale-105`}
                  >
                    {/* Priority Badge for smallest loan */}
                    {index === 0 && (
                      <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                        Priority
                      </div>
                    )}

                    {/* Edit/Delete Buttons */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1 z-10">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          editLoan(loan);
                        }}
                        className="bg-black/40 hover:bg-black/60 text-white rounded-full w-6 h-6 flex items-center justify-center transition-colors"
                        title="Edit loan"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          confirmDelete(loan);
                        }}
                        className="bg-black/40 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center transition-colors"
                        title="Delete loan"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>

                    {/* Content */}
                    <div className="text-center">
                      <div className="text-sm font-semibold mb-2 leading-tight drop-shadow">
                        {loan.name}
                      </div>
                      <div className="text-xl font-bold drop-shadow">
                        ₹{loan.amount.toLocaleString('en-IN')}
                      </div>
                    </div>

                    {/* Rank indicator */}
                    <div className="absolute bottom-2 left-2 bg-black/30 text-white text-xs px-2 py-1 rounded-full">
                      #{index + 1}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📋</div>
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
            <div className="p-6">
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
                    onKeyPress={(e) => e.key === 'Enter' && saveLoan(e)}
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
                    onKeyPress={(e) => e.key === 'Enter' && saveLoan(e)}
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={saveLoan}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  {isEditMode ? 'Update Loan' : 'Save Loan'}
                </button>
                <button
                  onClick={closeModal}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
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